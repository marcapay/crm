import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Save, 
  MessageSquare, 
  Key, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  RefreshCw,
  Trash2,
  UserPlus,
  Edit2,
  X,
  QrCode,
  Cpu
} from 'lucide-react';

const EVO_CONFIG = {
  baseUrl: "https://api.marcasolucoes.com",
  apiKey: "b49c63d8c361f2a13a28e56c3c3c19f9",
  tenant: "ff3694a5-c576-4309-8805-3bb7a61d15c7",
  instanceName: "Análise",
  encodedInstanceName: "An%C3%A1lise"
};

export default function Configuracoes() {
  const { 
    theme, 
    setTheme,
    quickLinks,
    waStatus,
    setWaStatus,
    profile,
    updateProfile,
    systemUsers,
    setSystemUsers
  } = useApp();

  // Accordion active state: tracks index of currently open panel (or null)
  const [activePanel, setActivePanel] = useState('whatsapp');

  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [waError, setWaError] = useState('');
  const [waLoading, setWaLoading] = useState(false);

  const checkWhatsAppStatus = async () => {
    try {
      const res = await fetch(`${EVO_CONFIG.baseUrl}/instance/connectionState/${EVO_CONFIG.encodedInstanceName}`, {
        headers: {
          "apikey": EVO_CONFIG.apiKey,
          "tenant": EVO_CONFIG.tenant
        }
      });
      if (res.ok) {
        const data = await res.json();
        const state = data?.instance?.state || data?.state || "close";
        if (state === "open") {
          setWaStatus("ONLINE");
          setQrCodeBase64("");
          setWaError("");
        } else {
          setWaStatus(prev => (prev === "QR_CODE" || prev === "GENERATING_QR") ? prev : "DISCONNECTED");
        }
      } else {
        setWaStatus(prev => (prev === "QR_CODE" || prev === "GENERATING_QR") ? prev : "DISCONNECTED");
      }
    } catch (err) {
      console.error("Erro ao checar status do WhatsApp:", err);
      setWaError("Falha na comunicação com a API.");
    }
  };

  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  // Polling Connection State when QR Code is visible
  useEffect(() => {
    let interval;
    if (waStatus === 'QR_CODE') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${EVO_CONFIG.baseUrl}/instance/connectionState/${EVO_CONFIG.encodedInstanceName}`, {
            headers: {
              "apikey": EVO_CONFIG.apiKey,
              "tenant": EVO_CONFIG.tenant
            }
          });
          if (res.ok) {
            const data = await res.json();
            const state = data?.instance?.state || data?.state || "close";
            if (state === "open") {
              setWaStatus("ONLINE");
              setQrCodeBase64("");
              setWaError("");
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error("Erro no polling de status:", err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [waStatus]);

  const handleConnectWhatsApp = async () => {
    setWaStatus('GENERATING_QR');
    setWaError("");
    setQrCodeBase64("");
    setWaLoading(true);
    try {
      const checkRes = await fetch(`${EVO_CONFIG.baseUrl}/instance/connectionState/${EVO_CONFIG.encodedInstanceName}`, {
        headers: {
          "apikey": EVO_CONFIG.apiKey,
          "tenant": EVO_CONFIG.tenant
        }
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const state = checkData?.instance?.state || checkData?.state || "";
        if (state === "open") {
          setWaStatus("ONLINE");
          setWaLoading(false);
          return;
        }
      }

      let res = await fetch(`${EVO_CONFIG.baseUrl}/instance/connect/${EVO_CONFIG.encodedInstanceName}`, {
        headers: {
          "apikey": EVO_CONFIG.apiKey,
          "tenant": EVO_CONFIG.tenant
        }
      });
      let data = {};
      try { data = await res.json(); } catch {}

      if (res.status === 404) {
        const createRes = await fetch(`${EVO_CONFIG.baseUrl}/instance/create`, {
          method: "POST",
          headers: {
            "apikey": EVO_CONFIG.apiKey,
            "tenant": EVO_CONFIG.tenant,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            instanceName: EVO_CONFIG.instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
          })
        });
        const cd = await createRes.json().catch(() => ({}));
        if (createRes.ok) {
          const b64 = cd?.qrcode?.base64 || cd?.base64 || "";
          if (b64) {
            setQrCodeBase64(b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`);
            setWaStatus("QR_CODE");
            setWaLoading(false);
            return;
          }
          res = await fetch(`${EVO_CONFIG.baseUrl}/instance/connect/${EVO_CONFIG.encodedInstanceName}`, {
            headers: {
              "apikey": EVO_CONFIG.apiKey,
              "tenant": EVO_CONFIG.tenant
            }
          });
          data = {};
          try { data = await res.json(); } catch {}
        } else {
          setWaError(cd?.error || cd?.message || `Erro ao criar instância (${createRes.status})`);
          setWaStatus("DISCONNECTED");
          setWaLoading(false);
          return;
        }
      }

      if (!res.ok) {
        setWaError(data?.error || data?.message || `Erro ${res.status}`);
        setWaStatus("DISCONNECTED");
        setWaLoading(false);
        return;
      }

      const base64 = data?.base64 || data?.qrcode?.base64 || data?.qr || "";
      if (base64) {
        setQrCodeBase64(base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`);
        setWaStatus("QR_CODE");
      } else {
        setWaError("QR Code não retornado pela API. Tente novamente.");
        setWaStatus("DISCONNECTED");
      }
    } catch (err) {
      console.error("Erro ao conectar WhatsApp:", err);
      setWaError("Erro de comunicação com a API.");
      setWaStatus("DISCONNECTED");
    } finally {
      setWaLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (confirm("Deseja realmente desconectar esta instância do WhatsApp?")) {
      setWaLoading(true);
      setWaError("");
      try {
        await fetch(`${EVO_CONFIG.baseUrl}/instance/logout/${EVO_CONFIG.encodedInstanceName}`, {
          method: "DELETE",
          headers: {
            "apikey": EVO_CONFIG.apiKey,
            "tenant": EVO_CONFIG.tenant
          }
        });
        try {
          await fetch(`${EVO_CONFIG.baseUrl}/instance/delete/${EVO_CONFIG.encodedInstanceName}`, {
            method: "DELETE",
            headers: {
              "apikey": EVO_CONFIG.apiKey,
              "tenant": EVO_CONFIG.tenant
            }
          });
        } catch (e) {
          console.error("Erro ao deletar instância:", e);
        }
        setWaStatus("DISCONNECTED");
        setQrCodeBase64("");
      } catch (err) {
        console.error("Erro ao desconectar WhatsApp:", err);
        setWaError("Erro ao desconectar a instância.");
        checkWhatsAppStatus();
      } finally {
        setWaLoading(false);
      }
    }
  };





  // Form states to invite new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Normal');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('Normal');
  const [editUserStatus, setEditUserStatus] = useState('Ativo');
  const [editUserPassword, setEditUserPassword] = useState('');

  // Webhook de Triagem (n8n)
  const [aiWebhookUrl, setAiWebhookUrl] = useState(() => {
    return localStorage.getItem('analise_ai_webhook_url') || '';
  });

  useEffect(() => {
    localStorage.setItem('analise_ai_webhook_url', aiWebhookUrl);
  }, [aiWebhookUrl]);





  // Notificações e Segurança
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const togglePanel = (panelId) => {
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;

    setSystemUsers(prev => [
      ...prev,
      {
        id: `u_${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: 'Ativo',
        password: newUserPassword
      }
    ]);

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('Normal');
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserStatus(user.status || 'Ativo');
    setEditUserPassword(user.password || 'admin');
  };

  const handleEditUserSubmit = (e) => {
    e.preventDefault();
    if (!editUserName.trim() || !editUserEmail.trim()) return;

    setSystemUsers(prev => prev.map(u => u.id === editingUser.id ? {
      ...u,
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      status: editUserStatus,
      password: editUserPassword
    } : u));

    // If the edited user is the currently logged-in user, sync the profile
    if (editingUser.email === profile.email) {
      updateProfile({
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
        password: editUserPassword
      });
    }

    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (confirm("Tem certeza que deseja revogar o acesso deste usuário?")) {
      setSystemUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Configurações do Sistema</h1>
          <p style={styles.subtitle}>Gerencie dados corporativos, integrações e níveis de acesso.</p>
        </div>

        <div style={styles.headerActions}>
          <div className={`badge ${waStatus === 'ONLINE' ? 'badge-success' : 'badge-danger'}`} style={waStatus === 'ONLINE' ? styles.diagBadge : styles.diagBadgeOffline}>
            {waStatus === 'ONLINE' ? (
              <RefreshCw size={12} className="animate-pulse-glow" style={{ marginRight: '4px' }} />
            ) : (
              <RefreshCw size={12} style={{ marginRight: '4px' }} />
            )}
            <span>{waStatus === 'ONLINE' ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}</span>
          </div>

          <button onClick={handleSaveAll} className="btn btn-cyan" style={styles.saveBtn}>
            <Save size={16} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </header>

      {/* Accordion Panels Stack */}
      <div style={styles.accordionStack}>
        
        {/* PANEL 1: WhatsApp Integration */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('whatsapp')}>
            <div style={styles.panelHeaderLeft}>
              <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Integração Oficial com WhatsApp</span>
              {waStatus === 'ONLINE' && (
                <span className="badge badge-success" style={styles.inlineBadge}>ONLINE</span>
              )}
            </div>
            {activePanel === 'whatsapp' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'whatsapp' && (
            <div style={styles.panelContent}>
              <p style={styles.waDescription}>
                Gerencie a conexão de entrada de mensagens do WhatsApp e sincronize com a Evolution API.
              </p>
              
              <div className="config-wa-grid" style={styles.waContainerGrid}>
                {/* Left Side: Connection Status Details & Actions */}
                <div style={styles.waLeftCol}>
                  <div style={styles.waDetailsCard}>
                    <div style={styles.waDetailRow}>
                      <span style={styles.waDetailLabel}>INSTÂNCIA</span>
                      <span style={styles.waDetailValue}>{EVO_CONFIG.instanceName}</span>
                    </div>
                    
                    <div style={styles.waDetailRow}>
                      <span style={styles.waDetailLabel}>PERFIL PAREADO</span>
                      <span style={{ 
                        ...styles.waDetailValue, 
                        color: waStatus === 'ONLINE' ? 'var(--accent-success)' : 'var(--text-tertiary)' 
                      }}>
                        {waStatus === 'ONLINE' ? 'Análise Gestão' : 'Nenhum'}
                      </span>
                    </div>
                    
                    <div style={{ ...styles.waDetailRow, borderBottom: 'none', paddingBottom: 0 }}>
                      <span style={styles.waDetailLabel}>STATUS DA INSTÂNCIA</span>
                      <span style={{ 
                        ...styles.waDetailValue, 
                        color: waStatus === 'ONLINE' ? 'var(--accent-success)' : waStatus === 'QR_CODE' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: waStatus === 'ONLINE' ? 'var(--accent-success)' : waStatus === 'QR_CODE' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                          display: 'inline-block'
                        }} />
                        <span>{waStatus === 'ONLINE' ? 'Online' : waStatus === 'QR_CODE' ? 'Aguardando Leitura' : waStatus === 'GENERATING_QR' ? 'Gerando QR...' : 'Desconectado'}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div style={styles.waActionButtonsRow}>
                    {waStatus !== 'ONLINE' ? (
                      <button 
                        type="button" 
                        onClick={handleConnectWhatsApp}
                        className="btn btn-primary"
                        style={{ ...styles.waConnectBtn, opacity: (waStatus === 'GENERATING_QR' || waLoading) ? 0.6 : 1 }}
                        disabled={waStatus === 'GENERATING_QR' || waLoading}
                      >
                        <QrCode size={16} />
                        <span>CONECTAR / GERAR QR</span>
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleDisconnectWhatsApp}
                        className="btn btn-danger"
                        style={styles.waDisconnectBtn}
                        disabled={waLoading}
                      >
                        <Trash2 size={16} />
                        <span>DESCONECTAR WHATSAPP</span>
                      </button>
                    )}
                    
                    <button 
                      type="button" 
                      onClick={checkWhatsAppStatus}
                      className="btn btn-secondary"
                      style={styles.waRefreshBtn}
                      title="Sincronizar Conexão"
                      disabled={waLoading}
                    >
                      <RefreshCw size={14} className={(waStatus === 'GENERATING_QR' || waLoading) ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {waError && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      fontSize: '0.75rem',
                      lineHeight: '1.4'
                    }}>
                      <span>{waError}</span>
                    </div>
                  )}
                </div>
                
                {/* Right Side: QR Code Container */}
                <div style={styles.waRightCol}>
                  <div style={styles.qrBoxCard}>
                    {waStatus === 'ONLINE' ? (
                      <div style={styles.waConnectedState}>
                        <div style={styles.successPulseCircle}>
                          <CheckCircle size={32} style={{ color: 'var(--accent-success)' }} />
                        </div>
                        <span style={styles.waConnectedText}>WhatsApp Conectado!</span>
                      </div>
                    ) : waStatus === 'GENERATING_QR' ? (
                      <div style={styles.waLoadingState}>
                        <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                        <span style={styles.waScanningText}>Gerando QR Code...</span>
                        <span style={styles.waScanningSubtext}>Evolution API está iniciando a sessão</span>
                      </div>
                    ) : waStatus === 'QR_CODE' ? (
                      <div style={styles.waQrState}>
                        <div style={styles.qrCodeWrapper}>
                          <img 
                            src={qrCodeBase64} 
                            alt="WhatsApp QR Code"
                            style={styles.qrImage}
                          />
                        </div>
                        <span style={styles.waScanningText}>Escaneie para conectar</span>
                        <span style={styles.waScanningSubtext}>A conexão será estabelecida automaticamente</span>
                      </div>
                    ) : (
                      <div style={styles.waDisconnectedState}>
                        <QrCode size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.3 }} />
                        <span style={styles.waScanningText}>Aguardando geração do QR Code</span>
                        <span style={styles.waScanningSubtext}>Clique no botão para gerar um novo código de barras</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* PANEL 4: Usuários */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('access')}>
            <div style={styles.panelHeaderLeft}>
              <Key size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Usuários</span>
            </div>
            {activePanel === 'access' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'access' && (
            <div style={styles.panelContent}>
              {/* Users management table */}
              <h4 style={styles.sectionHeader}>Gerenciar Equipe / Operadores</h4>
              <div className="table-responsive" style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Nome</th>
                      <th style={styles.th}>E-mail</th>
                      <th style={styles.th}>Função</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemUsers.map(u => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}><strong>{u.name}</strong></td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span className="badge badge-primary">{u.role}</span>
                        </td>
                        <td style={styles.td}>
                          <span className={u.status === 'Ativo' ? 'badge badge-success' : 'badge badge-secondary'}>
                            {u.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              type="button"
                              onClick={() => startEditUser(u)}
                              style={styles.actionUserBtn}
                              title="Editar Usuário"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              style={styles.deleteUserBtn}
                              title="Revogar Acesso"
                              disabled={u.email === profile.email}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invite user sub-form */}
              <div style={styles.inviteUserSection}>
                <h4 style={styles.sectionHeader}>Adicionar Novo Membro</h4>
                <form onSubmit={handleAddUser} className="config-invite-form" style={styles.inviteForm} autoComplete="off">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Nome do operador"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                    autoComplete="off"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="e-mail de acesso"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    required
                    autoComplete="new-password"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                  <select 
                    className="input-field" 
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Normal">Normal</option>
                  </select>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Senha de acesso"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ gap: '0.375rem' }}>
                    <UserPlus size={14} />
                    <span>Convidar</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>





        {/* PANEL: Webhook de Triagem */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('triage_webhook')}>
            <div style={styles.panelHeaderLeft}>
              <Cpu size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Webhook de Triagem (n8n)</span>
              {aiWebhookUrl && (
                <span className="badge badge-success" style={styles.inlineBadge}>CONFIGURADO</span>
              )}
            </div>
            {activePanel === 'triage_webhook' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'triage_webhook' && (
            <div style={styles.panelContent}>
              <div style={styles.togglesContainer}>
                <div className="input-group" style={{ marginTop: '0.5rem' }}>
                  <label style={styles.inputLabel}>URL do Webhook do n8n</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="https://seu-fluxo-n8n.com/webhook/..."
                      value={aiWebhookUrl}
                      onChange={e => setAiWebhookUrl(e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-tertiary)', marginTop: '0.375rem' }}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Insira a URL do webhook do n8n que recebe o evento de conclusão da triagem para disparar a mensagem final ao cliente.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL 6: Notificações e Segurança */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('notifications')}>
            <div style={styles.panelHeaderLeft}>
              <Bell size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Notificações e Segurança</span>
            </div>
            {activePanel === 'notifications' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'notifications' && (
            <div style={styles.panelContent}>
              <div style={styles.togglesContainer}>
                <div style={styles.toggleRow}>
                  <div>
                    <div style={styles.toggleTitle}>Alertas Sonoros</div>
                    <div style={styles.toggleDesc}>Tocar notificações de som no navegador para novos leads ou chats.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={soundAlerts} 
                    onChange={e => setSoundAlerts(e.target.checked)} 
                    style={styles.checkboxInput}
                  />
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <div style={styles.toggleTitle}>Relatório Diário Automatizado</div>
                    <div style={styles.toggleDesc}>Enviar um resumo diário de tarefas concluídas e pendentes por e-mail.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={dailyReport} 
                    onChange={e => setDailyReport(e.target.checked)} 
                    style={styles.checkboxInput}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.editModal}>
            <button className="modal-close" onClick={() => setEditingUser(null)}>
              <X size={20} />
            </button>
            <h3 style={styles.modalTitle}>Editar Usuário</h3>
            
            <form onSubmit={handleEditUserSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label style={styles.inputLabel}>Nome Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editUserName} 
                  onChange={e => setEditUserName(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>E-mail de Acesso</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={editUserEmail} 
                  onChange={e => setEditUserEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Função / Cargo</label>
                <select 
                  className="input-field" 
                  value={editUserRole}
                  onChange={e => setEditUserRole(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Status</label>
                <select 
                  className="input-field" 
                  value={editUserStatus}
                  onChange={e => setEditUserStatus(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Senha de Acesso</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={editUserPassword} 
                  onChange={e => setEditUserPassword(e.target.value)} 
                  placeholder="Defina a senha"
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-cyan" style={styles.saveBtn}>
                  <Save size={14} />
                  <span>Salvar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSaved && (
        <div style={styles.saveAlertOverlay}>
          <div className="glass-panel" style={styles.saveAlertBox}>
            <CheckCircle size={20} style={{ color: 'var(--accent-success)' }} />
            <span>Configurações salvas com sucesso!</span>
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
    gap: '1rem',
    flexWrap: 'wrap',
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  diagBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
  },
  diagBadgeOffline: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    display: 'flex',
    alignItems: 'center',
  },
  saveBtn: {
    borderRadius: '20px',
    padding: '0.5rem 1.25rem',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(242, 155, 17, 0.3)',
  },
  accordionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    width: '100%',
    maxWidth: '900px',
  },
  panelRow: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    transition: 'var(--transition-smooth)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: 'var(--glass-highlight)',
  },
  panelHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  panelTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
  },
  inlineBadge: {
    fontSize: '0.625rem',
    padding: '0.125rem 0.5rem',
    marginLeft: '0.5rem',
  },
  panelContent: {
    padding: '1.5rem',
    borderTop: '1px solid var(--glass-border)',
    backgroundColor: 'var(--bg-primary)',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    width: '100%',
  },
  contentActions: {
    gridColumn: '1 / -1',
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  sectionHeader: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-heading)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid var(--glass-border)',
  },
  th: {
    padding: '0.5rem 0.75rem',
    color: 'var(--text-tertiary)',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  td: {
    padding: '0.75rem',
    color: 'var(--text-primary)',
  },
  deleteUserBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    ':hover': {
      color: 'var(--accent-danger)'
    },
    ':disabled': {
      opacity: '0.3',
      cursor: 'not-allowed'
    }
  },
  actionUserBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  editModal: {
    width: '90%',
    maxWidth: '500px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '2rem',
    position: 'relative',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  inputLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
  },
  inviteUserSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--glass-border)',
  },
  inviteForm: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
  },
  togglesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
  },
  toggleTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  toggleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  saveAlertOverlay: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 1000,
  },
  saveAlertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  waDescription: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  waContainerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    width: '100%',
  },
  waLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  waDetailsCard: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  waDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  waDetailLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.05em',
  },
  waDetailValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  waActionButtonsRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  waConnectBtn: {
    flex: 1,
    background: 'var(--accent-success)',
    color: '#ffffff',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  waDisconnectBtn: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    fontWeight: '600',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  waRefreshBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  waRightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBoxCard: {
    width: '100%',
    maxWidth: '350px',
    minHeight: '230px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  waConnectedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  successPulseCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waConnectedText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  waLoadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  waQrState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  qrCodeWrapper: {
    padding: '0.75rem',
    background: '#ffffff',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
  qrImage: {
    width: '220px',
    height: '220px',
    display: 'block',
    imageRendering: 'pixelated',
  },
  waScanningText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  waScanningSubtext: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    maxWidth: '220px',
    lineHeight: '1.3',
  },
  waDisconnectedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }
};
