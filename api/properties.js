// Serverless endpoint to manage properties/fichas globally for Araújo Imóveis
// Synchronizes CRM (crmaraujoimoveis.vercel.app) with the official Site (www.araujoimoveiscaratinga.com.br)

const BUCKET_ID = process.env.KV_BUCKET_ID || "araujo_imoveis_crm_users_v2";
const POINTER_KEY = "araujo_properties_store_ptr";

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

// In-memory cache for fast serverless responses
let memoryCache = null;
let memoryFichasCache = null;

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

async function uploadBase64ToCdn(b64String) {
  try {
    const clean = b64String.includes('base64,') ? b64String.split('base64,')[1] : b64String;
    const form = new URLSearchParams();
    form.append('key', '6d207e02198a847aa98d0a2a901485a5');
    form.append('action', 'upload');
    form.append('source', clean);
    form.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: form
    });
    if (res.ok) {
      const data = await res.json();
      const url = data?.image?.url || data?.image?.display_url;
      if (url) return url;
    }
  } catch (err) {
    console.warn("uploadBase64ToCdn error:", err.message);
  }
  return null;
}

async function sanitizeImagesArray(rawImages, fallbackList = []) {
  const arr = Array.isArray(rawImages) ? rawImages.filter(Boolean) : [];
  if (arr.length === 0) return fallbackList;

  const processed = await Promise.all(arr.map(async (img, idx) => {
    if (typeof img === 'string') {
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      if (img.startsWith('data:image/')) {
        const cdnUrl = await uploadBase64ToCdn(img);
        if (cdnUrl) return cdnUrl;
        return img;
      }
    }
    return fallbackList[idx % Math.max(1, fallbackList.length)] || null;
  }));

  const clean = processed.filter(Boolean);
  return clean.length > 0 ? clean : fallbackList;
}

