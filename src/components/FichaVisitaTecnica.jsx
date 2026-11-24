import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import FichaPrintTemplate from './FichaPrintTemplate';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Building, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Home,
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
  Camera,
  Upload,
  Globe,
  Sparkles,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Eye
} from 'lucide-react';

const formatLocationUrl = (urlOrCoords) => {
  if (!urlOrCoords) return '';
  const trimmed = urlOrCoords.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('maps.') || trimmed.startsWith('www.google.') || trimmed.startsWith('goo.gl') || trimmed.startsWith('waze.')) {
    return `https://${trimmed}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
};

export default function FichaVisitaTecnica() {
  const { 
    fichasVisita = [], 
    addFichaVisita, 
    updateFichaVisita, 
    deleteFichaVisita, 
    convertFichaToProperty,
    profile,
    portalUsers = []
  } = useApp();

  // View modes: 'list' | 'form' | 'print' | 'site_fichas'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [selectedPreviewImg, setSelectedPreviewImg] = useState(null);

  // Identifica se uma ficha foi enviada pelo formulário "Anunciar Imóvel" do Site Oficial
  const isSiteFicha = (f) => {
    return Boolean(
      f && (
        f.provisoria === true ||
        (typeof f.origemCaptacao === 'string' && f.origemCaptacao.includes('Site')) ||
        (typeof f.id === 'string' && f.id.startsWith('ficha_site_')) ||
        (typeof f.codigoImovel === 'string' && f.codigoImovel.startsWith('AN-')) ||
        (typeof f.createdBy === 'string' && f.createdBy.includes('Site')) ||
        (typeof f.profissionalResponsavel === 'string' && f.profissionalResponsavel.includes('Site')) ||
        (typeof f.corretorResponsavel === 'string' && f.corretorResponsavel.includes('Site'))
      )
    );
  };

  // Fichas exclusivas do Site Oficial (Anunciar Imóvel)
  const siteFichas = (fichasVisita || []).filter(isSiteFicha);

  // Fichas internas/oficiais do CRM (apenas estas aparecem na listagem principal)
  const internalFichas = (fichasVisita || []).filter(f => !isSiteFicha(f));

  // Print state
  const [printData, setPrintData] = useState(null);
  const [isBlankPrint, setIsBlankPrint] = useState(false);

  // List filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Client Share Link Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync with official site
  const [isSyncingSite, setIsSyncingSite] = useState(false);
  const [isEditingFichaName, setIsEditingFichaName] = useState(false);
  const [customFichaName, setCustomFichaName] = useState('');
  const handleSyncWithWebsite = async () => {
    setIsSyncingSite(true);
    try {
      const activeFichas = (fichasVisita || []).filter(f => f && f.publicarNoSite !== false && f.status !== 'Cancelado');
      if (typeof convertFichaToProperty === 'function') {
        const propertiesToSync = activeFichas.map(convertFichaToProperty).filter(Boolean);
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propertiesToSync)
        });
        if (res.ok) {
          setSuccessMsg(`Sucesso! ${propertiesToSync.length} imóvel(is) sincronizado(s) e ativos no site oficial!`);
        } else {
          setSuccessMsg('Aviso: Verifique a conexão com a API de imóveis.');
        }
      }
    } catch (e) {
      console.error(e);
      setSuccessMsg('Erro ao sincronizar imóveis com o site.');
    } finally {
      setIsSyncingSite(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const getPublicFormUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?form=ficha-visita`;
  };

  const handleCopyClientLink = () => {
    const url = getPublicFormUrl();
    try {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Form Fields State
  const defaultToday = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    nomeFicha: '',
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',
    horarioContatoProprietario: 'Comercial (08:00 às 18:00)',
    linkWhatsapp: '',
    
    tipoImovel: 'Casa',
    enderecoImovel: '',
    bairroImovel: '',
    pontoReferenciaImovel: '',
    linkLocalizacaoImovel: '',
    ocupacaoImovel: 'Vazio',
    nomeAcesso: '',
    telefoneAcesso: '',
    dificuldadeAcesso: 'Não',
    observacoesAcesso: '',
    aguaLigada: 'Sim',
    energiaLigada: 'Sim',
    animaisImovel: 'Não',
    observacoesImovel: '',
    imagensImovel: [],

    // Integração Site Oficial Araújo Imóveis e Valores
    valorPretendidoAluguel: '',
    valorAvaliadoImobiliaria: '',
    finalidadeImovel: 'alugar',
    valorImovel: '',
    quartos: '',
    banheiros: '',
    vagas: '',
    area: '',
    publicarNoSite: true,

    dataVisita: defaultToday,
    horarioVisita: '09:00',
    profissionalResponsavel: profile?.name || 'Ricardo Araújo',
    proprietarioAcompanhara: 'Sim',
    autorizacaoFotosVideos: 'Sim',
    confirmadoWhatsapp: 'Sim',

    codigoImovel: '',
    dataCaptacao: defaultToday,
    corretorResponsavel: profile?.name || 'Corretor Responsável',
    linkWhatsappCorretor: profile?.linkWhatsapp || profile?.whatsappLink || '',
    origemCaptacao: 'WhatsApp',
    status: 'Aguardando agendamento'
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [toastError, setToastError] = useState('');

  // Auto-generate code when opening form for new entry
  useEffect(() => {
    if (viewMode === 'form' && !editingId && (!formData.codigoImovel || formData.codigoImovel.startsWith('VT-'))) {
      const count = (fichasVisita?.length || 0) + 1;
      const autoCode = `AI-${String(count).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, codigoImovel: autoCode }));
    }
  }, [viewMode, editingId, fichasVisita]);

  // Reset form
  const resetForm = () => {
    const count = (fichasVisita?.length || 0) + 1;
    const autoCode = `AI-${String(count).padStart(4, '0')}`;
    setEditingId(null);
    setFormErrors({});
    setSuccessMsg('');
    setFormData({
      nomeFicha: '',
      nomeProprietario: '',
      telefoneProprietario: '',
      emailProprietario: '',
      horarioContatoProprietario: 'Comercial (08:00 às 18:00)',
      linkWhatsapp: '',
      
      tipoImovel: 'Casa',
      enderecoImovel: '',
      bairroImovel: '',
      pontoReferenciaImovel: '',
      linkLocalizacaoImovel: '',
      ocupacaoImovel: 'Vazio',
      nomeAcesso: '',
      telefoneAcesso: '',
      dificuldadeAcesso: 'Não',
      observacoesAcesso: '',
      aguaLigada: 'Sim',
      energiaLigada: 'Sim',
      animaisImovel: 'Não',
      observacoesImovel: '',
      imagensImovel: [],

      valorPretendidoAluguel: '',
      valorAvaliadoImobiliaria: '',
      finalidadeImovel: 'alugar',
      valorImovel: '',
      quartos: '',
      banheiros: '',
      vagas: '',
      area: '',
      publicarNoSite: true,

      dataVisita: defaultToday,
      horarioVisita: '09:00',
      profissionalResponsavel: profile?.name || 'Ricardo Araújo',
      proprietarioAcompanhara: 'Sim',
      autorizacaoFotosVideos: 'Sim',
      confirmadoWhatsapp: 'Sim',

      codigoImovel: autoCode,
      dataCaptacao: defaultToday,
      corretorResponsavel: profile?.name || 'Ricardo Araújo',
      linkWhatsappCorretor: profile?.linkWhatsapp || profile?.whatsappLink || '',
      origemCaptacao: 'WhatsApp',
      status: 'Aguardando agendamento'
    });
  };

  const handleOpenAddForm = () => {
    resetForm();
    setViewMode('form');
  };

  const handleOpenEditForm = (ficha) => {
    setEditingId(ficha.id);
    setFormErrors({});
    setSuccessMsg('');
    setFormData({
      nomeFicha: ficha.nomeFicha || (ficha.codigoImovel ? `Ficha ${ficha.codigoImovel}` : ''),
      nomeProprietario: ficha.nomeProprietario || '',
      telefoneProprietario: ficha.telefoneProprietario || '',
      emailProprietario: ficha.emailProprietario || '',
      horarioContatoProprietario: ficha.horarioContatoProprietario || '',
      linkWhatsapp: ficha.linkWhatsapp || '',
      
      tipoImovel: ficha.tipoImovel || 'Casa',
      enderecoImovel: ficha.enderecoImovel || '',
      bairroImovel: ficha.bairroImovel || '',
      pontoReferenciaImovel: ficha.pontoReferenciaImovel || '',
      linkLocalizacaoImovel: ficha.linkLocalizacaoImovel || '',
      ocupacaoImovel: ficha.ocupacaoImovel || 'Vazio',
      nomeAcesso: ficha.nomeAcesso || '',
      telefoneAcesso: ficha.telefoneAcesso || '',
      dificuldadeAcesso: ficha.dificuldadeAcesso || 'Não',
      observacoesAcesso: ficha.observacoesAcesso || '',
      aguaLigada: ficha.aguaLigada || 'Sim',
      energiaLigada: ficha.energiaLigada || 'Sim',
      animaisImovel: ficha.animaisImovel || 'Não',
      observacoesImovel: ficha.observacoesImovel || '',
      imagensImovel: ficha.imagensImovel || [],

      valorPretendidoAluguel: ficha.valorPretendidoAluguel !== undefined ? ficha.valorPretendidoAluguel : (ficha.valorImovel !== undefined ? ficha.valorImovel : (ficha.precoPretendido || '')),
      valorAvaliadoImobiliaria: ficha.valorAvaliadoImobiliaria !== undefined ? ficha.valorAvaliadoImobiliaria : '',
      finalidadeImovel: ficha.finalidadeImovel || 'alugar',
      valorImovel: ficha.valorImovel !== undefined ? ficha.valorImovel : (ficha.valorPretendidoAluguel || ''),
      quartos: ficha.quartos !== undefined ? ficha.quartos : '',
      banheiros: ficha.banheiros !== undefined ? ficha.banheiros : '',
      vagas: ficha.vagas !== undefined ? ficha.vagas : '',
      area: ficha.area !== undefined ? ficha.area : '',
      publicarNoSite: ficha.publicarNoSite !== undefined ? ficha.publicarNoSite : true,

      dataVisita: ficha.dataVisita || defaultToday,
      horarioVisita: ficha.horarioVisita || '09:00',
      profissionalResponsavel: ficha.profissionalResponsavel || profile?.name || '',
      proprietarioAcompanhara: ficha.proprietarioAcompanhara || 'Sim',
      autorizacaoFotosVideos: ficha.autorizacaoFotosVideos || 'Sim',
      confirmadoWhatsapp: ficha.confirmadoWhatsapp || 'Sim',

      codigoImovel: ficha.codigoImovel || '',
      dataCaptacao: ficha.dataCaptacao || defaultToday,
      corretorResponsavel: ficha.corretorResponsavel || profile?.name || '',
      linkWhatsappCorretor: ficha.linkWhatsappCorretor || ficha.whatsappCorretor || '',
      origemCaptacao: ficha.origemCaptacao || 'WhatsApp',
      status: ficha.status || 'Aguardando agendamento'
    });
    setViewMode('form');
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSaveFichaName = () => {
    const trimmed = (customFichaName || '').trim();
    if (trimmed) {
      setFormData(prev => {
        const next = { ...prev, nomeFicha: trimmed };
        if (/^[A-Za-z0-9_-]{2,15}$/.test(trimmed)) {
          next.codigoImovel = trimmed.toUpperCase();
        }
        return next;
      });
      if (editingId) {
        const updates = { nomeFicha: trimmed };
        if (/^[A-Za-z0-9_-]{2,15}$/.test(trimmed)) {
          updates.codigoImovel = trimmed.toUpperCase();
        }
        updateFichaVisita(editingId, updates);
      }
    }
    setIsEditingFichaName(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          setFormData(prev => ({
            ...prev,
            imagensImovel: [...(prev.imagensImovel || []), compressedDataUrl]
          }));

          // Upload through CRM serverless API /api/upload-image (no browser CORS block)
          fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: compressedDataUrl })
          })
            .then(res => res.json())
            .then(data => {
              if (data?.url) {
                console.log('Image uploaded to CDN successfully:', data.url);
                setFormData(prev => ({
                  ...prev,
                  imagensImovel: (prev.imagensImovel || []).map(img => img === compressedDataUrl ? data.url : img)
                }));
              }
            })
            .catch(err => console.warn('Background image CDN upload error:', err));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imagensImovel: (prev.imagensImovel || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Validations
  const validateForm = () => {
    const errors = {};

    if (!formData.nomeProprietario?.trim()) {
      errors.nomeProprietario = 'Nome do proprietário é obrigatório.';
    }
    
    if (!formData.telefoneProprietario?.trim()) {
      errors.telefoneProprietario = 'Telefone/WhatsApp é obrigatório.';
    } else {
      const digits = formData.telefoneProprietario.replace(/\D/g, '');
      if (digits.length < 8) {
        errors.telefoneProprietario = 'Digite um telefone válido com código DDD.';
      }
    }

    if (formData.emailProprietario?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailProprietario.trim())) {
        errors.emailProprietario = 'Formato de e-mail inválido.';
      }
    }

    if (!formData.tipoImovel?.trim()) {
      errors.tipoImovel = 'Tipo do imóvel é obrigatório.';
    }

    if (!formData.enderecoImovel?.trim()) {
      errors.enderecoImovel = 'Endereço completo é obrigatório.';
    }

    if (!formData.bairroImovel?.trim()) {
      errors.bairroImovel = 'Bairro é obrigatório.';
    }

    if (!formData.dataVisita?.trim()) {
      errors.dataVisita = 'Data da visita é obrigatória.';
    }

    if (!formData.horarioVisita?.trim()) {
      errors.horarioVisita = 'Horário é obrigatório.';
    }

    if (!formData.profissionalResponsavel?.trim()) {
      errors.profissionalResponsavel = 'Profissional responsável é obrigatório.';
    }

    if (!formData.corretorResponsavel?.trim()) {
      errors.corretorResponsavel = 'Corretor responsável é obrigatório.';
    }

    if (!formData.status?.trim()) {
      errors.status = 'Status da ficha é obrigatório.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler (Salvar Ficha)
  const handleSaveFicha = (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      setToastError('Preencha os campos obrigatórios para salvar.');
      setTimeout(() => setToastError(''), 4000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (editingId) {
      updateFichaVisita(editingId, formData);
      setSuccessMsg('Ficha salva');
    } else {
      const newFicha = addFichaVisita(formData);
      setEditingId(newFicha.id);
      setSuccessMsg('Ficha salva');
    }

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // Print Handlers
  const handlePrintFilled = (fichaToPrint) => {
    const dataToUse = fichaToPrint || formData;
    setPrintData(dataToUse);
    setIsBlankPrint(false);
    setViewMode('print');
  };

  const handlePrintBlank = () => {
    setPrintData(null);
    setIsBlankPrint(true);
    setViewMode('print');
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ficha de Visita Técnica?')) {
      deleteFichaVisita(id);
    }
  };

  // List filtering (apenas fichas internas do CRM aparecem na lista padrão; fichas do site aparecem exclusivamente em 'Imóveis site')
  const filteredFichas = internalFichas.filter(f => {
    const matchesSearch = 
      (f.nomeProprietario || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.codigoImovel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.bairroImovel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.enderecoImovel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.corretorResponsavel || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render Print View Mode
  if (viewMode === 'print') {
    return (
      <FichaPrintTemplate 
        ficha={printData}
        isBlank={isBlankPrint}
        onClose={() => setViewMode(editingId ? 'form' : 'list')}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <div className="module-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList style={{ color: 'var(--accent-cyan)' }} size={24} />
            Ficha 01: Agendamento de Visita Técnica
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Cadastro, agendamento de avaliação técnica e emissão de fichas em A4 / PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {viewMode === 'list' ? (
            <>
              <button 
                type="button"
                onClick={() => setViewMode('site_fichas')}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.625rem 1.125rem', 
                  borderRadius: 'var(--border-radius-sm)', 
                  backgroundColor: 'rgba(56, 189, 248, 0.12)', 
                  color: 'var(--accent-cyan)', 
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Ver fichas e propostas enviadas através do 'Anunciar Imóvel' no site"
              >
                <Globe size={16} />
                <span>Imóveis site</span>
                {siteFichas.length > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    marginLeft: '0.25rem',
                    lineHeight: 1
                  }}>
                    {siteFichas.length}
                  </span>
                )}
              </button>

              <button 
                type="button"
                onClick={handleOpenAddForm}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.625rem 1.125rem', 
                  borderRadius: 'var(--border-radius-sm)', 
                  backgroundColor: 'var(--text-primary)', 
                  color: 'var(--bg-primary)', 
                  border: '1px solid var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>Nova Ficha</span>
              </button>
            </>
          ) : viewMode === 'site_fichas' ? (
            <>
              <button 
                onClick={() => setViewMode('list')}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={16} />
                <span>Voltar para Lista de Fichas</span>
              </button>

              <button 
                type="button"
                onClick={handleOpenAddForm}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.625rem 1.125rem', 
                  borderRadius: 'var(--border-radius-sm)', 
                  backgroundColor: 'var(--text-primary)', 
                  color: 'var(--bg-primary)', 
                  border: '1px solid var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>Nova Ficha</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setViewMode('list')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Voltar para Lista</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Flutuante no Topo da Tela - Sempre visível independente do scroll */}
      {successMsg && (
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
          border: '1px solid rgba(255, 255, 255, 0.3)',
          pointerEvents: 'none'
        }}>
          <CheckCircle2 size={24} style={{ color: '#ffffff' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {toastError && (
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
          border: '1px solid rgba(255, 255, 255, 0.3)',
          pointerEvents: 'none'
        }}>
          <AlertCircle size={22} style={{ color: '#ffffff' }} />
          <span>{toastError}</span>
        </div>
      )}

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="glass-card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-success)', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', borderRadius: 'var(--border-radius-sm)' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: '500' }}>{successMsg}</span>
        </div>
      )}

      {Object.keys(formErrors).length > 0 && viewMode === 'form' && (
        <div className="glass-card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', borderRadius: 'var(--border-radius-sm)' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Existem campos obrigatórios não preenchidos:</strong>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem' }}>
              {Object.values(formErrors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ====================================
          VIEW MODE 1: LISTAGE E CARDS
         ==================================== */}
      {viewMode === 'list' && (
        <>
          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <ClipboardList size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Total de Fichas</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{internalFichas.length}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Aguardando / Agendadas</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {internalFichas.filter(f => f.status === 'Aguardando agendamento' || f.status === 'Agendado').length}
                </strong>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Confirmadas / Realizadas</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {internalFichas.filter(f => f.status === 'Confirmado' || f.status === 'Realizado').length}
                </strong>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input 
                  type="text"
                  placeholder="Buscar por proprietário, código (ex: AI-0001), bairro, endereço..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem 0.625rem 2.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Aguardando agendamento">Aguardando agendamento</option>
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Realizado">Realizado</option>
                <option value="Reagendar">Reagendar</option>
              </select>
            </div>
          </div>

          {/* Fichas Data Table */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {filteredFichas.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <FileSpreadsheet size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>Nenhuma ficha de visita técnica encontrada.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Clique em <strong>Nova Ficha</strong> para cadastrar um agendamento ou altere os filtros.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-highlight)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Código / Data Visita</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Proprietário / Telefone</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Imóvel / Bairro</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Responsável</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFichas.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: '700', color: 'var(--accent-cyan)', display: 'block' }}>
                            {f.nomeFicha || f.codigoImovel}
                          </span>
                          {(f.provisoria || (f.origemCaptacao || '').includes('Site')) && (
                            <span style={{ display: 'inline-block', marginTop: '3px', marginBottom: '2px', fontSize: '0.68rem', fontWeight: '700', color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.16)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '1px 6px', borderRadius: '4px' }}>
                              Provisória • Análise Site
                            </span>
                          )}
                          {f.nomeFicha && f.nomeFicha !== f.codigoImovel && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                              Código: {f.codigoImovel}
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {f.dataVisita ? new Date(f.dataVisita + 'T00:00:00').toLocaleDateString('pt-BR') : '-'} às {f.horarioVisita}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{f.nomeProprietario}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.telefoneProprietario}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)', display: 'block' }}>
                            {f.tipoImovel} - {f.bairroImovel}
                            {(f.precoPretendido || f.valorImovel) ? ` • ${f.precoPretendido || `R$ ${Number(f.valorImovel).toLocaleString('pt-BR')}`}` : ''}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>{f.enderecoImovel}</span>
                          {f.linkLocalizacaoImovel && (
                            <a
                              href={f.linkLocalizacaoImovel}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'none', fontWeight: '600', marginTop: '2px' }}
                            >
                              <MapPin size={11} /> Ver localização no mapa ↗
                            </a>
                          )}
                          {f.observacoesImovel && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.observacoesImovel}>
                              {f.observacoesImovel}
                            </span>
                          )}
                          {f.imagensImovel && f.imagensImovel.length > 0 && (
                            <div style={{ marginTop: '3px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--accent-cyan)', backgroundColor: 'rgba(56, 189, 248, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                                <Camera size={11} /> {f.imagensImovel.length} foto(s)
                              </span>
                            </div>
                          )}
                          {f.publicarNoSite !== false && f.status !== 'Cancelado' && (
                            <div style={{ marginTop: '5px' }}>
                              <a 
                                href={`https://www.araujoimoveiscaratinga.com.br/imoveis/${(f.codigoImovel || f.id || '').toLowerCase().replace(/^#+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  fontSize: '0.75rem', 
                                  color: 'var(--accent-cyan)', 
                                  textDecoration: 'none',
                                  fontWeight: '600'
                                }}
                                title="Ver anúncio publicado no Site Oficial"
                              >
                                <Globe size={12} /> Ver no site oficial ↗
                              </a>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{f.corretorResponsavel || f.profissionalResponsavel}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`status-badge status-${(f.status || 'aguardando').toLowerCase().replace(/\s+/g, '-')}`}>
                            {f.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handlePrintFilled(f)}
                              title="Imprimir Ficha Preenchida"
                              className="btn-icon-glass"
                            >
                              <Printer size={16} />
                            </button>
                            <button 
                              onClick={() => handleOpenEditForm(f)}
                              title="Editar Ficha"
                              className="btn-icon-glass"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(f.id)}
                              title="Excluir Ficha"
                              className="btn-icon-glass text-danger"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====================================
          VIEW MODE 3: IMÓVEIS RECEBIDOS DO SITE (ANUNCIAR IMÓVEL)
         ==================================== */}
      {viewMode === 'site_fichas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Panel */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <Globe size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                    Imóveis Recebidos do Site Oficial
                  </h2>
                  <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                    {siteFichas.length} {siteFichas.length === 1 ? 'imóvel recebido' : 'imóveis recebidos'}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Fichas e propostas enviadas diretamente por clientes em <strong>araujoimoveiscaratinga.com.br/anunciar</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setViewMode('list')}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={16} />
                <span>Voltar para Fichas</span>
              </button>
              <a 
                href="https://www.araujoimoveiscaratinga.com.br/anunciar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <ExternalLink size={16} />
                <span>Ver Página no Site</span>
              </a>
            </div>
          </div>

          {/* Cards List or Empty State */}
          {siteFichas.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Globe size={32} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Nenhum imóvel recebido do site no momento
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
                Assim que um proprietário preencher e enviar o formulário na página <strong>Anunciar Imóvel</strong> do site oficial, a ficha com todas as fotos e dados de contato do WhatsApp aparecerá automaticamente aqui.
              </p>
              <a 
                href="https://www.araujoimoveiscaratinga.com.br/anunciar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <ExternalLink size={16} />
                <span>Abrir página Anunciar Imóvel</span>
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {siteFichas.map((f) => {
                const cleanPhone = (f.telefoneProprietario || f.telefoneAcesso || '').replace(/\D/g, '');
                const waUrl = cleanPhone 
                  ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${f.nomeProprietario || ''}, tudo bem? Sou da Araújo Imóveis. Recebemos seu cadastro de ${f.tipoImovel || 'imóvel'} no site oficial e gostaríamos de agendar a visita técnica!`)}`
                  : null;
                const formattedPrice = f.precoPretendido || (f.valorImovel ? `R$ ${Number(f.valorImovel).toLocaleString('pt-BR')}` : 'A combinar');
                const modality = f.modalidadePretendida || (f.finalidadeImovel === 'alugar' ? 'Aluguel' : 'Venda');

                return (
                  <div 
                    key={f.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '1.25rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      gap: '1rem',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      backgroundColor: 'rgba(15, 23, 42, 0.65)'
                    }}
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                            {f.codigoImovel || f.id}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0.15rem 0 0 0', color: 'var(--text-primary)' }}>
                            {f.tipoImovel || 'Imóvel'} • {modality}
                          </h4>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          🌐 Enviado pelo Site
                        </span>
                      </div>

                      {/* Price Highlight */}
                      <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Valor Pretendido:</span>
                        <strong style={{ fontSize: '1rem', color: '#10b981' }}>{formattedPrice}</strong>
                      </div>

                      {/* Owner Details */}
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                          <User size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          <strong>{f.nomeProprietario || 'Proprietário não informado'}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                          <Phone size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          <span>{f.telefoneProprietario || 'Sem telefone'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          <span>{f.bairroImovel || f.enderecoImovel || 'Caratinga - MG'}</span>
                        </div>
                      </div>

                      {/* Client Description / Notes */}
                      {f.observacoesImovel && (
                        <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.25)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Descrição do Imóvel:</strong>
                          {f.observacoesImovel.replace(/^\[Enviado pelo Site para Análise\]\s*/i, '')}
                        </div>
                      )}

                      {/* Photo Thumbnails */}
                      {f.imagensImovel && f.imagensImovel.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem' }}>
                            <Camera size={13} /> {f.imagensImovel.length} foto(s) anexada(s):
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                            {f.imagensImovel.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img}
                                alt={`Foto ${idx + 1}`}
                                onClick={() => setSelectedPreviewImg(img)}
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  flexShrink: 0,
                                  transition: 'transform 0.15s ease'
                                }}
                                title="Clique para ampliar a foto"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {waUrl && (
                          <a 
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '6px',
                              backgroundColor: '#25D366',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(f)}
                          style={{
                            flex: 1.2,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                          title="Abrir como Ficha de Visita Técnica e agendar"
                        >
                          <Edit3 size={14} />
                          <span>Abrir como Ficha</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          Recebido em: {f.dataCaptacao || (f.createdAt ? f.createdAt.split('T')[0] : 'Hoje')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--accent-danger)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 6px'
                          }}
                          title="Descartar este imóvel"
                        >
                          <Trash2 size={13} />
                          <span>Descartar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal para Visualização de Fotos */}
      {selectedPreviewImg && (
        <div 
          onClick={() => setSelectedPreviewImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={selectedPreviewImg} alt="Visualização" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain' }} />
            <button 
              onClick={() => setSelectedPreviewImg(null)}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ====================================
          VIEW MODE 2: FORMULÁRIO COMPLETO
         ==================================== */}
      {viewMode === 'form' && (
        <form onSubmit={handleSaveFicha} className="ficha-form-container">
          
          {/* Top Fixed Action Bar (Posicionado de forma fixa e natural no topo, sem flutuar sobre os campos ao rolar) */}
          <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {isEditingFichaName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    autoFocus
                    className="form-input"
                    value={customFichaName}
                    onChange={(e) => setCustomFichaName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveFichaName();
                      } else if (e.key === 'Escape') {
                        setIsEditingFichaName(false);
                      }
                    }}
                    placeholder="Nome da ficha (ex: AI-0001 ou Casa Limoeiro)..."
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: '1px solid var(--accent-cyan)',
                      background: 'var(--bg-primary)',
                      color: 'var(--accent-cyan)',
                      minWidth: '240px',
                      boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveFichaName}
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981' }}
                    title="Salvar nome da ficha"
                  >
                    <Check size={14} />
                    <span>Salvar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingFichaName(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    title="Cancelar"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span 
                    onClick={() => {
                      setCustomFichaName(formData.nomeFicha || (editingId ? `Editando Ficha: ${formData.codigoImovel}` : 'Nova Ficha 01'));
                      setIsEditingFichaName(true);
                    }}
                    style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '700', 
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    title="Clique para editar o nome da ficha"
                  >
                    {formData.nomeFicha || (editingId ? `Editando Ficha: ${formData.codigoImovel}` : 'Nova Ficha 01')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFichaName(formData.nomeFicha || (editingId ? (formData.nomeFicha || formData.codigoImovel) : 'Nova Ficha 01'));
                      setIsEditingFichaName(true);
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      cursor: 'pointer'
                    }}
                    title="Trocar nome da ficha"
                  >
                    <Edit3 size={14} />
                    <span>Renomear</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setViewMode('list')}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={15} />
                <span>Voltar</span>
              </button>

              <button 
                type="button" 
                onClick={resetForm}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}
              >
                <X size={15} />
                <span>Cancelar</span>
              </button>

              <button 
                type="button" 
                onClick={handlePrintBlank}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}
              >
                <Printer size={15} />
                <span>Imprimir em Branco</span>
              </button>

              <button 
                type="button" 
                onClick={() => handlePrintFilled()}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}
              >
                <FileSpreadsheet size={15} />
                <span>Imprimir Preenchida</span>
              </button>

              {successMsg && (
                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={16} /> Ficha salva
                </span>
              )}
              <button 
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: '700' }}
              >
                <Save size={16} />
                <span>Salvar Ficha</span>
              </button>
            </div>
          </div>

          {/* Section 1: Dados do Proprietário */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <User size={18} />
              1. Dados do Proprietário
            </h3>

            <div className="form-grid-2">
              <div className="form-group span-2">
                <label className="form-label required">Nome Completo do Proprietário:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.nomeProprietario ? 'input-error' : ''}`}
                  placeholder="Digite o nome completo do proprietário"
                  value={formData.nomeProprietario}
                  onChange={e => handleFieldChange('nomeProprietario', e.target.value)}
                />
                {formErrors.nomeProprietario && <span className="error-text">{formErrors.nomeProprietario}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Telefone / WhatsApp:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.telefoneProprietario ? 'input-error' : ''}`}
                  placeholder="(37) 99999-9999"
                  value={formData.telefoneProprietario}
                  onChange={e => handleFieldChange('telefoneProprietario', e.target.value)}
                />
                {formErrors.telefoneProprietario && <span className="error-text">{formErrors.telefoneProprietario}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Melhor Horário para Contato:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ex: Comercial (08:00 às 18:00), após 14h, etc."
                  value={formData.horarioContatoProprietario}
                  onChange={e => handleFieldChange('horarioContatoProprietario', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dados Iniciais do Imóvel */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Home size={18} />
              2. Dados Iniciais do Imóvel
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label required">Tipo do Imóvel:</label>
                <select 
                  className={`form-input ${formErrors.tipoImovel ? 'input-error' : ''}`}
                  value={formData.tipoImovel}
                  onChange={e => handleFieldChange('tipoImovel', e.target.value)}
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Galpão">Galpão</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Sobrado">Sobrado</option>
                  <option value="Outro">Outro</option>
                </select>
                {formErrors.tipoImovel && <span className="error-text">{formErrors.tipoImovel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Bairro:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.bairroImovel ? 'input-error' : ''}`}
                  placeholder="Nome do bairro"
                  value={formData.bairroImovel}
                  onChange={e => handleFieldChange('bairroImovel', e.target.value)}
                />
                {formErrors.bairroImovel && <span className="error-text">{formErrors.bairroImovel}</span>}
              </div>

              <div className="form-group span-2">
                <label className="form-label required">Endereço Completo:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.enderecoImovel ? 'input-error' : ''}`}
                  placeholder="Rua/Avenida, número, complemento"
                  value={formData.enderecoImovel}
                  onChange={e => handleFieldChange('enderecoImovel', e.target.value)}
                />
                {formErrors.enderecoImovel && <span className="error-text">{formErrors.enderecoImovel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Ponto de Referência:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Próximo à praça, mercado, etc."
                  value={formData.pontoReferenciaImovel}
                  onChange={e => handleFieldChange('pontoReferenciaImovel', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Link da Localização (Google Maps / Waze):</span>
                  {formData.linkLocalizacaoImovel && (
                    <a 
                      href={formatLocationUrl(formData.linkLocalizacaoImovel)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                    >
                      Abrir mapa ↗
                    </a>
                  )}
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="https://maps.google.com/... ou coordenadas"
                  value={formData.linkLocalizacaoImovel}
                  onChange={e => handleFieldChange('linkLocalizacaoImovel', e.target.value)}
                />
                {formData.linkLocalizacaoImovel ? (
                  <div style={{ marginTop: '0.45rem' }}>
                    <a
                      href={formatLocationUrl(formData.linkLocalizacaoImovel)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        color: '#38bdf8',
                        borderColor: 'rgba(56, 189, 248, 0.4)',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        fontWeight: '600',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        width: 'fit-content'
                      }}
                    >
                      <MapPin size={15} /> Abrir Localização ↗
                    </a>
                  </div>
                ) : (
                  (formData.enderecoImovel || formData.bairroImovel) && (
                    <div style={{ marginTop: '0.45rem' }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.enderecoImovel || ''} ${formData.bairroImovel || ''} Caratinga MG`.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-color)',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          width: 'fit-content'
                        }}
                        title="Buscar este endereço no Google Maps"
                      >
                        <MapPin size={13} /> Buscar endereço no Maps ↗
                      </a>
                    </div>
                  )
                )}
              </div>

              {/* Valores: Pretendido vs Avaliado */}
              <div className="form-group">
                <label className="form-label">Valor Pretendido do Aluguel:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ex: R$ 1.500,00"
                  value={formData.valorPretendidoAluguel !== undefined ? formData.valorPretendidoAluguel : (formData.valorImovel || '')}
                  onChange={e => {
                    handleFieldChange('valorPretendidoAluguel', e.target.value);
                    handleFieldChange('valorImovel', e.target.value);
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor Avaliado pela Imobiliária:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ex: R$ 1.400,00"
                  value={formData.valorAvaliadoImobiliaria || ''}
                  onChange={e => handleFieldChange('valorAvaliadoImobiliaria', e.target.value)}
                />
              </div>

              {/* Situação e Acesso */}
              <div className="form-group">
                <label className="form-label">Situação do Imóvel:</label>
                <select 
                  className="form-input"
                  value={formData.ocupacaoImovel}
                  onChange={e => handleFieldChange('ocupacaoImovel', e.target.value)}
                >
                  <option value="Vazio">Vazio</option>
                  <option value="Ocupado">Ocupado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Existe dificuldade de acesso?</label>
                <select 
                  className="form-input"
                  value={formData.dificuldadeAcesso}
                  onChange={e => handleFieldChange('dificuldadeAcesso', e.target.value)}
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nome de quem dará acesso:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Nome do morador, porteiro ou responsável"
                  value={formData.nomeAcesso}
                  onChange={e => handleFieldChange('nomeAcesso', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone de quem dará acesso:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="(37) 99999-9999"
                  value={formData.telefoneAcesso}
                  onChange={e => handleFieldChange('telefoneAcesso', e.target.value)}
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Observações sobre o Acesso / Local:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder={formData.dificuldadeAcesso === 'Sim' ? "Descreva a dificuldade de acesso (chave dura, interfone quebrado, portão emperrado, código...)" : "Observações ou orientações sobre o acesso (opcional)..."}
                  value={formData.observacoesAcesso}
                  onChange={e => handleFieldChange('observacoesAcesso', e.target.value)}
                />
              </div>

              <div className="form-group span-2">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span className="form-label" style={{ margin: 0 }}>Água ligada:</span>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                      value={formData.aguaLigada}
                      onChange={e => handleFieldChange('aguaLigada', e.target.value)}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span className="form-label" style={{ margin: 0 }}>Energia ligada:</span>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                      value={formData.energiaLigada}
                      onChange={e => handleFieldChange('energiaLigada', e.target.value)}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span className="form-label" style={{ margin: 0 }}>Animais no imóvel:</span>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                      value={formData.animaisImovel}
                      onChange={e => handleFieldChange('animaisImovel', e.target.value)}
                    >
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="form-group span-2">
                <label className="form-label">Observações Importantes:</label>
                <textarea 
                  rows={3}
                  className="form-input"
                  placeholder="Informações adicionais sobre o imóvel, horário de chaves, restrições do condomínio, etc."
                  value={formData.observacoesImovel}
                  onChange={e => handleFieldChange('observacoesImovel', e.target.value)}
                />
              </div>

              {/* Fotos e Imagens do Imóvel */}
              <div className="form-group span-2" style={{ marginTop: '0.5rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                    <Camera size={16} style={{ color: 'var(--accent-cyan)' }} />
                    Fotos e Imagens do Imóvel:
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {(formData.imagensImovel || []).length} foto(s) anexada(s)
                  </span>
                </label>

                {/* Upload Area */}
                <div style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Upload size={20} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Clique ou arraste para adicionar fotos do imóvel
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Você pode anexar imagens do local, fachada ou detalhes técnicos
                    </div>
                  </div>
                </div>

                {/* Previews Grid */}
                {(formData.imagensImovel || []).length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '0.875rem'
                  }}>
                    {(formData.imagensImovel || []).map((imgUrl, idx) => (
                      <div key={idx} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--glass-border)',
                        backgroundColor: 'var(--bg-tertiary)'
                      }}>
                        <img 
                          src={imgUrl} 
                          alt={`Foto ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                          onClick={() => window.open(imgUrl, '_blank')}
                          title="Clique para abrir em tamanho real"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
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
                    ))}
                  </div>
                )}
              </div>

              {/* Integração Automática com o Site Oficial Araújo Imóveis */}
              <div className="form-group span-2" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '1.25rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.95rem' }}>
                    <Globe size={18} />
                    <span>Publicação no Site Oficial (araujoimoveiscaratinga.com.br)</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.publicarNoSite !== false} 
                      onChange={e => handleFieldChange('publicarNoSite', e.target.checked)} 
                    />
                    <span>Exibir este imóvel no site oficial</span>
                  </label>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  As fotos, endereço e características desta ficha serão formatados automaticamente como um anúncio de destaque na página inicial e no catálogo de imóveis do site oficial.
                </p>

                <div className="form-grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Finalidade no Site:</label>
                    <select 
                      className="form-input"
                      value={formData.finalidadeImovel || 'alugar'}
                      onChange={e => handleFieldChange('finalidadeImovel', e.target.value)}
                    >
                      <option value="alugar">Aluguel / Locação</option>
                      <option value="comprar">Venda / Comprar</option>
                      <option value="lancamento">Lançamento / Investimento</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valor Pretendido / Aluguel (R$):</label>
                    <input 
                      type="number"
                      className="form-input"
                      placeholder="Ex: 1800 (padrão se vazio)"
                      value={formData.valorImovel || ''}
                      onChange={e => handleFieldChange('valorImovel', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quartos:</label>
                    <input 
                      type="number"
                      className="form-input"
                      placeholder="Ex: 3"
                      value={formData.quartos || ''}
                      onChange={e => handleFieldChange('quartos', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Banheiros:</label>
                    <input 
                      type="number"
                      className="form-input"
                      placeholder="Ex: 2"
                      value={formData.banheiros || ''}
                      onChange={e => handleFieldChange('banheiros', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vagas de Garagem:</label>
                    <input 
                      type="number"
                      className="form-input"
                      placeholder="Ex: 1"
                      value={formData.vagas || ''}
                      onChange={e => handleFieldChange('vagas', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Área Construída (m²):</label>
                    <input 
                      type="number"
                      className="form-input"
                      placeholder="Ex: 150"
                      value={formData.area || ''}
                      onChange={e => handleFieldChange('area', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Agendamento */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Calendar size={18} />
              3. Agendamento da Visita Técnica
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label required">Data da Visita:</label>
                <input 
                  type="date"
                  className={`form-input ${formErrors.dataVisita ? 'input-error' : ''}`}
                  value={formData.dataVisita}
                  onChange={e => handleFieldChange('dataVisita', e.target.value)}
                />
                {formErrors.dataVisita && <span className="error-text">{formErrors.dataVisita}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Horário:</label>
                <input 
                  type="time"
                  className={`form-input ${formErrors.horarioVisita ? 'input-error' : ''}`}
                  value={formData.horarioVisita}
                  onChange={e => handleFieldChange('horarioVisita', e.target.value)}
                />
                {formErrors.horarioVisita && <span className="error-text">{formErrors.horarioVisita}</span>}
              </div>

              <div className="form-group span-2">
                <label className="form-label required">Profissional Responsável pela Vistoria/Avaliação:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.profissionalResponsavel ? 'input-error' : ''}`}
                  placeholder="Nome do engenheiro, vistoriador ou técnico responsável"
                  value={formData.profissionalResponsavel}
                  onChange={e => handleFieldChange('profissionalResponsavel', e.target.value)}
                />
                {formErrors.profissionalResponsavel && <span className="error-text">{formErrors.profissionalResponsavel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Proprietário Acompanhará a Visita?</label>
                <select 
                  className="form-input"
                  value={formData.proprietarioAcompanhara}
                  onChange={e => handleFieldChange('proprietarioAcompanhara', e.target.value)}
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Autorização para Fotos e Vídeos?</label>
                <select 
                  className="form-input"
                  value={formData.autorizacaoFotosVideos}
                  onChange={e => handleFieldChange('autorizacaoFotosVideos', e.target.value)}
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="form-group span-2">
                <label className="form-label">Agendamento Confirmado pelo WhatsApp?</label>
                <select 
                  className="form-input"
                  value={formData.confirmadoWhatsapp}
                  onChange={e => handleFieldChange('confirmadoWhatsapp', e.target.value)}
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Controle Interno */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Building size={18} />
              4. Controle Interno da Imobiliária
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Código Automático do Imóvel:</label>
                <input 
                  type="text"
                  className="form-input"
                  readOnly
                  style={{ backgroundColor: 'var(--bg-primary)', opacity: 0.85, fontWeight: '700', color: 'var(--accent-cyan)' }}
                  value={formData.codigoImovel}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data da Captação:</label>
                <input 
                  type="date"
                  className="form-input"
                  value={formData.dataCaptacao}
                  onChange={e => handleFieldChange('dataCaptacao', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Corretor Responsável:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.corretorResponsavel ? 'input-error' : ''}`}
                  placeholder="Nome do corretor que realizou a captação"
                  value={formData.corretorResponsavel}
                  onChange={e => handleFieldChange('corretorResponsavel', e.target.value)}
                />
                {formErrors.corretorResponsavel && <span className="error-text">{formErrors.corretorResponsavel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Origem da Captação:</label>
                <select 
                  className="form-input"
                  value={formData.origemCaptacao}
                  onChange={e => handleFieldChange('origemCaptacao', e.target.value)}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Site">Site da Imobiliária</option>
                  <option value="Instagram / Redes Sociais">Instagram / Redes Sociais</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Placa">Placa no Imóvel</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Status da Ficha de Visita:</label>
                <select 
                  className={`form-input ${formErrors.status ? 'input-error' : ''}`}
                  style={{ fontWeight: '600' }}
                  value={formData.status}
                  onChange={e => handleFieldChange('status', e.target.value)}
                >
                  <option value="Aguardando agendamento">Aguardando agendamento</option>
                  <option value="Agendado">Agendado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Realizado">Realizado</option>
                  <option value="Reagendar">Reagendar</option>
                </select>
                {formErrors.status && <span className="error-text">{formErrors.status}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Link do WhatsApp do Corretor:</span>
                  {formData.linkWhatsappCorretor && (
                    <a 
                      href={formData.linkWhatsappCorretor.startsWith('http') ? formData.linkWhatsappCorretor : `https://wa.me/55${formData.linkWhatsappCorretor.replace(/\D/g, '')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: '#22c55e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                    >
                      Abrir conversa ↗
                    </a>
                  )}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="https://wa.me/5533999999999 ou DDD + número"
                    value={formData.linkWhatsappCorretor || ''}
                    onChange={e => handleFieldChange('linkWhatsappCorretor', e.target.value)}
                  />
                  {formData.linkWhatsappCorretor && !formData.linkWhatsappCorretor.startsWith('http') && formData.linkWhatsappCorretor.replace(/\D/g, '').length >= 10 && (
                    <button
                      type="button"
                      onClick={() => {
                        const digits = formData.linkWhatsappCorretor.replace(/\D/g, '');
                        const full = digits.length <= 11 ? `55${digits}` : digits;
                        handleFieldChange('linkWhatsappCorretor', `https://wa.me/${full}`);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}
                      title="Formatar link do WhatsApp"
                    >
                      Gerar Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => setViewMode('list')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Voltar para Lista</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn btn-secondary"
              >
                <X size={16} />
                <span>Cancelar</span>
              </button>

              <button 
                type="button" 
                onClick={handlePrintBlank}
                className="btn btn-secondary"
              >
                <Printer size={16} />
                <span>Imprimir em Branco</span>
              </button>

              <button 
                type="button" 
                onClick={() => handlePrintFilled()}
                className="btn btn-secondary"
              >
                <FileSpreadsheet size={16} />
                <span>Imprimir Preenchida</span>
              </button>

              {successMsg && (
                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '0.5rem' }}>
                  <Check size={18} /> Ficha salva
                </span>
              )}
              <button 
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.5rem', fontWeight: '700' }}
              >
                <Save size={18} />
                <span>Salvar Ficha</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Client Share Link Modal */}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ maxWidth: '540px', width: '100%', padding: '1.75rem', borderRadius: '16px', position: 'relative', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setShowShareModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={20} style={{ color: 'var(--accent-cyan)' }} />
              Link da Ficha para o Cliente
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Envie este link para que o proprietário preencha diretamente os dados do imóvel e solicite o agendamento da visita técnica.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>URL Pública de Preenchimento:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text"
                  readOnly
                  value={getPublicFormUrl()}
                  style={{ flex: 1, padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--accent-cyan)', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
                <button 
                  onClick={handleCopyClientLink}
                  className="btn-glass-primary"
                  style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: copiedLink ? 'var(--accent-success)' : 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              {copiedLink && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', display: 'block', marginTop: '0.375rem', fontWeight: '500' }}>
                  ✓ Link copiado para a área de transferência!
                </span>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Olá! Para realizarmos o agendamento da visita técnica e avaliação do seu imóvel na Araújo Imóveis, por favor preencha as informações no link: ${getPublicFormUrl()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass-primary"
                style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#25D366', color: '#ffffff', fontWeight: '600', textDecoration: 'none', borderRadius: '8px' }}
              >
                <span>Enviar pelo WhatsApp</span>
              </a>

              <button 
                onClick={() => setShowShareModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
