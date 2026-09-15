import React, { useState } from 'react';
import ClientLogo from './ClientLogo';
import { 
  ClipboardCheck, 
  Send, 
  CheckCircle2, 
  User, 
  Home, 
  Calendar, 
  AlertCircle,
  Phone,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export default function FichaPublicaCliente() {
  const defaultToday = new Date().toISOString().split('T')[0];
  const [submitted, setSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const [formData, setFormData] = useState({
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',
    horarioContatoProprietario: 'Comercial (08:00 às 18:00)',

    tipoImovel: 'Casa',
    enderecoImovel: '',
    bairroImovel: '',
    pontoReferenciaImovel: '',
    linkLocalizacaoImovel: '',
    ocupacaoImovel: 'Vazio',
    nomeAcesso: '',
    telefoneAcesso: '',
    dificuldadeAcesso: 'Não',
    aguaLigada: 'Sim',
    energiaLigada: 'Sim',
    animaisImovel: 'Não',
    observacoesImovel: '',

    dataVisita: defaultToday,
    horarioVisita: '09:00',
    profissionalResponsavel: 'A definir pela Imobiliária',
    proprietarioAcompanhara: 'Sim',
    autorizacaoFotosVideos: 'Sim',
    confirmadoWhatsapp: 'Não',

    codigoImovel: '',
    dataCaptacao: defaultToday,
    corretorResponsavel: 'A definir (Link Público)',
    origemCaptacao: 'Formulário Público (Cliente)',
    status: 'Aguardando agendamento'
  });

  const [formErrors, setFormErrors] = useState({});

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nomeProprietario?.trim()) {
      errors.nomeProprietario = 'Por favor, informe seu nome completo.';
    }

    if (!formData.telefoneProprietario?.trim()) {
      errors.telefoneProprietario = 'Por favor, informe seu telefone / WhatsApp.';
    } else {
      const digits = formData.telefoneProprietario.replace(/\D/g, '');
      if (digits.length < 8) {
        errors.telefoneProprietario = 'Informe um telefone válido com DDD.';
      }
    }

    if (formData.emailProprietario?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailProprietario.trim())) {
        errors.emailProprietario = 'Informe um e-mail válido.';
      }
    }

    if (!formData.tipoImovel?.trim()) {
      errors.tipoImovel = 'Selecione o tipo do imóvel.';
    }

    if (!formData.enderecoImovel?.trim()) {
      errors.enderecoImovel = 'Informe o endereço completo do imóvel.';
    }

    if (!formData.bairroImovel?.trim()) {
      errors.bairroImovel = 'Informe o bairro do imóvel.';
    }

    if (!formData.dataVisita?.trim()) {
      errors.dataVisita = 'Selecione a data preferencial para a visita.';
    }

    if (!formData.horarioVisita?.trim()) {
      errors.horarioVisita = 'Selecione o horário preferencial.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // Load saved fichas from localStorage
      const savedRaw = localStorage.getItem('crmbase_fichas_visita');
      let existingFichas = [];
      try {
        existingFichas = savedRaw ? JSON.parse(savedRaw) : [];
      } catch (err) {
        existingFichas = [];
      }

      const count = existingFichas.length + 1;
      const autoCode = `VT-${String(count).padStart(4, '0')}`;
      const now = new Date().toISOString();

      const newFicha = {
        id: 'ficha_' + Date.now(),
        codigoImovel: autoCode,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Formulário Público (Cliente)',
        updatedBy: 'Formulário Público (Cliente)',
        ...formData,
        codigoImovel: autoCode
      };

      const updatedList = [newFicha, ...existingFichas];
      localStorage.setItem('crmbase_fichas_visita', JSON.stringify(updatedList));

      setGeneratedCode(autoCode);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Erro ao salvar ficha pública:", err);
      alert("Ocorreu um erro ao enviar suas informações. Por favor, tente novamente.");
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <CheckCircle2 size={40} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Ficha Enviada com Sucesso!
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Obrigado, <strong>{formData.nomeProprietario}</strong>. Suas informações foram registradas no sistema da Araújo Imóveis.
          </p>

          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', display: 'block' }}>Código do Agendamento:</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>{generatedCode}</strong>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
            Nossa equipe de atendimento/corretores entrará em contato em breve via WhatsApp ({formData.telefoneProprietario}) para confirmar os detalhes da visita técnica.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={`https://wa.me/5537999881122?text=${encodeURIComponent(`Olá! Enviei o formulário de visita técnica para meu imóvel (${formData.enderecoImovel} - Código ${generatedCode}). Gostaria de confirmar o agendamento.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#25D366', color: '#ffffff', fontWeight: '600', textDecoration: 'none', borderRadius: '8px' }}
            >
              <span>Falar pelo WhatsApp</span>
            </a>

            <button 
              onClick={() => {
                setSubmitted(false);
                setFormData(prev => ({ ...prev, nomeProprietario: '', telefoneProprietario: '', enderecoImovel: '' }));
              }}
              className="btn-glass-secondary"
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}
            >
              Enviar Outro Imóvel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '1.5rem 1rem 3rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <ClientLogo height={56} theme="dark" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Agendamento de Visita Técnica
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-tertiary)', maxWidth: '600px', margin: '0 auto' }}>
            Preencha os dados abaixo para cadastrar seu imóvel e solicitar a avaliação/vistoria da equipe <strong>Araújo Imóveis</strong>.
          </p>
        </div>

        {/* Global Form Errors */}
        {Object.keys(formErrors).length > 0 && (
          <div className="glass-card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', borderRadius: '12px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Por favor, corrija os erros antes de enviar:</strong>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem' }}>
                {Object.values(formErrors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Seus Dados */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <User size={20} />
              1. Dados do Proprietário
            </h3>

            <div className="form-grid-2">
              <div className="form-group span-2">
                <label className="form-label required">Seu Nome Completo:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.nomeProprietario ? 'input-error' : ''}`}
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={formData.nomeProprietario}
                  onChange={e => handleFieldChange('nomeProprietario', e.target.value)}
                />
                {formErrors.nomeProprietario && <span className="error-text">{formErrors.nomeProprietario}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Telefone / WhatsApp para contato:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.telefoneProprietario ? 'input-error' : ''}`}
                  placeholder="(37) 99999-9999"
                  value={formData.telefoneProprietario}
                  onChange={e => handleFieldChange('telefoneProprietario', e.target.value)}
                />
                {formErrors.telefoneProprietario && <span className="error-text">{formErrors.telefoneProprietario}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Seu E-mail (opcional):</label>
                <input 
                  type="email"
                  className={`form-input ${formErrors.emailProprietario ? 'input-error' : ''}`}
                  placeholder="seu@email.com"
                  value={formData.emailProprietario}
                  onChange={e => handleFieldChange('emailProprietario', e.target.value)}
                />
                {formErrors.emailProprietario && <span className="error-text">{formErrors.emailProprietario}</span>}
              </div>

              <div className="form-group span-2">
                <label className="form-label">Melhor horário para entrarmos em contato:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ex: Período da manhã, após 18h, etc."
                  value={formData.horarioContatoProprietario}
                  onChange={e => handleFieldChange('horarioContatoProprietario', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dados do Imóvel */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Home size={20} />
              2. Dados do Imóvel
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label required">Tipo do Imóvel:</label>
                <select 
                  className={`form-input ${formErrors.tipoImovel ? 'input-error' : ''}`}
                  value={formData.tipoImovel}
                  onChange={e => handleFieldChange('tipoImovel', e.target.value)}
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Galpão">Galpão</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Sobrado">Sobrado</option>
                  <option value="Outro">Outro</option>
                </select>
                {formErrors.tipoImovel && <span className="error-text">{formErrors.tipoImovel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Bairro:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.bairroImovel ? 'input-error' : ''}`}
                  placeholder="Nome do bairro"
                  value={formData.bairroImovel}
                  onChange={e => handleFieldChange('bairroImovel', e.target.value)}
                />
                {formErrors.bairroImovel && <span className="error-text">{formErrors.bairroImovel}</span>}
              </div>

              <div className="form-group span-2">
                <label className="form-label required">Endereço Completo:</label>
                <input 
                  type="text"
                  className={`form-input ${formErrors.enderecoImovel ? 'input-error' : ''}`}
                  placeholder="Rua, número, complemento"
                  value={formData.enderecoImovel}
                  onChange={e => handleFieldChange('enderecoImovel', e.target.value)}
                />
                {formErrors.enderecoImovel && <span className="error-text">{formErrors.enderecoImovel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Ponto de Referência:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Próximo ao supermercado, praça, etc."
                  value={formData.pontoReferenciaImovel}
                  onChange={e => handleFieldChange('pontoReferenciaImovel', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link da Localização (Google Maps/Waze):</label>
                <input 
                  type="url"
                  className="form-input"
                  placeholder="https://maps.google.com/..."
                  value={formData.linkLocalizacaoImovel}
                  onChange={e => handleFieldChange('linkLocalizacaoImovel', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">O Imóvel está Vazio ou Ocupado?</label>
                <select 
                  className="form-input"
                  value={formData.ocupacaoImovel}
                  onChange={e => handleFieldChange('ocupacaoImovel', e.target.value)}
                >
                  <option value="Vazio">Vazio</option>
                  <option value="Ocupado">Ocupado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nome de quem dará acesso no local:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Nome do morador, portaria ou responsável"
                  value={formData.nomeAcesso}
                  onChange={e => handleFieldChange('nomeAcesso', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone de quem dará acesso:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="(37) 99999-9999"
                  value={formData.telefoneAcesso}
                  onChange={e => handleFieldChange('telefoneAcesso', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Existe dificuldade de acesso?</label>
                <select 
                  className="form-input"
                  value={formData.dificuldadeAcesso}
                  onChange={e => handleFieldChange('dificuldadeAcesso', e.target.value)}
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              <div className="form-group span-2">
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span className="form-label" style={{ margin: 0 }}>Água ligada:</span>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                      value={formData.aguaLigada}
                      onChange={e => handleFieldChange('aguaLigada', e.target.value)}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span className="form-label" style={{ margin: 0 }}>Energia ligada:</span>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                      value={formData.energiaLigada}
                      onChange={e => handleFieldChange('energiaLigada', e.target.value)}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span className="form-label" style={{ margin: 0 }}>Animais no imóvel:</span>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                      value={formData.animaisImovel}
                      onChange={e => handleFieldChange('animaisImovel', e.target.value)}
                    >
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="form-group span-2">
                <label className="form-label">Observações Importantes:</label>
                <textarea 
                  rows={3}
                  className="form-input"
                  placeholder="Regras do condomínio, horários para chaves, detalhes adicionais..."
                  value={formData.observacoesImovel}
                  onChange={e => handleFieldChange('observacoesImovel', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Preferências para a Visita */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Calendar size={20} />
              3. Preferência de Data e Horário
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label required">Data Preferencial para a Visita:</label>
                <input 
                  type="date"
                  className={`form-input ${formErrors.dataVisita ? 'input-error' : ''}`}
                  value={formData.dataVisita}
                  onChange={e => handleFieldChange('dataVisita', e.target.value)}
                />
                {formErrors.dataVisita && <span className="error-text">{formErrors.dataVisita}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Horário Preferencial:</label>
                <input 
                  type="time"
                  className={`form-input ${formErrors.horarioVisita ? 'input-error' : ''}`}
                  value={formData.horarioVisita}
                  onChange={e => handleFieldChange('horarioVisita', e.target.value)}
                />
                {formErrors.horarioVisita && <span className="error-text">{formErrors.horarioVisita}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Você (Proprietário) acompanhará a visita?</label>
                <select 
                  className="form-input"
                  value={formData.proprietarioAcompanhara}
                  onChange={e => handleFieldChange('proprietarioAcompanhara', e.target.value)}
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Autoriza registro de fotos e vídeos?</label>
                <select 
                  className="form-input"
                  value={formData.autorizacaoFotosVideos}
                  onChange={e => handleFieldChange('autorizacaoFotosVideos', e.target.value)}
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              type="submit"
              className="btn-glass-primary"
              style={{
                padding: '0.875rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 8px 24px rgba(255,255,255,0.15)'
              }}
            >
              <Send size={18} />
              <span>Enviar Informações do Imóvel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
