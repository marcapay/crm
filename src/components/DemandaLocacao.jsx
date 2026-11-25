import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  calculateMatch, 
  findMatchesForDemand, 
  parsePriceRange 
} from '../utils/demandMatching';
import { 
  Search, 
  Plus, 
  Share2, 
  Copy, 
  QrCode, 
  Filter, 
  Columns, 
  List, 
  TrendingUp, 
  Users, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  Tag, 
  ChevronRight, 
  Home, 
  DollarSign, 
  Eye, 
  Trash2, 
  Edit3, 
  Send,
  ShieldCheck,
  AlertTriangle,
  FileText,
  BarChart3,
  MapPin
} from 'lucide-react';

export const STATUS_DEMANDAS = [
  { id: 'nova', label: 'Nova demanda', color: '#38bdf8' },
  { id: 'aguardando_contato', label: 'Aguardando contato', color: '#f59e0b' },
  { id: 'em_atendimento', label: 'Em atendimento', color: '#60a5fa' },
  { id: 'buscando_imovel', label: 'Buscando imóvel', color: '#818cf8' },
  { id: 'imoveis_encontrados', label: 'Imóveis encontrados', color: '#a78bfa' },
  { id: 'imoveis_apresentados', label: 'Imóveis apresentados', color: '#c084fc' },
  { id: 'visita_agendada', label: 'Visita agendada', color: '#f43f5e' },
  { id: 'em_negociacao', label: 'Em negociação', color: '#fb923c' },
  { id: 'locacao_concluida', label: 'Locação concluída', color: '#10b981' },
  { id: 'busca_suspensa', label: 'Busca suspensa', color: '#94a3b8' },
  { id: 'demanda_encerrada', label: 'Demanda encerrada', color: '#64748b' }
];

export const INITIAL_MOCK_DEMANDAS = [
  {
    id: 'demanda_1',
    codigo: 'DL-1042',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'nova',
    nomeCliente: 'Lucas Henrique Mendes',
    telefoneCliente: '(33) 98844-1234',
    emailCliente: 'lucas.mendes@email.com',
    melhorHorario: 'Tarde (13:00 às 18:00)',
    cidade: 'Caratinga',
    bairros: ['Centro', 'Santa Zita'],
    semPreferenciaLocalizacao: false,
    aceitaOutrosBairros: true,
    tiposImovel: ['Apartamento'],
    orcamentoFaixa: '1000_1500',
    orcamentoValor: '1400',
    incluiCondominioIptu: true,
    quartos: '2',
    quartosIndispensavel: true,
    banheiros: '1',
    vagas: '1',
    vagasIndispensavel: false,
    caracteristicasIndispensaveis: ['Elevador'],
    caracteristicasDesejaveis: ['Varanda / Sacada', 'Área de Serviço'],
    urgencia: 'imediata',
    observacoes: 'Precisa se mudar urgente pois foi transferido para trabalhar no centro de Caratinga.',
    origem: 'link_publico',
    historicoAtendimento: [
      { data: new Date(Date.now() - 3600000 * 4).toISOString(), tipo: 'criacao', descricao: 'Demanda recebida pelo Link Público de Captação' }
    ]
  },
  {
    id: 'demanda_2',
    codigo: 'DL-1041',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'em_atendimento',
    nomeCliente: 'Mariana Castro Ribeiro',
    telefoneCliente: '(33) 99123-5566',
    emailCliente: 'mari.castro@gmail.com',
    melhorHorario: 'Manhã',
    cidade: 'Caratinga',
    bairros: ['Santa Zita', 'Esperança', 'Limoeiro'],
    semPreferenciaLocalizacao: false,
    aceitaOutrosBairros: false,
    tiposImovel: ['Casa', 'Casa em condomínio'],
    orcamentoFaixa: '1500_2000',
    orcamentoValor: '1800',
    incluiCondominioIptu: false,
    quartos: '3',
    quartosIndispensavel: true,
    banheiros: '2',
    vagas: '2',
    vagasIndispensavel: true,
    caracteristicasIndispensaveis: ['Área externa / Quintal', 'Aceita Animais (Pet Friendly)'],
    caracteristicasDesejaveis: ['Área de Lazer / Piscina'],
    urgencia: '15_dias',
    observacoes: 'Família com 2 crianças e 1 cachorro de porte médio. Procura casa arejada com quintal.',
    origem: 'whatsapp',
    historicoAtendimento: [
      { data: new Date(Date.now() - 3600000 * 24).toISOString(), tipo: 'criacao', descricao: 'Cadastrado pelo corretor via contato de WhatsApp' },
      { data: new Date(Date.now() - 3600000 * 18).toISOString(), tipo: 'contato', descricao: 'Primeiro contato realizado. Cliente solicitou opções com quintal murado.' }
    ]
  },
  {
    id: 'demanda_3',
    codigo: 'DL-1040',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'imoveis_encontrados',
    nomeCliente: 'Dr. Roberto Silveira',
    telefoneCliente: '(33) 99876-0099',
    emailCliente: 'consultorio.silveira@hotmail.com',
    melhorHorario: 'Qualquer horário',
    cidade: 'Caratinga',
    bairros: ['Centro'],
    semPreferenciaLocalizacao: false,
    aceitaOutrosBairros: false,
    tiposImovel: ['Sala comercial'],
    orcamentoFaixa: '800_1000',
    orcamentoValor: '900',
    incluiCondominioIptu: true,
    quartos: '0',
    banheiros: '1',
    vagas: '0',
    caracteristicasIndispensaveis: ['Localização Central de Alto Fluxo', 'Banheiro para Clientes'],
    caracteristicasDesejaveis: ['Acesso Direto pela Rua (Sem degraus)'],
    atividadeComercial: 'Consultório de Psicologia',
    urgencia: '30_dias',
    observacoes: 'Procura sala silenciosa para atendimento clínico.',
    origem: 'link_publico',
    historicoAtendimento: [
      { data: new Date(Date.now() - 3600000 * 48).toISOString(), tipo: 'criacao', descricao: 'Demanda recebida pelo Link Público' }
    ]
  }
];

