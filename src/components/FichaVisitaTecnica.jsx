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
  Sparkles
} from 'lucide-react';

export default function FichaVisitaTecnica() {
  const { 
    fichasVisita = [], 
    addFichaVisita, 
    updateFichaVisita, 
    deleteFichaVisita, 
    profile,
    portalUsers = []
  } = useApp();

  // View modes: 'list' | 'form' | 'print'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Print state
  const [printData, setPrintData] = useState(null);
  const [isBlankPrint, setIsBlankPrint] = useState(false);

  // List filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Client Share Link Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Ficha Name inline state
  const [isEditingFichaName, setIsEditingFichaName] = useState(false);
  const [customFichaName, setCustomFichaName] = useState('');

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

    // Integração Site Oficial Araújo Imóveis
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
    origemCaptacao: 'WhatsApp',
    status: 'Aguardando agendamento'
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-generate code when opening form for new entry
  useEffect(() => {
    if (viewMode === 'form' && !editingId && !formData.codigoImovel) {
      const count = (fichasVisita?.length || 0) + 1;
      const autoCode = `VT-${String(count).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, codigoImovel: autoCode }));
    }
  }, [viewMode, editingId, fichasVisita]);

  // Reset form
  const resetForm = () => {
    const count = (fichasVisita?.length || 0) + 1;
    const autoCode = `VT-${String(count).padStart(4, '0')}`;
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

      finalidadeImovel: ficha.finalidadeImovel || 'alugar',
      valorImovel: ficha.valorImovel !== undefined ? ficha.valorImovel : '',
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (editingId) {
      updateFichaVisita(editingId, formData);
      setSuccessMsg('Ficha de Visita atualizada e sincronizada com o site oficial!');
    } else {
      const newFicha = addFichaVisita(formData);
      setEditingId(newFicha.id);
      setSuccessMsg('Ficha salva! Imóvel publicado no site oficial e usuário do proprietário criado.');
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

  // List filtering
  const filteredFichas = fichasVisita.filter(f => {
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
          <button 
            type="button"
            onClick={() => {
              handleCopyClientLink();
              setShowShareModal(true);
            }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.625rem 1.125rem', 
              borderRadius: 'var(--border-radius-sm)', 
              backgroundColor: '#0284c7', 
              color: '#ffffff', 
              border: 'none',
              fontWeight: '700',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Share2 size={16} style={{ color: '#ffffff' }} />
            <span>Gerar Link para Cliente</span>
          </button>

          {viewMode === 'list' ? (
            <>
              <button 
                type="button"
                onClick={handlePrintBlank}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.625rem 1.125rem', 
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>Imprimir em Branco</span>
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
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{fichasVisita.length}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Aguardando / Agendadas</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {fichasVisita.filter(f => f.status === 'Aguardando agendamento' || f.status === 'Agendado').length}
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
                  {fichasVisita.filter(f => f.status === 'Confirmado' || f.status === 'Realizado').length}
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
                  placeholder="Buscar por proprietário, código (ex: VT-0001), bairro, endereço..."
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
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)', display: 'block' }}>{f.tipoImovel} - {f.bairroImovel}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{f.enderecoImovel}</span>
                          {f.imagensImovel && f.imagensImovel.length > 0 && (
                            <div style={{ marginTop: '3px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--accent-cyan)', backgroundColor: 'rgba(56, 189, 248, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                                <Camera size={11} /> {f.imagensImovel.length} foto(s)
                              </span>
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
          VIEW MODE 2: FORMULÁRIO COMPLETO
         ==================================== */}
      {viewMode === 'form' && (
        <form onSubmit={handleSaveFicha} className="ficha-form-container">
          
          {/* Top Floating Action Bar */}
          <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', position: 'sticky', top: '0', zIndex: 10 }}>
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
                    placeholder="Nome da ficha (ex: VT-0001 ou Casa Limoeiro)..."
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
                <label className="form-label">E-mail:</label>
                <input 
                  type="email"
                  className={`form-input ${formErrors.emailProprietario ? 'input-error' : ''}`}
                  placeholder="proprietario@email.com"
                  value={formData.emailProprietario}
                  onChange={e => handleFieldChange('emailProprietario', e.target.value)}
                />
                {formErrors.emailProprietario && <span className="error-text">{formErrors.emailProprietario}</span>}
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

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Link do WhatsApp:</span>
                  {formData.linkWhatsapp && (
                    <a 
                      href={formData.linkWhatsapp.startsWith('http') ? formData.linkWhatsapp : `https://${formData.linkWhatsapp}`}
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
                    type="url"
                    className="form-input"
                    placeholder="https://wa.me/5537999999999"
                    value={formData.linkWhatsapp || ''}
                    onChange={e => handleFieldChange('linkWhatsapp', e.target.value)}
                  />
                  {formData.telefoneProprietario && !formData.linkWhatsapp && (
                    <button
                      type="button"
                      onClick={() => {
                        const digits = formData.telefoneProprietario.replace(/\D/g, '');
                        if (digits) {
                          const fullNumber = digits.length <= 11 ? `55${digits}` : digits;
                          handleFieldChange('linkWhatsapp', `https://wa.me/${fullNumber}`);
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}
                      title="Gerar link automaticamente a partir do telefone informado"
                    >
                      Gerar Link
                    </button>
                  )}
                </div>
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
                <label className="form-label">Link da Localização (Google Maps / Waze):</label>
                <input 
                  type="url"
                  className="form-input"
                  placeholder="https://maps.google.com/..."
                  value={formData.linkLocalizacaoImovel}
                  onChange={e => handleFieldChange('linkLocalizacaoImovel', e.target.value)}
                />
              </div>

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

              <div className="form-group span-2">
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