async function sanitizeProperty(prop) {
  if (!prop) return null;
  const tipoKey = (prop.type || 'casa').toLowerCase();
  const fallbackList = FALLBACK_IMAGES_BY_TYPE[tipoKey] || FALLBACK_IMAGES_BY_TYPE.casa;
  const cleanImages = await sanitizeImagesArray(prop.images, fallbackList);

  return {
    id: String(prop.id || `prop_${Date.now()}`),
    code: String(prop.code || 'AI-0001').replace(/^#+/, ''),
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

async function fetchFullCloudData() {
  if (memoryCache && memoryFichasCache) {
    return {
      list: memoryCache,
      fichas: memoryFichasCache,
      deletedFichaIds: []
    };
  }

  try {
    const ptrRes = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${BUCKET_ID}/${POINTER_KEY}`, { cache: 'no-store' });
    if (ptrRes.ok) {
      const raw = await ptrRes.text();
      if (raw && raw !== '""' && raw !== '"null"' && raw !== 'null') {
        const url = decodeBase64Url(raw);
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          const dataRes = await fetch(url, { cache: 'no-store' });
          if (dataRes.ok) {
            const json = await dataRes.json();
            const list = Array.isArray(json?.list) ? json.list : [];
            const fichas = Array.isArray(json?.fichas) ? json.fichas : [];
            const deleted = Array.isArray(json?.deletedFichaIds) ? json.deletedFichaIds : [];
            memoryCache = list;
            memoryFichasCache = fichas;
            return { list, fichas, deletedFichaIds: deleted };
          }
        }
      }
    }
  } catch (err) {
    console.error("fetchFullCloudData error:", err);
  }

  return {
    list: memoryCache || [],
    fichas: memoryFichasCache || [],
    deletedFichaIds: []
  };
}

async function saveFullCloudData({ list, fichas, deletedFichaIds }) {
  try {
    const current = await fetchFullCloudData();
    const nextList = list !== undefined ? list : current.list;
    const nextFichas = fichas !== undefined ? fichas : current.fichas;
    const nextDeleted = deletedFichaIds !== undefined ? deletedFichaIds : current.deletedFichaIds;

    memoryCache = nextList;
    memoryFichasCache = nextFichas;

    const payload = {
      updatedAt: new Date().toISOString(),
      list: nextList,
      fichas: nextFichas,
      deletedFichaIds: nextDeleted
    };

    const dpRes = await fetch('https://dpaste.org/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        content: JSON.stringify(payload),
        expiry_days: '365',
        format: 'url'
      })
    });

    if (dpRes.ok) {
      const dpUrl = (await dpRes.text()).trim();
      const rawUrl = `${dpUrl}/raw`;
      const encoded = encodeBase64Url(rawUrl);
      await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${BUCKET_ID}/${POINTER_KEY}/${encoded}`, { method: 'POST' });
    }
  } catch (err) {
    console.error("saveFullCloudData error:", err);
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
      const queryType = req.query?.type;
      const cloudData = await fetchFullCloudData();

      if (queryType === 'fichas') {
        const deletedSet = new Set(cloudData.deletedFichaIds || []);
        const activeFichas = (cloudData.fichas || []).filter(f => f && f.id && !deletedSet.has(f.id));
        return res.status(200).json(activeFichas);
      }

      return res.status(200).json(cloudData.list || []);
    }

    if (req.method === 'POST') {
      const rawBody = req.body || {};

      // 1. Adicionar ou atualizar Ficha Provisória vinda do Site (aba Anunciar Imóvel) ou do CRM
      if (rawBody.action === 'add_ficha' || rawBody.action === 'update_ficha') {
        const incomingFicha = rawBody.ficha;
        if (!incomingFicha) {
          return res.status(400).json({ error: 'Missing ficha object' });
        }

        const cloudData = await fetchFullCloudData();
        const currentFichas = Array.isArray(cloudData.fichas) ? cloudData.fichas : [];
        const uploadedImages = await sanitizeImagesArray(incomingFicha.imagensImovel, []);

        const nowIso = new Date().toISOString();
        const defaultToday = nowIso.split('T')[0];
        const nextNum = currentFichas.length + 1;
        const autoCode = incomingFicha.codigoImovel || `AI-${String(nextNum).padStart(4, '0')}`;

        const fichaToSave = {
          id: incomingFicha.id || `ficha_site_${Date.now()}`,
          codigoImovel: autoCode,
          nomeFicha: incomingFicha.nomeFicha || `${autoCode} (Análise Site)`,
          nomeProprietario: incomingFicha.nomeProprietario || 'Proprietário (Site)',
          telefoneProprietario: incomingFicha.telefoneProprietario || '',
          emailProprietario: incomingFicha.emailProprietario || '',
          horarioContatoProprietario: incomingFicha.horarioContatoProprietario || 'Comercial (08:00 às 18:00)',
          linkWhatsapp: incomingFicha.linkWhatsapp || '',
          tipoImovel: incomingFicha.tipoImovel || 'Casa',
          enderecoImovel: incomingFicha.enderecoImovel || incomingFicha.bairroImovel || 'Caratinga - MG',
          bairroImovel: incomingFicha.bairroImovel || 'Centro',
          pontoReferenciaImovel: incomingFicha.pontoReferenciaImovel || '',
          linkLocalizacaoImovel: incomingFicha.linkLocalizacaoImovel || '',
          ocupacaoImovel: incomingFicha.ocupacaoImovel || 'Vazio',
          nomeAcesso: incomingFicha.nomeAcesso || incomingFicha.nomeProprietario || '',
          telefoneAcesso: incomingFicha.telefoneAcesso || incomingFicha.telefoneProprietario || '',
          dificuldadeAcesso: incomingFicha.dificuldadeAcesso || 'Não',
          observacoesAcesso: incomingFicha.observacoesAcesso || '',
          aguaLigada: incomingFicha.aguaLigada || 'Sim',
          energiaLigada: incomingFicha.energiaLigada || 'Sim',
          animaisImovel: incomingFicha.animaisImovel || 'Não',
          observacoesImovel: incomingFicha.observacoesImovel || '',
          imagensImovel: uploadedImages,
          finalidadeImovel: incomingFicha.finalidadeImovel || 'comprar',
          valorImovel: incomingFicha.valorImovel || '',
          precoPretendido: incomingFicha.precoPretendido || '',
          modalidadePretendida: incomingFicha.modalidadePretendida || '',
          quartos: incomingFicha.quartos || '',
          banheiros: incomingFicha.banheiros || '',
          vagas: incomingFicha.vagas || '',
          area: incomingFicha.area || '',
          publicarNoSite: incomingFicha.publicarNoSite !== undefined ? Boolean(incomingFicha.publicarNoSite) : false,
          provisoria: incomingFicha.provisoria !== undefined ? Boolean(incomingFicha.provisoria) : true,
          dataVisita: incomingFicha.dataVisita || defaultToday,
          horarioVisita: incomingFicha.horarioVisita || '09:00',
          profissionalResponsavel: incomingFicha.profissionalResponsavel || 'A definir pela Imobiliária',
          proprietarioAcompanhara: incomingFicha.proprietarioAcompanhara || 'Sim',
          autorizacaoFotosVideos: incomingFicha.autorizacaoFotosVideos || 'Sim',
          confirmadoWhatsapp: incomingFicha.confirmadoWhatsapp || 'Não',
          dataCaptacao: incomingFicha.dataCaptacao || defaultToday,
          corretorResponsavel: incomingFicha.corretorResponsavel || 'Análise Imobiliária (Site)',
          origemCaptacao: incomingFicha.origemCaptacao || 'Site Oficial (Anunciar Imóvel)',
          status: incomingFicha.status || 'Aguardando agendamento',
          createdAt: incomingFicha.createdAt || nowIso,
          updatedAt: nowIso,
          createdBy: incomingFicha.createdBy || 'Site Oficial (Anunciar Imóvel)',
          updatedBy: incomingFicha.updatedBy || 'Site Oficial (Anunciar Imóvel)'
        };

        const filteredFichas = currentFichas.filter(f => f && f.id !== fichaToSave.id);
        const updatedFichas = [fichaToSave, ...filteredFichas];

        await saveFullCloudData({ fichas: updatedFichas });
        return res.status(200).json({ success: true, ficha: fichaToSave, count: updatedFichas.length });
      }

      // 2. Fluxo padrão de sincronização de imóveis publicados no site
      const isFullBatch = Array.isArray(rawBody) && rawBody.length > 1;
      const rawList = Array.isArray(rawBody) 
        ? rawBody 
        : (rawBody?.properties && Array.isArray(rawBody.properties) 
            ? rawBody.properties 
            : (rawBody?.id ? [rawBody] : null));

      if (!rawList) {
        return res.status(400).json({ error: 'Body must be a property object or an array of properties' });
      }

      const sanitizedIncoming = (await Promise.all(rawList.map(sanitizeProperty))).filter(Boolean);
      const cloudData = await fetchFullCloudData();
      
      let mergedList = [];
      if (isFullBatch) {
        mergedList = sanitizedIncoming;
      } else {
        const currentList = cloudData.list || [];
        const map = new Map();
        for (const p of currentList) {
          if (p && p.id) map.set(p.id, p);
          if (p && p.code) map.set(p.code, p);
        }
        for (const inc of sanitizedIncoming) {
          map.set(inc.id, inc);
          if (inc.code) map.set(inc.code, inc);
        }
        
        const unique = [];
        const seenIds = new Set();
        for (const item of map.values()) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            unique.push(item);
          }
        }

        const incomingIds = new Set(sanitizedIncoming.map(p => p.id));
        const head = unique.filter(p => incomingIds.has(p.id));
        const rest = unique.filter(p => !incomingIds.has(p.id));
        mergedList = [...head, ...rest];
      }

      await saveFullCloudData({ list: mergedList });

      return res.status(200).json({ success: true, count: mergedList.length, properties: mergedList });
    }

    if (req.method === 'DELETE') {
      const targetId = req.query?.id || req.body?.id;
      const targetType = req.query?.type || req.body?.type;
      if (!targetId) return res.status(400).json({ error: 'Missing id' });

      const cloudData = await fetchFullCloudData();

      if (targetType === 'ficha') {
        const updatedFichas = (cloudData.fichas || []).filter(f => f && f.id !== targetId && f.codigoImovel !== targetId);
        const updatedDeleted = Array.from(new Set([...(cloudData.deletedFichaIds || []), targetId]));
        await saveFullCloudData({ fichas: updatedFichas, deletedFichaIds: updatedDeleted });
        return res.status(200).json({ success: true, remaining: updatedFichas.length });
      }

      const updatedList = (cloudData.list || []).filter(p => p.id !== targetId && p.code !== targetId && p.fichaId !== targetId);
      const updatedFichas = (cloudData.fichas || []).filter(f => f && f.id !== targetId && f.codigoImovel !== targetId);
      const updatedDeleted = Array.from(new Set([...(cloudData.deletedFichaIds || []), targetId]));

      await saveFullCloudData({ list: updatedList, fichas: updatedFichas, deletedFichaIds: updatedDeleted });

      return res.status(200).json({ success: true, remaining: updatedList.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error("API /api/properties error:", err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