export default function DemandaLocacao() {
  const { 
    properties = [], 
    fichasVisita = [], 
    profile, 
    demandasLocacao: contextDemandas, 
    setDemandasLocacao: setContextDemandas 
  } = useApp();

  // Local state for demands (persists in localStorage and syncs with AppContext)
  const [demandas, setDemandas] = useState(() => {
    try {
      const saved = localStorage.getItem('araujo_demandas_locacao');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_MOCK_DEMANDAS;
  });

  // Sync to localStorage
  const updateDemandasState = (newDemandas) => {
    setDemandas(newDemandas);
    try {
      localStorage.setItem('araujo_demandas_locacao', JSON.stringify(newDemandas));
    } catch (e) {}
    if (setContextDemandas) setContextDemandas(newDemandas);
  };

  // View Mode: 'lista' | 'kanban'
  const [viewMode, setViewMode] = useState('lista');

  // Sub Tab: 'demandas' | 'matching' | 'oportunidades'
  const [activeTab, setActiveTab] = useState('demandas');

  // Selected Demand for Modal Details
  const [selectedDemand, setSelectedDemand] = useState(null);

  // Modal manual creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterBairro, setFilterBairro] = useState('todos');
  const [filterUrgencia, setFilterUrgencia] = useState('todos');

  // New Note state in details modal
  const [newNoteText, setNewNoteText] = useState('');

  // All combined available rental properties for matching
  const allRentalProperties = useMemo(() => {
    const list = [];

    // 1. From properties
    (properties || []).forEach(p => {
      const fin = (p.finalidade || p.finalidadeImovel || p.modality || '').toLowerCase();
      if (fin.includes('alug') || fin.includes('loca') || !fin) {
        list.push({
          id: p.id,
          codigo: p.code || p.codigo || `IM-${p.id}`,
          titulo: p.title || p.titulo || `${p.tipo || 'Imóvel'} para Alugar`,
          tipo: p.type || p.tipo || 'Casa',
          bairro: p.neighborhood || p.bairro || 'Centro',
          cidade: p.city || p.cidade || 'Caratinga',
          valorImovel: p.price || p.valor || p.valorImovel || 0,
          valorCondominio: p.condo || p.valorCondominio || 0,
          iptuAnual: p.iptu || p.iptuAnual || 0,
          quartos: p.bedrooms || p.quartos || 0,
          banheiros: p.bathrooms || p.banheiros || 0,
          vagas: p.parking || p.vagas || 0,
          diferenciais: p.features || p.diferenciais || [],
          fotoPrincipal: (p.images && p.images[0]) || p.foto || p.image || '/araujo-bg.jpg',
          status: p.status || 'Disponível',
          linkOriginal: p
        });
      }
    });

    // 2. From fichasVisita
    (fichasVisita || []).forEach(f => {
      const fin = (f.finalidadeImovel || f.modalidadePretendida || '').toLowerCase();
      if (fin.includes('alug') || fin.includes('loca') || !fin) {
        if (!list.some(item => item.id === f.id || item.codigo === f.codigoImovel)) {
          list.push({
            id: f.id,
            codigo: f.codigoImovel || `AI-${f.id}`,
            titulo: f.tituloAnuncio || f.nomeFicha || `${f.tipoImovel || 'Imóvel'} em ${f.bairroImovel || 'Caratinga'}`,
            tipo: f.tipoImovel || 'Casa',
            bairro: f.bairroImovel || f.bairro || 'Centro',
            cidade: f.cidadeImovel || f.cidade || 'Caratinga',
            valorImovel: f.valorPretendido || f.valorImovel || 0,
            valorCondominio: f.valorCondominio || 0,
            iptuAnual: f.iptuAnual || 0,
            quartos: f.quartos || 0,
            banheiros: f.banheiros || 0,
            vagas: f.vagasGaragem || f.vagas || 0,
            diferenciais: f.diferenciais || [],
            fotoPrincipal: (f.fotos && f.fotos[0]) || (f.imagensImovel && f.imagensImovel[0]) || '/araujo-bg.jpg',
            status: f.status || 'Disponível',
            linkOriginal: f
          });
        }
      }
    });

    return list;
  }, [properties, fichasVisita]);

  // Compute stats / KPIs
  const stats = useMemo(() => {
    const totalAtivas = demandas.filter(d => !['locacao_concluida', 'demanda_encerrada'].includes(d.status)).length;
    const novas = demandas.filter(d => d.status === 'nova').length;
    const urgentes = demandas.filter(d => ['imediata', '7_dias'].includes(d.urgencia) && !['locacao_concluida', 'demanda_encerrada'].includes(d.status)).length;
    const emAtendimento = demandas.filter(d => ['em_atendimento', 'buscando_imovel', 'imoveis_apresentados'].includes(d.status)).length;
    const concluidas = demandas.filter(d => d.status === 'locacao_concluida').length;
    const visitas = demandas.filter(d => d.status === 'visita_agendada').length;

    // Matching counts
    let comImoveisCompativeis = 0;
    let semImoveisCompativeis = 0;

    demandas.forEach(d => {
      if (!['locacao_concluida', 'demanda_encerrada'].includes(d.status)) {
        const matches = findMatchesForDemand(d, allRentalProperties);
        if (matches.length > 0 && matches[0].score >= 60) {
          comImoveisCompativeis++;
        } else {
          semImoveisCompativeis++;
        }
      }
    });

    return {
      totalAtivas,
      novas,
      urgentes,
      emAtendimento,
      comImoveisCompativeis,
      semImoveisCompativeis,
      concluidas,
      visitas
    };
  }, [demandas, allRentalProperties]);

  // Filtered Demands
  const filteredDemandas = useMemo(() => {
    return demandas.filter(item => {
      // Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchSearch = 
          (item.nomeCliente || '').toLowerCase().includes(s) ||
          (item.telefoneCliente || '').includes(s) ||
          (item.codigo || '').toLowerCase().includes(s) ||
          (item.bairros || []).some(b => b.toLowerCase().includes(s)) ||
          (item.tiposImovel || []).some(t => t.toLowerCase().includes(s));
        if (!matchSearch) return false;
      }

      // Status
      if (filterStatus !== 'todos' && item.status !== filterStatus) {
        return false;
      }

      // Tipo
      if (filterTipo !== 'todos') {
        const tipos = item.tiposImovel || [];
        if (!tipos.includes(filterTipo)) return false;
      }

      // Bairro
      if (filterBairro !== 'todos') {
        const bairros = item.bairros || [];
        if (!bairros.includes(filterBairro) && !item.semPreferenciaLocalizacao) return false;
      }

      // Urgência
      if (filterUrgencia !== 'todos' && item.urgencia !== filterUrgencia) {
        return false;
      }

      return true;
    });
  }, [demandas, searchTerm, filterStatus, filterTipo, filterBairro, filterUrgencia]);

  // Public Link URLs
  const publicLink = typeof window !== 'undefined'
    ? `${window.location.origin}/demanda-de-locacao`
    : 'https://crmaraujoimoveis.vercel.app/demanda-de-locacao';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicLink);
      setCopyToast('Link copiado para a área de transferência!');
      setTimeout(() => setCopyToast(''), 3500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏠 Procurando imóvel para alugar em Caratinga e região?\n\nAcesse o formulário oficial da Araújo Imóveis e conte o que você precisa. Nossa equipe encontra as melhores oportunidades para você!\n\n👉 Acesse agora: ${publicLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Change demand status
  const handleChangeStatus = (demandId, newStatus) => {
    const updated = demandas.map(d => {
      if (d.id === demandId) {
        const statusObj = STATUS_DEMANDAS.find(s => s.id === newStatus);
        const historyItem = {
          data: new Date().toISOString(),
          tipo: 'status',
          descricao: `Status alterado para "${statusObj?.label || newStatus}" por ${profile?.name || 'Corretor'}`
        };
        return {
          ...d,
          status: newStatus,
          historicoAtendimento: [...(d.historicoAtendimento || []), historyItem]
        };
      }
      return d;
    });
    updateDemandasState(updated);
    if (selectedDemand && selectedDemand.id === demandId) {
      setSelectedDemand(prev => ({
        ...prev,
        status: newStatus,
        historicoAtendimento: [
          ...(prev.historicoAtendimento || []),
          {
            data: new Date().toISOString(),
            tipo: 'status',
            descricao: `Status alterado para "${newStatus}"`
          }
        ]
      }));
    }
  };

  // Add internal note in details modal
  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedDemand) return;

    const newHistory = {
      data: new Date().toISOString(),
      tipo: 'nota',
      autor: profile?.name || 'Corretor',
      descricao: newNoteText.trim()
    };

    const updated = demandas.map(d => {
      if (d.id === selectedDemand.id) {
        return {
          ...d,
          historicoAtendimento: [...(d.historicoAtendimento || []), newHistory]
        };
      }
      return d;
    });

    updateDemandasState(updated);
    setSelectedDemand(prev => ({
      ...prev,
      historicoAtendimento: [...(prev.historicoAtendimento || []), newHistory]
    }));
    setNewNoteText('');
  };

  // Delete demand
  const handleDeleteDemand = (id) => {
    if (confirm('Tem certeza que deseja excluir esta demanda?')) {
      const updated = demandas.filter(d => d.id !== id);
      updateDemandasState(updated);
      if (selectedDemand?.id === id) setSelectedDemand(null);
    }
  };

  // Send WhatsApp to Client with Matched Property
  const handleSendMatchOnWhatsApp = (demand, property, matchScore) => {
    const cleanPhone = (demand.telefoneCliente || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${demand.nomeCliente || 'tudo bem'}! Aqui é da Araújo Imóveis.\n\n` +
      `Localizamos um imóvel com *${matchScore}% de compatibilidade* com a sua procura:\n\n` +
      `🏠 *${property.titulo}*\n` +
      `📍 Bairro: ${property.bairro}, ${property.cidade}\n` +
      `💰 Aluguel: R$ ${Number(property.valorImovel || 0).toLocaleString('pt-BR')}\n` +
      `🛏️ Quartos: ${property.quartos} | 🚗 Vagas: ${property.vagas}\n\n` +
      `Gostaria de ver fotos e agendar uma visita? Estou à disposição!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  // Manual Creation State Form
  const [newDemandForm, setNewDemandForm] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    tipos: ['Apartamento'],
    cidade: 'Caratinga',
    bairros: ['Centro'],
    orcamentoFaixa: '1000_1500',
    quartos: '2',
    vagas: '1',
    urgencia: '15_dias',
    observacoes: ''
  });

  const handleCreateManualDemand = (e) => {
    e.preventDefault();
    if (!newDemandForm.nome || !newDemandForm.whatsapp) {
      alert('Nome e WhatsApp são obrigatórios!');
      return;
    }

    const count = Math.floor(1000 + Math.random() * 9000);
    const code = `DL-${count}`;
    const now = new Date().toISOString();

    const created = {
      id: `demanda_${Date.now()}`,
      codigo: code,
      createdAt: now,
      status: 'nova',
      nomeCliente: newDemandForm.nome,
      telefoneCliente: newDemandForm.whatsapp,
      emailCliente: newDemandForm.email,
      cidade: newDemandForm.cidade || 'Caratinga',
      bairros: newDemandForm.bairros,
      tiposImovel: newDemandForm.tipos,
      orcamentoFaixa: newDemandForm.orcamentoFaixa,
      quartos: newDemandForm.quartos,
      vagas: newDemandForm.vagas,
      urgencia: newDemandForm.urgencia,
      observacoes: newDemandForm.observacoes,
      origem: 'manual_crm',
      historicoAtendimento: [
        {
          data: now,
          tipo: 'criacao',
          descricao: `Demanda cadastrada manualmente no CRM por ${profile?.name || 'Corretor'}`
        }
      ]
    };

    updateDemandasState([created, ...demandas]);
    setShowCreateModal(false);
    setSelectedDemand(created);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>

      {/* Toast Notification */}
      {copyToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--text-primary)',
          color: 'var(--bg-primary)',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '0.875rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {copyToast}
        </div>
      )}

      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Demanda de Locação
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--glass-highlight)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)'
            }}>
              {demandas.length} cadastrada(s)
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Cadastro, acompanhamento e cruzamento inteligente das necessidades dos clientes que procuram imóveis para alugar.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-secondary"
            title="Copiar endereço do link público"
          >
            <Copy size={15} /> Copiar Link Público
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="btn btn-secondary"
            title="Divulgar link pelo WhatsApp"
          >
            <Share2 size={15} /> Compartilhar no WhatsApp
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="btn btn-secondary"
            title="Gerar QR Code para impressão ou stories"
          >
            <QrCode size={15} /> Gerar QR Code
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ fontWeight: '700' }}
          >
            <Plus size={16} /> Cadastrar Demanda Manual
          </button>
        </div>
      </div>

      {/* 8 Indicadores / Métricas do Topo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {[
          { label: 'Demandas Ativas', val: stats.totalAtivas, icon: Users, color: 'var(--text-primary)' },
          { label: 'Novas Demandas', val: stats.novas, icon: Sparkles, color: '#38bdf8', badge: stats.novas > 0 ? 'Novas' : null },
          { label: 'Com Urgência', val: stats.urgentes, icon: Clock, color: '#f59e0b' },
          { label: 'Em Atendimento', val: stats.emAtendimento, icon: MessageSquare, color: '#60a5fa' },
          { label: 'Com Imóveis Compatíveis', val: stats.comImoveisCompativeis, icon: CheckCircle2, color: '#10b981' },
          { label: 'Visitas Agendadas', val: stats.visitas, icon: Calendar, color: '#f43f5e' },
          { label: 'Locações Concluídas', val: stats.concluidas, icon: Building2, color: '#10b981' },
          { label: 'Sem Imóvel (Captação)', val: stats.semImoveisCompativeis, icon: AlertTriangle, color: '#f97316' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {kpi.label}
                </span>
                <Icon size={16} style={{ color: kpi.color }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {kpi.val}
                </strong>
                {kpi.badge && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '700' }}>
                    {kpi.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub Tabs Navigation: Demandas | Cruzamento | Oportunidades */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'demandas', label: 'Painel de Demandas', icon: Users },
            { id: 'matching', label: 'Cruzamento com a Carteira', icon: Sparkles },
            { id: 'oportunidades', label: 'Oportunidades de Captação', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--border-radius-sm)',
                  border: isActive ? '1px solid var(--text-primary)' : '1px solid transparent',
                  backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                  color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'demandas' && (
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'lista' ? 'var(--glass-highlight)' : 'transparent',
                color: viewMode === 'lista' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'lista' ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <List size={14} /> Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'kanban' ? 'var(--glass-highlight)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'kanban' ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Columns size={14} /> Kanban
            </button>
          </div>
        )}
      </div>

      {/* ============================================================
          TAB 1: PAINEL DE DEMANDAS (LISTA OU KANBAN)
         ============================================================ */}
      {activeTab === 'demandas' && (
        <div>
          {/* Filters Bar */}
          <div className="glass-panel" style={{
            padding: '0.85rem 1.15rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            {/* Search input */}
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Buscar por nome, telefone, código ou bairro..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.1rem', fontSize: '0.82rem' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="form-input"
              style={{ flex: '0 1 170px', fontSize: '0.82rem' }}
            >
              <option value="todos">Todos os Status</option>
              {STATUS_DEMANDAS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {/* Tipo Imóvel Filter */}
            <select
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              className="form-input"
              style={{ flex: '0 1 150px', fontSize: '0.82rem' }}
            >
              <option value="todos">Todos os Tipos</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Kitnet">Kitnet</option>
              <option value="Casa em condomínio">Casa em Condomínio</option>
              <option value="Cobertura">Cobertura</option>
              <option value="Loja comercial">Loja Comercial</option>
              <option value="Sala comercial">Sala Comercial</option>
            </select>

            {/* Urgência Filter */}
            <select
              value={filterUrgencia}
              onChange={e => setFilterUrgencia(e.target.value)}
              className="form-input"
              style={{ flex: '0 1 140px', fontSize: '0.82rem' }}
            >
              <option value="todos">Qualquer Urgência</option>
              <option value="imediata">🚨 Imediata</option>
              <option value="7_dias">Dentro de 7 dias</option>
              <option value="15_dias">Dentro de 15 dias</option>
              <option value="30_dias">Dentro de 30 dias</option>
              <option value="sem_pressa">Sem pressa</option>
            </select>

            {(searchTerm || filterStatus !== 'todos' || filterTipo !== 'todos' || filterUrgencia !== 'todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('todos');
                  setFilterTipo('todos');
                  setFilterBairro('todos');
                  setFilterUrgencia('todos');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
              >
                <X size={14} /> Limpar Filtros
              </button>
            )}
          </div>

          {/* VIEW MODE: LISTA */}
          {viewMode === 'lista' && (
            <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-highlight)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Código</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Cliente & Contato</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Imóvel Desejado</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Bairros de Preferência</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Orçamento</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Urgência</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Compatibilidade</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandas.length > 0 ? (
                    filteredDemandas.map(demanda => {
                      const statusObj = STATUS_DEMANDAS.find(s => s.id === demanda.status) || STATUS_DEMANDAS[0];
                      const matches = findMatchesForDemand(demanda, allRentalProperties);
                      const bestMatch = matches.length > 0 ? matches[0] : null;

                      return (
                        <tr 
                          key={demanda.id}
                          style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.15s ease' }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {demanda.codigo}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                              {demanda.nomeCliente}
                            </strong>
                            <a
                              href={`https://wa.me/55${(demanda.telefoneCliente || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Phone size={12} style={{ color: '#10b981' }} /> {demanda.telefoneCliente}
                            </a>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                              {(demanda.tiposImovel || []).join(', ') || 'Qualquer'}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {demanda.quartos ? `${demanda.quartos} qts` : ''} {demanda.vagas ? `• ${demanda.vagas} vagas` : ''}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {demanda.semPreferenciaLocalizacao ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                Sem preferência
                              </span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '180px' }}>
                                {(demanda.bairros || []).slice(0, 2).map(b => (
                                  <span key={b} style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--glass-highlight)', border: '1px solid var(--glass-border)' }}>
                                    {b}
                                  </span>
                                ))}
                                {(demanda.bairros || []).length > 2 && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                    +{(demanda.bairros || []).length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {demanda.orcamentoValor 
                              ? `R$ ${Number(demanda.orcamentoValor).toLocaleString('pt-BR')}`
                              : parsePriceRange(demanda.orcamentoFaixa).label}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: demanda.urgencia === 'imediata' ? 'rgba(239, 68, 68, 0.15)' : 'var(--glass-highlight)',
                              color: demanda.urgencia === 'imediata' ? '#f87171' : 'var(--text-secondary)',
                              border: demanda.urgencia === 'imediata' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)'
                            }}>
                              {demanda.urgencia === 'imediata' ? '🚨 Imediata' : (demanda.urgencia || 'Normal')}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {bestMatch && bestMatch.score >= 50 ? (
                              <span 
                                onClick={() => setSelectedDemand(demanda)}
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: bestMatch.score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                  color: bestMatch.score >= 80 ? '#34d399' : 'var(--accent-cyan)',
                                  border: bestMatch.score >= 80 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="Clique para ver imóveis compatíveis"
                              >
                                <Sparkles size={11} /> {bestMatch.score}% ({matches.length})
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                                Sem match direto
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              value={demanda.status}
                              onChange={e => handleChangeStatus(demanda.id, e.target.value)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                border: '1px solid var(--glass-border)',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: statusObj.color,
                                cursor: 'pointer'
                              }}
                            >
                              {STATUS_DEMANDAS.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedDemand(demanda)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              <Eye size={13} /> Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhuma demanda de locação encontrada com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW MODE: KANBAN COM AS 11 ETAPAS */}
          {viewMode === 'kanban' && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
              minHeight: '600px'
            }}>
              {STATUS_DEMANDAS.map(col => {
                const colDemandas = filteredDemandas.filter(d => d.status === col.id);
                return (
                  <div
                    key={col.id}
                    style={{
                      flex: '0 0 280px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '75vh'
                    }}
                  >
                    {/* Column Header */}
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--glass-highlight)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                        <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {col.label}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {colDemandas.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div style={{ padding: '0.65rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      {colDemandas.map(item => {
                        const matches = findMatchesForDemand(item, allRentalProperties);
                        const best = matches.length > 0 ? matches[0] : null;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedDemand(item)}
                            className="glass-card glass-card-hover"
                            style={{
                              padding: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>
                                {item.codigo}
                              </span>
                              {item.urgencia === 'imediata' && (
                                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                                  🚨 Imediata
                                </span>
                              )}
                            </div>

                            <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              {item.nomeCliente}
                            </strong>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              🏠 {(item.tiposImovel || []).join(', ')}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              📍 {item.bairros && item.bairros.length ? item.bairros.slice(0, 2).join(', ') : 'Qualquer bairro'}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.35rem', borderTop: '1px solid var(--glass-border)' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {item.orcamentoValor ? `R$ ${item.orcamentoValor}` : parsePriceRange(item.orcamentoFaixa).label}
                              </span>

                              {best && best.score >= 50 && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: '700',
                                  color: '#34d399',
                                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}>
                                  {best.score}% Match
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {colDemandas.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          Nenhuma demanda nesta etapa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 2: CRUZAMENTO INTELIGENTE COM A CARTEIRA
         ============================================================ */}
      {activeTab === 'matching' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} /> Cruzamento Automático de Compatibilidade (Smart Matching)
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Nosso algoritmo analisa tipo de imóvel, bairros, faixas de aluguel e requisitos indispensáveis para apontar os melhores pares cliente-imóvel.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem' }}>
            {demandas.filter(d => !['locacao_concluida', 'demanda_encerrada'].includes(d.status)).map(demanda => {
              const matches = findMatchesForDemand(demanda, allRentalProperties);

              return (
                <div key={demanda.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  {/* Demanda Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.65rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>{demanda.codigo}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.1rem 0' }}>{demanda.nomeCliente}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Procura: <strong>{(demanda.tiposImovel || []).join(', ')}</strong> em <strong>{(demanda.bairros || []).join(', ') || 'Caratinga'}</strong>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--glass-highlight)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {matches.length} compatíveis
                    </span>
                  </div>

                  {/* Top Matched Properties */}
                  {matches.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {matches.slice(0, 2).map((item, i) => (
                        <div 
                          key={i} 
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            gap: '0.75rem'
                          }}
                        >
                          <img 
                            src={item.imovel.fotoPrincipal} 
                            alt={item.imovel.titulo} 
                            style={{ width: '75px', height: '75px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>
                                {item.imovel.codigo}
                              </span>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: item.score >= 80 ? '#34d399' : 'var(--accent-cyan)'
                              }}>
                                ★ {item.score}% Match
                              </span>
                            </div>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.imovel.titulo}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              📍 {item.imovel.bairro} • R$ {Number(item.imovel.valorImovel || 0).toLocaleString('pt-BR')}
                            </div>

                            {/* Reasons */}
                            <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {item.reasons.slice(0, 2).map((r, ri) => (
                                <span key={ri} style={{ fontSize: '0.65rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                                  ✓ {r}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSendMatchOnWhatsApp(demanda, item.imovel, item.score)}
                              className="btn btn-secondary"
                              style={{ marginTop: '0.45rem', fontSize: '0.72rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <MessageSquare size={12} style={{ color: '#10b981' }} /> Enviar no WhatsApp
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ⚠️ Nenhum imóvel na carteira atende aos requisitos desta demanda no momento.
                      <div style={{ marginTop: '0.35rem', color: '#f97316', fontWeight: '600', fontSize: '0.75rem' }}>
                        Oportunidade para a equipe de captação!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: OPORTUNIDADES DE CAPTAÇÃO (INTELIGÊNCIA COMERCIAL)
         ============================================================ */}
      {activeTab === 'oportunidades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} /> Oportunidades de Captação Direcionada
            </h3>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Identifique exatamente o que os clientes estão buscando em Caratinga e onde há escassez de imóveis para alugar. Use estas informações para orientar seus corretores na captação de novos proprietários.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Bairros mais procurados */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> Bairros com Maior Procura de Locação
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { bairro: 'Centro', demandas: 8, oferta: 4, deficit: true },
                  { bairro: 'Santa Zita', demandas: 6, oferta: 2, deficit: true },
                  { bairro: 'Esperança', demandas: 4, oferta: 3, deficit: false },
                  { bairro: 'Limoeiro', demandas: 3, oferta: 1, deficit: true },
                  { bairro: 'Dário Grossi', demandas: 2, oferta: 0, deficit: true }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.bairro}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.demandas} clientes</span>
                      {item.deficit && (
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: '700' }}>
                          Falta Imóvel
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos mais desejados */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={16} /> Tipos de Imóveis Mais Desejados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { tipo: 'Apartamento (2 Quartos)', pct: '48%', foco: 'Captação prioritária no Centro' },
                  { tipo: 'Casa com Quintal (Pet Friendly)', pct: '28%', foco: 'Bairros residenciais' },
                  { tipo: 'Kitnet / Studio compacto', pct: '14%', foco: 'Próximo a faculdades' },
                  { tipo: 'Sala / Loja Comercial', pct: '10%', foco: 'Ruas comerciais principais' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.tipo}</strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.pct}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.foco}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Faixas de Aluguel mais buscadas */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} /> Faixas de Aluguel Mais Buscadas
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { faixa: 'R$ 1.000 a R$ 1.500', volume: 'Altíssimo', share: '45%' },
                  { faixa: 'R$ 800 a R$ 1.000', volume: 'Alto', share: '25%' },
                  { faixa: 'R$ 1.500 a R$ 2.000', volume: 'Médio', share: '18%' },
                  { faixa: 'Acima de R$ 2.000', volume: 'Seletivo', share: '12%' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.faixa}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Procura: {item.volume}</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.share}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: DETALHES COMPLETOS DA DEMANDA + MATCHES + HISTÓRICO
         ============================================================ */}
      {selectedDemand && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setSelectedDemand(null)}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--glass-highlight)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-tertiary)' }}>{selectedDemand.codigo}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: STATUS_DEMANDAS.find(s => s.id === selectedDemand.status)?.color || 'var(--text-primary)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    {STATUS_DEMANDAS.find(s => s.id === selectedDemand.status)?.label}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.2rem 0 0' }}>
                  {selectedDemand.nomeCliente}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemand(null)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Quick Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>CONTATO & WHATSAPP</span>
                  <a 
                    href={`https://wa.me/55${(selectedDemand.telefoneCliente || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={14} /> {selectedDemand.telefoneCliente}
                  </a>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Melhor horário: {selectedDemand.melhorHorario || 'Qualquer'}
                  </span>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>LOCALIZAÇÃO DESEJADA</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {selectedDemand.cidade || 'Caratinga'}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Bairros: {selectedDemand.bairros && selectedDemand.bairros.length ? selectedDemand.bairros.join(', ') : 'Qualquer bairro'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>ORÇAMENTO MENSAL</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {selectedDemand.orcamentoValor ? `R$ ${selectedDemand.orcamentoValor}` : parsePriceRange(selectedDemand.orcamentoFaixa).label}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedDemand.incluiCondominioIptu ? 'Inclui condomínio e IPTU' : 'Apenas aluguel'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>URGÊNCIA DA MUDANÇA</span>
                  <strong style={{ fontSize: '0.9rem', color: selectedDemand.urgencia === 'imediata' ? '#f87171' : 'var(--text-primary)' }}>
                    {selectedDemand.urgencia === 'imediata' ? '🚨 Imediatamente' : selectedDemand.urgencia}
                  </strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Cadastrado em {new Date(selectedDemand.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Observações / Descrição Livre do Cliente */}
              {selectedDemand.observacoes && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--glass-highlight)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: '700', display: 'block', marginBottom: '2px' }}>
                    CARACTERÍSTICAS ESPECIAIS DESCRITAS PELO CLIENTE:
                  </span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    "{selectedDemand.observacoes}"
                  </p>
                </div>
              )}

              {/* IMÓVEIS COMPATÍVEIS DA CARTEIRA (SMART MATCHING) */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} /> Imóveis Compatíveis na Carteira ({allRentalProperties.length} analisados):
                </h4>

                {(() => {
                  const matches = findMatchesForDemand(selectedDemand, allRentalProperties);
                  if (matches.length === 0) {
                    return (
                      <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Nenhum imóvel compatível encontrado na carteira atualmente.
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {matches.slice(0, 4).map((m, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            gap: '0.85rem',
                            alignItems: 'center'
                          }}
                        >
                          <img 
                            src={m.imovel.fotoPrincipal} 
                            alt={m.imovel.titulo}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>
                                {m.imovel.codigo} • {m.imovel.bairro}
                              </span>
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                color: m.score >= 80 ? '#34d399' : 'var(--accent-cyan)'
                              }}>
                                ★ {m.score}% Compatível
                              </span>
                            </div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                              {m.imovel.titulo}
                            </strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Aluguel: <strong>R$ {Number(m.imovel.valorImovel || 0).toLocaleString('pt-BR')}</strong> | {m.imovel.quartos} qts | {m.imovel.vagas} vagas
                            </div>

                            {/* Bullet points do Match */}
                            <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {m.reasons.slice(0, 3).map((r, ri) => (
                                <span key={ri} style={{ fontSize: '0.68rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                                  ✓ {r}
                                </span>
                              ))}
                              {m.warnings.slice(0, 1).map((w, wi) => (
                                <span key={wi} style={{ fontSize: '0.68rem', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                                  {w}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSendMatchOnWhatsApp(selectedDemand, m.imovel, m.score)}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
                          >
                            <Send size={13} style={{ color: '#10b981' }} /> Enviar p/ Cliente
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* HISTÓRICO DE ATENDIMENTO E ANOTAÇÕES DO CORRETOR */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} /> Histórico de Atendimentos & Anotações Internas:
                </h4>

                {/* Lista de histórico */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {(selectedDemand.historicoAtendimento || []).map((h, i) => (
                    <div key={i} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', fontSize: '0.7rem', marginBottom: '2px' }}>
                        <span>{h.autor || 'Sistema'}</span>
                        <span>{new Date(h.data).toLocaleString('pt-BR')}</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>
                        {h.descricao}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adicionar anotação */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Adicionar nota de atendimento (ex: Liguei às 14h, agendamos visita para amanhã)..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    className="form-input"
                    style={{ flex: 1, fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem' }}
                  >
                    Salvar Nota
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--glass-highlight)'
            }}>
              <button
                type="button"
                onClick={() => handleDeleteDemand(selectedDemand.id)}
                className="btn btn-secondary"
                style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={14} /> Excluir Demanda
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDemand(null)}
                  className="btn btn-secondary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: CADASTRAR DEMANDA MANUALMENTE PELO CORRETOR
         ============================================================ */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setShowCreateModal(false)}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.5rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Cadastrar Nova Demanda de Locação
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateManualDemand}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label required">Nome do Cliente:</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="Nome completo do inquilino"
                      value={newDemandForm.nome} 
                      onChange={e => setNewDemandForm({ ...newDemandForm, nome: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">WhatsApp:</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="(33) 99999-9999"
                      value={newDemandForm.whatsapp} 
                      onChange={e => setNewDemandForm({ ...newDemandForm, whatsapp: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipo de Imóvel:</label>
                    <select
                      className="form-input"
                      value={newDemandForm.tipos[0] || 'Apartamento'}
                      onChange={e => setNewDemandForm({ ...newDemandForm, tipos: [e.target.value] })}
                    >
                      <option value="Apartamento">Apartamento</option>
                      <option value="Casa">Casa</option>
                      <option value="Kitnet">Kitnet</option>
                      <option value="Casa em condomínio">Casa em Condomínio</option>
                      <option value="Cobertura">Cobertura</option>
                      <option value="Loja comercial">Loja Comercial</option>
                      <option value="Sala comercial">Sala Comercial</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bairro Preferido:</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Centro, Santa Zita..."
                      value={newDemandForm.bairros.join(', ')} 
                      onChange={e => setNewDemandForm({ ...newDemandForm, bairros: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Faixa de Orçamento:</label>
                    <select
                      className="form-input"
                      value={newDemandForm.orcamentoFaixa}
                      onChange={e => setNewDemandForm({ ...newDemandForm, orcamentoFaixa: e.target.value })}
                    >
                      <option value="ate_500">Até R$ 500</option>
                      <option value="500_800">R$ 500 a R$ 800</option>
                      <option value="800_1000">R$ 800 a R$ 1.000</option>
                      <option value="1000_1500">R$ 1.000 a R$ 1.500</option>
                      <option value="1500_2000">R$ 1.500 a R$ 2.000</option>
                      <option value="2000_3000">R$ 2.000 a R$ 3.000</option>
                      <option value="3000_5000">R$ 3.000 a R$ 5.000</option>
                      <option value="acima_5000">Acima de R$ 5.000</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Urgência:</label>
                    <select
                      className="form-input"
                      value={newDemandForm.urgencia}
                      onChange={e => setNewDemandForm({ ...newDemandForm, urgencia: e.target.value })}
                    >
                      <option value="imediata">🚨 Imediata</option>
                      <option value="7_dias">Dentro de 7 dias</option>
                      <option value="15_dias">Dentro de 15 dias</option>
                      <option value="30_dias">Dentro de 30 dias</option>
                      <option value="sem_pressa">Sem pressa</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações / Detalhes do Cliente:</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Informações adicionais fornecidas pelo cliente..."
                    value={newDemandForm.observacoes}
                    onChange={e => setNewDemandForm({ ...newDemandForm, observacoes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: '700' }}>
                  Salvar Demanda e Cruzar Imóveis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: QR CODE PARA CAPTAÇÃO PÚBLICA
         ============================================================ */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setShowQrModal(false)}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.75rem',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              QR Code • Demanda de Locação
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Imprima para a vitrine da imobiliária ou compartilhe nas redes sociais.
            </p>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '12px',
              display: 'inline-block',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              marginBottom: '1rem'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicLink)}`}
                alt="QR Code Demanda de Locação"
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', wordBreak: 'break-all', marginBottom: '1.25rem' }}>
              {publicLink}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                <Copy size={14} /> Copiar Link
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem' }}
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
