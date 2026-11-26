import React, { useState } from 'react';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Upload, 
  Send, 
  ShieldAlert, 
  FileText, 
  Calendar, 
  User, 
  Sparkles, 
  AlertTriangle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { calculateSignatureProgress, STATUS_ASSINATURA } from '../utils/propertyLifecycle';

export default function ControleAssinaturas({ 
  contrato, 
  onUpdateContrato, 
  readOnly = false 
}) {
  const [activeSignatarioId, setActiveSignatarioId] = useState(null);
  const [docFileNotice, setDocFileNotice] = useState('');

  if (!contrato) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        <FileCheck size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
        <p>Nenhum contrato selecionado para visualização de assinaturas.</p>
      </div>
    );
  }

  const signatarios = Array.isArray(contrato.signatarios) ? contrato.signatarios : [];
  const progress = calculateSignatureProgress(contrato);

  const handleStatusChange = (sigId, newStatus) => {
    if (readOnly) return;
    const now = new Date().toISOString();
    const updated = signatarios.map(s => {
      if (s.id === sigId) {
        return {
          ...s,
          status: newStatus,
          dataAssinatura: newStatus === 'Assinada' ? (s.dataAssinatura || now) : null
        };
      }
      return s;
    });

    const isFinished = updated.filter(s => s.obrigatoria !== false && s.status !== 'Não se aplica').every(s => s.status === 'Assinada');

    onUpdateContrato({
      ...contrato,
      signatarios: updated,
      status: isFinished ? 'vigente' : (contrato.status === 'vigente' ? 'aguardando_assinaturas' : contrato.status),
      updatedAt: now
    });
  };

  const handleSimularProvedor = (sigId) => {
    handleStatusChange(sigId, 'Assinada');
    setDocFileNotice(`Assinatura eletrônica autenticada via Provedor Oficial para ${signatarios.find(s => s.id === sigId)?.nome || 'signatário'}!`);
    setTimeout(() => setDocFileNotice(''), 4000);
  };

  const handleFileUpload = (sigId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeUrl = `documento_assinado_${file.name}_${Date.now()}`;
    const now = new Date().toISOString();
    const updated = signatarios.map(s => {
      if (s.id === sigId) {
        return {
          ...s,
          status: 'Assinada',
          dataAssinatura: now,
          documentoUrl: fakeUrl,
          documentoNome: file.name
        };
      }
      return s;
    });

    onUpdateContrato({
      ...contrato,
      signatarios: updated,
      updatedAt: now
    });

    setDocFileNotice(`Documento assinado anexo com sucesso: ${file.name}`);
    setTimeout(() => setDocFileNotice(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Barra de Progresso do Contrato */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Progresso das Assinaturas Obrigatórias
              </strong>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
              Contrato {contrato.tipo === 'venda' ? 'de Compra e Venda' : 'de Locação Residencial/Comercial'} • Código: {contrato.imovelCodigo || 'IM-001'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '0.85rem', 
              color: 'var(--text-primary)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--glass-border)'
            }}>
              {progress.texto} ({progress.percentual}%)
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${progress.percentual}%`, 
            height: '100%', 
            backgroundColor: 'var(--accent-primary)', 
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Alerta de bloqueio caso haja pendências */}
        {!progress.concluido && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>Regra de Segurança: O contrato e a entrega de chaves não podem ser concluídos enquanto houver assinaturas obrigatórias pendentes.</span>
          </div>
        )}

        {progress.concluido && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>Todas as assinaturas obrigatórias foram concluídas com sucesso. O contrato está apto para vigência.</span>
          </div>
        )}
      </div>

      {/* Toast Notificação */}
      {docFileNotice && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>{docFileNotice}</span>
        </div>
      )}

      {/* Lista de Signatários */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} style={{ color: 'var(--accent-cyan)' }} />
          Signatários e Status das Assinaturas
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {signatarios.map((sig, idx) => {
            const isAssinada = sig.status === 'Assinada';
            const isRecusada = sig.status === 'Recusada';
            const isAguardando = sig.status === 'Aguardando assinatura';
            const isObrigatoria = sig.obrigatoria !== false;

            return (
              <div 
                key={sig.id || idx}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {sig.nome}
                    </strong>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '4px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)'
                    }}>
                      {sig.papel}
                    </span>
                    {isObrigatoria ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                        Obrigatória
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', padding: '1px 6px' }}>
                        Opcional
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {sig.email && <span>E-mail: {sig.email}</span>}
                    {sig.telefone && <span>WhatsApp: {sig.telefone}</span>}
                    {sig.dataAssinatura && (
                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} style={{ color: 'var(--accent-cyan)' }} />
                        Assinado em: {new Date(sig.dataAssinatura).toLocaleDateString('pt-BR')} às {new Date(sig.dataAssinatura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {sig.documentoNome && (
                      <span style={{ color: 'var(--accent-cyan)' }}>
                        📄 {sig.documentoNome}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Selector & Ações */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select
                    value={sig.status}
                    onChange={(e) => handleStatusChange(sig.id, e.target.value)}
                    disabled={readOnly}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontWeight: '500',
                      fontSize: '0.85rem',
                      cursor: readOnly ? 'default' : 'pointer'
                    }}
                  >
                    {STATUS_ASSINATURA.map(st => (
                      <option key={st.id} value={st.label}>
                        {st.label}
                      </option>
                    ))}
                  </select>

                  {!readOnly && (
                    <>
                      {/* Simular Assinatura Digital do Provedor */}
                      {sig.status !== 'Assinada' && (
                        <button
                          type="button"
                          onClick={() => handleSimularProvedor(sig.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Simular confirmação vinda do provedor de assinatura eletrônica (Gov.br / D4Sign)"
                        >
                          <Sparkles size={14} style={{ color: '#38bdf8' }} />
                          <span>Validar Eletrônica</span>
                        </button>
                      )}

                      {/* Anexar Documento Assinado */}
                      <label 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                        title="Anexar arquivo PDF ou foto do documento assinado"
                      >
                        <Upload size={14} />
                        <span>Anexar Assinado</span>
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg" 
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(sig.id, e)}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
