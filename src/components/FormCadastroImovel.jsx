import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  User, 
  MapPin, 
  DollarSign, 
  Layers, 
  Sparkles, 
  FileText, 
  FileCheck, 
  Camera, 
  Lock, 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Video, 
  Compass,
  Upload,
  Check
} from 'lucide-react';

const DIFERENCIAIS_LIST = [
  'Piscina',
  'Área Gourmet',
  'Churrasqueira',
  'Academia',
  'Playground',
  'Quadra',
  'Portaria 24h',
  'Elevador',
  'Energia Solar',
  'Ar-condicionado',
  'Closet',
  'Escritório',
  'Lavanderia',
  'Jardim',
  'Sacada',
  'Varanda',
  'Internet Fibra',
  'Segurança 24h',
  'Câmeras',
  'Cerca Elétrica',
  'Terraço',
  'Quintal',
  'Aceita Pet',
  'Espaço Pet'
];

const DOCUMENTACAO_LIST = [
  'Possui Matrícula Individual',
  'Escritura Pública',
  'Registro em Cartório',
  'Contrato de Compra e Venda',
  'Em Inventário',
  'Imóvel Financiado / Consórcio',
  'Somente Posse',
  'Habite-se'
];

export default function FormCadastroImovel({ onBack, onSaved }) {
  const { properties = [], setProperties, profile, registerActivityLog } = useApp();

  const [loadingCep, setLoadingCep] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Initial State based on elooscrmimobiliario.com.br/cadastro-imovel
  const [formData, setFormData] = useState({
    // 1. Dados do Proprietário
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',

    // 2. Informações do Imóvel
    codigo: '',
    tipo: 'Casa',
    uso: 'Residencial',
    finalidade: 'Locação',
    status: 'Disponível',
    titulo: '',
    destaque: false,
    exclusividade: false,

    // 3. Localização
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Caratinga',
    estado: 'MG',
    condominio: '',
    quadra: '',
    lote: '',
    linkMaps: '',
    mostrarEnderecoExato: true,

    // 4. Valores e Negociação
    valorImovel: '',
    valorCondominio: '',
    iptuAnual: '',
    taxasExtras: '',
    mostrarValoresFicha: true,
    entradaMinima: '',
    qtdParcelas: '',
    valorParcela: '',
    comissaoPercent: '5',
    comissaoValor: '',
    aceitaFinanciamento: false,
    aceitaFgts: false,
    aceitaPermuta: false,
    aceitaVeiculo: false,
    parcelamentoDireto: false,

    // 5. Características do Imóvel
    areaTotal: '',
    areaConstruida: '',
    quartos: '',
    suites: '',
    banheiros: '',
    vagas: '',
    salas: '',
    copas: '',
    cozinhas: '',
    lavabos: '',
    porteiraFechada: false,
    conjugado: false,
    geminada: false,

    // 6. Diferenciais (Lazer e Estrutura)
    diferenciais: [],

    // 7. Descrição e Textos
    descricao: '',

    // 8. Documentação
    documentacao: [],

    // 9. Fotos e Mídias
    fotos: [],
    linkYoutube: '',
    linkTourVirtual: '',

    // 10. Documentos Internos (Privado)
    observacoesInternas: '',
    aceitouTermos: true
  });

  // Auto-generate code
  useEffect(() => {
    const nextNumber = (properties?.length || 0) + 1;
    const generated = `IM-${String(nextNumber).padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, codigo: generated }));
  }, [properties]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto calculate commission value if valorImovel or comissaoPercent changes
      if (field === 'valorImovel' || field === 'comissaoPercent') {
        const valNum = parseFloat(String(field === 'valorImovel' ? value : updated.valorImovel).replace(/\D/g, '')) || 0;
        const comPerc = parseFloat(String(field === 'comissaoPercent' ? value : updated.comissaoPercent)) || 0;
        if (valNum > 0 && comPerc > 0) {
          const comTotal = (valNum * comPerc) / 100;
          updated.comissaoValor = `R$ ${comTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }

      // Auto calculate installment value if qtdParcelas and valorImovel/entradaMinima
      if (field === 'qtdParcelas' || field === 'entradaMinima' || field === 'valorImovel') {
        const valNum = parseFloat(String(updated.valorImovel).replace(/\D/g, '')) || 0;
        const entNum = parseFloat(String(updated.entradaMinima).replace(/\D/g, '')) || 0;
        const parcQtd = parseInt(updated.qtdParcelas, 10) || 0;
        if (parcQtd > 0 && valNum > entNum) {
          const saldo = valNum - entNum;
          const parcela = saldo / parcQtd;
          updated.valorParcela = `R$ ${parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }

      return updated;
    });
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  // CEP Lookup via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = (formData.cep || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Generate Google Maps link automatically from address
  const handleGenerateMapsLink = () => {
    const query = `${formData.endereco || ''}, ${formData.numero || ''} - ${formData.bairro || ''}, ${formData.cidade || 'Caratinga'} - ${formData.estado || 'MG'}`.trim();
    if (query) {
      const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      handleChange('linkMaps', link);
    }
  };

  // Photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          fotos: [...(prev.fotos || []), event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      fotos: (prev.fotos || []).filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleSetMainPhoto = (idxToMain) => {
    setFormData(prev => {
      const current = [...(prev.fotos || [])];
      const [chosen] = current.splice(idxToMain, 1);
      return {
        ...prev,
        fotos: [chosen, ...current]
      };
    });
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nomeProprietario?.trim()) {
      setErrorToast('Por favor, informe o Nome Completo do Proprietário.');
      return;
    }

    if (!formData.tipo?.trim()) {
      setErrorToast('Por favor, selecione o Tipo do Imóvel.');
      return;
    }

    const newProperty = {
      id: `prop_${Date.now()}`,
      title: formData.titulo || `${formData.tipo} - ${formData.bairro || 'Caratinga'}`,
      code: formData.codigo,
      address: `${formData.endereco || ''}, ${formData.numero || ''} ${formData.bairro || ''}`.trim(),
      shortAddress: `${formData.bairro || ''}, ${formData.cidade || 'Caratinga'}`.trim(),
      photo: formData.fotos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop',
      status: formData.status || 'Disponível',
      ownerName: formData.nomeProprietario,
      ownerPhone: formData.telefoneProprietario,
      rentValue: parseFloat(String(formData.valorImovel).replace(/\D/g, '')) || 0,
      condominiumValue: parseFloat(String(formData.valorCondominio).replace(/\D/g, '')) || 0,
      iptuValue: parseFloat(String(formData.iptuAnual).replace(/\D/g, '')) || 0,
      createdAt: new Date().toISOString(),
      details: { ...formData }
    };

    // Save in context & localStorage
    if (typeof setProperties === 'function') {
      setProperties(prev => [newProperty, ...(prev || [])]);
    }

    // Save in standalone list for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('araujo_imoveis_cadastrados') || '[]');
      localStorage.setItem('araujo_imoveis_cadastrados', JSON.stringify([newProperty, ...existing]));
    } catch (err) {
      console.error("Erro ao salvar imóvel localmente:", err);
    }

    if (typeof registerActivityLog === 'function') {
      registerActivityLog(profile?.name || 'Corretor', `Cadastrou o imóvel ${newProperty.code}: ${newProperty.title}`);
    }

    setSuccessToast(`Imóvel ${newProperty.code} cadastrado com sucesso!`);
    setTimeout(() => {
      if (onSaved) onSaved(newProperty);
      else if (onBack) onBack();
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Toast Notificações */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '0.9rem 1.8rem',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.45)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '700',
          fontSize: '1.05rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <CheckCircle2 size={24} style={{ color: '#ffffff' }} />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '0.9rem 1.8rem',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.45)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '700',
          fontSize: '0.95rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <AlertCircle size={22} style={{ color: '#ffffff' }} />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} /> Voltar para Lista
          </button>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building style={{ color: 'var(--accent-cyan)' }} size={26} />
            Cadastrar Novo Imóvel
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Cadastro completo de dados, localização, valores, fotos e documentação (padrão Eloos CRM).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
          >
            <Save size={16} /> Salvar Imóvel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ============================================================
            1. DADOS DO PROPRIETÁRIO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <User size={18} /> 1. Dados do Proprietário
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Nome Completo do Proprietário:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nome do dono do imóvel"
                value={formData.nomeProprietario} 
                onChange={e => handleChange('nomeProprietario', e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Telefone / WhatsApp:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="(37) 00000-0000"
                value={formData.telefoneProprietario} 
                onChange={e => handleChange('telefoneProprietario', e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            2. INFORMAÇÕES DO IMÓVEL
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Building size={18} /> 2. Informações do Imóvel
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Código (Automático):</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.codigo} 
                onChange={e => handleChange('codigo', e.target.value)} 
                style={{ fontWeight: '700', color: 'var(--accent-cyan)' }} 
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Tipo:</label>
              <select 
                className="form-input" 
                value={formData.tipo} 
                onChange={e => handleChange('tipo', e.target.value)}
              >
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Fazenda">Fazenda</option>
                <option value="Empresa / Galpão">Empresa / Galpão</option>
                <option value="Lote/Terreno">Lote/Terreno</option>
                <option value="Comercial">Comercial</option>
                <option value="Chácara/Sítio">Chácara/Sítio</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Sobrado">Sobrado</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Uso:</label>
              <select 
                className="form-input" 
                value={formData.uso} 
                onChange={e => handleChange('uso', e.target.value)}
              >
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Residencial ou comercial">Residencial ou comercial</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Finalidade:</label>
              <select 
                className="form-input" 
                value={formData.finalidade} 
                onChange={e => handleChange('finalidade', e.target.value)}
              >
                <option value="Locação">Locação</option>
                <option value="Venda">Venda</option>
                <option value="Venda e Locação">Venda e Locação</option>
                <option value="Permuta">Permuta</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status:</label>
              <select 
                className="form-input" 
                value={formData.status} 
                onChange={e => handleChange('status', e.target.value)}
              >
                <option value="Disponível">Disponível</option>
                <option value="Em Negociação">Em Negociação</option>
                <option value="Vendido/Alugado">Vendido/Alugado</option>
                <option value="Pausado">Pausado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Título do Anúncio (Opcional):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Casa de alto padrão com piscina em Interlagos"
                value={formData.titulo} 
                onChange={e => handleChange('titulo', e.target.value)} 
              />
            </div>

            <div className="form-group span-2" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.destaque} 
                  onChange={e => handleChange('destaque', e.target.checked)} 
                />
                <span>Imóvel em Destaque</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.exclusividade} 
                  onChange={e => handleChange('exclusividade', e.target.checked)} 
                />
                <span>Exclusividade</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. LOCALIZAÇÃO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <MapPin size={18} /> 3. Localização
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>CEP:</span>
                <a 
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                >
                  Não sei o CEP ↗
                </a>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Apenas números..."
                  value={formData.cep} 
                  onChange={e => handleChange('cep', e.target.value)} 
                  onBlur={handleCepBlur}
                />
                {loadingCep && (
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                    Buscando...
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Endereço:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Rua, Avenida, Praça..."
                value={formData.endereco} 
                onChange={e => handleChange('endereco', e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: 120 ou S/N"
                value={formData.numero} 
                onChange={e => handleChange('numero', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Bairro:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nome do bairro"
                value={formData.bairro} 
                onChange={e => handleChange('bairro', e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cidade:</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.cidade} 
                onChange={e => handleChange('cidade', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado:</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.estado} 
                onChange={e => handleChange('estado', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condomínio / Edifício:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nome do condomínio (opcional)"
                value={formData.condominio} 
                onChange={e => handleChange('condominio', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quadra / Lote:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Quadra"
                  value={formData.quadra} 
                  onChange={e => handleChange('quadra', e.target.value)} 
                />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Lote"
                  value={formData.lote} 
                  onChange={e => handleChange('lote', e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group span-2">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Link Google Maps / Waze:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={handleGenerateMapsLink}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    title="Preenche o link do Maps automaticamente com o endereço digitado"
                  >
                    Gerar Auto.
                  </button>
                  {formData.linkMaps && (
                    <a 
                      href={formData.linkMaps} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      Abrir no Maps ↗
                    </a>
                  )}
                </div>
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Cole aqui o link do Google Maps ou gere automaticamente..."
                value={formData.linkMaps} 
                onChange={e => handleChange('linkMaps', e.target.value)} 
              />
            </div>

            <div className="form-group span-2" style={{ paddingTop: '0.25rem' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.mostrarEnderecoExato} 
                  onChange={e => handleChange('mostrarEnderecoExato', e.target.checked)} 
                />
                <span>Mostrar Endereço Exato na Ficha (Para Parceiros/Clientes)</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            4. VALORES E NEGOCIAÇÃO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <DollarSign size={18} /> 4. Valores e Negociação
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Valor do Imóvel / Aluguel (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: R$ 2.500,00 ou 250000"
                value={formData.valorImovel} 
                onChange={e => handleChange('valorImovel', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condomínio (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.valorCondominio} 
                onChange={e => handleChange('valorCondominio', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">IPTU Anual (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.iptuAnual} 
                onChange={e => handleChange('iptuAnual', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Taxas Extras (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.taxasExtras} 
                onChange={e => handleChange('taxasExtras', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entrada Mínima (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="R$ 0,00"
                value={formData.entradaMinima} 
                onChange={e => handleChange('entradaMinima', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qtd. Parcelas & Valor da Parcela:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ex: 12"
                  value={formData.qtdParcelas} 
                  onChange={e => handleChange('qtdParcelas', e.target.value)} 
                />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Calculado auto."
                  value={formData.valorParcela} 
                  onChange={e => handleChange('valorParcela', e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comissão (%):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: 5 ou 6"
                value={formData.comissaoPercent} 
                onChange={e => handleChange('comissaoPercent', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comissão (R$):</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Calculado auto."
                value={formData.comissaoValor} 
                onChange={e => handleChange('comissaoValor', e.target.value)} 
              />
            </div>

            <div className="form-group span-2" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaFinanciamento} 
                  onChange={e => handleChange('aceitaFinanciamento', e.target.checked)} 
                />
                <span>Aceita Financiamento</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaFgts} 
                  onChange={e => handleChange('aceitaFgts', e.target.checked)} 
                />
                <span>Aceita FGTS</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaPermuta} 
                  onChange={e => handleChange('aceitaPermuta', e.target.checked)} 
                />
                <span>Aceita Permuta</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.aceitaVeiculo} 
                  onChange={e => handleChange('aceitaVeiculo', e.target.checked)} 
                />
                <span>Aceita Veículo</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.parcelamentoDireto} 
                  onChange={e => handleChange('parcelamentoDireto', e.target.checked)} 
                />
                <span>Parcelamento direto com proprietário</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            5. CARACTERÍSTICAS DO IMÓVEL
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Layers size={18} /> 5. Características do Imóvel
          </h3>
          <div className="form-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="form-group">
              <label className="form-label">Área Total (m²):</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 250"
                value={formData.areaTotal} 
                onChange={e => handleChange('areaTotal', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Área Constr. (m²):</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 180"
                value={formData.areaConstruida} 
                onChange={e => handleChange('areaConstruida', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quartos:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 3"
                value={formData.quartos} 
                onChange={e => handleChange('quartos', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Suítes:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.suites} 
                onChange={e => handleChange('suites', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banheiros:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 2"
                value={formData.banheiros} 
                onChange={e => handleChange('banheiros', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vagas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 2"
                value={formData.vagas} 
                onChange={e => handleChange('vagas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.salas} 
                onChange={e => handleChange('salas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Copas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.copas} 
                onChange={e => handleChange('copas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cozinhas:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.cozinhas} 
                onChange={e => handleChange('cozinhas', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lavabos:</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 1"
                value={formData.lavabos} 
                onChange={e => handleChange('lavabos', e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={formData.porteiraFechada} 
                onChange={e => handleChange('porteiraFechada', e.target.checked)} 
              />
              <span>Imóvel 100% Mobiliado (Porteira Fechada)</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={formData.conjugado} 
                onChange={e => handleChange('conjugado', e.target.checked)} 
              />
              <span>Conjugado</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={formData.geminada} 
                onChange={e => handleChange('geminada', e.target.checked)} 
              />
              <span>Geminada</span>
            </label>
          </div>
        </div>

        {/* ============================================================
            6. DIFERENCIAIS (LAZER E ESTRUTURA)
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Sparkles size={18} /> 6. Diferenciais (Lazer e Estrutura)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
            Clique sobre os itens presentes no imóvel para adicioná-los à ficha e anúncios:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {DIFERENCIAIS_LIST.map((item) => {
              const selected = (formData.diferenciais || []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleArrayItem('diferenciais', item)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    backgroundColor: selected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    border: selected ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                  }}
                >
                  {selected && <Check size={13} />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            7. DESCRIÇÃO E TEXTOS
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <FileText size={18} /> 7. Descrição e Textos
          </h3>
          <div className="form-group">
            <label className="form-label">Descrição Completa:</label>
            <textarea 
              rows={5}
              className="form-input" 
              placeholder="Texto detalhado do imóvel (destaques, localização, acabamentos, iluminação, ventilação, condições de locação ou venda)..."
              value={formData.descricao} 
              onChange={e => handleChange('descricao', e.target.value)} 
            />
          </div>
        </div>

        {/* ============================================================
            8. DOCUMENTAÇÃO
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <FileCheck size={18} /> 8. Documentação
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {DOCUMENTACAO_LIST.map((doc) => {
              const checked = (formData.documentacao || []).includes(doc);
              return (
                <label 
                  key={doc} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: checked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: checked ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--glass-border)'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={checked} 
                    onChange={() => toggleArrayItem('documentacao', doc)} 
                  />
                  <span style={{ fontSize: '0.85rem', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: checked ? '600' : 'normal' }}>
                    {doc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            9. FOTOS E MÍDIAS
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Camera size={18} /> 9. Fotos e Mídias
          </h3>

          <div style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'border-color 0.2s ease'
          }}>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              id="upload-fotos-imovel"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload} 
            />
            <label htmlFor="upload-fotos-imovel" style={{ cursor: 'pointer', display: 'block' }}>
              <Upload size={36} style={{ color: 'var(--accent-cyan)', margin: '0 auto 0.75rem auto' }} />
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                Anexar Fotos do Imóvel
              </strong>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                Arraste as imagens aqui ou clique para selecionar fotos do seu dispositivo (JPEG, PNG, WebP)
              </span>
            </label>
          </div>

          {/* Galeria de Fotos */}
          {(formData.fotos || []).length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Fotos carregadas ({(formData.fotos || []).length}): primeira imagem é a foto principal
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {(formData.fotos || []).map((photoUrl, idx) => (
                  <div key={idx} style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: idx === 0 ? '2px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}>
                    <img 
                      src={photoUrl} 
                      alt={`Foto ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {idx === 0 && (
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        backgroundColor: 'var(--accent-cyan)',
                        color: '#000000',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        PRINCIPAL
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
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
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetMainPhoto(idx)}
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          fontSize: '0.65rem',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Tornar foto principal"
                      >
                        Definir Capa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links de Mídia Adicionais */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Video size={14} style={{ color: '#ef4444' }} /> Link YouTube (Vídeo do Imóvel):
              </label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://youtube.com/watch?v=..."
                value={formData.linkYoutube} 
                onChange={e => handleChange('linkYoutube', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={14} style={{ color: 'var(--accent-cyan)' }} /> Link Tour Virtual 360º:
              </label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://matterport.com/... ou link 360"
                value={formData.linkTourVirtual} 
                onChange={e => handleChange('linkTourVirtual', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            10. DOCUMENTOS INTERNOS / OBSERVAÇÕES (PRIVADO)
           ============================================================ */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={sectionHeaderStyle}>
            <Lock size={18} /> 10. Documentos Internos (Privado)
          </h3>
          <div className="form-group">
            <label className="form-label">Observações Internas (Não visíveis para clientes):</label>
            <textarea 
              rows={3}
              className="form-input" 
              placeholder="Anotações de negociação, restrições com proprietário, contato do porteiro, histórico..."
              value={formData.observacoesInternas} 
              onChange={e => handleChange('observacoesInternas', e.target.value)} 
            />
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: '700', fontSize: '1rem' }}
          >
            <Save size={18} /> Salvar Imóvel
          </button>
        </div>
      </form>
    </div>
  );
}

const sectionHeaderStyle = {
  fontSize: '1.15rem',
  marginBottom: '1.25rem',
  color: 'var(--accent-cyan)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--glass-border)',
  paddingBottom: '0.75rem'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  fontWeight: '500'
};
