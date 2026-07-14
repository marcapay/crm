import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'debug-log-middleware',
      configureServer(server) {
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
})
