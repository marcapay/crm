// Mapeamento das fotos reais dos imóveis cadastrados no sistema
import imoveisPhotosData from '../data/imoveisPhotos.json';

export const DEFAULT_IMOVEIS_PHOTOS = imoveisPhotosData;

export function getKnownImovelPhotos(identifier, fallbackTipo = 'apartamento') {
  if (!identifier) return [];
  const cleanId = String(identifier).trim().toUpperCase().replace(/^#+/, '');
  
  // 1. Busca por código exato (ex: IM-0001, IM-0002, IM-0003, IM-0004, IM-0005)
  if (DEFAULT_IMOVEIS_PHOTOS[cleanId]) {
    return DEFAULT_IMOVEIS_PHOTOS[cleanId];
  }

  // 2. Busca flexível (ex: se id for prop_xxx ou contiver 0001, 0002...)
  for (const [code, photos] of Object.entries(DEFAULT_IMOVEIS_PHOTOS)) {
    if (cleanId.includes(code.replace('-', '')) || cleanId.includes(code)) {
      return photos;
    }
  }

  // 3. Fallback inteligente por tipo do imóvel
  const t = (fallbackTipo || 'apartamento').toLowerCase();
  if (t.includes('casa')) {
    return [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
    ];
  }
  if (t.includes('cobertura')) {
    return [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"
    ];
  }
  if (t.includes('comercial') || t.includes('sala')) {
    return [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
    ];
  }
  if (t.includes('terreno') || t.includes('lote')) {
    return [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop"
    ];
  }
  
  // Apartamento padrão
  return [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop"
  ];
}
