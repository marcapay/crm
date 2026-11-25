import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ModalPreenchimentoIA from './ModalPreenchimentoIA';
import { 
  applyWatermarkToImage, 
  applyWatermarkToMultipleImages, 
  getWatermarkSettings, 
  saveWatermarkSettings 
} from '../utils/watermark';
import { 
  Building, 
  User, 
  MapPin, 
  DollarSign, 
  Layers, 
  Sparkles, 
  FileText, 
  FileCheck, 
  Camera, 
  Lock, 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Video, 
  Compass,
  Upload,
  Check,
  Globe,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Eye
} from 'lucide-react';

const DIFERENCIAIS_LIST = [
  'Piscina',
  'Área Gourmet',
  'Churrasqueira',
  'Academia',
  'Playground',
  'Quadra',
  'Portaria 24h',
  'Elevador',
  'Energia Solar',
  'Ar-condicionado',
  'Closet',
  'Escritório',
  'Lavanderia',
  'Jardim',
  'Sacada',
  'Varanda',
  'Internet Fibra',
  'Segurança 24h',
  'Câmeras',
  'Cerca Elétrica',
  'Terraço',
  'Quintal',
  'Aceita Pet',
  'Espaço Pet',
  'Outro'
];

const DOCUMENTACAO_LIST = [
  'Possui Matrícula Individual',
  'Escritura Pública',
  'Registro em Cartório',
  'Contrato de Compra e Venda',
  'Em Inventário',
  'Imóvel Financiado / Consórcio',
  'Somente Posse',
  'Habite-se',
  'Outro'
];

