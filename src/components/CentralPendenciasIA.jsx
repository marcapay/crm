import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight, 
  Filter, 
  FileCheck, 
  Camera, 
  FileText, 
  DollarSign, 
  ShieldAlert, 
  Bot, 
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { detectPendencias } from '../utils/propertyLifecycle';

export default function CentralPendenciasIA({ 
  imoveis = [], 
  contratos = [], 
  vistorias = [], 
  onResolvePendencia 
}) {
  const [selectedPrioridade, setSelectedPrioridade] = useState('Todas');
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [iaConsulting, setIaConsulting] = useState(false);
  const [iaDiagnostico, setIaDiagnostico] = useState(null);

  const pendencias = detectPendencias(imoveis, contratos, vistorias);

  const filteredPendencias = pendencias.filter(p => {
    if (selectedPrioridade !== 'Todas' && p.prioridade !== selectedPrioridade) return false;
    if (selectedCategoria !== 'Todas' && p.categoria !== selectedCategoria) return false;
    return true;
  });

  const altasCount = pendencias.filter(p => p.prioridade === 'Alta').length;
  const mediasCount = pendencias.filter(p => p.prioridade === 'Média').length;
  const baixasCount = pendencias.filter(p => p.prioridade === 'Baixa').length;

  const categorias = Array.from(new Set(pendencias.map(p => p.categoria)));

  const handleConsultarIA = () => {
    setIaConsulting(true);
    setTimeout(() => {
      setIaConsulting(false);
      setIaDiagnostico({
        resumo: `Identifiquei ${pendencias.length} pendências ativas no ecossistema da Araújo Imóveis, sendo ${altasCount} com nível de criticidade ALTA.`,
        pontosCriticos: [
          altasCount > 0 ? `🚨 Prioridade Máxima: Resolver com urgência os ${altasCount} itens com risco jurídico ou operacional imediato (assinaturas pendentes e laudos de vistoria antes da entrega de chaves).` : 'Nenhum risco jurídico crítico imediato.',
          '📄 Segurança Contratual: Garantir a coleta das assinaturas de locador e locatário antes de autorizar a mudança e entrega de chaves.',
          '📸 Performance de Captação: Cadastrar fotos nos imóveis sem fotos para acelerar o matching com demandas de clientes e a publicação no site oficial.'
        ],
        sugestaoAcaoImediata: 'Disparar lembrete via WhatsApp para signatários com assinaturas pendentes e designar vistorias agendadas aos peritos técnicos.'
      });
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner com IA Assistant */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Sparkles size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0, fontWeight: '700' }}>
              Central de Pendências & Diagnóstico Inteligente por IA
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Monitoramento proativo em tempo real de documentos faltantes, assinaturas pendentes, vistorias técnicas não concluídas, contas bancárias e contratos próximos do vencimento.
          </p>
        </div>

        <button
          type="button"
          onClick={handleConsultarIA}
          disabled={iaConsulting}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.9rem',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.35)'
          }}
        >
          <Bot size={18} />
          <span>{iaConsulting ? 'Analisando pendências...' : 'Diagnóstico IA Araújo'}</span>
        </button>
      </div>

      {/* Resultado do Diagnóstico IA */}
      {iaDiagnostico && (
        <div className="glass-card" style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
            <Bot size={18} />
            <strong style={{ fontSize: '0.95rem' }}>Recomendações da Inteligência Artificial</strong>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {iaDiagnostico.resumo}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {iaDiagnostico.pontosCriticos.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span>•</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: '6px', color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span><strong>Próximo passo sugerido:</strong> {iaDiagnostico.sugestaoAcaoImediata}</span>
          </div>
        </div>
      )}

      {/* KPI Cards de Pendências */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Total de Pendências</span>
          <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{pendencias.length}</strong>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', fontWeight: '600' }}>Prioridade Alta</span>
          <strong style={{ fontSize: '1.5rem', color: '#ef4444' }}>{altasCount}</strong>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'block', fontWeight: '600' }}>Prioridade Média</span>
          <strong style={{ fontSize: '1.5rem', color: '#f59e0b' }}>{mediasCount}</strong>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #38bdf8' }}>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', fontWeight: '600' }}>Categorias Mapeadas</span>
          <strong style={{ fontSize: '1.5rem', color: '#38bdf8' }}>{categorias.length}</strong>
        </div>
      </div>

      {/* Filtros da Central */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Prioridade:</span>
          {['Todas', 'Alta', 'Média', 'Baixa'].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPrioridade(p)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                backgroundColor: selectedPrioridade === p ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: selectedPrioridade === p ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Categoria:</span>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem'
            }}
          >
            <option value="Todas">Todas as Categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Pendências */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        {filteredPendencias.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', opacity: 0.8, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Nenhuma pendência administrativa pendente!</p>
            <p style={{ fontSize: '0.85rem' }}>Todos os processos, contratos, vistorias e documentos estão em dia.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filteredPendencias.map(pend => {
              const isAlta = pend.prioridade === 'Alta';

              return (
                <div 
                  key={pend.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: `1px solid ${isAlta ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)'}`,
                    borderLeft: `5px solid ${isAlta ? '#ef4444' : '#f59e0b'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: isAlta ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isAlta ? '#ef4444' : '#f59e0b'
                      }}>
                        {pend.prioridade}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {pend.categoria}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {pend.titulo}
                      </strong>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '0.35rem' }}>
                      {pend.descricao}
                    </p>

                    <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} />
                        Responsável: <strong>{pend.responsavel}</strong>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isAlta ? '#ef4444' : 'var(--text-tertiary)' }}>
                        <Clock size={12} />
                        Prazo: <strong>{pend.prazo}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Ação de Resolução */}
                  <div>
                    <button
                      type="button"
                      onClick={() => onResolvePendencia && onResolvePendencia(pend)}
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <span>{pend.acaoTexto || 'Resolver'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
