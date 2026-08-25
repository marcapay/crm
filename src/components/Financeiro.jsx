import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Plus,
  Paperclip,
  Mic,
  Search,
  FileText,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function Financeiro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'entradas', 'saidas', 'docs'
  const [quickInput, setQuickInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Initial transactions seed matching the user screenshot
  const [transactions, setTransactions] = useState([
    {
      id: 'tx_1',
      description: '4 Adesivos Vende -se Juart',
      person: 'Reginaldo',
      type: 'saida', // 'entrada' | 'saida'
      dueDate: '11/07/2026',
      status: 'Pago',
      value: 70.00,
      hasDoc: true,
      docName: 'comprovante_adesivos.pdf'
    },
    {
      id: 'tx_2',
      description: 'Dominio hostinge...',
      person: 'MARCELO MARQUES',
      type: 'saida',
      dueDate: '07/06/2026',
      status: 'Pago',
      value: 39.00,
      hasDoc: true,
      docName: 'comprovante_hostinger.pdf'
    }
  ]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newType, setNewType] = useState('saida');
  const [newValue, setNewValue] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newStatus, setNewStatus] = useState('Pago');

  // Calculations
  const totalEntradas = transactions
    .filter((t) => t.type === 'entrada' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalEntradasPendentes = transactions
    .filter((t) => t.type === 'entrada' && t.status !== 'Pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalSaidas = transactions
    .filter((t) => t.type === 'saida' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalSaidasPendentes = transactions
    .filter((t) => t.type === 'saida' && t.status !== 'Pago')
    .reduce((sum, t) => sum + t.value, 0);

  const saldoCaixa = totalEntradas - totalSaidas;
  const previsaoAcumulada = (totalEntradas + totalEntradasPendentes) - (totalSaidas + totalSaidasPendentes);

  // Quick prompt handler (Barra de Transação)
  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    // Parse simple text or add standard transaction
    const newTx = {
      id: `tx_${Date.now()}`,
      description: quickInput,
      person: 'Usuário',
      type: 'saida',
      dueDate: new Date().toLocaleDateString('pt-BR'),
      status: 'Pago',
      value: 50.00,
      hasDoc: false
    };

    setTransactions([newTx, ...transactions]);
    setQuickInput('');
  };

  const handleCreateTransaction = (e) => {
    e.preventDefault();
    if (!newDesc.trim() || !newValue) return;

    const newTx = {
      id: `tx_${Date.now()}`,
      description: newDesc,
      person: newPerson || 'Não especificado',
      type: newType,
      dueDate: newDueDate || new Date().toLocaleDateString('pt-BR'),
      status: newStatus,
      value: parseFloat(newValue),
      hasDoc: false
    };

    setTransactions([newTx, ...transactions]);
    setShowNewModal(false);
    setNewDesc('');
    setNewPerson('');
    setNewValue('');
    setNewDueDate('');
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.person.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'entradas') return matchesSearch && t.type === 'entrada';
    if (filterType === 'saidas') return matchesSearch && t.type === 'saida';
    if (filterType === 'docs') return matchesSearch && t.hasDoc;
    return matchesSearch;
  });

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <header style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.headerIconBadge}>
              <Wallet size={22} color="#f59e0b" />
            </div>
            <h1 style={styles.title}>Financeiro</h1>
          </div>
          <p style={styles.subtitle}>Controle de receitas e despesas da imobiliária</p>
        </div>

        <div style={styles.topActions}>
          <button style={styles.btnSecondary} onClick={() => setShowNewModal(true)}>
            <Paperclip size={16} />
            <span>+ Documento</span>
          </button>
          <button style={styles.btnPrimary} onClick={() => setShowNewModal(true)}>
            <Plus size={18} />
            <span>+ Nova Transação</span>
          </button>
        </div>
      </header>

      {/* 2. Top Summary Metric Cards Grid */}
      <div style={styles.cardsGrid}>
        {/* Entradas Realizadas */}
        <div style={styles.card}>
          <span style={styles.cardLabel}>ENTRADAS REALIZADAS</span>
          <div style={{ ...styles.cardValue, color: '#34d399' }}>
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ ...styles.cardSub, color: '#34d399' }}>
            + R$ {totalEntradasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a receber
          </span>
        </div>

        {/* Saídas Pagas */}
        <div style={styles.card}>
          <span style={styles.cardLabel}>SAÍDAS PAGAS</span>
          <div style={{ ...styles.cardValue, color: '#ef4444' }}>
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ ...styles.cardSub, color: '#f87171' }}>
            + R$ {totalSaidasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendentes
          </span>
        </div>

        {/* Saldo em Caixa */}
        <div style={styles.card}>
          <span style={styles.cardLabel}>SALDO EM CAIXA</span>
          <div style={{ ...styles.cardValue, color: saldoCaixa >= 0 ? '#34d399' : '#ef4444' }}>
            {saldoCaixa < 0 ? '-' : ''}R$ {Math.abs(saldoCaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Previsão Acumulada */}
        <div style={styles.card}>
          <span style={styles.cardLabel}>PREVISÃO ACUMULADA</span>
          <div style={{ ...styles.cardValue, color: '#f59e0b' }}>
            {previsaoAcumulada < 0 ? '-' : ''}R$ {Math.abs(previsaoAcumulada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 3. BARRA DE TRANSAÇÃO / AI PROMPT (POSICIONADA ACIMA DA TABELA DO MEIO) */}
      <form onSubmit={handleQuickSubmit} style={styles.quickBarContainer}>
        <button type="button" style={styles.quickBarIconBtn} title="Anexar comprovante ou documento">
          <Paperclip size={18} color="var(--text-secondary)" />
        </button>

        <input
          type="text"
          style={styles.quickBarInput}
          placeholder="Descreva a transação ou anexe um comprovante..."
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setIsRecording(!isRecording)}
          style={{
            ...styles.quickBarMicBtn,
            backgroundColor: isRecording ? '#ef4444' : '#f59e0b',
          }}
          title={isRecording ? 'Parar gravação de áudio' : 'Gravar por voz'}
        >
          <Mic size={18} color="#000000" />
        </button>
      </form>

      {/* 4. Table Toolbar & Filters */}
      <div style={styles.tableSection}>
        <div style={styles.toolbar}>
          {/* Search Input */}
          <div style={styles.searchWrapper}>
            <Search size={16} color="var(--text-tertiary)" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar nas transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Filter Pills */}
          <div style={styles.filterPills}>
            <button
              style={{
                ...styles.btnSecondarySmall,
                backgroundColor: '#f59e0b',
                color: '#000000',
                fontWeight: '700'
              }}
              onClick={() => setShowNewModal(true)}
            >
              <Paperclip size={14} />
              <span>+ Documento</span>
            </button>

            <button
              style={{
                ...styles.pillBtn,
                backgroundColor: filterType === 'todos' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                color: filterType === 'todos' ? '#000000' : 'var(--text-secondary)'
              }}
              onClick={() => setFilterType('todos')}
            >
              Todos
            </button>

            <button
              style={{
                ...styles.pillBtn,
                backgroundColor: filterType === 'entradas' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                color: '#34d399'
              }}
              onClick={() => setFilterType('entradas')}
            >
              Entradas
            </button>

            <button
              style={{
                ...styles.pillBtn,
                backgroundColor: filterType === 'saidas' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                color: '#ef4444'
              }}
              onClick={() => setFilterType('saidas')}
            >
              Saídas
            </button>

            <button
              style={{
                ...styles.pillBtn,
                backgroundColor: filterType === 'docs' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                color: '#38bdf8'
              }}
              onClick={() => setFilterType('docs')}
            >
              <FileText size={14} />
              <span>Com Docs</span>
            </button>
          </div>
        </div>

        {/* 5. Middle Table (Tabela do Meio) */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>DESCRIÇÃO</th>
                <th style={styles.th}>PESSOA / EMPRESA</th>
                <th style={styles.th}>TIPO</th>
                <th style={styles.th}>VENCIMENTO</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>VALOR</th>
                <th style={styles.th}>DOCS</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} style={styles.tableRow}>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#ffffff' }}>
                      {tx.description}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
                        <User size={14} color="var(--text-tertiary)" />
                        <span>{tx.person}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.typeBadge,
                          backgroundColor: tx.type === 'entrada' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: tx.type === 'entrada' ? '#34d399' : '#ef4444'
                        }}
                      >
                        {tx.type === 'entrada' ? '+' : '-'} {tx.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>
                      {tx.dueDate}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: tx.status === 'Pago' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: tx.status === 'Pago' ? '#34d399' : '#f59e0b'
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: '700',
                        color: tx.type === 'entrada' ? '#34d399' : '#ef4444'
                      }}
                    >
                      {tx.type === 'entrada' ? '+' : '-'} R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.btnAttachDoc}>
                        <Paperclip size={13} />
                        <span>Anexar</span>
                      </button>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button style={styles.btnIconAction} title="Editar">
                          <Edit size={15} color="var(--accent-cyan)" />
                        </button>
                        <button
                          style={styles.btnIconAction}
                          onClick={() => handleDelete(tx.id)}
                          title="Excluir"
                        >
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nova Transação */}
      {showNewModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.125rem' }}>Cadastrar Nova Transação</h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                onClick={() => setShowNewModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label style={styles.label}>Descrição</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Pagamento Dominio Hostinger"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label style={styles.label}>Pessoa / Empresa</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Marcelo Marques"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label style={styles.label}>Tipo</label>
                  <select
                    className="input-field"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="saida">Saída (-)</option>
                    <option value="entrada">Entrada (+)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label style={styles.label}>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label style={styles.label}>Vencimento</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="DD/MM/AAAA"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label style={styles.label}>Status</label>
                  <select
                    className="input-field"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Transação
                </button>
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
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  topActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f59e0b',
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f59e0b',
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnSecondarySmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    border: 'none',
    borderRadius: '8px',
    padding: '0.4rem 0.875rem',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(20, 26, 38, 0.8)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  cardLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: 'var(--text-tertiary)',
  },
  cardValue: {
    fontSize: '1.75rem',
    fontWeight: '800',
    lineHeight: '1.2',
  },
  cardSub: {
    fontSize: '0.75rem',
    fontWeight: '600',
  },

  // AI TRANSACTION BAR (POSICIONADA ACIMA DA TABELA DO MEIO)
  quickBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(23, 30, 46, 0.95)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '0.5rem 0.875rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    margin: '0.5rem 0',
  },
  quickBarIconBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '0.375rem',
    borderRadius: '8px',
  },
  quickBarInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '0.9375rem',
  },
  quickBarMicBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  tableSection: {
    backgroundColor: 'rgba(20, 26, 38, 0.8)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '280px',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.875rem 0.625rem 2.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '0.875rem',
    outline: 'none',
  },
  filterPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.4rem 0.875rem',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
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
    padding: '0.875rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.625rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.625rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  btnAttachDoc: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '6px',
    padding: '0.3rem 0.625rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  btnIconAction: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.375rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '460px',
  },
  label: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
    display: 'block',
  }
};
