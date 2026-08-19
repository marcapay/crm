import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ClientLogo from './ClientLogo';
import {
  Home,
  Building2,
  DollarSign,
  FileText,
  Wrench,
  MessageSquare,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  HelpCircle,
  Download,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Send,
  Eye,
  FileCheck,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Info
} from 'lucide-react';

export default function AreaProprietario() {
  const {
    profile,
    logout,
    properties,
    contracts,
    financialRecords,
    maintenanceRequests,
    portalMessages,
    authorizeMaintenance,
    sendPortalMessage
  } = useApp();

  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio', 'imoveis', 'financeiro', 'comprovantes', 'contratos', 'manutencoes', 'mensagens', 'perfil'
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [selectedCompetence, setSelectedCompetence] = useState('08/2026');
  const [messageInput, setMessageInput] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Filter items for current logged in owner
  const myProperties = properties.filter(p => p.ownerId === profile.id || p.ownerId === 'user_proprietario_1');
  const myContracts = contracts.filter(c => c.ownerId === profile.id || c.ownerId === 'user_proprietario_1');
  const myFinancials = financialRecords.filter(f => f.ownerId === profile.id || f.ownerId === 'user_proprietario_1');
  const myMaintenances = maintenanceRequests.filter(m => m.ownerId === profile.id || m.ownerId === 'user_proprietario_1');
  const myMessages = portalMessages.filter(m => m.recipientRole === 'proprietario' || m.senderRole === 'proprietario');

  // Dashboard Metrics
  const nextPayout = myFinancials.find(f => f.tenantStatus === 'Aguardando pagamento' || f.ownerStatus === 'Pendente') || myFinancials[0];
  const totalRentedCount = myProperties.filter(p => p.status === 'Alugado').length;
  const pendingApprovalsCount = myMaintenances.filter(m => m.status === 'Aguardando proprietário').length;

  const handleDecision = (requestId, decision) => {
    authorizeMaintenance(requestId, decision, 'Decisão tomada pelo portal do proprietário.');
    setActionNotice(`Decisão (${decision === 'AUTORIZADO' ? 'Autorizado com Sucesso' : 'Recusado/Informação Solicitada'}) registrada.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendPortalMessage({
      senderRole: 'proprietario',
      senderName: profile.name || 'Carlos Eduardo Silva',
      recipientRole: 'imobiliaria',
      subject: msgSubject || 'Dúvida do Proprietário',
      body: messageInput
    });
    setMessageInput('');
    setMsgSubject('');
    setShowMsgModal(false);
    setActionNotice('Mensagem enviada com sucesso para a Imobiliária!');
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div style={styles.mobileContainer}>
      {/* Mobile Top Header */}
      <header style={styles.topHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClientLogo height={32} theme="dark" />
          <div style={styles.badgeProp}>Área do Proprietário</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            style={styles.headerIconBtn} 
            onClick={() => setActiveTab('mensagens')}
            title="Notificações & Mensagens"
          >
            <Bell size={18} color="var(--accent-cyan)" />
            {myMessages.some(m => !m.read) && <span style={styles.notifDot} />}
          </button>
          <button style={styles.logoutBtn} onClick={logout} title="Sair do Portal">
            <LogOut size={16} />
            <span style={styles.logoutText}>Sair</span>
          </button>
        </div>
      </header>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div style={styles.actionNoticeBanner}>
          <CheckCircle size={18} color="#34d399" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main View Area */}
      <main style={styles.mainView}>
        {/* ================= ABA 1: INÍCIO / DASHBOARD ================= */}
        {activeTab === 'inicio' && (
          <div style={styles.tabContent}>
            {/* Owner Greeting & Next Payout Card */}
            <div style={styles.heroCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={styles.greetingTitle}>Olá, {profile.name?.split(' ')[0] || 'Proprietário'}! 👋</h2>
                  <p style={styles.greetingSub}>Confira o resumo financeiro dos seus imóveis.</p>
                </div>
                <img 
                  src={profile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"} 
                  alt="Avatar" 
                  style={styles.avatarImg} 
                />
              </div>

              {/* Banner Destacado do Próximo Repasse */}
              <div style={styles.payoutHighlightCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.8125rem', fontWeight: '600' }}>
                  <Calendar size={16} />
                  <span>PRÓXIMO REPASSE PREVISTO</span>
                </div>
                <div style={styles.payoutAmountRow}>
                  <span style={styles.payoutDateLabel}>{nextPayout?.predictedRepasseDate || '15/09/2026'}</span>
                  <span style={styles.payoutValueBig}>
                    R$ {(nextPayout?.netRepasse || 1850).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={styles.payoutSubInfo}>
                  <span>Imóvel: {nextPayout?.propertyName || myProperties[0]?.title}</span>
                  <span style={styles.statusBadgePendente}>{nextPayout?.ownerStatus || 'Pendente'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIconBox}>
                  <Building2 size={20} color="var(--accent-cyan)" />
                </div>
                <div>
                  <div style={styles.statLabel}>Meus Imóveis</div>
                  <div style={styles.statVal}>{myProperties.length} Imóveis ({totalRentedCount} Alugados)</div>
                </div>
              </div>

              <div style={{ ...styles.statCard, cursor: 'pointer' }} onClick={() => setActiveTab('manutencoes')}>
                <div style={{ ...styles.statIconBox, backgroundColor: pendingApprovalsCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)' }}>
                  <Wrench size={20} color={pendingApprovalsCount > 0 ? '#f59e0b' : 'var(--text-tertiary)'} />
                </div>
                <div>
                  <div style={styles.statLabel}>Aprovações Pendentes</div>
                  <div style={{ ...styles.statVal, color: pendingApprovalsCount > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
                    {pendingApprovalsCount} Chamado(s)
                  </div>
                </div>
              </div>
            </div>

            {/* Pendente de Autorização Alert Card */}
            {pendingApprovalsCount > 0 && (
              <div style={styles.urgentAlertBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={22} color="#f59e0b" />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>Ação Necessária do Proprietário</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      Existe 1 manutenção aguardando sua autorização de orçamento.
                    </p>
                  </div>
                </div>
                <button style={styles.btnActionUrgent} onClick={() => setActiveTab('manutencoes')}>
                  <span>Analisar Agora</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Resumo Meus Imóveis */}
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}>Meus Imóveis</h3>
              <span style={styles.seeAllLink} onClick={() => setActiveTab('imoveis')}>Ver todos</span>
            </div>

            <div style={styles.propertiesListHorizontal}>
              {myProperties.map(prop => (
                <div key={prop.id} style={styles.propertyCardMini} onClick={() => setActiveTab('imoveis')}>
                  <img src={prop.photo} alt={prop.title} style={styles.propImgMini} />
                  <div style={styles.propBodyMini}>
                    <div style={styles.statusTag(prop.status)}>{prop.status}</div>
                    <h4 style={styles.propTitleMini}>{prop.title}</h4>
                    <p style={styles.propAddressMini}>{prop.shortAddress}</p>
                    <div style={styles.propRentMini}>Aluguel: R$ {prop.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ABA 2: MEUS IMÓVEIS ================= */}
        {activeTab === 'imoveis' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Meus Imóveis Cadastrados</h2>
              <p style={styles.pageSubtitle}>Acompanhe o status de ocupação e situação de cada imóvel.</p>
            </div>

            {myProperties.map(prop => {
              const activeContract = myContracts.find(c => c.propertyId === prop.id);
              const activeMaint = myMaintenances.filter(m => m.propertyId === prop.id);

              return (
                <div key={prop.id} style={styles.propertyCardFull}>
                  <div style={styles.propImgWrapper}>
                    <img src={prop.photo} alt={prop.title} style={styles.propImgFull} />
                    <div style={styles.statusBadgeOverlay(prop.status)}>{prop.status}</div>
                  </div>

                  <div style={styles.propCardContent}>
                    <h3 style={styles.propTitleFull}>{prop.title}</h3>
                    <p style={styles.propAddressFull}>{prop.address}</p>

                    <div style={styles.propMetricsGrid}>
                      <div style={styles.propMetricItem}>
                        <span style={styles.metricLabel}>Valor do Aluguel</span>
                        <strong style={styles.metricValue}>R$ {prop.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div style={styles.propMetricItem}>
                        <span style={styles.metricLabel}>Taxa de Adm.</span>
                        <strong style={styles.metricValue}>{prop.admFeePercent}% (R$ {(prop.rentValue * prop.admFeePercent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</strong>
                      </div>
                      <div style={styles.propMetricItem}>
                        <span style={styles.metricLabel}>Líquido Estimado</span>
                        <strong style={{ ...styles.metricValue, color: '#34d399' }}>
                          R$ {(prop.rentValue * (1 - prop.admFeePercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div style={styles.propMetricItem}>
                        <span style={styles.metricLabel}>Inquilino Atual</span>
                        <strong style={styles.metricValue}>{prop.currentTenantName || 'Disponível para locação'}</strong>
                      </div>
                    </div>

                    {/* Quick Document & Maintenance Stats */}
                    <div style={styles.propFooterStats}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <FileText size={15} />
                        <span>{activeContract ? 'Contrato Ativo (Até 09/2026)' : 'Sem contrato ativo'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <Wrench size={15} />
                        <span>{activeMaint.length} chamado(s) de manutenção</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= ABA 3: EXTRATO FINANCEIRO & SITUAÇÃO ================= */}
        {activeTab === 'financeiro' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Extrato do Proprietário</h2>
              <p style={styles.pageSubtitle}>Demonstrativo financeiro detalhado por competência.</p>
            </div>

            {/* Summary Cards */}
            <div style={styles.finSummaryRow}>
              <div style={styles.finSummaryBox}>
                <span style={styles.finBoxLabel}>Aluguel Bruto Recebido</span>
                <strong style={styles.finBoxVal}>R$ 2.000,00</strong>
              </div>
              <div style={styles.finSummaryBox}>
                <span style={styles.finBoxLabel}>Repasse Líquido Pago</span>
                <strong style={{ ...styles.finBoxVal, color: '#34d399' }}>R$ 1.650,00</strong>
              </div>
            </div>

            {/* Filter Competence Selector */}
            <div style={styles.competenceFilterRow}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Competência:</label>
              <div style={styles.competencePills}>
                {['09/2026', '08/2026', '07/2026', '06/2026'].map(comp => (
                  <button
                    key={comp}
                    style={styles.compPillBtn(selectedCompetence === comp)}
                    onClick={() => setSelectedCompetence(comp)}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Ledger Item Breakdown */}
            {myFinancials
              .filter(f => selectedCompetence === 'all' || f.competence.includes(selectedCompetence.split('/')[0]) || f.competence.includes('Agosto') && selectedCompetence === '08/2026' || f.competence.includes('Setembro') && selectedCompetence === '09/2026')
              .map(rec => (
                <div key={rec.id} style={styles.extratoCard}>
                  <div style={styles.extratoHeader}>
                    <div>
                      <h4 style={styles.extratoCompetence}>{rec.competence}</h4>
                      <span style={styles.extratoProperty}>{rec.propertyName}</span>
                    </div>
                    <span style={styles.statusRepasseTag(rec.ownerStatus)}>
                      {rec.ownerStatus === 'Pago' ? 'Repasse Efetuado' : 'Aguardando Pagamento'}
                    </span>
                  </div>

                  <div style={styles.extratoLineItems}>
                    <div style={styles.extratoLine}>
                      <span>(+) Aluguel Bruto Recebido</span>
                      <strong>R$ {rec.grossRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>

                    <div style={styles.extratoLine}>
                      <span>(-) Taxa de Administração (10%)</span>
                      <span style={{ color: '#ef4444' }}>- R$ {rec.admFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {rec.maintenanceDeductions > 0 && (
                      <div style={styles.extratoLine}>
                        <span>(-) {rec.maintenanceReason || 'Manutenção Autorizada'}</span>
                        <span style={{ color: '#ef4444' }}>- R$ {rec.maintenanceDeductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div style={styles.extratoDivider} />

                    <div style={styles.extratoTotalLine}>
                      <strong>(=) Valor Líquido do Repasse</strong>
                      <strong style={{ color: '#34d399', fontSize: '1.25rem' }}>
                        R$ {rec.netRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.extratoFooterDetails}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <div>Data Prevista: {rec.predictedRepasseDate}</div>
                      {rec.effectiveRepasseDate && <div>Data Efetiva do Repasse: {rec.effectiveRepasseDate}</div>}
                    </div>
                    <button style={styles.btnDownloadPDF} onClick={() => alert('Download do extrato PDF gerado com sucesso!')}>
                      <Download size={14} />
                      <span>Baixar Demonstrativo PDF</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ================= ABA 4: COMPROVANTES DE REPASSE ================= */}
        {activeTab === 'comprovantes' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Comprovantes de Repasse</h2>
              <p style={styles.pageSubtitle}>Histórico e recibos de transferência dos aluguéis.</p>
            </div>

            {myFinancials
              .filter(f => f.ownerStatus === 'Pago' || f.effectiveRepasseDate)
              .map(rec => (
                <div key={rec.id} style={styles.receiptCard}>
                  <div style={styles.receiptHeaderRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={styles.receiptIconBox}>
                        <FileCheck size={20} color="#34d399" />
                      </div>
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>Repasse {rec.competence}</strong>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{rec.propertyName}</div>
                      </div>
                    </div>
                    <strong style={{ color: '#34d399', fontSize: '1.125rem' }}>
                      R$ {rec.netRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div style={styles.receiptBody}>
                    <div style={styles.receiptInfoRow}>
                      <span style={styles.infoLabel}>Data da Transferência:</span>
                      <span style={styles.infoValue}>{rec.effectiveRepasseDate || rec.predictedRepasseDate}</span>
                    </div>
                    <div style={styles.receiptInfoRow}>
                      <span style={styles.infoLabel}>Conta Destinada:</span>
                      <span style={styles.infoValue}>{rec.payoutAccount}</span>
                    </div>
                  </div>

                  <div style={styles.receiptActions}>
                    <button style={styles.btnSecondarySmall} onClick={() => alert(`Visualizando comprovante de repasse de ${rec.competence}`)}>
                      <Eye size={14} />
                      <span>Visualizar</span>
                    </button>
                    <button style={styles.btnPrimarySmall} onClick={() => alert(`Download do comprovante PDF do repasse de ${rec.competence}`)}>
                      <Download size={14} />
                      <span>Download Comprovante</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ================= ABA 5: MANUTENÇÕES & AUTORIZAÇÕES ================= */}
        {activeTab === 'manutencoes' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Manutenções e Autorizações</h2>
              <p style={styles.pageSubtitle}>Acompanhe e autorize reparos e melhorias no seu imóvel.</p>
            </div>

            {myMaintenances.map(maint => (
              <div key={maint.id} style={styles.maintCard}>
                <div style={styles.maintHeader}>
                  <div>
                    <span style={styles.maintProtocol}>{maint.protocol}</span>
                    <h3 style={styles.maintTitle}>{maint.title}</h3>
                  </div>
                  <span style={styles.maintStatusTag(maint.status)}>{maint.status}</span>
                </div>

                <p style={styles.maintDesc}>{maint.description}</p>

                {maint.attachments && maint.attachments.length > 0 && (
                  <div style={styles.maintMediaContainer}>
                    {maint.attachments.map((att, idx) => (
                      <img key={idx} src={att.url} alt="Foto da manutenção" style={styles.maintThumbImg} />
                    ))}
                  </div>
                )}

                {/* Orçamento Box */}
                {maint.budgetValue && (
                  <div style={styles.budgetCardBox}>
                    <div style={styles.budgetHeaderRow}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Orçamento do Prestador</span>
                      <strong style={{ fontSize: '1.25rem', color: '#f59e0b' }}>
                        R$ {maint.budgetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Fornecedor: <strong>{maint.budgetSupplier}</strong>
                    </div>
                    {maint.budgetDetails && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        {maint.budgetDetails}
                      </p>
                    )}
                  </div>
                )}

                {/* Decision Actions if Pending Owner */}
                {maint.status === 'Aguardando proprietário' ? (
                  <div style={styles.decisionActionsWrapper}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '0.5rem' }}>
                      SUA DECISÃO É NECESSÁRIA:
                    </div>
                    <div style={styles.decisionButtonsRow}>
                      <button style={styles.btnApprove} onClick={() => handleDecision(maint.id, 'AUTORIZADO')}>
                        <CheckCircle size={16} />
                        <span>AUTORIZAR</span>
                      </button>

                      <button style={styles.btnReject} onClick={() => handleDecision(maint.id, 'RECUSADO')}>
                        <XCircle size={16} />
                        <span>RECUSAR</span>
                      </button>

                      <button style={styles.btnMoreInfo} onClick={() => handleDecision(maint.id, 'INFORMACAO_SOLICITADA')}>
                        <HelpCircle size={16} />
                        <span>+ MAIS INFO</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.decisionHistoryBox}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Status da Decisão: <strong>{maint.decision || maint.status}</strong> {maint.decisionDate && `em ${maint.decisionDate}`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= ABA 6: CONTRATOS & DOCUMENTOS ================= */}
        {activeTab === 'contratos' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Contratos e Documentos</h2>
              <p style={styles.pageSubtitle}>Central de arquivos e regras cadastradas.</p>
            </div>

            {myContracts.map(cnt => (
              <div key={cnt.id} style={styles.contractCard}>
                <div style={styles.contractHeader}>
                  <div>
                    <span style={styles.contractCode}>Contrato #{cnt.id}</span>
                    <h3 style={styles.contractProperty}>{cnt.propertyName}</h3>
                  </div>
                  <span style={styles.contractStatusActive}>{cnt.status}</span>
                </div>

                <div style={styles.contractGridInfo}>
                  <div style={styles.contractInfoCell}>
                    <span style={styles.cellLabel}>Inquilino</span>
                    <strong style={styles.cellVal}>{cnt.tenantName}</strong>
                  </div>
                  <div style={styles.contractInfoCell}>
                    <span style={styles.cellLabel}>Vigência</span>
                    <strong style={styles.cellVal}>{cnt.startDate} a {cnt.endDate}</strong>
                  </div>
                  <div style={styles.contractInfoCell}>
                    <span style={styles.cellLabel}>Valor Atual</span>
                    <strong style={styles.cellVal}>R$ {cnt.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={styles.contractInfoCell}>
                    <span style={styles.cellLabel}>Reajuste Cadastrado</span>
                    <strong style={styles.cellVal}>{cnt.adjustmentIndex}</strong>
                  </div>
                </div>

                {/* Downloadable Documents List */}
                <h4 style={styles.docsListTitle}>Documentos Vinculados ao Imóvel</h4>
                <div style={styles.docsList}>
                  {cnt.documents.map(doc => (
                    <div key={doc.id} style={styles.docRowItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <FileText size={18} color="var(--accent-cyan)" />
                        <div>
                          <div style={styles.docItemTitle}>{doc.title}</div>
                          <div style={styles.docItemSub}>{doc.type} • {doc.date} • {doc.size}</div>
                        </div>
                      </div>
                      <button style={styles.docBtnDownload} onClick={() => alert(`Baixando arquivo ${doc.title}`)}>
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= ABA 7: MENSAGENS & COMUNICAÇÃO ================= */}
        {activeTab === 'mensagens' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeaderRow}>
              <div>
                <h2>Central de Mensagens</h2>
                <p style={styles.pageSubtitle}>Comunicação direta e transparente com a Imobiliária.</p>
              </div>
              <button style={styles.btnNewMsg} onClick={() => setShowMsgModal(true)}>
                <Send size={15} />
                <span>Nova Mensagem</span>
              </button>
            </div>

            {myMessages.map(msg => (
              <div key={msg.id} style={styles.messageCard}>
                <div style={styles.msgHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={styles.msgAvatarCircle}>
                      {msg.senderRole === 'proprietario' ? 'P' : 'IM'}
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{msg.senderName}</strong>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{msg.date}</div>
                    </div>
                  </div>
                  <span style={styles.msgTagType}>{msg.senderRole === 'proprietario' ? 'Enviada' : 'Recebida'}</span>
                </div>
                <h4 style={styles.msgSubject}>{msg.subject}</h4>
                <p style={styles.msgBody}>{msg.body}</p>
              </div>
            ))}

            {/* Modal de Nova Mensagem */}
            {showMsgModal && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalCard}>
                  <h3 style={styles.modalTitle}>Enviar Mensagem para a Imobiliária</h3>
                  <form onSubmit={handleSendMessage} style={styles.modalForm}>
                    <div className="input-group">
                      <label>Assunto</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Ex: Dúvida sobre reajuste ou repasse"
                        value={msgSubject}
                        onChange={(e) => setMsgSubject(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Sua Mensagem</label>
                      <textarea 
                        className="input-field" 
                        rows={4}
                        placeholder="Escreva sua solicitação ou dúvida para nossa equipe..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        required
                        style={{ padding: '0.75rem', resize: 'vertical' }}
                      />
                    </div>
                    <div style={styles.modalActions}>
                      <button type="button" style={styles.btnSecondarySmall} onClick={() => setShowMsgModal(false)}>
                        Cancelar
                      </button>
                      <button type="submit" style={styles.btnPrimarySmall}>
                        Enviar Mensagem
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 8: PERFIL DO PROPRIETÁRIO ================= */}
        {activeTab === 'perfil' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Meu Cadastro</h2>
              <p style={styles.pageSubtitle}>Dados pessoais e conta bancária para recebimentos.</p>
            </div>

            <div style={styles.profileCard}>
              <div style={styles.profileHeaderRow}>
                <img src={profile.avatar} alt="Avatar" style={styles.profileAvatarBig} />
                <div>
                  <h3 style={{ color: '#ffffff', fontSize: '1.125rem' }}>{profile.name}</h3>
                  <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8125rem' }}>{profile.email}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    Telefone: {profile.phone || '(37) 99911-2233'}
                  </div>
                </div>
              </div>

              <div style={styles.profileSectionDivider} />

              <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Dados da Conta Bancária para Repasse</h4>
              <div style={styles.bankAccountCard}>
                <div style={styles.bankInfoLine}>
                  <span style={styles.infoLabel}>Titular:</span>
                  <strong>{profile.name}</strong>
                </div>
                <div style={styles.bankInfoLine}>
                  <span style={styles.infoLabel}>Banco:</span>
                  <span>Banco Itaú Unibanco S.A.</span>
                </div>
                <div style={styles.bankInfoLine}>
                  <span style={styles.infoLabel}>Agência / Conta:</span>
                  <span>Ag 1234 - C/C 56789-0</span>
                </div>
                <div style={styles.bankInfoLine}>
                  <span style={styles.infoLabel}>Chave PIX:</span>
                  <span>carlos.silva@email.com</span>
                </div>
              </div>

              <button style={{ ...styles.logoutBtn, width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.75rem' }} onClick={logout}>
                <LogOut size={16} />
                <span>Sair da Minha Conta</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav style={styles.bottomNav}>
        <button 
          style={styles.navItem(activeTab === 'inicio')} 
          onClick={() => setActiveTab('inicio')}
        >
          <Home size={20} />
          <span>Início</span>
        </button>

        <button 
          style={styles.navItem(activeTab === 'imoveis')} 
          onClick={() => setActiveTab('imoveis')}
        >
          <Building2 size={20} />
          <span>Imóveis</span>
        </button>

        <button 
          style={styles.navItem(activeTab === 'financeiro' || activeTab === 'comprovantes')} 
          onClick={() => setActiveTab('financeiro')}
        >
          <DollarSign size={20} />
          <span>Extrato</span>
        </button>

        <button 
          style={styles.navItem(activeTab === 'manutencoes')} 
          onClick={() => setActiveTab('manutencoes')}
        >
          <Wrench size={20} />
          <span>Reparos</span>
          {pendingApprovalsCount > 0 && <span style={styles.navBadge}>{pendingApprovalsCount}</span>}
        </button>

        <button 
          style={styles.navItem(activeTab === 'contratos')} 
          onClick={() => setActiveTab('contratos')}
        >
          <FileText size={20} />
          <span>Docs</span>
        </button>

        <button 
          style={styles.navItem(activeTab === 'mensagens')} 
          onClick={() => setActiveTab('mensagens')}
        >
          <MessageSquare size={20} />
          <span>Recados</span>
        </button>
      </nav>
    </div>
  );
}

// Scoped Mobile-First Styles for Owner Area
const styles = {
  mobileContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingBottom: '80px',
  },
  topHeader: {
    height: '64px',
    padding: '0 1rem',
    backgroundColor: 'rgba(16, 18, 24, 0.95)',
    borderBottom: '1px solid var(--glass-border)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  badgeProp: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'var(--accent-cyan)',
  },
  headerIconBtn: {
    background: 'none',
    border: 'none',
    position: 'relative',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
  },
  notifDot: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '0.375rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutText: {
    display: 'inline-block',
  },
  actionNoticeBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '0.75rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
  },
  mainView: {
    flex: 1,
    padding: '1rem',
    maxWidth: '680px',
    margin: '0 auto',
    width: '100%',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  heroCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--card-shadow)',
  },
  greetingTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  greetingSub: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  avatarImg: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--glass-border)',
  },
  payoutHighlightCard: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  payoutAmountRow: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0.5rem 0',
  },
  payoutDateLabel: {
    fontSize: '0.8125rem',
    color: 'var(--text-tertiary)',
  },
  payoutValueBig: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  payoutSubInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
  },
  statusBadgePendente: {
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  statVal: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: '0.125rem',
  },
  urgentAlertBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  btnActionUrgent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#f59e0b',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  seeAllLink: {
    fontSize: '0.8125rem',
    color: 'var(--accent-cyan)',
    cursor: 'pointer',
    fontWeight: '500',
  },
  propertiesListHorizontal: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  propertyCardMini: {
    display: 'flex',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    overflow: 'hidden',
  },
  propImgMini: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
  },
  propBodyMini: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  statusTag: (status) => ({
    alignSelf: 'flex-start',
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: status === 'Alugado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
    color: status === 'Alugado' ? '#34d399' : '#38bdf8',
    marginBottom: '0.375rem',
  }),
  propTitleMini: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  propAddressMini: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    marginTop: '0.125rem',
  },
  propRentMini: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: '0.375rem',
  },
  pageHeader: {
    marginBottom: '0.5rem',
  },
  pageSubtitle: {
    fontSize: '0.8125rem',
    color: 'var(--text-tertiary)',
    marginTop: '0.25rem',
  },
  propertyCardFull: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    overflow: 'hidden',
  },
  propImgWrapper: {
    position: 'relative',
    height: '180px',
    width: '100%',
  },
  propImgFull: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  statusBadgeOverlay: (status) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    backgroundColor: status === 'Alugado' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(56, 189, 248, 0.9)',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
  }),
  propCardContent: {
    padding: '1.25rem',
  },
  propTitleFull: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  propAddressFull: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  propMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '1rem',
    padding: '0.875rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--border-radius-sm)',
  },
  propMetricItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  metricValue: {
    fontSize: '0.875rem',
    color: '#ffffff',
    marginTop: '0.125rem',
  },
  propFooterStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--glass-border)',
  },
  finSummaryRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  finSummaryBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  finBoxLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  finBoxVal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: '0.25rem',
  },
  competenceFilterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  competencePills: {
    display: 'flex',
    gap: '0.5rem',
  },
  compPillBtn: (active) => ({
    padding: '0.375rem 0.875rem',
    borderRadius: '20px',
    backgroundColor: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
    color: active ? '#000000' : 'var(--text-secondary)',
    border: '1px solid var(--glass-border)',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
  }),
  extratoCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
  },
  extratoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  extratoCompetence: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  extratoProperty: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  statusRepasseTag: (status) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: status === 'Pago' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
    color: status === 'Pago' ? '#34d399' : '#f59e0b',
  }),
  extratoLineItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    margin: '1rem 0',
    fontSize: '0.875rem',
  },
  extratoLine: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-secondary)',
  },
  extratoDivider: {
    height: '1px',
    backgroundColor: 'var(--glass-border)',
    margin: '0.5rem 0',
  },
  extratoTotalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
  },
  extratoFooterDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--glass-border)',
  },
  btnDownloadPDF: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--glass-border)',
    color: '#ffffff',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  receiptCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  receiptHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--border-radius-sm)',
  },
  receiptInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
  },
  infoLabel: {
    color: 'var(--text-tertiary)',
  },
  infoValue: {
    color: '#ffffff',
    fontWeight: '500',
  },
  receiptActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  btnSecondarySmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--glass-border)',
    color: '#ffffff',
    padding: '0.5rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnPrimarySmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    color: '#000000',
    padding: '0.5rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  maintCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  maintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  maintProtocol: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  maintTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: '0.125rem',
  },
  maintStatusTag: (status) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: status === 'Aguardando proprietário' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
    color: status === 'Aguardando proprietário' ? '#f59e0b' : '#34d399',
  }),
  maintDesc: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  maintMediaContainer: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
  },
  maintThumbImg: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  budgetCardBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem',
  },
  budgetHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisionActionsWrapper: {
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--glass-border)',
  },
  decisionButtonsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem',
  },
  btnApprove: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnReject: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnMoreInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0.625rem 0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  decisionHistoryBox: {
    padding: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    textAlign: 'center',
  },
  contractCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contractHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractCode: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
  },
  contractProperty: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  contractStatusActive: {
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  contractGridInfo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    padding: '0.875rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--border-radius-sm)',
  },
  contractInfoCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  cellLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  cellVal: {
    fontSize: '0.875rem',
    color: '#ffffff',
    marginTop: '0.125rem',
  },
  docsListTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: '0.5rem',
  },
  docsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  docRowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
  },
  docItemTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  docItemSub: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  docBtnDownload: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-cyan)',
    cursor: 'pointer',
    padding: '0.375rem',
  },
  pageHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  btnNewMsg: {
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
  messageCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  msgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  msgAvatarCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.75rem',
    color: '#ffffff',
  },
  msgTagType: {
    fontSize: '0.6875rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: 'var(--text-tertiary)',
  },
  msgSubject: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  msgBody: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
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
    padding: '1rem',
  },
  modalCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '440px',
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '1rem',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  profileCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
  },
  profileHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  profileAvatarBig: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--glass-border)',
  },
  profileSectionDivider: {
    height: '1px',
    backgroundColor: 'var(--glass-border)',
    margin: '1.25rem 0',
  },
  bankAccountCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  bankInfoLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: 'rgba(16, 18, 24, 0.96)',
    borderTop: '1px solid var(--glass-border)',
    backdropFilter: 'blur(16px)',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    alignItems: 'center',
    zIndex: 100,
  },
  navItem: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.125rem',
    background: 'none',
    border: 'none',
    color: active ? '#ffffff' : 'var(--text-tertiary)',
    fontSize: '0.6875rem',
    fontWeight: active ? '700' : '400',
    cursor: 'pointer',
    position: 'relative',
    height: '100%',
  }),
  navBadge: {
    position: 'absolute',
    top: '6px',
    right: '18px',
    backgroundColor: '#f59e0b',
    color: '#000000',
    fontSize: '0.625rem',
    fontWeight: '800',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
