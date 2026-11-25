import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  FileCheck, 
  Camera, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  File, 
  Trash2, 
  Image as ImageIcon, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Clipboard, 
  Key,
  Building,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function ModalPreenchimentoIA({ isOpen, onClose, onApply, existingFormData }) {
  if (!isOpen) return null;

  // Active Tab: 'upload' | 'text' | 'config'
  const [activeTab, setActiveTab] = useState('upload');
  
  // Files State
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [rawText, setRawText] = useState('');
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [extractedPhotos, setExtractedPhotos] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // AI Configuration State (reads from CRM settings or allows temporary override)
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('crmbase_sdr_provider') || 'gemini');
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('crmbase_sdr_apikey') || '');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('crmbase_sdr_model') || (aiProvider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o'));

  const fileInputRef = useRef(null);

  // Auto-detect photos count
  const photosCount = attachedFiles.filter(f => f.type.startsWith('image/')).length;
  const docsCount = attachedFiles.filter(f => !f.type.startsWith('image/')).length;

  // Handle file addition
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      
      if (file.type.startsWith('image/')) {
        reader.onload = (event) => {
          setAttachedFiles(prev => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              dataUrl: event.target.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.includes('text') || file.name.match(/\.(txt|csv|json|md)$/i)) {
        reader.onload = (event) => {
          setAttachedFiles(prev => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              textContent: event.target.result
            }
          ]);
        };
        reader.readAsText(file);
      } else {
        // PDF or generic document
        const arrayReader = new FileReader();
        arrayReader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          let textExtracted = '';

          // Client-side extraction via window.pdfjsLib
          if (window.pdfjsLib && file.type.includes('pdf')) {
            try {
              const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
              const pdf = await loadingTask.promise;
              let fullChunks = [];
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const pageStr = content.items.map(item => item.str).join(' ');
                if (pageStr.trim()) fullChunks.push(pageStr.trim());
              }
              textExtracted = fullChunks.join('\n\n');
            } catch (pdfErr) {
              console.warn("Erro ao extrair PDF via pdfjsLib:", pdfErr);
            }
          }

          setAttachedFiles(prev => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              file,
              name: file.name,
              size: file.size,
              type: file.type || 'application/pdf',
              textContent: textExtracted,
              arrayBuffer
            }
          ]);
        };
        arrayReader.readAsArrayBuffer(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Quick paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(prev => (prev ? `${prev}\n\n${text}` : text));
      }
    } catch (err) {
      console.warn("Clipboard read error:", err);
    }
  };

  // Fallback Rule-based Intelligent Extractor (Used if no API key is provided or offline)
  const extractWithLocalHeuristics = (combinedText, photos) => {
    const text = combinedText || '';
    const lower = text.toLowerCase();

    // 1. Tipo de Imóvel
    let tipo = 'Casa';
    if (lower.includes('apartamento') || lower.includes('apto')) tipo = 'Apartamento';
    else if (lower.includes('cobertura')) tipo = 'Cobertura';
    else if (lower.includes('sobrado')) tipo = 'Sobrado';
    else if (lower.includes('lote') || lower.includes('terreno')) tipo = 'Lote/Terreno';
    else if (lower.includes('fazenda')) tipo = 'Fazenda';
    else if (lower.includes('chácara') || lower.includes('chacara') || lower.includes('sítio')) tipo = 'Chácara/Sítio';
    else if (lower.includes('galpão') || lower.includes('galpao') || lower.includes('empresa')) tipo = 'Empresa / Galpão';
    else if (lower.includes('comercial') || lower.includes('sala comercial') || lower.includes('loja')) tipo = 'Comercial';

    // 2. Finalidade
    let finalidade = 'Locação';
    if (lower.includes('venda e locação') || (lower.includes('vender') && lower.includes('alugar'))) finalidade = 'Venda e Locação';
    else if (lower.includes('venda') || lower.includes('comprar') || lower.includes('à venda')) finalidade = 'Venda';
    else if (lower.includes('permuta')) finalidade = 'Permuta';

    // 3. Telefone / WhatsApp
    const phoneMatch = text.match(/(?:\+?55\s*)?(?:\(?([1-9]{2})\)?\s*)?(?:9\s*)?(\d{4,5})[-.\s]?(\d{4})/);
    const telefone = phoneMatch ? phoneMatch[0].trim() : '';

    // 4. Email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0].trim() : '';

    // 5. Nome do Proprietário
    let nomeProprietario = '';
    const nameMatch = text.match(/(?:proprietário|proprietaria|dono|cliente|vendedor|locador|titular):\s*([A-Za-zÀ-ÿ\s]{3,40})/i);
    if (nameMatch) {
      nomeProprietario = nameMatch[1].trim();
    }

    // 6. Valores
    let valorImovel = '';
    let valorCondominio = '';
    let iptuAnual = '';

    const priceMatch = text.match(/(?:valor|preço|aluguel|venda|locação|r\$)\s*[:=]?\s*r?\$?\s*([\d.,]{3,12})/i);
    if (priceMatch) {
      const cleanVal = priceMatch[1].replace(/[^\d.,]/g, '').trim();
      if (cleanVal) valorImovel = `R$ ${cleanVal}`;
    }

    const condoMatch = text.match(/(?:condomínio|condominio|taxa de cond)\s*[:=]?\s*r?\$?\s*([\d.,]{2,8})/i);
    if (condoMatch) {
      valorCondominio = `R$ ${condoMatch[1].replace(/[^\d.,]/g, '').trim()}`;
    }

    const iptuMatch = text.match(/(?:iptu)\s*[:=]?\s*r?\$?\s*([\d.,]{2,8})/i);
    if (iptuMatch) {
      iptuAnual = `R$ ${iptuMatch[1].replace(/[^\d.,]/g, '').trim()}`;
    }

    // 7. CEP e Endereço
    const cepMatch = text.match(/\b\d{5}-?\d{3}\b/);
    const cep = cepMatch ? cepMatch[0].replace(/\D/g, '') : '';

    let bairro = '';
    const bairroMatch = text.match(/(?:bairro|b\.|setor)\s*[:=]?\s*([A-Za-zÀ-ÿ0-9\s]{3,30})/i);
    if (bairroMatch) {
      bairro = bairroMatch[1].split(/[\n,;]/)[0].trim();
    } else if (lower.includes('centro')) bairro = 'Centro';
    else if (lower.includes('esperança')) bairro = 'Esperança';
    else if (lower.includes('santa zita')) bairro = 'Santa Zita';
    else if (lower.includes('limoeiro')) bairro = 'Limoeiro';
    else if (lower.includes('salatiel')) bairro = 'Salatiel';
    else if (lower.includes('anselmo')) bairro = 'Anselmo';

    let endereco = '';
    const ruaMatch = text.match(/(?:rua|avenida|av\.|alameda|travessa|rodovia|praça)\s+([A-Za-zÀ-ÿ0-9\s,.ºª-]{5,60})/i);
    if (ruaMatch) {
      endereco = ruaMatch[0].split(/[\n;]/)[0].trim();
    }

    let numero = '';
    const numMatch = text.match(/(?:n[º°.]|número|numero)\s*[:=]?\s*(\d+[a-zA-Z]?)/i);
    if (numMatch) numero = numMatch[1].trim();

    // 8. Características (quartos, banheiros, vagas, área)
    const quartosMatch = text.match(/(\d+)\s*(?:quartos?|dorms?|dormitórios?|qts?)/i);
    const quartos = quartosMatch ? quartosMatch[1] : '';

    const suitesMatch = text.match(/(\d+)\s*(?:suítes?|suites?)/i);
    const suites = suitesMatch ? suitesMatch[1] : '';

    const banheirosMatch = text.match(/(\d+)\s*(?:banheiros?|bhs?|lavabos?)/i);
    const banheiros = banheirosMatch ? banheirosMatch[1] : '';

    const vagasMatch = text.match(/(\d+)\s*(?:vagas?|garagens?|carros?)/i);
    const vagas = vagasMatch ? vagasMatch[1] : '';

    const areaMatch = text.match(/(\d+[\.,]?\d*)\s*(?:m²|m2|metros|metragem)/i);
    const area = areaMatch ? areaMatch[1].replace(',', '.') : '';

    // 9. Diferenciais Detectados
    const diferenciais = [];
    if (lower.includes('piscina')) diferenciais.push('Piscina');
    if (lower.includes('gourmet') || lower.includes('churrasqueira')) {
      diferenciais.push('Área Gourmet');
      diferenciais.push('Churrasqueira');
    }
    if (lower.includes('academia') || lower.includes('fitness')) diferenciais.push('Academia');
    if (lower.includes('elevador')) diferenciais.push('Elevador');
    if (lower.includes('energia solar') || lower.includes('fotovoltaica')) diferenciais.push('Energia Solar');
    if (lower.includes('ar condicionado') || lower.includes('ar-condicionado')) diferenciais.push('Ar-condicionado');
    if (lower.includes('portaria 24h') || lower.includes('portaria')) diferenciais.push('Portaria 24h');
    if (lower.includes('varanda') || lower.includes('sacada')) diferenciais.push('Varanda');
    if (lower.includes('pet') || lower.includes('aceita pet')) diferenciais.push('Aceita Pet');
    if (lower.includes('armário') || lower.includes('closet')) diferenciais.push('Closet');
    if (lower.includes('quintal') || lower.includes('jardim')) diferenciais.push('Quintal');

    // 10. Documentação Detectada
    const documentacao = [];
    if (lower.includes('matrícula') || lower.includes('matricula')) documentacao.push('Possui Matrícula Individual');
    if (lower.includes('escritura')) documentacao.push('Escritura Pública');
    if (lower.includes('registro') || lower.includes('cartório')) documentacao.push('Registro em Cartório');
    if (lower.includes('habite-se') || lower.includes('habitese')) documentacao.push('Habite-se');
    if (lower.includes('financiamento') || lower.includes('financiado')) documentacao.push('Imóvel Financiado / Consórcio');

    const titulo = `${tipo} ${quartos ? `${quartos} quartos` : ''} no ${bairro || 'Centro'} - Caratinga`.trim();

    let desc = text.trim();
    if (!desc || desc.length < 20) {
      desc = `Excelente oportunidade de ${tipo.toLowerCase()} para ${finalidade.toLowerCase()} no bairro ${bairro || 'Centro'} em Caratinga. Imóvel com ${quartos || 'vários'} quartos, ${banheiros || 'banheiro social'} e ${vagas || 'espaço para'} garagem. Próximo ao comércio e fácil acesso. Agende já uma visita com a equipe Araújo Imóveis!`;
    }

    return {
      nomeProprietario: nomeProprietario || 'Proprietário a Definir',
      telefoneProprietario: telefone,
      emailProprietario: email,
      tipo,
      uso: 'Residencial',
      finalidade,
      finalidadeSite: finalidade === 'Venda' ? 'comprar' : (finalidade === 'Permuta' ? 'permuta' : 'alugar'),
      status: 'Disponível',
      titulo,
      cep,
      endereco: endereco || '',
      numero,
      bairro: bairro || 'Centro',
      cidade: 'Caratinga',
      estado: 'MG',
      valorImovel,
      valorCondominio,
      iptuAnual,
      areaConstruida: area,
      areaTotal: area,
      quartos,
      suites,
      banheiros,
      vagas,
      diferenciais: [...new Set(diferenciais)],
      documentacao: [...new Set(documentacao)],
      descricao: desc,
      fotos: photos || []
    };
  };

  // Main Extraction Handler
  const handleProcessWithAI = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setExtractedData(null);
    setProcessingStep('Iniciando análise dos arquivos e anotações...');

    try {
      // 1. Gather all photos and texts
      const photos = attachedFiles
        .filter(f => f.type.startsWith('image/') && f.dataUrl)
        .map(f => f.dataUrl);

      setExtractedPhotos(photos);

      const textChunks = [];
      if (rawText.trim()) {
        textChunks.push(`[TEXTO E ANOTAÇÕES DO USUÁRIO]:\n${rawText.trim()}`);
      }

      attachedFiles.forEach((f, idx) => {
        textChunks.push(`[ARQUIVO ${idx + 1}: ${f.name} (${f.type})]:`);
        if (f.textContent) {
          textChunks.push(f.textContent.substring(0, 10000));
        } else if (f.type.startsWith('image/')) {
          textChunks.push(`(Foto/Imagem anexada: ${f.name})`);
        }
      });

      const fullCombinedText = textChunks.join('\n\n');

      if (!fullCombinedText.trim() && photos.length === 0) {
        throw new Error('Por favor, anexe ao menos um arquivo (PDF, imagem, documento) ou cole algum texto com informações do imóvel.');
      }

      setProcessingStep('Lendo documentos com Inteligência Artificial...');

      const systemPrompt = `Você é um assistente de IA especializado em cadastros imobiliários da imobiliária Araújo Imóveis (Caratinga - MG).
Analise todos os documentos, textos de WhatsApp, contratos, fotos, certidões ou anotações fornecidas e extraia TODOS os dados disponíveis do imóvel.
Se um campo não for mencionado ou estiver incerto, retorne vazio "" ou boolean false.
Retorne EXCLUSIVAMENTE um objeto JSON estrito com as seguintes chaves:
{
  "nomeProprietario": string,
  "telefoneProprietario": string,
  "emailProprietario": string,
  "tipo": "Casa" | "Apartamento" | "Fazenda" | "Empresa / Galpão" | "Lote/Terreno" | "Comercial" | "Chácara/Sítio" | "Cobertura" | "Sobrado" | "Outro",
  "tipoOutro": string,
  "uso": "Residencial" | "Comercial" | "Residencial ou comercial" | "Outro",
  "usoOutro": string,
  "finalidade": "Locação" | "Venda" | "Venda e Locação" | "Permuta" | "Outro",
  "finalidadeOutro": string,
  "status": "Disponível" | "Em Negociação" | "Vendido/Alugado" | "Pausado" | "Outro",
  "statusOutro": string,
  "titulo": string,
  "cep": string,
  "endereco": string,
  "numero": string,
  "complemento": string,
  "bairro": string,
  "cidade": string,
  "estado": string,
  "condominio": string,
  "valorImovel": string,
  "valorCondominio": string,
  "iptuAnual": string,
  "areaTotal": string,
  "areaConstruida": string,
  "quartos": string,
  "suites": string,
  "banheiros": string,
  "vagas": string,
  "salas": string,
  "copas": string,
  "cozinhas": string,
  "lavabos": string,
  "porteiraFechada": boolean,
  "diferenciais": string[], // Selecione entre: ['Piscina', 'Área Gourmet', 'Churrasqueira', 'Academia', 'Playground', 'Quadra', 'Portaria 24h', 'Elevador', 'Energia Solar', 'Ar-condicionado', 'Closet', 'Escritório', 'Lavanderia', 'Jardim', 'Sacada', 'Varanda', 'Internet Fibra', 'Segurança 24h', 'Câmeras', 'Cerca Elétrica', 'Terraço', 'Quintal', 'Aceita Pet', 'Espaço Pet']
  "diferenciaisOutro": string,
  "documentacao": string[], // Selecione entre: ['Possui Matrícula Individual', 'Escritura Pública', 'Registro em Cartório', 'Contrato de Compra e Venda', 'Em Inventário', 'Imóvel Financiado / Consórcio', 'Somente Posse', 'Habite-se']
  "documentacaoOutro": string,
  "descricao": string
}`;

      let aiResultJson = null;

      // 2. Execute via Gemini API if key is available
      if (aiProvider === 'gemini' && aiApiKey?.trim()) {
        setProcessingStep('Consultando Google Gemini Multimodal...');
        const cleanKey = aiApiKey.trim();
        const modelTarget = aiModel || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelTarget}:generateContent?key=${cleanKey}`;

        const parts = [{ text: `${systemPrompt}\n\n${fullCombinedText}` }];

        // Attach up to 4 images to Gemini Vision
        for (const f of attachedFiles.filter(item => item.type.startsWith('image/') && item.dataUrl).slice(0, 4)) {
          const b64 = f.dataUrl.includes('base64,') ? f.dataUrl.split('base64,')[1] : f.dataUrl;
          parts.push({
            inlineData: {
              mimeType: f.type || 'image/jpeg',
              data: b64
            }
          });
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        });

        if (res.ok) {
          const json = await res.json();
          const rawTextContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawTextContent) {
            aiResultJson = JSON.parse(rawTextContent);
          }
        }
      } 
      // 3. Execute via OpenAI / Groq if key is available
      else if ((aiProvider === 'openai' || aiProvider === 'groq') && aiApiKey?.trim()) {
        setProcessingStep(`Consultando ${aiProvider === 'groq' ? 'Groq' : 'OpenAI'}...`);
        const endpoint = aiProvider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';

        const modelTarget = aiModel || (aiProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o');

        const userMessages = [{ type: 'text', text: fullCombinedText }];
        for (const f of attachedFiles.filter(item => item.type.startsWith('image/') && item.dataUrl).slice(0, 3)) {
          userMessages.push({
            type: 'image_url',
            image_url: { url: f.dataUrl }
          });
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: modelTarget,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessages }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1
          })
        });

        if (res.ok) {
          const json = await res.json();
          const content = json?.choices?.[0]?.message?.content;
          if (content) {
            aiResultJson = JSON.parse(content);
          }
        }
      }

      // 4. Fallback to intelligent local heuristic if no key or error
      if (!aiResultJson) {
        setProcessingStep('Aplicando motor inteligente de extração...');
        aiResultJson = extractWithLocalHeuristics(fullCombinedText, photos);
      }

      // Merge photos
      aiResultJson.fotos = photos;
      setExtractedData(aiResultJson);
      setProcessingStep('');
    } catch (err) {
      console.error("Erro no processamento da IA:", err);
      setErrorMessage(err.message || 'Ocorreu um erro ao processar os arquivos com IA. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and Apply Data to the Form
  const handleApply = () => {
    if (!extractedData) return;

    if (onApply) {
      onApply(extractedData);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--glass-border)',
        backgroundColor: 'var(--bg-secondary)',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--glass-highlight)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Preenchimento Automático por IA
                <span style={{ fontSize: '0.68rem', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: 'var(--glass-highlight)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
                  Inteligente
                </span>
              </h2>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Envie documentos (PDF, matrícula, IPTU), fotos do imóvel ou texto livre e a IA preencherá o cadastro.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary" 
            style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'upload' ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: activeTab === 'upload' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'upload' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: activeTab === 'upload' ? '1px solid var(--text-primary)' : '1px solid transparent'
              }}
            >
              <Upload size={16} /> Arquivos & Fotos ({attachedFiles.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'text' ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: activeTab === 'text' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'text' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: activeTab === 'text' ? '1px solid var(--text-primary)' : '1px solid transparent'
              }}
            >
              <FileText size={16} /> Colar Texto / Anotações
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'config' ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: 'auto',
                backgroundColor: activeTab === 'config' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'config' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: activeTab === 'config' ? '1px solid var(--text-primary)' : '1px solid transparent'
              }}
            >
              <Sliders size={15} /> Provedor IA ({aiProvider.toUpperCase()})
            </button>
          </div>

          {/* TAB 1: UPLOAD DE ARQUIVOS */}
          {activeTab === 'upload' && (
            <div>
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--glass-highlight)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  marginBottom: '1rem'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--text-primary)'
                }}>
                  <Upload size={24} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Clique ou arraste documentos e fotos do imóvel aqui
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Formatos aceitos: <strong>PDF (Matrícula, IPTU, Contrato, Vistoria)</strong>, <strong>Fotos (JPG, PNG, WEBP)</strong> e <strong>Textos (TXT, DOCX)</strong>
                </p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept=".pdf,.txt,.doc,.docx,.csv,.json,image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
              </div>

              {/* Arquivos anexados list */}
              {attachedFiles.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Arquivos Anexados ({attachedFiles.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <span>📄 {docsCount} Documento(s)</span>
                      <span>🖼️ {photosCount} Foto(s)</span>
                    </div>
                  </div>

                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    {attachedFiles.map((file) => (
                      <div key={file.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--glass-highlight)',
                        border: '1px solid var(--glass-border)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                          {file.type.startsWith('image/') ? (
                            <img src={file.dataUrl} alt={file.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <File size={16} style={{ color: 'var(--text-secondary)' }} />
                          )}
                          <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remover arquivo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COLAR TEXTO */}
          {activeTab === 'text' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Cole aqui mensagem de WhatsApp, descrição do anúncio ou notas:
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <Clipboard size={12} /> Colar da Área de Transferência
                </button>
              </div>
              <textarea
                rows={8}
                className="form-input"
                placeholder="Exemplo: Casa no bairro Centro em Caratinga com 3 quartos, sendo 1 suíte, 2 banheiros e 2 vagas de garagem. Área construída de 180m². Proprietário Carlos Silva (33) 99999-0000. Valor do aluguel R$ 1.800 + IPTU de R$ 90. Possui piscina, churrasqueira e ar-condicionado..."
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
              />
            </div>
          )}

          {/* TAB 3: CONFIGURAÇÃO DE IA */}
          {activeTab === 'config' && (
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={16} style={{ color: 'var(--accent-cyan)' }} /> Configuração do Motor de Inteligência Artificial
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                O sistema utiliza automaticamente a inteligência artificial configurada nas Configurações do CRM. Caso não informe chave de API, nosso extrator semântico local inteligente atuará automaticamente.
              </p>

              <div className="form-grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Provedor de IA:</label>
                  <select 
                    className="form-input"
                    value={aiProvider}
                    onChange={e => {
                      const val = e.target.value;
                      setAiProvider(val);
                      localStorage.setItem('crmbase_sdr_provider', val);
                      if (val === 'gemini') setAiModel('gemini-2.5-flash');
                      else if (val === 'openai') setAiModel('gpt-4o');
                      else if (val === 'groq') setAiModel('llama-3.3-70b-versatile');
                    }}
                  >
                    <option value="gemini">Google Gemini (Recomendado - Multimodal)</option>
                    <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                    <option value="groq">Groq (Ultra-Rápido)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Modelo:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aiModel} 
                    onChange={e => setAiModel(e.target.value)} 
                    placeholder="Ex: gemini-2.5-flash ou gpt-4o"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Chave de API ({aiProvider.toUpperCase()} API Key):</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Cole sua chave de API aqui se desejar atualizar..."
                    value={aiApiKey}
                    onChange={e => {
                      setAiApiKey(e.target.value);
                      localStorage.setItem('crmbase_sdr_apikey', e.target.value);
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Sua chave fica salva de forma segura localmente no seu navegador.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Erro Banner */}
          {errorMessage && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Estado de Processamento */}
          {isProcessing && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--glass-border)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-block', animation: 'spin 1.2s linear infinite', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                <RefreshCw size={26} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                {processingStep || 'Processando com Inteligência Artificial...'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Por favor, aguarde enquanto extraímos dados cadastrais, endereço, valores e fotos.
              </p>
            </div>
          )}

          {/* PRÉVIA DOS DADOS EXTRAÍDOS PELA IA */}
          {extractedData && !isProcessing && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-success)' }} />
                  <span>Dados Extraídos com Sucesso pela IA</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {extractedPhotos.length} foto(s) identificada(s)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ backgroundColor: 'var(--glass-highlight)', border: '1px solid var(--glass-border)', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>PROPRIETÁRIO:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{extractedData.nomeProprietario || 'Não detectado'}</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {extractedData.telefoneProprietario || 'Sem telefone'}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--glass-highlight)', border: '1px solid var(--glass-border)', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>IMÓVEL & FINALIDADE:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{extractedData.tipo || 'Casa'} ({extractedData.finalidade || 'Locação'})</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {extractedData.titulo || 'Título gerado'}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--glass-highlight)', border: '1px solid var(--glass-border)', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>LOCALIZAÇÃO:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{extractedData.bairro || 'Centro'}, {extractedData.cidade || 'Caratinga'}</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {extractedData.endereco ? `${extractedData.endereco}${extractedData.numero ? ', ' + extractedData.numero : ''}` : 'Endereço a complementar'}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--glass-highlight)', border: '1px solid var(--glass-border)', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>VALORES & CARACTERÍSTICAS:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{extractedData.valorImovel || 'Valor a definir'}</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {extractedData.quartos || '0'} Qts • {extractedData.banheiros || '0'} Banh • {extractedData.vagas || '0'} Vagas
                  </div>
                </div>
              </div>

              {/* Diferenciais detectados */}
              {Array.isArray(extractedData.diferenciais) && extractedData.diferenciais.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Diferenciais:</span>
                  {extractedData.diferenciais.map(d => (
                    <span key={d} style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--glass-highlight)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
                      ✓ {d}
                    </span>
                  ))}
                </div>
              )}

              {/* Miniaturas das Fotos Extraídas */}
              {extractedPhotos.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.3rem' }}>
                    Fotos que serão adicionadas ao cadastro ({extractedPhotos.length}):
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
                    {extractedPhotos.map((photo, i) => (
                      <img key={i} src={photo} alt={`Foto ${i + 1}`} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--glass-highlight)'
        }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary"
            disabled={isProcessing}
          >
            Cancelar
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!extractedData ? (
              <button
                type="button"
                onClick={handleProcessWithAI}
                disabled={isProcessing || (attachedFiles.length === 0 && !rawText.trim())}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: (attachedFiles.length === 0 && !rawText.trim()) ? 0.6 : 1
                }}
              >
                <Sparkles size={16} />
                {isProcessing ? 'Analisando Arquivos...' : 'Processar e Preencher com IA'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Check size={18} />
                Aplicar ao Cadastro do Imóvel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
