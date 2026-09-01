import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ClientLogo from './ClientLogo';
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  MessageSquare,
  User,
  LogOut,
  CheckCircle,
  Copy,
  Download,
  Calendar,
  Clock,
  Send,
  PlusCircle,
  Camera,
  MessageCircle,
  Star,
  AlertCircle,
  Info,
  ChevronRight,
  ShieldCheck,
  Building,
  HelpCircle
} from 'lucide-react';

export default function AreaInquilino() {
  const {
    profile,
    logout,
    properties,
    contracts,
    financialRecords,
    maintenanceRequests,
    portalMessages,
    createMaintenanceRequest,
    sendPortalMessage
  } = useApp();

  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio', 'aluguel', 'manutencoes', 'contrato', 'vistorias', 'mensagens', 'perfil'
  const [copiedField, setCopiedField] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Form para nova solicitação de manutenção
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintCategory, setMaintCategory] = useState('Hidráulica');
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');

  // Form para mensagem / desocupação
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Form para pesquisa de satisfação
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Intentions (Renovação / Desocupação)
  const [showVacancyModal, setShowVacancyModal] = useState(false);

  // Filter items for current logged in tenant
  const myContract = contracts.find(c => c.tenantId === profile.id || c.tenantId === 'user_inquilino_1') || contracts[0];
  const myProperty = properties.find(p => p.id === myContract?.propertyId) || properties[0];
  const myFinancials = financialRecords.filter(f => f.tenantId === profile.id || f.tenantId === 'user_inquilino_1');
  const myMaintenances = maintenanceRequests.filter(m => m.tenantId === profile.id || m.tenantId === 'user_inquilino_1');
  const myMessages = portalMessages.filter(m => m.recipientRole === 'inquilino' || m.senderRole === 'inquilino');

  // Active Next Bill
  const nextBill = myFinancials.find(f => f.tenantStatus === 'Aguardando pagamento' || f.tenantStatus === 'Atrasado') || myFinancials[0];

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setActionNotice(`${label} copiado para a área de transferência!`);
    setTimeout(() => {
      setCopiedField('');
      setActionNotice('');
    }, 3000);
  };

  const handleCreateMaintenance = (e) => {
    e.preventDefault();
    if (!maintTitle.trim() || !maintDesc.trim()) return;

    const newReq = createMaintenanceRequest({
      propertyId: myProperty.id,
      propertyName: myProperty.title,
      category: maintCategory,
      title: maintTitle,
      description: maintDesc,
      attachments: [
        { name: 'foto_evidencia.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop' }
      ]
    });

    setMaintTitle('');
    setMaintDesc('');
    setShowMaintModal(false);
    setActionNotice(`Solicitação de manutenção ${newReq.protocol} criada com sucesso!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgBody.trim()) return;
    sendPortalMessage({
      senderRole: 'inquilino',
      senderName: profile.name || 'Mariana Oliveira Costa',
      recipientRole: 'imobiliaria',
      subject: msgSubject || 'Dúvida do Inquilino',
      body: msgBody
    });
    setMsgBody('');
    setMsgSubject('');
    setShowMsgModal(false);
    setActionNotice('Sua mensagem foi enviada para a Imobiliária!');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleRenewalIntent = (intentType) => {
    const subject = intentType === 'RENOVAR' ? 'Interesse em Renovação de Contrato' : 'Solicitação de Orientação para Desocupação';
    const body = intentType === 'RENOVAR' 
      ? 'Olá, gostaria de manifestar meu interesse em renovar o contrato de locação do meu imóvel.'
      : 'Olá, pretendo desocupar o imóvel ao término do contrato e gostaria de receber as orientações e vistoria de saída.';

    sendPortalMessage({
      senderRole: 'inquilino',
      senderName: profile.name || 'Mariana Costa',
      recipientRole: 'imobiliaria',
      subject: subject,
      body: body
    });

    setShowVacancyModal(false);
    setActionNotice(`Manifestação enviada! A equipe entrará em contato em breve.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    setRatingSubmitted(true);
    setActionNotice('Obrigado pela sua avaliação! Sua opinião ajuda a melhorar nossos serviços.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Status timeline steps for maintenance tracking
  const getTimelineStepIndex = (status) => {
    switch (status) {
      case 'Solicitado': return 1;
      case 'Em análise': return 2;
      case 'Aguardando proprietário': return 3;
      case 'Orçamento solicitado': return 3;
      case 'Autorizado': return 4;
      case 'Prestador agendado': return 5;
      case 'Em execução': return 6;
      case 'Concluído': return 7;
      default: return 1;
    }
  };

  return (
    <div style={styles.mobileContainer}>
      {/* Mobile Top Header */}
      <header style={styles.topHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClientLogo height={32} theme="dark" />
          <div style={styles.badgeTenant}>Área do Inquilino</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

      {/* Main Content Area */}
      <main style={styles.mainView}>
        {/* ================= ABA 1: INÍCIO / DASHBOARD ================= */}
        {activeTab === 'inicio' && (
          <div style={styles.tabContent}>
            {/* Tenant Greeting */}
            <div style={styles.heroCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={styles.greetingTitle}>Olá, {profile.name?.split(' ')[0] || 'Inquilino'}! 👋</h2>
                  <p style={styles.greetingSub}>{myProperty ? myProperty.title : 'Nenhum imóvel vinculado no momento'}</p>
                </div>
                <img 
                  src={profile.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"} 
                  alt="Avatar" 
                  style={styles.avatarImg} 
                />
              </div>

              {/* CARD PRÓXIMO ALUGUEL EM DESTAQUE */}
              {nextBill ? (
                <div style={styles.billHighlightCard}>
                  <div style={styles.billHeaderRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8125rem', fontWeight: '700' }}>
                      <CreditCard size={16} />
                      <span>PRÓXIMO ALUGUEL</span>
                    </div>
                    <span style={styles.statusBillTag(nextBill.tenantStatus)}>
                      {nextBill.tenantStatus || 'Aguardando Pagamento'}
                    </span>
                  </div>

                  <div style={styles.billValueRow}>
                    <div>
                      <div style={styles.billDueDateLabel}>Vencimento: <strong>{nextBill.dueDate || '10/09/2026'}</strong></div>
                      <div style={styles.billAmountBig}>R$ {(nextBill.grossRent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  {/* Direct Action Buttons for Payment */}
                  <div style={styles.billActionGrid}>
                    <button 
                      style={styles.btnBillActionPrimary}
                      onClick={() => alert(`Abrindo boleto do aluguel referente a ${nextBill.competence}`)}
                    >
                      <Download size={15} />
                      <span>VER BOLETO</span>
                    </button>

                    <button 
                      style={styles.btnBillActionSecondary}
                      onClick={() => handleCopyText(nextBill.pixKey || '00020126580014BR.GOV.BCB.PIX...', 'Chave PIX')}
                    >
                      <Copy size={15} />
                      <span>COPIAR PIX</span>
                    </button>
                  </div>

                  {nextBill.boletoBarCode && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button 
                        style={styles.btnBillActionOutline}
                        onClick={() => handleCopyText(nextBill.boletoBarCode, 'Código de Barras')}
                      >
                        <span>COPIAR CÓDIGO DE BARRAS</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--glass-highlight)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  Nenhum aluguel ou fatura pendente.
                </div>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div style={styles.quickNavGrid}>
              <div style={styles.quickNavBox} onClick={() => setShowMaintModal(true)}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: 'rgba(56, 189, 248, 0.15)' }}>
                  <Wrench size={22} color="#38bdf8" />
                </div>
                <strong style={styles.quickNavTitle}>Pedir Reparo</strong>
                <span style={styles.quickNavSub}>Solicitar manutenção</span>
              </div>

              <div style={styles.quickNavBox} onClick={() => setActiveTab('aluguel')}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                  <FileText size={22} color="#34d399" />
                </div>
                <strong style={styles.quickNavTitle}>2ª Via Aluguel</strong>
                <span style={styles.quickNavSub}>Boletos e recibos</span>
              </div>
            </div>

            {/* Alerta de Vencimento de Contrato ou Aviso */}
            <div style={styles.contractNoticeCard}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Info size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '600' }}>Vencimento do Contrato em 60 Dias</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Seu contrato encerra em 10/09/2026. Informe sua intenção de renovação ou desocupação.
                  </p>
                  <button style={styles.btnNoticeAction} onClick={() => setShowVacancyModal(true)}>
                    <span>Responder Intenção</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Minhas Manutenções em Andamento */}
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}>Acompanhamento de Manutenções</h3>
              <span style={styles.seeAllLink} onClick={() => setActiveTab('manutencoes')}>Ver todas</span>
            </div>

            {myMaintenances.map(maint => (
              <div key={maint.id} style={styles.maintCardMini} onClick={() => setActiveTab('manutencoes')}>
                <div style={styles.maintMiniHeader}>
                  <span style={styles.protocolTag}>{maint.protocol}</span>
                  <span style={styles.statusTagMini(maint.status)}>{maint.status}</span>
                </div>
                <h4 style={styles.maintMiniTitle}>{maint.title}</h4>
                <p style={styles.maintMiniDate}>Solicitado em: {maint.requestDate}</p>
                {maint.scheduledDate && (
                  <div style={styles.scheduledNoticeRow}>
                    <Clock size={14} color="#f59e0b" />
                    <span>Prestador agendado para: <strong>{maint.scheduledDate} ({maint.scheduledTime})</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= ABA 2: ALUGUEL / BOLETOS & SEGUNDA VIA ================= */}
        {activeTab === 'aluguel' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Aluguel e 2ª Via</h2>
              <p style={styles.pageSubtitle}>Acesse boletos, chave PIX e histórico de recibos.</p>
            </div>

            {/* Highlighted Bill */}
            <div style={styles.billCardFull}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Mês Vigente: <strong>{nextBill?.competence}</strong></span>
                <span style={styles.statusBillTag(nextBill?.tenantStatus)}>{nextBill?.tenantStatus}</span>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Valor Total do Aluguel</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff' }}>
                  R$ {(nextBill?.grossRent || 2000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Vencimento sem juros: <strong>{nextBill?.dueDate}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <button style={styles.btnPrimaryFull} onClick={() => alert('Download da Segunda Via do Boleto gerado com sucesso!')}>
                  <Download size={16} />
                  <span>SEGUNDA VIA DO ALUGUEL (PDF)</span>
                </button>

                <button style={styles.btnSecondaryFull} onClick={() => handleCopyText(nextBill?.pixKey || '', 'Chave PIX Copia-e-Cola')}>
                  <Copy size={16} />
                  <span>COPIAR PIX COPIA E COLA</span>
                </button>

                <button style={styles.btnOutlineFull} onClick={() => handleCopyText(nextBill?.boletoBarCode || '', 'Código de Barras')}>
                  <Copy size={16} />
                  <span>COPIAR CÓDIGO DE BARRAS</span>
                </button>
              </div>
            </div>

            {/* Payment History */}
            <h3 style={styles.sectionTitle}>Histórico de Pagamentos e Recibos</h3>
            <div style={styles.historyList}>
              {myFinancials.map(fin => (
                <div key={fin.id} style={styles.historyItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={styles.historyIconBox(fin.tenantStatus === 'Pago')}>
                      <CheckCircle size={18} color={fin.tenantStatus === 'Pago' ? '#34d399' : '#f59e0b'} />
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{fin.competence}</strong>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                        {fin.tenantStatus === 'Pago' ? `Pago em ${fin.tenantPaymentDate}` : `Vencimento: ${fin.dueDate}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>
                      R$ {fin.grossRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    {fin.tenantStatus === 'Pago' && (
                      <button style={styles.btnReceiptLink} onClick={() => alert(`Baixando recibo da competência ${fin.competence}`)}>
                        <Download size={12} />
                        <span>Recibo</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ABA 3: SOLICITAR & ACOMPANHAR MANUTENÇÃO ================= */}
        {activeTab === 'manutencoes' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeaderRow}>
              <div>
                <h2>Solicitações de Manutenção</h2>
                <p style={styles.pageSubtitle}>Abra e acompanhe reparos pelo seu celular.</p>
              </div>
              <button style={styles.btnNewMaint} onClick={() => setShowMaintModal(true)}>
                <PlusCircle size={16} />
                <span>Solicitar</span>
              </button>
            </div>

            {myMaintenances.map(maint => {
              const stepIdx = getTimelineStepIndex(maint.status);

              return (
                <div key={maint.id} style={styles.maintFullCard}>
                  <div style={styles.maintFullHeader}>
                    <div>
                      <span style={styles.protocolTagBig}>{maint.protocol}</span>
                      <h3 style={styles.maintTitleBig}>{maint.title}</h3>
                      <span style={styles.categoryBadge}>{maint.category}</span>
                    </div>
                    <span style={styles.statusTagMini(maint.status)}>{maint.status}</span>
                  </div>

                  <p style={styles.maintDescText}>{maint.description}</p>

                  {/* Scheduled Appointment Banner */}
                  {maint.scheduledDate && (
                    <div style={styles.scheduledBox}>
                      <Clock size={18} color="#f59e0b" />
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.8125rem' }}>Visita do Prestador Agendada!</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          Data: <strong>{maint.scheduledDate}</strong> • Horário: <strong>{maint.scheduledTime}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline Tracker */}
                  <div style={styles.timelineTracker}>
                    <div style={styles.timelineLabelRow}>
                      <span style={styles.timelineStepLabel(stepIdx >= 1)}>Solicitado</span>
                      <span style={styles.timelineStepLabel(stepIdx >= 3)}>Análise</span>
                      <span style={styles.timelineStepLabel(stepIdx >= 5)}>Agendado</span>
                      <span style={styles.timelineStepLabel(stepIdx >= 7)}>Concluído</span>
                    </div>
                    <div style={styles.timelineTrackBar}>
                      <div style={styles.timelineProgressFill(stepIdx)} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Modal de Nova Solicitação de Manutenção */}
            {showMaintModal && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalCard}>
                  <h3 style={styles.modalTitle}>Solicitar Manutenção</h3>
                  <form onSubmit={handleCreateMaintenance} style={styles.modalForm}>
                    <div className="input-group">
                      <label>Categoria do Problema</label>
                      <select 
                        className="input-field"
                        value={maintCategory}
                        onChange={(e) => setMaintCategory(e.target.value)}
                        style={{ padding: '0.75rem' }}
                      >
                        <option value="Hidráulica">Hidráulica</option>
                        <option value="Elétrica">Elétrica</option>
                        <option value="Infiltração">Infiltração</option>
                        <option value="Pintura">Pintura</option>
                        <option value="Fechadura">Fechadura</option>
                        <option value="Portão">Portão</option>
                        <option value="Eletrodoméstico">Eletrodoméstico</option>
                        <option value="Estrutura">Estrutura</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Título do Problema</label>
                      <input 
                        type="text" 
                        className="input-field"
                        placeholder="Ex: Vazamento no chuveiro do banheiro"
                        value={maintTitle}
                        onChange={(e) => setMaintTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label>Descreva o Problema Detalhadamente</label>
                      <textarea 
                        className="input-field"
                        rows={4}
                        placeholder="Explique o que aconteceu, onde fica e como podemos ajudar..."
                        value={maintDesc}
                        onChange={(e) => setMaintDesc(e.target.value)}
                        required
                        style={{ padding: '0.75rem', resize: 'vertical' }}
                      />
                    </div>

                    <div style={styles.attachmentSimBox}>
                      <Camera size={20} color="var(--accent-cyan)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Foto/Vídeo de Evidência Anexado (Simulado)
                      </span>
                    </div>

                    <div style={styles.modalActions}>
                      <button type="button" style={styles.btnSecondarySmall} onClick={() => setShowMaintModal(false)}>
                        Cancelar
                      </button>
                      <button type="submit" style={styles.btnPrimarySmall}>
                        Enviar Chamado
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 4: MEU CONTRATO & VISTORIAS ================= */}
        {activeTab === 'contrato' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Meu Contrato e Vistorias</h2>
              <p style={styles.pageSubtitle}>Termos de locação e laudo de vistoria inicial do imóvel.</p>
            </div>

            <div style={styles.contractDetailCard}>
              <div style={styles.contractHeaderRow}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Contrato #{myContract?.id}</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>{myProperty?.title}</h3>
                </div>
                <span style={styles.contractStatusActive}>{myContract?.status}</span>
              </div>

              <div style={styles.contractGridInfo}>
                <div style={styles.contractCell}>
                  <span style={styles.cellLabel}>Início do Contrato</span>
                  <strong>{myContract?.startDate}</strong>
                </div>
                <div style={styles.contractCell}>
                  <span style={styles.cellLabel}>Término Previsto</span>
                  <strong>{myContract?.endDate}</strong>
                </div>
                <div style={styles.contractCell}>
                  <span style={styles.cellLabel}>Valor do Aluguel</span>
                  <strong>R$ {myContract?.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={styles.contractCell}>
                  <span style={styles.cellLabel}>Índice de Reajuste</span>
                  <strong>{myContract?.adjustmentIndex}</strong>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#ffffff', marginTop: '0.5rem' }}>Documentos e Vistorias</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={styles.docRowItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <FileText size={18} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: '600' }}>Cópia do Contrato de Locação.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Documento assinado digitalmente</div>
                    </div>
                  </div>
                  <button style={styles.btnReceiptLink} onClick={() => alert('Download do contrato PDF.')}>
                    <Download size={14} />
                  </button>
                </div>

                <div style={styles.docRowItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <ShieldCheck size={18} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: '600' }}>Vistoria de Entrada com Fotos.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Laudo completo de entrega das chaves</div>
                    </div>
                  </div>
                  <button style={styles.btnReceiptLink} onClick={() => alert('Download do laudo de vistoria.')}>
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 5: MENSAGENS ================= */}
        {activeTab === 'mensagens' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeaderRow}>
              <div>
                <h2>Central de Mensagens</h2>
                <p style={styles.pageSubtitle}>Mensagens intermediadas com a Imobiliária.</p>
              </div>
              <button style={styles.btnNewMaint} onClick={() => setShowMsgModal(true)}>
                <Send size={15} />
                <span>Nova Mensagem</span>
              </button>
            </div>

            {myMessages.map(msg => (
              <div key={msg.id} style={styles.messageCard}>
                <div style={styles.msgHeader}>
                  <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{msg.senderName}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{msg.date}</span>
                </div>
                <h4 style={{ fontSize: '0.9375rem', color: '#ffffff', margin: '0.25rem 0' }}>{msg.subject}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{msg.body}</p>
              </div>
            ))}

            {/* Modal de Nova Mensagem */}
            {showMsgModal && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalCard}>
                  <h3 style={styles.modalTitle}>Enviar Mensagem para Imobiliária</h3>
                  <form onSubmit={handleSendMessage} style={styles.modalForm}>
                    <div className="input-group">
                      <label>Assunto</label>
                      <input 
                        type="text"
                        className="input-field"
                        placeholder="Ex: Dúvida sobre o boleto ou comprovante"
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
                        placeholder="Escreva sua dúvida..."
                        value={msgBody}
                        onChange={(e) => setMsgBody(e.target.value)}
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

        {/* ================= ABA 6: PERFIL & PESQUISA DE SATISFAÇÃO ================= */}
        {activeTab === 'perfil' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <h2>Meu Cadastro</h2>
              <p style={styles.pageSubtitle}>Informações pessoais do locatário.</p>
            </div>

            <div style={styles.profileCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img src={profile.avatar} alt="Avatar" style={styles.profileAvatarBig} />
                <div>
                  <h3 style={{ color: '#ffffff', fontSize: '1.125rem' }}>{profile.name}</h3>
                  <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8125rem' }}>{profile.email}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{profile.phone || '(37) 99888-4455'}</div>
                </div>
              </div>

              {/* Pesquisa de Satisfação */}
              <div style={styles.ratingBox}>
                <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: '600' }}>Pesquisa de Satisfação</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  Como foi seu atendimento e suporte da Araújo Imóveis?
                </p>

                {!ratingSubmitted ? (
                  <form onSubmit={handleRatingSubmit} style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star size={24} color={star <= rating ? '#f59e0b' : 'var(--text-tertiary)'} fill={star <= rating ? '#f59e0b' : 'none'} />
                        </button>
                      ))}
                    </div>

                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Deixe um comentário opcional..."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}
                    />

                    <button type="submit" style={styles.btnPrimarySmall}>
                      Enviar Avaliação
                    </button>
                  </form>
                ) : (
                  <div style={{ marginTop: '0.5rem', color: '#34d399', fontSize: '0.8125rem', fontWeight: '600' }}>
                    ✓ Avaliação enviada com sucesso!
                  </div>
                )}
              </div>

              <button style={{ ...styles.logoutBtn, width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.75rem' }} onClick={logout}>
                <LogOut size={16} />
                <span>Sair da Minha Conta</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Intenção de Renovação ou Desocupação */}
      {showVacancyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Intenção ao Fim do Contrato</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: '1.4', marginBottom: '1.25rem' }}>
              Selecione sua preferência para que nossa equipe imobiliária possa dar andamento aos procedimentos:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                style={styles.btnPrimaryFull}
                onClick={() => handleRenewalIntent('RENOVAR')}
              >
                <span>TENHO INTERESSE EM RENOVAR</span>
              </button>

              <button 
                style={styles.btnSecondaryFull}
                onClick={() => handleRenewalIntent('DESOCUPAR')}
              >
                <span>PRETENDO DESOCUPAR O IMÓVEL</span>
              </button>

              <button 
                style={styles.btnOutlineFull}
                onClick={() => setShowVacancyModal(false)}
              >
                <span>Voltar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON: FALAR COM A IMOBILIÁRIA */}
      <button 
        style={styles.fabWhatsApp}
        onClick={() => {
          setShowMsgModal(true);
        }}
        title="Falar com a Imobiliária"
      >
        <MessageCircle size={24} color="#000000" />
        <span style={styles.fabLabel}>Falar com a Imobiliária</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button style={styles.navItem(activeTab === 'inicio')} onClick={() => setActiveTab('inicio')}>
          <Home size={20} />
          <span>Início</span>
        </button>

        <button style={styles.navItem(activeTab === 'aluguel')} onClick={() => setActiveTab('aluguel')}>
          <CreditCard size={20} />
          <span>Aluguel</span>
        </button>

        <button style={styles.navItem(activeTab === 'manutencoes')} onClick={() => setActiveTab('manutencoes')}>
          <Wrench size={20} />
          <span>Reparos</span>
        </button>

        <button style={styles.navItem(activeTab === 'contrato')} onClick={() => setActiveTab('contrato')}>
          <FileText size={20} />
          <span>Contrato</span>
        </button>

        <button style={styles.navItem(activeTab === 'mensagens')} onClick={() => setActiveTab('mensagens')}>
          <MessageSquare size={20} />
          <span>Recados</span>
        </button>
      </nav>
    </div>
  );
}

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
  badgeTenant: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    color: '#38bdf8',
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
  billHighlightCard: {
    marginTop: '1rem',
    padding: '1.125rem',
    borderRadius: 'var(--border-radius-sm)',
    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
  },
  billHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBillTag: (status) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.625rem',
    borderRadius: '12px',
    backgroundColor: status === 'Pago' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
    color: status === 'Pago' ? '#34d399' : '#f59e0b',
  }),
  billValueRow: {
    margin: '0.75rem 0',
  },
  billDueDateLabel: {
    fontSize: '0.8125rem',
    color: 'var(--text-tertiary)',
  },
  billAmountBig: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  billActionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  btnBillActionPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    backgroundColor: 'var(--accent-primary)',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: 'pointer',
  },
  btnBillActionSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '8px',
    padding: '0.625rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnBillActionOutline: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  quickNavGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  quickNavBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
  },
  quickIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  quickNavTitle: {
    fontSize: '0.9375rem',
    color: '#ffffff',
  },
  quickNavSub: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  contractNoticeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
  },
  btnNoticeAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'none',
    border: 'none',
    color: 'var(--accent-cyan)',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginTop: '0.5rem',
    cursor: 'pointer',
    padding: 0,
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
  maintCardMini: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    cursor: 'pointer',
  },
  maintMiniHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  protocolTag: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  statusTagMini: (status) => ({
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '8px',
    backgroundColor: status === 'Concluído' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
    color: status === 'Concluído' ? '#34d399' : '#f59e0b',
  }),
  maintMiniTitle: {
    fontSize: '0.9375rem',
    color: '#ffffff',
    marginTop: '0.25rem',
  },
  maintMiniDate: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  scheduledNoticeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginTop: '0.5rem',
    paddingTop: '0.375rem',
    borderTop: '1px solid var(--glass-border)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  pageHeader: {
    marginBottom: '0.5rem',
  },
  pageSubtitle: {
    fontSize: '0.8125rem',
    color: 'var(--text-tertiary)',
    marginTop: '0.25rem',
  },
  billCardFull: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
  },
  btnPrimaryFull: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--accent-primary)',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.8125rem',
    fontWeight: '800',
    cursor: 'pointer',
  },
  btnSecondaryFull: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnOutlineFull: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  historyItem: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyIconBox: (isPaid) => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  btnReceiptLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'none',
    border: 'none',
    color: 'var(--accent-cyan)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginTop: '0.25rem',
  },
  pageHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  btnNewMaint: {
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
  maintFullCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  maintFullHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  protocolTagBig: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    fontWeight: '700',
  },
  maintTitleBig: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: '0.125rem',
  },
  categoryBadge: {
    display: 'inline-block',
    fontSize: '0.6875rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: 'var(--text-tertiary)',
    marginTop: '0.25rem',
  },
  maintDescText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  scheduledBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem',
  },
  timelineTracker: {
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--glass-border)',
  },
  timelineLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.6875rem',
    marginBottom: '0.375rem',
  },
  timelineStepLabel: (active) => ({
    color: active ? '#ffffff' : 'var(--text-tertiary)',
    fontWeight: active ? '700' : '400',
  }),
  timelineTrackBar: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  timelineProgressFill: (stepIdx) => ({
    height: '100%',
    width: `${(stepIdx / 7) * 100}%`,
    backgroundColor: '#34d399',
    transition: 'width 0.3s ease',
  }),
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
  attachmentSimBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px dashed var(--glass-border)',
    borderRadius: '8px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  btnSecondarySmall: {
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
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    color: '#000000',
    padding: '0.5rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  contractDetailCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contractHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  contractCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  cellLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
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
  messageCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
  },
  msgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
  },
  profileAvatarBig: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--glass-border)',
  },
  ratingBox: {
    marginTop: '1.25rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid var(--glass-border)',
  },
  fabWhatsApp: {
    position: 'fixed',
    bottom: '76px',
    right: '1rem',
    backgroundColor: '#25D366',
    color: '#000000',
    border: 'none',
    borderRadius: '30px',
    padding: '0.625rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
    cursor: 'pointer',
    zIndex: 150,
  },
  fabLabel: {
    fontSize: '0.8125rem',
    fontWeight: '800',
    color: '#000000',
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
    gridTemplateColumns: 'repeat(5, 1fr)',
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
    height: '100%',
  })
};
