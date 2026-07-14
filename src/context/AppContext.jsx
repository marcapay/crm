import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

// Mock Initial Data (Cleared/Empty)
const initialClients = [];

const initialKanbanCards = [];

const initialChats = {};

const initialQuickLinks = [];

const initialProfile = {
  name: 'Miguel Suporte',
  email: 'mqssolucao@gmail.com',
  role: 'Administrador',
  phone: '37998072208',
  instagram: '@marcelomarques',
  pix: 'marcelo@crmimoveis.com',
  paymentAccount: 'Itaú, Ag 0000, Cc 00000-0',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  password: 'admin',
  notifications: true,
  autoReply: true,
  integrations: {
    whatsapp: true,
    webhook: false,
    databaseSync: true,
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

  // Normalize pipeline names in localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('analise_pipelines');
      if (saved) {
        const parsed = JSON.parse(saved);
        let changed = false;
        const updated = parsed.map(p => {
          if (p.id === 'documentos_fiscais' && p.name !== 'Emissão de Documentos Fiscais') {
            p.name = 'Emissão de Documentos Fiscais';
            changed = true;
          }
          return p;
        });
        if (changed) {
          localStorage.setItem('analise_pipelines', JSON.stringify(updated));
        }
      }
    } catch (e) {}
  }, []);

  // Core Data Lists
  const [clients, setRawClients] = useState(() => {
    const saved = localStorage.getItem('eloos_clients');
    const list = saved ? JSON.parse(saved) : initialClients;
    
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
      return a.id.localeCompare(b.id);
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
        return a.id.localeCompare(b.id);
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
      return unique;
    });
  };

  const [kanbanCards, setKanbanCards] = useState(() => {
    const saved = localStorage.getItem('eloos_kanban');
    let cards = saved ? JSON.parse(saved) : initialKanbanCards;
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
    return saved ? JSON.parse(saved) : initialChats;
  });

  const [chatsClearedTimestamps, setChatsClearedTimestamps] = useState(() => {
    const saved = localStorage.getItem('eloos_chats_cleared_timestamps');
    return saved ? JSON.parse(saved) : {};
  });

  const [quickLinks, setQuickLinks] = useState(() => {
    const saved = localStorage.getItem('eloos_quicklinks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clear legacy default quicklinks l1-l4
      const containsDefault = parsed.some(link => ['l1', 'l2', 'l3', 'l4'].includes(link.id));
      if (containsDefault) {
        return [];
      }
      return parsed;
    }
    return [];
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('eloos_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [systemUsers, setSystemUsersState] = useState(() => {
    const saved = localStorage.getItem('analise_system_users');
    const defaultUsers = [
      { id: 'default_u2', name: 'Miguel Suporte', email: 'mqssolucao@gmail.com', role: 'Administrador', status: 'Ativo', password: 'admin' },
      { id: 'default_u3', name: 'Alexandre', email: 'atg.contador@gmail.com', role: 'Administrador', status: 'Ativo', password: 'admin' },
      { id: 'default_u4', name: 'Miguel', email: 'miguelmr.business@gmail.com', role: 'Administrador', status: 'Ativo', password: 'admin' }
    ];

    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        // Filter out legacy mock IDs
        parsed = parsed.filter(u => u.id !== 'u1' && u.id !== 'u3' && u.id !== 'u4');
        
        // Ensure all default users exist in the parsed list (merge by email)
        defaultUsers.forEach(def => {
          if (!parsed.some(u => (u.email || '').trim().toLowerCase() === def.email.trim().toLowerCase())) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        console.error("Error parsing system users", e);
      }
    }
    return defaultUsers;
  });

  const setSystemUsers = (newUsersOrFn) => {
    setSystemUsersState(prev => {
      const next = typeof newUsersOrFn === 'function' ? newUsersOrFn(prev) : newUsersOrFn;
      localStorage.setItem('analise_system_users', JSON.stringify(next));
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
    return saved ? JSON.parse(saved) : [
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
    ];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('eloos_lead_agent_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [aiSuggestions, setAiSuggestions] = useState(() => {
    const saved = localStorage.getItem('eloos_lead_agent_suggestions');
    return saved ? JSON.parse(saved) : [];
  });

  const [agentSchedule, setAgentSchedule] = useState(() => {
    return localStorage.getItem('eloos_lead_agent_schedule') || '10s';
  });

  const [manualTriggerCount, setManualTriggerCount] = useState(0);

  // Evolution API credentials configuration
  const EVO_CONFIG = {
    baseUrl: "https://api.marcasolucoes.com",
    apiKey: "b49c63d8c361f2a13a28e56c3c3c19f9",
    tenant: "ff3694a5-c576-4309-8805-3bb7a61d15c7",
    encodedInstanceName: "An%C3%A1lise"
  };

  // WhatsApp Integration status state (shared globally)
  const [waStatus, setWaStatus] = useState(() => {
    const saved = localStorage.getItem('analise_wa_status');
    return saved || 'DISCONNECTED';
  });

  // Triage synchronization status state (resets to false on page load / status change)
  const [waTriageSynced, setWaTriageSynced] = useState(false);
  const [waTriageSyncFinishedAt, setWaTriageSyncFinishedAt] = useState(0);

  const waTriageSyncedRef = useRef(false);
  const waTriageSyncFinishedAtRef = useRef(0);

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
      localStorage.removeItem('analise_unread_chats');
      
      // Reset active chat
      setActiveChatClientId(null);
    }
  }, [waStatus]);

  // Unread chats tracking state (empty by default)
  const [unreadChats, setUnreadChats] = useState(() => {
    const saved = localStorage.getItem('analise_unread_chats');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('analise_unread_chats', JSON.stringify(unreadChats));
  }, [unreadChats]);

  // Keep a ref of activeChatClientId for async sync polling loop
  const activeChatClientIdRef = useRef(activeChatClientId);
  useEffect(() => {
    activeChatClientIdRef.current = activeChatClientId;
    if (activeChatClientId) {
      setUnreadChats(prev => prev.filter(id => id !== activeChatClientId));
    }
  }, [activeChatClientId]);

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
        const res = await fetch(`${EVO_CONFIG.baseUrl}/instance/connectionState/${EVO_CONFIG.encodedInstanceName}`, {
          headers: {
            "apikey": EVO_CONFIG.apiKey,
            "tenant": EVO_CONFIG.tenant
          }
        });
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
    const webhookUrl = localStorage.getItem('analise_ai_webhook_url') || '';
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
    if (!waTriageSyncedRef.current) {
      logToDisk("triggerTriageGreetingLocal: Sync not complete. Skipping greeting.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const suffix = cleanPhone.slice(-8);
    const lastSentTimeStr = localStorage.getItem(`analise_triage_sent_time_${suffix}`);
    if (lastSentTimeStr) {
      const lastSentTime = parseInt(lastSentTimeStr, 10) || 0;
      const minutesDiff = (Date.now() - lastSentTime) / (1000 * 60);
      if (minutesDiff < 120) {
        // Already sent within 2 hours, skip to prevent spamming
        return;
      }
    }

    localStorage.setItem(`analise_triage_sent_time_${suffix}`, Date.now().toString());
    localStorage.setItem(`analise_triage_sent_${cleanPhone}`, '1');

    logToDisk(`triggerTriageGreetingLocal: Sending local triage greeting to ${cleanPhone}`);

    let recipientJid = jid;
    if (!recipientJid) {
      const numberOnly = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      recipientJid = `${numberOnly}@s.whatsapp.net`;
    }

    const greetingText = `*Para oferecer um atendimento mais rápido e direcionado, com qual departamento você deseja falar?*\n\n1️⃣ Pessoal\n2️⃣ Contábil/Fiscal\n3️⃣ Emissão de Documentos Fiscais\n4️⃣ Administrativo`;

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
  const sendTriageConfirmationLocal = (phone, jid = null) => {
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

    const confirmationText = `Prezado(a) cliente agradecemos seu contato.\n\nDeixe sua mensagem ou sua demanda que já já será atendido com toda a atenção e carinho de sempre.\n\nE se por preciso, fique à vontade para ligar em nosso WhatsApp que será um prazer falar com você.`;

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
    let newStatus = '';
    let newTag = '';

    const cleanButtonId = buttonId ? buttonId.trim().toLowerCase() : '';
    const cleanChoiceText = choiceText ? choiceText.trim().toLowerCase() : '';

    // Check buttonId or choiceText
    const isPessoal = cleanButtonId === 'btn_pessoal' || cleanButtonId === '1' || cleanButtonId.includes('pessoal') ||
                      cleanChoiceText === '1' || cleanChoiceText.includes('pessoal');
                      
    const isContabil = cleanButtonId === 'btn_contabil' || cleanButtonId === '2' || cleanButtonId.includes('contabil') || cleanButtonId.includes('fiscal') || cleanButtonId.includes('contábil') ||
                      cleanChoiceText === '2' || cleanChoiceText.includes('contabil') || cleanChoiceText.includes('contábil') || cleanChoiceText.includes('fiscal');
                      
    const isEmissao = cleanButtonId === 'btn_emissao' || cleanButtonId === '3' || cleanButtonId.includes('emissao') || cleanButtonId.includes('emissão') || cleanButtonId.includes('documentos') || cleanButtonId.includes('docs') ||
                     cleanChoiceText === '3' || cleanChoiceText.includes('emissão') || cleanChoiceText.includes('emissao') || cleanChoiceText.includes('documentos') || cleanChoiceText.includes('docs');
                     
    const isAdm = cleanButtonId === 'btn_adm' || cleanButtonId === '4' || cleanButtonId.includes('adm') || cleanButtonId.includes('administrativo') ||
                  cleanChoiceText === '4' || cleanChoiceText.includes('administrativo') || cleanChoiceText.includes('admin') || cleanChoiceText.includes('adm');

    if (isPessoal) {
      newStatus = 'Pessoal';
      newTag = 'departamento_pessoal';
    } else if (isContabil) {
      newStatus = 'Contábil/Fiscal';
      newTag = 'contabil_fiscal';
    } else if (isEmissao) {
      newStatus = 'Emissão de Documentos Fiscais';
      newTag = 'documentos_fiscais';
    } else if (isAdm) {
      newStatus = 'Administrativo';
      newTag = 'administrativo';
    }

    if (!newStatus) return null;

    const cleanPhone = clientPhone.replace(/\D/g, '');
    const suffix = cleanPhone.slice(-8);
    const targetClientId = clientId || `c_wa_${suffix}`;

    // Idempotency: Route once in 2 hours to avoid duplicates/loops
    const lastRouteTimeStr = localStorage.getItem(`analise_triage_routed_time_${targetClientId}`) || 
                             localStorage.getItem(`analise_triage_routed_time_${suffix}`);
    if (lastRouteTimeStr) {
      const lastRouteTime = parseInt(lastRouteTimeStr, 10) || 0;
      const hoursDiff = (Date.now() - lastRouteTime) / (1000 * 60 * 60);
      if (hoursDiff < 2) {
        return null;
      }
    }

    localStorage.setItem(`analise_triage_routed_time_${targetClientId}`, Date.now().toString());
    localStorage.setItem(`analise_triage_routed_${targetClientId}`, '1');
    localStorage.setItem(`analise_triage_routed_time_${suffix}`, Date.now().toString());
    localStorage.setItem(`analise_triage_routed_${suffix}`, '1');

    logToDisk(`routeClientBasedOnChoice: Routing ${targetClientId} to ${newStatus}`);

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

      // Correctly resolve the client's name even if they are a newly created client in localNewClients
      let clientName = clientPhone;
      if (localNewClients) {
        const found = localNewClients.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
        if (found) clientName = found.name;
      } else {
        const targetClient = updated.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
        if (targetClient) clientName = targetClient.name;
      }

      // Create Kanban Card dynamically with all mandatory fields
      setKanbanCards(prevCards => {
        const exists = prevCards.some(card => card.clientId === targetClientId);
        if (!exists) {
          const newCard = {
            id: `k_wa_${suffix}`,
            clientId: targetClientId,
            title: `${clientName} - Novo Registro`,
            desc: `Cliente: ${clientName}\nTelefone: ${cleanPhone}\nCriado em: ${new Date().toLocaleString()}\nPipeline: ${newStatus}\nStatus Inicial: ${mapStatusToColumn(newStatus)}\nConversa ID: ${targetClientId}\nResponsável: ${profile?.name || "Miguel Suporte"}\n\n(Roteado via triagem de departamento)`,
            column: mapStatusToColumn(newStatus),
            priority: "Média",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            
            // Explicit Mandatory Fields
            clientName: clientName,
            clientPhone: cleanPhone,
            createdAt: new Date().toISOString(),
            pipeline: newStatus,
            initialStatus: mapStatusToColumn(newStatus),
            conversaId: targetClientId,
            responsavel: profile?.name || "Miguel Suporte"
          };
          return [...prevCards, newCard];
        } else {
          return prevCards.map(card => {
            if (card.clientId === targetClientId) {
              return { 
                ...card, 
                column: mapStatusToColumn(newStatus),
                pipeline: newStatus,
                desc: `Cliente: ${clientName}\nTelefone: ${cleanPhone}\nCriado em: ${card.createdAt || new Date().toLocaleString()}\nPipeline: ${newStatus}\nStatus Inicial: ${mapStatusToColumn(newStatus)}\nConversa ID: ${targetClientId}\nResponsável: ${profile?.name || "Miguel Suporte"}\n\n(Roteado via triagem de departamento)`
              };
            }
            return card;
          });
        }
      });

      const targetClient = updated.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
      if (hasChanges && targetClient) {
        fireTriageWebhook(targetClient, newStatus, targetClientId);
      }

      return updated;
    });

    // Send confirmation once directly from the CRM
    let clientJid = null;
    if (localNewClients) {
      const found = localNewClients.find(c => c.id === targetClientId || c.phone.replace(/\D/g, '').endsWith(suffix));
      if (found) clientJid = found.jid;
    }
    sendTriageConfirmationLocal(cleanPhone, clientJid);

    return newStatus;
  };



  // Sync WhatsApp Chats and message histories from the Evolution API
  const syncWhatsAppChats = async () => {
    logToDisk("syncWhatsAppChats: check, waStatus=" + waStatus);
    if (waStatus !== 'ONLINE') return;
    if (isSyncingRef.current) {
      logToDisk("syncWhatsAppChats: already syncing, skipping");
      return;
    }
    isSyncingRef.current = true;
    try {
      logToDisk("syncWhatsAppChats: fetching chats...");
      const res = await fetch(`${EVO_CONFIG.baseUrl}/chat/findChats/${EVO_CONFIG.encodedInstanceName}`, {
        method: "POST",
        headers: {
          "apikey": EVO_CONFIG.apiKey,
          "tenant": EVO_CONFIG.tenant,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
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
          const deletedTimeStr = localStorage.getItem(`analise_deleted_contact_${cleanJidPhone.slice(-8)}`);
          if (deletedTimeStr) {
            const deletedTime = parseInt(deletedTimeStr, 10) || 0;
            if (lastMsgTimestamp <= deletedTime) {
              // Ignore this chat, do not recreate the client
              continue;
            } else {
              // They sent a new message! Remove the deleted flag
              localStorage.removeItem(`analise_deleted_contact_${cleanJidPhone.slice(-8)}`);
            }
          }

          // Create new client dynamically
          const lastMsgPushName = chat.lastMessage?.pushName;
          const cleanName = (chat.pushName || (lastMsgPushName && lastMsgPushName !== 'Você' ? lastMsgPushName : null) || cleanJidPhone).trim();
          
          clientId = `c_wa_${cleanJidPhone.slice(-8)}`;

          let initialStatus = "Pessoal";
          let initialTag = "WhatsApp";

          const newClient = {
            id: clientId,
            name: cleanName,
            email: "",
            phone: cleanJidPhone,
            status: initialStatus,
            tags: [initialTag],
            createdAt: new Date().toISOString().split('T')[0],
            jid: clientJid,
            profilePicUrl: chat.profilePicUrl || "",
            lastMessageText: lastMsgText,
            lastMessageTime: lastMsgTime,
            lastMessageTimestamp: lastMsgTimestamp
          };
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
          // If client profile picture has changed or wasn't set, update it
          if (chat.profilePicUrl && updatedClient.profilePicUrl !== chat.profilePicUrl) {
            updatedClient.profilePicUrl = chat.profilePicUrl;
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
          if (updatedClient.lastMessageTimestamp !== lastMsgTimestamp) {
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
              
              localStorage.removeItem(`analise_triage_routed_${clientId}`);
              localStorage.removeItem(`analise_triage_routed_${suffix}`);
              localStorage.removeItem(`analise_triage_routed_time_${clientId}`);
              localStorage.removeItem(`analise_triage_routed_time_${suffix}`);
              localStorage.removeItem(`analise_triage_sent_${cleanJidPhone}`);
              localStorage.removeItem(`analise_triage_sent_${suffix}`);
              localStorage.removeItem(`analise_triage_sent_time_${suffix}`);
              localStorage.removeItem(`analise_triage_sent_time_${cleanJidPhone}`);
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
            localStorage.setItem(`analise_triage_routed_${clientId}`, '1');
            localStorage.setItem(`analise_triage_routed_${suffix}`, '1');
            localStorage.setItem(`analise_triage_routed_time_${clientId}`, (lastMsgTimestamp * 1000).toString());
            localStorage.setItem(`analise_triage_routed_time_${suffix}`, (lastMsgTimestamp * 1000).toString());
            logToDisk(`syncWhatsAppChats (initial sync): ${cleanJidPhone} is active (last message ${timeSinceLastMsg}s ago). Bypassing triage.`);
          } else {
            // Clear flags for inactive or new chats
            localStorage.removeItem(`analise_triage_routed_${clientId}`);
            localStorage.removeItem(`analise_triage_routed_${suffix}`);
            localStorage.removeItem(`analise_triage_routed_time_${clientId}`);
            localStorage.removeItem(`analise_triage_routed_time_${suffix}`);
            localStorage.removeItem(`analise_triage_sent_${cleanJidPhone}`);
            localStorage.removeItem(`analise_triage_sent_${suffix}`);
            localStorage.removeItem(`analise_triage_sent_time_${suffix}`);
            localStorage.removeItem(`analise_triage_sent_time_${cleanJidPhone}`);
            logToDisk(`syncWhatsAppChats (initial sync): ${cleanJidPhone} is inactive or new. Ready for triage.`);
          }
        }

        // Check if lastMessage is a button reply or text choice from the contact
        if (chat.lastMessage && !chat.lastMessage.key?.fromMe) {
          const lastMsgId = chat.lastMessage?.id;
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
              localStorage.removeItem(`analise_triage_routed_${identifier}`);
              localStorage.removeItem(`analise_triage_routed_${suffix}`);
              localStorage.removeItem(`analise_triage_routed_time_${identifier}`);
              localStorage.removeItem(`analise_triage_routed_time_${suffix}`);
            }

            const isNotRouted = !localStorage.getItem(`analise_triage_routed_${identifier}`) &&
                                !localStorage.getItem(`analise_triage_routed_${suffix}`);
            
            if (isNotRouted) {
              const routedStatus = routeClientBasedOnChoice(cleanJidPhone, lastMsgText, buttonId, identifier, newClients);
              if (routedStatus) {
                clientsUpdated = true;
              } else {
                triggerTriageGreetingLocal(cleanJidPhone, clientJid);
              }
            }
          }
        }

        // Check message history sync
        const lastMsgId = chat.lastMessage?.id;
        const currentChatMsgs = chatsRef.current[clientId] || [];
        const localLastMsg = currentChatMsgs[currentChatMsgs.length - 1];

        // WhatsApp unread status synced directly from Evolution API unreadCount
        if (chat.unreadCount > 0) {
          if (clientId !== activeChatClientIdRef.current) {
            setUnreadChats(prev => {
              if (!prev.includes(clientId)) {
                return [...prev, clientId];
              }
              return prev;
            });
          } else {
            // Mark as read on the server immediately since we are viewing this chat
            fetch(`${EVO_CONFIG.baseUrl}/chat/markMessageAsRead/${EVO_CONFIG.encodedInstanceName}`, {
              method: 'POST',
              headers: {
                'apikey': EVO_CONFIG.apiKey,
                'tenant': EVO_CONFIG.tenant,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                readMessages: [
                  {
                    remoteJid: clientJid,
                    fromMe: false,
                    id: chat.lastMessage?.id || ""
                  }
                ]
              })
            }).catch(err => console.error("Error marking read:", err));
          }
        } else {
          setUnreadChats(prev => prev.filter(id => id !== clientId));
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

        // Se a conversa foi limpa e não há mensagens novas, mantém vazia e pula busca
        if (clearedTime > 0 && lastMsgTimestamp <= clearedTime) {
          chatsToUpdate[clientId] = [];
          continue;
        }



        // Fetch full message history only for the active chat (to show messages in the chat window)
        // or for unrouted clients to maintain triage logic consistency
        const clientObjForHistory = newClients.find(c => c.id === clientId);
        const needsPollCheck = clientObjForHistory && clientObjForHistory.status === 'Pessoal' &&
          !localStorage.getItem(`analise_triage_routed_${clientId}`);
        const hasNewMessage = lastMsgId && (!localLastMsg || localLastMsg.id !== lastMsgId);

        if (lastMsgId && (clientId === activeChatClientIdRef.current || needsPollCheck || hasNewMessage || hasMissingFileInfo)) {
          try {
            logToDisk("syncWhatsAppChats: fetching history for " + clientJid);
            const msgRes = await fetch(`${EVO_CONFIG.baseUrl}/chat/findMessages/${EVO_CONFIG.encodedInstanceName}`, {
              method: "POST",
              headers: {
                "apikey": EVO_CONFIG.apiKey,
                "tenant": EVO_CONFIG.tenant,
                "Content-Type": "application/json"
              },
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
                  id: msg.id || `m_wa_${timestamp}_${Math.random()}`,
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

              // Apply edits to original messages
              edits.forEach(edit => {
                const originalMsg = formattedMessages.find(m => m.keyId === edit.targetMessageId || m.id === edit.targetMessageId);
                if (originalMsg) {
                  originalMsg.isEdited = true;
                  if (edit.editedText) {
                    originalMsg.text = edit.editedText;
                  }
                }
              });

              const filteredMessages = formattedMessages.filter(msg => msg.timestamp > clearedTime);

              // Merge, sort ascending by timestamp and keep last 35 messages to protect local storage quota
              const existingMsgs = chatsToUpdate[clientId] || chatsRef.current[clientId] || [];
              const combined = [...existingMsgs, ...filteredMessages];
              const uniqueMsgsMap = new Map();
              combined.forEach(m => {
                const key = m.keyId || m.id;
                uniqueMsgsMap.set(key, m);
              });
              const merged = Array.from(uniqueMsgsMap.values());
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



            }
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
    if (!localStorage.getItem('analise_restored_deleted_v3')) {
      logToDisk("One-time cleanup: clearing deleted contact filters to restore them");
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('analise_deleted_contact_') || key === 'analise_permanently_deleted_contacts')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('analise_restored_deleted_v3', 'true');
    }
  }, []);

  // WhatsApp Poll Effect every 6 seconds when ONLINE
  useEffect(() => {
    let interval;
    if (waStatus === 'ONLINE') {
      syncWhatsAppChats();
      interval = setInterval(syncWhatsAppChats, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [waStatus]);

  // Trigger sync immediately when active chat changes to load history instantly
  useEffect(() => {
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
    localStorage.setItem('eloos_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('analise_wa_status', waStatus);
  }, [waStatus]);

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check against active profile first
    const activeEmail = (profile.email || 'mqssolucao@gmail.com').trim().toLowerCase();
    const activePassword = (profile.password || 'admin').trim();
    if (cleanEmail === activeEmail && cleanPassword === activePassword) {
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      return { success: true };
    }

    // 2. Check against global systemUsers list
    const matched = systemUsers.find(u => 
      (u.email || '').trim().toLowerCase() === cleanEmail && 
      (u.password || '').trim() === cleanPassword
    );
    if (matched) {
      // Update active profile state to match logged in user
      const newProfile = {
        name: matched.name,
        email: matched.email,
        role: matched.role || 'Administrador',
        phone: matched.phone || '37998072208',
        avatar: matched.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        password: matched.password,
        notifications: true,
        autoReply: true,
        integrations: {
          whatsapp: true,
          webhook: false,
          databaseSync: true,
        }
      };
      setProfile(newProfile);
      setIsAuthenticated(true);
      localStorage.setItem('eloos_auth', 'true');
      return { success: true };
    }

    return { success: false, message: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  };

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
      localStorage.removeItem(`analise_deleted_contact_${suffix}`);
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

    const saved = localStorage.getItem('analise_pipelines');
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
    
    // Update client column on Kanban cards linked to this client
    setKanbanCards(prev => prev.map(card => {
      if (card.clientId === updatedClient.id) {
        return {
          ...card,
          title: card.title.replace(/.* - /, `${updatedClient.name} - `),
          column: mapStatusToColumn(updatedClient.status)
        };
      }
      return card;
    }));
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
    localStorage.setItem(`analise_deleted_contact_${suffix}`, lastMsgTimestamp.toString());
    localStorage.removeItem(`analise_triage_sent_${cleanPhone}`);
    localStorage.removeItem(`analise_triage_sent_${suffix}`);
    localStorage.removeItem(`analise_triage_sent_time_${suffix}`);
    localStorage.removeItem(`analise_triage_sent_time_${cleanPhone}`);
    localStorage.removeItem(`analise_triage_routed_${id}`);
    localStorage.removeItem(`analise_triage_routed_${suffix}`);
    localStorage.removeItem(`analise_triage_routed_time_${id}`);
    localStorage.removeItem(`analise_triage_routed_time_${suffix}`);

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
    // (Garantido pelo filtro 'analise_deleted_contact_suffix' em syncWhatsAppChats)
    logToDisk(`deleteClient: Deletion process completed successfully for ${client.name}`);
  };

  // Utility to clear testing cache specifically for any contact with name containing "Miguel Marques"
  useEffect(() => {
    window.clearMiguelMarques = () => {
      console.log("Starting Miguel Marques cache wipe...");
      
      // Wipe localStorage triage flags for Miguel's potential phone suffix
      Object.keys(localStorage).forEach(key => {
        if (key.includes("triage") || key.startsWith("analise_poll_handled_")) {
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
        'analise_unread_chats'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      
      // Wipe triage tags/polls sent
      Object.keys(localStorage).forEach(key => {
        if (key.includes("triage") || key.startsWith("analise_poll_handled_")) {
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

    // Auto-wipe old local caches on first run to clean up previous sessions for the user
    if (!localStorage.getItem('analise_clean_final_delivery')) {
      localStorage.setItem('analise_clean_final_delivery', '1');
      window.clearAllCaches();
    }
  }, []);

  const clearChat = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    const lastMsgTimestamp = client?.lastMessageTimestamp || 0;
    const nowUnix = Math.floor(Date.now() / 1000);
    const clearedTime = Math.max(nowUnix, lastMsgTimestamp) + 2;

    setChatsClearedTimestamps(prev => ({
      ...prev,
      [clientId]: clearedTime
    }));
    setChats(prev => ({
      ...prev,
      [clientId]: []
    }));
  };

  const sendMessage = (clientId, text, file = null, senderName = null, quotedMessage = null) => {
    if (!text.trim() && !file) return;
    
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              fetch(`${EVO_CONFIG.baseUrl}/message/sendWhatsAppAudio/${EVO_CONFIG.encodedInstanceName}`, {
                method: "POST",
                headers: {
                  "apikey": EVO_CONFIG.apiKey,
                  "tenant": EVO_CONFIG.tenant,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
              }).then(res => {
                if (!res.ok) console.error("Erro ao enviar áudio pelo WhatsApp:", res.statusText);
              }).catch(err => console.error("Erro de rede ao enviar áudio pelo WhatsApp:", err));
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
              fetch(`${EVO_CONFIG.baseUrl}/message/sendMedia/${EVO_CONFIG.encodedInstanceName}`, {
                method: "POST",
                headers: {
                  "apikey": EVO_CONFIG.apiKey,
                  "tenant": EVO_CONFIG.tenant,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
              }).then(res => {
                if (!res.ok) console.error("Erro ao enviar mídia pelo WhatsApp:", res.statusText);
              }).catch(err => console.error("Erro ao enviar mídia pelo WhatsApp:", err));
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
          fetch(`${EVO_CONFIG.baseUrl}/message/sendText/${EVO_CONFIG.encodedInstanceName}`, {
            method: "POST",
            headers: {
              "apikey": EVO_CONFIG.apiKey,
              "tenant": EVO_CONFIG.tenant,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          }).then(res => {
            if (!res.ok) console.error("Erro ao enviar texto pelo WhatsApp:", res.statusText);
          }).catch(err => console.error("Erro de rede ao enviar pelo WhatsApp:", err));
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

  // Kanban operations
  const moveKanbanCard = (cardId, targetColumn) => {
    setKanbanCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const saved = localStorage.getItem('analise_pipelines');
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
      localStorage.removeItem(`analise_triage_routed_${id}`);
      localStorage.removeItem(`analise_triage_routed_${suffix}`);
      localStorage.removeItem(`analise_triage_routed_time_${id}`);
      localStorage.removeItem(`analise_triage_routed_time_${suffix}`);
      localStorage.removeItem(`analise_triage_sent_${cleanPhone}`);
      localStorage.removeItem(`analise_triage_sent_${suffix}`);
      localStorage.removeItem(`analise_triage_sent_time_${suffix}`);
      localStorage.removeItem(`analise_triage_sent_time_${cleanPhone}`);
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
      const res = await fetch(`${EVO_CONFIG.baseUrl}/chat/getBase64FromMediaMessage/${EVO_CONFIG.encodedInstanceName}`, {
        method: "POST",
        headers: {
          "apikey": EVO_CONFIG.apiKey,
          "tenant": EVO_CONFIG.tenant,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: {
            key: {
              id: messageId
            }
          },
          convertToMp4: false
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
        const lastPoll = localStorage.getItem('analise_last_pipeline_poll') || '0';
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
          localStorage.setItem('analise_last_pipeline_poll', Date.now().toString());
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
      moveKanbanCard,
      addKanbanCard,
      updateKanbanCard,
      deleteKanbanCard,
      addQuickLink,
      deleteQuickLink,
      clickLink,
      updateProfile,
      waStatus,
      setWaStatus,
      unreadChats,
      setUnreadChats,
      fetchMediaBase64,
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
