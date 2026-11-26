import React, { useState, useRef, useEffect } from 'react';
import { 
  Building, 
  Home, 
  Store, 
  Briefcase, 
  Warehouse, 
  Trees, 
  HelpCircle, 
  MapPin, 
  DollarSign, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  MessageSquare, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  DoorOpen, 
  Car, 
  Bed, 
  Bath, 
  PawPrint, 
  Maximize2
} from 'lucide-react';
import ClientLogo from './ClientLogo';

const TIPOS_IMOVEL = [
  { id: 'Apartamento', label: 'Apartamento', icon: Building, desc: 'Prático e seguro em condomínio' },
  { id: 'Casa', label: 'Casa', icon: Home, desc: 'Espaço, quintal e liberdade' },
  { id: 'Kitnet', label: 'Kitnet / Studio', icon: DoorOpen, desc: 'Econômico e compacto' },
  { id: 'Casa em condomínio', label: 'Casa em Condomínio', icon: ShieldCheck, desc: 'Segurança e lazer fechado' },
  { id: 'Cobertura', label: 'Cobertura', icon: Layers, desc: 'Vista panorâmica e espaço gourmet' },
  { id: 'Loja comercial', label: 'Loja Comercial', icon: Store, desc: 'Ponto comercial com vitrine' },
  { id: 'Sala comercial', label: 'Sala Comercial', icon: Briefcase, desc: 'Consultórios e escritórios' },
  { id: 'Galpão', label: 'Galpão / Depósito', icon: Warehouse, desc: 'Logística, estoque e indústrias' },
  { id: 'Chácara ou sítio', label: 'Chácara ou Sítio', icon: Trees, desc: 'Área verde e tranquilidade' },
  { id: 'Outro', label: 'Outro', icon: HelpCircle, desc: 'Necessidade diferenciada' },
  { id: 'Ainda não decidi', label: 'Ainda não decidi', icon: Sparkles, desc: 'Aberto às melhores opções' }
];

const BAIRROS_SUGERIDOS_CARATINGA = [
  'Centro',
  'Santa Zita',
  'Esperança',
  'Limoeiro',
  'Zacarias',
  'Salatiel',
  'Santa Cruz',
  'Anápolis',
  'Rodoviários',
  'Dário Grossi',
  'Floresta',
  'Esplanada',
  'Nossa Senhora Aparecida',
  'Santo Antônio',
  'Bairro das Graças'
];

const FAIXAS_ORCAMENTO = [
  { id: 'ate_500', label: 'Até R$ 500', sub: 'Econômico' },
  { id: '500_800', label: 'R$ 500 a R$ 800', sub: 'Kitnets e pequenos imóveis' },
  { id: '800_1000', label: 'R$ 800 a R$ 1.000', sub: 'Muito procurado' },
  { id: '1000_1500', label: 'R$ 1.000 a R$ 1.500', sub: 'Apartamentos e casas padrão' },
  { id: '1500_2000', label: 'R$ 1.500 a R$ 2.000', sub: 'Imóveis amplos e confortáveis' },
  { id: '2000_3000', label: 'R$ 2.000 a R$ 3.000', sub: 'Alto padrão residencial ou comercial' },
  { id: '3000_5000', label: 'R$ 3.000 a R$ 5.000', sub: 'Pontos comerciais e coberturas' },
  { id: 'acima_5000', label: 'Acima de R$ 5.000', sub: 'Corporativo e luxo' },
  { id: 'outro_valor', label: 'Outro Valor Específico', sub: 'Digitar valor pretendido' },
  { id: 'aberto_propostas', label: 'Aberto a Propostas', sub: 'Priorizar imóvel ideal' }
];

