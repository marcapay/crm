import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

// Mock Initial Data (Cleared/Empty)
const initialClients = [];

const initialKanbanCards = [];

const initialChats = {};

const initialQuickLinks = [];

const initialProfile = {
  name: 'Admin User',
  email: 'admin@admin.com',
  role: 'Administrador',
  phone: '',
  instagram: '',
  pix: '',
  paymentAccount: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  password: 'admin',
  notifications: true,
  autoReply: true,
  integrations: {
    whatsapp: true,
    webhook: false,
    databaseSync: true,  }
};

// Portal Initial Mock Data (Araújo Imóveis Seed Data)
const initialPortalUsers = [
  {
    id: 'user_admin_1',
    name: 'Ricardo Araújo',
    email: 'admin@araujo.com',
    role: 'Administrador',
    phone: '(37) 99988-1122',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face',
    password: 'admin'
  },
  {
    id: 'user_corretor_1',
    name: 'Fernanda Lima',
    email: 'corretor@araujo.com',
    role: 'Normal',
    phone: '(37) 99123-8899',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face',
    password: 'corretor123'
  },
  {
    id: 'user_proprietario_1',
    name: 'Carlos Eduardo Silva',
    email: 'proprietario@araujo.com',
    role: 'proprietario',
    phone: '(37) 99911-2233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    password: '123456'
  },
  {
    id: 'user_inquilino_1',
    name: 'Mariana Oliveira Costa',
    email: 'inquilino@araujo.com',
    role: 'inquilino',
    phone: '(37) 99888-4455',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
    password: '123456'
  }
];

const initialProperties = [
  {
    id: 'prop_1',
    title: 'Apartamento 302 - Edifício Horizonte',
    address: 'Rua dos Inconfidentes, 450 - Centro, Divinópolis/MG',
    shortAddress: 'Rua dos Inconfidentes, 450 - Apt 302',
    photo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
    status: 'Alugado',
    ownerId: 'user_proprietario_1',
    ownerName: 'Carlos Eduardo Silva',
    currentTenantId: 'user_inquilino_1',
    currentTenantName: 'Mariana Oliveira Costa',
    rentValue: 2000.00,
    admFeePercent: 10,
    netEstimate: 1800.00
  },
  {
    id: 'prop_2',
    title: 'Casa Residencial - Jardim Candelária',
    address: 'Av. Gabriel Passos, 1200 - Divinópolis/MG',
    shortAddress: 'Av. Gabriel Passos, 1200',
    photo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop',
    status: 'Disponível',
    ownerId: 'user_proprietario_1',
    ownerName: 'Carlos Eduardo Silva',
    currentTenantId: null,
    currentTenantName: null,
    rentValue: 3500.00,
    admFeePercent: 10,
    netEstimate: 3150.00
  }
];

const initialContracts = [
  {
    id: 'cnt_001',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    ownerId: 'user_proprietario_1',
    ownerName: 'Carlos Eduardo Silva',
    tenantId: 'user_inquilino_1',
    tenantName: 'Mariana Oliveira Costa',
    startDate: '2024-09-10',
    endDate: '2026-09-10',
    rentValue: 2000.00,
    admFeePercent: 10,
    adjustmentIndex: 'IGP-M Anual',
    dueDateDay: 10,
    status: 'Ativo',
    documents: [
      { id: 'doc_1', title: 'Contrato de Locação Assinado.pdf', type: 'Locação', date: '10/09/2024', size: '2.4 MB', url: '#' },
      { id: 'doc_2', title: 'Vistoria de Entrada com Fotos.pdf', type: 'Vistoria', date: '08/09/2024', size: '14.8 MB', url: '#' },
      { id: 'doc_3', title: 'Contrato de Administração Imobiliária.pdf', type: 'Administração', date: '01/09/2024', size: '1.8 MB', url: '#' }
    ]
  }
];

const initialFinancialRecords = [
  {
    id: 'fin_202609',
    contractId: 'cnt_001',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    ownerId: 'user_proprietario_1',
    tenantId: 'user_inquilino_1',
    competence: 'Setembro / 2026',
    dueDate: '10/09/2026',
    grossRent: 2000.00,
    admFee: 200.00,
    maintenanceDeductions: 0.00,
    maintenanceReason: null,
    netRepasse: 1800.00,
    predictedRepasseDate: '15/09/2026',
    effectiveRepasseDate: null,
    payoutAccount: 'Banco Itaú - Ag 1234 C/C 56789-0 (PIX: carlos.silva@email.com)',
    tenantStatus: 'Aguardando pagamento',
    tenantPaymentDate: null,
    ownerStatus: 'Pendente',
    receiptUrl: null,
    boletoBarCode: '34191.79001 01043.510047 91020.150008 5 98120000200000',
    pixKey: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654052000.005802BR5920Araujo Imoveis Ltda6011Divinopolis62070503***6304E2D1'
  },
  {
    id: 'fin_202608',
    contractId: 'cnt_001',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    ownerId: 'user_proprietario_1',
    tenantId: 'user_inquilino_1',
    competence: 'Agosto / 2026',
    dueDate: '10/08/2026',
    grossRent: 2000.00,
    admFee: 200.00,
    maintenanceDeductions: 150.00,
    maintenanceReason: 'Manutenção autorizada (Troca da torneira do banheiro)',
    netRepasse: 1650.00,
    predictedRepasseDate: '15/08/2026',
    effectiveRepasseDate: '15/08/2026',
    payoutAccount: 'Banco Itaú - Ag 1234 C/C 56789-0 (PIX: carlos.silva@email.com)',
    tenantStatus: 'Pago',
    tenantPaymentDate: '09/08/2026',
    ownerStatus: 'Pago',
    receiptUrl: '#',
    boletoBarCode: '34191.79001 01043.510047 91020.150008 5 98120000200000',
    pixKey: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654052000.005802BR5920Araujo Imoveis Ltda6011Divinopolis62070503***6304E2D1'
  },
  {
    id: 'fin_202607',
    contractId: 'cnt_001',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    ownerId: 'user_proprietario_1',
    tenantId: 'user_inquilino_1',
    competence: 'Julho / 2026',
    dueDate: '10/07/2026',
    grossRent: 2000.00,
    admFee: 200.00,
    maintenanceDeductions: 0.00,
    maintenanceReason: null,
    netRepasse: 1800.00,
    predictedRepasseDate: '15/07/2026',
    effectiveRepasseDate: '15/07/2026',
    payoutAccount: 'Banco Itaú - Ag 1234 C/C 56789-0',
    tenantStatus: 'Pago',
    tenantPaymentDate: '10/07/2026',
    ownerStatus: 'Pago',
    receiptUrl: '#'
  },
  {
    id: 'fin_202606',
    contractId: 'cnt_001',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    ownerId: 'user_proprietario_1',
    tenantId: 'user_inquilino_1',
    competence: 'Junho / 2026',
    dueDate: '10/06/2026',
    grossRent: 2000.00,
    admFee: 200.00,
    maintenanceDeductions: 0.00,
    maintenanceReason: null,
    netRepasse: 1800.00,
    predictedRepasseDate: '15/06/2026',
    effectiveRepasseDate: '15/06/2026',
    payoutAccount: 'Banco Itaú - Ag 1234 C/C 56789-0',
    tenantStatus: 'Pago',
    tenantPaymentDate: '08/06/2026',
    ownerStatus: 'Pago',
    receiptUrl: '#'
  }
];

const initialMaintenanceRequests = [
  {
    id: 'maint_001',
    protocol: 'MAN-000342',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    tenantId: 'user_inquilino_1',
    tenantName: 'Mariana Oliveira Costa',
    ownerId: 'user_proprietario_1',
    ownerName: 'Carlos Eduardo Silva',
    title: 'Vazamento na pia da cozinha',
    category: 'Hidráulica',
    description: 'Percebi um gotejamento constante no sifão embaixo da pia da cozinha que está molhando o armário de madeira.',
    requestDate: '12/08/2026 14:20',
    status: 'Aguardando proprietário',
    budgetValue: 350.00,
    budgetSupplier: 'José Serviços Hidráulicos',
    budgetDetails: 'Troca do sifão flexível e reparo no engate rápido com fornecimento de peças.',
    decision: null,
    decisionDate: null,
    scheduledDate: '21/08/2026',
    scheduledTime: '14h às 16h',
    attachments: [
      { name: 'foto_vazamento_1.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop' }
    ]
  },
  {
    id: 'maint_002',
    protocol: 'MAN-000289',
    propertyId: 'prop_1',
    propertyName: 'Apartamento 302 - Edifício Horizonte',
    tenantId: 'user_inquilino_1',
    tenantName: 'Mariana Oliveira Costa',
    ownerId: 'user_proprietario_1',
    ownerName: 'Carlos Eduardo Silva',
    title: 'Troca da torneira do banheiro',
    category: 'Hidráulica',
    description: 'Torneira espanada com vazamento.',
    requestDate: '15/07/2026 09:10',
    status: 'Concluído',
    budgetValue: 150.00,
    budgetSupplier: 'José Serviços',
    decision: 'AUTORIZADO',
    decisionDate: '15/07/2026 11:30',
    scheduledDate: '17/07/2026',
    scheduledTime: '10h',
    attachments: []
  }
];

const initialPortalMessages = [
  {
    id: 'msg_1',
    senderRole: 'imobiliaria',
    senderName: 'Equipe Araújo Imóveis',
    recipientRole: 'proprietario',
    recipientId: 'user_proprietario_1',
    subject: 'Solicitação de Autorização de Manutenção',
    body: 'Prezado Carlos, identificamos uma solicitação de manutenção para o Apt 302 (Vazamento na cozinha). O orçamento do prestador é R$ 350,00. Por favor, acesse a aba de Manutenções para Autorizar ou Recusar.',
    date: '12/08/2026 14:35',
    read: false
  },
  {
    id: 'msg_2',
    senderRole: 'imobiliaria',
    senderName: 'Equipe Araújo Imóveis',
    recipientRole: 'inquilino',
    recipientId: 'user_inquilino_1',
    subject: 'Acompanhamento do Chamado MAN-000342',
    body: 'Olá Mariana! Sua solicitação de manutenção foi recebida e encaminhada ao proprietário para validação do orçamento. Manteremos você informada por aqui.',
    date: '12/08/2026 14:30',
    read: true
  }
];

const initialActivityLogs = [
  { id: 'act_1', timestamp: '19/08/2026 09:20', userName: 'Carlos Eduardo (Proprietário)', action: 'Visualizou o demonstrativo financeiro de Agosto/2026' },
  { id: 'act_2', timestamp: '15/08/2026 10:15', userName: 'Mariana Costa (Inquilino)', action: 'Visualizou o boleto com vencimento em 10/09/2026' },
  { id: 'act_3', timestamp: '12/08/2026 14:20', userName: 'Mariana Costa (Inquilino)', action: 'Abriu solicitação de manutenção MAN-000342 (Vazamento na cozinha)' }
];

const safeJsonParse = (str, fallback) => {
  try {
    if (!str) return fallback;
    return JSON.parse(str);
  } catch (e) {
    console.error("Failed to parse JSON from localStorage:", e);
    return fallback;
  }
};

