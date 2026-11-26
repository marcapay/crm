import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Layers, 
  DollarSign, 
  Calendar, 
  User, 
  MapPin, 
  FileCheck, 
  ClipboardCheck, 
  History, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Save, 
  FileText, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Tag,
  Trash2
} from 'lucide-react';
import { 
  FINALIDADE_IMOVEL, 
  STATUS_COMERCIAL, 
  STATUS_OPERACIONAL_POS_LOCACAO, 
  getStatusComercialInfo,
  getSitePublishDecision,
  createDefaultLocacaoSignatarios,
  createDefaultVendaSignatarios
} from '../utils/propertyLifecycle';
import ControleAssinaturas from './ControleAssinaturas';
import GestaoVistorias from './GestaoVistorias';

export default function ModalCicloVidaImovel({ 
  imovel, 
  onClose, 
  onSaveImovel,
  onDeleteImovel,
  contratos = [],
  onSaveContrato,
  vistorias = [],
  onSaveVistoria,
  currentUser = 'Administrador'
}) {
  const [activeTab, setActiveTab] = useState('comercial'); // 'comercial', 'contratos', 'vistorias', 'historico'
  const [successToast, setSuccessToast] = useState('');

  // Estados editáveis de ciclo de vida
  const [finalidade, setFinalidade] = useState(imovel?.finalidadeImovel || 'Para locação');
  const [statusComercial, setStatusComercial] = useState(imovel?.statusComercial || 'Disponível para locação');
  const [statusOperacional, setStatusOperacional] = useState(imovel?.statusOperacional || 'Liberado para nova locação');
  const [motivoAlteracao, setMotivoAlteracao] = useState('');
  const [autorizadoPeloProprietario, setAutorizadoPeloProprietario] = useState(true);
  const [publicarNoSite, setPublicarNoSite] = useState(imovel?.publicarNoSite !== false);

  // Contratos vinculados ao imóvel
  const imovelContratos = (Array.isArray(contratos) ? contratos : []).filter(c => {
    if (!c || !imovel) return false;
    return c.imovelId === imovel.id || c.imovelCodigo === (imovel.codigoImovel || imovel.code);
  });

  const [selectedContratoId, setSelectedContratoId] = useState(imovelContratos[0]?.id || null);

  if (!imovel) return null;

  const activeContrato = imovelContratos.find(c => c.id === selectedContratoId) || imovelContratos[0] || null;

  // Decisão de Publicação no Site
  const siteDecision = getSitePublishDecision({
    ...imovel,
    finalidadeImovel: finalidade,
    statusComercial,
    publicarNoSite
  });

  const handleSalvarComercial = () => {
    const now = new Date().toISOString();
    
    // Registra histórico de alteração de finalidade caso tenha mudado
    const historicoFinalidade = Array.isArray(imovel.historicoFinalidade) ? [...imovel.historicoFinalidade] : [];
    if (finalidade !== imovel.finalidadeImovel) {
      historicoFinalidade.push({
        data: now,
        finalidadeAnterior: imovel.finalidadeImovel || 'Não definida',
        finalidadeNova: finalidade,
        usuario: currentUser,
        autorizadoProprietario: autorizadoPeloProprietario,
        observacao: motivoAlteracao || 'Alteração de modalidade comercial solicitada'
      });
    }

    // Registra histórico geral de movimentações
    const historicoMovimentacoes = Array.isArray(imovel.historicoMovimentacoes) ? [...imovel.historicoMovimentacoes] : [];
    if (statusComercial !== imovel.statusComercial) {
      historicoMovimentacoes.push({
        data: now,
        tipo: 'status_comercial',
        de: imovel.statusComercial || 'Disponível',
        para: statusComercial,
        usuario: currentUser,
        observacao: motivoAlteracao || 'Atualização do ciclo de vida comercial'
      });
    }

    const updatedImovel = {
      ...imovel,
      finalidadeImovel: finalidade,
      statusComercial,
      statusOperacional,
      publicarNoSite,
      historicoFinalidade,
      historicoMovimentacoes,
      updatedAt: now
    };

    if (onSaveImovel) {
      onSaveImovel(updatedImovel);
    }

    setSuccessToast('Dados comerciais e regras de ciclo de vida atualizados com sucesso!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleCreateNewContrato = (tipoContrato) => {
    const now = new Date();
    const venc = new Date();
    venc.setFullYear(now.getFullYear() + (tipoContrato === 'locacao' ? 1 : 0)); // 12 meses locacao

    const newContrato = {
      id: `cnt_${Date.now()}`,
      numero: `CTR-${Date.now().toString().slice(-4)}`,
      tipo: tipoContrato, // 'locacao' | 'venda'
      imovelId: imovel.id,
      imovelCodigo: imovel.codigoImovel || imovel.code || 'IM-001',
      valor: Number(imovel.valorImovel || imovel.price || imovel.valorPretendidoAluguel || 1500),
      dataInicio: now.toISOString().split('T')[0],
      dataVencimento: venc.toISOString().split('T')[0],
      status: 'aguardando_assinaturas',
      responsavel: currentUser,
      signatarios: tipoContrato === 'venda' 
        ? createDefaultVendaSignatarios({ nome: imovel.nomeProprietario, telefone: imovel.telefoneProprietario }, null)
        : createDefaultLocacaoSignatarios({ nome: imovel.nomeProprietario, telefone: imovel.telefoneProprietario }, null),
      createdAt: now.toISOString()
    };

    if (onSaveContrato) {
      onSaveContrato(newContrato);
    }
    setSelectedContratoId(newContrato.id);
    setSuccessToast(`Novo Contrato de ${tipoContrato === 'venda' ? 'Venda' : 'Locação'} criado com controle de assinaturas!`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const statusComInfo = getStatusComercialInfo(statusComercial);

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '1050px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '14px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header do Imóvel */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-cyan)', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)' }}>
                {imovel.codigoImovel || imovel.code || `IM-${imovel.id}`}
              </span>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                {imovel.tituloImovel || imovel.title || `${imovel.tipoImovel || imovel.type} no ${imovel.bairroImovel || imovel.neighborhood || 'Centro'}`}
              </h2>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: statusComInfo.bg,
                border: `1px solid ${statusComInfo.border}`,
                color: statusComInfo.hex
              }}>
                {statusComInfo.label}
              </span>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span>Proprietário: <strong style={{ color: 'var(--text-secondary)' }}>{imovel.nomeProprietario || 'Não informado'}</strong></span>
              <span>Local: <strong style={{ color: 'var(--text-secondary)' }}>{imovel.bairroImovel || imovel.neighborhood || 'Caratinga'}</strong></span>
              <span>Finalidade: <strong style={{ color: 'var(--text-secondary)' }}>{finalidade}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onDeleteImovel && (
              <button 
                type="button" 
                onClick={() => onDeleteImovel(imovel)}
                className="btn btn-secondary"
                style={{ 
                  padding: '0.45rem', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)'
                }}
                title="Excluir Imóvel"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.45rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navegação de Abas do Modal */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--glass-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '0 1.25rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'comercial', label: 'Classificação & Comercial', icon: Layers },
            { id: 'contratos', label: `Contratos & Assinaturas (${imovelContratos.length})`, icon: FileCheck },
            { id: 'vistorias', label: `Vistorias Técnicas`, icon: ClipboardCheck },
            { id: 'historico', label: 'Histórico & Inquilinos Antigos', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.125rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                  borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Toast */}
        {successToast && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#10b981',
            borderRadius: '8px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Conteúdo das Abas */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {/* ABA 1: CLASSIFICAÇÃO COMERCIAL & SITE */}
          {activeTab === 'comercial' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Seção 2: Finalidade do Imóvel */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                  1. Finalidade do Imóvel (Independente)
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                  A finalidade define se o imóvel está disponível para venda, locação ou ambos. Pode ser alterada mediante autorização do proprietário com registro de histórico.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {FINALIDADE_IMOVEL.map(fin => (
                    <label 
                      key={fin} 
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: `1px solid ${finalidade === fin ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
                        backgroundColor: finalidade === fin ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: finalidade === fin ? '700' : '500',
                        color: finalidade === fin ? 'var(--accent-cyan)' : 'var(--text-primary)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="finalidadeImovel"
                        checked={finalidade === fin}
                        onChange={() => setFinalidade(fin)}
                      />
                      <span>{fin}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={autorizadoPeloProprietario}
                      onChange={(e) => setAutorizadoPeloProprietario(e.target.checked)}
                    />
                    <span>Possui autorização formalizada do proprietário para esta finalidade</span>
                  </label>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                      Motivo / Anotação da alteração de finalidade:
                    </label>
                    <input 
                      type="text"
                      placeholder="Ex: Proprietário autorizou venda mantendo opção de aluguel simultâneo"
                      value={motivoAlteracao}
                      onChange={(e) => setMotivoAlteracao(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Status Comercial */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
                  2. Status Comercial do Imóvel
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                  Classificação comercial conforme o momento do negócio, com cores de identificação visual padronizadas:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {STATUS_COMERCIAL.map(st => (
                    <label 
                      key={st.id}
                      style={{
                        padding: '0.75rem 0.875rem',
                        borderRadius: '8px',
                        border: `1px solid ${statusComercial === st.label ? st.hex : 'var(--glass-border)'}`,
                        backgroundColor: statusComercial === st.label ? st.bg : 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: statusComercial === st.label ? st.hex : 'var(--text-primary)',
                        fontWeight: statusComercial === st.label ? '700' : '500'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="radio" 
                          name="statusComercial"
                          checked={statusComercial === st.label}
                          onChange={() => setStatusComercial(st.label)}
                        />
                        <span style={{ fontSize: '0.85rem' }}>{st.label}</span>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: st.bg,
                        color: st.hex,
                        border: `1px solid ${st.border}`
                      }}>
                        {st.cor}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Seção 8: Status Operacional Pós-Locação */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
                  3. Gestão Pós-Locação (Status Operacional)
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                  Acompanhamento do contrato de locação e da preservação contínua do imóvel:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {STATUS_OPERACIONAL_POS_LOCACAO.map(op => (
                    <label 
                      key={op.id}
                      style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        backgroundColor: statusOperacional === op.label ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-secondary)',
                        color: statusOperacional === op.label ? 'var(--text-primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        fontWeight: statusOperacional === op.label ? '600' : '500'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="statusOperacional"
                        checked={statusOperacional === op.label}
                        onChange={() => setStatusOperacional(op.label)}
                      />
                      <span>{op.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Seção 10: Regras de Publicação no Site */}
              <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={18} style={{ color: 'var(--accent-cyan)' }} />
                    4. Integração com o Site Oficial (araujoimoveiscaratinga.com.br)
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={publicarNoSite}
                      onChange={(e) => setPublicarNoSite(e.target.checked)}
                    />
                    <span>Permitir publicação no site</span>
                  </label>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: '0 0 0.35rem 0' }}>
                    <strong>Comportamento Automático no Site:</strong> {siteDecision.motivo}
                  </p>
                  {siteDecision.reservado && (
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>
                      ℹ️ O anúncio continuará no site oficial com selo visual de <strong>"RESERVADO"</strong>.
                    </span>
                  )}
                  {statusComercial === 'Alugado' && finalidade === 'Para venda e locação' && (
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>
                      ✓ Imóvel alugado: Saiu da seção de locação, mas <strong>permanece ativo na vitrine de VENDA</strong>!
                    </span>
                  )}
                  {statusComercial === 'Vendido' && finalidade === 'Para venda e locação' && (
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>
                      ✓ Imóvel vendido: Saiu da seção de venda, mas <strong>permanece ativo na vitrine de LOCAÇÃO</strong>!
                    </span>
                  )}
                </div>
              </div>

              {/* Botão Salvar Comercial */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleSalvarComercial}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: '700' }}
                >
                  <Save size={16} />
                  <span>Salvar Alterações do Ciclo de Vida</span>
                </button>
              </div>

            </div>
          )}

          {/* ABA 2: CONTRATOS & ASSINATURAS */}
          {activeTab === 'contratos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>
                    Contratos e Controle de Assinaturas Obrigatórias
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Histórico permanente de contratos de venda e locação vinculados ao código {imovel.codigoImovel || imovel.code}.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCreateNewContrato('locacao')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={14} />
                    <span>Novo Contrato Locação</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateNewContrato('venda')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={14} />
                    <span>Novo Contrato Venda</span>
                  </button>
                </div>
              </div>

              {imovelContratos.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ fontWeight: '500' }}>Nenhum contrato formalizado para este imóvel ainda.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Utilize os botões acima para iniciar um Contrato de Locação ou de Compra e Venda com controle de assinaturas.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Seletor de Contrato se houver mais de um */}
                  {imovelContratos.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                      {imovelContratos.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedContratoId(c.id)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            backgroundColor: selectedContratoId === c.id ? 'var(--text-primary)' : 'var(--bg-secondary)',
                            color: selectedContratoId === c.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                            border: '1px solid var(--glass-border)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {c.numero || c.id} ({c.tipo === 'venda' ? 'Venda' : 'Locação'})
                        </button>
                      ))}
                    </div>
                  )}

                  {activeContrato && (
                    <ControleAssinaturas 
                      contrato={activeContrato}
                      onUpdateContrato={(updated) => {
                        if (onSaveContrato) onSaveContrato(updated);
                        setSuccessToast('Assinaturas do contrato salvas!');
                        setTimeout(() => setSuccessToast(''), 3000);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: VISTORIAS */}
          {activeTab === 'vistorias' && (
            <GestaoVistorias 
              imovel={imovel}
              vistorias={vistorias}
              onSaveVistoria={onSaveVistoria}
            />
          )}

          {/* ABA 4: HISTÓRICO & INQUILINOS ANTIGOS */}
          {activeTab === 'historico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>
                  Linha do Tempo & Histórico Permanente do Imóvel
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
                  Conforme a regra do sistema, o encerramento de contratos nunca exclui o cadastro. Todos os contratos anteriores, antigos inquilinos, vistorias e alterações de finalidade são preservados.
                </p>
              </div>

              {/* Histórico de Alterações de Finalidade */}
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Histórico de Alterações de Finalidade Comercial
                </strong>
                {Array.isArray(imovel.historicoFinalidade) && imovel.historicoFinalidade.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {imovel.historicoFinalidade.map((hf, hIdx) => (
                      <div key={hIdx} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.825rem' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>{new Date(hf.data).toLocaleString('pt-BR')}:</span>{' '}
                        De <strong>{hf.finalidadeAnterior}</strong> para <strong>{hf.finalidadeNova}</strong> por {hf.usuario}.{' '}
                        <span style={{ color: 'var(--accent-cyan)' }}>({hf.observacao})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Nenhuma alteração de finalidade registrada até o momento.
                  </span>
                )}
              </div>

              {/* Histórico de Inquilinos & Contratos Encerrados */}
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Registro de Inquilinos e Ocorrências Passadas
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Imóvel cadastrado sob código <strong>{imovel.codigoImovel || imovel.code}</strong>. Todas as vistorias de saída, recibos de entrega de chaves e laudos permanecem acessíveis na aba de Vistorias e Contratos para consulta jurídica futura.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
