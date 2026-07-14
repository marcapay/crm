// Serverless endpoint to manage system users globally across all devices
const BUCKET_ID = process.env.KV_BUCKET_ID || "7jm21b72";

const defaultUsers = [
  { id: 'default_u2', name: 'Miguel Suporte', email: 'mqssolucao@gmail.com', role: 'Administrador', status: 'Ativo', password: 'admin' },
  { id: 'default_u3', name: 'Alexandre', email: 'atg.contador@gmail.com', role: 'Administrador', status: 'Ativo', password: 'admin' },
  { id: 'default_u4', name: 'Miguel', email: 'miguelmr.business@gmail.com', role: 'Administrador', status: 'Ativo', password: 'admin' }
];

function encodeBase64Url(str) {
  return Buffer.from(str, 'utf-8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function decodeBase64Url(safeStr) {
  if (!safeStr) return '';
  const clean = safeStr.replace(/"/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = clean + '='.repeat((4 - clean.length % 4) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const listRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${BUCKET_ID}/users_list`);
      if (!listRes.ok) {
        return res.status(200).json(defaultUsers);
      }

      const rawListText = await listRes.text();
      if (!rawListText || rawListText === '""' || rawListText === '"null"' || rawListText === 'null') {
        // Initialize cloud database with defaults
        const ids = defaultUsers.map(u => u.id);
        const encodedList = encodeBase64Url(JSON.stringify(ids));
        await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${BUCKET_ID}/users_list/${encodedList}`, { method: 'POST' });
        
        // Write each default user to the KV store in parallel
        await Promise.all(defaultUsers.map(async (user) => {
          const encodedUser = encodeBase64Url(JSON.stringify(user));
          await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${BUCKET_ID}/user_${user.id}/${encodedUser}`, { method: 'POST' });
        }));

        return res.status(200).json(defaultUsers);
      }

      try {
        const decodedListStr = decodeBase64Url(rawListText);
        const userIds = JSON.parse(decodedListStr);
        
        if (Array.isArray(userIds) && userIds.length > 0) {
          // Fetch all users in parallel
          const users = await Promise.all(userIds.map(async (id) => {
            try {
              const uRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${BUCKET_ID}/user_${id}`);
              if (uRes.ok) {
                const rawUserText = await uRes.text();
                if (rawUserText && rawUserText !== '""' && rawUserText !== '"null"' && rawUserText !== 'null') {
                  const decodedUserStr = decodeBase64Url(rawUserText);
                  return JSON.parse(decodedUserStr);
                }
              }
            } catch (err) {
              console.error(`Error loading user ${id}:`, err);
            }
            return null;
          }));

          const activeUsers = users.filter(u => u !== null);
          if (activeUsers.length > 0) {
            return res.status(200).json(activeUsers);
          }
        }
      } catch (parseErr) {
        console.error("Error parsing users_list:", rawListText, parseErr);
      }

      return res.status(200).json(defaultUsers);
    }

    if (req.method === 'POST') {
      const users = req.body;
      if (!Array.isArray(users)) {
        return res.status(400).json({ error: 'Body must be an array of users' });
      }

      const ids = users.map(u => u.id);
      const encodedList = encodeBase64Url(JSON.stringify(ids));
      
      // Update the user list index
      const listRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${BUCKET_ID}/users_list/${encodedList}`, { method: 'POST' });
      if (!listRes.ok) {
        throw new Error("Failed to save users_list index");
      }

      // Save each user in parallel
      await Promise.all(users.map(async (user) => {
        const encodedUser = encodeBase64Url(JSON.stringify(user));
        const uRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${BUCKET_ID}/user_${user.id}/${encodedUser}`, { method: 'POST' });
        if (!uRes.ok) {
          console.error(`Failed to save user ${user.id} to KV store`);
        }
      }));

      return res.status(200).json({ success: true, count: users.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
