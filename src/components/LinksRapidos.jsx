import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Link2, 
  ExternalLink, 
  Trash2, 
  X, 
  Globe, 
  Layers,
  MessageSquareCode,
  Copy,
  Check
} from 'lucide-react';

export default function LinksRapidos() {
  const { 
    quickLinks, 
    addQuickLink, 
    deleteQuickLink, 
    clickLink,
    quickReplies,
    addQuickReply,
    deleteQuickReply
  } = useApp();

  const [activeTab, setActiveTab] = useState('replies'); // 'links' | 'replies'
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isAddReplyOpen, setIsAddReplyOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Form states for Link
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Interno');
  const [color, setColor] = useState('#6366f1');

  // Form states for Quick Reply
  const [replyShortcut, setReplyShortcut] = useState('');
  const [replyTitle, setReplyTitle] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Unique categories list for Links
  const categories = ['Todos', ...new Set(quickLinks.map(l => l.category))];

  // Filtered links
  const filteredLinks = quickLinks.filter(l => 
    filterCategory === 'Todos' || l.category === filterCategory
  );

  const handleAddLinkSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    addQuickLink({
      title,
      url: formattedUrl,
      category,
      color
    });

    setTitle('');
    setUrl('');
    setIsAddLinkOpen(false);
  };

  const handleAddReplySubmit = (e) => {
    e.preventDefault();
    if (!replyShortcut.trim() || !replyTitle.trim() || !replyContent.trim()) return;

    addQuickReply({
      shortcut: replyShortcut,
      title: replyTitle,
      content: replyContent
    });

    setReplyShortcut('');
    setReplyTitle('');
    setReplyContent('');
    setIsAddReplyOpen(false);
  };

  const handleLinkClick = (id, url) => {
    clickLink(id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyReplyContent = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={styles.container}>
      <header className="module-header links-rapidos-header" style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Atalhos Rápidos</h1>
          <p style={styles.subtitle}>Gerencie respostas pré-prontas com barras (/) e atalhos para ferramentas.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setIsAddLinkOpen(true)} className="btn btn-secondary">
            <Link2 size={16} />
            <span>Link</span>
          </button>
          
          <button onClick={() => setIsAddReplyOpen(true)} className="btn btn-primary">
            <span>Novo Atalho</span>
          </button>
        </div>
      </header>

      {/* Main Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('replies')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'replies' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'replies' ? '#0a0a0a' : '#ffffff',
            fontWeight: activeTab === 'replies' ? '700' : '500',
            border: '1px solid var(--glass-border)',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem'
          }}
        >
          <MessageSquareCode size={16} />
          <span>Respostas Rápidas ({quickReplies.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'links' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'links' ? '#0a0a0a' : '#ffffff',
            fontWeight: activeTab === 'links' ? '700' : '500',
            border: '1px solid var(--glass-border)',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem'
          }}
        >
          <Link2 size={16} />
          <span>Links Externos ({quickLinks.length})</span>
        </button>
      </div>

      {/* TAB 1: RESPOSTAS RÁPIDAS (ATALHOS DE CHAT /) */}
      {activeTab === 'replies' && (
        <div>
          <div style={styles.grid}>
            {quickReplies.map(reply => (
              <div 
                key={reply.id} 
                className="glass-panel glass-panel-hover" 
                style={{ ...styles.card, borderTop: '3px solid var(--accent-cyan)', height: 'auto', minHeight: '160px' }}
              >
                <div style={styles.cardHeader}>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                    /{reply.shortcut}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleCopyReplyContent(reply.id, reply.content)}
                      style={styles.deleteBtn}
                      title="Copiar texto da mensagem"
                    >
                      {copiedId === reply.id ? <Check size={14} style={{ color: 'var(--accent-success)' }} /> : <Copy size={14} />}
                    </button>
                    <button 
                      onClick={() => deleteQuickReply(reply.id)} 
                      style={styles.deleteBtn}
                      title="Excluir atalho"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ ...styles.cardTitle, marginTop: '0.5rem', fontSize: '0.9375rem', color: '#ffffff' }}>{reply.title}</h3>
                
                <p style={{
                  fontSize: '0.85rem',
                  color: '#e5e5e5',
                  marginTop: '0.5rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {reply.content}
                </p>

                <div style={{ ...styles.cardFooter, marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                    Digite <strong>/{reply.shortcut}</strong> no chat
                  </span>
                </div>
              </div>
            ))}

            {quickReplies.length === 0 && (
              <div className="glass-panel" style={{ ...styles.emptyCard, gridColumn: '1 / -1' }}>
                <MessageSquareCode size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '0.75rem' }} />
                <h3>Nenhum atalho de chat cadastrado</h3>
                <p>Clique em <strong>Novo Atalho</strong> para cadastrar mensagens pré-prontas ativadas com a barra (/)</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LINKS EXTERNOS */}
      {activeTab === 'links' && (
        <div>
          {/* Links Grid */}
          <div style={styles.grid}>
            {filteredLinks.map(link => (
              <div 
                key={link.id} 
                className="glass-panel glass-panel-hover" 
                style={{ ...styles.card, borderTopColor: link.color, borderTopWidth: '3px' }}
              >
                <div style={styles.cardHeader}>
                  <span className="badge badge-secondary" style={styles.categoryBadge}>
                    {link.category}
                  </span>
                  <button 
                    onClick={() => deleteQuickLink(link.id)} 
                    style={styles.deleteBtn}
                    title="Excluir link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 style={styles.cardTitle}>{link.title}</h3>
                
                <div style={styles.cardInfo}>
                  <Globe size={12} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={styles.urlText}>{link.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.clicksText}>{link.clicks} cliques</span>
                  
                  <button 
                    onClick={() => handleLinkClick(link.id, link.url)}
                    className="btn btn-secondary" 
                    style={styles.openBtn}
                  >
                    <span>Acessar</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}

            {filteredLinks.length === 0 && (
              <div className="glass-panel" style={{ ...styles.emptyCard, gridColumn: '1 / -1' }}>
                <Link2 size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '0.75rem' }} />
                <h3>Nenhum atalho encontrado</h3>
                <p>Cadastre atalhos para suas ferramentas mais utilizadas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Adicionar Novo Atalho de Chat (+ Novo Atalho) */}
      {isAddReplyOpen && (
        <div className="modal-overlay" onClick={() => setIsAddReplyOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.modal}>
            <button className="modal-close" onClick={() => setIsAddReplyOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Cadastrar Novo Atalho de Mensagem</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Ao digitar a barra <strong>(/)</strong> nas conversas, você poderá selecionar esta mensagem rapidamente.
            </p>
            
            <form onSubmit={handleAddReplySubmit} style={{ marginTop: '1.25rem' }}>
              <div className="input-group">
                <label>Comando do Atalho (sem a barra)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>/</span>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={replyShortcut} 
                    onChange={e => setReplyShortcut(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} 
                    placeholder="Ex: pix, saudacao, posvenda"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Título do Atalho</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={replyTitle} 
                  onChange={e => setReplyTitle(e.target.value)} 
                  placeholder="Ex: Dados Bancários para Pagamento PIX"
                  required
                />
              </div>

              <div className="input-group">
                <label>Conteúdo da Mensagem</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={replyContent} 
                  onChange={e => setReplyContent(e.target.value)} 
                  placeholder="Digite a mensagem completa que será inserida ao clicar ou acionar o atalho..."
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddReplyOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Cadastrar Atalho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adicionar Link (+ Link) */}
      {isAddLinkOpen && (
        <div className="modal-overlay" onClick={() => setIsAddLinkOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.modal}>
            <button className="modal-close" onClick={() => setIsAddLinkOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Cadastrar Novo Link Externo</h3>
            
            <form onSubmit={handleAddLinkSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Título do Link</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Ex: Trello Dashboard"
                  required
                />
              </div>

              <div className="input-group">
                <label>Endereço URL</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="Ex: trello.com/b/123"
                  required
                />
              </div>

              <div className="input-group">
                <label>Categoria</label>
                <select 
                  className="input-field" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="Interno">Ferramenta Interna</option>
                  <option value="Integrações">Integração Externa</option>
                  <option value="Suporte">Documentação / Suporte</option>
                  <option value="Marketing">Marketing / Vendas</option>
                </select>
              </div>

              <div className="input-group">
                <label>Cor do Marcador</label>
                <div style={styles.colorPickerContainer}>
                  {['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                    <div 
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        ...styles.colorDot,
                        backgroundColor: c,
                        boxShadow: color === c ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddLinkOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Cadastrar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  categoriesBar: {
    padding: '0.875rem 1.25rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  categoryLabelArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  barLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-heading)',
  },
  categoryList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  categoryTab: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--glass-border)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.25rem',
    width: '100%',
  },
  card: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    height: '160px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  categoryBadge: {
    fontSize: '0.625rem',
    padding: '0.125rem 0.5rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    ':hover': {
      color: 'var(--accent-danger)',
    }
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.375rem',
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginBottom: 'auto',
  },
  urlText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '0.625rem',
  },
  clicksText: {
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
  },
  openBtn: {
    padding: '0.25rem 0.625rem',
    fontSize: '0.75rem',
    gap: '0.25rem',
  },
  emptyCard: {
    gridColumn: '1 / -1',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  colorPickerContainer: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem 0',
  },
  colorDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.75rem',
  }
};
