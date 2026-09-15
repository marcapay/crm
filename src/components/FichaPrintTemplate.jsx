import React from 'react';
import ClientLogo from './ClientLogo';
import { Printer, ArrowLeft } from 'lucide-react';

export default function FichaPrintTemplate({ ficha, isBlank = false, onClose, onPrint }) {
  const currentFormattedDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const data = isBlank ? {} : (ficha || {});

  const renderValue = (val, fallback = '________________________________________') => {
    if (isBlank) return <span className="blank-line">{fallback}</span>;
    if (val === undefined || val === null || val === '') return <span className="empty-val">-</span>;
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    return val;
  };

  const renderRadioBox = (label, isChecked) => {
    return (
      <span className="print-checkbox-item" style={{ marginRight: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span className={`print-box ${!isBlank && isChecked ? 'checked' : ''}`}>
          {!isBlank && isChecked ? '✓' : ''}
        </span>
        <span>{label}</span>
      </span>
    );
  };

  const statusOptions = [
    'Aguardando agendamento',
    'Agendado',
    'Confirmado',
    'Realizado',
    'Reagendar'
  ];

  return (
    <div className="ficha-print-wrapper">
      {/* Non-printed action bar */}
      <div className="no-print print-action-bar">
        <button className="btn-print-secondary" onClick={onClose}>
          <ArrowLeft size={18} />
          <span>Voltar para Formulário</span>
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-print-primary" onClick={onPrint || (() => window.print())}>
            <Printer size={18} />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="ficha-a4-sheet">
        {/* Header */}
        <header className="ficha-header">
          <div className="header-logo-area">
            <ClientLogo height={44} theme="light" />
          </div>
          <div className="header-title-area">
            <h1 className="ficha-main-title">Ficha 01: Agendamento de Visita Técnica</h1>
            <p className="ficha-subtitle">Araújo Imóveis — Gestão de Captação e Avaliação</p>
          </div>
          <div className="header-code-area">
            <span className="code-label">Código do Imóvel</span>
            <span className="code-value">{isBlank ? 'VT-____' : (data.codigoImovel || 'VT-0000')}</span>
          </div>
        </header>

        {/* Section 1: Dados do Proprietário */}
        <section className="ficha-section">
          <h2 className="section-title">1. Dados do Proprietário</h2>
          <div className="ficha-grid grid-col-2">
            <div className="field-group span-2">
              <span className="field-label">Nome Completo:</span>
              <span className="field-content">{renderValue(data.nomeProprietario, '____________________________________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Telefone / WhatsApp:</span>
              <span className="field-content">{renderValue(data.telefoneProprietario, '________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">E-mail:</span>
              <span className="field-content">{renderValue(data.emailProprietario, '________________________')}</span>
            </div>
            <div className="field-group span-2">
              <span className="field-label">Melhor Horário para Contato:</span>
              <span className="field-content">{renderValue(data.horarioContatoProprietario, '____________________________________________________')}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Dados Iniciais do Imóvel */}
        <section className="ficha-section">
          <h2 className="section-title">2. Dados Iniciais do Imóvel</h2>
          <div className="ficha-grid grid-col-2">
            <div className="field-group">
              <span className="field-label">Tipo do Imóvel:</span>
              <span className="field-content">{renderValue(data.tipoImovel, '________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Bairro:</span>
              <span className="field-content">{renderValue(data.bairroImovel, '________________________')}</span>
            </div>
            <div className="field-group span-2">
              <span className="field-label">Endereço Completo:</span>
              <span className="field-content">{renderValue(data.enderecoImovel, '____________________________________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Ponto de Referência:</span>
              <span className="field-content">{renderValue(data.pontoReferenciaImovel, '________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Link da Localização:</span>
              <span className="field-content">{renderValue(data.linkLocalizacaoImovel, '________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Situação do Imóvel:</span>
              <div className="radio-options">
                {renderRadioBox('Vazio', data.ocupacaoImovel === 'Vazio')}
                {renderRadioBox('Ocupado', data.ocupacaoImovel === 'Ocupado')}
              </div>
            </div>
            <div className="field-group">
              <span className="field-label">Nome de quem dará acesso:</span>
              <span className="field-content">{renderValue(data.nomeAcesso, '________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Telefone de quem dará acesso:</span>
              <span className="field-content">{renderValue(data.telefoneAcesso, '________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Dificuldade de Acesso:</span>
              <div className="radio-options">
                {renderRadioBox('Não', data.dificuldadeAcesso === 'Não' || data.dificuldadeAcesso === false)}
                {renderRadioBox('Sim', data.dificuldadeAcesso === 'Sim' || data.dificuldadeAcesso === true)}
              </div>
            </div>
            <div className="field-group span-2 flex-row-wrap">
              <div className="check-item">
                <span className="field-label">Água ligada:</span>
                {renderRadioBox('Sim', data.aguaLigada === 'Sim' || data.aguaLigada === true)}
                {renderRadioBox('Não', data.aguaLigada === 'Não' || data.aguaLigada === false)}
              </div>
              <div className="check-item">
                <span className="field-label">Energia ligada:</span>
                {renderRadioBox('Sim', data.energiaLigada === 'Sim' || data.energiaLigada === true)}
                {renderRadioBox('Não', data.energiaLigada === 'Não' || data.energiaLigada === false)}
              </div>
              <div className="check-item">
                <span className="field-label">Animais no imóvel:</span>
                {renderRadioBox('Sim', data.animaisImovel === 'Sim' || data.animaisImovel === true)}
                {renderRadioBox('Não', data.animaisImovel === 'Não' || data.animaisImovel === false)}
              </div>
            </div>
            <div className="field-group span-2">
              <span className="field-label">Observações Importantes:</span>
              <span className="field-content multiline">
                {isBlank ? (
                  <>
                    <span className="blank-line">____________________________________________________</span><br/>
                    <span className="blank-line">____________________________________________________</span>
                  </>
                ) : (data.observacoesImovel || 'Nenhuma observação registrada.')}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Agendamento */}
        <section className="ficha-section">
          <h2 className="section-title">3. Agendamento da Visita</h2>
          <div className="ficha-grid grid-col-2">
            <div className="field-group">
              <span className="field-label">Data da Visita:</span>
              <span className="field-content">{renderValue(data.dataVisita ? new Date(data.dataVisita + 'T00:00:00').toLocaleDateString('pt-BR') : '', '____/____/________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Horário:</span>
              <span className="field-content">{renderValue(data.horarioVisita, '____:____')}</span>
            </div>
            <div className="field-group span-2">
              <span className="field-label">Profissional Responsável:</span>
              <span className="field-content">{renderValue(data.profissionalResponsavel, '____________________________________________________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Proprietário Acompanhará?</span>
              <div className="radio-options">
                {renderRadioBox('Sim', data.proprietarioAcompanhara === 'Sim' || data.proprietarioAcompanhara === true)}
                {renderRadioBox('Não', data.proprietarioAcompanhara === 'Não' || data.proprietarioAcompanhara === false)}
              </div>
            </div>
            <div className="field-group">
              <span className="field-label">Autorização Fotos e Vídeos?</span>
              <div className="radio-options">
                {renderRadioBox('Sim', data.autorizacaoFotosVideos === 'Sim' || data.autorizacaoFotosVideos === true)}
                {renderRadioBox('Não', data.autorizacaoFotosVideos === 'Não' || data.autorizacaoFotosVideos === false)}
              </div>
            </div>
            <div className="field-group span-2">
              <span className="field-label">Confirmado via WhatsApp?</span>
              <div className="radio-options">
                {renderRadioBox('Sim', data.confirmadoWhatsapp === 'Sim' || data.confirmadoWhatsapp === true)}
                {renderRadioBox('Não', data.confirmadoWhatsapp === 'Não' || data.confirmadoWhatsapp === false)}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Controle Interno */}
        <section className="ficha-section">
          <h2 className="section-title">4. Controle Interno</h2>
          <div className="ficha-grid grid-col-2">
            <div className="field-group">
              <span className="field-label">Data da Captação:</span>
              <span className="field-content">{renderValue(data.dataCaptacao ? new Date(data.dataCaptacao + 'T00:00:00').toLocaleDateString('pt-BR') : '', '____/____/________')}</span>
            </div>
            <div className="field-group">
              <span className="field-label">Corretor Responsável:</span>
              <span className="field-content">{renderValue(data.corretorResponsavel, '________________________')}</span>
            </div>
            <div className="field-group span-2">
              <span className="field-label">Origem da Captação:</span>
              <span className="field-content">{renderValue(data.origemCaptacao, '____________________________________________________')}</span>
            </div>
            <div className="field-group span-2">
              <span className="field-label" style={{ marginBottom: '6px', display: 'block' }}>Status da Ficha:</span>
              <div className="status-radio-group">
                {statusOptions.map(opt => renderRadioBox(opt, data.status === opt))}
              </div>
            </div>
          </div>
        </section>

        {/* Signatures & Footer */}
        <footer className="ficha-footer">
          <div className="issuance-meta">
            <span><strong>Data de Emissão:</strong> {isBlank ? '____/____/________ às ____:____' : currentFormattedDate}</span>
            <span><strong>Responsável pelo Registro:</strong> {isBlank ? '________________________' : (data.createdBy || 'Sistema Araújo Imóveis')}</span>
          </div>

          <div className="signature-grid">
            <div className="signature-block">
              <div className="signature-line" />
              <span className="signature-name">{isBlank ? 'Assinatura do Corretor / Responsável' : (data.corretorResponsavel || data.profissionalResponsavel || 'Corretor Responsável')}</span>
              <span className="signature-role">Araújo Imóveis</span>
            </div>
            <div className="signature-block">
              <div className="signature-line" />
              <span className="signature-name">{isBlank ? 'Assinatura do Proprietário / Responsável Acesso' : (data.nomeProprietario || 'Proprietário')}</span>
              <span className="signature-role">Proprietário / Titular do Imóvel</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
