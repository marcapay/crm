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
  Check
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
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',
    horarioContatoProprietario: 'Comercial (08:00 às 18:00)',
    
    tipoImovel: 'Casa',
    enderecoImovel: '',
    bairroImovel: '',
    pontoReferenciaImovel: '',
    linkLocalizacaoImovel: '',
    ocupacaoImovel: 'Vazio',
    nomeAcesso: '',
    telefoneAcesso: '',
    dificuldadeAcesso: 'Não',
    aguaLigada: 'Sim',
    energiaLigada: 'Sim',
    animaisImovel: 'Não',
    observacoesImovel: '',

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
      nomeProprietario: '',
      telefoneProprietario: '',
      emailProprietario: '',
      horarioContatoProprietario: 'Comercial (08:00 às 18:00)',
      
      tipoImovel: 'Casa',
      enderecoImovel: '',
      bairroImovel: '',
      pontoReferenciaImovel: '',
      linkLocalizacaoImovel: '',
      ocupacaoImovel: 'Vazio',
      nomeAcesso: '',
      telefoneAcesso: '',
      dificuldadeAcesso: 'Não',
      aguaLigada: 'Sim',
      energiaLigada: 'Sim',
      animaisImovel: 'Não',
      observacoesImovel: '',

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
      nomeProprietario: ficha.nomeProprietario || '',
      telefoneProprietario: ficha.telefoneProprietario || '',
      emailProprietario: ficha.emailProprietario || '',
      horarioContatoProprietario: ficha.horarioContatoProprietario || '',
      
      tipoImovel: ficha.tipoImovel || 'Casa',
      enderecoImovel: ficha.enderecoImovel || '',
      bairroImovel: ficha.bairroImovel || '',
      pontoReferenciaImovel: ficha.pontoReferenciaImovel || '',
      linkLocalizacaoImovel: ficha.linkLocalizacaoImovel || '',
      ocupacaoImovel: ficha.ocupacaoImovel || 'Vazio',
      nomeAcesso: ficha.nomeAcesso || '',
      telefoneAcesso: ficha.telefoneAcesso || '',
      dificuldadeAcesso: ficha.dificuldadeAcesso || 'Não',
      aguaLigada: ficha.aguaLigada || 'Sim',
      energiaLigada: ficha.energiaLigada || 'Sim',
      animaisImovel: ficha.animaisImovel || 'Não',
      observacoesImovel: ficha.observacoesImovel || '',

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
      setSuccessMsg('Ficha de Visita Técnica atualizada com sucesso!');
    } else {
      const newFicha = addFichaVisita(formData);
      setEditingId(newFicha.id);
      setSuccessMsg('Ficha de Visita Técnica salva com sucesso!');
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
              className="btn-glass-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 'var(--border-radius-sm)' }}
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
                          <span style={{ fontWeight: '700', color: 'var(--accent-cyan)', display: 'block' }}>{f.codigoImovel}</span>
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
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'sticky', top: '0', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                {editingId ? `Editando Ficha: ${formData.codigoImovel}` : 'Nova Ficha 01'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={() => setViewMode('list')}
                className="btn-glass-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                Voltar
              </button>

              <button 
                type="button" 
                onClick={resetForm}
                className="btn-glass-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                Cancelar
              </button>

              <button 
                type="button" 
                onClick={handlePrintBlank}
                className="btn-glass-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                Imprimir em Branco
              </button>

              <button 
                type="button" 
                onClick={() => handlePrintFilled()}
                className="btn-glass-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                Imprimir Preenchida
              </button>

              <button 
                type="submit"
                className="btn-glass-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
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

              <div className="form-group span-2">
                <label className="form-label">Melhor Horário para Contato:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ex: Período da manhã, após 14h, etc."
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
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setViewMode('list')}
              className="btn-glass-secondary"
            >
              Voltar para Lista
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-glass-secondary"
              >
                Cancelar
              </button>

              <button 
                type="button" 
                onClick={handlePrintBlank}
                className="btn-glass-secondary"
              >
                Imprimir em Branco
              </button>

              <button 
                type="button" 
                onClick={() => handlePrintFilled()}
                className="btn-glass-secondary"
              >
                Imprimir Preenchida
              </button>

              <button 
                type="submit"
                className="btn-glass-primary"
                style={{ padding: '0.625rem 1.5rem', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
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
                className="btn-glass-secondary"
                style={{ padding: '0.75rem 1.25rem', borderRadius: '8px' }}
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
