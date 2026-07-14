import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  X, 
  UserPlus, 
  Filter,
  ArrowUpRight
} from 'lucide-react';

export default function Clientes() {
  const { 
    clients, 
    addClient, 
    updateClient, 
    deleteClient, 
    setActiveModule, 
    setActiveChatClientId 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const savedPipelines = localStorage.getItem('analise_pipelines');
  const pipelinesList = savedPipelines ? JSON.parse(savedPipelines) : [
    { id: 'pessoal', name: 'Pessoal' },
    { id: 'contabil_fiscal', name: 'Contábil/Fiscal' },
    { id: 'documentos_fiscais', name: 'Emissão de Documentos Fiscais' },
    { id: 'administrativo', name: 'Administrativo' }
  ];

  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Form fields states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(pipelinesList[0]?.name || 'Pessoal');
  const [tagsInput, setTagsInput] = useState('');

  // Filter clients list
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open Modals
  const openAddModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setStatus(pipelinesList[0]?.name || 'Pessoal');
    setTagsInput('');
    setIsAddOpen(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setStatus(client.status);
    setTagsInput(client.tags ? client.tags.join(', ') : '');
    setIsEditOpen(true);
  };

  // Submits
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addClient({
      name,
      email,
      phone,
      status,
      tags
    });

    setIsAddOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedClient) return;

    const tags = tagsInput.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    updateClient({
      ...selectedClient,
      name,
      email,
      phone,
      status,
      tags
    });

    setIsEditOpen(false);
  };

  const handleOpenChat = (clientId) => {
    setActiveChatClientId(clientId);
    setActiveModule('conversas');
  };

  const getStatusBadgeClass = (s) => {
    if (!s) return 'badge-secondary';
    const sLower = s.trim().toLowerCase();
    if (sLower === 'pessoal') return 'badge-primary';
    if (sLower === 'contábil/fiscal' || sLower === 'contabil/fiscal') return 'badge-success';
    if (sLower === 'emissão de documentos fiscais' || sLower === 'emissao de documentos fiscais') return 'badge-warning';
    if (sLower === 'administrativo') return 'badge-secondary';
    return 'badge-secondary';
  };

  return (
    <div style={styles.container}>
      <header className="module-header clientes-header" style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Clientes</h1>
          <p style={styles.subtitle}>Gerencie seu pipeline de clientes e visualize as informações de contato.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <UserPlus size={16} />
          <span>Cadastrar Cliente</span>
        </button>
      </header>

      {/* Filters Area */}
      <div className="glass-panel" style={styles.filtersCard}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por nome, e-mail ou telefone..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.statusFilterArea}>
          <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.filterLabel}>Estágio:</span>
          {['Todos', ...pipelinesList.map(p => p.name)].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                ...styles.filterTabBtn,
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: statusFilter === st ? 'var(--accent-primary)' : 'var(--glass-highlight)',
                borderColor: statusFilter === st ? 'var(--accent-primary)' : 'var(--glass-border)',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-panel" style={styles.tableCard}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Nome / E-mail</th>
                <th style={styles.th}>Telefone</th>
                <th style={styles.th}>Estágio</th>
                <th style={styles.th}>Tags</th>
                <th style={styles.th}>Criado em</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.clientCell}>
                      <div style={styles.avatarMini}>
                        {client.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div style={styles.clientName}>{client.name}</div>
                        <div style={styles.clientEmail}>{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{client.phone}</td>
                  <td style={styles.td}>
                    <span className={`badge ${getStatusBadgeClass(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.tagsContainer}>
                      {client.tags && client.tags.map((tag, idx) => (
                        <span key={idx} className="badge badge-secondary" style={styles.tagBadge}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: 'var(--text-tertiary)' }}>{client.createdAt}</td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      <button 
                        onClick={() => handleOpenChat(client.id)} 
                        className="btn btn-secondary" 
                        style={styles.actionBtn}
                        title="Iniciar Bate-papo"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button 
                        onClick={() => openEditModal(client)} 
                        className="btn btn-secondary" 
                        style={styles.actionBtn}
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteClient(client.id)} 
                        className="btn btn-danger" 
                        style={{ ...styles.actionBtn, padding: '0.375rem 0.5rem' }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="6" style={styles.emptyTableCell}>
                    Nenhum cliente cadastrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setIsAddOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Cadastrar Novo Cliente</h3>
            
            <form onSubmit={handleAddSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="cliente@exemplo.com"
                  required
                />
              </div>

              <div className="input-group">
                <label>Telefone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="input-group">
                <label>Setor / Pipeline</label>
                <select 
                  className="input-field" 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {pipelinesList.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={tagsInput} 
                  onChange={e => setTagsInput(e.target.value)} 
                  placeholder="Ex: VIP, Importante, WhatsApp"
                />
              </div>

              <div className="modal-actions" style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setIsEditOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Editar Dados do Cliente</h3>
            
            <form onSubmit={handleEditSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>Telefone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>

              <div className="input-group">
                <label>Setor / Pipeline</label>
                <select 
                  className="input-field" 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {pipelinesList.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={tagsInput} 
                  onChange={e => setTagsInput(e.target.value)} 
                />
              </div>

              <div className="modal-actions" style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
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
  filtersCard: {
    padding: '1.25rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    minWidth: '280px',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-tertiary)',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '2.5rem',
    height: '2.5rem',
  },
  statusFilterArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginRight: '0.25rem',
    fontFamily: 'var(--font-heading)',
  },
  filterTabBtn: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--glass-border)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  tableCard: {
    padding: '1rem',
    backgroundColor: 'var(--glass-bg)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--glass-border)',
  },
  th: {
    padding: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid var(--glass-border)',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'var(--glass-highlight)',
    }
  },
  td: {
    padding: '1rem',
    fontSize: '0.875rem',
    verticalAlign: 'middle',
  },
  clientCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  clientName: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  clientEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  tagBadge: {
    fontSize: '0.625rem',
    padding: '0.125rem 0.375rem',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.375rem 0.5rem',
  },
  emptyTableCell: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-tertiary)',
    fontSize: '0.875rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.75rem',
  }
};
