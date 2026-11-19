// Serverless endpoint to manage properties/fichas globally for Araújo Imóveis
// Synchronizes CRM (crmaraujoimoveis.vercel.app) with the official Site (www.araujoimoveiscaratinga.com.br)

const CLOUD_STORE_URL = "https://api.restful-api.dev/objects/ff808181a09d98f701a1f4330be964d4";

// In-memory cache for fast serverless responses
let memoryCache = null;

// Fallback high-resolution photos by property type
const FALLBACK_IMAGES_BY_TYPE = {
  casa: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop"
  ],
  apartamento: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop"
  ],
  cobertura: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
  ],
  comercial: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop"
  ],
  terreno: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=1200&auto=format&fit=crop"
  ]
};

function sanitizeProperty(prop) {
  if (!prop) return null;
  const tipoKey = (prop.type || 'casa').toLowerCase();
  const fallbackList = FALLBACK_IMAGES_BY_TYPE[tipoKey] || FALLBACK_IMAGES_BY_TYPE.casa;

  // Filter images: keep valid URLs, if base64 is too huge, use fallback
  let cleanImages = Array.isArray(prop.images) ? prop.images.filter(Boolean) : [];
  if (cleanImages.length === 0) {
    cleanImages = fallbackList;
  } else {
    cleanImages = cleanImages.map((img, idx) => {
      if (typeof img === 'string' && img.startsWith('data:image/') && img.length > 50000) {
        return fallbackList[idx % fallbackList.length];
      }
      return img;
    });
  }

  return {
    id: String(prop.id || `prop_${Date.now()}`),
    code: String(prop.code || 'VT-0001').replace(/^#+/, ''),
    title: String(prop.title || 'Imóvel em Caratinga'),
    type: prop.type || 'Casa',
    transaction: (prop.transaction || 'alugar').toLowerCase(),
    price: Number(prop.price) || 1500,
    condoFee: Number(prop.condoFee || 0),
    iptu: Number(prop.iptu || 0),
    city: prop.city || 'Caratinga',
    neighborhood: prop.neighborhood || 'Centro',
    address: prop.address || 'Caratinga - MG',
    bedrooms: Number(prop.bedrooms) || 0,
    bathrooms: Number(prop.bathrooms) || 0,
    suites: Number(prop.suites) || 0,
    parkingSpots: Number(prop.parkingSpots) || 0,
    area: Number(prop.area) || 0,
    description: prop.description || '',
    features: Array.isArray(prop.features) ? prop.features : [],
    images: cleanImages,
    featured: prop.featured !== undefined ? Boolean(prop.featured) : true,
    status: prop.status || 'Disponível',
    fichaId: prop.fichaId || null,
    nomeProprietario: prop.nomeProprietario || '',
    telefoneProprietario: prop.telefoneProprietario || '',
    createdAt: prop.createdAt || new Date().toISOString()
  };
}

async function fetchFromCloud() {
  try {
    const res = await fetch(CLOUD_STORE_URL, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.list && Array.isArray(json.data.list)) {
        return json.data.list;
      }
    }
  } catch (err) {
    console.error("fetchFromCloud error:", err);
  }
  return null;
}

async function saveToCloud(propertiesList) {
  try {
    await fetch(CLOUD_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'araujo_properties_store',
        data: {
          list: propertiesList,
          updatedAt: new Date().toISOString()
        }
      })
    });
  } catch (err) {
    console.error("saveToCloud error:", err);
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const cloudList = await fetchFromCloud();
      if (cloudList && Array.isArray(cloudList)) {
        memoryCache = cloudList;
        return res.status(200).json(cloudList);
      }

      if (memoryCache && Array.isArray(memoryCache)) {
        return res.status(200).json(memoryCache);
      }

      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const rawBody = req.body;
      const rawList = Array.isArray(rawBody) 
        ? rawBody 
        : (rawBody?.properties && Array.isArray(rawBody.properties) 
            ? rawBody.properties 
            : (rawBody?.id ? [rawBody] : null));

      if (!rawList) {
        return res.status(400).json({ error: 'Body must be a property object or an array of properties' });
      }

      const sanitizedList = rawList.map(sanitizeProperty).filter(Boolean);
      memoryCache = sanitizedList;
      await saveToCloud(sanitizedList);

      return res.status(200).json({ success: true, count: sanitizedList.length, properties: sanitizedList });
    }

    if (req.method === 'DELETE') {
      const targetId = req.query?.id || req.body?.id;
      if (!targetId) return res.status(400).json({ error: 'Missing property id' });

      let currentList = (await fetchFromCloud()) || memoryCache || [];
      const updatedList = currentList.filter(p => p.id !== targetId && p.code !== targetId && p.fichaId !== targetId);

      memoryCache = updatedList;
      await saveToCloud(updatedList);

      return res.status(200).json({ success: true, remaining: updatedList.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error("API /api/properties error:", err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
