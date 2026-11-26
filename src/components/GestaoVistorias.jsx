import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  User, 
  Camera, 
  Video, 
  FileText, 
  Upload, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { STATUS_VISTORIA } from '../utils/propertyLifecycle';

export default function GestaoVistorias({ 
  vistorias = [], 
  imovel, 
  onSaveVistoria, 
  onDeleteVistoria, 
  readOnly = false 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Form para nova vistoria
  const [tipoVistoria, setTipoVistoria] = useState('entrada'); // 'entrada' | 'saida'
  const [statusVistoria, setStatusVistoria] = useState('Vistoria agendada');
  const [dataAgendada, setDataAgendada] = useState(new Date().toISOString().split('T')[0]);
  const [responsavelVistoria, setResponsavelVistoria] = useState('Perito Avaliador Araújo Imóveis');
  const [observacoes, setObservacoes] = useState('');
  const [fotosVistoria, setFotosVistoria] = useState([]);
  const [videosVistoria, setVideosVistoria] = useState([]);
  const [laudoTexto, setLaudoTexto] = useState('');

  const imovelVistorias = vistorias.filter(v => {
    if (!imovel) return true;
    return v.imovelId === imovel.id || v.imovelCodigo === imovel.codigoImovel || v.imovelCodigo === imovel.code;
  });

  const handleCreateVistoria = (e) => {
    e.preventDefault();
    const newVistoria = {
      id: `vist_${Date.now()}`,
      imovelId: imovel?.id || 'imovel_geral',
      imovelCodigo: imovel?.codigoImovel || imovel?.code || 'IM-001',
      tipo: tipoVistoria,
      status: statusVistoria,
      dataAgendada,
      profissionalResponsavel: responsavelVistoria,
      observacoes,
      laudoTexto,
      fotos: fotosVistoria,
      videos: videosVistoria,
      documentos: [],
      createdAt: new Date().toISOString()
    };

    if (onSaveVistoria) {
      onSaveVistoria(newVistoria);
    }

    setSuccessToast(`Vistoria técnica de ${tipoVistoria === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
    setTimeout(() => setSuccessToast(''), 4000);
    setShowAddModal(false);
    // Limpa campos
    setObservacoes('');
    setLaudoTexto('');
    setFotosVistoria([]);
    setVideosVistoria([]);
  };

  const handleUpdateStatus = (vistoria, newStatus) => {
    if (readOnly) return;
    const updated = {
      ...vistoria,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    if (onSaveVistoria) {
      onSaveVistoria(updated);
    }
    setSuccessToast(`Status da vistoria atualizado para: ${newStatus}`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setFotosVistoria(prev => [...prev, loadEvt.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header com Ação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={20} style={{ color: 'var(--accent-cyan)' }} />
            Gestão Independente de Vistorias Técnicas
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Controle de vistorias de entrada e saída, laudos fotográficos, vídeos e assinatura técnica pericial.
          </span>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1rem' }}
          >
            <Plus size={16} />
            <span>Agendar Nova Vistoria</span>
          </button>
        )}
      </div>

      {/* Toast Feedback */}
      {successToast && (
        <div style={{
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

      {/* Lista de Vistorias do Imóvel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        {imovelVistorias.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <ClipboardCheck size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: '500' }}>Nenhuma vistoria técnica registrada para este imóvel.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Clique em <strong>Agendar Nova Vistoria</strong> para registrar vistorias de entrada ou de devolução (saída).
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {imovelVistorias.map(v => {
              const statusInfo = STATUS_VISTORIA.find(s => s.label === v.status) || { color: '#94a3b8' };
              const isConcluida = v.status.includes('concluída');

              return (
                <div 
                  key={v.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '4px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--glass-border)'
                        }}>
                          Vistoria de {v.tipo === 'saida' ? 'Saída (Devolução)' : 'Entrada'}
                        </span>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                          Imóvel: {v.imovelCodigo}
                        </strong>
                      </div>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} />
                          Data: {v.dataAgendada ? new Date(v.dataAgendada).toLocaleDateString('pt-BR') : 'A definir'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={13} />
                          Responsável: <strong>{v.profissionalResponsavel}</strong>
                        </span>
                        {Array.isArray(v.fotos) && v.fotos.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-cyan)' }}>
                            <Camera size={13} />
                            {v.fotos.length} foto(s) anexadas
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Changer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Etapa:</span>
                      <select
                        value={v.status}
                        onChange={(e) => handleUpdateStatus(v, e.target.value)}
                        disabled={readOnly}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-primary)',
                          fontWeight: '500',
                          fontSize: '0.825rem',
                          cursor: readOnly ? 'default' : 'pointer'
                        }}
                      >
                        {STATUS_VISTORIA.map(st => (
                          <option key={st.id} value={st.label}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Laudo e Observações */}
                  {(v.observacoes || v.laudoTexto) && (
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {v.observacoes && <p style={{ margin: 0, marginBottom: v.laudoTexto ? '0.5rem' : 0 }}><strong>Anotações:</strong> {v.observacoes}</p>}
                      {v.laudoTexto && <p style={{ margin: 0 }}><strong>Laudo Técnico Pericial:</strong> {v.laudoTexto}</p>}
                    </div>
                  )}

                  {/* Galeria de Fotos da Vistoria */}
                  {Array.isArray(v.fotos) && v.fotos.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                        Registros Fotográficos do Laudo:
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {v.fotos.map((pic, pIdx) => (
                          <img 
                            key={pIdx} 
                            src={pic} 
                            alt={`Vistoria ${pIdx + 1}`}
                            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--glass-border)' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Agendamento de Nova Vistoria */}
      {showAddModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={20} style={{ color: 'var(--accent-cyan)' }} />
              Agendar Vistoria Técnica
            </h3>

            <form onSubmit={handleCreateVistoria} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tipo da Vistoria *
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="tipoVistoria" 
                      value="entrada"
                      checked={tipoVistoria === 'entrada'} 
                      onChange={() => setTipoVistoria('entrada')}
                    />
                    <span>Vistoria de Entrada (Início de Locação)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="tipoVistoria" 
                      value="saida"
                      checked={tipoVistoria === 'saida'} 
                      onChange={() => setTipoVistoria('saida')}
                    />
                    <span>Vistoria de Saída (Devolução)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Data Prevista *
                  </label>
                  <input 
                    type="date"
                    value={dataAgendada}
                    onChange={(e) => setDataAgendada(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Status Inicial *
                  </label>
                  <select
                    value={statusVistoria}
                    onChange={(e) => setStatusVistoria(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {STATUS_VISTORIA.map(st => (
                      <option key={st.id} value={st.label}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Profissional Técnico Responsável *
                </label>
                <input 
                  type="text"
                  value={responsavelVistoria}
                  onChange={(e) => setResponsavelVistoria(e.target.value)}
                  placeholder="Nome do perito avaliador ou vistoriador"
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Anotações Iniciais e Instruções
                </label>
                <textarea 
                  rows="2"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Pegar chaves na imobiliária, verificar medidores de água e luz..."
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Anexar Fotografias Iniciais da Vistoria
                </label>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddPhotos}
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                />
                {fotosVistoria.length > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'block', marginTop: '0.25rem' }}>
                    ✓ {fotosVistoria.length} foto(s) selecionada(s)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Salvar Vistoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
