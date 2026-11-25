import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  MessageSquare, 
  Columns, 
  Link2, 
  Activity, 
  ArrowUpRight,
  Building2,
  Home,
  Tag,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileCheck,
  Wrench,
  AlertTriangle,
  FileText,
  ClipboardCheck,
  X,
  ExternalLink,
  ChevronRight,
  Eye,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react';
import { getStatusComercialInfo } from '../utils/propertyLifecycle';

export default function Dashboard() {
  const { 
    clients = [], 
    kanbanCards = [], 
    chats = {}, 
    quickLinks = [], 
    setActiveModule,
    setActiveChatClientId,
    waStatus,
    profile,
    fichasVisita = [],
    imoveisContratos = [],
    imoveisVistorias = []
  } = useApp();

  const [activeKpiModal, setActiveKpiModal] = useState(null);

  const userRole = (profile?.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Sanitização defensiva das coleções
  const safeFichas = Array.isArray(fichasVisita) ? fichasVisita.filter(f => f && typeof f === 'object') : [];
  const safeContratos = Array.isArray(imoveisContratos) ? imoveisContratos.filter(c => c && typeof c === 'object') : [];
  const safeVistorias = Array.isArray(imoveisVistorias) ? imoveisVistorias.filter(v => v && typeof v === 'object') : [];

  // Métricas do Painel Administrativo Inteligente (Seção 9)
  const totalImoveisCadastrados = safeFichas;
  const imoveisDispLocacao = safeFichas.filter(f => (f.statusComercial || 'Disponível para locação') === 'Disponível para locação');
  const imoveisDispVenda = safeFichas.filter(f => (f.statusComercial || '') === 'Disponível para venda' || (f.statusComercial || '') === 'Disponível para venda e locação');
  const imoveisAlugados = safeFichas.filter(f => (f.statusComercial || '') === 'Alugado');
  const imoveisVendidos = safeFichas.filter(f => (f.statusComercial || '') === 'Vendido');
  const imoveisReservados = safeFichas.filter(f => (f.statusComercial || '') === 'Reservado');
  const imoveisEmNegociacao = safeFichas.filter(f => (f.statusComercial || '') === 'Em negociação');
  const imoveisEmVistoria = safeFichas.filter(f => {
    return (f.etapaPipelineLocacao || '').includes('vistoria') || 
      safeVistorias.some(v => (v.imovelId === f.id || v.imovelCodigo === f.codigoImovel) && !(typeof v?.status === 'string' && v.status.includes('concluída')));
  });
  const contratosAguardandoAssinaturas = safeContratos.filter(c => {
    return Array.isArray(c?.signatarios) && c.signatarios.some(s => s && s.obrigatoria !== false && s.status !== 'Assinada' && s.status !== 'Não se aplica');
  });
  const contratosProximosVencimento = safeContratos.filter(c => {
    if (!c?.dataVencimento) return false;
    const diff = new Date(c.dataVencimento) - new Date();
    return diff > 0 && diff <= 60 * 24 * 60 * 60 * 1000;
  });
  const imoveisEmManutencao = safeFichas.filter(f => (f.statusOperacional || '').toLowerCase().includes('manuten'));
  const imoveisDocPendente = safeFichas.filter(f => {
    const doc = f.documentacao || {};
    return (!doc.matriculaIndividual && !doc.escrituraPublica && !f.matricula) || (f.etapaPipelineLocacao || '').includes('documentacao');
  });

  // Metrics calculations
  const totalClients = clients.length;
  const totalCards = kanbanCards.length;
  const totalChats = Object.keys(chats).length;
  const totalLinks = quickLinks.length;
  const totalMessages = Object.values(chats).reduce((acc, curr) => acc + curr.length, 0);

  // Generate dynamic chart data based on messages responded (sent by the user/agent) in each week
  const chartPoints = React.useMemo(() => {
    const nowSecs = Math.floor(Date.now() / 1000);
    const ONE_WEEK_SECS = 7 * 24 * 60 * 60;
    
    let week1Count = 0;
    let week2Count = 0;
    let week3Count = 0;
    let week4Count = 0;
    
    Object.values(chats).forEach((msgList) => {
      msgList.forEach(msg => {
        // Count only responded messages (sent by the system user)
        if (msg.sender !== 'user') return;
        
        const msgTime = msg.timestamp; // in seconds
        if (!msgTime) return;
        const age = nowSecs - msgTime;
        
        if (age < ONE_WEEK_SECS) {
          week4Count++;
        } else if (age < 2 * ONE_WEEK_SECS) {
          week3Count++;
        } else if (age < 3 * ONE_WEEK_SECS) {
          week2Count++;
        } else if (age < 4 * ONE_WEEK_SECS) {
          week1Count++;
        }
      });
    });

    // Map counts to SVG height (y coordinate: 190 is bottom, 40 is top)
    // 0 messages = 190px (exactly on the white base line), 20+ messages = 40px.
    const scaleY = (count) => {
      const maxCount = 20;
      const minVal = 190;
      const maxVal = 40;
      const ratio = Math.min(count / maxCount, 1);
      return minVal - ratio * (minVal - maxVal);
    };

    return [
      scaleY(week1Count),
      scaleY(week2Count),
      scaleY(week3Count),
      scaleY(week4Count)
    ];
  }, [chats]);

  // Quick nav helper
  const navigateToChat = (clientId) => {
    if (userRole === 'normal' || userRole === 'colaborador') return;
    setActiveChatClientId(clientId);
    setActiveModule('conversas');
  };

  return (
    <div style={styles.container}>
      <header className="module-header dashboard-header" style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Visão Geral Imobiliária</h1>
        </div>
        <div style={styles.badgeArea}>
          <div className={`badge ${waStatus === 'ONLINE' ? 'badge-success' : 'badge-danger'}`} style={{ gap: '0.25rem' }}>
            <Activity size={12} />
            <span>{waStatus === 'ONLINE' ? 'Sistema Online' : 'Sistema Offline'}</span>
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="dashboard-stats-grid" style={styles.statsGrid}>
        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total de Clientes</span>
            <div style={{ ...styles.statIconWrapper, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{totalClients}</div>
          <div style={styles.statFooter}>
            <span style={styles.statTrendGreen}>+12%</span>
            <span style={styles.statTrendLabel}>desde a última semana</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Conversas em Andamento</span>
            <div style={{ ...styles.statIconWrapper, background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-secondary)' }}>
              <Columns size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{totalCards}</div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Canais de Conversa</span>
            <div style={{ ...styles.statIconWrapper, background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
              <MessageSquare size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{totalChats}</div>
          <div style={styles.statFooter}>
            <span style={styles.statTrendCyan}>{totalMessages} mensagens</span>
            <span style={styles.statTrendLabel}>trocadas no total</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Links & Integrações</span>
            <div style={{ ...styles.statIconWrapper, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
              <Link2 size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{totalLinks}</div>
          <div style={styles.statFooter}>
            <span style={styles.statTrendGreen}>Ativos</span>
            <span style={styles.statTrendLabel}>atalhos rápidos</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          PAINEL ADMINISTRATIVO INTELIGENTE (12 INDICADORES CLICÁVEIS)
         ============================================================ */}
      <section style={{ marginTop: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} style={{ color: 'var(--accent-cyan)' }} />
              Painel Administrativo de Imóveis & Ciclo de Vida
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Indicadores clicáveis em tempo real. Clique em qualquer card para ver a listagem detalhada.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveModule('imoveis')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
          >
            <span>Ver Módulo Imóveis Completo</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.875rem'
        }}>
          {[
            { id: 'total', label: 'Total de imóveis cadastrados', count: totalImoveisCadastrados.length, color: 'var(--accent-cyan)', icon: Building2, items: totalImoveisCadastrados, type: 'imoveis' },
            { id: 'disp_loc', label: 'Imóveis disponíveis para locação', count: imoveisDispLocacao.length, color: '#10b981', icon: Home, items: imoveisDispLocacao, type: 'imoveis' },
            { id: 'disp_ven', label: 'Imóveis disponíveis para venda', count: imoveisDispVenda.length, color: '#10b981', icon: Tag, items: imoveisDispVenda, type: 'imoveis' },
            { id: 'alugados', label: 'Imóveis alugados', count: imoveisAlugados.length, color: '#8b5cf6', icon: CheckCircle2, items: imoveisAlugados, type: 'imoveis' },
            { id: 'vendidos', label: 'Imóveis vendidos', count: imoveisVendidos.length, color: '#8b5cf6', icon: CheckCircle2, items: imoveisVendidos, type: 'imoveis' },
            { id: 'reservados', label: 'Imóveis reservados', count: imoveisReservados.length, color: '#f59e0b', icon: Clock, items: imoveisReservados, type: 'imoveis' },
            { id: 'negociacao', label: 'Imóveis em negociação', count: imoveisEmNegociacao.length, color: '#3b82f6', icon: TrendingUp, items: imoveisEmNegociacao, type: 'imoveis' },
            { id: 'vistoria', label: 'Imóveis em vistoria', count: imoveisEmVistoria.length, color: '#38bdf8', icon: ClipboardCheck, items: imoveisEmVistoria, type: 'imoveis' },
            { id: 'assinaturas', label: 'Contratos aguardando assinaturas', count: contratosAguardandoAssinaturas.length, color: '#f59e0b', icon: FileCheck, items: contratosAguardandoAssinaturas, type: 'contratos' },
            { id: 'vencendo', label: 'Contratos próximos do vencimento', count: contratosProximosVencimento.length, color: '#fb923c', icon: Calendar, items: contratosProximosVencimento, type: 'contratos' },
            { id: 'manutencao', label: 'Imóveis em manutenção', count: imoveisEmManutencao.length, color: '#ef4444', icon: Wrench, items: imoveisEmManutencao, type: 'imoveis' },
            { id: 'doc_pendente', label: 'Imóveis com doc. pendente', count: imoveisDocPendente.length, color: '#ef4444', icon: AlertTriangle, items: imoveisDocPendente, type: 'imoveis' }
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveKpiModal(kpi)}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${kpi.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                title="Clique para ver os detalhes"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500', lineHeight: '1.25' }}>
                    {kpi.label}
                  </span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kpi.color,
                    flexShrink: 0
                  }}>
                    <Icon size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '1.4rem', color: kpi.count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: '800' }}>
                    {kpi.count}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    Ver lista <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Interativo ao Clicar em Qualquer Indicador */}
      {activeKpiModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                  {activeKpiModal.label}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  Total encontrado: {activeKpiModal.count} registro(s)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Lista dos itens correspondentes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '50vh', overflowY: 'auto' }}>
              {activeKpiModal.items.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  Nenhum registro encontrado nesta categoria no momento.
                </div>
              ) : (
                activeKpiModal.items.map((item, idx) => {
                  const isContrato = activeKpiModal.type === 'contratos';
                  const code = isContrato ? (item.numero || item.id) : (item.codigoImovel || item.code || `IM-${item.id}`);
                  const title = isContrato ? `Contrato de ${item.tipo === 'venda' ? 'Venda' : 'Locação'} (${item.imovelCodigo})` : (item.tituloImovel || item.title || `${item.tipoImovel || 'Imóvel'} no ${item.bairroImovel || 'Centro'}`);
                  const sub = isContrato ? `Responsável: ${item.responsavel || 'Contratos'}` : `Proprietário: ${item.nomeProprietario || 'Não informado'} • Bairro: ${item.bairroImovel || 'Caratinga'}`;
                  const valor = Number(item.valorImovel || item.valor || item.rentValue || 0);

                  return (
                    <div 
                      key={item.id || idx}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                            {code}
                          </span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {title}
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '0.2rem' }}>
                          {sub}
                        </span>
                      </div>

                      {valor > 0 && (
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981', whiteSpace: 'nowrap' }}>
                          R$ {valor.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveKpiModal(null);
                  setActiveModule('visita-tecnica');
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Abrir no Módulo Imóveis</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts & Connection Panel */}
      <div className="grid-cols-12" style={{ marginTop: '2rem' }}>
        
        {/* Custom SVG Line Chart - Service History */}
        <div className="glass-panel col-span-12" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Histórico de atendimento</h3>
            <span style={styles.cardSubtitle}>Crescimento de atendimentos no mês corrente</span>
          </div>
          <div style={styles.chartWrapper}>
            {/* Custom SVG Line Graph */}
            <svg viewBox="0 0 1000 220" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="stroke-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="1000" y2="40" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="1000" y2="90" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="1000" y2="140" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="190" x2="1000" y2="190" stroke="var(--text-tertiary)" strokeWidth="1" />

              {/* Area under curve */}
              <path 
                d={`M 0 190 Q 150 ${chartPoints[0]}, 240 ${chartPoints[0]} T 480 ${chartPoints[1]} T 720 ${chartPoints[2]} T 1000 ${chartPoints[3]} L 1000 190 Z`} 
                fill="url(#line-grad)" 
              />
              
              {/* Curve path */}
              <path 
                d={`M 0 190 Q 150 ${chartPoints[0]}, 240 ${chartPoints[0]} T 480 ${chartPoints[1]} T 720 ${chartPoints[2]} T 1000 ${chartPoints[3]}`} 
                fill="none" 
                stroke="url(#stroke-grad)" 
                strokeWidth="3" 
              />

              {/* Glowing Dots */}
              <circle cx="240" cy={chartPoints[0]} r="5" fill="var(--accent-primary)" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="480" cy={chartPoints[1]} r="5" fill="var(--accent-secondary)" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="720" cy={chartPoints[2]} r="5" fill="var(--accent-cyan)" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="1000" cy={chartPoints[3]} r="5" fill="var(--accent-success)" stroke="#ffffff" strokeWidth="1.5" />

              {/* Text labels */}
              <text x="240" y="210" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">Semana 1</text>
              <text x="480" y="210" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">Semana 2</text>
              <text x="720" y="210" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">Semana 3</text>
              <text x="990" y="210" fill="var(--text-secondary)" fontSize="10" textAnchor="end">Semana 4</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Service History Table */}

      <div className="grid-cols-12" style={{ marginTop: '1.5rem' }}>
        {/* Recent Conversations shortcuts */}
        <div className="glass-panel col-span-12" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Mensagens Recentes</h3>
            <span style={styles.cardSubtitle}>Atalhos rápidos para retomar conversas</span>
          </div>
          <div style={styles.conversationList}>
            {clients.slice(0, 4).map(client => {
              const clientMessages = chats[client.id] || [];
              const lastMessage = clientMessages[clientMessages.length - 1];
              return (
                <div 
                  key={client.id} 
                  onClick={() => navigateToChat(client.id)}
                  style={styles.conversationRow}
                  className="glass-card glass-card-hover"
                >
                  <div style={styles.convoLeft}>
                    <div style={styles.avatarMini}>
                      {client.name ? client.name.split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={styles.convoName}>{client.name}</div>
                      <div style={styles.convoText}>
                        {lastMessage ? lastMessage.text : 'Sem mensagens ainda.'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.convoRight}>
                    <span style={styles.convoTime}>
                      {lastMessage ? lastMessage.time : ''}
                    </span>
                    <ArrowUpRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  badgeArea: {
    display: 'flex',
    alignItems: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },
  statCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  statIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1',
    marginBottom: '0.5rem',
  },
  statFooter: {
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statTrendGreen: {
    color: 'var(--accent-success)',
    fontWeight: '600',
  },
  statTrendCyan: {
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  statTrendLabel: {
    color: 'var(--text-tertiary)',
  },
  chartCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    marginBottom: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  cardSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  chartWrapper: {
    height: '240px',
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
    paddingTop: '1rem',
  },
  funnelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    justifyContent: 'center',
    height: '100%',
  },
  funnelItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  funnelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    fontWeight: '500',
  },
  funnelLabel: {
    color: 'var(--text-secondary)',
  },
  funnelValue: {
    color: 'var(--text-primary)',
  },
  barContainer: {
    height: '6px',
    width: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barProgress: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.8s ease',
  },
  connectionPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  connectionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
  },
  connectionDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  connectionIconActive: {
    color: 'var(--accent-success)',
    display: 'flex',
    alignItems: 'center',
  },
  connectionIconWarning: {
    color: 'var(--accent-warning)',
    display: 'flex',
    alignItems: 'center',
  },
  connectionName: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  connectionDesc: {
    fontSize: '0.6875rem',
    color: 'var(--text-secondary)',
  },
  conversationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  conversationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.75rem 1rem',
  },
  convoLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    overflow: 'hidden',
  },
  avatarMini: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6875rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  convoName: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  convoText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '220px',
  },
  convoRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  convoTime: {
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
  }
};
