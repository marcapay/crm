// Serverless API endpoint for external site authentication (sitearaujoimoveis.vercel.app)
const BUCKET_ID = process.env.KV_BUCKET_ID || "araujo_imoveis_crm_users_v2";

function decodeBase64Url(safeStr) {
  if (!safeStr) return '';
  const clean = safeStr.replace(/"/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = clean + '='.repeat((4 - clean.length % 4) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

export default async function handler(req, res) {
  // CORS Headers allowing cross-origin requests from sitearaujoimoveis.vercel.app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor, informe e-mail e senha.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Fetch user list index from KV cloud store
    let activeUsers = [];
    const listRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${BUCKET_ID}/users_list`);

    if (listRes.ok) {
      const rawListText = await listRes.text();
      if (rawListText && rawListText !== '""' && rawListText !== '"null"' && rawListText !== 'null') {
        const decodedListStr = decodeBase64Url(rawListText);
        const userIds = JSON.parse(decodedListStr);
        if (Array.isArray(userIds) && userIds.length > 0) {
          const users = await Promise.all(userIds.map(async (id) => {
            try {
              const uRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${BUCKET_ID}/user_${id}`);
              if (uRes.ok) {
                const rawUserText = await uRes.text();
                if (rawUserText && rawUserText !== '""' && rawUserText !== '"null"') {
                  return JSON.parse(decodeBase64Url(rawUserText));
                }
              }
            } catch (e) {}
            return null;
          }));
          activeUsers = users.filter(Boolean);
        }
      }
    }

    // Match user by email & password
    const matched = activeUsers.find(u => 
      (u.email || '').trim().toLowerCase() === cleanEmail &&
      (u.password || '').trim() === cleanPassword
    );

    if (matched) {
      const roleNormalized = (matched.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const redirectUrl = `https://crmaraujoimoveis.vercel.app/?email=${encodeURIComponent(matched.email)}&password=${encodeURIComponent(matched.password)}`;
      
      return res.status(200).json({
        success: true,
        user: {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role
        },
        portalUrl: redirectUrl,
        message: 'Acesso permitido. Autenticado no CRM Araújo Imóveis.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Conta não cadastrada ou senha incorreta no CRM Araújo Imóveis.'
    });
  } catch (err) {
    console.error("Auth API error:", err);
    return res.status(500).json({ success: false, message: 'Erro interno ao validar credenciais.' });
  }
}
