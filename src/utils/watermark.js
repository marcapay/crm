/**
 * Utilitário de Aplicação de Marca d'Água Oficial da Araújo Imóveis
 * Aplica automaticamente a logo e dados da Araújo Imóveis sobre as fotos do imóvel via Canvas HTML5.
 */

export const DEFAULT_WATERMARK_CONFIG = {
  enabled: true,
  position: 'center', // 'center' | 'bottom-right' | 'both'
  opacity: 0.45,       // 0.2 a 0.8
  includeText: true,
  footerText: 'Araújo Imóveis • araujoimoveiscaratinga.com.br',
  quality: 0.78,
  maxWidth: 1200
};

/**
 * Comprime e redimensiona imagem para armazenamento seguro no CRM/LocalStorage
 * @param {string} imageSrc - URL ou base64
 * @param {number} maxDim - Dimensão máxima (largura ou altura)
 * @param {number} quality - Qualidade JPEG (0.1 a 1.0)
 * @returns {Promise<string>}
 */
export async function compressImageForStorage(imageSrc, maxDim = 900, quality = 0.75) {
  if (!imageSrc || typeof imageSrc !== 'string') return imageSrc;
  if (!imageSrc.startsWith('data:image/')) return imageSrc;
  if (imageSrc.length < 50000) return imageSrc;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

export function getWatermarkSettings() {
  try {
    const saved = localStorage.getItem('araujo_watermark_settings');
    if (saved) {
      return { ...DEFAULT_WATERMARK_CONFIG, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Erro ao ler configurações de marca dágua:', err);
  }
  return { ...DEFAULT_WATERMARK_CONFIG };
}

export function saveWatermarkSettings(newSettings) {
  try {
    const current = getWatermarkSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem('araujo_watermark_settings', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Erro ao salvar configurações de marca dágua:', err);
    return newSettings;
  }
}

/**
 * Aplica a marca d'água da Araújo Imóveis em uma única imagem (dataUrl, Blob ou URL)
 * @param {string} imageSrc - URL ou base64 da imagem
 * @param {object} customOptions - Opções de customização
 * @returns {Promise<string>} - Promise com dataURL da imagem com marca d'água
 */
export async function applyWatermarkToImage(imageSrc, customOptions = {}) {
  const options = { ...getWatermarkSettings(), ...customOptions };

  // Se marca d'água estiver desativada, retorna imagem original
  if (!options.enabled) {
    return imageSrc;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let targetWidth = img.naturalWidth || img.width;
        let targetHeight = img.naturalHeight || img.height;

        // Limita dimensões máximas para evitar travamento com fotos de altíssima resolução
        const maxDim = options.maxWidth || 2048;
        if (targetWidth > maxDim || targetHeight > maxDim) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
            targetHeight = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // 1. Desenha a imagem base
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 2. Carrega a logo da Araújo Imóveis
        const logo = new Image();
        logo.crossOrigin = 'anonymous';

        const renderWatermarks = (logoImg) => {
          const logoAspect = (logoImg && logoImg.width && logoImg.height) 
            ? (logoImg.width / logoImg.height) 
            : (1024 / 679);

          const { position, opacity, includeText, footerText } = options;

          // Marca d'água Central (estilo portal imobiliário seguro)
          if (position === 'center' || position === 'both') {
            ctx.save();
            const centerTargetWidth = Math.min(targetWidth * 0.48, (targetHeight * 0.48) * logoAspect);
            const centerTargetHeight = centerTargetWidth / logoAspect;
            const x = (targetWidth - centerTargetWidth) / 2;
            const y = (targetHeight - centerTargetHeight) / 2;

            ctx.globalAlpha = Math.min(Math.max(opacity, 0.15), 0.85);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = Math.max(6, targetWidth * 0.008);
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;

            if (logoImg) {
              ctx.drawImage(logoImg, x, y, centerTargetWidth, centerTargetHeight);
            } else {
              drawVectorLogoFallback(ctx, x, y, centerTargetWidth, centerTargetHeight);
            }
            ctx.restore();
          }

          // Marca d'água Canto Inferior Direito (estilo assinatura de catálogo)
          if (position === 'bottom-right' || position === 'both') {
            ctx.save();
            const cornerTargetWidth = Math.min(targetWidth * 0.26, 280);
            const cornerTargetHeight = cornerTargetWidth / logoAspect;
            const margin = Math.max(16, targetWidth * 0.025);
            const x = targetWidth - cornerTargetWidth - margin;
            const y = targetHeight - cornerTargetHeight - margin;

            // Fundo escuro sutil e arredondado para garantir contraste em qualquer parede/piso
            const bgPad = Math.max(6, targetWidth * 0.008);
            ctx.save();
            ctx.fillStyle = 'rgba(8, 9, 13, 0.60)';
            const rx = x - bgPad;
            const ry = y - bgPad;
            const rw = cornerTargetWidth + (bgPad * 2);
            const rh = cornerTargetHeight + (bgPad * 2);
            const radius = 6;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(rx, ry, rw, rh, radius);
              ctx.fill();
            } else {
              ctx.fillRect(rx, ry, rw, rh);
            }
            ctx.restore();

            ctx.globalAlpha = position === 'both' ? 0.90 : Math.min(opacity + 0.35, 0.95);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            ctx.shadowBlur = 6;

            if (logoImg) {
              ctx.drawImage(logoImg, x, y, cornerTargetWidth, cornerTargetHeight);
            } else {
              drawVectorLogoFallback(ctx, x, y, cornerTargetWidth, cornerTargetHeight);
            }
            ctx.restore();
          }

          // Linha de rodapé opcional discreta
          if (includeText && footerText) {
            ctx.save();
            const fontSize = Math.max(11, Math.round(targetWidth * 0.015));
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            const pad = Math.max(14, targetWidth * 0.02);
            ctx.fillText(footerText, pad, targetHeight - pad);
            ctx.restore();
          }

          const outputQuality = options.quality || 0.92;
          resolve(canvas.toDataURL('image/jpeg', outputQuality));
        };

        logo.onload = () => renderWatermarks(logo);
        logo.onerror = () => {
          // Fallback vetorial limpo se a imagem física não carregar
          renderWatermarks(null);
        };

        logo.src = '/araujo-logo.png?v=4';
      } catch (err) {
        console.error('Falha ao processar marca dágua:', err);
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}

/**
 * Desenho de fallback do logotipo da Araújo Imóveis diretamente no canvas
 */
function drawVectorLogoFallback(ctx, x, y, width, height) {
  ctx.save();
  ctx.translate(x, y);

  // Ícone Geométrico
  const iconSize = Math.min(height * 0.65, width * 0.45);
  const iconX = (width - iconSize) / 2;
  const iconY = height * 0.05;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, iconSize * 0.08);
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(iconX + iconSize * 0.5, iconY);
  ctx.lineTo(iconX + iconSize, iconY + iconSize * 0.85);
  ctx.lineTo(iconX, iconY + iconSize * 0.85);
  ctx.closePath();
  ctx.stroke();

  // Texto ARAÚJO IMÓVEIS
  const fontSize = Math.max(10, Math.round(width * 0.09));
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ARAÚJO IMÓVEIS', width / 2, height * 0.78);

  const subSize = Math.max(7, Math.round(fontSize * 0.45));
  ctx.font = `600 ${subSize}px Inter, sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('CREDI BILIDADE COMEÇA NO NOME', width / 2, height * 0.94);

  ctx.restore();
}

/**
 * Aplica marca d'água a múltiplas imagens em fila com callback de progresso
 */
export async function applyWatermarkToMultipleImages(imagesArray, options = {}, onProgress = null) {
  if (!Array.isArray(imagesArray) || imagesArray.length === 0) return [];

  const results = [];
  const total = imagesArray.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i + 1, total);
    }
    try {
      const watermarked = await applyWatermarkToImage(imagesArray[i], options);
      results.push(watermarked);
    } catch (err) {
      console.warn('Erro ao aplicar marca dágua na imagem:', i, err);
      results.push(imagesArray[i]);
    }
  }

  return results;
}
