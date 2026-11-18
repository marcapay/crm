import React, { useState, useMemo } from 'react';
import { useApp, isMessageUnder30Days, isLogFromToday } from '../context/AppContext';
import {
  Users,
  Building2,
  Wrench,
  DollarSign,
  MessageSquare,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Edit,
  ShieldAlert,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Search,
  User,
  Reply
} from 'lucide-react';

export default function PainelGestaoPortais() {
  const {
    portalUsers = [],
    systemUsers = [],
    setSystemUsers,
    clients = [],
    profile,
    properties = [],
    contracts = [],
    financialRecords = [],
    maintenanceRequests = [],
    portalMessages = [],
    activityLogs = [],
    clearActivityLogs,
    updateMaintenanceStatus,
    sendPortalMessage,
    deletePortalMessage,
    quickLoginPortal,
    deletePortalUser,
    deleteUser,
    createProperty,
    createContract,
    recordTenantPayment,
    recordOwnerPayout
  } = useApp();

  const allUsers = [
    ...(systemUsers || []),
    ...(portalUsers || []),
    ...(clients || []).map(c => ({
      id: c.id,
      name: c.name || c.nome || 'Cliente CRM',
      email: c.email || `${c.id}@portal.com`,
      role: (c.role || c.tipo || c.situacaoComercial || '').toLowerCase().includes('inquilino') ? 'inquilino' : 
            (c.role || c.tipo || c.situacaoComercial || '').toLowerCase().includes('proprietario') ? 'proprietario' : (c.role || 'proprietario'),
      phone: c.phone || c.telefone || '',
      password: c.password || '123456'
    }))
  ];
  const uniqueUsers = [];
  const seenKeys = new Set();
  allUsers.forEach(u => {
    if (!u) return;
    const key = (u.email || u.id || '').toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueUsers.push(u);
    }
  });

  const activePortalUsers = uniqueUsers.filter(u => {
    if (!u) return false;
    const role = (u.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return role.includes('proprietar') || role.includes('inquilino') || role.includes('locador') || role.includes('locatario');
  });

  const availableOwners = uniqueUsers.filter(u => {
    if (!u) return false;
    const roleNorm = (u.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return roleNorm.includes('proprietar') || roleNorm.includes('locador') || roleNorm.includes('dono') || !roleNorm;
  });

  const ownerOptions = availableOwners.length > 0 ? availableOwners : uniqueUsers;

  const availableTenants = uniqueUsers.filter(u => {
    if (!u) return false;
    const roleNorm = (u.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return roleNorm.includes('inquilino') || roleNorm.includes('locatario') || roleNorm.includes('morador') || !roleNorm;
  });

  const tenantOptions = availableTenants.length > 0 ? availableTenants : uniqueUsers;

  const isUserAdmin = (profile?.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'administrador' || (profile?.role || '').toLowerCase() === 'admin';

  const visiblePortalMessages = (portalMessages || []).filter(isMessageUnder30Days).filter(msg => {
    if (!msg) return false;
    if (isUserAdmin) return true;

    const currentId = (profile?.id || '').toString();
    const currentEmail = (profile?.email || '').toLowerCase();
    const currentName = (profile?.name || '').toLowerCase();

    const senderId = (msg.senderId || '').toString();
    const senderEmail = (msg.senderEmail || '').toLowerCase();
    const senderName = (msg.senderName || '').toLowerCase();

    const recipientId = (msg.recipientId || '').toString();
    const recipientEmail = (msg.recipientEmail || '').toLowerCase();

    const isSender = (currentId && senderId && currentId === senderId) ||
                     (currentEmail && senderEmail && currentEmail === senderEmail) ||
                     (currentName && senderName && currentName === senderName);

    const isRecipient = (currentId && recipientId && currentId === recipientId) ||
                        (currentEmail && recipientEmail && currentEmail === recipientEmail);

    return isSender || isRecipient;
  });

  const formatMoney = (val) => {
    const num = Number(val);
    return isNaN(num) ? '0,00' : num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const [activeSubTab, setActiveSubTab] = useState('usuarios'); // 'usuarios', 'manutencoes', 'repasses', 'mensagens', 'logs'
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [budgetValueInput, setBudgetValueInput] = useState('');
  const [budgetSupplierInput, setBudgetSupplierInput] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Modals
  const [showPropModal, setShowPropModal] = useState(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropRent, setNewPropRent] = useState('2500.00');
  const [newPropOwnerId, setNewPropOwnerId] = useState('');
  const [newPropTenantId, setNewPropTenantId] = useState('');

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgTargetUser, setMsgTargetUser] = useState('');
  const [msgSubjectInput, setMsgSubjectInput] = useState('');
  const [msgBodyInput, setMsgBodyInput] = useState('');

  // Central de Recados - Estados e Separação por Inquilino e Proprietário
  const [msgRoleFilter, setMsgRoleFilter] = useState('todos'); // 'todos', 'inquilinos', 'proprietarios'
  const [selectedMsgContactId, setSelectedMsgContactId] = useState('all');
  const [msgSearchContact, setMsgSearchContact] = useState('');

  const isTenantRole = (role) => {
    const r = (role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return r.includes('inquilino') || r.includes('locatario') || r.includes('morador');
  };

  const isOwnerRole = (role) => {
    const r = (role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return r.includes('proprietar') || r.includes('locador') || r.includes('dono');
  };

  const doesMsgMatchUser = (msg, u) => {
    if (!msg || !u) return false;
    const uId = (u.id || '').toString();
    const uEmail = (u.email || '').toLowerCase().trim();
    const uName = (u.name || u.nome || '').toLowerCase().trim();

    const senderId = (msg.senderId || '').toString();
    const senderEmail = (msg.senderEmail || '').toLowerCase().trim();
    const senderName = (msg.senderName || '').toLowerCase().trim();

    const recipientId = (msg.recipientId || '').toString();
    const recipientEmail = (msg.recipientEmail || '').toLowerCase().trim();

    const isSender = (uId && senderId && uId === senderId) ||
                     (uEmail && senderEmail && uEmail === senderEmail) ||
                     (uName && senderName && uName === senderName);

    const isRecipient = (uId && recipientId && uId === recipientId) ||
                        (uEmail && recipientEmail && uEmail === recipientEmail);

    const isBroadcast = (msg.recipientId === 'all' || !msg.recipientId) &&
      ((msg.recipientRole === 'inquilino' && isTenantRole(u.role)) ||
       (msg.recipientRole === 'proprietario' && isOwnerRole(u.role)));

    return isSender || isRecipient || isBroadcast;
  };

  const portalContacts = useMemo(() => {
    const map = new Map();

    activePortalUsers.forEach(u => {
      if (!u) return;
      const key = (u.email || u.id || u.name || '').toLowerCase().trim();
      if (!key) return;
      const isTenant = isTenantRole(u.role);
      const isOwner = isOwnerRole(u.role);
      map.set(key, {
        id: u.id || key,
        name: u.name || u.nome || 'Contato',
        email: u.email || '',
        phone: u.phone || u.telefone || '',
        role: isTenant ? 'inquilino' : isOwner ? 'proprietario' : (u.role || 'inquilino'),
        roleLabel: isTenant ? 'Inquilino' : isOwner ? 'Proprietário' : (u.role || 'Inquilino'),
        messageCount: 0,
        lastMessageDate: ''
      });
    });

    visiblePortalMessages.forEach(msg => {
      if (!msg) return;
      const sRole = (msg.senderRole || '').toLowerCase();
      const isSenderClient = !sRole.includes('admin') && !sRole.includes('imobiliaria');
      const candidateKey = isSenderClient
        ? (msg.senderEmail || msg.senderId || msg.senderName || '').toLowerCase().trim()
        : (msg.recipientEmail || msg.recipientId || '').toLowerCase().trim();

      if (candidateKey && !map.has(candidateKey)) {
        const role = isTenantRole(msg.senderRole || msg.recipientRole) ? 'inquilino' : 'proprietario';
        map.set(candidateKey, {
          id: isSenderClient ? (msg.senderId || candidateKey) : (msg.recipientId || candidateKey),
          name: isSenderClient ? (msg.senderName || 'Contato') : 'Contato',
          email: isSenderClient ? (msg.senderEmail || '') : (msg.recipientEmail || ''),
          phone: '',
          role: role,
          roleLabel: role === 'inquilino' ? 'Inquilino' : 'Proprietário',
          messageCount: 0,
          lastMessageDate: ''
        });
      }
    });

    const list = Array.from(map.values());
    list.forEach(c => {
      const msgs = visiblePortalMessages.filter(m => doesMsgMatchUser(m, c));
      c.messageCount = msgs.length;
      if (msgs.length > 0) {
        c.lastMessageDate = msgs[0]?.date || '';
      }
    });

    return list.sort((a, b) => {
      if (a.messageCount > 0 && b.messageCount === 0) return -1;
      if (a.messageCount === 0 && b.messageCount > 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [activePortalUsers, visiblePortalMessages]);

  const filteredContacts = useMemo(() => {
    return portalContacts.filter(c => {
      if (msgRoleFilter === 'inquilinos' && c.role !== 'inquilino') return false;
      if (msgRoleFilter === 'proprietarios' && c.role !== 'proprietario') return false;
      if (msgSearchContact.trim()) {
        const q = msgSearchContact.toLowerCase().trim();
        const mName = c.name.toLowerCase().includes(q);
        const mEmail = c.email.toLowerCase().includes(q);
        const mPhone = (c.phone || '').includes(q);
        return mName || mEmail || mPhone;
      }
      return true;
    });
  }, [portalContacts, msgRoleFilter, msgSearchContact]);

  const selectedContact = useMemo(() => {
    if (selectedMsgContactId === 'all') return null;
    return portalContacts.find(c => c.id === selectedMsgContactId || (c.email && c.email.toLowerCase() === selectedMsgContactId.toLowerCase())) || null;
  }, [portalContacts, selectedMsgContactId]);

  const displayedPortalMessages = useMemo(() => {
    return visiblePortalMessages.filter(msg => {
      if (selectedContact) {
        return doesMsgMatchUser(msg, selectedContact);
      }
      if (msgRoleFilter === 'inquilinos') {
        const sRole = (msg.senderRole || '').toLowerCase();
        const rRole = (msg.recipientRole || '').toLowerCase();
        return isTenantRole(sRole) || isTenantRole(rRole);
      }
      if (msgRoleFilter === 'proprietarios') {
        const sRole = (msg.senderRole || '').toLowerCase();
        const rRole = (msg.recipientRole || '').toLowerCase();
        return isOwnerRole(sRole) || isOwnerRole(rRole);
      }
      return true;
    });
  }, [visiblePortalMessages, selectedContact, msgRoleFilter]);

  const handleCreatePropSubmit = (e) => {
    e.preventDefault();
    if (!newPropTitle.trim()) return;
    const owner = uniqueUsers.find(u => u.id === newPropOwnerId) ||
                  ownerOptions.find(u => u.id === newPropOwnerId) ||
                  ownerOptions[0] ||
                  { id: 'owner_gen', name: 'Proprietário' };

    const tenant = uniqueUsers.find(u => u.id === newPropTenantId) ||
                   tenantOptions.find(u => u.id === newPropTenantId) ||
                   null;

    createProperty({
      title: newPropTitle,
      address: newPropAddress,
      rentValue: newPropRent,
      ownerId: owner.id,
      ownerName: owner.name || owner.nome || 'Proprietário',
      currentTenantId: tenant ? tenant.id : null,
      currentTenantName: tenant ? (tenant.name || tenant.nome || 'Inquilino') : null,
      tenantId: tenant ? tenant.id : null,
      tenantName: tenant ? (tenant.name || tenant.nome || 'Inquilino') : null,
      status: tenant ? 'Alugado' : 'Disponível'
    });
    setNewPropTitle('');
    setNewPropAddress('');
    setNewPropOwnerId('');
    setNewPropTenantId('');
    setShowPropModal(false);
    setActionNotice(`Imóvel "${newPropTitle}" cadastrado com sucesso!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSendAdminMessage = (e) => {
    e.preventDefault();
    if (!msgBodyInput.trim()) return;
    const recipient = activePortalUsers.find(u => u.id === msgTargetUser) || activePortalUsers[0];
    sendPortalMessage({
      senderId: profile?.id,
      senderEmail: profile?.email,
      senderRole: profile?.role || 'imobiliaria',
      senderName: profile?.name || 'Atendimento Araújo Imóveis',
      recipientRole: recipient?.role || 'cliente',
      recipientId: recipient?.id || 'all',
      recipientEmail: recipient?.email || '',
      subject: msgSubjectInput || 'Aviso do Portal Araújo Imóveis',
      body: msgBodyInput
    });
    setMsgBodyInput('');
    setMsgSubjectInput('');
    setShowMessageModal(false);
    setActionNotice(`Mensagem enviada para ${recipient?.name || 'cliente'}!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSaveBudgetAndForward = (e) => {
    e.preventDefault();
    if (!selectedMaint) return;
    const val = parseFloat(budgetValueInput);
    updateMaintenanceStatus(
      selectedMaint.id,
      'Aguardando proprietário',
      val,
      budgetSupplierInput,
      '21/08/2026',
      '14h às 16h'
    );
    setSelectedMaint(null);
    setActionNotice(`Orçamento de R$ ${val} cadastrado e encaminhado para o Proprietário!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSetSchedule = (maintId) => {
    updateMaintenanceStatus(
      maintId,
      'Prestador agendado',
      undefined,
      undefined,
      '22/08/2026',
      '09h às 11h'
    );
    setActionNotice(`Prestador agendado para o chamado ${maintId}!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleMarkCompleted = (maintId) => {
    updateMaintenanceStatus(maintId, 'Concluído');
    setActionNotice(`Chamado ${maintId} marcado como CONCLUÍDO!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div style={styles.container}>
      {/* Module Title */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Portal de Locação: Gestão de Proprietários & Inquilinos</h1>
          <p style={styles.subtitle}>
            Gerenciamento centralizado de acessos, chamados de manutenção, autorizações e auditoria do portal.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div style={styles.actionNotice}>
          <CheckCircle size={18} color="#34d399" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Internal Navigation Sub-Tabs */}
      <div style={styles.subNav}>
        <button 
          style={styles.subTabBtn(activeSubTab === 'usuarios')} 
          onClick={() => setActiveSubTab('usuarios')}
        >
          <Users size={18} />
          <span>Usuários & Acessos</span>
        </button>

        <button 
          style={styles.subTabBtn(activeSubTab === 'manutencoes')} 
          onClick={() => setActiveSubTab('manutencoes')}
        >
          <Wrench size={18} />
          <span>Manutenções ({maintenanceRequests.filter(m => m.status !== 'Concluído').length})</span>
        </button>

        <button 
          style={styles.subTabBtn(activeSubTab === 'repasses')} 
          onClick={() => setActiveSubTab('repasses')}
        >
          <DollarSign size={18} />
          <span>Aluguéis & Repasses</span>
        </button>

        <button 
          style={styles.subTabBtn(activeSubTab === 'mensagens')} 
          onClick={() => setActiveSubTab('mensagens')}
        >
          <MessageSquare size={18} />
          <span>Central de Recados</span>
        </button>

        <button 
          style={styles.subTabBtn(activeSubTab === 'logs')} 
          onClick={() => setActiveSubTab('logs')}
        >
          <Activity size={18} />
          <span>Log de Atividades</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: USUÁRIOS & ACESSOS ================= */}
      {activeSubTab === 'usuarios' && (
        <div style={styles.tabSection}>
          <div style={styles.sectionTitleRow}>
            <div>
              <h3>Contas do Portal (Proprietários e Inquilinos)</h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                Gerencie credenciais ou simule o acesso direto ao portal.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={styles.btnActionPrimary} onClick={() => {
                if (!newPropOwnerId && ownerOptions.length > 0) {
                  setNewPropOwnerId(ownerOptions[0].id);
                }
                setShowPropModal(true);
              }}>
                <Plus size={16} />
                <span>Cadastrar Imóvel</span>
              </button>
            </div>
          </div>

          <div style={styles.userGrid}>
            {activePortalUsers.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nenhum proprietário ou inquilino cadastrado no sistema.</p>
                <span style={{ fontSize: '0.875rem' }}>Para adicionar contas com acesso a esta aba, vá em <strong>Configurações &gt; Usuários</strong> e cadastre um membro com a função <strong>Proprietário</strong> ou <strong>Inquilino</strong>.</span>
              </div>
            ) : (
              activePortalUsers.map(u => (
                <div key={u.id} style={styles.userCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: u.color || 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: '1rem',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (u.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{u.name}</strong>
                      <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8125rem' }}>{u.email}</div>
                      <div style={styles.roleTag(u.role)}>
                        {u.role}
                      </div>
                    </div>
                  </div>

                  <div style={styles.userDivider} />

                  <div style={styles.userInfoRow}>
                    <span>Senha de Acesso:</span>
                    <strong style={{ color: '#f59e0b' }}>{u.password || '123456'}</strong>
                  </div>
                  <div style={styles.userInfoRow}>
                    <span>Telefone:</span>
                    <span>{u.phone || '(37) 99999-0000'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button 
                      style={{ ...styles.btnSimulateLogin, flex: 1 }} 
                      onClick={() => quickLoginPortal(u)}
                    >
                      <Eye size={16} />
                      <span>Entrar no Portal</span>
                    </button>

                    <button 
                      style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer' }}
                      onClick={() => {
                        if (confirm(`Deseja remover o acesso de "${u.name}"?`)) {
                          if (typeof deleteUser === 'function') {
                            deleteUser(u.id, u.email);
                          } else if (typeof deletePortalUser === 'function') {
                            deletePortalUser(u.id, u.email);
                          } else {
                            setSystemUsers(prev => (prev || []).filter(x => x.id !== u.id && x.email !== u.email));
                          }
                          setActionNotice(`Acesso de ${u.name} removido.`);
                          setTimeout(() => setActionNotice(''), 3000);
                        }
                      }}
                      title="Remover acesso"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Novo Imóvel */}
          {showPropModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Cadastrar Novo Imóvel de Locação</h3>
                <form onSubmit={handleCreatePropSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Título do Imóvel</label>
                    <input type="text" className="input-field" value={newPropTitle} onChange={e => setNewPropTitle(e.target.value)} placeholder="Ex: Apt 401 - Edifício Solar" required />
                  </div>
                  <div className="input-group">
                    <label>Endereço Completo</label>
                    <input type="text" className="input-field" value={newPropAddress} onChange={e => setNewPropAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade/MG" required />
                  </div>
                  <div className="input-group">
                    <label>Valor Mensal do Aluguel R$</label>
                    <input type="number" step="0.01" className="input-field" value={newPropRent} onChange={e => setNewPropRent(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label style={{ color: '#ffffff', marginBottom: '0.375rem', display: 'block', fontSize: '0.875rem' }}>Proprietário Responsável</label>
                    <select 
                      className="input-field" 
                      value={newPropOwnerId} 
                      onChange={e => setNewPropOwnerId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>Selecione o proprietário...</option>
                      {ownerOptions.map(p => (
                        <option key={p.id || p.email} value={p.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                          {p.name || p.nome || 'Proprietário'} ({p.email || p.phone || 'Sem e-mail'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ color: '#ffffff', marginBottom: '0.375rem', display: 'block', fontSize: '0.875rem' }}>Inquilino / Locatário Responsável (Opcional)</label>
                    <select 
                      className="input-field" 
                      value={newPropTenantId} 
                      onChange={e => setNewPropTenantId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>Selecione o inquilino (se alugado)...</option>
                      {tenantOptions.map(t => (
                        <option key={t.id || t.email} value={t.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                          {t.name || t.nome || 'Inquilino'} ({t.email || t.phone || 'Sem e-mail'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPropModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Cadastrar Imóvel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 2: MANUTENÇÕES ================= */}
      {activeSubTab === 'manutencoes' && (
        <div style={styles.tabSection}>
          <div style={styles.sectionTitleRow}>
            <h3>Fluxo de Chamados de Manutenção</h3>
          </div>

          <div style={styles.maintTableWrapper}>
            {maintenanceRequests.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--glass-highlight)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                Nenhum chamado de manutenção cadastrado até o momento.
              </div>
            ) : (
              maintenanceRequests.map(maint => (
                <div key={maint.id} style={styles.maintAdminCard}>
                  <div style={styles.maintAdminHeader}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>{maint.protocol}</span>
                      <h4 style={{ color: '#ffffff', fontSize: '1rem', marginTop: '0.125rem' }}>{maint.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Imóvel: {maint.propertyName} | Inquilino: {maint.tenantName} | Proprietário: {maint.ownerName}
                      </span>
                    </div>
                    <span style={styles.statusBadgeAdmin(maint.status)}>{maint.status}</span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.75rem 0' }}>
                    {maint.description}
                  </p>

                  {maint.budgetValue && (
                    <div style={styles.budgetBoxAdmin}>
                      <span>Orçamento Cadastrado: <strong>R$ {formatMoney(maint.budgetValue)}</strong> ({maint.budgetSupplier})</span>
                      {maint.decision && <span style={{ marginLeft: '1rem', color: maint.decision === 'AUTORIZADO' ? '#34d399' : '#ef4444', fontWeight: 'bold' }}>Decisão Proprietário: {maint.decision}</span>}
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div style={styles.adminMaintActions}>
                    {maint.status === 'Solicitado' || maint.status === 'Em análise' ? (
                      <button style={styles.btnActionPrimary} onClick={() => {
                        setSelectedMaint(maint);
                        setBudgetValueInput(maint.budgetValue || '350.00');
                        setBudgetSupplierInput(maint.budgetSupplier || 'José Serviços Hidráulicos');
                      }}>
                        <Edit size={14} />
                        <span>Cadastrar Orçamento & Encaminhar</span>
                      </button>
                    ) : null}

                    {maint.status === 'Autorizado' && (
                      <button style={styles.btnActionWarning} onClick={() => handleSetSchedule(maint.id)}>
                        <Calendar size={14} />
                        <span>Agendar Prestador (22/08 - 09h)</span>
                      </button>
                    )}

                    {maint.status !== 'Concluído' && (
                      <button style={styles.btnActionSuccess} onClick={() => handleMarkCompleted(maint.id)}>
                        <CheckCircle size={14} />
                        <span>Marcar como Concluído</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Cadastrar Orçamento */}
          {selectedMaint && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Orçamento da Manutenção {selectedMaint.protocol}</h3>
                <form onSubmit={handleSaveBudgetAndForward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Valor Estimado R$</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="input-field" 
                      value={budgetValueInput} 
                      onChange={(e) => setBudgetValueInput(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="input-group">
                    <label>Prestador / Fornecedor</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={budgetSupplierInput} 
                      onChange={(e) => setBudgetSupplierInput(e.target.value)}
                      required 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedMaint(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Encaminhar ao Proprietário</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 3: ALUGUÉIS & REPASSES ================= */}
      {activeSubTab === 'repasses' && (
        <div style={styles.tabSection}>
          <div style={styles.sectionTitleRow}>
            <h3>Controle de Aluguéis e Repasses Financeiros</h3>
          </div>

          <div style={styles.finTableCard}>
            {financialRecords.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Nenhum aluguel ou repasse financeiro registrado no momento.
              </div>
            ) : (
              financialRecords.map(rec => (
                <div key={rec.id} style={styles.finRow}>
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>{rec.competence}</strong>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{rec.propertyName}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Valor Aluguel: <strong>R$ {formatMoney(rec.grossRent)}</strong> | Repasse Líquido: <strong style={{ color: 'var(--accent-cyan)' }}>R$ {formatMoney(rec.netRepasse)}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', color: '#ffffff' }}>
                        Inquilino: <strong style={{ color: rec.tenantStatus === 'Pago' ? '#34d399' : '#f59e0b' }}>{rec.tenantStatus}</strong>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#ffffff' }}>
                        Proprietário: <strong style={{ color: rec.ownerStatus === 'Pago' ? '#34d399' : '#f59e0b' }}>{rec.ownerStatus}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {rec.tenantStatus !== 'Pago' && (
                        <button style={styles.btnActionSuccess} onClick={() => {
                          recordTenantPayment(rec.id);
                          setActionNotice(`Pagamento do aluguel confirmado para ${rec.competence}!`);
                          setTimeout(() => setActionNotice(''), 3000);
                        }}>
                          <CheckCircle size={12} />
                          <span>Baixar Pagamento</span>
                        </button>
                      )}

                      {rec.tenantStatus === 'Pago' && rec.ownerStatus !== 'Pago' && (
                        <button style={styles.btnActionPrimary} onClick={() => {
                          recordOwnerPayout(rec.id);
                          setActionNotice(`Repasse de R$ ${rec.netRepasse} realizado ao proprietário!`);
                          setTimeout(() => setActionNotice(''), 3000);
                        }}>
                          <DollarSign size={12} />
                          <span>Efetuar Repasse</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: CENTRAL DE RECADOS ================= */}
      {activeSubTab === 'mensagens' && (
        <div style={styles.tabSection}>
          <div style={styles.sectionTitleRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Central de Mensagens do Portal</h3>
              <span style={{
                fontSize: '0.6875rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: '500'
              }}>
                <Clock size={11} />
                Limpeza automática a cada 30 dias ativa
              </span>
            </div>
            <button style={styles.btnActionPrimary} onClick={() => setShowMessageModal(true)}>
              <Send size={14} />
              <span>Nova Mensagem</span>
            </button>
          </div>

          <div className="portal-recados-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 330px) 1fr',
            gap: '1.25rem',
            alignItems: 'start'
          }}>
            {/* PAINEL LATERAL ESQUERDO: CONTATOS (INQUILINOS E PROPRIETÁRIOS) */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={14} style={{ color: 'var(--accent-cyan)' }} />
                  Filtrar por Usuário
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  {filteredContacts.length} contato(s)
                </span>
              </div>

              {/* Botões de Filtro: Todos, Inquilinos, Proprietários */}
              <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setMsgRoleFilter('todos'); setSelectedMsgContactId('all'); }}
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: msgRoleFilter === 'todos' ? 'var(--accent-primary)' : 'transparent',
                    color: msgRoleFilter === 'todos' ? '#000000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  Todos ({portalContacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setMsgRoleFilter('inquilinos'); setSelectedMsgContactId('all'); }}
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: msgRoleFilter === 'inquilinos' ? '#f472b6' : 'transparent',
                    color: msgRoleFilter === 'inquilinos' ? '#000000' : '#f472b6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  Inquilinos ({portalContacts.filter(c => c.role === 'inquilino').length})
                </button>
                <button
                  type="button"
                  onClick={() => { setMsgRoleFilter('proprietarios'); setSelectedMsgContactId('all'); }}
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: msgRoleFilter === 'proprietarios' ? '#c084fc' : 'transparent',
                    color: msgRoleFilter === 'proprietarios' ? '#000000' : '#c084fc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  Proprietários ({portalContacts.filter(c => c.role === 'proprietario').length})
                </button>
              </div>

              {/* Busca de Contato */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={msgSearchContact}
                  onChange={e => setMsgSearchContact(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.625rem 0.4rem 1.85rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Lista com Opção Todos + Contatos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '2px' }}>
                {/* Opção Todos os Recados */}
                <div
                  onClick={() => setSelectedMsgContactId('all')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedMsgContactId === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: selectedMsgContactId === 'all' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: selectedMsgContactId === 'all' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                      color: selectedMsgContactId === 'all' ? '#000000' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <MessageSquare size={14} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: selectedMsgContactId === 'all' ? '#ffffff' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Todos os Recados
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>
                        {msgRoleFilter === 'inquilinos' ? 'Todos os Inquilinos' : msgRoleFilter === 'proprietarios' ? 'Todos os Proprietários' : 'Geral do Portal'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    flexShrink: 0
                  }}>
                    {visiblePortalMessages.length}
                  </span>
                </div>

                {filteredContacts.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                    Nenhum contato encontrado.
                  </div>
                ) : (
                  filteredContacts.map(contact => {
                    const isSelected = selectedMsgContactId === contact.id;
                    const isTenant = contact.role === 'inquilino';
                    return (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedMsgContactId(contact.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.65rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected 
                            ? (isTenant ? 'rgba(244, 114, 182, 0.16)' : 'rgba(192, 132, 252, 0.16)') 
                            : 'transparent',
                          border: isSelected 
                            ? (isTenant ? '1px solid #f472b6' : '1px solid #c084fc') 
                            : '1px solid transparent',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: isTenant ? 'rgba(244, 114, 182, 0.2)' : 'rgba(192, 132, 252, 0.2)',
                            color: isTenant ? '#f472b6' : '#c084fc',
                            border: isTenant ? '1px solid rgba(244, 114, 182, 0.35)' : '1px solid rgba(192, 132, 252, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.7rem',
                            flexShrink: 0
                          }}>
                            {(contact.name || 'C').substring(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              color: isSelected ? '#ffffff' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {contact.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                              <span style={{
                                fontSize: '0.5625rem',
                                fontWeight: '700',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                backgroundColor: isTenant ? 'rgba(244, 114, 182, 0.2)' : 'rgba(192, 132, 252, 0.2)',
                                color: isTenant ? '#f472b6' : '#c084fc'
                              }}>
                                {contact.roleLabel}
                              </span>
                              {contact.lastMessageDate && (
                                <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                                  {contact.lastMessageDate.split(',')[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {contact.messageCount > 0 ? (
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '10px',
                            backgroundColor: isTenant ? 'rgba(244, 114, 182, 0.25)' : 'rgba(192, 132, 252, 0.25)',
                            color: isTenant ? '#f472b6' : '#c084fc',
                            flexShrink: 0
                          }}>
                            {contact.messageCount}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                            0
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* PAINEL DIREITO: MENSAGENS DO USUÁRIO SELECIONADO OU GERAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
              {/* Barra de Status do Contato Selecionado */}
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--border-radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {selectedContact ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: selectedContact.role === 'inquilino' ? 'rgba(244, 114, 182, 0.2)' : 'rgba(192, 132, 252, 0.2)',
                      color: selectedContact.role === 'inquilino' ? '#f472b6' : '#c084fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      {(selectedContact.name || 'C').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>{selectedContact.name}</strong>
                        <span style={{
                          fontSize: '0.625rem',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          backgroundColor: selectedContact.role === 'inquilino' ? 'rgba(244, 114, 182, 0.2)' : 'rgba(192, 132, 252, 0.2)',
                          color: selectedContact.role === 'inquilino' ? '#f472b6' : '#c084fc'
                        }}>
                          {selectedContact.roleLabel}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {selectedContact.email || selectedContact.phone || 'Sem contato adicional'} • {displayedPortalMessages.length} recado(s) encontrado(s)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#ffffff' }}>
                      {msgRoleFilter === 'inquilinos' ? 'Recados de Todos os Inquilinos' : msgRoleFilter === 'proprietarios' ? 'Recados de Todos os Proprietários' : 'Todos os Recados do Portal'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Exibindo {displayedPortalMessages.length} mensagem(ns) nos últimos 30 dias
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedContact && (
                    <button
                      type="button"
                      onClick={() => setSelectedMsgContactId('all')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                    >
                      Ver Todos
                    </button>
                  )}
                  <button
                    type="button"
                    style={styles.btnActionPrimary}
                    onClick={() => {
                      if (selectedContact) {
                        setMsgTargetUser(selectedContact.id);
                      }
                      setShowMessageModal(true);
                    }}
                  >
                    <Send size={13} />
                    <span>{selectedContact ? `Recado para ${selectedContact.name.split(' ')[0]}` : 'Nova Mensagem'}</span>
                  </button>
                </div>
              </div>

              {/* Lista de Mensagens */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {displayedPortalMessages.length === 0 ? (
                  <div style={{
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    background: 'var(--glass-highlight)',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <MessageSquare size={30} style={{ margin: '0 auto 0.75rem auto', opacity: 0.35 }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {selectedContact 
                        ? `Nenhum recado encontrado para ${selectedContact.name} nos últimos 30 dias.`
                        : 'Nenhuma mensagem na central de recados nos últimos 30 dias.'}
                    </div>
                    {selectedContact && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', fontSize: '0.8125rem' }}
                        onClick={() => {
                          setMsgTargetUser(selectedContact.id);
                          setShowMessageModal(true);
                        }}
                      >
                        <Send size={13} style={{ marginRight: '0.35rem' }} />
                        Enviar Recado para {selectedContact.name.split(' ')[0]}
                      </button>
                    )}
                  </div>
                ) : (
                  displayedPortalMessages.map(msg => {
                    const isMsgTenant = isTenantRole(msg.senderRole);
                    return (
                      <div key={msg.id} style={styles.msgAdminCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{msg.senderName}</strong>
                            <span style={{
                              fontSize: '0.625rem',
                              fontWeight: '700',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              backgroundColor: isMsgTenant ? 'rgba(244, 114, 182, 0.2)' : 'rgba(192, 132, 252, 0.2)',
                              color: isMsgTenant ? '#f472b6' : '#c084fc'
                            }}>
                              {isMsgTenant ? 'Inquilino' : 'Proprietário'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{msg.date}</span>
                            {deletePortalMessage && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('Deseja apagar esta mensagem da central de recados?')) {
                                    deletePortalMessage(msg.id);
                                  }
                                }}
                                title="Apagar mensagem"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-tertiary)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'opacity 0.2s'
                                }}
                              >
                                <Trash2 size={13} style={{ color: 'var(--accent-danger)' }} />
                              </button>
                            )}
                          </div>
                        </div>
                        <h4 style={{ color: 'var(--accent-cyan)', margin: '0.375rem 0 0.25rem 0', fontSize: '0.875rem' }}>{msg.subject}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: '1.45', margin: 0 }}>{msg.body}</p>
                        <div style={{ marginTop: '0.625rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const target = portalContacts.find(c => doesMsgMatchUser(msg, c));
                              if (target) setMsgTargetUser(target.id);
                              setMsgSubjectInput(msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || 'Recado'}`);
                              setShowMessageModal(true);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text-secondary)',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.6875rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Reply size={11} />
                            Responder
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Modal Nova Mensagem */}
          {showMessageModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Enviar Mensagem pelo Portal</h3>
                <form onSubmit={handleSendAdminMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Destinatário</label>
                    <select className="input-field" value={msgTargetUser} onChange={e => setMsgTargetUser(e.target.value)}>
                      {activePortalUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Assunto</label>
                    <input type="text" className="input-field" value={msgSubjectInput} onChange={e => setMsgSubjectInput(e.target.value)} placeholder="Ex: Atualização do Contrato" required />
                  </div>
                  <div className="input-group">
                    <label>Mensagem</label>
                    <textarea className="input-field" rows="4" value={msgBodyInput} onChange={e => setMsgBodyInput(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowMessageModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Enviar Recado</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 5: LOG DE ATIVIDADES ================= */}
      {activeSubTab === 'logs' && (() => {
        const todayLogs = (activityLogs || []).filter(isLogFromToday);
        return (
          <div style={styles.tabSection}>
            <div style={styles.sectionTitleRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}>Log de Auditoria e Atividades do Portal</h3>
                <span style={{
                  fontSize: '0.6875rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: '500'
                }}>
                  <Clock size={11} />
                  Limpeza diária ativa • Logs expiram ao fim do dia (23:59)
                </span>
              </div>
              {todayLogs.length > 0 && clearActivityLogs && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja limpar todos os registros de log de hoje?')) {
                      clearActivityLogs();
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Trash2 size={13} style={{ color: 'var(--accent-danger)' }} />
                  <span>Limpar Logs de Hoje</span>
                </button>
              )}
            </div>

            <div style={styles.logsList}>
              {todayLogs.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--glass-highlight)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  Nenhuma atividade registrada no log hoje (os registros são zerados automaticamente ao final de cada dia).
                </div>
              ) : (
                todayLogs.map(log => (
                  <div key={log.id} style={styles.logRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Clock size={16} color="var(--accent-cyan)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{log.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                      <strong>{log.userName}</strong>: {log.action}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  actionNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--border-radius-sm)',
    color: '#34d399',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  subNav: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '0.75rem',
    overflowX: 'auto',
  },
  subTabBtn: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    backgroundColor: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
    color: active ? '#000000' : 'var(--text-secondary)',
    border: '1px solid var(--glass-border)',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  }),
  tabSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  userCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--glass-border)',
  },
  roleTag: (role) => ({
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '8px',
    backgroundColor: role === 'proprietario' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(56, 189, 248, 0.15)',
    color: role === 'proprietario' ? 'var(--accent-cyan)' : '#38bdf8',
    marginTop: '0.25rem',
  }),
  userDivider: {
    height: '1px',
    backgroundColor: 'var(--glass-border)',
  },
  userInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
  },
  btnSimulateLogin: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--accent-primary)',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  maintTableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  maintAdminCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
  },
  maintAdminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadgeAdmin: (status) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: status === 'Concluído' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
    color: status === 'Concluído' ? '#34d399' : '#f59e0b',
  }),
  budgetBoxAdmin: {
    padding: '0.75rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  adminMaintActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  btnActionPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: 'var(--accent-primary)',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 0.875rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnActionWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#f59e0b',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 0.875rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnActionSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 0.875rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
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
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '440px',
  },
  finTableCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  finRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--glass-border)',
  },
  msgAdminCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  logRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
  }
};