export const AppProvider = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('eloos_auth');
    return saved === 'true';
  });

  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('eloos_theme');
    return saved || 'dark';
  });


  // Current Active Module
  const [activeModule, setActiveModule] = useState('dashboard');
  
  // Active Chat Session Client ID
  const [activeChatClientId, setActiveChatClientId] = useState(null);
  const isSyncingRef = useRef(false);

  // Initialize pipelines and columns state with Araújo Imóveis defaults
  useEffect(() => {
    try {
      const defaultPipelines = [
        { id: 'pipe_novo_lead', name: 'Novo Lead / Qualificação' },
        { id: 'pipe_interesse', name: 'Interesse / Oportunidade' },
        { id: 'pipe_negociacao', name: 'Negociação / Fechamento' }
      ];

      const defaultColumns = [
        { id: 'col_novo_lead', pipelineId: 'pipe_novo_lead', name: 'Novos Leads', color: '#38bdf8' },
        { id: 'col_em_qualificacao', pipelineId: 'pipe_novo_lead', name: 'Em Qualificação', color: '#f59e0b' },
        { id: 'col_qualificado', pipelineId: 'pipe_novo_lead', name: 'Qualificado / Agendado', color: '#10b981' },

        { id: 'col_imoveis_selecionados', pipelineId: 'pipe_interesse', name: 'Imóveis Selecionados', color: '#a855f7' },
        { id: 'col_visita_agendada', pipelineId: 'pipe_interesse', name: 'Visita Agendada / Realizada', color: '#38bdf8' },
        { id: 'col_proposta_enviada', pipelineId: 'pipe_interesse', name: 'Proposta Enviada', color: '#f59e0b' },

        { id: 'col_em_negociacao', pipelineId: 'pipe_negociacao', name: 'Em Negociação', color: '#3b82f6' },
        { id: 'col_documentacao', pipelineId: 'pipe_negociacao', name: 'Documentação & Análise', color: '#8b5cf6' },
        { id: 'col_contrato_fechado', pipelineId: 'pipe_negociacao', name: 'Contrato Assinado / Fechado', color: '#10b981' }
      ];

      const savedPipes = localStorage.getItem('crmbase_pipelines');
      if (!savedPipes || JSON.parse(savedPipes).length === 0) {
        localStorage.setItem('crmbase_pipelines', JSON.stringify(defaultPipelines));
      }

      const savedCols = localStorage.getItem('crmbase_columns');
      if (!savedCols || JSON.parse(savedCols).length === 0) {
        localStorage.setItem('crmbase_columns', JSON.stringify(defaultColumns));
      }

      // Clean up legacy welcome message with hardcoded options
      const oldWelcome1 = 'Olá, seja bem-vindo! Escolha seu atendimento:\n\n' +
        '1 - Suporte para Corretores e Parceiros\n' +
        '2 - Líder da Secretaria de Vendas\n' +
        '3 - Pagamentos de Corretores';
      const oldWelcome2 = 'Olá, seja bem-vindo! Escolha seu atendimento:\n\n' +
        '1 - Suporte para Corretores e Parceiros\n' +
        '2 - Lider da Secretaria de Vendas\n' +
        '3 - Pagamentos de Corretores';
      const oldWelcome3 = 'Olá! Seja bem-vindo.\n\n' +
        '1 - Suporte para Corretores e Parceiros\n' +
        '2 - Líder da Secretaria de Vendas\n' +
        '3 - Pagamentos de Corretores';

      const currentWelcome = localStorage.getItem('crmbase_sdr_welcome');
      if (!currentWelcome || currentWelcome === oldWelcome1 || currentWelcome === oldWelcome2 || currentWelcome === oldWelcome3) {
        localStorage.setItem('crmbase_sdr_welcome', 'Olá, seja bem-vindo! Escolha seu atendimento:');
      }
    } catch (e) {}
  }, []);

  // Core Data Lists
  const [clients, setRawClients] = useState(() => {
    const saved = localStorage.getItem('eloos_clients');
    const list = safeJsonParse(saved, initialClients);
    
    // Ensure all clients have agent fields initialized
    const initialized = list.map(c => ({
      empreendimento: c.empreendimento || "Todos",
      situacaoComercial: c.situacaoComercial || "Interessado",
      dataVisita: c.dataVisita || "",
      propostaRegistrada: c.propostaRegistrada || false,
      contratoConfirmado: c.contratoConfirmado || false,
      historicoAtividades: c.historicoAtividades || [],
      camposPersonalizados: c.camposPersonalizados || {},
      interesseDemonstrado: c.interesseDemonstrado || false,
      ...c
    }));

    // Deduplicate list on initialization and filter out duplicates by phone suffix and name
    const unique = [];
    const seenSuffixes = new Set();
    const seenNames = new Set();
    
    const sorted = [...initialized].sort((a, b) => {
      const aIsLid = a.phone && a.phone.length > 12 && (a.phone.startsWith('2') || a.jid?.endsWith('@lid'));
      const bIsLid = b.phone && b.phone.length > 12 && (b.phone.startsWith('2') || b.jid?.endsWith('@lid'));
      if (aIsLid && !bIsLid) return 1;
      if (!aIsLid && bIsLid) return -1;
      if (a.jid && !b.jid) return -1;
      if (!a.jid && b.jid) return 1;
      const aId = a.id || '';
      const bId = b.id || '';
      return aId.localeCompare(bId);
    });

    sorted.forEach(c => {
      const cleanPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
      const suffix = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : '';
      const cleanName = c.name ? c.name.trim().toLowerCase() : '';
      
      const isRealName = (name) => {
        if (!name) return false;
        const n = name.trim().toLowerCase();
        if (n === 'você' || n === 'voce' || n === 'sistema' || n === 'contato' || n === 'admin') return false;
        if (/^\d+$/.test(n.replace(/[\s\-\+\(\)]/g, ''))) return false;
        return n.length > 2;
      };

      let duplicate = false;
      if (suffix && seenSuffixes.has(suffix)) {
        duplicate = true;
      }
      if (cleanName && isRealName(c.name) && seenNames.has(cleanName)) {
        duplicate = true;
      }

      if (!duplicate) {
        if (suffix) seenSuffixes.add(suffix);
        if (cleanName && isRealName(c.name)) seenNames.add(cleanName);
        unique.push(c);
      }
    });
    const hasSimulator = unique.some(c => c.id === 'client_teste_agente');
    if (!hasSimulator) {
      unique.unshift({
        id: 'client_teste_agente',
        name: '🤖 Chat de Teste (Simulador)',
        phone: '37900000000',
        email: 'teste@agente.simulador',
        status: 'Pessoal',
        empreendimento: 'Todos',
        situacaoComercial: 'Interessado',
        createdAt: new Date().toISOString().split('T')[0],
        isSimulator: true
      });
    }
    return unique;
  });

  const setClients = (value) => {
    setRawClients(prev => {
      const resolved = typeof value === 'function' ? value(prev) : value;
      const unique = [];
      const seenSuffixes = new Set();
      const seenNames = new Set();
      
      const sorted = [...resolved].sort((a, b) => {
        const aIsLid = a.phone && a.phone.length > 12 && (a.phone.startsWith('2') || a.jid?.endsWith('@lid'));
        const bIsLid = b.phone && b.phone.length > 12 && (b.phone.startsWith('2') || b.jid?.endsWith('@lid'));
        if (aIsLid && !bIsLid) return 1;
        if (!aIsLid && bIsLid) return -1;
        if (a.jid && !b.jid) return -1;
        if (!a.jid && b.jid) return 1;
        const aId = a.id || '';
        const bId = b.id || '';
        return aId.localeCompare(bId);
      });

      sorted.forEach(c => {
        const cleanPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
        const suffix = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : '';
        const cleanName = c.name ? c.name.trim().toLowerCase() : '';
        
        const isRealName = (name) => {
          if (!name) return false;
          const n = name.trim().toLowerCase();
          if (n === 'você' || n === 'voce' || n === 'sistema' || n === 'contato' || n === 'admin') return false;
          if (/^\d+$/.test(n.replace(/[\s\-\+\(\)]/g, ''))) return false;
          return n.length > 2;
        };

        let duplicate = false;
        if (suffix && seenSuffixes.has(suffix)) {
          duplicate = true;
        }
        if (cleanName && isRealName(c.name) && seenNames.has(cleanName)) {
          duplicate = true;
        }

        if (!duplicate) {
          if (suffix) seenSuffixes.add(suffix);
          if (cleanName && isRealName(c.name)) seenNames.add(cleanName);
          unique.push(c);
        }
      });
      const hasSimulator = unique.some(c => c.id === 'client_teste_agente');
      if (!hasSimulator) {
        unique.unshift({
          id: 'client_teste_agente',
          name: '🤖 Chat de Teste (Simulador)',
          phone: '37900000000',
          email: 'teste@agente.simulador',
          status: 'Pessoal',
          empreendimento: 'Todos',
          situacaoComercial: 'Interessado',
          createdAt: new Date().toISOString().split('T')[0],
          isSimulator: true
        });
      }
      return unique;
    });
  };

  const [kanbanCards, setKanbanCards] = useState(() => {
    const saved = localStorage.getItem('eloos_kanban');
    let cards = safeJsonParse(saved, initialKanbanCards);
    cards = cards.map(card => {
      if (card.column === 'pessoal') return { ...card, column: 'pessoal_a_fazer' };
      if (card.column === 'contabil_fiscal') return { ...card, column: 'contabil_a_fazer' };
      if (card.column === 'documentos_fiscais') return { ...card, column: 'documentos_a_fazer' };
      if (card.column === 'administrativo') return { ...card, column: 'admin_a_fazer' };
      return card;
    });

    // Deduplicate cards by clientId to ensure one card per client
    const uniqueCards = [];
    const seenClientIds = new Set();
    cards.forEach(card => {
      if (!seenClientIds.has(card.clientId)) {
        seenClientIds.add(card.clientId);
        uniqueCards.push(card);
      }
    });
    return uniqueCards;
  });


  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('eloos_chats');
    return safeJsonParse(saved, initialChats);
  });

  const [chatsClearedTimestamps, setChatsClearedTimestamps] = useState(() => {
    const saved = localStorage.getItem('eloos_chats_cleared_timestamps');
    return safeJsonParse(saved, {});
  });

  const [quickLinks, setQuickLinks] = useState(() => {
    const saved = localStorage.getItem('eloos_quicklinks');
    if (saved) {
      const parsed = safeJsonParse(saved, null);
      if (parsed) {
        // Clear legacy default quicklinks l1-l4
        const containsDefault = parsed.some(link => ['l1', 'l2', 'l3', 'l4'].includes(link.id));
        if (containsDefault) {
          return [];
        }
        return parsed;
      }
    }
    return [];
  });

  const [quickReplies, setQuickReplies] = useState(() => {
    const saved = localStorage.getItem('crmbase_quick_replies');
    if (saved) {
      const parsed = safeJsonParse(saved, null);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('eloos_profile');
    return safeJsonParse(saved, initialProfile);
  });

  // Portal State Declarations
  const [portalUsers, setPortalUsers] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_users');
    const parsed = safeJsonParse(saved, initialPortalUsers);
    if (parsed && Array.isArray(parsed)) {
      const missing = initialPortalUsers.filter(initU => !parsed.some(p => (p.email || '').toLowerCase() === initU.email.toLowerCase()));
      if (missing.length > 0) {
        return [...parsed, ...missing];
      }
      return parsed;
    }
    return initialPortalUsers;
  });

  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_properties');
    return safeJsonParse(saved, initialProperties);
  });

  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_contracts');
    return safeJsonParse(saved, initialContracts);
  });

  const [financialRecords, setFinancialRecords] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_financial_records');
    return safeJsonParse(saved, initialFinancialRecords);
  });

  const [maintenanceRequests, setMaintenanceRequests] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_maintenance_requests');
    return safeJsonParse(saved, initialMaintenanceRequests);
  });

  const [portalMessages, setPortalMessages] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_messages');
    return safeJsonParse(saved, initialPortalMessages);
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('araujo_portal_activity_logs');
    return safeJsonParse(saved, initialActivityLogs);
  });

  useEffect(() => { localStorage.setItem('araujo_portal_users', JSON.stringify(portalUsers)); }, [portalUsers]);
  useEffect(() => { localStorage.setItem('araujo_portal_properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem('araujo_portal_contracts', JSON.stringify(contracts)); }, [contracts]);
  useEffect(() => { localStorage.setItem('araujo_portal_financial_records', JSON.stringify(financialRecords)); }, [financialRecords]);
  useEffect(() => { localStorage.setItem('araujo_portal_maintenance_requests', JSON.stringify(maintenanceRequests)); }, [maintenanceRequests]);
  useEffect(() => { localStorage.setItem('araujo_portal_messages', JSON.stringify(portalMessages)); }, [portalMessages]);
  useEffect(() => { localStorage.setItem('araujo_portal_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

  const registerActivityLog = (userName, actionText) => {
    const newLog = {
      id: 'act_' + Date.now(),
      timestamp: new Date().toLocaleString('pt-BR'),
      userName: userName || profile?.name || 'Usuário',
      action: actionText
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check against Portal Users list (Supports all 4 roles: Admin, Corretor, Proprietario, Inquilino)
    const matchedPortal = portalUsers.find(u =>
      (u.email || '').trim().toLowerCase() === cleanEmail &&
      (u.password || '').trim() === cleanPassword
    );
    if (matchedPortal) {
      setProfile({
        id: matchedPortal.id,
        name: matchedPortal.name,
        email: matchedPortal.email,
        role: matchedPortal.role,
        phone: matchedPortal.phone || '',
        avatar: matchedPortal.avatar || '',
        password: matchedPortal.password
      });
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      const roleLabel = matchedPortal.role === 'proprietario' ? 'Proprietário' : 
                        matchedPortal.role === 'inquilino' ? 'Inquilino' :
                        (matchedPortal.role === 'Normal' || matchedPortal.role === 'Corretor') ? 'Corretor' : 'Administrador';
      registerActivityLog(`${matchedPortal.name} (${roleLabel})`, 'Fez login no sistema');
      return { success: true };
    }

    // 2. Check against active profile fallback
    const activeEmail = (profile?.email || 'admin@admin.com').trim().toLowerCase();
    const activePassword = (profile?.password || 'admin').trim();
    if (cleanEmail === activeEmail && cleanPassword === activePassword) {
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      registerActivityLog(`${profile.name || 'Admin User'} (Administrador)`, 'Fez login na plataforma CRM');
      return { success: true };
    }

    // 3. Check against global systemUsers list
    const matched = systemUsers.find(u =>
      (u.email || '').trim().toLowerCase() === cleanEmail &&
      (u.password || '').trim() === cleanPassword
    );
    if (matched) {
      const newProfile = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role || 'Administrador',
        phone: matched.phone || '',
        avatar: matched.avatar || '',
        password: matched.password
      };
      setProfile(newProfile);
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      registerActivityLog(matched.name, 'Fez login na plataforma');
      return { success: true };
    }

    return { success: false, message: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  };

  const quickLoginPortal = (role) => {
    if (role === 'proprietario') {
      const user = portalUsers.find(u => u.role === 'proprietario') || initialPortalUsers[2];
      setProfile(user);
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      registerActivityLog(`${user.name} (Proprietário)`, 'Fez login rápido no Portal do Proprietário');
    } else if (role === 'inquilino') {
      const user = portalUsers.find(u => u.role === 'inquilino') || initialPortalUsers[3];
      setProfile(user);
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      registerActivityLog(`${user.name} (Inquilino)`, 'Fez login rápido no Portal do Inquilino');
    } else if (role === 'corretor') {
      const user = portalUsers.find(u => u.role === 'Normal' || u.role === 'Corretor') || initialPortalUsers[1];
      setProfile(user);
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      registerActivityLog(`${user.name} (Corretor)`, 'Fez login rápido no CRM (Visão Corretor)');
    } else {
      const user = portalUsers.find(u => u.role === 'Administrador' || u.role === 'admin') || initialPortalUsers[0];
      setProfile(user);
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      registerActivityLog(`${user.name} (Administrador)`, 'Fez login rápido no CRM Interno (Admin)');
    }
  };

  const authorizeMaintenance = (requestId, decision, note) => {
    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newStatus = decision === 'AUTORIZADO' ? 'Autorizado' : (decision === 'RECUSADO' ? 'Orçamento Recusado' : 'Aguardando Informações');
        return {
          ...req,
          status: newStatus,
          decision: decision,
          decisionDate: new Date().toLocaleString('pt-BR'),
          decisionNote: note || ''
        };
      }
      return req;
    }));
    registerActivityLog(profile?.name || 'Proprietário', `${decision === 'AUTORIZADO' ? 'Autorizou' : 'Recusou/Questionou'} a manutenção (${requestId})`);
  };

  const createMaintenanceRequest = (data) => {
    const nextProtocolNum = maintenanceRequests.length + 343;
    const protocolStr = `MAN-${String(nextProtocolNum).padStart(6, '0')}`;
    const newReq = {
      id: 'maint_' + Date.now(),
      protocol: protocolStr,
      propertyId: data.propertyId || 'prop_1',
      propertyName: data.propertyName || 'Apartamento 302 - Edifício Horizonte',
      tenantId: profile?.id || 'user_inquilino_1',
      tenantName: profile?.name || 'Mariana Oliveira Costa',
      ownerId: 'user_proprietario_1',
      ownerName: 'Carlos Eduardo Silva',
      title: data.title || 'Solicitação de Reparo',
      category: data.category || 'Geral',
      description: data.description || '',
      requestDate: new Date().toLocaleString('pt-BR'),
      status: 'Solicitado',
      budgetValue: null,
      budgetSupplier: null,
      decision: null,
      decisionDate: null,
      scheduledDate: null,
      scheduledTime: null,
      attachments: data.attachments || []
    };
    setMaintenanceRequests(prev => [newReq, ...prev]);
    registerActivityLog(profile?.name || 'Inquilino', `Abriu chamada de manutenção protocolo ${protocolStr}`);
    return newReq;
  };

  const sendPortalMessage = (msg) => {
    const newMsg = {
      id: 'msg_' + Date.now(),
      senderRole: msg.senderRole || profile?.role || 'inquilino',
      senderName: msg.senderName || profile?.name || 'Usuário',
      recipientRole: msg.recipientRole || 'imobiliaria',
      recipientId: msg.recipientId || 'admin',
      subject: msg.subject || 'Mensagem do Portal',
      body: msg.body || '',
      date: new Date().toLocaleString('pt-BR'),
      read: false
    };
    setPortalMessages(prev => [newMsg, ...prev]);
    registerActivityLog(profile?.name || 'Usuário', `Enviou mensagem no portal: "${newMsg.subject}"`);
  };

  const updateMaintenanceStatus = (requestId, newStatus, budgetValue, budgetSupplier, scheduledDate, scheduledTime) => {
    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: newStatus || req.status,
          budgetValue: budgetValue !== undefined ? budgetValue : req.budgetValue,
          budgetSupplier: budgetSupplier !== undefined ? budgetSupplier : req.budgetSupplier,
          scheduledDate: scheduledDate !== undefined ? scheduledDate : req.scheduledDate,
          scheduledTime: scheduledTime !== undefined ? scheduledTime : req.scheduledTime
        };
      }
      return req;
    }));
    registerActivityLog(profile?.name || 'Imobiliária', `Atualizou status da manutenção ${requestId} para "${newStatus}"`);
  };

  const [systemUsers, setSystemUsersState] = useState(() => {
    const saved = localStorage.getItem('crmbase_system_users');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        // Filter out legacy default user accounts
        parsed = parsed.filter(u => 
          u.email !== 'mqssolucao@gmail.com' && 
          u.email !== 'atg.contador@gmail.com' && 
          u.email !== 'miguelmr.business@gmail.com' &&
          u.id !== 'default_u2' && u.id !== 'default_u3' && u.id !== 'default_u4' && u.id !== 'u1' && u.id !== 'u3' && u.id !== 'u4'
        );
        return parsed;
      } catch (e) {
        console.error("Error parsing system users", e);
      }
    }
    return [];
  });

  const setSystemUsers = (newUsersOrFn) => {
    setSystemUsersState(prev => {
      const next = typeof newUsersOrFn === 'function' ? newUsersOrFn(prev) : newUsersOrFn;
      localStorage.setItem('crmbase_system_users', JSON.stringify(next));
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      }).catch(err => console.error("Error saving users to cloud:", err));
      return next;
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSystemUsersState(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch system users from cloud:", err);
      }
    };
    fetchUsers();
  }, []);

  const [agentEnabled, setAgentEnabled] = useState(() => {
    return localStorage.getItem('eloos_lead_agent_enabled') === 'true';
  });

  const [agentRules, setAgentRules] = useState(() => {
    const saved = localStorage.getItem('eloos_lead_agent_rules');
    return safeJsonParse(saved, [
      {
        id: 'rule_1',
        name: 'Novo Lead → Contato Iniciado',
        empreendimento: 'Todos',
        conditionType: 'atendimento_iniciado',
        targetPipelineId: 'pessoal',
        targetColumnId: 'pessoal_em_andamento',
        priority: 1,
        enabled: true
      },
      {
        id: 'rule_2',
        name: 'Contato Iniciado → Qualificação',
        empreendimento: 'Todos',
        conditionType: 'interesse_demonstrado',
        targetPipelineId: 'contabil_fiscal',
        targetColumnId: 'contabil_a_fazer',
        priority: 2,
        enabled: true
      },
      {
        id: 'rule_3',
        name: 'Qualificação → Visita Agendada',
        empreendimento: 'Todos',
        conditionType: 'visita_agendada',
        targetPipelineId: 'contabil_fiscal',
        targetColumnId: 'contabil_em_andamento',
        priority: 3,
        enabled: true
      }
    ]);
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('eloos_lead_agent_audit_logs');
    return safeJsonParse(saved, []);
  });

  const [aiSuggestions, setAiSuggestions] = useState(() => {
    const saved = localStorage.getItem('eloos_lead_agent_suggestions');
    return safeJsonParse(saved, []);
  });

  const [agentSchedule, setAgentSchedule] = useState(() => {
    return localStorage.getItem('eloos_lead_agent_schedule') || '10s';
  });

  const [manualTriggerCount, setManualTriggerCount] = useState(0);

  // Multi-Instance WhatsApp Configuration State
  const [waInstances, setWaInstances] = useState(() => {
    const saved = localStorage.getItem('crmbase_wa_instances');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    const defaultInst = {
      id: 'inst_primary',
      name: import.meta.env.VITE_EVO_INSTANCE_NAME || import.meta.env.VITE_CLIENT_NAME || 'CRM Base (Principal)',
      instanceName: import.meta.env.VITE_EVO_INSTANCE_NAME || import.meta.env.VITE_CLIENT_NAME || 'CRM Base',
      number: '',
      status: 'DISCONNECTED'
    };
    return [defaultInst];
  });

  useEffect(() => {
    localStorage.setItem('crmbase_wa_instances', JSON.stringify(waInstances));
  }, [waInstances]);

  // Selected WhatsApp Instance Filter for views ('all' or specific instanceName)
  const [selectedInstanceFilter, setSelectedInstanceFilter] = useState(() => {
    return localStorage.getItem('crmbase_selected_instance_filter') || 'all';
  });

  useEffect(() => {
    localStorage.setItem('crmbase_selected_instance_filter', selectedInstanceFilter);
  }, [selectedInstanceFilter]);

  const addWaInstance = (instanceName, customLabel = '') => {
    if (!instanceName.trim()) return;
    const cleanName = instanceName.trim();
    const newInst = {
      id: `inst_${Date.now()}`,
      name: customLabel.trim() || cleanName,
      instanceName: cleanName,
      number: '',
      status: 'DISCONNECTED'
    };
    setWaInstances(prev => {
      if (prev.some(i => i.instanceName === cleanName)) return prev;
      return [...prev, newInst];
    });
  };

  const removeWaInstance = (instId) => {
    setWaInstances(prev => prev.filter(i => i.id !== instId));
    if (selectedInstanceFilter !== 'all') {
      setSelectedInstanceFilter('all');
    }
  };

  const EVO_CONFIG = {
    baseUrl: import.meta.env.VITE_EVO_BASE_URL || "",
    apiKey: import.meta.env.VITE_EVO_API_KEY || "",
    tenant: import.meta.env.VITE_EVO_TENANT || "",
    instanceName: import.meta.env.VITE_EVO_INSTANCE_NAME || import.meta.env.VITE_CLIENT_NAME || 'CRM Base',
    get encodedInstanceName() {
      return encodeURIComponent(this.instanceName);
    }
  };

  const fetchEvolution = async (path, options = {}) => {
    try {
      const res = await fetch(`/api/whatsapp?action=proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body) : undefined
        })
      });
      return res;
    } catch (err) {
      console.error(`Error proxying Evolution API: ${path}`, err);
      throw err;
    }
  };

  // WhatsApp Integration status state (shared globally)
  const [waStatus, setWaStatus] = useState(() => {
    const saved = localStorage.getItem('crmbase_wa_status');
    return saved || 'DISCONNECTED';
  });

  // Triage synchronization status state (resets to false on page load / status change)
  const [waTriageSynced, setWaTriageSynced] = useState(false);
  const [waTriageSyncFinishedAt, setWaTriageSyncFinishedAt] = useState(0);

  const waTriageSyncedRef = useRef(false);
  const waTriageSyncFinishedAtRef = useRef(0);
  const lastSyncTimeRef = useRef(0);
  const lastActiveChatIdRef = useRef(null);

  useEffect(() => {
    waTriageSyncedRef.current = waTriageSynced;
  }, [waTriageSynced]);

  useEffect(() => {
    waTriageSyncFinishedAtRef.current = waTriageSyncFinishedAt;
  }, [waTriageSyncFinishedAt]);

  // Reset triage sync status and wipe all data when WhatsApp status changes to non-ONLINE (desconectar / trocar número)
  useEffect(() => {
    if (waStatus !== 'ONLINE') {
      setWaTriageSynced(false);
      setWaTriageSyncFinishedAt(0);
      logToDisk(`waStatus changed to ${waStatus}. Resetting triage flags and clearing all local contact and chat data.`);
      
      // Clear React states
      setRawClients([]);
      setChats({});
      setKanbanCards([]);
      setUnreadChats([]);
      setChatsClearedTimestamps({});
      
      // Clear localStorage databases
      localStorage.removeItem('eloos_clients');
      localStorage.removeItem('eloos_chats');
      localStorage.removeItem('eloos_kanban');
      localStorage.removeItem('eloos_chats_cleared_timestamps');
      localStorage.removeItem('crmbase_unread_chats');
      
      // Reset active chat
      setActiveChatClientId(null);
    }
  }, [waStatus]);

  // Unread chats tracking state (empty by default)
  const [unreadChats, setUnreadChats] = useState(() => {
    const saved = localStorage.getItem('crmbase_unread_chats');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('crmbase_unread_chats', JSON.stringify(unreadChats));
  }, [unreadChats]);

  // Keep a ref of activeChatClientId for async sync polling loop
  const activeChatClientIdRef = useRef(activeChatClientId);
  useEffect(() => {
    activeChatClientIdRef.current = activeChatClientId;
    if (activeChatClientId) {
      const clientMessages = chats[activeChatClientId] || [];
      const lastMsg = clientMessages[clientMessages.length - 1];
      const clientObj = clientsRef.current.find(c => c.id === activeChatClientId);
      
      const phone = clientObj?.phone || '';
      const suffix = phone.replace(/\D/g, '').slice(-8);

      const msgTs = (clientObj && clientObj.lastMessageTimestamp) ? clientObj.lastMessageTimestamp : Math.floor(Date.now() / 1000);
      const readTs = Math.max(msgTs, Math.floor(Date.now() / 1000));

      localStorage.setItem(`crmbase_read_ts_${activeChatClientId}`, readTs.toString());
      if (suffix) {
        localStorage.setItem(`crmbase_read_ts_${suffix}`, readTs.toString());
      }
      
      // Instantly remove from unread list
      setUnreadChats(prev => {
        const next = prev.filter(id => id !== activeChatClientId && (suffix ? id !== `c_wa_${suffix}` : true));
        localStorage.setItem('crmbase_unread_chats', JSON.stringify(next));
        return next;
      });
    }
  }, [activeChatClientId, chats]);

  const logToDisk = (message, level = 'INFO') => {
    console.log(`[${level}] ${message}`);
    /*
    fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, level })
    }).catch(() => {});
    */
  };

  // Verify real WhatsApp connection status on mount and periodically
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        logToDisk("checkStatus: starting status check");
        const res = await fetch(`/api/whatsapp?action=status&instance=${EVO_CONFIG.encodedInstanceName}`);
        logToDisk("checkStatus: response status=" + res.status + " ok=" + res.ok);
        if (res.ok && active) {
          const data = await res.json();
          const state = data?.instance?.state || data?.state || "close";
          logToDisk("checkStatus: instance state=" + state);
          if (state === "open") {
            setWaStatus("ONLINE");
          } else {
            setWaStatus(prev => (prev === "QR_CODE" || prev === "GENERATING_QR") ? prev : "DISCONNECTED");
          }
        } else if (active) {
          setWaStatus(prev => (prev === "QR_CODE" || prev === "GENERATING_QR") ? prev : "DISCONNECTED");
        }
      } catch (err) {
        logToDisk("checkStatus error: " + err.message, "ERROR");
        console.error("Erro ao checar status do WhatsApp no Context:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // State refs to allow the background polling interval to read fresh values without rebuilding the timer
  const clientsRef = useRef(clients);
  const kanbanCardsRef = useRef(kanbanCards);
  const chatsRef = useRef(chats);
  const chatsClearedTimestampsRef = useRef(chatsClearedTimestamps);
  const agentRulesRef = useRef(agentRules);
  const aiSuggestionsRef = useRef(aiSuggestions);

  useEffect(() => { clientsRef.current = clients; }, [clients]);
  useEffect(() => { kanbanCardsRef.current = kanbanCards; }, [kanbanCards]);
  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { chatsClearedTimestampsRef.current = chatsClearedTimestamps; }, [chatsClearedTimestamps]);
  useEffect(() => { agentRulesRef.current = agentRules; }, [agentRules]);
  useEffect(() => { aiSuggestionsRef.current = aiSuggestions; }, [aiSuggestions]);



  // Extracts button reply ID from various WhatsApp message structures
  const getButtonReplyId = (msg) => {
    if (!msg || !msg.message) return null;
    const m = msg.message;
    if (m.buttonsResponseMessage?.selectedButtonId) {
      return m.buttonsResponseMessage.selectedButtonId;
    }
    if (m.templateButtonReplyMessage?.selectedId) {
      return m.templateButtonReplyMessage.selectedId;
    }
    if (m.interactiveResponseMessage?.button_reply?.id) {
      return m.interactiveResponseMessage.button_reply.id;
    }
    if (m.interactiveResponseMessage?.listReply?.id) {
      return m.interactiveResponseMessage.listReply.id;
    }
    if (m.listResponseMessage?.singleSelectReply?.selectedRowId) {
      return m.listResponseMessage.singleSelectReply.selectedRowId;
    }
    if (m.pollUpdateMessage?.vote?.selectedOptions?.[0]?.optionName) {
      return m.pollUpdateMessage.vote.selectedOptions[0].optionName;
    }
    if (m.pollUpdateMessage?.selectedOptions?.[0]?.optionName) {
      return m.pollUpdateMessage.selectedOptions[0].optionName;
    }
    if (m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
      try {
        const params = JSON.parse(m.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
        if (params.id) return params.id;
        if (params.selectedId) return params.selectedId;
      } catch (e) {}
    }
    return null;
  };



  // Fires n8n triage webhook with selected pipeline info.
  const fireTriageWebhook = (client, pipeline, clientId) => {
    const webhookUrl = localStorage.getItem('crmbase_ai_webhook_url') || '';
    if (!webhookUrl) return;
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'triage_completed',
        pipeline: pipeline,
        contact: {
          id: clientId,
          name: client ? client.name : '',
          phone: client ? client.phone : ''
        }
      })
    }).catch(err => console.error('fireTriageWebhook error:', err));
  };

  // Sends the local WhatsApp triage greeting menu directly from the CRM
  const triggerTriageGreetingLocal = (phone, jid = null) => {
    const isSdrEnabled = localStorage.getItem('crmbase_sdr_enabled') === 'true';
    if (!isSdrEnabled) {
      logToDisk("triggerTriageGreetingLocal: SDR agent is disabled in settings. Skipping.");
      return;
    }

    // In AI routing mode, the AI agent (n8n) handles all greetings and conversations.
    // The CRM only sends the static menu greeting in 'static' mode.
    const routeMode = localStorage.getItem('crmbase_sdr_route_mode') || 'disabled';
    if (!waTriageSyncedRef.current) {
      logToDisk("triggerTriageGreetingLocal: Sync not complete. Skipping greeting.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const suffix = cleanPhone.slice(-8);
    const lastSentTimeStr = localStorage.getItem(`crmbase_triage_sent_time_${suffix}`);
    if (lastSentTimeStr) {
      const lastSentTime = parseInt(lastSentTimeStr, 10) || 0;
      const minutesDiff = (Date.now() - lastSentTime) / (1000 * 60);
      if (minutesDiff < 120) {
        // Already sent within 2 hours, skip to prevent spamming
        return;
      }
    }

    localStorage.setItem(`crmbase_triage_sent_time_${suffix}`, Date.now().toString());
    localStorage.setItem(`crmbase_triage_sent_${cleanPhone}`, '1');

    logToDisk(`triggerTriageGreetingLocal: Sending local triage greeting to ${cleanPhone}`);

    let recipientJid = jid;
    if (!recipientJid) {
      const numberOnly = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      recipientJid = `${numberOnly}@s.whatsapp.net`;
    }

    let greetingText = localStorage.getItem('crmbase_sdr_welcome') || 'Olá, seja bem-vindo! Escolha seu atendimento:';

    if (routeMode === 'static') {
      let staticMapping = [];
      try {
        const saved = localStorage.getItem('crmbase_sdr_static_mapping');
        staticMapping = saved ? JSON.parse(saved) : [];
      } catch (e) {}
      
      if (staticMapping.length > 0) {
        let cols = [];
        try {
          const savedCols = localStorage.getItem('crmbase_columns');
          cols = savedCols ? JSON.parse(savedCols) : [];
        } catch (e) {}

        let pipes = [];
        try {
          const savedPipes = localStorage.getItem('crmbase_pipelines');
          pipes = savedPipes ? JSON.parse(savedPipes) : [];
        } catch (e) {}
        
        const optionsLines = staticMapping
          .filter(m => m.key && m.columnId)
          .map(m => {
            const col = cols.find(c => c.id === m.columnId);
            let displayName = m.columnId;
            if (col) {
              const pipe = pipes.find(p => p.id === col.pipelineId);
              displayName = pipe ? pipe.name : col.pipelineId;
            }
            return `${m.key} - ${displayName}`;
          });
        if (optionsLines.length > 0) {
          greetingText += '\n\n' + optionsLines.join('\n');
        }
      }
    }

    const body = {
      number: recipientJid,
      text: greetingText
    };

    fetch(`${EVO_CONFIG.baseUrl}/message/sendText/${EVO_CONFIG.encodedInstanceName}`, {
      method: "POST",
      headers: {
        "apikey": EVO_CONFIG.apiKey,
        "tenant": EVO_CONFIG.tenant,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }).then(res => {
      if (!res.ok) console.error("Error sending local triage greeting:", res.statusText);
    }).catch(err => console.error("Network error sending local triage greeting:", err));
  };

  // Sends the local WhatsApp triage confirmation message directly from the CRM
  const sendTriageConfirmationLocal = (phone, jid = null, customText = null) => {
    if (!waTriageSyncedRef.current) {
      logToDisk("sendTriageConfirmationLocal: Sync not complete. Skipping confirmation.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    logToDisk(`sendTriageConfirmationLocal: Sending triage confirmation to ${cleanPhone}`);

    let recipientJid = jid;
    if (!recipientJid) {
      const numberOnly = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      recipientJid = `${numberOnly}@s.whatsapp.net`;
    }

    const confirmationText = customText || localStorage.getItem('crmbase_sdr_transfer') || 
      `Prezado(a) cliente agradecemos seu contato.\n\nDeixe sua mensagem ou sua demanda que já já será atendido com toda a atenção e carinho de sempre.\n\nE se por preciso, fique à vontade para ligar em nosso WhatsApp que será um prazer falar com você.`;

    const body = {
      number: recipientJid,
      text: confirmationText
    };

    fetch(`${EVO_CONFIG.baseUrl}/message/sendText/${EVO_CONFIG.encodedInstanceName}`, {
      method: "POST",
      headers: {
        "apikey": EVO_CONFIG.apiKey,
        "tenant": EVO_CONFIG.tenant,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }).then(res => {
      if (!res.ok) console.error("Error sending local triage confirmation:", res.statusText);
    }).catch(err => console.error("Network error sending local triage confirmation:", err));
  };

  // Parses user message or button replies and routes them to correct pipeline & creates Kanban card.
  const routeClientBasedOnChoice = (clientPhone, choiceText, buttonId, clientId = null, localNewClients = null) => {
    const isSdrEnabled = localStorage.getItem('crmbase_sdr_enabled') === 'true';
    if (!isSdrEnabled) return null;
    
    const routeMode = localStorage.getItem('crmbase_sdr_route_mode') || 'disabled';
    if (routeMode === 'disabled') return null;

    let targetColumnId = '';
    const cleanButtonId = buttonId ? buttonId.trim().toLowerCase() : '';
    const cleanChoiceText = choiceText ? choiceText.trim().toLowerCase() : '';

    let transitionText = '';

    if (routeMode === 'static') {
      let staticMapping = [];
      try {
        const saved = localStorage.getItem('crmbase_sdr_static_mapping');
        staticMapping = saved ? JSON.parse(saved) : [];
      } catch (e) {}

      const match = staticMapping.find(m => 
        (m.key && m.key.trim().toLowerCase() === cleanButtonId) ||
        (m.key && m.key.trim().toLowerCase() === cleanChoiceText)
      );
      if (match) {
        targetColumnId = match.columnId;
        transitionText = match.transitionMessage || '';
      }
    } else if (routeMode === 'ai') {
      let aiMapping = [];
      try {
        const saved = localStorage.getItem('crmbase_sdr_ai_mapping');
        aiMapping = saved ? JSON.parse(saved) : [];
      } catch (e) {}

      const lowWeightWords = ['ajuda', 'suporte', 'duvida', 'preciso', 'quero', 'favor', 'atendimento'];

      let bestMatch = null;
      let highestScore = -1;

      aiMapping.forEach(m => {
        if (!m.keywords) return;
        const keywordsList = m.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
        
        let maxPositionalScoreForRule = 0;
        let genericMatchesCount = 0;
        let specificMatchesCount = 0;

        keywordsList.forEach((kw, posIdx) => {
          if (!kw) return;
          // Check if user message contains this keyword (or keyword contains user message for exact single words)
          const isMatched = cleanChoiceText.includes(kw) || cleanButtonId.includes(kw);
          if (isMatched) {
            // Positional weight: 1st keyword = 100, 2nd = 90, 3rd = 80, etc. (minimum 10)
            const posWeight = Math.max(10, 100 - (posIdx * 10));
            const isLowWeight = lowWeightWords.includes(kw);
            
            // Specific keywords get full positional weight + bonus for length; generic words get 5 points
            const finalScore = isLowWeight ? 5 : (posWeight + kw.length * 2);
            
            if (isLowWeight) {
              genericMatchesCount++;
            } else {
              specificMatchesCount++;
            }

            if (finalScore > maxPositionalScoreForRule) {
              maxPositionalScoreForRule = finalScore;
            }
          }
        });

        // Boost score if specific keywords were matched (to prevent generic rules like "ajuda" from overriding "documentos")
        const totalRuleScore = maxPositionalScoreForRule + (specificMatchesCount * 50) + genericMatchesCount;

        if (totalRuleScore > highestScore && totalRuleScore > 0) {
          highestScore = totalRuleScore;
          bestMatch = m;
        }
      });

      if (bestMatch && highestScore > 0) {
        targetColumnId = bestMatch.columnId;
        transitionText = bestMatch.transitionMessage || '';
      }
    }

    if (!targetColumnId) return null;

    let newStatus = 'Pessoal';
    let newTag = 'departamento_pessoal';

    try {
      const savedCols = localStorage.getItem('crmbase_columns');
      if (savedCols) {
        const cols = JSON.parse(savedCols);
        const matchedCol = cols.find(c => c.id === targetColumnId);
        if (matchedCol) {
          const savedPipes = localStorage.getItem('crmbase_pipelines');
          const pipes = savedPipes ? JSON.parse(savedPipes) : [];
          const matchedPipe = pipes.find(p => p.id === matchedCol.pipelineId);
          if (matchedPipe) {
            newStatus = matchedPipe.name;
            newTag = matchedPipe.id;
          }
        }
      }
    } catch (e) {}

    const cleanPhone = clientPhone.replace(/\D/g, '');
    const suffix = cleanPhone.slice(-8);
    const targetClientId = clientId || `c_wa_${suffix}`;

    // Idempotency: Route once in 2 hours to avoid duplicates/loops
    const lastRouteTimeStr = localStorage.getItem(`crmbase_triage_routed_time_${targetClientId}`) || 
                             localStorage.getItem(`crmbase_triage_routed_time_${suffix}`);
    if (lastRouteTimeStr) {
      const lastRouteTime = parseInt(lastRouteTimeStr, 10) || 0;
      const hoursDiff = (Date.now() - lastRouteTime) / (1000 * 60 * 60);
      if (hoursDiff < 2) {
        return null;
      }
    }

    localStorage.setItem(`crmbase_triage_routed_time_${targetClientId}`, Date.now().toString());
    localStorage.setItem(`crmbase_triage_routed_${targetClientId}`, '1');
    localStorage.setItem(`crmbase_triage_routed_time_${suffix}`, Date.now().toString());
    localStorage.setItem(`crmbase_triage_routed_${suffix}`, '1');

    logToDisk(`routeClientBasedOnChoice: Routing ${targetClientId} to ${newStatus} on column ${targetColumnId}`);

    // Update in-place in localNewClients if passed
    if (localNewClients) {
      const cIndex = localNewClients.findIndex(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
      if (cIndex !== -1) {
        localNewClients[cIndex].status = newStatus;
        const updatedTags = Array.isArray(localNewClients[cIndex].tags) ? [...localNewClients[cIndex].tags] : [];
        if (newTag && !updatedTags.includes(newTag)) {
          updatedTags.push(newTag);
        }
        localNewClients[cIndex].tags = updatedTags;
      }
    }

    // Update React state clients
    setClients(prevClients => {
      let hasChanges = false;
      const updated = prevClients.map(c => {
        const matchById = c.id === targetClientId;
        const matchByPhone = c.phone.replace(/\D/g, '').endsWith(suffix);
        if (matchById || matchByPhone) {
          if (c.status !== newStatus) {
            hasChanges = true;
            const updatedTags = Array.isArray(c.tags) ? [...c.tags] : [];
            if (newTag && !updatedTags.includes(newTag)) {
              updatedTags.push(newTag);
            }
            return { ...c, status: newStatus, tags: updatedTags };
          }
        }
        return c;
      });

      let clientName = clientPhone;
      if (localNewClients) {
        const found = localNewClients.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
        if (found) clientName = found.name;
      } else {
        const targetClient = updated.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
        if (targetClient) clientName = targetClient.name;
      }

      // Create Kanban Card dynamically with mapped columnId
      setKanbanCards(prevCards => {
        const exists = prevCards.some(card => card.clientId === targetClientId);
        if (!exists) {
          const newCard = {
            id: `k_wa_${suffix}`,
            clientId: targetClientId,
            title: `${clientName} - Novo Registro`,
            desc: `Cliente: ${clientName}\nTelefone: ${cleanPhone}\nCriado em: ${new Date().toLocaleString()}\nPipeline: ${newStatus}\nStatus Inicial: ${targetColumnId}\nConversa ID: ${targetClientId}\nResponsável: ${profile?.name || "Miguel Suporte"}\n\n(Roteado via triagem de departamento)`,
            column: targetColumnId,
            priority: "Média",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            
            clientName: clientName,
            clientPhone: cleanPhone,
            createdAt: new Date().toISOString(),
            pipeline: newStatus,
            initialStatus: targetColumnId,
            conversaId: targetClientId,
            responsavel: profile?.name || "Miguel Suporte"
          };
          return [...prevCards, newCard];
        } else {
          return prevCards.map(card => {
            if (card.clientId === targetClientId) {
              return { 
                ...card, 
                column: targetColumnId,
                pipeline: newStatus,
                desc: `Cliente: ${clientName}\nTelefone: ${cleanPhone}\nCriado em: ${card.createdAt || new Date().toLocaleString()}\nPipeline: ${newStatus}\nStatus Inicial: ${targetColumnId}\nConversa ID: ${targetClientId}\nResponsável: ${profile?.name || "Miguel Suporte"}\n\n(Roteado via triagem de departamento)`
              };
            }
            return card;
          });
        }
      });

      const targetClient = updated.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
      // Only fire the triage webhook in 'static' mode.
      // In 'ai' mode the routing is silent/organizational — the AI continues the conversation.
      if (hasChanges && targetClient && routeMode !== 'ai') {
        fireTriageWebhook(targetClient, newStatus, targetClientId);
      }

      return updated;
    });

    // Send confirmation message only in 'static' menu mode.
    // In 'ai' mode the routing is silent — the AI agent continues the conversation naturally.
    if (routeMode !== 'ai') {
      let clientJid = null;
      if (localNewClients) {
        const found = localNewClients.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
        if (found) clientJid = found.jid;
      }
      sendTriageConfirmationLocal(cleanPhone, clientJid, transitionText);
    } else {
      logToDisk(`routeClientBasedOnChoice [ai mode]: Silent routing to ${newStatus}. AI continues the conversation.`);
    }

    return newStatus;
  };



  // Sync WhatsApp Chats and message histories from the Evolution API
  const syncWhatsAppChats = async () => {
    const now = Date.now();
    const activeChatChanged = activeChatClientId !== lastActiveChatIdRef.current;
    lastActiveChatIdRef.current = activeChatClientId;

    if (!activeChatChanged && (now - lastSyncTimeRef.current < 5000)) {
      logToDisk("syncWhatsAppChats: throttled, skipping (less than 5s since last sync)");
      return;
    }
    lastSyncTimeRef.current = now;

    logToDisk("syncWhatsAppChats: check, waStatus=" + waStatus);
    if (waStatus !== 'ONLINE') return;
    if (isSyncingRef.current) {
      logToDisk("syncWhatsAppChats: already syncing, skipping");
      return;
    }
    isSyncingRef.current = true;
    try {
      logToDisk("syncWhatsAppChats: fetching chats...");
      const res = await fetchEvolution(`/chat/findChats/${EVO_CONFIG.encodedInstanceName}`, { method: 'POST', body: JSON.stringify({}) });
      logToDisk("syncWhatsAppChats: findChats res ok=" + res.ok + ", status=" + res.status);
      if (!res.ok) {
        isSyncingRef.current = false;
        return;
      }
      const chatsData = await res.json();
      const serverChats = Array.isArray(chatsData) ? chatsData : [];
      logToDisk("syncWhatsAppChats: found " + serverChats.length + " chats on server");
      
      let clientsUpdated = false;
      let newClients = [...clientsRef.current];
      
      const clientsToAdd = [];
      const cardsToAdd = [];
      const jidsToUpdate = new Map();
      let chatsToUpdate = {};

      for (const chat of serverChats) {
        if (!chat.remoteJid) continue;
        
        // Extract real phone number, handling both normal JIDs and @lid multi-device IDs
        let rawPhone = chat.remoteJid.split('@')[0];
        if (chat.remoteJid.endsWith('@lid') && chat.lastMessage?.key?.remoteJidAlt) {
          rawPhone = chat.lastMessage.key.remoteJidAlt.split('@')[0];
        }
        const cleanJidPhone = rawPhone.replace(/\D/g, '');
        if (!cleanJidPhone) continue;

        const jidSuffix = cleanJidPhone.slice(-8);

        // Check if client exists by suffix comparison
        let clientIndex = newClients.findIndex(c => {
          const cPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
          return cPhone.length >= 8 && cPhone.endsWith(jidSuffix);
        });

        // Fallback: Check by pushName if suffix matches failed (helps resolving LID duplication)
        if (clientIndex === -1) {
          const cleanPushName = chat.pushName ? chat.pushName.trim().toLowerCase() : '';
          const lastMsgPushName = chat.lastMessage?.pushName;
          const cleanLastMsgPushName = lastMsgPushName ? lastMsgPushName.trim().toLowerCase() : '';
          
          const isRealName = (name) => {
            if (!name) return false;
            const n = name.trim().toLowerCase();
            if (n === 'você' || n === 'voce' || n === 'sistema' || n === 'contato' || n === 'admin') return false;
            if (/^\d+$/.test(n.replace(/[\s\-\+\(\)]/g, ''))) return false;
            return n.length > 2;
          };

          if (isRealName(chat.pushName)) {
            clientIndex = newClients.findIndex(c => c.name && c.name.trim().toLowerCase() === cleanPushName);
          }
          if (clientIndex === -1 && isRealName(lastMsgPushName)) {
            clientIndex = newClients.findIndex(c => c.name && c.name.trim().toLowerCase() === cleanLastMsgPushName);
          }
        }

        let clientJid = chat.remoteJid;
        let clientId;
        const lastMsgId = chat.lastMessage?.id || chat.lastMessage?.key?.id || null;

        // Extract last message info from chat.lastMessage for displaying in list without history fetch
        let lastMsgText = "";
        let isEdit = false;
        let editedText = "";
        const msgType = chat.lastMessage?.messageType;
        
        if (msgType === "secretEncryptedMessage" || chat.lastMessage?.message?.secretEncryptedMessage) {
          isEdit = true;
        } else if (msgType === "protocolMessage" || chat.lastMessage?.message?.protocolMessage) {
          const pm = chat.lastMessage?.message?.protocolMessage || chat.lastMessage?.protocolMessage;
          if (pm?.key?.id && (pm?.editedMessage || pm?.type === 7)) {
            isEdit = true;
            const editedMsg = pm?.editedMessage;
            if (editedMsg) {
              editedText = editedMsg.conversation || 
                           editedMsg.extendedTextMessage?.text || 
                           editedMsg.imageMessage?.caption || 
                           editedMsg.videoMessage?.caption || 
                           "";
            }
          }
        }

        if (isEdit) {
          lastMsgText = editedText ? editedText : "📝 Mensagem editada";
        } else {
          if (chat.lastMessage?.message) {
            const msg = chat.lastMessage.message;
            lastMsgText = msg.conversation || 
                         msg.extendedTextMessage?.text || 
                         msg.imageMessage?.caption || 
                         msg.videoMessage?.caption || 
                         msg.buttonsResponseMessage?.selectedDisplayText ||
                         msg.buttonsResponseMessage?.selectedButtonId ||
                         msg.listResponseMessage?.title ||
                         msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
                         msg.interactiveResponseMessage?.body?.text ||
                         msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
                         msg.templateButtonReplyMessage?.selectedId ||
                         msg.pollUpdateMessage?.vote?.selectedOptions?.[0]?.optionName ||
                         msg.pollUpdateMessage?.selectedOptions?.[0]?.optionName ||
                         "";
          }
          if (!lastMsgText && chat.lastMessage) {
            const type = chat.lastMessage.messageType;
            if (type === "audioMessage") lastMsgText = "🔊 Áudio";
            else if (type === "imageMessage") lastMsgText = "📷 Imagem";
            else if (type === "videoMessage") lastMsgText = "🎥 Vídeo";
            else if (type === "documentMessage") lastMsgText = "📄 Documento";
            else if (type === "stickerMessage") lastMsgText = "👾 Figurinha";
            else lastMsgText = "Mensagem recebida";
          }
        }
        if (!lastMsgText) {
          lastMsgText = "Sem mensagens ainda.";
        }

        const timestampObj = chat.lastMessage?.messageTimestamp;
        const lastMsgTimestamp = typeof timestampObj === 'object' && timestampObj !== null
          ? (timestampObj.low || timestampObj.toNumber?.() || 0)
          : (timestampObj || 0);

        const lastMsgTime = lastMsgTimestamp 
          ? new Date(lastMsgTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : "";

        if (clientIndex === -1) {
          // Check if contact was deleted and should be ignored
          const deletedTimeStr = localStorage.getItem(`crmbase_deleted_contact_${cleanJidPhone.slice(-8)}`);
          if (deletedTimeStr) {
            const deletedTime = parseInt(deletedTimeStr, 10) || 0;
            if (lastMsgTimestamp <= deletedTime) {
              // Ignore this chat, do not recreate the client
              continue;
            } else {
              // They sent a new message! Remove the deleted flag
              localStorage.removeItem(`crmbase_deleted_contact_${cleanJidPhone.slice(-8)}`);
            }
          }

          // Create new client dynamically
          const lastMsgPushName = chat.lastMessage?.pushName;
          const cleanName = (chat.pushName || (lastMsgPushName && lastMsgPushName !== 'Você' ? lastMsgPushName : null) || cleanJidPhone).trim();
          
          clientId = `c_wa_${cleanJidPhone.slice(-8)}`;

          let initialStatus = "Pessoal";
          let initialTag = "WhatsApp";

          let initialProfilePic = chat.profilePicUrl || chat.picture || chat.avatar || chat.profilePictureUrl || localStorage.getItem(`crmbase_pic_${cleanJidPhone}`) || localStorage.getItem(`crmbase_pic_${clientId}`) || "";
          
          const newClient = {
            id: clientId,
            name: cleanName,
            email: "",
            phone: cleanJidPhone,
            status: initialStatus,
            tags: [initialTag],
            createdAt: new Date().toISOString().split('T')[0],
            jid: clientJid,
            profilePicUrl: initialProfilePic,
            lastMessageText: lastMsgText,
            lastMessageTime: lastMsgTime,
            lastMessageTimestamp: lastMsgTimestamp
          };

          if (!initialProfilePic && cleanJidPhone) {
            fetchEvolution(`/chat/fetchProfilePictureUrl/${EVO_CONFIG.encodedInstanceName}`, {
              method: 'POST',
              body: JSON.stringify({ number: cleanJidPhone })
            }).then(r => r.ok ? r.json() : null).then(data => {
              const fetchedUrl = data?.profilePictureUrl || data?.picture || data?.url || data?.pictureUrl || data?.profilePicUrl;
              if (fetchedUrl) {
                localStorage.setItem(`crmbase_pic_${cleanJidPhone}`, fetchedUrl);
                localStorage.setItem(`crmbase_pic_${clientId}`, fetchedUrl);
                setClients(prev => prev.map(c => (c.id === clientId || c.phone?.endsWith(jidSuffix)) ? { ...c, profilePicUrl: fetchedUrl } : c));
              }
            }).catch(() => {});
          }

          newClients.push(newClient);
          clientsToAdd.push(newClient);
          clientsUpdated = true;
          logToDisk("syncWhatsAppChats: creating new client " + cleanName + " with ID " + clientId + " status " + initialStatus);
        } else {
          clientId = newClients[clientIndex].id;
          
          let clientModified = false;
          let updatedClient = { ...newClients[clientIndex] };

          const prevTimestamp = updatedClient.lastMessageTimestamp || 0;

          // Check if this existing client has a LID-like phone or JID, and this incoming chat is standard
          const existingPhoneIsLid = updatedClient.phone && updatedClient.phone.length > 12 && (updatedClient.phone.startsWith('2') || updatedClient.jid?.endsWith('@lid'));
          const incomingPhoneIsStandard = !cleanJidPhone.startsWith('2') && !clientJid.endsWith('@lid');

          if (existingPhoneIsLid && incomingPhoneIsStandard) {
            const oldId = updatedClient.id;
            const newId = `c_wa_${cleanJidPhone.slice(-8)}`;

            updatedClient.phone = cleanJidPhone;
            updatedClient.jid = clientJid;
            updatedClient.id = newId;
            clientId = newId;
            clientModified = true;

            logToDisk(`syncWhatsAppChats: Upgrading LID client ${oldId} to standard client ${newId} with phone ${cleanJidPhone}`);

            if (oldId !== newId) {
              chatsToUpdate[newId] = [
                ...(chatsToUpdate[newId] || []),
                ...(chatsToUpdate[oldId] || chatsRef.current[oldId] || [])
              ];
              delete chatsToUpdate[oldId];

              if (activeChatClientIdRef.current === oldId) {
                activeChatClientIdRef.current = newId;
                setActiveChatClientId(newId);
              }
            }
          }

          const isStandardJid = clientJid.endsWith('@s.whatsapp.net');
          const currentIsStandard = updatedClient.jid && updatedClient.jid.endsWith('@s.whatsapp.net');
          
          if (!updatedClient.jid || 
              (isStandardJid && !currentIsStandard) || 
              (isStandardJid && currentIsStandard && clientJid.length > updatedClient.jid.length) ||
              (lastMsgTimestamp > prevTimestamp) // Keep JID pointing to the most recently active chat (LID or Standard)
          ) {
            updatedClient.jid = clientJid;
            jidsToUpdate.set(clientId, clientJid);
            clientModified = true;
          }
          // Extract profile picture from chat object or fetch dynamically from Evolution API
          let profilePicUrl = chat.profilePicUrl || chat.picture || chat.avatar || chat.profilePictureUrl || "";
          
          if (!profilePicUrl) {
            const cachedPic = localStorage.getItem(`crmbase_pic_${cleanJidPhone}`) || localStorage.getItem(`crmbase_pic_${clientId}`);
            if (cachedPic) {
              profilePicUrl = cachedPic;
            } else if (cleanJidPhone) {
              // Asynchronously fetch profile picture from Evolution API
              fetchEvolution(`/chat/fetchProfilePictureUrl/${EVO_CONFIG.encodedInstanceName}`, {
                method: 'POST',
                body: JSON.stringify({ number: cleanJidPhone })
              }).then(r => r.ok ? r.json() : null).then(data => {
                const fetchedUrl = data?.profilePictureUrl || data?.picture || data?.url || data?.pictureUrl || data?.profilePicUrl;
                if (fetchedUrl) {
                  localStorage.setItem(`crmbase_pic_${cleanJidPhone}`, fetchedUrl);
                  localStorage.setItem(`crmbase_pic_${clientId}`, fetchedUrl);
                  setClients(prev => prev.map(c => (c.id === clientId || c.phone?.endsWith(jidSuffix)) ? { ...c, profilePicUrl: fetchedUrl } : c));
                }
              }).catch(() => {});
            }
          }

          if (profilePicUrl && updatedClient.profilePicUrl !== profilePicUrl) {
            updatedClient.profilePicUrl = profilePicUrl;
            clientModified = true;
          }
          // If client exists but their name is currently their phone number, update it to the pushName if available
          const lastMsgPushName = chat.lastMessage?.pushName;
          const cleanName = chat.pushName || (lastMsgPushName && lastMsgPushName !== 'Você' ? lastMsgPushName : null);
          if (cleanName && updatedClient.name === updatedClient.phone && updatedClient.name !== cleanName) {
            updatedClient.name = cleanName.trim();
            clientModified = true;
            logToDisk("syncWhatsAppChats: updating name to " + cleanName + " for existing client " + clientId + " from chat.lastMessage.pushName");
          }

          // Keep last message text, time, and timestamp synced on the client object for instant list display
          const clearedTimeForClient = chatsClearedTimestampsRef.current[clientId] || 0;
          if (clearedTimeForClient > 0 && lastMsgTimestamp <= clearedTimeForClient) {
            if (updatedClient.lastMessageText !== '') {
              updatedClient.lastMessageText = '';
              updatedClient.lastMessageTime = '';
              updatedClient.lastMessageTimestamp = 0;
              clientModified = true;
            }
          } else if (updatedClient.lastMessageTimestamp !== lastMsgTimestamp) {
            updatedClient.lastMessageText = lastMsgText;
            updatedClient.lastMessageTime = lastMsgTime;
            updatedClient.lastMessageTimestamp = lastMsgTimestamp;
            clientModified = true;
          }

          if (clientModified) {
            newClients[clientIndex] = updatedClient;
            clientsUpdated = true;
          }

          // Trigger triage greeting for existing contact if inactive for > 2 days (Fase 3 / "iniciam conversa depois de muito tempo")
          if (chat.lastMessage && !chat.lastMessage.key?.fromMe && prevTimestamp > 0 && lastMsgTimestamp > prevTimestamp) {
            const timeDiff = lastMsgTimestamp - prevTimestamp;
            const twoDaysInSeconds = 2 * 24 * 60 * 60; // 172800 seconds
            if (timeDiff > twoDaysInSeconds) {
              const suffix = cleanJidPhone.slice(-8);
              logToDisk(`syncWhatsAppChats: Inactivity threshold exceeded for ${cleanJidPhone} (${timeDiff}s > 172800s). Resetting triage flags.`);
              
              localStorage.removeItem(`crmbase_triage_routed_${clientId}`);
              localStorage.removeItem(`crmbase_triage_routed_${suffix}`);
              localStorage.removeItem(`crmbase_triage_routed_time_${clientId}`);
              localStorage.removeItem(`crmbase_triage_routed_time_${suffix}`);
              localStorage.removeItem(`crmbase_triage_sent_${cleanJidPhone}`);
              localStorage.removeItem(`crmbase_triage_sent_${suffix}`);
              localStorage.removeItem(`crmbase_triage_sent_time_${suffix}`);
              localStorage.removeItem(`crmbase_triage_sent_time_${cleanJidPhone}`);
            }
          }
        }

        // Active chat gating during initial synchronization to prevent greeting active clients
        if (!waTriageSyncedRef.current) {
          const suffix = cleanJidPhone.slice(-8);
          const timeSinceLastMsg = Math.floor(Date.now() / 1000) - lastMsgTimestamp;
          const twoDaysInSeconds = 2 * 24 * 60 * 60; // 172800 seconds
          if (lastMsgTimestamp > 0 && timeSinceLastMsg <= twoDaysInSeconds) {
            // Mark as routed to bypass triage greeting
            localStorage.setItem(`crmbase_triage_routed_${clientId}`, '1');
            localStorage.setItem(`crmbase_triage_routed_${suffix}`, '1');
            localStorage.setItem(`crmbase_triage_routed_time_${clientId}`, (lastMsgTimestamp * 1000).toString());
            localStorage.setItem(`crmbase_triage_routed_time_${suffix}`, (lastMsgTimestamp * 1000).toString());
            logToDisk(`syncWhatsAppChats (initial sync): ${cleanJidPhone} is active (last message ${timeSinceLastMsg}s ago). Bypassing triage.`);
          } else {
            // Clear flags for inactive or new chats
            localStorage.removeItem(`crmbase_triage_routed_${clientId}`);
            localStorage.removeItem(`crmbase_triage_routed_${suffix}`);
            localStorage.removeItem(`crmbase_triage_routed_time_${clientId}`);
            localStorage.removeItem(`crmbase_triage_routed_time_${suffix}`);
            localStorage.removeItem(`crmbase_triage_sent_${cleanJidPhone}`);
            localStorage.removeItem(`crmbase_triage_sent_${suffix}`);
            localStorage.removeItem(`crmbase_triage_sent_time_${suffix}`);
            localStorage.removeItem(`crmbase_triage_sent_time_${cleanJidPhone}`);
            logToDisk(`syncWhatsAppChats (initial sync): ${cleanJidPhone} is inactive or new. Ready for triage.`);
          }
        }

        // Check if human operator sent a message (from platform or outside on phone)
        if (chat.lastMessage && chat.lastMessage.key?.fromMe) {
          const isPauseOnHuman = localStorage.getItem('crmbase_sdr_pause_human') === 'true';
          const isDisableOutside = localStorage.getItem('crmbase_sdr_disable_outside') === 'true';
          
          if (isPauseOnHuman || isDisableOutside) {
            const suffix = cleanJidPhone.slice(-8);
            localStorage.setItem(`crmbase_triage_routed_${clientId}`, '1');
            localStorage.setItem(`crmbase_triage_routed_${suffix}`, '1');
            localStorage.setItem(`crmbase_triage_routed_time_${clientId}`, Date.now().toString());
            localStorage.setItem(`crmbase_triage_routed_time_${suffix}`, Date.now().toString());
            logToDisk(`syncWhatsAppChats: Human/Outside message fromMe detected for ${cleanJidPhone}. Pausing agent for this conversation.`);
          }
        }

        // Instant Supabase Save for any incoming or outgoing message from WhatsApp sync
        if (lastMsgText && lastMsgId) {
          const alreadySavedKey = `crmbase_sp_saved_${lastMsgId}`;
          if (!localStorage.getItem(alreadySavedKey)) {
            localStorage.setItem(alreadySavedKey, '1');
            const isFromMe = chat.lastMessage?.key?.fromMe;
            saveChatMessageToSupabase(clientId, isFromMe ? 'operador' : 'cliente', lastMsgText);
          }
        }

        // Check if lastMessage is a button reply or text choice from the contact
        if (chat.lastMessage && !chat.lastMessage.key?.fromMe) {
          const currentChatMsgs = chatsRef.current[clientId] || [];
          const localLastMsg = currentChatMsgs[currentChatMsgs.length - 1];
          const hasNewMessage = lastMsgId && (!localLastMsg || localLastMsg.id !== lastMsgId);
          
          // Only trigger triage if initial synchronization is complete and message is after syncFinishedAt
          const isAfterSync = waTriageSyncedRef.current && lastMsgTimestamp > waTriageSyncFinishedAtRef.current;

          // Only trigger triage or routing if it is a new message and sent recently (within last 5 minutes)
          const isRecent = lastMsgTimestamp >= (Math.floor(Date.now() / 1000) - 300);

          if (hasNewMessage && isAfterSync && isRecent) {
            const buttonId = getButtonReplyId(chat.lastMessage);
            const clientObj = newClients.find(c => c.id === clientId);
            const suffix = cleanJidPhone.slice(-8);
            const identifier = clientObj ? clientObj.id : `c_wa_${suffix}`;
            
            // Check if contact has card in Kanban
            const hasCard = kanbanCardsRef.current ? kanbanCardsRef.current.some(card => card.clientId === identifier || card.id === `k_wa_${suffix}`) : false;
            
            // If they don't have an active card in the Kanban, clear their routing flags to allow re-triage!
            if (!hasCard) {
              localStorage.removeItem(`crmbase_triage_routed_${identifier}`);
              localStorage.removeItem(`crmbase_triage_routed_${suffix}`);
              localStorage.removeItem(`crmbase_triage_routed_time_${identifier}`);
              localStorage.removeItem(`crmbase_triage_routed_time_${suffix}`);
            }

            const isNotRouted = !localStorage.getItem(`crmbase_triage_routed_${identifier}`) &&
                                !localStorage.getItem(`crmbase_triage_routed_${suffix}`);
            
            if (isNotRouted) {
              const routedStatus = routeClientBasedOnChoice(cleanJidPhone, lastMsgText, buttonId, identifier, newClients);
              if (routedStatus) {
                clientsUpdated = true;
              } else {
                triggerTriageGreetingLocal(cleanJidPhone, clientJid);
              }
            }

            // TRIGGER REAL-TIME AGENT RESPONSE ON WHATSAPP CONTACT MESSAGES
            const isSdrEnabled = localStorage.getItem('crmbase_sdr_enabled') !== 'false';
            const sdrIgnoreGroups = localStorage.getItem('crmbase_sdr_ignore_groups') !== 'false';
            const isGroupChat = clientJid.includes('@g.us') || isGroup;

            if (isSdrEnabled && lastMsgText && (!isGroupChat || !sdrIgnoreGroups)) {
              const lastMsg = chat.lastMessage;
              let fileObj = null;
              if (lastMsg?.message?.imageMessage) {
                fileObj = { name: "Imagem", type: lastMsg.message.imageMessage.mimetype || "image/jpeg", keyId: lastMsgId };
              } else if (lastMsg?.message?.documentMessage) {
                fileObj = { name: lastMsg.message.documentMessage.fileName || "Documento.pdf", type: lastMsg.message.documentMessage.mimetype || "application/pdf", keyId: lastMsgId };
              } else if (lastMsg?.message?.audioMessage) {
                fileObj = { name: "Áudio", type: lastMsg.message.audioMessage.mimetype || "audio/ogg", keyId: lastMsgId };
              }

              const isAudioType = lastMsg?.messageType === 'audioMessage' || lastMsgText.includes('🔊 Áudio') || lastMsgText.includes('Áudio');
              
              if (isAudioType && lastMsgId) {
                logToDisk(`syncWhatsAppChats: Incoming audio detected for ${cleanJidPhone}. Attempting Whisper transcription...`);
                fetchMediaBase64(lastMsgId).then(audioBase64 => {
                  if (audioBase64) {
                    // Send to Whisper transcription
                    const openAiKey = (localStorage.getItem('crmbase_sdr_apikey') || localStorage.getItem('crmbase_openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '').trim();
                    if (openAiKey) {
                      try {
                        const pureBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
                        const byteCharacters = atob(pureBase64);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const audioBlob = new Blob([byteArray], { type: 'audio/ogg' });
                        
                        const formData = new FormData();
                        formData.append('file', audioBlob, 'audio.ogg');
                        formData.append('model', 'whisper-1');
                        formData.append('language', 'pt');

                        fetch('https://api.openai.com/v1/audio/transcriptions', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${openAiKey}` },
                          body: formData
                        })
                        .then(r => r.json())
                        .then(data => {
                          if (data.text) {
                            logToDisk(`syncWhatsAppChats: Whisper audio transcription success: "${data.text}"`);
                            generateSimulatedAiReply(data.text, clientId, fileObj);
                          } else {
                            generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                          }
                        })
                        .catch(err => {
                          logToDisk(`syncWhatsAppChats: Whisper API error: ${err.message}`, "WARN");
                          generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                        });
                      } catch (e) {
                        logToDisk(`syncWhatsAppChats: Audio blob error: ${e.message}`, "WARN");
                        generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                      }
                    } else {
                      generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                    }
                  } else {
                    generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                  }
                }).catch(() => {
                  generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                });
              } else {
                logToDisk(`syncWhatsAppChats: Triggering AI Agent reply for WhatsApp contact ${cleanJidPhone} (${clientId}): "${lastMsgText}" (File: ${fileObj?.name || 'N/A'})`);
                setTimeout(() => {
                  generateSimulatedAiReply(lastMsgText, clientId, fileObj);
                }, 1200);
              }
            }
          }
        }

        // Check message history sync
        const currentChatMsgs = chatsRef.current[clientId] || [];
        const localLastMsg = currentChatMsgs[currentChatMsgs.length - 1];

        // WhatsApp unread status: set blue dot ONLY IF incoming message timestamp is strictly NEWER than the stored readTimestamp
        const isIncoming = chat.lastMessage && !chat.lastMessage.key?.fromMe;
        const isActiveChat = (clientId === activeChatClientIdRef.current);
        
        const readTsStr = localStorage.getItem(`crmbase_read_ts_${clientId}`) || localStorage.getItem(`crmbase_read_ts_${jidSuffix}`) || '0';
        const readTimestamp = parseInt(readTsStr, 10) || 0;

        // Message is new ONLY if it is incoming AND its timestamp is strictly greater than when the user last read the chat
        const isNewUnreadIncoming = isIncoming && lastMsgTimestamp > readTimestamp;

        if (isActiveChat) {
          // Open active chat is always marked read up to the current time / last message
          const currentTs = Math.max(lastMsgTimestamp || 0, Math.floor(Date.now() / 1000));
          localStorage.setItem(`crmbase_read_ts_${clientId}`, currentTs.toString());
          if (jidSuffix) localStorage.setItem(`crmbase_read_ts_${jidSuffix}`, currentTs.toString());
          setUnreadChats(prev => prev.filter(id => id !== clientId && id !== `c_wa_${jidSuffix}`));
        } else if (isNewUnreadIncoming) {
          setUnreadChats(prev => {
            if (!prev.includes(clientId)) {
              return [...prev, clientId];
            }
            return prev;
          });
        } else {
          // No new incoming message since last read
          setUnreadChats(prev => prev.filter(id => id !== clientId && id !== `c_wa_${jidSuffix}`));
        }

        // Check if any legacy message placeholder exists (contains "Recebido" or "Recebida") but lacks the parsed file metadata
        const hasMissingFileInfo = currentChatMsgs.some(m => 
          (m.text && (
            m.text.includes("Recebido") || 
            m.text.includes("Recebida")
          ) && (
            m.text.includes("Áudio") || 
            m.text.includes("Imagem") || 
            m.text.includes("Documento") || 
            m.text.includes("Figurinha") || 
            m.text.includes("Vídeo")
          )) && !m.file
        );

        const clearedTime = chatsClearedTimestampsRef.current[clientId] || 0;



        // Fetch full message history only for the active chat (to show messages in the chat window)
        // or for unrouted clients to maintain triage logic consistency
        const clientObjForHistory = newClients.find(c => c.id === clientId);
        const needsPollCheck = clientObjForHistory && clientObjForHistory.status === 'Pessoal' &&
          !localStorage.getItem(`crmbase_triage_routed_${clientId}`);
        const hasNewMessage = lastMsgId && (!localLastMsg || localLastMsg.id !== lastMsgId);

        if (lastMsgId && (clientId === activeChatClientIdRef.current || needsPollCheck || hasNewMessage || hasMissingFileInfo)) {
          try {
            logToDisk("syncWhatsAppChats: fetching history for " + clientJid);
            const msgRes = await fetchEvolution(`/chat/findMessages/${EVO_CONFIG.encodedInstanceName}`, { 
              method: 'POST', 
              body: JSON.stringify({
                where: {
                  key: {
                    remoteJid: clientJid
                  }
                }
              })
            });
            logToDisk("syncWhatsAppChats: findMessages res ok=" + msgRes.ok + ", status=" + msgRes.status);
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              const rawRecords = msgData?.messages?.records || [];
              logToDisk("syncWhatsAppChats: found " + rawRecords.length + " raw message records for " + clientJid);
              
              const formattedMessages = [];
              const edits = [];

              rawRecords.forEach(msg => {
                const isFromMe = msg.key?.fromMe;
                
                // Parse full text and button ID up front to detect interactive choices in history
                const buttonId = getButtonReplyId(msg);
                let text = "";
                if (msg.message) {
                  text = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || 
                         msg.message.videoMessage?.caption || 
                         msg.message.buttonsResponseMessage?.selectedDisplayText ||
                         msg.message.buttonsResponseMessage?.selectedButtonId ||
                         msg.message.listResponseMessage?.title ||
                         msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                         msg.message.interactiveResponseMessage?.body?.text ||
                         msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
                         msg.message.templateButtonReplyMessage?.selectedId ||
                         msg.message.pollUpdateMessage?.vote?.selectedOptions?.[0]?.optionName ||
                         msg.message.pollUpdateMessage?.selectedOptions?.[0]?.optionName ||
                         "";
                }



                // Check if it's an edit protocol message
                let isEditProtocol = false;
                let targetMessageId = null;
                let editedText = "";

                if (msg.messageType === "secretEncryptedMessage" || msg.message?.secretEncryptedMessage) {
                  const sem = msg.message?.secretEncryptedMessage || msg.secretEncryptedMessage;
                  targetMessageId = sem?.targetMessageKey?.id;
                  if (targetMessageId) {
                    isEditProtocol = true;
                  }
                } else if (msg.messageType === "protocolMessage" || msg.message?.protocolMessage) {
                  const pm = msg.message?.protocolMessage || msg.protocolMessage;
                  // Protocol type 14 is MESSAGE_EDIT in Baileys
                  if (pm?.type === 14 || pm?.type === 'MESSAGE_EDIT' || pm?.editedMessage || pm?.key?.id) {
                    targetMessageId = pm?.key?.id;
                    if (targetMessageId) {
                      isEditProtocol = true;
                      const editedMsg = pm?.editedMessage;
                      if (editedMsg) {
                        editedText = editedMsg.conversation || 
                                     editedMsg.extendedTextMessage?.text || 
                                     editedMsg.imageMessage?.caption || 
                                     editedMsg.videoMessage?.caption || 
                                     "";
                      }
                    }
                  }
                }

                if (!text) {
                  if (msg.message?.audioMessage) text = "🔊 Áudio Recebido";
                  else if (msg.message?.imageMessage) text = "📷 Imagem Recebida";
                  else if (msg.message?.videoMessage) text = "🎥 Vídeo Recebido";
                  else if (msg.message?.documentMessage) text = "📄 Documento Recebido";
                  else if (msg.message?.stickerMessage) text = "👾 Figurinha Recebida";
                  else if (msg.message?.contactMessage) text = "👤 Contato Recebido";
                  else if (msg.message?.locationMessage) text = "📍 Localização Recebida";
                  else text = "Mensagem recebida";
                }
                
                let file = null;
                if (msg.message?.audioMessage) {
                  file = { name: "Áudio", type: msg.message.audioMessage.mimetype || "audio/ogg", url: null, keyId: msg.key?.id };
                } else if (msg.message?.imageMessage) {
                  file = { name: "Imagem", type: msg.message.imageMessage.mimetype || "image/jpeg", url: null, keyId: msg.key?.id };
                } else if (msg.message?.videoMessage) {
                  file = { name: "Vídeo", type: msg.message.videoMessage.mimetype || "video/mp4", url: null, keyId: msg.key?.id };
                } else if (msg.message?.documentMessage) {
                  file = { name: msg.message.documentMessage.fileName || "Documento", type: msg.message.documentMessage.mimetype || "application/pdf", url: null, keyId: msg.key?.id };
                } else if (msg.message?.stickerMessage) {
                  file = { name: "Figurinha", type: msg.message.stickerMessage.mimetype || "image/webp", url: null, keyId: msg.key?.id, isSticker: true };
                }

                const timestampObj = msg.messageTimestamp;
                const timestamp = typeof timestampObj === 'object' && timestampObj !== null
                  ? (timestampObj.low || timestampObj.toNumber?.() || 0)
                  : (timestampObj || 0);

                const time = timestamp 
                  ? new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let quotedMessage = null;
                const contextInfo = msg.message?.extendedTextMessage?.contextInfo || 
                                    msg.message?.imageMessage?.contextInfo ||
                                    msg.message?.videoMessage?.contextInfo ||
                                    msg.message?.audioMessage?.contextInfo ||
                                    msg.message?.documentMessage?.contextInfo;
                if (contextInfo?.quotedMessage) {
                  const qMsg = contextInfo.quotedMessage;
                  const qText = qMsg.conversation || qMsg.extendedTextMessage?.text || qMsg.imageMessage?.caption || qMsg.videoMessage?.caption || "";
                  const isQuoteFromContact = contextInfo.participant === clientJid;
                  
                  quotedMessage = {
                    id: contextInfo.stanzaId || `m_q_${Date.now()}`,
                    sender: isQuoteFromContact ? 'contact' : 'user',
                    senderName: isQuoteFromContact ? (msg.pushName || 'Contato') : 'Você',
                    text: qText || (qMsg.imageMessage ? "📷 Imagem" : qMsg.videoMessage ? "🎥 Vídeo" : qMsg.audioMessage ? "🔊 Áudio" : qMsg.documentMessage ? "📄 Documento" : "")
                  };
                }

                const formattedMsg = {
                  id: msg.key?.id || msg.id || `m_wa_${timestamp}_${Math.random()}`,
                  keyId: msg.key?.id,
                  sender: isFromMe ? 'user' : 'contact',
                  text: text,
                  time: time,
                  file: file,
                  senderName: isFromMe ? 'Você' : (msg.pushName || 'Contato'),
                  timestamp: timestamp || Math.floor(Date.now() / 1000),
                  quotedMessage: quotedMessage
                };

                if (isEditProtocol && targetMessageId) {
                  edits.push({
                    targetMessageId: targetMessageId,
                    editedText: editedText
                  });
                } else {
                  formattedMessages.push(formattedMsg);
                }
              });

              // Apply edits to original messages in formattedMessages and existingMsgs
              edits.forEach(edit => {
                const targetKey = edit.targetMessageId;
                if (!targetKey) return;

                if (edit.editedText) {
                  editedMessageTextsRef.current[targetKey] = edit.editedText;
                }

                const orig = formattedMessages.find(m => m.keyId === targetKey || m.id === targetKey);
                if (orig) {
                  orig.isEdited = true;
                  if (edit.editedText) orig.text = edit.editedText;
                }
                const existing = (chatsToUpdate[clientId] || chatsRef.current[clientId] || []).find(m => m.keyId === targetKey || m.id === targetKey);
                if (existing) {
                  existing.isEdited = true;
                  if (edit.editedText) existing.text = edit.editedText;
                }
              });

              const filteredMessages = formattedMessages.filter(msg => {
                if (clearedTime > 0 && msg.timestamp <= clearedTime) return false;
                const msgKey = msg.keyId || msg.id;
                if (deletedMessageKeysRef.current[msgKey] || deletedMessageKeysRef.current[msg.id]) return false;
                return true;
              });

              // Merge, sort ascending by timestamp and keep last 35 messages to protect local storage quota
              const rawExistingMsgs = chatsToUpdate[clientId] || chatsRef.current[clientId] || [];
              const existingMsgs = rawExistingMsgs.filter(msg => {
                if (clearedTime > 0 && msg.timestamp <= clearedTime) return false;
                const msgKey = msg.keyId || msg.id;
                if (deletedMessageKeysRef.current[msgKey] || deletedMessageKeysRef.current[msg.id]) return false;
                return true;
              });
              const combined = [...existingMsgs, ...filteredMessages];
              const uniqueMsgsMap = new Map();

              combined.forEach(m => {
                const key = m.keyId || m.id;
                if (deletedMessageKeysRef.current[key] || deletedMessageKeysRef.current[m.id]) return;

                // Check if this server message matches a temporary local optimistic message (id starting with m_u_)
                if (m.keyId && !m.id.startsWith('m_u_')) {
                  const serverCleanText = (m.text || '').replace(/^\*[^*]+:\*\s*/, '').trim();
                  for (const [existingKey, existingItem] of uniqueMsgsMap.entries()) {
                    if (existingItem.id && existingItem.id.startsWith('m_u_')) {
                      const localCleanText = (existingItem.text || '').replace(/^\*[^*]+:\*\s*/, '').trim();
                      const sameSender = existingItem.sender === m.sender;
                      const sameText = localCleanText === serverCleanText || (m.text || '').includes(localCleanText);
                      const timeDiff = Math.abs((existingItem.timestamp || 0) - (m.timestamp || 0));
                      if (sameSender && (sameText || timeDiff <= 15)) {
                        if (existingItem.keyId && !m.keyId) {
                          m.keyId = existingItem.keyId;
                        }
                        uniqueMsgsMap.delete(existingKey);
                        break;
                      }
                    }
                  }
                }

                uniqueMsgsMap.set(key, m);
              });

              const merged = Array.from(uniqueMsgsMap.values()).map(msg => {
                const msgKey = msg.keyId || msg.id;
                const savedEditedText = editedMessageTextsRef.current[msgKey] || editedMessageTextsRef.current[msg.id] || editedMessageTextsRef.current[msg.keyId];
                if (savedEditedText) {
                  return { ...msg, text: savedEditedText, isEdited: true };
                }
                return msg;
              });
              merged.sort((a, b) => a.timestamp - b.timestamp);
              chatsToUpdate[clientId] = merged.slice(-35);
              
              // If the client's name is currently their phone number, check message history for a real contact name
              const contactMsg = rawRecords.find(msg => !msg.key?.fromMe && msg.pushName && msg.pushName !== 'Você');
              if (contactMsg?.pushName) {
                const foundName = contactMsg.pushName.trim();
                const clientIndex = newClients.findIndex(c => c.id === clientId);
                if (clientIndex !== -1 && newClients[clientIndex].name !== foundName && newClients[clientIndex].name === newClients[clientIndex].phone) {
                  newClients[clientIndex] = { ...newClients[clientIndex], name: foundName };
                  clientsUpdated = true;
                  logToDisk("syncWhatsAppChats: updating name to " + foundName + " for existing client " + clientId + " from message history");
                }
              }
              // Persist newly synced messages from WhatsApp to the user's configured Supabase chat table
              formattedMessages.forEach(m => {
                if ((m.text && m.text.trim()) || m.file) {
                  const alreadySavedKey = `crmbase_sp_saved_${m.id || m.keyId}`;
                  if (!localStorage.getItem(alreadySavedKey)) {
                    localStorage.setItem(alreadySavedKey, '1');
                    saveChatMessageToSupabase(
                      clientId, 
                      m.sender === 'user' ? 'operador' : 'cliente', 
                      m.text, 
                      m.file, 
                      m.senderName, 
                      m.timestamp
                    );
                  }
                }
              });            }
          } catch (err) {
            logToDisk("syncWhatsAppChats error fetching messages for " + clientJid + ": " + err.message, "ERROR");
            console.error(`Erro ao buscar mensagens para ${clientJid}:`, err);
          }
        }
      }

      if (clientsUpdated) {
        logToDisk("syncWhatsAppChats: saving updated clients and Kanban cards");
        
        setClients(prevClients => {
          // Create a map of newClients by ID for easy lookup of updated fields
          const newClientsMap = new Map(newClients.map(c => [c.id, c]));

          // Map prevClients to copy any updates (JID, Name, etc.) from newClients
          const merged = prevClients.map(c => {
            const updated = newClientsMap.get(c.id);
            if (updated) {
              return updated;
            }
            return c;
          });

          // Add any new clients that were added to clientsToAdd but don't exist in prevClients
          const prevIds = new Set(prevClients.map(c => c.id));
          clientsToAdd.forEach(newC => {
            if (!prevIds.has(newC.id)) {
              merged.push(newC);
            }
          });

          return merged;
        });

        setKanbanCards(prevCards => {
          const mergedCards = [...prevCards];
          cardsToAdd.forEach(newCard => {
            if (!prevCards.some(card => card.id === newCard.id)) {
              mergedCards.push(newCard);
            }
          });
          return mergedCards;
        });
      }

      if (Object.keys(chatsToUpdate).length > 0) {
        setChats(prev => {
          let hasAnyChange = false;
          const updatedChats = { ...prev };
          
          for (const [clientId, newMsgs] of Object.entries(chatsToUpdate)) {
            const prevMsgs = prev[clientId] || [];
            
            // Compare lengths first
            let changed = prevMsgs.length !== newMsgs.length;
            
            // Compare message contents if length is same
            if (!changed) {
              for (let i = 0; i < newMsgs.length; i++) {
                const pm = prevMsgs[i];
                const nm = newMsgs[i];
                if (
                  pm.id !== nm.id || 
                  pm.sender !== nm.sender || 
                  pm.text !== nm.text || 
                  pm.timestamp !== nm.timestamp ||
                  pm.isEdited !== nm.isEdited ||
                  JSON.stringify(pm.file) !== JSON.stringify(nm.file)
                ) {
                  changed = true;
                  break;
                }
              }
            }
            
            if (changed) {
              updatedChats[clientId] = newMsgs;
              hasAnyChange = true;
            }
          }
          
          if (hasAnyChange) {
            logToDisk("syncWhatsAppChats: saving updated chat histories for change-detected clients");
            return updatedChats;
          }
          return prev;
        });
      }

      // Mark initial sync as completed
      if (!waTriageSyncedRef.current) {
        setWaTriageSynced(true);
        const finishedAt = Math.floor(Date.now() / 1000);
        setWaTriageSyncFinishedAt(finishedAt);
        logToDisk(`syncWhatsAppChats: Initial sync completed successfully. waTriageSyncFinishedAt set to ${finishedAt} (${new Date(finishedAt * 1000).toLocaleString()})`);
      }
    } catch (err) {
      logToDisk("syncWhatsAppChats main loop error: " + err.message, "ERROR");
      console.error("Erro no sincronismo do WhatsApp:", err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  // One-time cleanup to make previously deleted contacts reappear
  useEffect(() => {
    if (!localStorage.getItem('crmbase_restored_deleted_v3')) {
      logToDisk("One-time cleanup: clearing deleted contact filters to restore them");
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('crmbase_deleted_contact_') || key === 'crmbase_permanently_deleted_contacts')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('crmbase_restored_deleted_v3', 'true');
    }
  }, []);

  // WhatsApp Poll Effect every 2.5 seconds when ONLINE for ultra-fast response
  useEffect(() => {
    let interval;
    logToDisk("useEffect [waStatus] triggered. waStatus=" + waStatus);
    if (waStatus === 'ONLINE') {
      syncWhatsAppChats();
      interval = setInterval(syncWhatsAppChats, 2500);
    }
    return () => {
      logToDisk("useEffect [waStatus] cleanup. waStatus=" + waStatus);
      if (interval) clearInterval(interval);
    };
  }, [waStatus]);

  // Trigger sync immediately when active chat changes to load history instantly
  useEffect(() => {
    logToDisk("useEffect [activeChatClientId, waStatus] triggered. activeChatClientId=" + activeChatClientId + ", waStatus=" + waStatus);
    if (waStatus === 'ONLINE' && activeChatClientId) {
      syncWhatsAppChats();
    }
  }, [activeChatClientId, waStatus]);

  // Bot responses templates
  const botResponses = [
    "Recebido! Vou verificar esta informação e já retorno para você.",
    "Perfeito, farei isso imediatamente.",
    "Poderia me dar mais detalhes sobre isso para que eu te ajude melhor?",
    "Entendido. Vamos agendar uma conversa rápida para alinhar esses pontos?",
    "Ótimo! Obrigado pelo retorno.",
    "Estou analisando a proposta e te envio uma resposta até o fim do dia."
  ];

  // Apply Theme on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eloos_theme', theme);
  }, [theme]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('eloos_auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('eloos_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('eloos_kanban', JSON.stringify(kanbanCards));
  }, [kanbanCards]);

  useEffect(() => {
    localStorage.setItem('eloos_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('eloos_chats_cleared_timestamps', JSON.stringify(chatsClearedTimestamps));
  }, [chatsClearedTimestamps]);

  useEffect(() => {
    localStorage.setItem('eloos_lead_agent_enabled', agentEnabled);
  }, [agentEnabled]);

  useEffect(() => {
    localStorage.setItem('eloos_lead_agent_rules', JSON.stringify(agentRules));
  }, [agentRules]);

  useEffect(() => {
    localStorage.setItem('eloos_lead_agent_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('eloos_lead_agent_suggestions', JSON.stringify(aiSuggestions));
  }, [aiSuggestions]);

  useEffect(() => {
    localStorage.setItem('eloos_lead_agent_schedule', agentSchedule);
  }, [agentSchedule]);

  useEffect(() => {
    localStorage.setItem('eloos_quicklinks', JSON.stringify(quickLinks));
  }, [quickLinks]);

  useEffect(() => {
    localStorage.setItem('crmbase_quick_replies', JSON.stringify(quickReplies));
  }, [quickReplies]);

  useEffect(() => {
    localStorage.setItem('eloos_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('crmbase_wa_status', waStatus);
  }, [waStatus]);



  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('eloos_auth', 'false');
  };

  const register = (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (systemUsers.some(u => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email: email.trim(),
      role: 'Administrador',
      status: 'Ativo',
      password: password.trim()
    };

    setSystemUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const addClient = (client) => {
    const newId = `c_${Date.now()}`;
    const newClient = {
      empreendimento: client.empreendimento || "Todos",
      situacaoComercial: client.situacaoComercial || "Interessado",
      dataVisita: client.dataVisita || "",
      propostaRegistrada: client.propostaRegistrada || false,
      contratoConfirmado: client.contratoConfirmado || false,
      historicoAtividades: [],
      camposPersonalizados: client.camposPersonalizados || {},
      interesseDemonstrado: client.interesseDemonstrado || false,
      ...client,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      status: client.status || 'Lead'
    };

    if (client.phone) {
      const cleanPhone = client.phone.replace(/\D/g, '');
      const suffix = cleanPhone.slice(-8);
      localStorage.removeItem(`crmbase_deleted_contact_${suffix}`);
    }

    setClients(prev => [...prev, newClient]);
    
    // Automatically create a chat channel
    setChats(prev => ({
      ...prev,
      [newId]: [{ id: `m_${Date.now()}`, sender: 'contact', text: `Canal de conversa iniciado para ${newClient.name}.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]
    }));

    // Automatically create a Kanban card for this client in the selected column
    const newCard = {
      id: `k_${Date.now()}`,
      clientId: newId,
      title: `${newClient.name} - Novo Registro`,
      desc: `Acompanhar interesse do cliente. E-mail: ${newClient.email}`,
      column: mapStatusToColumn(newClient.status),
      priority: 'Média',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
    };
    setKanbanCards(prev => [...prev, newCard]);

    return newClient;
  };

  const mapStatusToColumn = (status) => {
    if (!status) return 'pessoal_a_fazer';
    const statusLower = status.trim().toLowerCase();

    // Normalized direct matching to tolerate accents, casing, and trailing whitespace
    if (statusLower === 'pessoal') {
      return 'pessoal_a_fazer';
    }
    if (statusLower === 'contábil/fiscal' || statusLower === 'contabil/fiscal') {
      return 'contabil_a_fazer';
    }
    if (statusLower === 'emissão de documentos fiscais' || statusLower === 'emissao de documentos fiscais') {
      return 'documentos_a_fazer';
    }
    if (statusLower === 'administrativo') {
      return 'admin_a_fazer';
    }

    const saved = localStorage.getItem('crmbase_pipelines');
    const pipelines = saved ? JSON.parse(saved) : [
      { id: 'pessoal', name: 'Pessoal' },
      { id: 'contabil_fiscal', name: 'Contábil/Fiscal' },
      { id: 'documentos_fiscais', name: 'Emissão de Documentos Fiscais' },
      { id: 'administrativo', name: 'Administrativo' }
    ];
    
    const foundPipe = pipelines.find(p => p.name.trim().toLowerCase() === statusLower);
    if (foundPipe) {
      if (foundPipe.id === 'pessoal') return 'pessoal_a_fazer';
      if (foundPipe.id === 'contabil_fiscal') return 'contabil_a_fazer';
      if (foundPipe.id === 'documentos_fiscais') return 'documentos_a_fazer';
      if (foundPipe.id === 'administrativo') return 'admin_a_fazer';
      return `${foundPipe.id}_a_fazer`;
    }

    return 'pessoal_a_fazer';
  };

  const updateClient = (updatedClient) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    
    // Update or create client card on Kanban
    setKanbanCards(prev => {
      const targetColumn = mapStatusToColumn(updatedClient.status);
      const hasCard = prev.some(card => card.clientId === updatedClient.id);
      
      if (hasCard) {
        return prev.map(card => {
          if (card.clientId === updatedClient.id) {
            return {
              ...card,
              title: card.title.includes(' - ') ? card.title.replace(/.* - /, `${updatedClient.name} - `) : `${updatedClient.name} - Negócio`,
              column: targetColumn,
              priority: updatedClient.priority || card.priority || 'Média'
            };
          }
          return card;
        });
      } else {
        const newCard = {
          id: `k_${Date.now()}`,
          clientId: updatedClient.id,
          title: `${updatedClient.name} - Negócio`,
          desc: `Acompanhamento do cliente ${updatedClient.name}. Contato: ${updatedClient.phone || updatedClient.email || ''}`,
          column: targetColumn,
          priority: updatedClient.priority || 'Média',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        return [...prev, newCard];
      }
    });
  };

  const deleteClient = (id) => {
    logToDisk(`deleteClient: Starting deletion process for client ${id}`);

    // Passo 1: Localizar o contato
    const client = clients.find(c => c.id === id);
    if (!client) {
      logToDisk(`deleteClient: Client ${id} not found in state`, "WARNING");
      return;
    }

    const cleanPhone = client.phone.replace(/\D/g, '');
    const suffix = cleanPhone.slice(-8);
    const lastMsgTimestamp = client.lastMessageTimestamp || Math.floor(Date.now() / 1000);

    logToDisk(`deleteClient: Found client "${client.name}" with phone suffix "${suffix}"`);

    // Passo 2 & 3: Localizar todas as conversas e mensagens vinculadas
    const clientChats = chats[id] || [];
    logToDisk(`deleteClient: Found ${clientChats.length} messages linked to client ${id}`);

    // Passo 4: Executar a exclusão na ordem correta respeitando relacionamentos
    // 1. Definir o timestamp de exclusão e remover flags de triagem
    localStorage.setItem(`crmbase_deleted_contact_${suffix}`, lastMsgTimestamp.toString());
    localStorage.removeItem(`crmbase_triage_sent_${cleanPhone}`);
    localStorage.removeItem(`crmbase_triage_sent_${suffix}`);
    localStorage.removeItem(`crmbase_triage_sent_time_${suffix}`);
    localStorage.removeItem(`crmbase_triage_sent_time_${cleanPhone}`);
    localStorage.removeItem(`crmbase_triage_routed_${id}`);
    localStorage.removeItem(`crmbase_triage_routed_${suffix}`);
    localStorage.removeItem(`crmbase_triage_routed_time_${id}`);
    localStorage.removeItem(`crmbase_triage_routed_time_${suffix}`);

    logToDisk(`deleteClient: Deletion timestamp updated for phone suffix "${suffix}"`);

    // Passo 5 & 6: Atualizar o estado local e as referências
    // 1. Remover do estado visual dos clientes
    setClients(prev => {
      const filtered = prev.filter(c => c.id !== id);
      logToDisk(`deleteClient: Client removed from state list. New length: ${filtered.length}`);
      return filtered;
    });

    // 2. Remover do quadro Kanban
    setKanbanCards(prev => {
      const filtered = prev.filter(card => card.clientId !== id);
      logToDisk(`deleteClient: Kanban cards linked to client ${id} removed.`);
      return filtered;
    });

    // 3. Remover conversas e mensagens
    setChats(prev => {
      const copy = { ...prev };
      delete copy[id];
      logToDisk(`deleteClient: Conversation history for client ${id} wiped.`);
      return copy;
    });

    // 4. Limpar timestamps de conversas limpas
    setChatsClearedTimestamps(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    // 5. Remover do estado de conversas não lidas
    setUnreadChats(prev => {
      const filtered = prev.filter(clientId => clientId !== id);
      logToDisk(`deleteClient: Unread badge status cleared.`);
      return filtered;
    });

    // Passo 7: Garantir que o contato não seja reidratado ou recriado automaticamente
    // (Garantido pelo filtro 'crmbase_deleted_contact_suffix' em syncWhatsAppChats)
    logToDisk(`deleteClient: Deletion process completed successfully for ${client.name}`);
  };

  // Utility to clear testing cache specifically for any contact with name containing "Miguel Marques"
  useEffect(() => {
    window.clearMiguelMarques = () => {
      console.log("Starting Miguel Marques cache wipe...");
      
      // Wipe localStorage triage flags for Miguel's potential phone suffix
      Object.keys(localStorage).forEach(key => {
        if (key.includes("triage") || key.startsWith("crmbase_poll_handled_")) {
          localStorage.removeItem(key);
          console.log(`Cleared flag: ${key}`);
        }
      });

      // Find client IDs
      const miguelClients = clientsRef.current.filter(c => (c.name || '').toLowerCase().includes("miguel marques"));
      miguelClients.forEach(c => {
        deleteClient(c.id);
        console.log(`Deleted client: ${c.name} (${c.id})`);
      });

      console.log("Miguel Marques test cache wiped successfully! Ready for new message triage test.");
    };

    window.clearAllCaches = () => {
      console.log("Wiping all local storage databases and caches...");
      
      // Wipe localStorage items
      const keysToClear = [
        'eloos_clients',
        'eloos_kanban',
        'eloos_chats',
        'eloos_chats_cleared_timestamps',
        'crmbase_unread_chats'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      
      // Wipe triage tags/polls sent
      Object.keys(localStorage).forEach(key => {
        if (key.includes("triage") || key.startsWith("crmbase_poll_handled_")) {
          localStorage.removeItem(key);
        }
      });

      // Reset states back to initial defaults
      setClients(initialClients);
      setKanbanCards(initialKanbanCards);
      setChats(initialChats);
      setUnreadChats([]);
      setChatsClearedTimestamps({});

      console.log("All caches wiped! The system is now completely clean.");
    };

    // Clear legacy mock default quick replies if present
    const savedQuickReplies = localStorage.getItem('crmbase_quick_replies');
    if (savedQuickReplies) {
      const parsed = safeJsonParse(savedQuickReplies, []);
      if (Array.isArray(parsed) && parsed.some(r => ['qr_1', 'qr_2', 'qr_3'].includes(r.id))) {
        const cleaned = parsed.filter(r => !['qr_1', 'qr_2', 'qr_3'].includes(r.id));
        localStorage.setItem('crmbase_quick_replies', JSON.stringify(cleaned));
        setQuickReplies(cleaned);
      }
    }

    // Auto-wipe old local caches on first run to clean up previous sessions for the user
    if (!localStorage.getItem('crmbase_clean_final_delivery')) {
      localStorage.setItem('crmbase_clean_final_delivery', '1');
      window.clearAllCaches();
    }
  }, []);

  const clearChat = (clientId) => {
    if (clientId === 'client_teste_agente') {
      localStorage.removeItem('crmbase_triage_routed_client_teste_agente');
      setKanbanCards(prev => prev.filter(c => c.clientId !== 'client_teste_agente'));
      setRawClients(prev => prev.map(c => c.id === 'client_teste_agente' ? { ...c, status: 'Pessoal' } : c));
    }

    const nowUnix = Math.floor(Date.now() / 1000);
    const clearedTime = nowUnix;

    setClients(prev => prev.map(c => c.id === clientId ? {
      ...c,
      lastMessageText: '',
      lastMessageTime: '',
      lastMessageTimestamp: 0
    } : c));

    setChatsClearedTimestamps(prev => ({
      ...prev,
      [clientId]: clearedTime
    }));

    setChats(prev => ({
      ...prev,
      [clientId]: []
    }));
  };

  const generateSimulatedAiReply = async (userPrompt, targetClientId = 'client_teste_agente', fileData = null) => {
    const sdrBehavior = localStorage.getItem('crmbase_sdr_behavior') || 'Você é um assistente virtual SDR atencioso, inteligente e prestativo.';
    const welcomeMsg = localStorage.getItem('crmbase_sdr_welcome') || '';
    let processedPrompt = (userPrompt || '').toLowerCase().trim();

    // Check if an image or document file was uploaded in simulator
    let userMessageContent = processedPrompt || cleanPrompt || 'Anexo enviado pelo cliente';

    if (fileData && fileData.url) {
      if (fileData.type && fileData.type.includes('audio')) {
        const openAiKey = (localStorage.getItem('crmbase_sdr_apikey') || localStorage.getItem('crmbase_openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '').trim();
        if (openAiKey) {
          try {
            const pureBase64 = fileData.url.includes(',') ? fileData.url.split(',')[1] : fileData.url;
            const byteCharacters = atob(pureBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const audioBlob = new Blob([byteArray], { type: fileData.type || 'audio/webm' });

            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');
            formData.append('language', 'pt');

            const xhrWhisper = new XMLHttpRequest();
            xhrWhisper.open('POST', 'https://api.openai.com/v1/audio/transcriptions', false);
            xhrWhisper.setRequestHeader('Authorization', `Bearer ${openAiKey}`);
            xhrWhisper.send(formData);

            if (xhrWhisper.status === 200) {
              const whisperRes = JSON.parse(xhrWhisper.responseText);
              if (whisperRes.text) {
                processedPrompt = whisperRes.text.toLowerCase().trim();
                userMessageContent = processedPrompt;
                console.log("Whisper transcription result in simulator:", whisperRes.text);
              }
            }
          } catch (e) {
            console.warn("Simulator Whisper audio transcription error:", e);
          }
        }
      } else if (fileData.type && fileData.type.startsWith('image/')) {
        // OpenAI Vision multimodal input format
        userMessageContent = [
          { type: 'text', text: processedPrompt && !processedPrompt.startsWith('📷') ? processedPrompt : 'Por favor, analise e descreva a imagem enviada pelo cliente e responda a qualquer dúvida contida nela.' },
          { type: 'image_url', image_url: { url: fileData.url } }
        ];
      } else if (fileData.type && (fileData.type.includes('text') || fileData.type.includes('pdf') || fileData.type.includes('document'))) {
        const docText = fileData.textContent || '';
        userMessageContent = `[DOCUMENTO/TABELA ANEXADO PELO CLIENTE: ${fileData.name}]\n${docText ? `Conteúdo Extraído do Documento:\n${docText}\n\n` : ''}Pergunta/Dúvida do cliente: ${processedPrompt || 'Analise este documento e responda com base no seu conteúdo real.'}`;
      }
    }

    const cleanPrompt = typeof userMessageContent === 'string' ? userMessageContent : (processedPrompt || '');

    // Retrieve Knowledge Base Files & Sources
    let knowledgeFiles = [];
    try {
      const savedFiles = localStorage.getItem('crmbase_sdr_knowledge_files');
      knowledgeFiles = savedFiles ? JSON.parse(savedFiles) : [];
    } catch (e) {}

    // Include attached document content in knowledge text if available
    let attachedDocContent = '';
    if (fileData && (fileData.textContent || fileData.name)) {
      attachedDocContent = `\n[DOCUMENTO ATUALMENTE ANEXADO NA MENSAGEM: ${fileData.name}]\n${fileData.textContent || ''}\n`;
    }

    // Get current message history in simulator or real WhatsApp chat for multi-turn context
    const currentMsgs = chatsRef.current[targetClientId] || [];
    const recentHistory = currentMsgs.slice(-15);
    const isFirstMsg = currentMsgs.length <= 2;
    const historyText = currentMsgs.map(m => m.text || '').join(' ').toLowerCase();
    let allKnowledgeText = attachedDocContent;
    let extractedChunks = [];

    // 1. Fetch from Supabase knowledge_base
    const supabaseUrl = (localStorage.getItem('crmbase_supabase_url') || '').trim();
    const supabaseAnonKey = (localStorage.getItem('crmbase_supabase_anon_key') || '').trim();
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${supabaseUrl.replace(/\/$/, '')}/rest/v1/knowledge_base?select=file_name,content&limit=20`, false);
        xhr.setRequestHeader('apikey', supabaseAnonKey);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
        xhr.send();
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.content) {
                allKnowledgeText += ' ' + item.content;
                extractedChunks.push(...item.content.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean));
              }
            });
          }
        }
      } catch (e) {}
    }

    // 2. Fetch from Local Knowledge Files
    if (knowledgeFiles.length > 0) {
      knowledgeFiles.forEach(f => {
        if (f.textContent) {
          allKnowledgeText += ' ' + f.textContent;
          extractedChunks.push(...f.textContent.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean));
        }
      });
    }

    // 3. Fetch from External Knowledge Source Links (URLs, Google Sheets, APIs)
    let knowledgeSources = [];
    try {
      const savedSources = localStorage.getItem('crmbase_sdr_knowledge_sources');
      knowledgeSources = savedSources ? JSON.parse(savedSources) : [];
    } catch (e) {}

    if (knowledgeSources.length > 0) {
      knowledgeSources.forEach((src, idx) => {
        if (src.url && src.url.trim().startsWith('http')) {
          try {
            const cleanUrl = src.url.trim();
            const cacheKey = `crmbase_url_cache_${cleanUrl}`;
            let cachedContent = localStorage.getItem(cacheKey);

            if (!cachedContent) {
              const xhrUrl = new XMLHttpRequest();
              xhrUrl.open('GET', `/api/fetch-url?url=${encodeURIComponent(cleanUrl)}`, false);
              xhrUrl.send();
              if (xhrUrl.status === 200) {
                const resData = JSON.parse(xhrUrl.responseText);
                if (resData.text) {
                  cachedContent = resData.text;
                  localStorage.setItem(cacheKey, cachedContent);
                }
              }
            }

            if (cachedContent) {
              allKnowledgeText += `\n[CONTEÚDO DA FONTE DE LINK EXTERNO: ${src.name || `Fonte ${idx+1}`} (${cleanUrl})]\n${cachedContent}\n`;
              extractedChunks.push(...cachedContent.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean));
              logToDisk(`generateSimulatedAiReply: Successfully loaded live link content from ${cleanUrl} (${cachedContent.length} chars)`);
            }
          } catch (errSrc) {
            console.warn(`Error fetching knowledge source link (${src.url}):`, errSrc);
          }
        }
      });
    }

    // Include recent chat messages context
    const chatHistoryText = recentHistory.map(m => m.text || '').join(' ');
    const fullSearchContext = (chatHistoryText + ' ' + allKnowledgeText).replace(/\s+/g, ' ');

    // Greetings check
    const isGreeting = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'].some(g => cleanPrompt.toLowerCase().trim() === g);
    if (isGreeting) {
      setChats(prev => ({
        ...prev,
        [targetClientId]: [...(prev[targetClientId] || []), {
          id: `m_sim_ai_${Date.now()}`,
          sender: 'user',
          text: welcomeMsg || `Olá! Seja bem-vindo ao nosso atendimento. Como posso te ajudar hoje?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]
      }));
      return;
    }

    // Check for explicit Full Summary request
    const isSummaryRequest = ['resum', 'resuma', 'mostre os dados', 'dados completos', 'resumo do atendimento', 'todas as informações', 'listar todas'].some(k => cleanPrompt.toLowerCase().includes(k));

    let responseText = '';

    if (isSummaryRequest) {
      if (allKnowledgeText.trim()) {
        const lines = extractedChunks.slice(0, 8).map(l => `• ${l}`).join('\n');
        responseText = `Resumo:\n\n${lines}`;
      } else {
        responseText = `Não encontrei dados cadastrados para gerar o resumo no momento.`;
      }
    } else {
      // UNIVERSAL DYNAMIC INTENT & CONTEXT EXTRACTOR ENGINE
      const textContext = fullSearchContext.replace(/\s+/g, ' ');
      
      const stopWords = ['quais', 'quaisquer', 'são', 'como', 'onde', 'para', 'sobre', 'dele', 'dela', 'esse', 'essa', 'este', 'esta', 'dos', 'das', 'com', 'você', 'voce', 'tem', 'ter', 'qual', 'quem', 'saber', 'dizer', 'me', 'informar', 'mostrar', 'onde', 'quando', 'quanto'];
      const userTokens = typeof cleanPrompt === 'string' ? cleanPrompt
        .toLowerCase()
        .replace(/[^\w\sà-ú]/gi, '')
        .split(/\s+/)
        .filter(w => w.length >= 2 && !stopWords.includes(w)) : [];

      let matchedSnippet = null;

      if (userTokens.length > 0) {
        const fieldMap = [
          { labels: ['preferência', 'preferencia', 'preferências', 'preferencias', 'gosta', 'procura'], pattern: /Preferências[:\s]+([^•\n\r]+?)(?=\s+(?:Origem|Interesse|Entrada|Financiamento|Informações|$))/i, prefix: 'As preferências do cliente são:' },
          { labels: ['origem', 'veio', 'onde veio', 'canal'], pattern: /Origem[:\s]+([^•\n\r]+?)(?=\s+(?:Preferências|Interesse|Entrada|Financiamento|Informações|$))/i, prefix: 'A origem do cliente é:' },
          { labels: ['interesse', 'imóvel', 'imovel', 'tipo'], pattern: /Interesse[:\s]+([^•\n\r]+?)(?=\s+(?:Preferências|Origem|Entrada|Financiamento|Informações|$))/i, prefix: 'O interesse cadastrado é:' },
          { labels: ['entrada', 'recursos', 'dinheiro'], pattern: /Entrada[:\s]+([^•\n\r]+?)(?=\s+(?:Preferências|Origem|Interesse|Financiamento|Informações|$))/i, prefix: 'Valor de entrada:' },
          { labels: ['financiamento', 'banco', 'crédito', 'credito'], pattern: /Financiamento[:\s]+([^•\n\r]+?)(?=\s+(?:Preferências|Origem|Interesse|Entrada|Informações|$))/i, prefix: 'Informação de financiamento:' },
          { labels: ['informação', 'informacao', 'informações', 'informacoes', 'observação', 'obs'], pattern: /Informações[:\s]+([^•\n\r]+?)(?=\s+(?:Preferências|Origem|Interesse|Entrada|Financiamento|$))/i, prefix: 'Informações cadastradas:' }
        ];

        for (const item of fieldMap) {
          if (item.labels.some(lbl => userTokens.includes(lbl))) {
            const match = textContext.match(item.pattern);
            if (match && match[1]) {
              const val = match[1].trim();
              if (val.length > 1) {
                matchedSnippet = `${item.prefix} ${val}`;
                break;
              }
            }
          }
        }
      }

      if (!matchedSnippet && userTokens.length > 0) {
        const sentences = textContext.split(/(?<=[.!?•\n])\s+/);
        let bestScore = 0;
        let bestClause = null;

        sentences.forEach(sentence => {
          const lowerS = sentence.toLowerCase();
          const matchCount = userTokens.reduce((acc, token) => acc + (lowerS.includes(token) ? 1 : 0), 0);
          
          if (matchCount > bestScore) {
            bestScore = matchCount;
            bestClause = sentence.replace(/^(?:Campo|Valor|Dados|Informações|Ficha)[:\s-]+/i, '').trim();
          }
        });

        if (bestScore > 0 && bestClause) {
          if (bestClause.length > 130) {
            const shortMatch = bestClause.match(/([^.!?•]{10,120}[.!?•]?)/);
            matchedSnippet = shortMatch ? shortMatch[1].trim() : bestClause.substring(0, 120) + '...';
          } else {
            matchedSnippet = bestClause;
          }
        }
      }
    }

    // Check if the incoming message involves Media (Audio, Image, Document/PDF)
    const lastMsgObj = currentMsgs.length > 0 ? currentMsgs[currentMsgs.length - 1] : null;
    const activeFile = fileData || lastMsgObj?.file || (currentMsgs.slice(-2).find(m => m.file)?.file);
    const mediaKeyId = activeFile?.keyId || lastMsgObj?.keyId;

    // Retrieve OpenAI API Key and System Instructions
    const openAiApiKey = (localStorage.getItem('crmbase_sdr_apikey') || localStorage.getItem('crmbase_openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '').trim();
    const openAiModel = (localStorage.getItem('crmbase_sdr_model') || 'gpt-4o-mini').trim();
    const sdrBehaviorPrompt = localStorage.getItem('crmbase_sdr_behavior') || 'Você é o agente SDR de atendimento.';

    // AUTOMATIC EVOLUTION API MEDIA & WHISPER / VISION EXTRACTION ENGINE
    let extractedMediaBase64 = activeFile?.url || null;
    let isVisionImage = false;
    let visionImageUrl = null;

    if (openAiApiKey && (openAiApiKey.startsWith('sk-') || openAiApiKey.length > 20)) {
      // 1. Fetch Base64 from Evolution API if keyId is present and no URL exists
      if (mediaKeyId && (!extractedMediaBase64 || !extractedMediaBase64.startsWith('data:'))) {
        try {
          logToDisk(`generateSimulatedAiReply: Fetching media base64 from Evolution API for keyId ${mediaKeyId}...`);
          const b64 = await fetchMediaBase64(mediaKeyId);
          if (b64 && typeof b64 === 'string') {
            extractedMediaBase64 = b64.startsWith('data:') ? b64 : `data:${activeFile?.type || 'image/jpeg'};base64,${b64}`;
            logToDisk(`generateSimulatedAiReply: Base64 media fetched successfully for keyId ${mediaKeyId}`);
          }
        } catch (eB64) {
          console.warn('Error fetching media Base64 from Evolution API:', eB64);
        }
      }

      // 2. Audio Processing via Whisper
      const isAudio = (activeFile?.type && activeFile.type.includes('audio')) || 
                      (cleanPrompt && (cleanPrompt.includes('áudio') || cleanPrompt.includes('audio')));

      if (isAudio && extractedMediaBase64) {
        try {
          const rawClean = extractedMediaBase64.includes('base64,') ? extractedMediaBase64.split('base64,')[1] : extractedMediaBase64;
          const cleanBase64 = rawClean.replace(/[^A-Za-z0-9+/=]/g, '').trim();
          if (cleanBase64.length > 0) {
            const byteCharacters = atob(cleanBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const audioBlob = new Blob([byteArray], { type: activeFile?.type || 'audio/ogg' });
            
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.ogg');
            formData.append('model', 'whisper-1');
            formData.append('language', 'pt');

            const xhrWhisper = new XMLHttpRequest();
            xhrWhisper.open('POST', 'https://api.openai.com/v1/audio/transcriptions', false);
            xhrWhisper.setRequestHeader('Authorization', `Bearer ${openAiApiKey}`);
            xhrWhisper.send(formData);

            if (xhrWhisper.status === 200) {
              const whisperData = JSON.parse(xhrWhisper.responseText);
              if (whisperData.text) {
                processedPrompt = whisperData.text;
                userMessageContent = processedPrompt;
                logToDisk(`generateSimulatedAiReply: Whisper transcribed audio successfully: "${processedPrompt}"`);
              }
            }
          }
        } catch (errWhisper) {
          console.warn('Whisper Transcription Error:', errWhisper);
        }
      }

      // 3. Image & Document Processing via Multimodal Vision (GPT-4o)
      const isImg = (activeFile?.type && (activeFile.type.startsWith('image/') || activeFile.type.includes('pdf'))) ||
                    (activeFile?.name && activeFile.name.match(/\.(jpg|jpeg|png|webp|gif|pdf)$/i));

      if (isImg && extractedMediaBase64) {
        isVisionImage = true;
        visionImageUrl = extractedMediaBase64;
      }
    }

    // Check if OpenAI API Key is available for Real LLM Generation
    if (openAiApiKey && (openAiApiKey.startsWith('sk-') || openAiApiKey.length > 20)) {
      try {
        const docInfoSnippet = activeFile ? `\nDOCUMENTO/IMAGEM ENVIADA PELO CLIENTE: "${activeFile.name}". VOCÊ JÁ RECEBEU O ARQUIVO EM ANEXO. NUNCA PEÇA PARA O CLIENTE ENVIAR O ARQUIVO NOVAMENTE!\n` : '';
        const systemPrompt = `${sdrBehaviorPrompt}

Sua regra fundamental é responder ao cliente de forma EXTREMAMENTE OBJETIVA, DIRETA, EMPÁTICA e CORDIAL.

REGRAS CRÍTICAS E OBRIGATÓRIAS:
1. O CLIENTE JÁ TE ENVIOU O DOCUMENTO, IMAGEM OU PDF. VOCÊ JÁ TEM ACESSO AO CONTEÚDO DELE. JAMAIS diga "Por favor, envie o documento" ou "Não recebi o arquivo".
2. Analise a IMAGEM, PDF OU DOCUMENTO ENVIADO (${activeFile ? activeFile.name : 'anexo'}), leia todas as informações e dados contidos nele e responda de acordo com a pergunta do cliente.
3. Se o cliente perguntar "pode verificar se esses dados do documento coincidem" ou algo semelhante, compare os dados contidos no documento/imagem em anexo com os dados do cliente no contexto e responda confirmando ou apontando o resultado claramente.
4. Seja direto e responda em no máximo 1 ou 2 frases curtas. Não faça apresentações longas nem peça confirmação do que já foi enviado.
5. Se a informação específica solicitada pelo lead NÃO constar no contexto ou no arquivo, diga educadamente: "Não encontrei essa informação específica no documento no momento. Vou transferir o seu atendimento para um especialista humano!"
${docInfoSnippet}
[CONTEXTO DA BASE DE CONHECIMENTO DO SUPABASE E HISTÓRICO]:
${fullSearchContext.substring(0, 4000)}
`;

        // Format user message content (multimodal array if Vision image, or text string)
        let formattedUserContent = userMessageContent;
        if (isVisionImage && visionImageUrl) {
          const userPromptText = (typeof userMessageContent === 'string' && !userMessageContent.startsWith('📷')) 
            ? userMessageContent 
            : 'Por favor, analise a imagem/documento em anexo e responda com base em todo o texto, tabela e informações contidas nela.';
          
          formattedUserContent = [
            { type: 'text', text: userPromptText },
            { type: 'image_url', image_url: { url: visionImageUrl } }
          ];
        }

        const xhrAi = new XMLHttpRequest();
        xhrAi.open('POST', 'https://api.openai.com/v1/chat/completions', false);
        xhrAi.setRequestHeader('Content-Type', 'application/json');
        xhrAi.setRequestHeader('Authorization', `Bearer ${openAiApiKey}`);
        
        const payload = {
          model: openAiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: formattedUserContent }
          ],
          temperature: 0.2,
          max_tokens: 300
        };

        xhrAi.send(JSON.stringify(payload));
        if (xhrAi.status === 200) {
          const aiResponseData = JSON.parse(xhrAi.responseText);
          const aiText = aiResponseData.choices?.[0]?.message?.content?.trim();
          if (aiText) {
            responseText = aiText;
            dispatchAiReply(targetClientId, responseText);
            return;
          }
        }
      } catch (errAi) {
        console.warn('OpenAI Direct API Call Exception:', errAi);
      }
    }

    // FALLBACK PRECISION EXTRACTOR (When API key is not typed yet)
    if (fileData) {
      responseText = `Recebi o documento "${fileData.name}". Como posso te ajudar com as informações deste arquivo?`;
    } else if (matchedSnippet) {
      const cleanSnippet = matchedSnippet.replace(/^[:\s-]+/, '').trim();
      responseText = cleanSnippet.charAt(0).toUpperCase() + cleanSnippet.slice(1);
    } else {
      responseText = `Não encontrei essa informação específica na nossa base de conhecimento no momento. Vou transferir o seu atendimento para um especialista humano para te ajudar melhor!`;
    }

    dispatchAiReply(targetClientId, responseText);
  };

  const saveChatMessageToSupabase = (clientId, sender, text, file = null, senderName = null, timestampOverride = null) => {
    const rawText = text || '';
    if (!rawText.trim() && !file) return;

    let supabaseUrl = (localStorage.getItem('crmbase_supabase_url') || '').trim();
    const supabaseAnonKey = (localStorage.getItem('crmbase_supabase_anon_key') || '').trim();
    const rawTable = (localStorage.getItem('crmbase_supabase_table') || 'mensagens_de_bate_papo').trim();

    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
      const client = clientsRef.current.find(c => c.id === clientId);
      const idCliente = client ? (client.phone || client.name || clientId) : clientId;
      const cleanTableName = rawTable.replace(/^\/+|\/+$/g, '').trim();
      const endpoint = `${supabaseUrl}/rest/v1/${encodeURIComponent(cleanTableName)}`;

      const ts = timestampOverride || Math.floor(Date.now() / 1000);
      const dateObj = new Date(ts * 1000);
      
      const dataEnvio = dateObj.toLocaleDateString('pt-BR'); // ex: 04/08/2026
      const horaEnvio = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); // ex: 09:35

      let tipoMidia = 'texto';
      let documentoUrl = null;
      let documentoNome = null;
      let imagemUrl = null;
      let audioUrl = null;
      let audioTranscricao = null;

      if (file) {
        const fileType = file.type || file.mimetype || '';
        const fileName = file.name || 'arquivo';

        if (fileType.startsWith('image/')) {
          tipoMidia = 'imagem';
          imagemUrl = file.url || null;
        } else if (fileType.startsWith('audio/')) {
          tipoMidia = 'audio';
          audioUrl = file.url || null;
          audioTranscricao = rawText.trim() ? rawText.trim() : '🔊 [Áudio Recebido]';
        } else {
          tipoMidia = 'documento';
          documentoUrl = file.url || null;
          documentoNome = fileName;
        }
      }

      const nomeRemetente = senderName || (sender === 'operador' ? 'Você' : sender === 'agente_ia' ? 'Agente IA' : (client?.name || 'Cliente'));
      const textoMensagem = rawText.trim() || (file ? `[${tipoMidia.toUpperCase()}]: ${file.name || 'Arquivo'}` : '');

      // Unified Payload with both Portuguese and English field aliases for max compatibility
      const fullPayload = {
        id_do_cliente: idCliente,
        client_id: idCliente,
        remetente: sender,
        sender: sender,
        nome_do_remetente: nomeRemetente,
        sender_name: nomeRemetente,
        texto: textoMensagem,
        text: textoMensagem,
        data_envio: dataEnvio,
        hora_envio: horaEnvio,
        tipo_midia: tipoMidia,
        media_type: tipoMidia,
        documento_url: documentoUrl,
        documento_nome: documentoNome,
        imagem_url: imagemUrl,
        audio_url: audioUrl,
        audio_transcricao: audioTranscricao,
        carimbo_de_data_hora: ts,
        timestamp: ts
      };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('apikey', supabaseAnonKey);
      xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
      xhr.setRequestHeader('Prefer', 'return=minimal');

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            logToDisk(`saveChatMessageToSupabase: Successfully saved message to '${rawTable}' (${xhr.status})`);
          } else if (xhr.status === 400 || xhr.status === 406 || xhr.status === 422) {
            logToDisk(`saveChatMessageToSupabase: Schema warning (${xhr.status}). Attempting simplified fallback insert for '${rawTable}'...`, 'WARN');
            
            // Clean Portuguese schema fallback
            const ptXhr = new XMLHttpRequest();
            ptXhr.open('POST', endpoint, true);
            ptXhr.setRequestHeader('Content-Type', 'application/json');
            ptXhr.setRequestHeader('apikey', supabaseAnonKey);
            ptXhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
            ptXhr.setRequestHeader('Prefer', 'return=minimal');
            ptXhr.send(JSON.stringify({
              id_do_cliente: idCliente,
              remetente: sender,
              nome_do_remetente: nomeRemetente,
              texto: textoMensagem,
              data_envio: dataEnvio,
              hora_envio: horaEnvio,
              tipo_midia: tipoMidia,
              documento_url: documentoUrl,
              documento_nome: documentoNome,
              imagem_url: imagemUrl,
              audio_url: audioUrl,
              audio_transcricao: audioTranscricao,
              carimbo_de_data_hora: ts
            }));
          } else {
            console.warn(`saveChatMessageToSupabase failed (${xhr.status}):`, xhr.responseText);
          }
        }
      };

      xhr.send(JSON.stringify(fullPayload));
    } catch (e) {
      console.warn('Error saving message history to Supabase:', e);
    }
  };

  const dispatchAiReply = (targetClientId, text) => {
    if (!text || !text.trim()) return;

    const isSplitEnabled = localStorage.getItem('crmbase_sdr_split_responses') === 'true';
    const textBlocks = isSplitEnabled 
      ? text.split(/\n\s*\n|\n/).map(b => b.trim()).filter(Boolean)
      : [text.trim()];

    textBlocks.forEach((blockText, blockIdx) => {
      setTimeout(() => {
        const aiMsgObj = {
          id: `m_sim_ai_${Date.now()}_${blockIdx}`,
          sender: 'user',
          text: blockText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Math.floor(Date.now() / 1000)
        };

        setChats(prev => ({
          ...prev,
          [targetClientId]: [...(prev[targetClientId] || []), aiMsgObj]
        }));

        // Save AI reply to Supabase chat history table
        saveChatMessageToSupabase(targetClientId, 'agente_ia', blockText);

        // If this is a real WhatsApp contact (not the simulator), send the message via Evolution API
        if (targetClientId && targetClientId !== 'client_teste_agente') {
          const client = clientsRef.current.find(c => c.id === targetClientId);
          if (client && client.jid) {
            fetchEvolution(`/message/sendText/${EVO_CONFIG.encodedInstanceName}`, {
              method: 'POST',
              body: JSON.stringify({
                number: client.jid,
                text: blockText
              })
            }).catch(err => console.error("Error sending WhatsApp AI reply:", err));
          }
        }
      }, blockIdx * 800);
    });
  };

  const simulateAgentResponse = (inputText, fileData = null) => {
    const isSdrEnabled = localStorage.getItem('crmbase_sdr_enabled') !== 'false';
    if (!isSdrEnabled) return;

    const routeMode = localStorage.getItem('crmbase_sdr_route_mode') || 'ai';

    const triageRoutedKey = `crmbase_triage_routed_client_teste_agente`;
    const isRouted = localStorage.getItem(triageRoutedKey) === '1';

    // Simulate standard WhatsApp network delay (1 second)
    setTimeout(() => {
      if (routeMode === 'ai' || routeMode === 'disabled') {
        if (!isRouted) {
          let aiMapping = [];
          try {
            const saved = localStorage.getItem('crmbase_sdr_ai_mapping');
            aiMapping = saved ? JSON.parse(saved) : [];
          } catch (e) {}

          const lowWeightWords = ['ajuda', 'suporte', 'duvida', 'preciso', 'quero', 'favor', 'atendimento'];
          let bestMatch = null;
          let highestScore = -1;

          const cleanChoiceText = inputText.trim().toLowerCase();
          aiMapping.forEach(m => {
            if (!m.keywords) return;
            const keywordsList = m.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
            
            let maxPositionalScoreForRule = 0;
            let genericMatchesCount = 0;
            let specificMatchesCount = 0;

            keywordsList.forEach((kw, posIdx) => {
              if (!kw) return;
              if (cleanChoiceText.includes(kw)) {
                const posWeight = Math.max(10, 100 - (posIdx * 10));
                const isLowWeight = lowWeightWords.includes(kw);
                const finalScore = isLowWeight ? 5 : (posWeight + kw.length * 2);

                if (isLowWeight) {
                  genericMatchesCount++;
                } else {
                  specificMatchesCount++;
                }

                if (finalScore > maxPositionalScoreForRule) {
                  maxPositionalScoreForRule = finalScore;
                }
              }
            });

            const totalRuleScore = maxPositionalScoreForRule + (specificMatchesCount * 50) + genericMatchesCount;

            if (totalRuleScore > highestScore && totalRuleScore > 0) {
              highestScore = totalRuleScore;
              bestMatch = m;
            }
          });

          if (bestMatch && highestScore > 0) {
            localStorage.setItem(triageRoutedKey, '1');
            let newStatus = 'Pessoal';
            try {
              const savedCols = localStorage.getItem('crmbase_columns');
              if (savedCols) {
                const cols = JSON.parse(savedCols);
                const matchedCol = cols.find(c => c.id === bestMatch.columnId);
                if (matchedCol) {
                  const savedPipes = localStorage.getItem('crmbase_pipelines');
                  const pipes = savedPipes ? JSON.parse(savedPipes) : [];
                  const matchedPipe = pipes.find(p => p.id === matchedCol.pipelineId);
                  if (matchedPipe) newStatus = matchedPipe.name;
                }
              }
            } catch (e) {}

            setRawClients(prev => prev.map(c => c.id === 'client_teste_agente' ? { ...c, status: newStatus } : c));
            setKanbanCards(prevCards => {
              const exists = prevCards.some(card => card.clientId === 'client_teste_agente');
              if (!exists) {
                return [...prevCards, {
                  id: 'k_wa_teste_simulador',
                  clientId: 'client_teste_agente',
                  title: '🤖 Chat de Teste (Simulador) - Novo Registro',
                  desc: 'Cliente de teste do agente simulador.\n\n(Roteado via triagem de departamento)',
                  column: bestMatch.columnId,
                  priority: 'Média',
                  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }];
              } else {
                return prevCards.map(card => card.clientId === 'client_teste_agente' ? { ...card, column: bestMatch.columnId } : card);
              }
            });
          }
        }
        // ALWAYS generate AI agent response for every message in AI mode!
        generateSimulatedAiReply(inputText, 'client_teste_agente', fileData);
      } else if (!isRouted) {
        let targetColumnId = '';
        const cleanChoiceText = inputText.trim().toLowerCase();

        if (routeMode === 'static') {
          let staticMapping = [];
          try {
            const saved = localStorage.getItem('crmbase_sdr_static_mapping');
            staticMapping = saved ? JSON.parse(saved) : [];
          } catch (e) {}

          const match = staticMapping.find(m => m.key && m.key.trim().toLowerCase() === cleanChoiceText);
          if (match) {
            targetColumnId = match.columnId;
          }
        }

        if (targetColumnId) {
          localStorage.setItem(triageRoutedKey, '1');
          let newStatus = 'Pessoal';
          try {
            const savedCols = localStorage.getItem('crmbase_columns');
            if (savedCols) {
              const cols = JSON.parse(savedCols);
              const matchedCol = cols.find(c => c.id === targetColumnId);
              if (matchedCol) {
                const savedPipes = localStorage.getItem('crmbase_pipelines');
                const pipes = savedPipes ? JSON.parse(savedPipes) : [];
                const matchedPipe = pipes.find(p => p.id === matchedCol.pipelineId);
                if (matchedPipe) newStatus = matchedPipe.name;
              }
            }
          } catch (e) {}

          setRawClients(prev => prev.map(c => c.id === 'client_teste_agente' ? { ...c, status: newStatus } : c));
          setKanbanCards(prevCards => {
            const exists = prevCards.some(card => card.clientId === 'client_teste_agente');
            if (!exists) {
              return [...prevCards, {
                id: 'k_wa_teste_simulador',
                clientId: 'client_teste_agente',
                title: '🤖 Chat de Teste (Simulador) - Novo Registro',
                desc: 'Cliente de teste do agente simulador.',
                column: targetColumnId,
                priority: 'Média',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }];
            } else {
              return prevCards.map(card => card.clientId === 'client_teste_agente' ? { ...card, column: targetColumnId } : card);
            }
          });
        } else if (routeMode === 'static') {
          let welcomeMessage = localStorage.getItem('crmbase_sdr_welcome') || 'Olá! Seja bem-vindo.';
          setChats(prev => ({
            ...prev,
            client_teste_agente: [...(prev.client_teste_agente || []), {
              id: `m_sim_response_${Date.now()}`,
              sender: 'user',
              text: welcomeMessage,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: Math.floor(Date.now() / 1000)
            }]
          }));
        }
      }
    }, 1000);
  };

  const sendMessage = (clientId, text, file = null, senderName = null, quotedMessage = null) => {
    if (!text.trim() && !file) return;
    
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (clientId === 'client_teste_agente') {
      const customerMsg = {
        id: `m_c_${Date.now()}`,
        sender: 'contact',
        text,
        time: timeNow,
        file,
        senderName: 'Simulador',
        timestamp: Math.floor(Date.now() / 1000),
        quotedMessage
      };

      setChats(prev => ({
        ...prev,
        client_teste_agente: [...(prev.client_teste_agente || []), customerMsg]
      }));

      simulateAgentResponse(text, file);
      return;
    }

    const userMsg = {
      id: `m_u_${Date.now()}`,
      sender: 'user',
      text,
      time: timeNow,
      file,
      senderName,
      timestamp: Math.floor(Date.now() / 1000),
      quotedMessage
    };

    setChats(prev => ({
      ...prev,
      [clientId]: [...(prev[clientId] || []), userMsg]
    }));

    // Save operator message to Supabase chat history table
    saveChatMessageToSupabase(clientId, 'operador', text || (file ? file.name : ''), file, senderName);

    // Sincroniza envio de mensagens e arquivos com o WhatsApp real (apenas para mensagens não geradas pelo sistema)
    if (waStatus === 'ONLINE' && senderName !== 'Sistema') {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        let recipientJid = client.jid;
        if (!recipientJid) {
          const cleanPhone = client.phone.replace(/\D/g, '');
          const numberOnly = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
          recipientJid = `${numberOnly}@s.whatsapp.net`;
        }

        if (file && file.url) {
          const parts = file.url.split(';base64,');
          if (parts.length === 2) {
            const mimetype = parts[0].replace('data:', '');
            const rawBase64 = parts[1];
            
            let mediatype = "document";
            if (mimetype.startsWith("image/")) mediatype = "image";
            else if (mimetype.startsWith("video/")) mediatype = "video";
            else if (mimetype.startsWith("audio/")) mediatype = "audio";

            if (mediatype === "audio") {
              const body = {
                number: recipientJid,
                audio: rawBase64
              };
              if (quotedMessage && quotedMessage.id && !quotedMessage.id.startsWith('m_u_') && !quotedMessage.id.startsWith('m_b_')) {
                body.quoted = {
                  key: {
                    id: quotedMessage.id,
                    fromMe: quotedMessage.sender === 'user',
                    remoteJid: recipientJid
                  },
                  message: {
                    conversation: quotedMessage.text || ""
                  }
                };
              }
              fetchEvolution(`/message/sendWhatsAppAudio/${EVO_CONFIG.encodedInstanceName}`, { method: 'POST', body: JSON.stringify(body) })
                .then(res => res.json())
                .then(data => {
                  if (data && data.key && data.key.id) {
                    setChats(prev => ({
                      ...prev,
                      [clientId]: (prev[clientId] || []).map(m => m.id === userMsg.id ? { ...m, keyId: data.key.id } : m)
                    }));
                  }
                })
                .catch(err => console.error("Erro de rede ao enviar áudio pelo WhatsApp:", err));
            } else {
              const captionToSend = senderName && text ? `*${senderName}:*\n${text}` : (text || "");
              const body = {
                number: recipientJid,
                mediatype: mediatype,
                mimetype: mimetype,
                media: rawBase64,
                fileName: file.name,
                caption: captionToSend
              };
              if (quotedMessage && quotedMessage.id && !quotedMessage.id.startsWith('m_u_') && !quotedMessage.id.startsWith('m_b_')) {
                body.quoted = {
                  key: {
                    id: quotedMessage.id,
                    fromMe: quotedMessage.sender === 'user',
                    remoteJid: recipientJid
                  },
                  message: {
                    conversation: quotedMessage.text || ""
                  }
                };
              }
              fetchEvolution(`/message/sendMedia/${EVO_CONFIG.encodedInstanceName}`, { method: 'POST', body: JSON.stringify(body) })
                .then(res => res.json())
                .then(data => {
                  if (data && data.key && data.key.id) {
                    setChats(prev => ({
                      ...prev,
                      [clientId]: (prev[clientId] || []).map(m => m.id === userMsg.id ? { ...m, keyId: data.key.id } : m)
                    }));
                  }
                })
                .catch(err => console.error("Erro ao enviar mídia pelo WhatsApp:", err));
            }
          }
        } else {
          const textToSend = senderName ? `*${senderName}:*\n${text}` : text;
          const body = {
            number: recipientJid,
            text: textToSend
          };
          if (quotedMessage && quotedMessage.id && !quotedMessage.id.startsWith('m_u_') && !quotedMessage.id.startsWith('m_b_')) {
            body.quoted = {
              key: {
                id: quotedMessage.id,
                fromMe: quotedMessage.sender === 'user',
                remoteJid: recipientJid
              },
              message: {
                conversation: quotedMessage.text || ""
              }
            };
          }
          fetchEvolution(`/message/sendText/${EVO_CONFIG.encodedInstanceName}`, { method: 'POST', body: JSON.stringify(body) })
            .then(res => res.json())
            .then(data => {
              const returnedKeyId = data?.key?.id || data?.id || data?.keyId;
              if (returnedKeyId) {
                userMsg.keyId = returnedKeyId;
                setChats(prev => {
                  const msgs = prev[clientId] || [];
                  const updated = msgs.map(m => m.id === userMsg.id ? { ...m, keyId: returnedKeyId } : m);
                  return { ...prev, [clientId]: updated };
                });
              }
            })
            .catch(err => console.error("Erro de rede ao enviar pelo WhatsApp:", err));
        }
      }
    }

    // Check if auto-reply is enabled in profile (only run if offline)
    if (profile.autoReply && waStatus !== 'ONLINE') {
      setTimeout(() => {
        const replyMsg = {
          id: `m_b_${Date.now()}`,
          sender: 'contact',
          text: botResponses[Math.floor(Math.random() * botResponses.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Math.floor(Date.now() / 1000)
        };
        
        setChats(prev => ({
          ...prev,
          [clientId]: [...(prev[clientId] || []), replyMsg]
        }));
      }, 1500);
    }
  };

  const reactToMessage = (clientId, messageId, emoji) => {
    setChats(prev => {
      const clientMessages = prev[clientId] || [];
      const updatedMessages = clientMessages.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reaction: msg.reaction === emoji ? null : emoji
          };
        }
        return msg;
      });
      return {
        ...prev,
        [clientId]: updatedMessages
      };
    });
  };

  const [deletedMessageKeys, setDeletedMessageKeys] = useState({});
  const deletedMessageKeysRef = useRef(deletedMessageKeys);
  useEffect(() => {
    deletedMessageKeysRef.current = deletedMessageKeys;
  }, [deletedMessageKeys]);

  const [editedMessageTexts, setEditedMessageTexts] = useState({});
  const editedMessageTextsRef = useRef(editedMessageTexts);
  useEffect(() => {
    editedMessageTextsRef.current = editedMessageTexts;
  }, [editedMessageTexts]);

  const editMessage = (clientId, messageId, newText) => {
    if (!newText || !newText.trim()) return;
    const cleanNewText = newText.trim().replace(/^\*[^*]+:\*\s*/, '');

    const clientMsgs = chatsRef.current[clientId] || [];
    let targetMsg = clientMsgs.find(m => m.id === messageId || m.keyId === messageId);
    if (!targetMsg && messageId) {
      targetMsg = clientMsgs.find(m => m.id.includes(messageId) || (m.keyId && messageId.includes(m.keyId)));
    }

    const targetId = targetMsg?.id || messageId;
    let realKeyId = targetMsg?.keyId || (targetMsg?.id && !targetMsg.id.startsWith('m_u_') ? targetMsg.id : messageId);
    if (!realKeyId || realKeyId.startsWith('m_u_')) {
      const lastUserMsgWithKey = [...clientMsgs].reverse().find(m => m.sender === 'user' && m.keyId && !m.keyId.startsWith('m_u_'));
      if (lastUserMsgWithKey) {
        realKeyId = lastUserMsgWithKey.keyId;
      }
    }
    const isFromMe = targetMsg ? targetMsg.sender === 'user' : true;

    // Check if the original message had a signature like *miguel:*
    const matchSig = (targetMsg?.text || '').match(/^(\*[^*]+:\*\s*)/);
    const textToStore = matchSig ? `${matchSig[1]}${cleanNewText}` : cleanNewText;

    // Persist edited text in ref state so syncWhatsAppChats won't revert it
    setEditedMessageTexts(prev => ({
      ...prev,
      [messageId]: textToStore,
      [targetId]: textToStore,
      [realKeyId]: textToStore
    }));

    setChats(prev => {
      const msgs = prev[clientId] || [];
      const updated = msgs.map(m => {
        if (m.id === messageId || m.id === targetId || (m.keyId && (m.keyId === messageId || m.keyId === realKeyId))) {
          return { ...m, text: textToStore, isEdited: true };
        }
        return m;
      });
      return { ...prev, [clientId]: updated };
    });

    if (waStatus === 'ONLINE' && clientId !== 'client_teste_agente') {
      const client = clientsRef.current.find(c => c.id === clientId);
      if (client && client.jid) {
        fetchEvolution(`/message/edit/${EVO_CONFIG.encodedInstanceName}`, {
          method: 'POST',
          body: JSON.stringify({
            number: client.jid,
            text: textToStore,
            messageId: realKeyId,
            key: {
              id: realKeyId,
              fromMe: isFromMe,
              remoteJid: client.jid
            }
          })
        })
        .then(res => res.json())
        .then(data => logToDisk("Evolution editMessage response: " + JSON.stringify(data)))
        .catch(err => console.error("Erro ao editar mensagem no WhatsApp:", err));
      }
    }
  };

  const deleteSingleMessage = (clientId, messageId) => {
    const clientMsgs = chatsRef.current[clientId] || [];
    let targetMsg = clientMsgs.find(m => m.id === messageId || m.keyId === messageId);
    if (!targetMsg && messageId) {
      targetMsg = clientMsgs.find(m => m.id.includes(messageId) || (m.keyId && messageId.includes(m.keyId)));
    }

    // Security & Rule Check 1: Only user-sent messages can be deleted from WhatsApp
    if (targetMsg && targetMsg.sender !== 'user') {
      alert("Apenas mensagens enviadas por você (CRM) podem ser solicitadas para exclusão no WhatsApp.");
      return;
    }

    // Security & Rule Check 2: Require valid Baileys WhatsApp keyId
    let realKeyId = targetMsg?.keyId || (targetMsg?.id && !targetMsg.id.startsWith('m_u_') ? targetMsg.id : null);
    if (!realKeyId || realKeyId.startsWith('m_u_')) {
      // Look up keyId from userMsg state or latest user message with valid key
      const lastUserMsgWithKey = [...clientMsgs].reverse().find(m => m.sender === 'user' && m.keyId && !m.keyId.startsWith('m_u_'));
      if (lastUserMsgWithKey) {
        realKeyId = lastUserMsgWithKey.keyId;
      }
    }

    if (!realKeyId || realKeyId.startsWith('m_u_')) {
      alert("Não foi possível localizar o identificador oficial do WhatsApp (wamid/keyId) para esta mensagem. A exclusão não pode ser realizada.");
      logToDisk("deleteSingleMessage FALHA: wamid nao localizado para messageId=" + messageId, "WARN");
      return;
    }

    const isFromMe = true;

    // Record both internal ID and WhatsApp keyId in deleted keys filter
    setDeletedMessageKeys(prev => ({
      ...prev,
      [messageId]: true,
      [realKeyId]: true
    }));

    setChats(prev => {
      const msgs = prev[clientId] || [];
      const updated = msgs.filter(m => m.id !== messageId && m.keyId !== messageId && m.keyId !== realKeyId);
      return { ...prev, [clientId]: updated };
    });

    if (waStatus === 'ONLINE' && clientId !== 'client_teste_agente') {
      const client = clientsRef.current.find(c => c.id === clientId);
      if (client && client.jid) {
        logToDisk("deleteSingleMessage: sending delete request for keyId: " + realKeyId + " jid: " + client.jid);
        
        const payload = {
          number: client.jid,
          messageId: realKeyId,
          id: realKeyId,
          key: {
            id: realKeyId,
            fromMe: isFromMe,
            remoteJid: client.jid
          }
        };

        // Send DELETE request first
        fetchEvolution(`/message/deleteMessageForEveryone/${EVO_CONFIG.encodedInstanceName}`, {
          method: 'DELETE',
          body: JSON.stringify(payload)
        })
        .then(res => res.json().catch(() => ({})))
        .then(data => {
          logToDisk("Evolution DELETE deleteMessageForEveryone response: " + JSON.stringify(data));
          if (data && (data.error || data.statusCode >= 400 || data.status === 404)) {
            // Fallback to POST method if DELETE is rejected by API route
            fetchEvolution(`/message/deleteMessageForEveryone/${EVO_CONFIG.encodedInstanceName}`, {
              method: 'POST',
              body: JSON.stringify(payload)
            })
            .then(res => res.json().catch(() => ({})))
            .then(postData => logToDisk("Evolution POST deleteMessageForEveryone response: " + JSON.stringify(postData)))
            .catch(err => console.error("Erro no fallback POST ao apagar no WhatsApp:", err));
          }
        })
        .catch(err => console.error("Erro ao apagar mensagem no WhatsApp:", err));
      }
    }
  };

  // Kanban operations
  const moveKanbanCard = (cardId, targetColumn) => {
    setKanbanCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const saved = localStorage.getItem('crmbase_pipelines');
        const pipelines = saved ? JSON.parse(saved) : [
          { id: 'pessoal', name: 'Pessoal' },
          { id: 'contabil_fiscal', name: 'Contábil/Fiscal' },
          { id: 'documentos_fiscais', name: 'Emissão de documentos fiscais' },
          { id: 'administrativo', name: 'Administrativo' }
        ];

        const parts = targetColumn.split('_');
        const prefix = parts.length > 2 && parts[0] === 'pipe' ? `${parts[0]}_${parts[1]}` : parts[0];
        
        const foundPipe = pipelines.find(p => {
          if (p.id === 'pessoal' && prefix === 'pessoal') return true;
          if (p.id === 'contabil_fiscal' && prefix === 'contabil') return true;
          if (p.id === 'documentos_fiscais' && prefix === 'documentos') return true;
          if (p.id === 'administrativo' && prefix === 'admin') return true;
          return p.id === prefix;
        });

        const newStatus = foundPipe ? foundPipe.name : 'Pessoal';
        
        setClients(cls => cls.map(c => c.id === card.clientId ? { ...c, status: newStatus } : c));
        
        return { ...card, column: targetColumn };
      }
      return card;
    }));
  };

  const addKanbanCard = (card) => {
    const newCard = {
      ...card,
      id: `k_${Date.now()}`
    };
    setKanbanCards(prev => [...prev, newCard]);
  };

  const updateKanbanCard = (updatedCard) => {
    setKanbanCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const deleteKanbanCard = (cardId) => {
    const card = kanbanCards.find(c => c.id === cardId);
    if (card) {
      const id = card.clientId;
      const cleanPhone = card.clientPhone ? card.clientPhone.replace(/\D/g, '') : '';
      const suffix = cleanPhone ? cleanPhone.slice(-8) : '';
      
      logToDisk(`deleteKanbanCard: Clearing triage flags for card client ${id} (phone suffix: ${suffix})`);
      localStorage.removeItem(`crmbase_triage_routed_${id}`);
      localStorage.removeItem(`crmbase_triage_routed_${suffix}`);
      localStorage.removeItem(`crmbase_triage_routed_time_${id}`);
      localStorage.removeItem(`crmbase_triage_routed_time_${suffix}`);
      localStorage.removeItem(`crmbase_triage_sent_${cleanPhone}`);
      localStorage.removeItem(`crmbase_triage_sent_${suffix}`);
      localStorage.removeItem(`crmbase_triage_sent_time_${suffix}`);
      localStorage.removeItem(`crmbase_triage_sent_time_${cleanPhone}`);
    }
    setKanbanCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Quick Links operations
  const addQuickLink = (link) => {
    const newLink = {
      ...link,
      id: `l_${Date.now()}`,
      clicks: 0
    };
    setQuickLinks(prev => [...prev, newLink]);
  };

  const deleteQuickLink = (linkId) => {
    setQuickLinks(prev => prev.filter(l => l.id !== linkId));
  };

  const clickLink = (linkId) => {
    setQuickLinks(prev => prev.map(l => l.id === linkId ? { ...l, clicks: l.clicks + 1 } : l));
  };

  // Quick Replies (Respostas Rápidas) operations
  const addQuickReply = (reply) => {
    const cleanShortcut = (reply.shortcut || '').replace(/^\/+/, '').trim();
    const newReply = {
      id: `qr_${Date.now()}`,
      shortcut: cleanShortcut,
      title: reply.title.trim(),
      content: reply.content.trim()
    };
    setQuickReplies(prev => [...prev, newReply]);
  };

  const deleteQuickReply = (replyId) => {
    setQuickReplies(prev => prev.filter(r => r.id !== replyId));
  };

  const updateQuickReply = (updatedReply) => {
    const cleanShortcut = (updatedReply.shortcut || '').replace(/^\/+/, '').trim();
    setQuickReplies(prev => prev.map(r => r.id === updatedReply.id ? {
      ...updatedReply,
      shortcut: cleanShortcut,
      title: updatedReply.title.trim(),
      content: updatedReply.content.trim()
    } : r));
  };

  // Profile operations
  const updateProfile = (updatedProfile) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updatedProfile };
      // Also update system users list if the email matches
      setSystemUsers(prevUsers => prevUsers.map(u => {
        if (u.email.trim().toLowerCase() === prev.email.trim().toLowerCase()) {
          return {
            ...u,
            name: newProfile.name,
            email: newProfile.email,
            password: newProfile.password || u.password,
          };
        }
        return u;
      }));
      return newProfile;
    });
  };

  const fetchMediaBase64 = async (messageId) => {
    try {
      const res = await fetchEvolution(`/chat/getBase64FromMediaMessage/${EVO_CONFIG.encodedInstanceName}`, { 
        method: 'POST', 
        body: JSON.stringify({
          message: {
            key: {
              id: messageId
            }
          }
        })
      });
      if (!res.ok) {
        logToDisk("fetchMediaBase64 error: status=" + res.status, "ERROR");
        return null;
      }
      const data = await res.json();
      return data.base64 || null;
    } catch (err) {
      logToDisk("fetchMediaBase64 network error: " + err.message, "ERROR");
      return null;
    }
  };

  // Poll for pipeline updates from Vercel Serverless Webhook
  useEffect(() => {
    const pollPipelineUpdates = async () => {
      try {
        const lastPoll = localStorage.getItem('crmbase_last_pipeline_poll') || '0';
        const res = await fetch(`/api/webhook?since=${lastPoll}`);
        if (res.ok) {
          const data = await res.json();
          const updates = data.updates || [];
          if (updates.length > 0) {
            logToDisk("pollPipelineUpdates: received " + updates.length + " pipeline updates from server");
            
            setClients(prevClients => {
              let hasChanges = false;
              const newClients = prevClients.map(c => {
                const cleanPhone = c.phone.replace(/\D/g, '');
                // Find matching update by suffix matching (last 8 digits)
                const match = updates.find(u => cleanPhone.endsWith(u.phone.slice(-8)));
                if (match && c.status !== match.pipeline) {
                  hasChanges = true;
                  return { ...c, status: match.pipeline };
                }
                return c;
              });

              if (hasChanges) {
                // Update corresponding Kanban cards or create one if it doesn't exist
                setKanbanCards(prevCards => {
                  const updatedCards = [...prevCards];
                  updates.forEach(upd => {
                    const client = newClients.find(c => c.phone.replace(/\D/g, '').endsWith(upd.phone.slice(-8)));
                    if (client) {
                      const cardIndex = updatedCards.findIndex(card => card.clientId === client.id);
                      if (cardIndex !== -1) {
                        updatedCards[cardIndex] = {
                          ...updatedCards[cardIndex],
                          column: mapStatusToColumn(client.status)
                        };
                      } else {
                        // Create a new card!
                        const newCard = {
                          id: `k_wa_${client.phone.slice(-8)}`,
                          clientId: client.id,
                          title: `${client.name} - Novo Registro`,
                          desc: `Cliente iniciado via WhatsApp (Atualizado via Webhook externo para ${client.status}).`,
                          column: mapStatusToColumn(client.status),
                          priority: "Média",
                          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        };
                        updatedCards.push(newCard);
                      }
                    }
                  });
                  return updatedCards;
                });
                return newClients;
              }
              return prevClients;
            });
          }
          localStorage.setItem('crmbase_last_pipeline_poll', Date.now().toString());
        }
      } catch (err) {
        console.error("Error polling pipeline updates:", err);
      }
    };

    pollPipelineUpdates();
    const interval = setInterval(pollPipelineUpdates, 5000);
    return () => clearInterval(interval);
  }, []);



  return (
    <AppContext.Provider value={{
      isAuthenticated,
      theme,
      setTheme,
      activeModule,
      setActiveModule,
      activeChatClientId,
      setActiveChatClientId,
      clients,
      kanbanCards,
      chats,
      quickLinks,
      profile,
      systemUsers,
      setSystemUsers,
      login,
      logout,
      register,
      addClient,
      updateClient,
      deleteClient,
      clearChat,
      sendMessage,
      reactToMessage,
      editMessage,
      deleteSingleMessage,
      moveKanbanCard,
      addKanbanCard,
      updateKanbanCard,
      deleteKanbanCard,
      addQuickLink,
      deleteQuickLink,
      clickLink,
      quickReplies,
      addQuickReply,
      deleteQuickReply,
      updateQuickReply,
      updateProfile,
      waStatus,
      setWaStatus,
      waInstances,
      setWaInstances,
      selectedInstanceFilter,
      setSelectedInstanceFilter,
      addWaInstance,
      removeWaInstance,
      unreadChats,
      setUnreadChats,
      fetchMediaBase64,
      // Portal Exports
      portalUsers,
      setPortalUsers,
      properties,
      setProperties,
      contracts,
      setContracts,
      financialRecords,
      setFinancialRecords,
      maintenanceRequests,
      setMaintenanceRequests,
      portalMessages,
      setPortalMessages,
      activityLogs,
      setActivityLogs,
      authorizeMaintenance,
      createMaintenanceRequest,
      sendPortalMessage,
      updateMaintenanceStatus,
      registerActivityLog,
      quickLoginPortal,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