export default function FormCadastroImovel({ onBack, onSaved }) {
  const { properties = [], setProperties, profile, registerActivityLog, clients = [], addClient } = useApp();

  const [loadingCep, setLoadingCep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Watermark States
  const [watermarkConfig, setWatermarkConfig] = useState(getWatermarkSettings);
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [watermarkProgress, setWatermarkProgress] = useState({ current: 0, total: 0 });
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleUpdateWatermarkConfig = (updates) => {
    const updated = saveWatermarkSettings(updates);
    setWatermarkConfig(updated);
  };

  // Initial State based on elooscrmimobiliario.com.br/cadastro-imovel
  const [formData, setFormData] = useState({
    // 1. Dados do Proprietário
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',

    // 2. Informações do Imóvel
    codigo: '',
    tipo: 'Casa',
    tipoOutro: '',
    uso: 'Residencial',
    usoOutro: '',
    finalidadeImovel: 'Para locação', // 'Para locação' | 'Para venda' | 'Para venda e locação'
    statusComercial: 'Disponível para locação', // 9 classificações do ciclo de vida
    finalidade: 'Locação',
    finalidadeOutro: '',
    finalidadeSite: 'alugar',
    finalidadeSiteOutro: '',
    publicarNoSite: true,
    status: 'Disponível',
    statusOutro: '',
    titulo: '',
    destaque: false,
    exclusividade: false,

    // 3. Localização
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Caratinga',
    estado: 'MG',
    condominio: '',
    quadra: '',
    lote: '',
    linkMaps: '',
    mostrarEnderecoExato: true,

    // 4. Valores e Negociação
    valorImovel: '',
    valorCondominio: '',
    iptuAnual: '',
    taxasExtras: '',
    mostrarValoresFicha: true,
    entradaMinima: '',
    qtdParcelas: '',
    valorParcela: '',
    comissaoPercent: '5',
    comissaoValor: '',
    aceitaFinanciamento: false,
    aceitaFgts: false,
    aceitaPermuta: false,
    aceitaVeiculo: false,
    parcelamentoDireto: false,

    // 5. Características do Imóvel
    areaTotal: '',
    areaConstruida: '',
    quartos: '',
    suites: '',
    banheiros: '',
    vagas: '',
    salas: '',
    copas: '',
    cozinhas: '',
    lavabos: '',
    porteiraFechada: false,
    conjugado: false,
    geminada: false,

    // 6. Diferenciais (Lazer e Estrutura)
    diferenciais: [],
    diferenciaisOutro: '',

    // 7. Descrição e Textos
    descricao: '',

    // 8. Documentação
    documentacao: [],
    documentacaoOutro: '',

    // 9. Fotos e Mídias
    fotos: [],
    linkYoutube: '',
    linkTourVirtual: '',

    // 10. Documentos Internos (Privado)
    observacoesInternas: '',
    aceitouTermos: true
  });

  // Auto-generate code
  useEffect(() => {
    const nextNumber = (properties?.length || 0) + 1;
    const generated = `IM-${String(nextNumber).padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, codigo: generated }));
  }, [properties]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto calculate commission value if valorImovel or comissaoPercent changes
      if (field === 'valorImovel' || field === 'comissaoPercent') {
        const valNum = parseFloat(String(field === 'valorImovel' ? value : updated.valorImovel).replace(/\D/g, '')) || 0;
        const comPerc = parseFloat(String(field === 'comissaoPercent' ? value : updated.comissaoPercent)) || 0;
        if (valNum > 0 && comPerc > 0) {
          const comTotal = (valNum * comPerc) / 100;
          updated.comissaoValor = `R$ ${comTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }

      // Auto calculate installment value if qtdParcelas and valorImovel/entradaMinima
      if (field === 'qtdParcelas' || field === 'entradaMinima' || field === 'valorImovel') {
        const valNum = parseFloat(String(updated.valorImovel).replace(/\D/g, '')) || 0;
        const entNum = parseFloat(String(updated.entradaMinima).replace(/\D/g, '')) || 0;
        const parcQtd = parseInt(updated.qtdParcelas, 10) || 0;
        if (parcQtd > 0 && valNum > entNum) {
          const saldo = valNum - entNum;
          const parcela = saldo / parcQtd;
          updated.valorParcela = `R$ ${parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }

      return updated;
    });
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  // CEP Lookup via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = (formData.cep || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Generate Google Maps link automatically from address
  const handleGenerateMapsLink = () => {
    const query = `${formData.endereco || ''}, ${formData.numero || ''} - ${formData.bairro || ''}, ${formData.cidade || 'Caratinga'} - ${formData.estado || 'MG'}`.trim();
    if (query) {
      const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      handleChange('linkMaps', link);
    }
  };

  // Photo upload with automatic Araújo Imóveis watermark
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsWatermarking(true);
    setWatermarkProgress({ current: 0, total: files.length });

    try {
      const readFilesPromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const rawDataUrls = (await Promise.all(readFilesPromises)).filter(Boolean);

      let processedUrls = rawDataUrls;
      if (watermarkConfig.enabled) {
        processedUrls = await applyWatermarkToMultipleImages(
          rawDataUrls,
          watermarkConfig,
          (curr, tot) => setWatermarkProgress({ current: curr, total: tot })
        );
      }

      setFormData(prev => ({
        ...prev,
        fotos: [...(prev.fotos || []), ...processedUrls]
      }));

      setSuccessToast(
        watermarkConfig.enabled
          ? `✓ ${processedUrls.length} foto(s) adicionada(s) com a Marca d'Água oficial da Araújo Imóveis!`
          : `✓ ${processedUrls.length} foto(s) adicionada(s)!`
      );
      setTimeout(() => setSuccessToast(''), 4500);
    } catch (err) {
      console.error('Erro no upload de fotos:', err);
    } finally {
      setIsWatermarking(false);
      setWatermarkProgress({ current: 0, total: 0 });
      if (e.target) e.target.value = '';
    }
  };

  // Reapply watermark to existing photos
  const handleReapplyWatermarks = async () => {
    const currentPhotos = formData.fotos || [];
    if (currentPhotos.length === 0) return;

    setIsWatermarking(true);
    setWatermarkProgress({ current: 0, total: currentPhotos.length });

    try {
      const reprocessed = await applyWatermarkToMultipleImages(
        currentPhotos,
        watermarkConfig,
        (curr, tot) => setWatermarkProgress({ current: curr, total: tot })
      );

      setFormData(prev => ({
        ...prev,
        fotos: reprocessed
      }));

      setSuccessToast(`✓ Marca d'água reaplicada com sucesso em ${reprocessed.length} foto(s)!`);
      setTimeout(() => setSuccessToast(''), 4500);
    } catch (err) {
      console.error('Erro ao reaplicar marca dágua:', err);
    } finally {
      setIsWatermarking(false);
      setWatermarkProgress({ current: 0, total: 0 });
    }
  };

  const handleRemovePhoto = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      fotos: (prev.fotos || []).filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleSetMainPhoto = (idxToMain) => {
    setFormData(prev => {
      const current = [...(prev.fotos || [])];
      const [chosen] = current.splice(idxToMain, 1);
      return {
        ...prev,
        fotos: [chosen, ...current]
      };
    });
  };

  // Handler to receive structured data from AI Preenchimento
  const handleApplyAiData = async (aiData) => {
    if (!aiData) return;

    let incomingPhotos = Array.isArray(aiData.fotos) ? aiData.fotos : [];
    if (incomingPhotos.length > 0 && watermarkConfig.enabled) {
      try {
        setIsWatermarking(true);
        setWatermarkProgress({ current: 0, total: incomingPhotos.length });
        incomingPhotos = await applyWatermarkToMultipleImages(
          incomingPhotos,
          watermarkConfig,
          (curr, tot) => setWatermarkProgress({ current: curr, total: tot })
        );
      } catch (err) {
        console.warn('Erro ao carimbar fotos da IA:', err);
      } finally {
        setIsWatermarking(false);
        setWatermarkProgress({ current: 0, total: 0 });
      }
    }

    setFormData(prev => {
      const updated = { ...prev };

      // 1. Proprietário
      if (aiData.nomeProprietario) updated.nomeProprietario = aiData.nomeProprietario;
      if (aiData.telefoneProprietario) updated.telefoneProprietario = aiData.telefoneProprietario;
      if (aiData.emailProprietario) updated.emailProprietario = aiData.emailProprietario;

      // 2. Informações do Imóvel
      if (aiData.tipo) updated.tipo = aiData.tipo;
      if (aiData.tipoOutro) updated.tipoOutro = aiData.tipoOutro;
      if (aiData.uso) updated.uso = aiData.uso;
      if (aiData.usoOutro) updated.usoOutro = aiData.usoOutro;
      if (aiData.finalidade) updated.finalidade = aiData.finalidade;
      if (aiData.finalidadeOutro) updated.finalidadeOutro = aiData.finalidadeOutro;
      if (aiData.finalidadeSite) updated.finalidadeSite = aiData.finalidadeSite;
      if (aiData.status) updated.status = aiData.status;
      if (aiData.statusOutro) updated.statusOutro = aiData.statusOutro;
      if (aiData.titulo) updated.titulo = aiData.titulo;

      // 3. Localização
      if (aiData.cep) updated.cep = aiData.cep;
      if (aiData.endereco) updated.endereco = aiData.endereco;
      if (aiData.numero) updated.numero = aiData.numero;
      if (aiData.complemento) updated.complemento = aiData.complemento;
      if (aiData.bairro) updated.bairro = aiData.bairro;
      if (aiData.cidade) updated.cidade = aiData.cidade;
      if (aiData.estado) updated.estado = aiData.estado;
      if (aiData.condominio) updated.condominio = aiData.condominio;

      // 4. Valores
      if (aiData.valorImovel) updated.valorImovel = aiData.valorImovel;
      if (aiData.valorCondominio) updated.valorCondominio = aiData.valorCondominio;
      if (aiData.iptuAnual) updated.iptuAnual = aiData.iptuAnual;

      // 5. Características
      if (aiData.areaTotal) updated.areaTotal = aiData.areaTotal;
      if (aiData.areaConstruida) updated.areaConstruida = aiData.areaConstruida;
      if (aiData.quartos) updated.quartos = aiData.quartos;
      if (aiData.suites) updated.suites = aiData.suites;
      if (aiData.banheiros) updated.banheiros = aiData.banheiros;
      if (aiData.vagas) updated.vagas = aiData.vagas;
      if (aiData.salas) updated.salas = aiData.salas;
      if (aiData.copas) updated.copas = aiData.copas;
      if (aiData.cozinhas) updated.cozinhas = aiData.cozinhas;
      if (aiData.lavabos) updated.lavabos = aiData.lavabos;
      if (aiData.porteiraFechada !== undefined) updated.porteiraFechada = aiData.porteiraFechada;

      // 6. Diferenciais & Documentação
      if (Array.isArray(aiData.diferenciais) && aiData.diferenciais.length > 0) {
        updated.diferenciais = [...new Set([...(prev.diferenciais || []), ...aiData.diferenciais])];
      }
      if (aiData.diferenciaisOutro) updated.diferenciaisOutro = aiData.diferenciaisOutro;

      if (Array.isArray(aiData.documentacao) && aiData.documentacao.length > 0) {
        updated.documentacao = [...new Set([...(prev.documentacao || []), ...aiData.documentacao])];
      }
      if (aiData.documentacaoOutro) updated.documentacaoOutro = aiData.documentacaoOutro;

      // 7. Descrição
      if (aiData.descricao) updated.descricao = aiData.descricao;

      // 9. Fotos
      if (Array.isArray(aiData.fotos) && aiData.fotos.length > 0) {
        updated.fotos = [...new Set([...(prev.fotos || []), ...aiData.fotos])];
      }

      return updated;
    });

    // Auto-lookup ViaCEP if 8 digits CEP is extracted
    const cleanCep = (aiData.cep || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              endereco: prev.endereco || data.logradouro || '',
              bairro: prev.bairro || data.bairro || '',
              cidade: prev.cidade || data.localidade || 'Caratinga',
              estado: prev.estado || data.uf || 'MG'
            }));
          }
        })
        .catch(e => console.warn("ViaCEP error after AI:", e));
    }

    setSuccessToast('✓ Dados e fotos do imóvel preenchidos automaticamente com Inteligência Artificial!');
    setTimeout(() => setSuccessToast(''), 4500);
  };

  // Submit Handler with direct publication to araujoimoveiscaratinga.com.br
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nomeProprietario?.trim()) {
      setErrorToast('Por favor, informe o Nome Completo do Proprietário.');
      return;
    }

    if (!formData.tipo?.trim()) {
      setErrorToast('Por favor, selecione o Tipo do Imóvel.');
      return;
    }

    setIsSaving(true);

    const cleanCode = (formData.codigo || `IM-${Date.now()}`).toUpperCase().replace(/^#+/, '');
    const cleanType = (formData.tipo === 'Outro' && formData.tipoOutro?.trim())
      ? formData.tipoOutro.trim()
      : (formData.tipo || 'Casa');
    const cleanUso = (formData.uso === 'Outro' && formData.usoOutro?.trim())
      ? formData.usoOutro.trim()
      : (formData.uso || 'Residencial');
    const cleanCity = (formData.cidade || 'Caratinga').trim();
    const cleanNeighborhood = (formData.bairro || 'Centro').trim();
    const cleanAddress = formData.mostrarEnderecoExato
      ? `${formData.endereco || ''}${formData.numero ? ', ' + formData.numero : ''}${formData.complemento ? ' - ' + formData.complemento : ''} - ${cleanNeighborhood}, ${cleanCity} - ${formData.estado || 'MG'}`.trim()
      : `${cleanNeighborhood}, ${cleanCity} - ${formData.estado || 'MG'}`.trim();

    let transaction = 'alugar';
    const fin = (formData.finalidadeSite === 'Outro' && formData.finalidadeSiteOutro?.trim())
      ? formData.finalidadeSiteOutro.toLowerCase()
      : ((formData.finalidade === 'Outro' && formData.finalidadeOutro?.trim())
          ? formData.finalidadeOutro.toLowerCase()
          : (formData.finalidadeSite || formData.finalidade || '').toLowerCase());
    if (fin.includes('venda') && fin.includes('loca')) {
      transaction = 'venda-aluguel';
    } else if (fin.includes('venda') || fin.includes('compr')) {
      transaction = 'comprar';
    } else if (fin.includes('permuta')) {
      transaction = 'permuta';
    } else if (fin.includes('lança') || fin.includes('invest')) {
      transaction = 'lancamento';
    } else {
      transaction = 'alugar';
    }

    const priceNum = parseFloat(String(formData.valorImovel || '').replace(/\D/g, '')) || 0;
    const condoNum = parseFloat(String(formData.valorCondominio || '').replace(/\D/g, '')) || 0;
    const iptuNum = parseFloat(String(formData.iptuAnual || '').replace(/\D/g, '')) || 0;

    let desc = (formData.descricao || '').trim();
    if (!desc || desc.length < 15) {
      desc = `${formData.titulo || `${cleanType} disponível para ${transaction === 'comprar' ? 'venda' : 'locação'}`} localizado no bairro ${cleanNeighborhood}, em ${cleanCity}. Imóvel com ${formData.quartos || '0'} quarto(s), ${formData.banheiros || '0'} banheiro(s) e ${formData.vagas || '0'} vaga(s) de garagem. Excelente oportunidade com a credibilidade e garantia Araújo Imóveis.`;
    }

    const features = [
      `Imóvel tipo ${cleanType}`,
      `Uso: ${cleanUso}`,
      `Bairro ${cleanNeighborhood}`,
      formData.porteiraFechada ? 'Porteira Fechada' : null,
      formData.conjugado ? 'Conjugado' : null,
      formData.geminada ? 'Casa Geminada' : null,
      formData.aceitaFinanciamento ? 'Aceita Financiamento Bancário' : null,
      formData.aceitaFgts ? 'Aceita FGTS' : null,
      formData.aceitaPermuta ? 'Aceita Permuta' : null,
      formData.aceitaVeiculo ? 'Aceita Veículo na Negociação' : null,
      ...(Array.isArray(formData.diferenciais) ? formData.diferenciais.filter(d => d !== 'Outro') : []),
      (formData.diferenciais?.includes('Outro') && formData.diferenciaisOutro?.trim()) ? formData.diferenciaisOutro.trim() : null,
      ...(Array.isArray(formData.documentacao) ? formData.documentacao.filter(d => d !== 'Outro') : []),
      (formData.documentacao?.includes('Outro') && formData.documentacaoOutro?.trim()) ? formData.documentacaoOutro.trim() : null,
      'Atendimento Exclusivo Araújo Imóveis'
    ].filter(Boolean);

    const mainPhoto = (formData.fotos && formData.fotos.length > 0)
      ? formData.fotos[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop';

    const newProperty = {
      id: `prop_${Date.now()}`,
      title: formData.titulo || `${formData.tipo} - ${cleanNeighborhood}`,
      code: cleanCode,
      codigoImovel: cleanCode,
      address: cleanAddress,
      shortAddress: `${cleanNeighborhood}, ${cleanCity}`,
      photo: mainPhoto,
      status: formData.statusComercial || formData.status || 'Disponível',
      statusComercial: formData.statusComercial || 'Disponível para locação',
      finalidadeImovel: formData.finalidadeImovel || 'Para locação',
      statusOperacional: 'Liberado para nova locação',
      ownerName: formData.nomeProprietario,
      ownerPhone: formData.telefoneProprietario,
      rentValue: priceNum,
      condominiumValue: condoNum,
      iptuValue: iptuNum,
      publicarNoSite: formData.publicarNoSite !== false,
      createdAt: new Date().toISOString(),
      details: { ...formData }
    };

    // Publicação direta na API do site oficial (araujoimoveiscaratinga.com.br)
    const propPayload = {
      id: `imovel-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      code: cleanCode,
      codigoImovel: cleanCode,
      title: formData.titulo || `${cleanType} no ${cleanNeighborhood} - ${cleanCity}`,
      type: cleanType,
      transaction: transaction,
      finalidadeImovel: formData.finalidadeImovel || 'Para locação',
      statusComercial: formData.statusComercial || 'Disponível para locação',
      price: priceNum,
      condoFee: condoNum,
      iptu: iptuNum,
      city: cleanCity,
      neighborhood: cleanNeighborhood,
      address: cleanAddress,
      bedrooms: Number(formData.quartos) || 0,
      bathrooms: Number(formData.banheiros) || 0,
      suites: Number(formData.suites) || 0,
      parkingSpots: Number(formData.vagas) || 0,
      area: Number(formData.areaConstruida || formData.areaTotal) || 0,
      description: desc,
      features: features,
      images: Array.isArray(formData.fotos) && formData.fotos.length > 0 ? formData.fotos : [],
      featured: formData.destaque !== undefined ? Boolean(formData.destaque) : true,
      status: formData.status || 'Disponível',
      linkYoutube: formData.linkYoutube || '',
      linkTourVirtual: formData.linkTourVirtual || '',
      linkMaps: formData.linkMaps || '',
      nomeProprietario: formData.nomeProprietario || '',
      telefoneProprietario: formData.telefoneProprietario || '',
      corretorResponsavel: profile?.name || 'Araújo Imóveis',
      linkWhatsappCorretor: profile?.whatsapp || 'https://wa.me/5533999000000',
      publicarNoSite: formData.publicarNoSite !== false,
      origemCadastroImovel: true,
      details: { ...formData },
      createdAt: new Date().toISOString()
    };

    let sitePublished = false;
    if (formData.publicarNoSite !== false) {
      try {
        const siteRes = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propPayload)
        });
        if (siteRes.ok) sitePublished = true;
      } catch (err) {
        console.warn("Erro ao postar imóvel no site oficial:", err);
      }
    } else {
      try {
        await fetch(`/api/properties?id=${propPayload.id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn("Erro ao remover imóvel do site oficial:", err);
      }
    }

    // Save in context & localStorage
    if (typeof setProperties === 'function') {
      setProperties(prev => [newProperty, ...(prev || [])]);
    }

    // Save in standalone list for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('araujo_imoveis_cadastrados') || '[]');
      localStorage.setItem('araujo_imoveis_cadastrados', JSON.stringify([newProperty, ...existing]));
    } catch (err) {
      console.error("Erro ao salvar imóvel localmente:", err);
    }

    // Auto-create client as 'Proprietário' in CRM if not exists
    if (typeof addClient === 'function') {
      try {
        const currentClients = clients || [];
        const cleanPhone = (formData.telefoneProprietario || '').replace(/\D/g, '');
        const clientExists = currentClients.some(c => {
          const cPhone = (c.phone || '').replace(/\D/g, '');
          const cName = (c.name || '').trim().toLowerCase();
          return (cleanPhone && cPhone && (cPhone === cleanPhone || cPhone.slice(-8) === cleanPhone.slice(-8))) ||
                 (cName === formData.nomeProprietario?.trim().toLowerCase());
        });

        if (!clientExists) {
          addClient({
            name: formData.nomeProprietario.trim(),
            phone: formData.telefoneProprietario.trim(),
            email: formData.emailProprietario?.trim() || `proprietario_${cleanPhone || Date.now()}@araujoimoveis.com.br`,
            role: 'Proprietário',
            status: 'Novo Lead / Qualificação',
            tags: ['Cadastro Imóvel', cleanType, cleanNeighborhood],
            empreendimento: `${cleanType} - ${cleanNeighborhood}`,
            situacaoComercial: 'Imóvel Cadastrado',
            linkWhatsapp: cleanPhone ? `https://wa.me/55${cleanPhone}` : '',
            camposPersonalizados: {
              codigoImovel: cleanCode,
              tipoImovel: cleanType,
              bairro: cleanNeighborhood,
              cidade: cleanCity,
              valor: formData.valorImovel || ''
            }
          });
        }
      } catch (err) {
        console.warn("Erro ao auto-cadastrar proprietário em clientes:", err);
      }
    }

    if (typeof registerActivityLog === 'function') {
      registerActivityLog(profile?.name || 'Corretor', `Cadastrou o imóvel ${newProperty.code}: ${newProperty.title}${formData.publicarNoSite !== false ? ' e publicou no site oficial' : ''}`);
    }

    setIsSaving(false);
    setSuccessToast(
      formData.publicarNoSite !== false
        ? `Imóvel ${newProperty.code} salvo e publicado com sucesso no site oficial www.araujoimoveiscaratinga.com.br!`
        : `Imóvel ${newProperty.code} salvo com sucesso no CRM!`
    );

    setTimeout(() => {
      if (onSaved) onSaved(newProperty);
      else if (onBack) onBack();
    }, 1300);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Toast Notificações */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '0.9rem 1.8rem',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.45)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '700',
          fontSize: '1.05rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <CheckCircle2 size={24} style={{ color: '#ffffff' }} />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '0.9rem 1.8rem',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.45)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '700',
          fontSize: '0.95rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <AlertCircle size={22} style={{ color: '#ffffff' }} />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} /> Voltar para Lista
          </button>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building style={{ color: 'var(--accent-cyan)' }} size={26} />
            Cadastrar Novo Imóvel
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Cadastro completo de dados, localização, valores, fotos e documentação (padrão Eloos CRM).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => setShowAiModal(true)}
            className="btn btn-secondary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={16} /> Preencher com IA
          </button>
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', opacity: isSaving ? 0.7 : 1 }}
          >
            <Save size={16} /> {isSaving ? 'Salvando e Publicando...' : 'Salvar Imóvel'}
          </button>
        </div>
      </div>

      {/* Banner de Preenchimento Automático por IA */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--border-radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Preenchimento Automático com Inteligência Artificial</strong>
              <span style={{ fontSize: '0.68rem', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: 'var(--glass-highlight)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>NOVO</span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Adicione documentos (matrícula, IPTU, contratos em PDF), fotos do imóvel ou texto de WhatsApp. A IA lê e preenche todos os campos automaticamente.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={16} /> Preencher com IA
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ============================================================
            1. DADOS DO PROPRIETÁRIO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <User size={18} /> 1. Dados do Proprietário
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Nome Completo do Proprietário:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nome do dono do imóvel"
                value={formData.nomeProprietario} 
                onChange={e => handleChange('nomeProprietario', e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Telefone / WhatsApp:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="(37) 00000-0000"
                value={formData.telefoneProprietario} 
                onChange={e => handleChange('telefoneProprietario', e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            2. INFORMAÇÕES DO IMÓVEL
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Building size={18} /> 2. Informações do Imóvel
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Código (Automático):</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.codigo} 
                onChange={e => handleChange('codigo', e.target.value)} 
                style={{ fontWeight: '700', color: 'var(--accent-cyan)' }} 
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Tipo:</label>
              <select 
                className="form-input" 
                value={formData.tipo} 
                onChange={e => handleChange('tipo', e.target.value)}
              >
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Fazenda">Fazenda</option>
                <option value="Empresa / Galpão">Empresa / Galpão</option>
                <option value="Lote/Terreno">Lote/Terreno</option>
                <option value="Comercial">Comercial</option>
                <option value="Chácara/Sítio">Chácara/Sítio</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Sobrado">Sobrado</option>
                <option value="Outro">Outro</option>
              </select>
              {formData.tipo === 'Outro' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Qual o tipo do imóvel? (Digite aqui)" 
                    value={formData.tipoOutro || ''} 
                    onChange={e => handleChange('tipoOutro', e.target.value)} 
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Uso:</label>
              <select 
                className="form-input" 
                value={formData.uso} 
                onChange={e => handleChange('uso', e.target.value)}
              >
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Residencial ou comercial">Residencial ou comercial</option>
                <option value="Outro">Outro</option>
              </select>
              {formData.uso === 'Outro' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Qual o uso do imóvel? (Digite aqui)" 
                    value={formData.usoOutro || ''} 
                    onChange={e => handleChange('usoOutro', e.target.value)} 
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Finalidade do Imóvel:</label>
              <select 
                className="form-input" 
                value={formData.finalidadeImovel || 'Para locação'} 
                onChange={e => {
                  handleChange('finalidadeImovel', e.target.value);
                  handleChange('finalidade', e.target.value);
                }}
              >
                <option value="Para locação">Para locação</option>
                <option value="Para venda">Para venda</option>
                <option value="Para venda e locação">Para venda e locação</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Status Comercial:</label>
              <select 
                className="form-input" 
                value={formData.statusComercial || 'Disponível para locação'} 
                onChange={e => {
                  handleChange('statusComercial', e.target.value);
                  handleChange('status', e.target.value);
                }}
              >
                <option value="Disponível para locação">🟢 Disponível para locação</option>
                <option value="Disponível para venda">🟢 Disponível para venda</option>
                <option value="Disponível para venda e locação">🟢 Disponível para venda e locação</option>
                <option value="Reservado">🟡 Reservado</option>
                <option value="Em negociação">🔵 Em negociação</option>
                <option value="Alugado">🟣 Alugado</option>
                <option value="Vendido">🟣 Vendido</option>
                <option value="Temporariamente indisponível">⚪ Temporariamente indisponível</option>
                <option value="Retirado da carteira">🔴 Retirado da carteira</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Título do Anúncio (Opcional):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Casa de alto padrão com piscina em Interlagos"
                value={formData.titulo} 
                onChange={e => handleChange('titulo', e.target.value)} 
              />
            </div>

            <div className="form-group span-2" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.publicarNoSite !== false} 
                  onChange={e => handleChange('publicarNoSite', e.target.checked)} 
                />
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Publicar no Site Oficial (araujoimoveiscaratinga.com.br)</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.destaque} 
                  onChange={e => handleChange('destaque', e.target.checked)} 
                />
                <span>Imóvel em Destaque</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.exclusividade} 
                  onChange={e => handleChange('exclusividade', e.target.checked)} 
                />
                <span>Exclusividade</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. LOCALIZAÇÃO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <MapPin size={18} /> 3. Localização
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>CEP:</span>
                <a 
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                >
                  Não sei o CEP ↗
                </a>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Apenas números..."
                  value={formData.cep} 
                  onChange={e => handleChange('cep', e.target.value)} 
                  onBlur={handleCepBlur}
                />
                {loadingCep && (
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                    Buscando...
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Endereço:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Rua, Avenida, Praça..."
                value={formData.endereco} 
                onChange={e => handleChange('endereco', e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: 120 ou S/N"
                value={formData.numero} 
                onChange={e => handleChange('numero', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Bairro:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nome do bairro"
                value={formData.bairro} 
                onChange={e => handleChange('bairro', e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cidade:</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.cidade} 
                onChange={e => handleChange('cidade', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado:</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.estado} 
                onChange={e => handleChange('estado', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condomínio / Edifício:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nome do condomínio (opcional)"
                value={formData.condominio} 
                onChange={e => handleChange('condominio', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quadra / Lote:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Quadra"
                  value={formData.quadra} 
                  onChange={e => handleChange('quadra', e.target.value)} 
                />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Lote"
                  value={formData.lote} 
                  onChange={e => handleChange('lote', e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group span-2">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Link Google Maps / Waze:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={handleGenerateMapsLink}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    title="Preenche o link do Maps automaticamente com o endereço digitado"
                  >
                    Gerar Auto.
                  </button>
                  {formData.linkMaps && (
                    <a 
                      href={formData.linkMaps} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      Abrir no Maps ↗
                    </a>
                  )}
                </div>
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Cole aqui o link do Google Maps ou gere automaticamente..."
                value={formData.linkMaps} 
                onChange={e => handleChange('linkMaps', e.target.value)} 
              />
            </div>

            <div className="form-group span-2" style={{ paddingTop: '0.25rem' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.mostrarEnderecoExato} 
                  onChange={e => handleChange('mostrarEnderecoExato', e.target.checked)} 
                />
                <span>Mostrar Endereço Exato na Ficha (Para Parceiros/Clientes)</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            4. VALORES E NEGOCIAÇÃO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <DollarSign size={18} /> 4. Valores e Negociação
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Valor do Imóvel / Aluguel (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: R$ 2.500,00 ou 250000"
                value={formData.valorImovel} 
                onChange={e => handleChange('valorImovel', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condomínio (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.valorCondominio} 
                onChange={e => handleChange('valorCondominio', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">IPTU Anual (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.iptuAnual} 
                onChange={e => handleChange('iptuAnual', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Taxas Extras (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.taxasExtras} 
                onChange={e => handleChange('taxasExtras', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entrada Mínima (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.entradaMinima} 
                onChange={e => handleChange('entradaMinima', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qtd. Parcelas & Valor da Parcela:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ex: 12"
                  value={formData.qtdParcelas} 
                  onChange={e => handleChange('qtdParcelas', e.target.value)} 
                />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Calculado auto."
                  value={formData.valorParcela} 
                  onChange={e => handleChange('valorParcela', e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comissão (%):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: 5 ou 6"
                value={formData.comissaoPercent} 
                onChange={e => handleChange('comissaoPercent', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comissão (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Calculado auto."
                value={formData.comissaoValor} 
                onChange={e => handleChange('comissaoValor', e.target.value)} 
              />
            </div>

            <div className="form-group span-2" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaFinanciamento} 
                  onChange={e => handleChange('aceitaFinanciamento', e.target.checked)} 
                />
                <span>Aceita Financiamento</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaFgts} 
                  onChange={e => handleChange('aceitaFgts', e.target.checked)} 
                />
                <span>Aceita FGTS</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaPermuta} 
                  onChange={e => handleChange('aceitaPermuta', e.target.checked)} 
                />
                <span>Aceita Permuta</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaVeiculo} 
                  onChange={e => handleChange('aceitaVeiculo', e.target.checked)} 
                />
                <span>Aceita Veículo</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.parcelamentoDireto} 
                  onChange={e => handleChange('parcelamentoDireto', e.target.checked)} 
                />
                <span>Parcelamento direto com proprietário</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            5. CARACTERÍSTICAS DO IMÓVEL
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Layers size={18} /> 5. Características do Imóvel
          </h3>
          <div className="form-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="form-group">
              <label className="form-label">Área Total (m²):</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 250"
                value={formData.areaTotal} 
                onChange={e => handleChange('areaTotal', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Área Constr. (m²):</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 180"
                value={formData.areaConstruida} 
                onChange={e => handleChange('areaConstruida', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quartos:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 3"
                value={formData.quartos} 
                onChange={e => handleChange('quartos', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Suítes:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.suites} 
                onChange={e => handleChange('suites', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banheiros:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 2"
                value={formData.banheiros} 
                onChange={e => handleChange('banheiros', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vagas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 2"
                value={formData.vagas} 
                onChange={e => handleChange('vagas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.salas} 
                onChange={e => handleChange('salas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Copas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.copas} 
                onChange={e => handleChange('copas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cozinhas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.cozinhas} 
                onChange={e => handleChange('cozinhas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lavabos:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.lavabos} 
                onChange={e => handleChange('lavabos', e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={formData.porteiraFechada} 
                onChange={e => handleChange('porteiraFechada', e.target.checked)} 
              />
              <span>Imóvel 100% Mobiliado (Porteira Fechada)</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={formData.conjugado} 
                onChange={e => handleChange('conjugado', e.target.checked)} 
              />
              <span>Conjugado</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={formData.geminada} 
                onChange={e => handleChange('geminada', e.target.checked)} 
              />
              <span>Geminada</span>
            </label>
          </div>
        </div>

        {/* ============================================================
            6. DIFERENCIAIS (LAZER E ESTRUTURA)
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Sparkles size={18} /> 6. Diferenciais (Lazer e Estrutura)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
            Clique sobre os itens presentes no imóvel para adicioná-los à ficha e anúncios:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {DIFERENCIAIS_LIST.map((item) => {
              const selected = (formData.diferenciais || []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleArrayItem('diferenciais', item)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    backgroundColor: selected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    border: selected ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                  }}
                >
                  {selected && <Check size={13} />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
          {(formData.diferenciais || []).includes('Outro') && (
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '600px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                Especifique outro diferencial:
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Sauna, Campo de futebol, Vista panorâmica..." 
                value={formData.diferenciaisOutro || ''} 
                onChange={e => handleChange('diferenciaisOutro', e.target.value)} 
                autoFocus
              />
            </div>
          )}
        </div>

        {/* ============================================================
            7. DESCRIÇÃO E TEXTOS
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <FileText size={18} /> 7. Descrição e Textos
          </h3>
          <div className="form-group">
            <label className="form-label">Descrição Completa:</label>
            <textarea 
              rows={5}
              className="form-input" 
              placeholder="Texto detalhado do imóvel (destaques, localização, acabamentos, iluminação, ventilação, condições de locação ou venda)..."
              value={formData.descricao} 
              onChange={e => handleChange('descricao', e.target.value)} 
            />
          </div>
        </div>

        {/* ============================================================
            8. DOCUMENTAÇÃO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <FileCheck size={18} /> 8. Documentação
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {DOCUMENTACAO_LIST.map((doc) => {
              const checked = (formData.documentacao || []).includes(doc);
              return (
                <label 
                  key={doc} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: checked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: checked ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--glass-border)'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={checked} 
                    onChange={() => toggleArrayItem('documentacao', doc)} 
                  />
                  <span style={{ fontSize: '0.85rem', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: checked ? '600' : 'normal' }}>
                    {doc}
                  </span>
                </label>
              );
            })}
          </div>
          {(formData.documentacao || []).includes('Outro') && (
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '600px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                Especifique outra documentação:
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Usucapião em andamento, Cessão de posse..." 
                value={formData.documentacaoOutro || ''} 
                onChange={e => handleChange('documentacaoOutro', e.target.value)} 
                autoFocus
              />
            </div>
          )}
        </div>

        {/* ============================================================
            9. FOTOS E MÍDIAS
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ ...sectionHeaderStyle, margin: 0, paddingBottom: 0, borderBottom: 'none' }}>
              <Camera size={18} /> 9. Fotos e Mídias
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {(formData.fotos || []).length} foto(s) anexada(s)
            </span>
          </div>

          {/* Painel de Controle de Marca d'Água Oficial Araújo Imóveis */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.85rem 1.15rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0 }}>
                <input 
                  type="checkbox"
                  checked={watermarkConfig.enabled}
                  onChange={(e) => handleUpdateWatermarkConfig({ enabled: e.target.checked })}
                  style={{ width: '17px', height: '17px', accentColor: 'var(--text-primary)' }}
                />
                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} /> Aplicar Marca d'Água da Araújo Imóveis automaticamente
                </span>
              </label>

              {watermarkConfig.enabled && (formData.fotos || []).length > 0 && (
                <button
                  type="button"
                  onClick={handleReapplyWatermarks}
                  disabled={isWatermarking}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  title="Reaplicar marca d'água com as configurações atuais em todas as fotos da lista"
                >
                  <RefreshCw size={13} style={{ animation: isWatermarking ? 'spin 1.2s linear infinite' : 'none' }} />
                  {isWatermarking ? `Aplicando (${watermarkProgress.current}/${watermarkProgress.total})...` : 'Reaplicar Marca em Todas'}
                </button>
              )}
            </div>

            {watermarkConfig.enabled && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--glass-border)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                {/* Posição da Marca */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Posição:</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[
                      { id: 'center', label: 'Centro (Padrão)' },
                      { id: 'bottom-right', label: 'Canto Inferior' },
                      { id: 'both', label: 'Centro + Canto' }
                    ].map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => handleUpdateWatermarkConfig({ position: pos.id })}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          background: watermarkConfig.position === pos.id ? 'var(--text-primary)' : 'var(--glass-highlight)',
                          color: watermarkConfig.position === pos.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                          border: '1px solid var(--glass-border)',
                          fontWeight: watermarkConfig.position === pos.id ? '600' : '400'
                        }}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacidade */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Intensidade:</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[
                      { val: 0.30, label: 'Discreta' },
                      { val: 0.45, label: 'Média (45%)' },
                      { val: 0.65, label: 'Marcante' }
                    ].map(op => (
                      <button
                        key={op.label}
                        type="button"
                        onClick={() => handleUpdateWatermarkConfig({ opacity: op.val })}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          background: Math.abs(watermarkConfig.opacity - op.val) < 0.05 ? 'var(--text-primary)' : 'var(--glass-highlight)',
                          color: Math.abs(watermarkConfig.opacity - op.val) < 0.05 ? 'var(--bg-primary)' : 'var(--text-secondary)',
                          border: '1px solid var(--glass-border)',
                          fontWeight: Math.abs(watermarkConfig.opacity - op.val) < 0.05 ? '600' : '400'
                        }}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rodapé institucional */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginLeft: 'auto' }}>
                  <input 
                    type="checkbox"
                    checked={watermarkConfig.includeText}
                    onChange={(e) => handleUpdateWatermarkConfig({ includeText: e.target.checked })}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Incluir site no rodapé</span>
                </label>
              </div>
            )}
          </div>

          <div style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--glass-highlight)',
            cursor: isWatermarking ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
            transition: 'border-color 0.2s ease',
            opacity: isWatermarking ? 0.7 : 1
          }}>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              id="upload-fotos-imovel"
              style={{ display: 'none' }}
              disabled={isWatermarking}
              onChange={handlePhotoUpload} 
            />
            <label htmlFor="upload-fotos-imovel" style={{ cursor: isWatermarking ? 'not-allowed' : 'pointer', display: 'block' }}>
              {isWatermarking ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={32} style={{ color: 'var(--text-primary)', animation: 'spin 1.2s linear infinite' }} />
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Aplicando Marca d'Água Oficial Araújo Imóveis... ({watermarkProgress.current}/{watermarkProgress.total})
                  </strong>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Processando imagem e carimbando logotipo com proteção de direitos autorais
                  </span>
                </div>
              ) : (
                <>
                  <Upload size={36} style={{ color: 'var(--text-primary)', margin: '0 auto 0.75rem auto' }} />
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Anexar Fotos do Imóvel {watermarkConfig.enabled ? '(com Marca d\'Água)' : ''}
                  </strong>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                    Arraste as imagens aqui ou clique para selecionar fotos (JPEG, PNG, WebP)
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Galeria de Fotos */}
          {(formData.fotos || []).length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Fotos carregadas ({(formData.fotos || []).length}): primeira imagem é a foto principal
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Clique em qualquer foto para ver ampliada com a marca d'água
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {(formData.fotos || []).map((photoUrl, idx) => (
                  <div key={idx} style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: idx === 0 ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
                    backgroundColor: 'var(--bg-tertiary)',
                    cursor: 'pointer'
                  }} onClick={() => setPreviewPhoto(photoUrl)}>
                    <img 
                      src={photoUrl} 
                      alt={`Foto ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    
                    {/* Badge Marca d'água */}
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      backgroundColor: 'rgba(8, 9, 13, 0.75)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.62rem',
                      fontWeight: '600',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <ShieldCheck size={10} /> Marca
                    </span>

                    {idx === 0 && (
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--bg-primary)',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        PRINCIPAL
                      </span>
                    )}

                    <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '3px' }} onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(photoUrl)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          color: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Ver foto ampliada"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remover foto"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSetMainPhoto(idx); }}
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          fontSize: '0.65rem',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Tornar foto principal"
                      >
                        Definir Capa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links de Mídia Adicionais */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Video size={14} style={{ color: '#ef4444' }} /> Link YouTube (Vídeo do Imóvel):
              </label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://youtube.com/watch?v=..."
                value={formData.linkYoutube} 
                onChange={e => handleChange('linkYoutube', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={14} style={{ color: 'var(--accent-cyan)' }} /> Link Tour Virtual 360º:
              </label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://matterport.com/... ou link 360"
                value={formData.linkTourVirtual} 
                onChange={e => handleChange('linkTourVirtual', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            PUBLICAÇÃO NO SITE OFICIAL (araujoimoveiscaratinga.com.br)
           ============================================================ */}
        <div className="glass-panel" style={{ 
          backgroundColor: 'rgba(56, 189, 248, 0.05)', 
          border: '1px solid rgba(56, 189, 248, 0.3)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          marginBottom: '1.75rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '1.05rem' }}>
              <Globe size={20} />
              <span>Publicação no Site Oficial (araujoimoveiscaratinga.com.br)</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              <input 
                type="checkbox" 
                checked={formData.publicarNoSite !== false} 
                onChange={e => handleChange('publicarNoSite', e.target.checked)} 
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <span>Exibir este imóvel no site oficial</span>
            </label>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            As fotos, endereço e características desta tela serão formatados automaticamente como um anúncio de destaque na página inicial e no catálogo de imóveis do site oficial <strong>www.araujoimoveiscaratinga.com.br</strong>.
          </p>

          <div className="form-grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Finalidade no Site:</label>
              <select 
                className="form-input"
                value={
                  formData.finalidadeSite || 
                  (formData.finalidade === 'Venda' ? 'comprar' : formData.finalidade === 'Permuta' ? 'permuta' : 'alugar')
                }
                onChange={e => {
                  const val = e.target.value;
                  handleChange('finalidadeSite', val);
                  handleChange('finalidade', val === 'comprar' ? 'Venda' : (val === 'permuta' ? 'Permuta' : 'Locação'));
                }}
              >
                <option value="alugar">Aluguel / Locação</option>
                <option value="comprar">Venda / Comprar</option>
                <option value="lancamento">Lançamento / Investimento</option>
                <option value="permuta">Permuta</option>
                <option value="Outro">Outro</option>
              </select>
              {formData.finalidadeSite === 'Outro' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Especifique a finalidade para o site..." 
                    value={formData.finalidadeSiteOutro || ''} 
                    onChange={e => handleChange('finalidadeSiteOutro', e.target.value)} 
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Valor Pretendido / Aluguel (R$):</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Ex: 1800 (padrão se vazio)"
                value={formData.valorImovel || ''}
                onChange={e => handleChange('valorImovel', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quartos:</label>
              <input 
                type="number"
                className="form-input"
                placeholder="Ex: 3"
                value={formData.quartos || ''}
                onChange={e => handleChange('quartos', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banheiros:</label>
              <input 
                type="number"
                className="form-input"
                placeholder="Ex: 2"
                value={formData.banheiros || ''}
                onChange={e => handleChange('banheiros', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vagas de Garagem:</label>
              <input 
                type="number"
                className="form-input"
                placeholder="Ex: 1"
                value={formData.vagas || ''}
                onChange={e => handleChange('vagas', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Área Construída (m²):</label>
              <input 
                type="number"
                className="form-input"
                placeholder="Ex: 150"
                value={formData.areaConstruida || formData.areaTotal || ''}
                onChange={e => handleChange('areaConstruida', e.target.value)}
              />
            </div>
          </div>

          {/* Opções e link gerado */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed rgba(56, 189, 248, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.destaque} 
                  onChange={e => handleChange('destaque', e.target.checked)} 
                />
                <span>Exibir em Destaque na Página Inicial do Site</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.mostrarEnderecoExato} 
                  onChange={e => handleChange('mostrarEnderecoExato', e.target.checked)} 
                />
                <span>Exibir Endereço Exato no Site</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>Link direto que será gerado:</span>
                <a 
                  href={`https://www.araujoimoveiscaratinga.com.br/imoveis/${(formData.codigo || 'im-0001').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan)', fontWeight: '600', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {`https://www.araujoimoveiscaratinga.com.br/imoveis/${(formData.codigo || 'im-0001').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  <ExternalLink size={13} />
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: formData.publicarNoSite !== false ? '#34d399' : '#94a3b8', fontWeight: '600' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: formData.publicarNoSite !== false ? '#10b981' : '#64748b', display: 'inline-block' }} />
                {formData.publicarNoSite !== false ? 'Pronto para publicação instantânea ao salvar' : 'Publicação no site desativada'}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            10. DOCUMENTOS INTERNOS / OBSERVAÇÕES (PRIVADO)
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Lock size={18} /> 10. Documentos Internos (Privado)
          </h3>
          <div className="form-group">
            <label className="form-label">Observações Internas (Não visíveis para clientes):</label>
            <textarea 
              rows={3}
              className="form-input" 
              placeholder="Anotações de negociação, restrições com proprietário, contato do porteiro, histórico..."
              value={formData.observacoesInternas} 
              onChange={e => handleChange('observacoesInternas', e.target.value)} 
            />
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: '700', fontSize: '1rem', opacity: isSaving ? 0.7 : 1 }}
          >
            <Save size={18} /> {isSaving ? 'Salvando e Publicando...' : 'Salvar Imóvel'}
          </button>
        </div>
      </form>

      {/* Modal de Preenchimento Automático com IA */}
      <ModalPreenchimentoIA 
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={handleApplyAiData}
        existingFormData={formData}
      />

      {/* Modal de Prévia Ampliada da Foto com Marca d'Água */}
      {previewPhoto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1.5rem'
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} /> Foto com Marca d'Água Oficial Araújo Imóveis
              </span>
              <button 
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>
            <img 
              src={previewPhoto} 
              alt="Foto ampliada com marca d'água" 
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--card-shadow)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const sectionHeaderStyle = {
  fontSize: '1.15rem',
  marginBottom: '1.25rem',
  color: 'var(--accent-cyan)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--glass-border)',
  paddingBottom: '0.75rem'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  fontWeight: '500'
};
