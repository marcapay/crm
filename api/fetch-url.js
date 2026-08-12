export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let targetUrl = req.query.url || (req.body && req.body.url);
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    targetUrl = targetUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Handle Google Sheets URLs automatically convert to CSV export link
    if (targetUrl.includes('docs.google.com/spreadsheets')) {
      const sheetIdMatch = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetIdMatch && sheetIdMatch[1]) {
        targetUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
      }
    }

    const fetchRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain,text/csv;q=0.8,*/*;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({ error: `Failed to fetch URL status ${fetchRes.status}` });
    }

    const contentType = fetchRes.headers.get('content-type') || '';
    const rawText = await fetchRes.text();

    let cleanText = '';

    if (contentType.includes('json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        const parsedJson = JSON.parse(rawText);
        cleanText = typeof parsedJson === 'object' ? JSON.stringify(parsedJson, null, 2) : rawText;
      } catch {
        cleanText = rawText;
      }
    } else if (contentType.includes('csv') || targetUrl.includes('export?format=csv')) {
      cleanText = rawText;
    } else {
      // Clean HTML tags and extract readable visible text
      cleanText = rawText
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Limit extracted text size to 12,000 characters to keep prompt light and fast
    const truncatedText = cleanText.substring(0, 12000);

    return res.status(200).json({
      url: targetUrl,
      text: truncatedText,
      length: truncatedText.length
    });
  } catch (err) {
    console.error('Fetch URL API error:', err);
    return res.status(500).json({ error: err.message || 'Error scraping URL content' });
  }
}
