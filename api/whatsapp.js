process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const EVO_BASE_URL = process.env.VITE_EVO_BASE_URL || "https://api.marcasolucoes.com";
const EVO_API_KEY = process.env.EVO_API_KEY || "b49c63d8c361f2a13a28e56c3c3c19f9";
const EVO_TENANT = process.env.EVO_TENANT || "ff3694a5-c576-4309-8805-3bb7a61d15c7";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    if (action === 'status') {
      const { instance } = req.query;
      if (!instance) {
        return res.status(400).json({ error: 'Instance name is required' });
      }
      
      const checkRes = await fetch(`${EVO_BASE_URL}/instance/connectionState/${encodeURIComponent(instance)}`, {
        headers: {
          "apikey": EVO_API_KEY,
          "tenant": EVO_TENANT
        }
      });
      
      const statusText = await checkRes.text();
      let data = {};
      try { data = JSON.parse(statusText); } catch {}
      
      return res.status(checkRes.status).json(data);
    }
    
    if (action === 'connect') {
      const { instanceName } = req.body;
      if (!instanceName) {
        return res.status(400).json({ error: 'instanceName is required' });
      }
      
      // 1. Try to connect
      let connRes = await fetch(`${EVO_BASE_URL}/instance/connect/${encodeURIComponent(instanceName)}`, {
        headers: {
          "apikey": EVO_API_KEY,
          "tenant": EVO_TENANT
        }
      });
      
      if (connRes.status === 404) {
        // 2. Create instance if not found
        const createRes = await fetch(`${EVO_BASE_URL}/instance/create`, {
          method: "POST",
          headers: {
            "apikey": EVO_API_KEY,
            "tenant": EVO_TENANT,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            instanceName: instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
          })
        });
        
        const createData = await createRes.json().catch(() => ({}));
        if (createRes.ok) {
          // If created, return connection QR code info
          return res.status(200).json(createData);
        } else {
          return res.status(createRes.status).json(createData);
        }
      }
      
      const connData = await connRes.json().catch(() => ({}));
      return res.status(connRes.status).json(connData);
    }

    if (action === 'logout') {
      const { instanceName } = req.body;
      if (!instanceName) {
        return res.status(400).json({ error: 'instanceName is required' });
      }
      const logoutRes = await fetch(`${EVO_BASE_URL}/instance/logout/${encodeURIComponent(instanceName)}`, {
        method: "POST",
        headers: {
          "apikey": EVO_API_KEY,
          "tenant": EVO_TENANT
        }
      });
      const data = await logoutRes.json().catch(() => ({}));
      return res.status(logoutRes.status).json(data);
    }

    if (action === 'delete') {
      const { instanceName } = req.body;
      if (!instanceName) {
        return res.status(400).json({ error: 'instanceName is required' });
      }
      const deleteRes = await fetch(`${EVO_BASE_URL}/instance/delete/${encodeURIComponent(instanceName)}`, {
        method: "DELETE",
        headers: {
          "apikey": EVO_API_KEY,
          "tenant": EVO_TENANT
        }
      });
      const data = await deleteRes.json().catch(() => ({}));
      return res.status(deleteRes.status).json(data);
    }

    // Generic proxy for other calls (sending messages, fetching messages, etc.)
    if (action === 'proxy') {
      const { path, method = 'GET', body } = req.body;
      if (!path) {
        return res.status(400).json({ error: 'Path is required' });
      }
      
      const options = {
        method,
        headers: {
          "apikey": EVO_API_KEY,
          "tenant": EVO_TENANT,
          "Content-Type": "application/json"
        }
      };
      
      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = JSON.stringify(body);
      }
      
      const targetRes = await fetch(`${EVO_BASE_URL}${path}`, options);
      const data = await targetRes.json().catch(() => ({}));
      return res.status(targetRes.status).json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error("WhatsApp proxy error:", err);
    return res.status(500).json({ error: err.message || 'Internal proxy error' });
  }
}
