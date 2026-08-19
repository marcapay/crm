import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  MessageSquare, 
  Columns, 
  Link2, 
  Activity, 
  ArrowUpRight 
} from 'lucide-react';

export default function Dashboard() {
  const { 
    clients, 
    kanbanCards, 
    chats, 
    quickLinks, 
    setActiveModule,
    setActiveChatClientId,
    waStatus
  } = useApp();

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
    setActiveChatClientId(clientId);
    setActiveModule('conversas');
  };

  return (
    <div style={styles.container}>
      <header className="module-header dashboard-header" style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Visão Geral Imobiliária</h1>
          <p style={styles.subtitle}>Acompanhe seus leads, visitas agendadas, propostas e negociações com a Araújo Imóveis.</p>
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
