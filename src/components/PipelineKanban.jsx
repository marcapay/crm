import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  PIPELINE_LOCACAO_STAGES, 
  PIPELINE_VENDA_STAGES, 
  getStatusComercialInfo 
} from '../utils/propertyLifecycle';

export default function PipelineKanban({ 
  tipo = 'locacao', // 'locacao' | 'venda'
  imoveis = [], 
  onMoveStage, 
  onSelectImovel,
  currentUser = 'Corretor Araújo Imóveis'
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('all');

  const stages = tipo === 'venda' ? PIPELINE_VENDA_STAGES : PIPELINE_LOCACAO_STAGES;
  const stageField = tipo === 'venda' ? 'etapaPipelineVenda' : 'etapaPipelineLocacao';

  // Filtra apenas imóveis compatíveis com o tipo de pipeline
  const filteredImoveis = imoveis.filter(imovel => {
    if (!imovel) return false;
    const finalidade = (imovel.finalidadeImovel || 'Para locação').toLowerCase();
    
    if (tipo === 'locacao') {
      if (!finalidade.includes('locação') && !finalidade.includes('alugar')) return false;
    } else {
      if (!finalidade.includes('venda') && !finalidade.includes('comprar')) return false;
    }

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      const code = (imovel.codigoImovel || imovel.code || '').toLowerCase();
      const title = (imovel.tituloImovel || imovel.title || '').toLowerCase();
      const owner = (imovel.nomeProprietario || '').toLowerCase();
      const neighborhood = (imovel.bairroImovel || imovel.neighborhood || '').toLowerCase();
      if (!code.includes(q) && !title.includes(q) && !owner.includes(q) && !neighborhood.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const getStageForImovel = (imovel) => {
    const raw = imovel[stageField] || imovel.etapaPipeline;
    if (raw && stages.some(s => s.id === raw || s.label === raw)) {
      const matched = stages.find(s => s.id === raw || s.label === raw);
      return matched ? matched.id : stages[0].id;
    }
    return stages[0].id;
  };

  const handleAdvance = (imovel, currentStageId) => {
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      if (onMoveStage) {
        onMoveStage(imovel.id, nextStage.id, nextStage.label, tipo);
      }
    }
  };

  const handleGoBack = (imovel, currentStageId) => {
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    if (currentIndex > 0) {
      const prevStage = stages[currentIndex - 1];
      if (onMoveStage) {
        onMoveStage(imovel.id, prevStage.id, prevStage.label, tipo);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Top Filter Bar */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <Layers size={18} style={{ color: tipo === 'venda' ? '#8b5cf6' : '#38bdf8' }} />
          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Pipeline de {tipo === 'venda' ? `Venda (${stages.length} Etapas)` : `Locação (${stages.length} Etapas)`}
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            ({filteredImoveis.length} imóveis no fluxo)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text"
            placeholder="Filtrar por código, proprietário ou bairro..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.825rem',
              width: '260px'
            }}
          />
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div style={{
        display: 'flex',
        gap: '0.875rem',
        overflowX: 'auto',
        paddingBottom: '1.25rem',
        minHeight: '560px'
      }}>
        {stages.map((stage, sIdx) => {
          const cardsInStage = filteredImoveis.filter(im => getStageForImovel(im) === stage.id);

          return (
            <div 
              key={stage.id}
              style={{
                width: '300px',
                minWidth: '290px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                overflow: 'hidden'
              }}
            >
              {/* Stage Header */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--glass-border)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: sIdx === stages.length - 1 ? '#10b981' : 'rgba(56, 189, 248, 0.2)',
                    color: sIdx === stages.length - 1 ? '#ffffff' : '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {stage.step}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {stage.short}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: cardsInStage.length > 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: cardsInStage.length > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)'
                }}>
                  {cardsInStage.length}
                </span>
              </div>

              {/* Stage Cards Area */}
              <div style={{
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1,
                overflowY: 'auto'
              }}>
                {cardsInStage.length === 0 ? (
                  <div style={{ padding: '2rem 0.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    Nenhum imóvel nesta etapa
                  </div>
                ) : (
                  cardsInStage.map(imovel => {
                    const code = imovel.codigoImovel || imovel.code || `IM-${imovel.id}`;
                    const statusCom = getStatusComercialInfo(imovel.statusComercial || imovel.status);
                    const preco = Number(imovel.valorImovel || imovel.price || imovel.valorPretendidoAluguel || 0);

                    return (
                      <div 
                        key={imovel.id}
                        className="glass-card glass-panel-hover"
                        style={{
                          padding: '0.875rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                        onClick={() => onSelectImovel && onSelectImovel(imovel)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                            {code}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: statusCom.bg,
                            border: `1px solid ${statusCom.border}`,
                            color: statusCom.hex
                          }}>
                            {statusCom.label}
                          </span>
                        </div>

                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.25' }}>
                          {imovel.tituloImovel || imovel.title || `${imovel.tipoImovel || imovel.type} no ${imovel.bairroImovel || imovel.neighborhood || 'Centro'}`}
                        </strong>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={12} />
                            Proprietário: {imovel.nomeProprietario || 'Não informado'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={12} />
                            {imovel.bairroImovel || imovel.neighborhood || 'Caratinga'}
                          </span>
                          {preco > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: '700' }}>
                              <DollarSign size={12} />
                              {tipo === 'locacao' ? 'Aluguel: ' : 'Venda: '} R$ {preco.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>

                        {/* Card Movement Bar */}
                        <div 
                          style={{ 
                            marginTop: '0.35rem', 
                            paddingTop: '0.5rem', 
                            borderTop: '1px solid var(--glass-border)', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center' 
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => handleGoBack(imovel, stage.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--glass-border)',
                              color: sIdx === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                              cursor: sIdx === 0 ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.75rem'
                            }}
                            title="Voltar etapa anterior"
                          >
                            <ArrowLeft size={12} />
                            <span>Voltar</span>
                          </button>

                          <button
                            type="button"
                            disabled={sIdx === stages.length - 1}
                            onClick={() => handleAdvance(imovel, stage.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: sIdx === stages.length - 1 ? 'transparent' : 'rgba(56, 189, 248, 0.15)',
                              border: `1px solid ${sIdx === stages.length - 1 ? 'var(--glass-border)' : 'rgba(56, 189, 248, 0.4)'}`,
                              color: sIdx === stages.length - 1 ? 'var(--text-tertiary)' : 'var(--accent-cyan)',
                              cursor: sIdx === stages.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            title="Avançar próxima etapa"
                          >
                            <span>Avançar</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
