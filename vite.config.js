import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'debug-log-middleware',
      configureServer(server) {
        // Vercel serverless functions local dev runner
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/') && req.url !== '/api/debug-log') {
            try {
              const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
              const apiPath = parsedUrl.pathname;
              const handlerFilePath = path.join(__dirname, `${apiPath}.js`);
              
              if (fs.existsSync(handlerFilePath)) {
                // Read body safely
                let bodyStr = '';
                const hasBody = req.method !== 'GET' && req.method !== 'HEAD' && req.headers['content-length'] !== '0';
                if (hasBody) {
                  await new Promise(resolve => {
                    const timeout = setTimeout(resolve, 500); // 500ms safety timeout
                    req.on('data', chunk => { bodyStr += chunk; });
                    req.on('end', () => {
                      clearTimeout(timeout);
                      resolve();
                    });
                  });
                }
                
                const reqMock = req;
                reqMock.query = Object.fromEntries(parsedUrl.searchParams.entries());
                if (bodyStr) {
                  try {
                    reqMock.body = JSON.parse(bodyStr);
                  } catch {
                    reqMock.body = bodyStr;
                  }
                } else {
                  reqMock.body = {};
                }
                
                const resMock = res;
                resMock.status = (statusCode) => {
                  resMock.statusCode = statusCode;
                  return resMock;
                };
                resMock.json = (data) => {
                  resMock.setHeader('Content-Type', 'application/json');
                  resMock.end(JSON.stringify(data));
                  return resMock;
                };
                resMock.send = (data) => {
                  resMock.end(data);
                  return resMock;
                };
                
                // Dynamically import handler using pathToFileURL on Windows
                const { default: handler } = await import(pathToFileURL(handlerFilePath).href + `?t=${Date.now()}`);
                await handler(reqMock, resMock);
                return;
              }
            } catch (err) {
              console.error(`Error running local API route:`, err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
          next();
        });

        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/debug-log' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const logData = JSON.parse(body);
                const logMessage = `[${new Date().toISOString()}] ${logData.level || 'INFO'}: ${logData.message}\n`;
                console.log(`[BROWSER_LOG] ${logMessage.trim()}`);
                fs.appendFileSync(path.join(__dirname, 'browser_debug.log'), logMessage);
              } catch (e) {
                console.error("Error writing debug log:", e);
              }
              res.statusCode = 200;
              res.end('OK');
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    host: true,
    port: 5173,
  }
})
