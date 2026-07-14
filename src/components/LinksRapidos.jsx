import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Link2, 
  ExternalLink, 
  Trash2, 
  X, 
  Globe, 
  Bookmark, 
  Layers 
} from 'lucide-react';

export default function LinksRapidos() {
  const { 
    quickLinks, 
    addQuickLink, 
    deleteQuickLink, 
    clickLink 
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Interno');
  const [color, setColor] = useState('#6366f1');

  // Unique categories list
  const categories = ['Todos', ...new Set(quickLinks.map(l => l.category))];

  // Filtered links
  const filteredLinks = quickLinks.filter(l => 
    filterCategory === 'Todos' || l.category === filterCategory
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    // Standardize URL protocol
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

    setIsAddOpen(false);
  };

  const handleLinkClick = (id, url) => {
    clickLink(id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={styles.container}>
      <header className="module-header links-rapidos-header" style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Links Rápidos</h1>
          <p style={styles.subtitle}>Gerencie atalhos para ferramentas internas, integrações e documentações.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Novo Atalho</span>
        </button>
      </header>

      {/* Categories Bar */}
      <div className="glass-panel" style={styles.categoriesBar}>
        <div style={styles.categoryLabelArea}>
          <Layers size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.barLabel}>Categorias:</span>
        </div>
        <div style={styles.categoryList}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                ...styles.categoryTab,
                color: filterCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: filterCategory === cat ? 'var(--accent-primary)' : 'var(--glass-highlight)',
                borderColor: filterCategory === cat ? 'var(--accent-primary)' : 'var(--glass-border)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

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
          <div className="glass-panel" style={styles.emptyCard}>
            <Link2 size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '0.75rem' }} />
            <h3>Nenhum atalho encontrado</h3>
            <p>Cadastre atalhos para suas ferramentas mais utilizadas.</p>
          </div>
        )}
      </div>

      {/* Add Shortcut Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.modal}>
            <button className="modal-close" onClick={() => setIsAddOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Cadastrar Novo Atalho</h3>
            
            <form onSubmit={handleAddSubmit} style={{ marginTop: '1.5rem' }}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Cadastrar</button>
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
