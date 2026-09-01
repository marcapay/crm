import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Trash2
} from 'lucide-react';

export default function PainelGestaoPortais() {
  const {
    portalUsers,
    properties,
    contracts,
    financialRecords,
    maintenanceRequests,
    portalMessages,
    activityLogs,
    updateMaintenanceStatus,
    sendPortalMessage,
    quickLoginPortal,
    createPortalUser,
    deletePortalUser,
    createProperty,
    createContract,
    recordTenantPayment,
    recordOwnerPayout
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('usuarios'); // 'usuarios', 'manutencoes', 'repasses', 'mensagens', 'logs'
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [budgetValueInput, setBudgetValueInput] = useState('');
  const [budgetSupplierInput, setBudgetSupplierInput] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('proprietario');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');

  const [showPropModal, setShowPropModal] = useState(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropRent, setNewPropRent] = useState('2500.00');
  const [newPropOwnerId, setNewPropOwnerId] = useState('');

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgTargetUser, setMsgTargetUser] = useState('');
  const [msgSubjectInput, setMsgSubjectInput] = useState('');
  const [msgBodyInput, setMsgBodyInput] = useState('');

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    createPortalUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      phone: newUserPhone,
      password: newUserPassword
    });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setShowUserModal(false);
    setActionNotice(`Usuário ${newUserName} cadastrado com sucesso!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleCreatePropSubmit = (e) => {
    e.preventDefault();
    if (!newPropTitle.trim()) return;
    const owner = portalUsers.find(u => u.id === newPropOwnerId) || portalUsers.find(u => u.role === 'proprietario') || { id: 'user_proprietario_1', name: 'Carlos Eduardo Silva' };
    createProperty({
      title: newPropTitle,
      address: newPropAddress,
      rentValue: newPropRent,
      ownerId: owner.id,
      ownerName: owner.name
    });
    setNewPropTitle('');
    setNewPropAddress('');
    setShowPropModal(false);
    setActionNotice(`Imóvel "${newPropTitle}" cadastrado com sucesso!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSendAdminMessage = (e) => {
    e.preventDefault();
    if (!msgBodyInput.trim()) return;
    const recipient = portalUsers.find(u => u.id === msgTargetUser) || portalUsers[0];
    sendPortalMessage({
      senderRole: 'imobiliaria',
      senderName: 'Atendimento Araújo Imóveis',
      recipientRole: recipient?.role || 'cliente',
      recipientId: recipient?.id || 'all',
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
              <button style={styles.btnActionPrimary} onClick={() => setShowPropModal(true)}>
                <Plus size={16} />
                <span>Cadastrar Imóvel</span>
              </button>
              <button style={styles.btnActionSuccess} onClick={() => setShowUserModal(true)}>
                <Plus size={16} />
                <span>Novo Usuário Portal</span>
              </button>
            </div>
          </div>

          <div style={styles.userGrid}>
            {portalUsers.map(u => (
              <div key={u.id} style={styles.userCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={u.avatar} alt={u.name} style={styles.userAvatar} />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{u.name}</strong>
                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8125rem' }}>{u.email}</div>
                    <div style={styles.roleTag(u.role)}>
                      {u.role === 'proprietario' ? 'Proprietário' : u.role === 'inquilino' ? 'Inquilino' : u.role}
                    </div>
                  </div>
                </div>

                <div style={styles.userDivider} />

                <div style={styles.userInfoRow}>
                  <span>Senha de Acesso:</span>
                  <strong style={{ color: '#f59e0b' }}>{u.password}</strong>
                </div>
                <div style={styles.userInfoRow}>
                  <span>Telefone:</span>
                  <span>{u.phone || '(37) 99999-0000'}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button 
                    style={{ ...styles.btnSimulateLogin, flex: 1 }} 
                    onClick={() => quickLoginPortal(u.role)}
                  >
                    <Eye size={16} />
                    <span>Entrar no Portal</span>
                  </button>

                  <button 
                    style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer' }}
                    onClick={() => {
                      deletePortalUser(u.id);
                      setActionNotice(`Acesso de ${u.name} removido.`);
                      setTimeout(() => setActionNotice(''), 3000);
                    }}
                    title="Remover acesso"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Novo Usuário */}
          {showUserModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Cadastrar Usuário do Portal</h3>
                <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Nome Completo</label>
                    <input type="text" className="input-field" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>E-mail de Acesso</label>
                    <input type="email" className="input-field" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Tipo de Conta</label>
                    <select className="input-field" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                      <option value="proprietario">Proprietário</option>
                      <option value="inquilino">Inquilino</option>
                      <option value="Normal">Corretor / Atendente</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Telefone / WhatsApp</label>
                    <input type="text" className="input-field" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="(37) 99999-0000" />
                  </div>
                  <div className="input-group">
                    <label>Senha Inicial</label>
                    <input type="text" className="input-field" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Salvar Usuário</button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
                    <label>Proprietário Responsável</label>
                    <select className="input-field" value={newPropOwnerId} onChange={e => setNewPropOwnerId(e.target.value)}>
                      {portalUsers.filter(u => u.role === 'proprietario').map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
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
                      <span>Orçamento Cadastrado: <strong>R$ {maint.budgetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({maint.budgetSupplier})</span>
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
                      Valor Aluguel: <strong>R$ {rec.grossRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> | Repasse Líquido: <strong style={{ color: 'var(--accent-cyan)' }}>R$ {rec.netRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
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
            <h3>Central de Mensagens do Portal</h3>
            <button style={styles.btnActionPrimary} onClick={() => setShowMessageModal(true)}>
              <Send size={14} />
              <span>Nova Mensagem</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {portalMessages.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--glass-highlight)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                Nenhuma mensagem na central de recados.
              </div>
            ) : (
              portalMessages.map(msg => (
                <div key={msg.id} style={styles.msgAdminCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#ffffff' }}>{msg.senderName} ({msg.senderRole})</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{msg.date}</span>
                  </div>
                  <h4 style={{ color: 'var(--accent-cyan)', margin: '0.25rem 0' }}>{msg.subject}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{msg.body}</p>
                </div>
              ))
            )}
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
                      {portalUsers.map(u => (
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
      {activeSubTab === 'logs' && (
        <div style={styles.tabSection}>
          <div style={styles.sectionTitleRow}>
            <h3>Log de Auditoria e Atividades do Portal</h3>
          </div>

          <div style={styles.logsList}>
            {activityLogs.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--glass-highlight)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                Nenhuma atividade registrada no log até o momento.
              </div>
            ) : (
              activityLogs.map(log => (
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