const CARACTERISTICAS_RESIDENCIAIS = [
  { id: 'elevador', label: 'Elevador', icon: Layers },
  { id: 'varanda', label: 'Varanda / Sacada', icon: Maximize2 },
  { id: 'area_externa', label: 'Área externa / Quintal', icon: Trees },
  { id: 'area_servico', label: 'Área de Serviço', icon: Home },
  { id: 'mobiliado', label: 'Mobiliado / Semi-mobiliado', icon: Building },
  { id: 'aceita_animais', label: 'Aceita Animais (Pet Friendly)', icon: PawPrint },
  { id: 'acessibilidade', label: 'Acessibilidade / Sem escadas', icon: ShieldCheck },
  { id: 'portaria', label: 'Portaria / Segurança 24h', icon: ShieldCheck },
  { id: 'area_lazer', label: 'Área de Lazer / Piscina', icon: Sparkles }
];

const CARACTERISTICAS_COMERCIAIS = [
  { id: 'localizacao_central', label: 'Localização Central de Alto Fluxo', icon: MapPin },
  { id: 'estacionamento', label: 'Estacionamento para Clientes', icon: Car },
  { id: 'acesso_rua', label: 'Acesso Direto pela Rua (Sem degraus)', icon: DoorOpen },
  { id: 'banheiro_cliente', label: 'Banheiro para Clientes', icon: Bath },
  { id: 'visibilidade', label: 'Alta Visibilidade Comercial / Vitrine', icon: Store },
  { id: 'estoque', label: 'Espaço Amplo para Estoque / Depósito', icon: Warehouse }
];

const PRAZOS_URGENCIA = [
  { id: 'imediata', label: 'Imediatamente', badge: 'Urgente', desc: 'Preciso me mudar o quanto antes' },
  { id: '7_dias', label: 'Dentro de 7 dias', badge: 'Rápido', desc: 'Nas próximas semanas' },
  { id: '15_dias', label: 'Dentro de 15 dias', badge: 'Moderado', desc: 'Prazo médio de transição' },
  { id: '30_dias', label: 'Dentro de 30 dias', badge: 'Normal', desc: 'Planejamento para o próximo mês' },
  { id: '60_dias', label: 'Dentro de 60 dias', badge: 'Tranquilo', desc: 'Com antecedência' },
  { id: 'sem_pressa', label: 'Sem pressa', badge: 'Pesquisando', desc: 'Pesquisando com calma a melhor oportunidade' }
];

