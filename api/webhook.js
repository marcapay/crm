// Simple in-memory store for pipeline updates (demo / active session persistence)
let pipelineUpdates = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { phone, pipeline } = req.body;
    if (!phone || !pipeline) {
      return res.status(400).json({ error: 'Phone and pipeline are required fields' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    // Queue update
    const update = {
      phone: cleanPhone,
      pipeline,
      timestamp: Date.now()
    };
    
    pipelineUpdates.push(update);

    // Limit queue size to prevent memory bloat
    if (pipelineUpdates.length > 200) {
      pipelineUpdates.shift();
    }

    return res.status(200).json({ success: true, message: 'Pipeline update queued successfully', data: update });
  }

  if (req.method === 'GET') {
    const since = req.query.since ? parseInt(req.query.since, 10) : 0;
    const filtered = pipelineUpdates.filter(u => u.timestamp > since);
    return res.status(200).json({ updates: filtered });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
