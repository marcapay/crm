// Serverless endpoint to upload property photos to high-performance CDN
// Returns permanent HTTPS URL (e.g. https://iili.io/...) for use on the website

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, base64 } = req.body || {};
    const rawData = image || base64;

    if (!rawData) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada no corpo da requisição.' });
    }

    // If it's already an HTTP/HTTPS URL, return it as is
    if (typeof rawData === 'string' && (rawData.startsWith('http://') || rawData.startsWith('https://'))) {
      return res.status(200).json({ success: true, url: rawData });
    }

    // Extract raw base64 string without data:image/jpeg;base64, prefix
    const cleanB64 = rawData.includes('base64,') ? rawData.split('base64,')[1] : rawData;

    // 1. Upload to freeimage.host CDN (Permanent storage, no expiration)
    const form = new URLSearchParams();
    form.append('key', '6d207e02198a847aa98d0a2a901485a5');
    form.append('action', 'upload');
    form.append('source', cleanB64);
    form.append('format', 'json');

    const cdnRes = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: form
    });

    if (cdnRes.ok) {
      const data = await cdnRes.json();
      const imageUrl = data?.image?.url || data?.image?.display_url;
      if (imageUrl) {
        return res.status(200).json({ success: true, url: imageUrl });
      }
    }

    // 2. Fallback to tmpfiles if freeimage fails
    const buffer = Buffer.from(cleanB64, 'base64');
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('file', blob, `imovel_${Date.now()}.jpg`);

    const fallbackRes = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (fallbackRes.ok) {
      const fbJson = await fallbackRes.json();
      const rawUrl = fbJson?.data?.url;
      if (rawUrl) {
        // Convert https://tmpfiles.org/123/img.jpg -> https://tmpfiles.org/dl/123/img.jpg
        const directUrl = rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        return res.status(200).json({ success: true, url: directUrl });
      }
    }

    return res.status(500).json({ error: 'Não foi possível hospedar a imagem no CDN.' });
  } catch (err) {
    console.error("api/upload-image error:", err);
    return res.status(500).json({ error: 'Erro interno ao processar upload de imagem.', details: err.message });
  }
}
