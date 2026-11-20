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
  Sparkles,
  Camera,
  Upload,
  X,
  Trash2
} from 'lucide-react';

const formatLocationUrl = (urlOrCoords) => {
  if (!urlOrCoords) return '';
  const trimmed = urlOrCoords.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('maps.') || trimmed.startsWith('www.google.') || trimmed.startsWith('goo.gl') || trimmed.startsWith('waze.')) {
    return `https://${trimmed}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
};

export default function FichaPublicaCliente() {
  const defaultToday = new Date().toISOString().split('T')[0];
  const [submitted, setSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [accountCreatedInfo, setAccountCreatedInfo] = useState(null);

  const [formData, setFormData] = useState({
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',
    horarioContatoProprietario: 'Comercial (08:00 às 18:00)',
    linkWhatsapp: '',

    tipoImovel: 'Casa',
    enderecoImovel: '',
    bairroImovel: '',
    pontoReferenciaImovel: '',
    linkLocalizacaoImovel: '',
    ocupacaoImovel: 'Vazio',
    nomeAcesso: '',
    telefoneAcesso: '',
    dificuldadeAcesso: 'Não',
    observacoesAcesso: '',
    aguaLigada: 'Sim',
    energiaLigada: 'Sim',
    animaisImovel: 'Não',
    observacoesImovel: '',
    imagensImovel: [],

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          setFormData(prev => ({
            ...prev,
            imagensImovel: [...(prev.imagensImovel || []), compressedDataUrl]
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imagensImovel: (prev.imagensImovel || []).filter((_, idx) => idx !== indexToRemove)
    }));
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
      // 1. Load saved fichas from localStorage
      const savedRaw = localStorage.getItem('crmbase_fichas_visita');
      let existingFichas = [];
      try {
        existingFichas = savedRaw ? JSON.parse(savedRaw) : [];
      } catch (err) {
        existingFichas = [];
      }

      const count = existingFichas.length + 1;
      const autoCode = `AI-${String(count).padStart(4, '0')}`;
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

      // 2. Auto-create Client in eloos_clients and card in eloos_kanban
      const ownerName = (formData.nomeProprietario || '').trim();
      const ownerPhone = (formData.telefoneProprietario || '').trim();
      const cleanPhone = ownerPhone.replace(/\D/g, '');
      const ownerEmail = (formData.emailProprietario || '').trim() || 
        (cleanPhone ? `proprietario_${cleanPhone}@araujoimoveis.com.br` : `proprietario_${Date.now()}@araujoimoveis.com.br`);

      if (ownerName) {
        let existingClients = [];
        try {
          const rawClients = localStorage.getItem('eloos_clients');
          existingClients = rawClients ? JSON.parse(rawClients) : [];
        } catch (e) {
          existingClients = [];
        }

        const clientExists = existingClients.some(c => {
          const cPhone = (c.phone || '').replace(/\D/g, '');
          const cEmail = (c.email || '').trim().toLowerCase();
          const cName = (c.name || '').trim().toLowerCase();
          return (cleanPhone && cPhone && (cPhone === cleanPhone || cPhone.slice(-8) === cleanPhone.slice(-8))) ||
                 (ownerEmail && cEmail && cEmail === ownerEmail.toLowerCase()) ||
                 (cName === ownerName.toLowerCase());
        });

        const clientId = `c_${Date.now()}`;
        if (!clientExists) {
          const clientTags = ['Ficha de Visita'];
          if (formData.tipoImovel) clientTags.push(formData.tipoImovel);
          if (formData.bairroImovel) clientTags.push(formData.bairroImovel);

          const newClient = {
            id: clientId,
            name: ownerName,
            phone: ownerPhone,
            email: ownerEmail,
            role: 'Proprietário',
            status: 'Novo Lead / Qualificação',
            tags: clientTags,
            empreendimento: formData.tipoImovel || 'Imóvel para Locação',
            situacaoComercial: 'Visita Técnica Agendada',
            linkWhatsapp: formData.linkWhatsapp || '',
            createdAt: new Date().toISOString().split('T')[0],
            camposPersonalizados: {
              codigoFicha: autoCode,
              tipoImovel: formData.tipoImovel || '',
              enderecoImovel: formData.enderecoImovel || '',
              bairro: formData.bairroImovel || '',
              dataVisita: formData.dataVisita || '',
              horarioVisita: formData.horarioVisita || '',
              linkWhatsapp: formData.linkWhatsapp || ''
            }
          };

          const updatedClients = [newClient, ...existingClients];
          localStorage.setItem('eloos_clients', JSON.stringify(updatedClients));

          // Create Kanban Card
          let existingCards = [];
          try {
            const rawCards = localStorage.getItem('eloos_kanban');
            existingCards = rawCards ? JSON.parse(rawCards) : [];
          } catch (e) {
            existingCards = [];
          }

          const newCard = {
            id: `k_${Date.now()}`,
            clientId: clientId,
            title: `${ownerName} - Ficha de Visita (${autoCode})`,
            desc: `Imóvel: ${formData.tipoImovel || 'Imóvel'} em ${formData.bairroImovel || ''}. Telefone: ${ownerPhone}`,
            column: 'col_novo_lead',
            priority: 'Alta',
            date: formData.dataVisita || new Date().toISOString().split('T')[0]
          };

          localStorage.setItem('eloos_kanban', JSON.stringify([...existingCards, newCard]));
        }

        // 3. Auto-create portal and system user account on the website
        let existingPortalUsers = [];
        try {
          const rawPortal = localStorage.getItem('araujo_portal_users');
          existingPortalUsers = rawPortal ? JSON.parse(rawPortal) : [];
        } catch (e) {
          existingPortalUsers = [];
        }

        let existingSystemUsers = [];
        try {
          const rawSys = localStorage.getItem('crmbase_system_users');
          existingSystemUsers = rawSys ? JSON.parse(rawSys) : [];
        } catch (e) {
          existingSystemUsers = [];
        }

        const userExists = [...existingPortalUsers, ...existingSystemUsers].some(u => {
          const uEmail = (u.email || '').trim().toLowerCase();
          const uPhone = (u.phone || '').replace(/\D/g, '');
          return (ownerEmail && uEmail && uEmail === ownerEmail.toLowerCase()) ||
                 (cleanPhone && uPhone && (uPhone === cleanPhone || uPhone.slice(-8) === cleanPhone.slice(-8)));
        });

        if (!userExists) {
          const newUser = {
            id: `user_${Date.now()}`,
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
            role: 'proprietario',
            password: '123456',
            status: 'Ativo'
          };

          const updatedPortal = [...existingPortalUsers, newUser];
          localStorage.setItem('araujo_portal_users', JSON.stringify(updatedPortal));

          const updatedSystem = [...existingSystemUsers, newUser];
          localStorage.setItem('crmbase_system_users', JSON.stringify(updatedSystem));

          // Also trigger async cloud KV sync
          try {
            fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedPortal)
            }).catch(e => console.warn('Could not sync to cloud KV:', e));
          } catch (e) {}
        }

        setAccountCreatedInfo({
          email: ownerEmail,
          password: '123456'
        });
      }

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

          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', display: 'block' }}>Código do Agendamento:</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>{generatedCode}</strong>
          </div>

          {accountCreatedInfo && (
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.95rem' }}>
                <Sparkles size={18} />
                <span>Acesso Criado ao Portal do Proprietário</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                Seu usuário foi liberado automaticamente no site para acompanhar sua locação e agendamentos:
              </p>
              <div style={{ fontSize: '0.875rem', backgroundColor: 'var(--glass-highlight)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontFamily: 'monospace' }}>
                <div><strong>E-mail:</strong> {accountCreatedInfo.email}</div>
                <div><strong>Senha padrão:</strong> {accountCreatedInfo.password}</div>
              </div>
            </div>
          )}

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
                setAccountCreatedInfo(null);
                setFormData(prev => ({ ...prev, nomeProprietario: '', telefoneProprietario: '', enderecoImovel: '' }));
              }}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem' }}
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

              <div className="form-group">
                <label className="form-label">Melhor horário para contato:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ex: Comercial, manhã, após 18h..."
                  value={formData.horarioContatoProprietario}
                  onChange={e => handleFieldChange('horarioContatoProprietario', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link do seu WhatsApp (opcional):</label>
                <input 
                  type="url"
                  className="form-input"
                  placeholder="https://wa.me/55..."
                  value={formData.linkWhatsapp}
                  onChange={e => handleFieldChange('linkWhatsapp', e.target.value)}
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
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Link da Localização (Google Maps/Waze):</span>
                  {formData.linkLocalizacaoImovel && (
                    <a 
                      href={formatLocationUrl(formData.linkLocalizacaoImovel)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: '#22c55e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                    >
                      Abrir mapa ↗
                    </a>
                  )}
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="https://maps.google.com/... ou coordenadas"
                  value={formData.linkLocalizacaoImovel}
                  onChange={e => handleFieldChange('linkLocalizacaoImovel', e.target.value)}
                />
                {formData.linkLocalizacaoImovel ? (
                  <div style={{ marginTop: '0.45rem' }}>
                    <a
                      href={formatLocationUrl(formData.linkLocalizacaoImovel)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        color: '#22c55e',
                        borderColor: 'rgba(34, 197, 94, 0.4)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fontWeight: '600',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        width: 'fit-content'
                      }}
                    >
                      <MapPin size={15} /> Abrir Localização ↗
                    </a>
                  </div>
                ) : (
                  (formData.enderecoImovel || formData.bairroImovel) && (
                    <div style={{ marginTop: '0.45rem' }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.enderecoImovel || ''} ${formData.bairroImovel || ''} Caratinga MG`.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                          color: '#94a3b8',
                          borderColor: 'rgba(255,255,255,0.15)',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          width: 'fit-content'
                        }}
                      >
                        <MapPin size={13} /> Buscar endereço no Maps ↗
                      </a>
                    </div>
                  )
                )}
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
                <label className="form-label">Observações sobre o Acesso / Local:</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder={formData.dificuldadeAcesso === 'Sim' ? "Descreva a dificuldade de acesso (chave dura, interfone quebrado, código, portão...)" : "Observações ou detalhes adicionais sobre o acesso (opcional)..."}
                  value={formData.observacoesAcesso}
                  onChange={e => handleFieldChange('observacoesAcesso', e.target.value)}
                />
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

              {/* Fotos e Imagens do Imóvel */}
              <div className="form-group span-2" style={{ marginTop: '0.5rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                    <Camera size={16} style={{ color: 'var(--accent-cyan)' }} />
                    Fotos e Imagens do Imóvel:
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {(formData.imagensImovel || []).length} foto(s) anexada(s)
                  </span>
                </label>

                {/* Upload Area */}
                <div style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Upload size={20} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Clique ou arraste para adicionar fotos do imóvel
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Você pode tirar fotos pela câmera do celular ou escolher da galeria
                    </div>
                  </div>
                </div>

                {/* Previews Grid */}
                {(formData.imagensImovel || []).length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '0.875rem'
                  }}>
                    {(formData.imagensImovel || []).map((imgUrl, idx) => (
                      <div key={idx} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--glass-border)',
                        backgroundColor: 'var(--bg-tertiary)'
                      }}>
                        <img 
                          src={imgUrl} 
                          alt={`Foto ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                          onClick={() => window.open(imgUrl, '_blank')}
                          title="Clique para abrir em tamanho real"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remover foto"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              className="btn btn-primary"
              style={{
                padding: '0.875rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '700',
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