export default function PaginaPublicaDemandaLocacao() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Etapa 1
    tiposImovel: [],
    tipoOutroDesc: '',

    // Etapa 2
    cidade: 'Caratinga',
    bairros: [],
    outroBairroInput: '',
    proximidade: '',
    aceitaOutrosBairros: true,
    semPreferenciaLocalizacao: false,

    // Etapa 3
    orcamentoFaixa: '1000_1500',
    orcamentoValor: '',
    incluiCondominioIptu: true,

    // Etapa 4
    quartos: '2',
    quartosIndispensavel: false,
    banheiros: '1',
    suites: '',
    vagas: '1',
    vagasIndispensavel: false,
    caracteristicasIndispensaveis: [],
    caracteristicasDesejaveis: [],
    atividadeComercial: '',

    // Etapa 5
    urgencia: '15_dias',

    // Etapa 6
    observacoes: '',

    // Etapa 7
    nome: '',
    whatsapp: '',
    email: '',
    melhorHorario: 'Qualquer horário',
    aceitouTermos: true
  });

  // Audio recording state for Step 6
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setFormData(prev => ({
              ...prev,
              observacoes: (prev.observacoes ? prev.observacoes + ' ' : '') + currentTranscript
            }));
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
          setRecognitionError('Microfone indisponível ou permissão negada.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Você pode digitar normalmente na caixa de texto!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        setRecognitionError('');
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Erro ao iniciar reconhecimento:', err);
      }
    }
  };

  // Toggle Tipo Imovel
  const handleToggleTipo = (tipoId) => {
    setFormData(prev => {
      const current = prev.tiposImovel || [];
      const exists = current.includes(tipoId);
      const updated = exists ? current.filter(t => t !== tipoId) : [...current, tipoId];
      return { ...prev, tiposImovel: updated };
    });
  };

  // Toggle Bairro
  const handleToggleBairro = (bairro) => {
    setFormData(prev => {
      const current = prev.bairros || [];
      const exists = current.includes(bairro);
      const updated = exists ? current.filter(b => b !== bairro) : [...current, bairro];
      return { ...prev, bairros: updated, semPreferenciaLocalizacao: false };
    });
  };

  const handleAddCustomBairro = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = (formData.outroBairroInput || '').trim();
      if (val && !formData.bairros.includes(val)) {
        setFormData(prev => ({
          ...prev,
          bairros: [...prev.bairros, val],
          outroBairroInput: '',
          semPreferenciaLocalizacao: false
        }));
      }
    }
  };

  // Toggle Característica Feature (Desejável vs Indispensável)
  const handleToggleFeature = (featureId, type = 'desejavel') => {
    setFormData(prev => {
      let desp = [...(prev.caracteristicasIndispensaveis || [])];
      let desej = [...(prev.caracteristicasDesejaveis || [])];

      if (type === 'indispensavel') {
        if (desp.includes(featureId)) {
          desp = desp.filter(id => id !== featureId);
        } else {
          desp.push(featureId);
          desej = desej.filter(id => id !== featureId);
        }
      } else {
        if (desej.includes(featureId)) {
          desej = desej.filter(id => id !== featureId);
        } else {
          desej.push(featureId);
          desp = desp.filter(id => id !== featureId);
        }
      }

      return {
        ...prev,
        caracteristicasIndispensaveis: desp,
        caracteristicasDesejaveis: desej
      };
    });
  };

  // Phone input mask
  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length <= 11) {
      if (cleaned.length > 2) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      }
      if (cleaned.length > 7) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
      }
    }
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nome.trim() || !formData.whatsapp.trim()) {
      alert('Por favor, informe seu Nome e WhatsApp para que possamos enviar as opções compatíveis!');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const count = Math.floor(1000 + Math.random() * 9000);
    const code = `DL-${count}`;
    setGeneratedCode(code);

    const payload = {
      id: `demanda_${Date.now()}`,
      codigo: code,
      createdAt: now,
      status: 'nova', // 1. Nova demanda
      nomeCliente: formData.nome.trim(),
      telefoneCliente: formData.whatsapp.trim(),
      emailCliente: formData.email.trim(),
      melhorHorario: formData.melhorHorario,
      cidade: formData.cidade || 'Caratinga',
      bairros: formData.bairros,
      semPreferenciaLocalizacao: formData.semPreferenciaLocalizacao,
      aceitaOutrosBairros: formData.aceitaOutrosBairros,
      tiposImovel: formData.tiposImovel.length ? formData.tiposImovel : ['Apartamento', 'Casa'],
      orcamentoFaixa: formData.orcamentoFaixa,
      orcamentoValor: formData.orcamentoValor,
      incluiCondominioIptu: formData.incluiCondominioIptu,
      quartos: formData.quartos,
      quartosIndispensavel: formData.quartosIndispensavel,
      banheiros: formData.banheiros,
      suites: formData.suites,
      vagas: formData.vagas,
      vagasIndispensavel: formData.vagasIndispensavel,
      caracteristicasIndispensaveis: formData.caracteristicasIndispensaveis,
      caracteristicasDesejaveis: formData.caracteristicasDesejaveis,
      atividadeComercial: formData.atividadeComercial,
      urgencia: formData.urgencia,
      observacoes: formData.observacoes,
      origem: 'link_publico',
      historicoAtendimento: [
        {
          data: now,
          tipo: 'criacao',
          descricao: `Demanda de locação recebida pelo Link Público de Captação (${code})`
        }
      ]
    };

    try {
      // 1. Salva localmente para visualização instantânea no CRM
      const existing = JSON.parse(localStorage.getItem('araujo_demandas_locacao') || '[]');
      localStorage.setItem('araujo_demandas_locacao', JSON.stringify([payload, ...existing]));

      // 2. Tenta registrar via API do CRM caso disponível
      fetch('/api/properties?type=demanda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erro ao salvar demanda:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCommercialSelected = (formData.tiposImovel || []).some(t => 
    ['Loja comercial', 'Sala comercial', 'Galpão'].includes(t)
  );

  // WhatsApp oficial da Araújo Imóveis para o botão final (+55 33 3040-0919)
  const zapMessage = encodeURIComponent(
    `Olá Araújo Imóveis! Acabei de enviar minha Demanda de Locação no site (Código: ${generatedCode || 'DL'}). Gostaria de saber se vocês têm opções compatíveis com o meu perfil!`
  );
  const zapLink = `https://wa.me/553330400919?text=${zapMessage}`;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header Institucional */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.875rem 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClientLogo height={44} theme="light" />
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '680px' }}>

          {!isSubmitted ? (
            <>
              {/* Hero Banner Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem', lineHeight: '1.25' }}>
                  Vamos encontrar o imóvel ideal para você?
                </h1>
                <p style={{ fontSize: '0.925rem', color: '#475569', margin: '0 auto', maxWidth: '540px', lineHeight: '1.5' }}>
                  Conte um pouco sobre o que você está procurando. Nossa equipe encontrará as melhores oportunidades de acordo com suas preferências.
                </p>
              </div>

              {/* Progress Bar & Steps Indicator */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#0284c7' }}>
                  <span>Etapa {currentStep} de 7</span>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>
                    {currentStep === 1 && 'Tipo de Imóvel'}
                    {currentStep === 2 && 'Localização & Bairros'}
                    {currentStep === 3 && 'Orçamento'}
                    {currentStep === 4 && 'Características'}
                    {currentStep === 5 && 'Urgência'}
                    {currentStep === 6 && 'Detalhes Especiais'}
                    {currentStep === 7 && 'Seus Dados de Contato'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(currentStep / 7) * 100}%`,
                    height: '100%',
                    backgroundColor: '#0284c7',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Form Content Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                marginBottom: '1.5rem'
              }}>

                {/* ============================================================
                    ETAPA 1: O que você está procurando?
                   ============================================================ */}
                {currentStep === 1 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      O que você está procurando?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Você pode selecionar mais de uma opção se estiver em dúvida.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {TIPOS_IMOVEL.map(item => {
                        const Icon = item.icon;
                        const isSelected = (formData.tiposImovel || []).includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleTipo(item.id)}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                                color: isSelected ? '#ffffff' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Icon size={20} />
                              </div>
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: isSelected ? 'none' : '1px solid #cbd5e1',
                                backgroundColor: isSelected ? '#0284c7' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff'
                              }}>
                                {isSelected && <Check size={13} strokeWidth={3} />}
                              </div>
                            </div>
                            <strong style={{ fontSize: '0.9rem', color: isSelected ? '#0369a1' : '#0f172a', marginBottom: '0.2rem' }}>
                              {item.label}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.3' }}>
                              {item.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ============================================================
                    ETAPA 2: Onde você deseja morar ou trabalhar?
                   ============================================================ */}
                {currentStep === 2 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      Onde você deseja morar ou trabalhar?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Selecione um ou mais bairros em Caratinga e região de sua preferência.
                    </p>

                    {/* Cidade */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                        Cidade:
                      </label>
                      <input 
                        type="text" 
                        value={formData.cidade} 
                        onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </div>

                    {/* Sem preferência de localização */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.semPreferenciaLocalizacao}
                          onChange={e => setFormData({
                            ...formData, 
                            semPreferenciaLocalizacao: e.target.checked,
                            bairros: e.target.checked ? [] : formData.bairros
                          })}
                          style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                        />
                        <span>Não tenho preferência fixa de bairro (ver qualquer localidade boa)</span>
                      </label>
                    </div>

                    {!formData.semPreferenciaLocalizacao && (
                      <>
                        {/* Bairros Sugeridos */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                            Bairros de Preferência (clique para selecionar):
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                            {BAIRROS_SUGERIDOS_CARATINGA.map(bairro => {
                              const isSelected = formData.bairros.includes(bairro);
                              return (
                                <button
                                  key={bairro}
                                  type="button"
                                  onClick={() => handleToggleBairro(bairro)}
                                  style={{
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '20px',
                                    border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                                    backgroundColor: isSelected ? '#e0f2fe' : '#ffffff',
                                    color: isSelected ? '#0369a1' : '#334155',
                                    fontSize: '0.8rem',
                                    fontWeight: isSelected ? '700' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {isSelected ? `✓ ${bairro}` : `+ ${bairro}`}
                                </button>
                              );
                            })}
                          </div>

                          {/* Adicionar outro bairro */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              placeholder="Outro bairro ou condomínio..." 
                              value={formData.outroBairroInput}
                              onChange={e => setFormData({ ...formData, outroBairroInput: e.target.value })}
                              onKeyDown={handleAddCustomBairro}
                              style={{
                                flex: 1,
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.85rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomBairro}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>

                        {/* Proximidade */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                            Proximidades desejadas (opcional):
                          </label>
                          <input 
                            type="text" 
                            placeholder="Ex: Perto do trabalho no Centro, próximo ao UNEC, supermercado..." 
                            value={formData.proximidade}
                            onChange={e => setFormData({ ...formData, proximidade: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>

                        {/* Aceita outros bairros */}
                        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                            <input 
                              type="checkbox" 
                              checked={formData.aceitaOutrosBairros}
                              onChange={e => setFormData({ ...formData, aceitaOutrosBairros: e.target.checked })}
                              style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                            />
                            <span>Aceito receber opções em outros bairros próximos se o imóvel for excelente</span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ============================================================
                    ETAPA 3: Qual é o seu orçamento?
                   ============================================================ */}
                {currentStep === 3 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      Qual é o seu orçamento mensal pretendido?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Selecione a faixa que melhor se encaixa no seu planejamento.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {FAIXAS_ORCAMENTO.map(faixa => {
                        const isSelected = formData.orcamentoFaixa === faixa.id;
                        return (
                          <div
                            key={faixa.id}
                            onClick={() => setFormData({ ...formData, orcamentoFaixa: faixa.id })}
                            style={{
                              padding: '0.9rem',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.92rem', color: isSelected ? '#0369a1' : '#0f172a' }}>
                                {faixa.label}
                              </strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {faixa.sub}
                              </span>
                            </div>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected ? 'none' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? '#0284c7' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff'
                            }}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {formData.orcamentoFaixa === 'outro_valor' && (
                      <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', marginBottom: '0.35rem' }}>
                          Informe o valor desejado (R$):
                        </label>
                        <input 
                          type="number"
                          placeholder="Ex: 1200"
                          value={formData.orcamentoValor}
                          onChange={e => setFormData({ ...formData, orcamentoValor: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '1rem',
                            fontWeight: '700'
                          }}
                        />
                      </div>
                    )}

                    {/* Incluir condomínio e IPTU */}
                    <div style={{ padding: '0.9rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.incluiCondominioIptu}
                          onChange={e => setFormData({ ...formData, incluiCondominioIptu: e.target.checked })}
                          style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                        />
                        <span>O orçamento acima já deve contemplar condomínio e IPTU</span>
                      </label>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginLeft: '2rem', marginTop: '0.2rem' }}>
                        Facilita encontrarmos imóveis onde o custo total caiba exatamente no seu bolso.
                      </span>
                    </div>
                  </div>
                )}

                {/* ============================================================
                    ETAPA 4: Quais características são importantes?
                   ============================================================ */}
                {currentStep === 4 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      Quais características são importantes?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Diga-nos o que é indispensável e o que você gostaria de ter.
                    </p>

                    {/* Cômodos básicos */}
                    {!isCommercialSelected && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {/* Quartos */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                            Mínimo de Quartos:
                          </label>
                          <select
                            value={formData.quartos}
                            onChange={e => setFormData({ ...formData, quartos: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          >
                            <option value="1">1 Quarto</option>
                            <option value="2">2 Quartos</option>
                            <option value="3">3 Quartos</option>
                            <option value="4">4 ou mais Quartos</option>
                          </select>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox"
                              checked={formData.quartosIndispensavel}
                              onChange={e => setFormData({ ...formData, quartosIndispensavel: e.target.checked })}
                            />
                            Indispensável
                          </label>
                        </div>

                        {/* Banheiros */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                            Banheiros:
                          </label>
                          <select
                            value={formData.banheiros}
                            onChange={e => setFormData({ ...formData, banheiros: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          >
                            <option value="1">1 Banheiro</option>
                            <option value="2">2 Banheiros</option>
                            <option value="3">3+ Banheiros</option>
                          </select>
                        </div>

                        {/* Vagas */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                            Vagas de Garagem:
                          </label>
                          <select
                            value={formData.vagas}
                            onChange={e => setFormData({ ...formData, vagas: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          >
                            <option value="0">Não preciso</option>
                            <option value="1">1 Vaga</option>
                            <option value="2">2 Vagas</option>
                            <option value="3">3+ Vagas</option>
                          </select>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox"
                              checked={formData.vagasIndispensavel}
                              onChange={e => setFormData({ ...formData, vagasIndispensavel: e.target.checked })}
                            />
                            Indispensável
                          </label>
                        </div>
                      </div>
                    )}

                    {isCommercialSelected && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                          Ramo / Atividade Comercial prevista:
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ex: Loja de roupas, consultório odontológico, advocacia, distribuidora..."
                          value={formData.atividadeComercial}
                          onChange={e => setFormData({ ...formData, atividadeComercial: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    )}

                    {/* Lista de Recursos (Indispensável vs Preferência) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                        Selecione outros diferenciais importantes:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(isCommercialSelected ? CARACTERISTICAS_COMERCIAIS : CARACTERISTICAS_RESIDENCIAIS).map(feat => {
                          const Icon = feat.icon;
                          const isIndispensavel = formData.caracteristicasIndispensaveis.includes(feat.label);
                          const isDesejavel = formData.caracteristicasDesejaveis.includes(feat.label);

                          return (
                            <div 
                              key={feat.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: isIndispensavel ? '#fef3c7' : (isDesejavel ? '#f0f9ff' : '#ffffff')
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Icon size={16} style={{ color: '#0284c7' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: isIndispensavel || isDesejavel ? '700' : '500', color: '#0f172a' }}>
                                  {feat.label}
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeature(feat.label, 'desejavel')}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    border: isDesejavel ? '1px solid #0284c7' : '1px solid #cbd5e1',
                                    backgroundColor: isDesejavel ? '#0284c7' : '#ffffff',
                                    color: isDesejavel ? '#ffffff' : '#64748b',
                                    fontSize: '0.72rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isDesejavel ? '✓ Desejável' : '+ Desejável'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeature(feat.label, 'indispensavel')}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    border: isIndispensavel ? '1px solid #d97706' : '1px solid #cbd5e1',
                                    backgroundColor: isIndispensavel ? '#d97706' : '#ffffff',
                                    color: isIndispensavel ? '#ffffff' : '#64748b',
                                    fontSize: '0.72rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isIndispensavel ? '★ Indispensável' : '+ Indispensável'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================
                    ETAPA 5: Quando você precisa do imóvel?
                   ============================================================ */}
                {currentStep === 5 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      Quando você precisa do imóvel?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Nosso time prioriza atendimentos conforme sua necessidade de mudança.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {PRAZOS_URGENCIA.map(item => {
                        const isSelected = formData.urgencia === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setFormData({ ...formData, urgencia: item.id })}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Clock size={20} style={{ color: isSelected ? '#0284c7' : '#94a3b8' }} />
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.95rem', color: isSelected ? '#0369a1' : '#0f172a' }}>
                                  {item.label}
                                </strong>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {item.desc}
                                </span>
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#64748b'
                            }}>
                              {item.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ============================================================
                    ETAPA 6: Conte um pouco mais
                   ============================================================ */}
                {currentStep === 6 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      Existe alguma característica especial que você gostaria que seu próximo imóvel tivesse?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Conte livremente tudo o que é importante para você, sua família ou sua empresa.
                    </p>

                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                      <textarea
                        rows={6}
                        placeholder="Ex: Gostaria de um lugar silencioso, com bastante luz natural pela manhã, armários na cozinha e fácil acesso para idosos..."
                        value={formData.observacoes}
                        onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* Botão Gravar Áudio */}
                      <button
                        type="button"
                        onClick={toggleRecording}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: isRecording ? '#ef4444' : '#f1f5f9',
                          color: isRecording ? '#ffffff' : '#334155',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Fale ao invés de digitar"
                      >
                        {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                        {isRecording ? 'Gravando... Clique p/ parar' : 'Falar por Áudio'}
                      </button>
                    </div>

                    {recognitionError && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginBottom: '0.75rem' }}>
                        {recognitionError}
                      </span>
                    )}

                    <div style={{ backgroundColor: '#f0f9ff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.8rem', color: '#0369a1' }}>
                      💡 <strong>Dica da Araújo Imóveis:</strong> Quanto mais detalhes você nos der, mais rápido encontraremos o imóvel perfeito para você!
                    </div>
                  </div>
                )}

                {/* ============================================================
                    ETAPA 7: Como podemos falar com você?
                   ============================================================ */}
                {currentStep === 7 && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                      Como podemos falar com você?
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Solicitamos apenas os dados necessários para enviar as opções selecionadas. Não pedimos documentos agora.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                          Seu Nome Completo: *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                          <input 
                            type="text" 
                            required
                            placeholder="Digite seu nome"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                          Seu WhatsApp / Telefone: *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                          <input 
                            type="tel" 
                            required
                            placeholder="(33) 99999-9999"
                            value={formData.whatsapp}
                            onChange={e => handlePhoneChange(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                          Seu E-mail (opcional):
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                          <input 
                            type="email" 
                            placeholder="seuemail@exemplo.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                          Melhor horário para contato:
                        </label>
                        <select
                          value={formData.melhorHorario}
                          onChange={e => setFormData({ ...formData, melhorHorario: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.9rem',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <option value="Qualquer horário">Qualquer horário</option>
                          <option value="Manhã (08:00 às 12:00)">Manhã (08:00 às 12:00)</option>
                          <option value="Tarde (13:00 às 18:00)">Tarde (13:00 às 18:00)</option>
                          <option value="Noite (Após 18:00)">Noite (Após 18:00)</option>
                          <option value="Apenas mensagens de WhatsApp">Preferência: Apenas mensagens de WhatsApp</option>
                        </select>
                      </div>
                    </div>

                    {/* Aviso de Privacidade */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      lineHeight: '1.4'
                    }}>
                      🔒 <strong>Privacidade Garantida:</strong> Seus dados são protegidos conforme a LGPD e serão utilizados exclusivamente pelos corretores da Araújo Imóveis para encontrar e apresentar imóveis compatíveis com o seu perfil.
                    </div>
                  </div>
                )}

                {/* Navigation Buttons (Anterior / Próximo / Concluir) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.65rem 1.25rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronLeft size={16} /> Voltar
                    </button>
                  ) : <div />}

                  {currentStep < 7 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.75rem 1.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.925rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      Continuar <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.85rem 2rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Sparkles size={18} />
                      {isSubmitting ? 'Enviando...' : 'Encontrar meu imóvel'}
                    </button>
                  )}
                </div>

              </div>
            </>
          ) : (
            /* ============================================================
               TELA DE CONFIRMAÇÃO DO CADASTRO (ETAPA CONCLUÍDA)
               ============================================================ */
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '2.5rem 2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Demanda Registrada: {generatedCode}
              </span>

              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0 1rem' }}>
                Pronto! Agora deixe essa busca com a gente.
              </h2>

              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                Recebemos suas preferências. Nossa equipe irá procurar imóveis compatíveis com o seu perfil e entrar em contato quando encontrar boas oportunidades.
              </p>

              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem', marginBottom: '2rem' }}>
                Araújo Imóveis.
              </div>

              {/* Botão WhatsApp Direto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={zapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.9rem 1.75rem',
                    backgroundColor: '#25d366',
                    color: '#ffffff',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                    width: '100%',
                    maxWidth: '420px'
                  }}
                >
                  <MessageSquare size={20} /> Falar com a Imobiliária pelo WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Cadastrar outra procura ou reiniciar
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#94a3b8'
      }}>
        © {new Date().getFullYear()} Araújo Imóveis • Credibilidade começa no nome • Caratinga - MG
      </footer>
    </div>
  );
}
