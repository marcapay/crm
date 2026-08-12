import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Save, 
  MessageSquare, 
  Key, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  RefreshCw,
  Trash2,
  UserPlus,
  Edit2,
  X,
  QrCode,
  Cpu,
  Mic,
  Square,
  Paperclip,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Copy,
  CopyCheck,
  Plus
} from 'lucide-react';

const clientName = import.meta.env.VITE_CLIENT_NAME || 'CRM Base';
const instanceName = import.meta.env.VITE_EVO_INSTANCE_NAME || clientName;
const EVO_CONFIG = {
  baseUrl: import.meta.env.VITE_EVO_BASE_URL || "",
  apiKey: import.meta.env.VITE_EVO_API_KEY || "",
  tenant: import.meta.env.VITE_EVO_TENANT || "",
  instanceName: instanceName,
  encodedInstanceName: encodeURIComponent(instanceName)
};

export default function Configuracoes() {
  const { 
    theme, 
    setTheme,
    quickLinks,
    waStatus,
    setWaStatus,
    profile,
    updateProfile,
    systemUsers,
    setSystemUsers,
    chats,
    sendMessage,
    clearChat,
    waInstances,
    setWaInstances,
    addWaInstance,
    removeWaInstance
  } = useApp();

  const [newInstanceInput, setNewInstanceInput] = useState('');
  const [newInstanceLabelInput, setNewInstanceLabelInput] = useState('');
  const [showAddInstanceModal, setShowAddInstanceModal] = useState(false);
  const [expandedInstanceDetails, setExpandedInstanceDetails] = useState({});
  const [isBehaviorExpanded, setIsBehaviorExpanded] = useState(false);

  // Accordion active state: tracks index of currently open panel (or null)
  const [activePanel, setActivePanel] = useState('whatsapp');

  const [qrCodeBase64Map, setQrCodeBase64Map] = useState({});
  const [waError, setWaError] = useState('');
  const [waLoading, setWaLoading] = useState(false);

  const checkWhatsAppStatus = async (targetInstName = EVO_CONFIG.instanceName) => {
    try {
      const encoded = encodeURIComponent(targetInstName);
      const res = await fetch(`/api/whatsapp?action=status&instance=${encoded}`);
      if (res.ok) {
        const data = await res.json();
        const state = data?.instance?.state || data?.state || "close";
        if (state === "open") {
          setWaStatus("ONLINE");
          setQrCodeBase64Map(prev => ({ ...prev, [targetInstName]: '' }));
          setWaError("");
          setWaInstances(prev => prev.map(i => i.instanceName === targetInstName ? { ...i, status: 'ONLINE' } : i));
        } else {
          setWaStatus(prev => (prev === "QR_CODE" || prev === "GENERATING_QR") ? prev : "DISCONNECTED");
          setWaInstances(prev => prev.map(i => i.instanceName === targetInstName ? { 
            ...i, 
            status: (i.status === 'ONLINE' ? 'DISCONNECTED' : i.status) 
          } : i));
        }
      } else {
        setWaStatus(prev => (prev === "QR_CODE" || prev === "GENERATING_QR") ? prev : "DISCONNECTED");
      }
    } catch (err) {
      console.error("Erro ao checar status do WhatsApp:", err);
      setWaError("Falha na comunicação com a API.");
    }
  };

  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  // Polling Connection State when QR Code is visible
  useEffect(() => {
    let statusInterval;
    let qrRefreshInterval;
    
    if (waStatus === 'QR_CODE') {
      // Poll connection status every 3 seconds
      statusInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/whatsapp?action=status&instance=${EVO_CONFIG.encodedInstanceName}`);
          if (res.ok) {
            const data = await res.json();
            const state = data?.instance?.state || data?.state || "close";
            if (state === "open") {
              setWaStatus("ONLINE");
              setQrCodeBase64Map(prev => ({ ...prev, [EVO_CONFIG.instanceName]: '' }));
              setWaError("");
              setWaInstances(prev => prev.map(i => i.instanceName === EVO_CONFIG.instanceName ? { ...i, status: 'ONLINE' } : i));
            }
          }
        } catch (err) {
          console.error("Erro no polling de status:", err);
        }
      }, 3000);

      // Refresh the QR Code image every 20 seconds to prevent expiration
      qrRefreshInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/whatsapp?action=connect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ instanceName: EVO_CONFIG.instanceName })
          });
          if (res.ok) {
            const data = await res.json();
            const base64 = data?.base64 || data?.qrcode?.base64 || data?.qr || "";
            if (base64) {
              const formatted = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
              setQrCodeBase64Map(prev => ({ ...prev, [EVO_CONFIG.instanceName]: formatted }));
            }
          }
        } catch (err) {
          console.error("Erro ao atualizar QR Code expirado:", err);
        }
      }, 20000);
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
      if (qrRefreshInterval) clearInterval(qrRefreshInterval);
    };
  }, [waStatus]);

  const handleConnectWhatsApp = async (targetInstName = EVO_CONFIG.instanceName) => {
    setWaStatus('GENERATING_QR');
    setWaError("");
    setQrCodeBase64Map(prev => ({ ...prev, [targetInstName]: '' }));
    setWaLoading(true);
    try {
      const encoded = encodeURIComponent(targetInstName);
      const checkRes = await fetch(`/api/whatsapp?action=status&instance=${encoded}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const state = checkData?.instance?.state || checkData?.state || "";
        if (state === "open") {
          setWaStatus("ONLINE");
          setWaInstances(prev => prev.map(i => i.instanceName === targetInstName ? { ...i, status: 'ONLINE' } : i));
          setWaLoading(false);
          return;
        }
      }

      let res = await fetch(`/api/whatsapp?action=connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: targetInstName })
      });
      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        setWaError(data?.error || data?.message || `Erro ${res.status}`);
        setWaStatus("DISCONNECTED");
        setWaLoading(false);
        return;
      }

      const base64 = data?.base64 || data?.qrcode?.base64 || data?.qr || "";
      if (base64) {
        const formatted = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
        setQrCodeBase64Map(prev => ({ ...prev, [targetInstName]: formatted }));
        setWaStatus("QR_CODE");
      } else {
        const state = data?.instance?.state || data?.state || "";
        if (state === "open" || data?.status === "CONNECTED" || data?.instance?.status === "CONNECTED") {
          setWaStatus("ONLINE");
          setWaInstances(prev => prev.map(i => i.instanceName === targetInstName ? { ...i, status: 'ONLINE' } : i));
        } else {
          setWaError("QR Code não retornado pela API. Tente novamente.");
          setWaStatus("DISCONNECTED");
        }
      }
    } catch (err) {
      console.error("Erro ao conectar WhatsApp:", err);
      setWaError("Erro de comunicação com a API.");
      setWaStatus("DISCONNECTED");
    } finally {
      setWaLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async (targetInstName = EVO_CONFIG.instanceName) => {
    if (confirm(`Deseja realmente desconectar a instância "${targetInstName}"?`)) {
      setWaLoading(true);
      setWaError("");
      try {
        await fetch(`/api/whatsapp?action=logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instanceName: targetInstName })
        });
        try {
          await fetch(`/api/whatsapp?action=delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ instanceName: targetInstName })
          });
        } catch (e) {
          console.error("Erro ao deletar instância:", e);
        }
        setWaStatus("DISCONNECTED");
        setWaInstances(prev => prev.map(i => i.instanceName === targetInstName ? { ...i, status: 'DISCONNECTED' } : i));
        setQrCodeBase64Map(prev => ({ ...prev, [targetInstName]: '' }));
      } catch (err) {
        console.error("Erro ao desconectar WhatsApp:", err);
        setWaError("Erro ao desconectar a instância.");
        checkWhatsAppStatus(targetInstName);
      } finally {
        setWaLoading(false);
      }
    }
  };





  // Form states to invite new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Normal');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserColor, setNewUserColor] = useState('#3b82f6');
  const [emailApiKey, setEmailApiKey] = useState(() => {
    return localStorage.getItem('crmbase_resend_api_key') || '';
  });
  const [inviteWebhookUrl, setInviteWebhookUrl] = useState(() => {
    return localStorage.getItem('crmbase_invite_webhook_url') || '';
  });

  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('Normal');
  const [editUserStatus, setEditUserStatus] = useState('Ativo');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserColor, setEditUserColor] = useState('#3b82f6');

  // Agente SDR Inteligente
  const [sdrEnabled, setSdrEnabled] = useState(() => {
    return localStorage.getItem('crmbase_sdr_enabled') === 'true';
  });
  const [sdrBehavior, setSdrBehavior] = useState(() => {
    return localStorage.getItem('crmbase_sdr_behavior') || 
      'Você é um assistente virtual inteligente e deve responder de forma cortês, clara e objetiva. ' +
      'Sempre que um atendente humano interagir na conversa, interrompa o atendimento automático.';
  });
  const [sdrWelcomeMessage, setSdrWelcomeMessage] = useState(() => {
    return localStorage.getItem('crmbase_sdr_welcome') || 
      'Olá, seja bem-vindo! Escolha seu atendimento:';
  });
  const [sdrTransferMessage, setSdrTransferMessage] = useState(() => {
    return localStorage.getItem('crmbase_sdr_transfer') || 
      'Certo! Entendi sua opção. Vou transferir você para o atendimento humano correspondente. Por favor, aguarde um momento.';
  });
  const [sdrProvider, setSdrProvider] = useState(() => {
    return localStorage.getItem('crmbase_sdr_provider') || 'openai';
  });
  const [sdrApiKey, setSdrApiKey] = useState(() => {
    return localStorage.getItem('crmbase_sdr_apikey') || '';
  });
  const [sdrModel, setSdrModel] = useState(() => {
    return localStorage.getItem('crmbase_sdr_model') || 'gpt-4o';
  });
  const [sdrReplyWithAgent, setSdrReplyWithAgent] = useState(() => {
    return localStorage.getItem('crmbase_sdr_reply_agent') === 'true';
  });
  const [sdrSplitResponses, setSdrSplitResponses] = useState(() => {
    return localStorage.getItem('crmbase_sdr_split_responses') === 'true';
  });
  const [sdrProcessImages, setSdrProcessImages] = useState(() => {
    return localStorage.getItem('crmbase_sdr_process_images') !== 'false';
  });
  const [sdrDisableOutside, setSdrDisableOutside] = useState(() => {
    return localStorage.getItem('crmbase_sdr_disable_outside') !== 'false';
  });
  const [sdrIgnoreGroups, setSdrIgnoreGroups] = useState(() => {
    return localStorage.getItem('crmbase_sdr_ignore_groups') !== 'false';
  });
  const [sdrPauseOnHuman, setSdrPauseOnHuman] = useState(() => {
    return localStorage.getItem('crmbase_sdr_pause_human') === 'true';
  });
  const [sdrRouteMode, setSdrRouteMode] = useState(() => {
    return localStorage.getItem('crmbase_sdr_route_mode') || 'disabled';
  });
  const [sdrStaticMapping, setSdrStaticMapping] = useState(() => {
    const saved = localStorage.getItem('crmbase_sdr_static_mapping');
    return saved ? JSON.parse(saved) : [
      { key: '1', columnId: 'pessoal_a_fazer' },
      { key: '2', columnId: 'pessoal_em_andamento' },
      { key: '3', columnId: 'pessoal_concluido' }
    ];
  });
  const [sdrAiMapping, setSdrAiMapping] = useState(() => {
    const saved = localStorage.getItem('crmbase_sdr_ai_mapping');
    return saved ? JSON.parse(saved) : [
      { keywords: 'suporte, ajuda', columnId: 'pessoal_a_fazer' },
      { keywords: 'financeiro, boleto', columnId: 'pessoal_em_andamento' }
    ];
  });

  const getColumnsList = () => {
    try {
      const savedCols = localStorage.getItem('crmbase_columns');
      const savedPipelines = localStorage.getItem('crmbase_pipelines');
      if (savedCols) {
        const cols = JSON.parse(savedCols);
        const pipes = savedPipelines ? JSON.parse(savedPipelines) : [];
        return cols.map(c => {
          const pipe = pipes.find(p => p.id === c.pipelineId);
          return {
            id: c.id,
            name: c.name,
            pipelineName: pipe ? pipe.name : c.pipelineId
          };
        });
      }
    } catch (e) {}
    return [
      { id: 'pessoal_a_fazer', name: 'A Fazer', pipelineName: 'Pessoal' },
      { id: 'pessoal_em_andamento', name: 'Em Andamento', pipelineName: 'Pessoal' },
      { id: 'pessoal_concluido', name: 'Concluído', pipelineName: 'Pessoal' }
    ];
  };
  const [sdrInstagramReactions, setSdrInstagramReactions] = useState(() => {
    return localStorage.getItem('crmbase_sdr_insta_reactions') === 'true';
  });
  const [sdrMarkAsUnread, setSdrMarkAsUnread] = useState(() => {
    return localStorage.getItem('crmbase_sdr_mark_unread') === 'true';
  });
  const [sdrExecMode, setSdrExecMode] = useState(() => {
    return localStorage.getItem('crmbase_sdr_exec_mode') || 'classic';
  });
  const [sdrTemperature, setSdrTemperature] = useState(() => {
    const val = localStorage.getItem('crmbase_sdr_temperature');
    return val !== null ? parseFloat(val) : 0.2;
  });
  const [sdrMaxHistory, setSdrMaxHistory] = useState(() => {
    const val = localStorage.getItem('crmbase_sdr_max_history');
    return val !== null ? parseInt(val, 10) : 28;
  });
  const [sdrMaxTokens, setSdrMaxTokens] = useState(() => {
    const val = localStorage.getItem('crmbase_sdr_max_tokens');
    return val !== null ? parseInt(val, 10) : 100;
  });
  const [sdrIgnoreSeconds, setSdrIgnoreSeconds] = useState(() => {
    const val = localStorage.getItem('crmbase_sdr_ignore_seconds');
    return val !== null ? parseInt(val, 10) : 0;
  });
  const [sdrDelay, setSdrDelay] = useState(() => {
    return localStorage.getItem('crmbase_sdr_delay') || '0';
  });
  const [ragSimilarity, setRagSimilarity] = useState(() => {
    const saved = localStorage.getItem('crmbase_sdr_rag_similarity');
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [knowledgeFiles, setKnowledgeFiles] = useState(() => {
    const saved = localStorage.getItem('crmbase_sdr_knowledge_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [knowledgeSources, setKnowledgeSources] = useState(() => {
    const saved = localStorage.getItem('crmbase_sdr_knowledge_sources');
    return saved ? JSON.parse(saved) : [
      { id: 'src_1', name: 'Fonte 1', type: 'sheets', url: '' }
    ];
  });

  // Supabase RAG Knowledge Storage Settings
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('crmbase_supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('crmbase_supabase_anon_key') || '');
  const [supabaseBucket, setSupabaseBucket] = useState(() => localStorage.getItem('crmbase_supabase_bucket') || 'knowledge_base');
  const [supabaseTable, setSupabaseTable] = useState(() => localStorage.getItem('crmbase_supabase_table') || 'chat_messages');
  const [supabaseTestStatus, setSupabaseTestStatus] = useState(null);
  const [showSupabaseSqlModal, setShowSupabaseSqlModal] = useState(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);

  const fileInputRef = useRef(null);
  const simFileInputRef = useRef(null);

  const [sdrSubTab, setSdrSubTab] = useState('training');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [copiedInviteMsg, setCopiedInviteMsg] = useState(false);

  const USER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = {
      id: 'u_' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      status: 'Ativo',
      password: newUserPassword || '123456',
      color: newUserColor || USER_COLORS[systemUsers.length % USER_COLORS.length]
    };

    setSystemUsers(prev => [...prev, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('Normal');
    setNewUserColor(USER_COLORS[(systemUsers.length + 1) % USER_COLORS.length]);
    alert(`Usuário "${newUser.name}" cadastrado com sucesso!`);
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role || 'Normal');
    setEditUserStatus(user.status || 'Ativo');
    setEditUserPassword(user.password || '');
    setEditUserColor(user.color || '#3b82f6');
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSystemUsers(prev => prev.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editUserName.trim(),
          email: editUserEmail.trim().toLowerCase(),
          role: editUserRole,
          status: editUserStatus,
          password: editUserPassword || u.password,
          color: editUserColor
        };
      }
      return u;
    }));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    const user = systemUsers.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`Deseja realmente revogar o acesso de "${user.name}"?`)) {
      setSystemUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleCopyInviteMessage = (targetUser = null) => {
    const currentUrl = window.location.origin + window.location.pathname;
    
    // Priority: 1. Passed targetUser, 2. Filled inputs, 3. Last created user in systemUsers
    let nameText = '';
    let emailText = '';
    let passText = '';

    if (targetUser && targetUser.name) {
      nameText = targetUser.name;
      emailText = targetUser.email || '';
      passText = targetUser.password || 'admin';
    } else if (newUserName.trim() || newUserEmail.trim()) {
      nameText = newUserName.trim();
      emailText = newUserEmail.trim();
      passText = newUserPassword.trim();
    } else if (systemUsers.length > 0) {
      const lastUser = systemUsers[systemUsers.length - 1];
      nameText = lastUser.name;
      emailText = lastUser.email;
      passText = lastUser.password || 'admin';
    }

    if (!nameText) nameText = '[Nome do Operador]';
    if (!emailText) emailText = '[e-mail de acesso]';
    if (!passText) passText = '[Senha cadastrada]';
    
    const messageTemplate = `Olá, *${nameText}*! 👋

Seu cadastro foi realizado com sucesso e seu acesso ao sistema *${clientName}* está pronto!

🚀 *Credenciais de Acesso ao Painel:*
🌐 *Link:* ${currentUrl}
📧 *E-mail:* ${emailText}
🔑 *Senha:* ${passText}`;

    navigator.clipboard.writeText(messageTemplate).then(() => {
      setCopiedInviteMsg(true);
      setTimeout(() => setCopiedInviteMsg(false), 2500);
    }).catch(err => {
      console.error("Erro ao copiar mensagem:", err);
    });
  };
  const testChatEndRef = useRef(null);
  const [simPreviewFile, setSimPreviewFile] = useState(null);
  const [isSimFullScreen, setIsSimFullScreen] = useState(false);
  const [simPanX, setSimPanX] = useState(0);
  const [simPanY, setSimPanY] = useState(0);
  const [simZoomScale, setSimZoomScale] = useState(1);

  const resetSimPan = () => {
    setSimPanX(0);
    setSimPanY(0);
    setSimZoomScale(1);
  };
  const moveSimPan = (dx, dy) => {
    setSimPanX(prev => prev + dx);
    setSimPanY(prev => prev + dy);
  };
  const handleSimZoomIn = () => setSimZoomScale(prev => Math.min(prev + 0.25, 3));
  const handleSimZoomOut = () => setSimZoomScale(prev => Math.max(prev - 0.25, 0.5));

  const handleSimFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const baseUrl = event.target.result;
      const fileData = {
        name: file.name,
        type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        size: file.size,
        url: baseUrl
      };

      const isImg = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
      const isTextOrDoc = file.type?.includes('text') || file.name?.match(/\.(txt|csv|json|md|html|xml|doc|docx|pdf)$/i);

      if (isTextOrDoc && (file.type?.includes('text') || file.name?.match(/\.(txt|csv|json|md)$/i))) {
        const textReader = new FileReader();
        textReader.onload = (tEvent) => {
          fileData.textContent = tEvent.target.result;
          const textLabel = `📄 Documento enviado: ${file.name}`;
          sendMessage('client_teste_agente', textLabel, fileData);
        };
        textReader.readAsText(file);
      } else {
        const textLabel = isImg ? `📷 Imagem enviada: ${file.name}` : `📄 Documento enviado: ${file.name}`;
        sendMessage('client_teste_agente', textLabel, fileData);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Audio recording state for simulator
  const [isSimRecording, setIsSimRecording] = useState(false);
  const [simRecordingTime, setSimRecordingTime] = useState(0);
  const simMediaRecorderRef = useRef(null);
  const simAudioChunksRef = useRef([]);
  const simTimerRef = useRef(null);
  const simStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      if (simStreamRef.current) {
        simStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startSimRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      simStreamRef.current = stream;

      const options = { mimeType: 'audio/webm' };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      simMediaRecorderRef.current = recorder;
      simAudioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          simAudioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(simAudioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = {
            name: `audio_${Date.now()}.webm`,
            type: audioBlob.type || 'audio/webm',
            url: event.target.result
          };
          sendMessage('client_teste_agente', '🔊 Áudio enviado no teste', fileData);
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.start();
      setIsSimRecording(true);
      setSimRecordingTime(0);

      simTimerRef.current = setInterval(() => {
        setSimRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erro ao acessar microfone no simulador:", err);
      alert("Não foi possível acessar o microfone para o teste. Verifique as permissões do navegador.");
    }
  };

  const stopSimRecording = () => {
    if (simMediaRecorderRef.current && simMediaRecorderRef.current.state !== 'inactive') {
      simMediaRecorderRef.current.stop();
    }
    cleanupSimRecording();
  };

  const cancelSimRecording = () => {
    if (simMediaRecorderRef.current && simMediaRecorderRef.current.state !== 'inactive') {
      simMediaRecorderRef.current.onstop = null;
      simMediaRecorderRef.current.stop();
    }
    cleanupSimRecording();
  };

  const cleanupSimRecording = () => {
    setIsSimRecording(false);
    setSimRecordingTime(0);
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    if (simStreamRef.current) {
      simStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const testMessages = chats['client_teste_agente'] || [];
  useEffect(() => {
    if (sdrSubTab === 'test') {
      testChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [testMessages.length, sdrSubTab]);

  useEffect(() => {
    localStorage.setItem('crmbase_sdr_enabled', sdrEnabled);
  }, [sdrEnabled]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_behavior', sdrBehavior);
    // Combine for backward compatibility
    localStorage.setItem('crmbase_sdr_prompt', `${sdrBehavior}\n\n[MENSAGEM INICIAL]\n${sdrWelcomeMessage}\n\n[MENSAGEM DE TRANSFERENCIA]\n${sdrTransferMessage}`);
  }, [sdrBehavior, sdrWelcomeMessage, sdrTransferMessage]);

  useEffect(() => {
    localStorage.setItem('crmbase_sdr_welcome', sdrWelcomeMessage);
  }, [sdrWelcomeMessage]);

  useEffect(() => {
    localStorage.setItem('crmbase_sdr_transfer', sdrTransferMessage);
  }, [sdrTransferMessage]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_provider', sdrProvider);
  }, [sdrProvider]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_apikey', sdrApiKey);
  }, [sdrApiKey]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_model', sdrModel);
  }, [sdrModel]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_reply_agent', sdrReplyWithAgent);
  }, [sdrReplyWithAgent]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_split_responses', sdrSplitResponses);
  }, [sdrSplitResponses]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_process_images', sdrProcessImages);
  }, [sdrProcessImages]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_disable_outside', sdrDisableOutside);
  }, [sdrDisableOutside]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_ignore_groups', sdrIgnoreGroups);
  }, [sdrIgnoreGroups]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_insta_reactions', sdrInstagramReactions);
  }, [sdrInstagramReactions]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_pause_human', sdrPauseOnHuman);
  }, [sdrPauseOnHuman]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_route_mode', sdrRouteMode);
  }, [sdrRouteMode]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_static_mapping', JSON.stringify(sdrStaticMapping));
  }, [sdrStaticMapping]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_ai_mapping', JSON.stringify(sdrAiMapping));
  }, [sdrAiMapping]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_mark_unread', sdrMarkAsUnread);
  }, [sdrMarkAsUnread]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_exec_mode', sdrExecMode);
  }, [sdrExecMode]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_temperature', sdrTemperature);
  }, [sdrTemperature]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_max_history', sdrMaxHistory);
  }, [sdrMaxHistory]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_max_tokens', sdrMaxTokens);
  }, [sdrMaxTokens]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_ignore_seconds', sdrIgnoreSeconds);
  }, [sdrIgnoreSeconds]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_delay', sdrDelay);
  }, [sdrDelay]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_rag_similarity', ragSimilarity);
  }, [ragSimilarity]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_knowledge_files', JSON.stringify(knowledgeFiles));
  }, [knowledgeFiles]);
  useEffect(() => {
    localStorage.setItem('crmbase_sdr_knowledge_sources', JSON.stringify(knowledgeSources));
  }, [knowledgeSources]);
  useEffect(() => {
    localStorage.setItem('crmbase_supabase_url', supabaseUrl);
  }, [supabaseUrl]);
  useEffect(() => {
    localStorage.setItem('crmbase_supabase_anon_key', supabaseAnonKey);
  }, [supabaseAnonKey]);
  useEffect(() => {
    localStorage.setItem('crmbase_supabase_bucket', supabaseBucket);
  }, [supabaseBucket]);
  useEffect(() => {
    localStorage.setItem('crmbase_supabase_table', supabaseTable);
  }, [supabaseTable]);

  const testSupabaseConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSupabaseTestStatus({ success: false, msg: 'Por favor, preencha a URL e a Chave Anon/Service do Supabase!' });
      return;
    }

    setSupabaseTestStatus({ loading: true, msg: 'Testando conexão com Supabase...' });
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (response.ok || response.status === 200 || response.status === 404) {
        setSupabaseTestStatus({ success: true, msg: '⚡ Conexão com Supabase estabelecida com sucesso!' });
      } else {
        setSupabaseTestStatus({ success: false, msg: `Erro HTTP (${response.status}): Verifique se a URL e a Key estão corretas.` });
      }
    } catch(err) {
      setSupabaseTestStatus({ success: false, msg: 'Falha ao conectar. Verifique sua URL ou conexão de internet.' });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(async (file) => {
      const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json');
      let extractedText = '';
      let rawResult = '';

      if (isText) {
        const textReader = new FileReader();
        textReader.onload = (event) => {
          extractedText = event.target.result || '';
          rawResult = extractedText;
          processAndUploadFile(file, rawResult, extractedText);
        };
        textReader.readAsText(file);
      } else {
        // PDF or Binary File
        const arrayReader = new FileReader();
        arrayReader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          rawResult = `data:${file.type};base64,` + btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          // Use PDF.js to extract 100% clean, human-readable text from PDF pages
          if (window.pdfjsLib) {
            try {
              const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
              const pdf = await loadingTask.promise;
              let fullTextChunks = [];

              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                if (pageText.trim()) {
                  fullTextChunks.push(pageText.trim());
                }
              }

              extractedText = fullTextChunks.join('\n\n').trim();
            } catch (pdfErr) {
              console.warn('PDF.js parsing notice:', pdfErr);
            }
          }

          // Fallback if PDF.js is unavailable or empty: regex stream parser
          if (!extractedText) {
            try {
              const base64Data = rawResult.split(',')[1] || '';
              const decoded = atob(base64Data);
              const parenthesizedRegex = /\(([^()]{2,})\)/g;
              let match;
              let chunks = [];
              while ((match = parenthesizedRegex.exec(decoded)) !== null) {
                const str = match[1].replace(/[^\x20-\x7E\xA0-\xFFà-úÀ-Ú]/g, ' ').trim();
                if (str.length > 2 && !str.startsWith('/') && !str.startsWith('%PDF')) {
                  chunks.push(str);
                }
              }
              extractedText = chunks.join(' ');
            } catch (e) {}
          }

          processAndUploadFile(file, rawResult, extractedText || file.name);
        };
        arrayReader.readAsArrayBuffer(file);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processAndUploadFile = (file, rawResult, extractedText) => {
    const fileObj = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || file.name.split('.').pop().toUpperCase(),
      data: rawResult,
      textContent: extractedText || file.name,
      uploadedAt: new Date().toLocaleDateString()
    };
    setKnowledgeFiles(prev => [...prev, fileObj]);

    // Auto-sync clean text content to Supabase database
    const curUrl = localStorage.getItem('crmbase_supabase_url') || supabaseUrl;
    const curKey = localStorage.getItem('crmbase_supabase_anon_key') || supabaseAnonKey;
    const curTable = (localStorage.getItem('crmbase_supabase_bucket') || supabaseBucket || 'knowledge_base').trim();

    if (curUrl && curKey) {
      const cleanUrl = curUrl.replace(/\/$/, '').replace(/\/rest\/v1$/, '');
      const rawTable = curTable || 'knowledge_base';
      const sanitizedTable = rawTable.trim().replace(/\s+/g, '_').toLowerCase();

      const payloadStandard = {
        file_name: file.name,
        content: extractedText || file.name,
        metadata: { size: fileObj.size, uploaded_at: fileObj.uploadedAt }
      };

      const payloadPT = {
        nome_do_arquivo: file.name,
        contente: extractedText || file.name,
        metadados: { size: fileObj.size, uploaded_at: fileObj.uploadedAt }
      };

      const tryPostToSupabase = async (tableName) => {
        const endpoint = `${cleanUrl}/rest/v1/${encodeURIComponent(tableName)}`;
        let r = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': curKey,
            'Authorization': `Bearer ${curKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payloadStandard)
        });

        if (r.ok) return true;

        r = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': curKey,
            'Authorization': `Bearer ${curKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payloadPT)
        });

        if (r.ok) return true;
        return false;
      };

      const candidates = Array.from(new Set([
        rawTable.trim(),
        sanitizedTable,
        'base de conhecimento',
        'base_de_conhecimento',
        'knowledge_base',
        'documentos'
      ]));

      (async () => {
        let synced = false;
        for (const tbl of candidates) {
          if (await tryPostToSupabase(tbl)) {
            synced = true;
            setSupabaseTestStatus({ success: true, msg: `⚡ Conteúdo limpo do PDF "${file.name}" salvo no Supabase (${tbl})!` });
            break;
          }
        }
        if (!synced) {
          setSupabaseTestStatus({ success: false, msg: `Erro ao enviar para o Supabase. Verifique o nome da tabela.` });
        }
      })().catch(err => {
        console.error('Erro ao sincronizar com Supabase:', err);
      });
    }
  };

  const removeKnowledgeFile = (id) => {
    const fileToRemove = knowledgeFiles.find(f => f.id === id);
    setKnowledgeFiles(prev => prev.filter(f => f.id !== id));

    // Delete from Supabase knowledge_base / custom table
    const curUrl = localStorage.getItem('crmbase_supabase_url') || supabaseUrl;
    const curKey = localStorage.getItem('crmbase_supabase_anon_key') || supabaseAnonKey;
    const curTable = (localStorage.getItem('crmbase_supabase_bucket') || supabaseBucket || 'knowledge_base').trim();

    if (fileToRemove && curUrl && curKey) {
      const cleanUrl = curUrl.replace(/\/$/, '').replace(/\/rest\/v1$/, '');
      const targetTable = curTable || 'knowledge_base';
      const encodedName = encodeURIComponent(fileToRemove.name);

      fetch(`${cleanUrl}/rest/v1/${targetTable}?file_name=eq.${encodedName}`, {
        method: 'DELETE',
        headers: {
          'apikey': curKey,
          'Authorization': `Bearer ${curKey}`
        }
      }).then(res => {
        if (!res.ok) {
          fetch(`${cleanUrl}/rest/v1/${targetTable}?nome_do_arquivo=eq.${encodedName}`, {
            method: 'DELETE',
            headers: {
              'apikey': curKey,
              'Authorization': `Bearer ${curKey}`
            }
          });
        }
      }).catch(err => console.error('Erro ao remover do Supabase:', err));
    }
  };

  const addKnowledgeSource = () => {
    const newSrc = {
      id: `src_${Date.now()}`,
      name: `Fonte ${knowledgeSources.length + 1}`,
      type: 'link',
      url: ''
    };
    setKnowledgeSources(prev => [...prev, newSrc]);
  };

  const updateKnowledgeSource = (id, field, value) => {
    if (field === 'url') {
      const oldSrc = knowledgeSources.find(s => s.id === id);
      if (oldSrc?.url) {
        localStorage.removeItem(`crmbase_url_cache_${oldSrc.url.trim()}`);
      }
    }
    setKnowledgeSources(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeKnowledgeSource = (id) => {
    const oldSrc = knowledgeSources.find(s => s.id === id);
    if (oldSrc?.url) {
      localStorage.removeItem(`crmbase_url_cache_${oldSrc.url.trim()}`);
    }
    setKnowledgeSources(prev => prev.filter(s => s.id !== id));
  };





  // Notificações e Segurança
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const togglePanel = (panelId) => {
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 className="title-gradient" style={styles.title}>Configurações do Sistema</h1>
          <p style={styles.subtitle}>Gerencie dados corporativos, integrações e níveis de acesso.</p>
        </div>

        <div style={styles.headerActions}>
          <div className={`badge ${waStatus === 'ONLINE' ? 'badge-success' : 'badge-danger'}`} style={waStatus === 'ONLINE' ? styles.diagBadge : styles.diagBadgeOffline}>
            {waStatus === 'ONLINE' ? (
              <RefreshCw size={12} className="animate-pulse-glow" style={{ marginRight: '4px' }} />
            ) : (
              <RefreshCw size={12} style={{ marginRight: '4px' }} />
            )}
            <span>{waStatus === 'ONLINE' ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}</span>
          </div>

          <button onClick={handleSaveAll} className="btn btn-cyan" style={styles.saveBtn}>
            <Save size={16} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </header>

      {/* Accordion Panels Stack */}
      <div style={styles.accordionStack}>
        
        {/* PANEL 1: WhatsApp Integration */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('whatsapp')}>
            <div style={styles.panelHeaderLeft}>
              <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Integração com WhatsApp</span>
              {waStatus === 'ONLINE' && (
                <span className="badge badge-success" style={styles.inlineBadge}>ONLINE</span>
              )}
            </div>
            {activePanel === 'whatsapp' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'whatsapp' && (
            <div style={styles.panelContent}>
              <p style={styles.waDescription}>
                Gerencie a conexão de entrada de mensagens do WhatsApp e instâncias do sistema.
              </p>
              
              {/* Multi-Instance Management Header & Add Action */}
              <div style={{
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddInstanceModal(true)}
                  className="btn btn-primary"
                  style={{ gap: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                >
                  <span>Instância</span>
                </button>
              </div>

              {/* Instances Cards Grid */}
              <div className="config-instances-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {waInstances.map(inst => {
                  const isExpanded = !!expandedInstanceDetails[inst.id];
                  return (
                    <div key={inst.id} style={{
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: inst.instanceName === EVO_CONFIG.instanceName ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}>
                      <div 
                        onClick={() => setExpandedInstanceDetails(prev => ({ ...prev, [inst.id]: !prev[inst.id] }))}
                        style={{
                          padding: '0.875rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                              {inst.name}
                            </span>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                              Instância: {inst.instanceName}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span className={`badge ${inst.status === 'ONLINE' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.6875rem' }}>
                            {inst.status}
                          </span>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px'
                            }}
                            title={isExpanded ? "Ocultar Detalhes" : "Exibir Detalhes de Conexão"}
                          >
                            {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--accent-cyan)' }} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details Container */}
                      {isExpanded && (
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-tertiary)' }}>
                          <div className="config-wa-grid" style={styles.waContainerGrid}>
                            {/* Left Side: Connection Status Details & Actions */}
                            <div style={styles.waLeftCol}>
                              <div style={styles.waDetailsCard}>
                                <div style={styles.waDetailRow}>
                                  <span style={styles.waDetailLabel}>INSTÂNCIA</span>
                                  <span style={styles.waDetailValue}>{inst.instanceName}</span>
                                </div>
                                
                                <div style={styles.waDetailRow}>
                                  <span style={styles.waDetailLabel}>PERFIL PAREADO</span>
                                  <span style={{ 
                                    ...styles.waDetailValue, 
                                    color: inst.status === 'ONLINE' ? 'var(--accent-success)' : 'var(--text-tertiary)' 
                                  }}>
                                    {inst.status === 'ONLINE' ? `${clientName} Gestão` : 'Nenhum'}
                                  </span>
                                </div>
                                
                                <div style={{ ...styles.waDetailRow, borderBottom: 'none', paddingBottom: 0 }}>
                                  <span style={styles.waDetailLabel}>STATUS DA INSTÂNCIA</span>
                                  <span style={{ 
                                    ...styles.waDetailValue, 
                                    color: inst.status === 'ONLINE' ? 'var(--accent-success)' : inst.status === 'QR_CODE' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem'
                                  }}>
                                    <span style={{ 
                                      width: '8px', 
                                      height: '8px', 
                                      borderRadius: '50%', 
                                      backgroundColor: inst.status === 'ONLINE' ? 'var(--accent-success)' : inst.status === 'QR_CODE' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                                      display: 'inline-block'
                                    }} />
                                    <span>{inst.status === 'ONLINE' ? 'Online' : inst.status === 'QR_CODE' ? 'Aguardando Leitura' : 'Desconectado'}</span>
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="wa-action-buttons-row" style={styles.waActionButtonsRow}>
                                <button 
                                  type="button" 
                                  onClick={() => handleConnectWhatsApp(inst.instanceName)}
                                  className="btn btn-primary"
                                  style={{ 
                                    ...styles.waConnectBtn, 
                                    opacity: (waStatus === 'GENERATING_QR' || waLoading || inst.status === 'ONLINE') ? 0.6 : 1,
                                    cursor: inst.status === 'ONLINE' ? 'default' : 'pointer'
                                  }}
                                  disabled={waStatus === 'GENERATING_QR' || waLoading || inst.status === 'ONLINE'}
                                >
                                  <QrCode size={16} />
                                  <span>{inst.status === 'ONLINE' ? 'WHATSAPP CONECTADO' : 'CONECTAR / GERAR QR'}</span>
                                </button>
                                
                                {inst.status !== 'ONLINE' ? (
                                  <button 
                                    type="button" 
                                    onClick={() => handleDisconnectWhatsApp(inst.instanceName)}
                                    className="btn btn-danger"
                                    style={styles.waDisconnectBtn}
                                    disabled={waLoading}
                                    title="Limpar e recriar instância do zero"
                                  >
                                    <Trash2 size={16} />
                                    <span>RESTAURAR / RESETAR</span>
                                  </button>
                                ) : (
                                  <button 
                                    type="button" 
                                    onClick={() => handleDisconnectWhatsApp(inst.instanceName)}
                                    className="btn btn-danger"
                                    style={styles.waDisconnectBtn}
                                    disabled={waLoading}
                                  >
                                    <Trash2 size={16} />
                                    <span>DESCONECTAR</span>
                                  </button>
                                )}
                              </div>

                              {inst.id !== 'inst_primary' && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => removeWaInstance(inst.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    title="Remover Instância"
                                  >
                                    <Trash2 size={13} /> Remover Instância
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Right Side: QR Code Container */}
                            <div style={styles.waRightCol}>
                              <div style={styles.waQrBox}>
                                {inst.status === 'ONLINE' ? (
                                  <div style={styles.waConnectedState}>
                                    <CheckCircle size={48} style={{ color: 'var(--accent-success)', marginBottom: '1rem' }} />
                                    <span style={styles.waConnectedText}>WhatsApp Conectado!</span>
                                  </div>
                                ) : qrCodeBase64Map[inst.instanceName] ? (
                                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src={qrCodeBase64Map[inst.instanceName]} alt="WhatsApp QR Code" style={styles.waQrImg} />
                                    <span className="wa-scanning-title" style={{ ...styles.waScanningText, marginTop: '0.75rem' }}>Leia o QR Code com o aplicativo WhatsApp</span>
                                    <span className="wa-scanning-subtitle" style={styles.waScanningSubtext}>A conexão será estabelecida automaticamente</span>
                                  </div>
                                ) : (
                                  <div style={styles.waDisconnectedState}>
                                    <QrCode size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.3 }} />
                                    <span style={styles.waScanningText}>Aguardando geração do QR Code</span>
                                    <span style={styles.waScanningSubtext}>Clique no botão para gerar um novo código de barras</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>



        {/* PANEL 4: Usuários */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('access')}>
            <div style={styles.panelHeaderLeft}>
              <Key size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Usuários</span>
            </div>
            {activePanel === 'access' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'access' && (
            <div style={styles.panelContent}>
              {/* Users management table */}
              <h4 style={styles.sectionHeader}>Gerenciar Equipe / Operadores</h4>
              <div className="table-responsive" style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Cor</th>
                      <th style={styles.th}>Nome</th>
                      <th style={styles.th}>E-mail</th>
                      <th style={styles.th}>Função</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemUsers.map(u => {
                      const uColor = u.color || '#3b82f6';
                      return (
                        <tr key={u.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <span style={{ 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '50%', 
                                backgroundColor: uColor, 
                                display: 'inline-block',
                                border: '1px solid var(--glass-border)',
                                boxShadow: `0 0 8px ${uColor}66`
                              }} />
                            </div>
                          </td>
                          <td style={styles.td}><strong>{u.name}</strong></td>
                          <td style={styles.td}>{u.email}</td>
                          <td style={styles.td}>
                            <span className="badge badge-primary">{u.role}</span>
                          </td>
                          <td style={styles.td}>
                            <span className={u.status === 'Ativo' ? 'badge badge-success' : 'badge badge-secondary'}>
                              {u.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => handleCopyInviteMessage(u)}
                                style={styles.actionUserBtn}
                                title="Copiar Mensagem de Acesso para este Membro"
                              >
                                <Copy size={13} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => startEditUser(u)}
                                style={styles.actionUserBtn}
                                title="Editar Usuário"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                style={styles.deleteUserBtn}
                                title="Revogar Acesso"
                                disabled={u.email === profile.email}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Edit User Modal */}
              {editingUser && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem'
                }}>
                  <div className="glass-panel" style={{
                    width: '100%',
                    maxWidth: '420px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Editar Membro da Equipe</h3>
                      <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="input-group">
                        <label style={styles.inputLabel}>Nome do Operador</label>
                        <input
                          type="text"
                          className="input-field"
                          value={editUserName}
                          onChange={e => setEditUserName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label style={styles.inputLabel}>E-mail</label>
                        <input
                          type="email"
                          className="input-field"
                          value={editUserEmail}
                          onChange={e => setEditUserEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="input-group">
                          <label style={styles.inputLabel}>Função</label>
                          <select
                            className="input-field"
                            value={editUserRole}
                            onChange={e => setEditUserRole(e.target.value)}
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                          >
                            <option value="Administrador">Administrador</option>
                            <option value="Normal">Normal</option>
                          </select>
                        </div>

                        <div className="input-group">
                          <label style={styles.inputLabel}>Status</label>
                          <select
                            className="input-field"
                            value={editUserStatus}
                            onChange={e => setEditUserStatus(e.target.value)}
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>

                      <div className="input-group">
                        <label style={styles.inputLabel}>Cor de Destaque no Sistema</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                          <input
                            type="color"
                            value={editUserColor}
                            onChange={e => setEditUserColor(e.target.value)}
                            style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                          />
                          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {USER_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setEditUserColor(c)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: c,
                                  border: editUserColor === c ? '2px solid #ffffff' : 'none',
                                  cursor: 'pointer',
                                  boxShadow: editUserColor === c ? '0 0 6px ' + c : 'none'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="input-group">
                        <label style={styles.inputLabel}>Senha de Acesso</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Manter senha atual"
                          value={editUserPassword}
                          onChange={e => setEditUserPassword(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Invite user sub-form */}
              <div style={styles.inviteUserSection}>
                <h4 style={styles.sectionHeader}>Adicionar Novo Membro</h4>
                <form onSubmit={handleAddUser} className="config-invite-form" style={styles.inviteForm} autoComplete="off">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Nome do operador"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                    autoComplete="off"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="e-mail de acesso"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    required
                    autoComplete="new-password"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                  <select 
                    className="input-field" 
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Normal">Normal</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-tertiary)', padding: '0 0.5rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Cor:</label>
                    <input 
                      type="color" 
                      value={newUserColor}
                      onChange={e => setNewUserColor(e.target.value)}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                      title="Escolher Cor do Operador"
                    />
                  </div>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Senha de acesso"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="submit" className="btn btn-primary" style={{ gap: '0.375rem', flex: '1 1 auto', justifyContent: 'center' }}>
                      <UserPlus size={14} />
                      <span>Convidar</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCopyInviteMessage}
                      className={copiedInviteMsg ? "btn btn-success" : "btn btn-secondary"}
                      style={{ 
                        gap: '0.375rem', 
                        whiteSpace: 'nowrap', 
                        padding: '0.625rem 0.875rem',
                        transition: 'all 0.2s ease',
                        border: copiedInviteMsg ? '1px solid var(--accent-success)' : '1px solid var(--glass-border)'
                      }}
                      title="Copiar mensagem base com o link do site, e-mail e senha para enviar ao novo membro"
                    >
                      {copiedInviteMsg ? <CopyCheck size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                      <span>{copiedInviteMsg ? 'Copiado!' : 'Mensagem Pronta'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* PANEL: Agente SDR Inteligente */}
        <div className="glass-panel" style={styles.panelRow}>
          <div style={styles.panelHeader} onClick={() => togglePanel('sdr_agent')}>
            <div style={styles.panelHeaderLeft}>
              <Cpu size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={styles.panelTitle}>Agente</span>
              {sdrEnabled && (
                <span className="badge badge-success" style={styles.inlineBadge}>ATIVO</span>
              )}
            </div>
            {activePanel === 'sdr_agent' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {activePanel === 'sdr_agent' && (
            <div style={styles.panelContent}>
              
              {/* Horizontal Sub-tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '0.75rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div className="sdr-subtabs-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'training', label: 'Treinamento' },
                    { id: 'knowledge', label: 'Conhecimento' },
                    { id: 'test', label: 'Teste' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className="sdr-subtab-btn"
                      onClick={() => setSdrSubTab(tab.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        border: 'none',
                        background: sdrSubTab === tab.id ? 'var(--text-primary)' : 'transparent',
                        color: sdrSubTab === tab.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    type="button"
                    onClick={handleSaveAll}
                    className="btn btn-primary"
                    style={{ padding: '0.375rem 1.25rem', borderRadius: '20px', fontSize: '0.8125rem' }}
                  >
                    Salvar alterações
                  </button>
                </div>
              </div>

              {/* Grid: 12 Columns */}
              <div className="grid-cols-12" style={{ gap: '1.5rem' }}>
                
                {/* Left Sidebar: 4 Columns (Only visible on training tab) */}
                {sdrSubTab === 'training' && (
                  <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Ativar Agente */}
                  <div style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Ativar Agente</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qualificação inteligente ativa</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={sdrEnabled} 
                      onChange={e => setSdrEnabled(e.target.checked)} 
                      style={styles.checkboxInput}
                    />
                  </div>

                  {/* Credenciais de IA do Cliente */}
                  <div style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '1.25rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '-0.25rem' }}>
                      Credenciais de IA
                    </div>
                    
                    {/* Provedor */}
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '10px',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '0 4px',
                        fontSize: '0.6875rem',
                        fontWeight: '500',
                        color: 'var(--text-secondary)'
                      }}>Provedor</label>
                      <select
                        value={sdrProvider}
                        onChange={e => {
                          const newProvider = e.target.value;
                          setSdrProvider(newProvider);
                          if (newProvider === 'openai') setSdrModel('gpt-4o-mini');
                          else if (newProvider === 'groq') setSdrModel('llama-3.3-70b-versatile');
                          else if (newProvider === 'gemini') setSdrModel('gemini-2.5-flash');
                          else if (newProvider === 'anthropic') setSdrModel('claude-3-5-sonnet-latest');
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          padding: '0.625rem 0.75rem',
                          fontSize: '0.8125rem',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="openai" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>OpenAI Padrão</option>
                        <option value="groq" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Groq API</option>
                        <option value="gemini" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Google Gemini</option>
                        <option value="anthropic" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Anthropic Claude</option>
                      </select>
                    </div>

                    {/* API Key */}
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '10px',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '0 4px',
                        fontSize: '0.6875rem',
                        fontWeight: '500',
                        color: 'var(--text-secondary)'
                      }}>API Key</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={sdrApiKey}
                          onChange={e => setSdrApiKey(e.target.value)}
                          placeholder="Digite sua chave de API..."
                          style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '6px',
                            padding: '0.625rem 2.25rem 0.625rem 0.75rem',
                            fontSize: '0.8125rem',
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {showApiKey ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                      </div>
                      {sdrProvider === 'openai' && (
                        <div style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                          Clique <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: '500' }}>aqui</a> para consultar suas chaves de API OpenAI.
                        </div>
                      )}
                      {sdrProvider === 'groq' && (
                        <div style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                          Clique <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: '500' }}>aqui</a> para consultar suas chaves de API Groq.
                        </div>
                      )}
                      {sdrProvider === 'gemini' && (
                        <div style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                          Clique <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: '500' }}>aqui</a> para consultar suas chaves de API Google AI Studio.
                        </div>
                      )}
                      {sdrProvider === 'anthropic' && (
                        <div style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                          Clique <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: '500' }}>aqui</a> para consultar suas chaves de API Anthropic.
                        </div>
                      )}
                    </div>

                    {/* Modelo */}
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '10px',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '0 4px',
                        fontSize: '0.6875rem',
                        fontWeight: '500',
                        color: 'var(--text-secondary)'
                      }}>
                        {sdrProvider === 'openai' ? 'Modelo OpenAI' : sdrProvider === 'groq' ? 'Modelo Groq' : sdrProvider === 'gemini' ? 'Modelo Gemini' : 'Modelo Anthropic'}
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <select
                          value={sdrModel}
                          onChange={e => setSdrModel(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '6px',
                            padding: '0.625rem 2.25rem 0.625rem 0.75rem',
                            fontSize: '0.8125rem',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none'
                          }}
                        >
                          {sdrProvider === 'openai' && (
                            <>
                              <option value="gpt-4o" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gpt-4o (Recomendado - Multimodal & Visão)</option>
                              <option value="gpt-4o-mini" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gpt-4o-mini (Ultra Rápido & Econômico)</option>
                              <option value="o3-mini" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>o3-mini (Raciocínio Rápido & Lógica)</option>
                              <option value="o1" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>o1 (Raciocínio Profundo)</option>
                              <option value="gpt-4.5-preview" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gpt-4.5-preview (Alta Capacidade)</option>
                              <option value="gpt-4-turbo" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gpt-4-turbo</option>
                            </>
                          )}
                          {sdrProvider === 'groq' && (
                            <>
                              <option value="llama-3.3-70b-versatile" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>llama-3.3-70b-versatile</option>
                              <option value="deepseek-r1-distill-llama-70b" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>deepseek-r1-distill-llama-70b</option>
                              <option value="llama-3.1-8b-instant" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>llama-3.1-8b-instant</option>
                              <option value="mixtral-8x7b-32768" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>mixtral-8x7b-32768</option>
                            </>
                          )}
                          {sdrProvider === 'gemini' && (
                            <>
                              <option value="gemini-2.5-flash" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gemini-2.5-flash (Mais Recente & Rápido)</option>
                              <option value="gemini-2.5-pro" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gemini-2.5-pro (Raciocínio Completo)</option>
                              <option value="gemini-2.0-flash" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gemini-2.0-flash</option>
                              <option value="gemini-1.5-pro" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>gemini-1.5-pro</option>
                            </>
                          )}
                          {sdrProvider === 'anthropic' && (
                            <>
                              <option value="claude-3-5-sonnet-latest" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>claude-3.5-sonnet</option>
                              <option value="claude-3-5-haiku-latest" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>claude-3.5-haiku</option>
                              <option value="claude-3-opus-latest" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>claude-3-opus</option>
                            </>
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowModelSettings(prev => !prev)}
                          title="Configurações Avançadas do Modelo"
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: showModelSettings ? 'var(--accent-primary)' : 'transparent',
                            border: showModelSettings ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            borderRadius: '6px',
                            color: showModelSettings ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* === Painel de Configurações Avançadas (expansível via engrenagem) === */}
                  {showModelSettings && (
                    <div style={{
                      borderTop: '1px solid var(--accent-primary)',
                      paddingTop: '1rem',
                      marginTop: '0.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Configurações Avançadas do Modelo</span>
                      </div>

                      {/* Temperatura */}
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ ...styles.inputLabel, fontSize: '0.8125rem' }}>Temperatura</label>
                          <input
                            type="text"
                            className="input-field"
                            readOnly
                            value={sdrTemperature}
                            style={{ width: '52px', textAlign: 'center', padding: '2px 4px', fontSize: '0.8125rem', background: 'var(--bg-tertiary)' }}
                          />
                        </div>
                        <input
                          type="range"
                          min="0" max="1" step="0.1"
                          value={sdrTemperature}
                          onChange={e => setSdrTemperature(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem' }}
                        />
                        <small style={{ color: 'var(--accent-warning)', fontSize: '0.6875rem', marginTop: '0.2rem', display: 'block' }}>
                          Entre 0.5 e 1 para equilíbrio ideal entre criatividade e coerência.
                        </small>
                      </div>

                      {/* Máx. de mensagens no Histórico */}
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ ...styles.inputLabel, fontSize: '0.8125rem' }}>Máx. de mensagens no Histórico</label>
                          <input
                            type="text"
                            className="input-field"
                            readOnly
                            value={sdrMaxHistory}
                            style={{ width: '52px', textAlign: 'center', padding: '2px 4px', fontSize: '0.8125rem', background: 'var(--bg-tertiary)' }}
                          />
                        </div>
                        <input
                          type="range"
                          min="1" max="50"
                          value={sdrMaxHistory}
                          onChange={e => setSdrMaxHistory(parseInt(e.target.value, 10))}
                          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem' }}
                        />
                      </div>

                      {/* Máx. de Tokens */}
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ ...styles.inputLabel, fontSize: '0.8125rem' }}>Máx. de Tokens na resposta</label>
                          <input
                            type="text"
                            className="input-field"
                            readOnly
                            value={sdrMaxTokens}
                            style={{ width: '52px', textAlign: 'center', padding: '2px 4px', fontSize: '0.8125rem', background: 'var(--bg-tertiary)' }}
                          />
                        </div>
                        <input
                          type="range"
                          min="50" max="2000" step="50"
                          value={sdrMaxTokens}
                          onChange={e => setSdrMaxTokens(parseInt(e.target.value, 10))}
                          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem' }}
                        />
                      </div>

                      {/* Separador Delay */}
                      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Delay de Respostas</span>
                        </div>

                        {/* Delay para responder */}
                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ ...styles.inputLabel, fontSize: '0.8125rem' }}>Delay para responder mensagens <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(seg)</span></label>
                            <input
                              type="text"
                              className="input-field"
                              readOnly
                              value={sdrDelay}
                              style={{ width: '52px', textAlign: 'center', padding: '2px 4px', fontSize: '0.8125rem', background: 'var(--bg-tertiary)' }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0" max="60"
                            value={sdrDelay}
                            onChange={e => setSdrDelay(e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem' }}
                          />
                          <small style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', marginTop: '0.2rem', display: 'block' }}>
                            Tempo de espera antes de enviar a resposta ao cliente.
                          </small>
                        </div>

                        {/* Ignorar mensagens até X segundos */}
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ ...styles.inputLabel, fontSize: '0.8125rem' }}>Ignorar conversa até <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(seg após criação)</span></label>
                            <input
                              type="text"
                              className="input-field"
                              readOnly
                              value={sdrIgnoreSeconds}
                              style={{ width: '52px', textAlign: 'center', padding: '2px 4px', fontSize: '0.8125rem', background: 'var(--bg-tertiary)' }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0" max="300" step="10"
                            value={sdrIgnoreSeconds}
                            onChange={e => setSdrIgnoreSeconds(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem' }}
                          />
                          <small style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', marginTop: '0.2rem', display: 'block' }}>
                            Ignora mensagens de conversas criadas há menos do que este tempo.
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configurações */}
                  <div style={{
                    borderTop: '1px solid var(--glass-border)',
                    paddingTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    <span style={{ ...styles.inputLabel, display: 'block', marginBottom: '0.25rem' }}>Configurações</span>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Dividir respostas em blocos</span>
                      <input
                        type="checkbox"
                        checked={sdrSplitResponses}
                        onChange={e => setSdrSplitResponses(e.target.checked)}
                        style={styles.checkboxInput}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Desabilitar agente quando responder fora da plataforma</span>
                      <input
                        type="checkbox"
                        checked={sdrDisableOutside}
                        onChange={e => setSdrDisableOutside(e.target.checked)}
                        style={styles.checkboxInput}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Ignorar grupos do WhatsApp (não responder em grupos)</span>
                      <input
                        type="checkbox"
                        checked={sdrIgnoreGroups}
                        onChange={e => setSdrIgnoreGroups(e.target.checked)}
                        style={styles.checkboxInput}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Pausar agente quando houver atendimento humano</span>
                      <input
                        type="checkbox"
                        checked={sdrPauseOnHuman}
                        onChange={e => setSdrPauseOnHuman(e.target.checked)}
                        style={styles.checkboxInput}
                      />
                    </div>
                  </div>
                </div>
              )}

                {/* Right Content: 8 Columns if training, 12 Columns otherwise */}
                <div className={sdrSubTab === 'training' ? "col-span-8" : "col-span-12"} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {sdrSubTab === 'training' && (
                    <>
                      {/* Instruções */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: 0 }}>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={styles.inputLabel}>1. Como o agente deve agir (Comportamento/Regras)</label>
                            </div>
                            <div style={{ position: 'relative', marginTop: '0.375rem' }}>
                              <textarea
                                className="input-field"
                                value={sdrBehavior}
                                onChange={e => setSdrBehavior(e.target.value)}
                                placeholder="Digite aqui as regras de comportamento do agente..."
                                style={{
                                  width: '100%',
                                  minHeight: isBehaviorExpanded ? '400px' : '180px',
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-primary)',
                                  resize: 'vertical',
                                  lineHeight: '1.5',
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: '0.875rem',
                                  paddingRight: '2.5rem',
                                  paddingBottom: '2.25rem',
                                  transition: 'min-height 0.3s ease'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setIsBehaviorExpanded(!isBehaviorExpanded)}
                                title={isBehaviorExpanded ? "Recolher Texto" : "Expandir Texto"}
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  bottom: '12px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: '6px',
                                  color: 'var(--accent-cyan)',
                                  cursor: 'pointer',
                                  padding: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                  zIndex: 5,
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {isBehaviorExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Divisor */}
                          <hr style={{ border: '0', borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }} />

                          {/* Roteamento para o Kanban */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                              <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Roteamento Automático para o Kanban</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Configure a mensagem de saudação e as regras para direcionar o cliente a funis de venda específicos.</p>
                            </div>

                            <div className="input-group">
                              <label style={styles.inputLabel}>Modo de Roteamento</label>
                              <select
                                className="input-field"
                                value={sdrRouteMode}
                                onChange={e => setSdrRouteMode(e.target.value)}
                                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', width: '100%' }}
                              >
                                <option value="disabled">Desativado</option>
                                <option value="static">Opções Numéricas Rígidas (Menu Estático)</option>
                                <option value="ai">Roteamento Inteligente por IA (Intenção Livre)</option>
                              </select>
                            </div>

                            {sdrRouteMode !== 'disabled' && (
                              <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={styles.inputLabel}>Mensagem de Saudação Inicial (Enviada de primeira)</label>
                                <textarea
                                  className="input-field"
                                  value={sdrWelcomeMessage}
                                  onChange={e => setSdrWelcomeMessage(e.target.value)}
                                  placeholder="Digite a mensagem de boas-vindas inicial apresentando as opções..."
                                  style={{
                                    width: '100%',
                                    minHeight: '110px',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    marginTop: '0.375rem',
                                    resize: 'vertical',
                                    lineHeight: '1.5',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.875rem'
                                  }}
                                />
                              </div>
                            )}

                            {sdrRouteMode === 'static' && (
                              <div className="glass-card sdr-route-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Mapeamento de Teclas e Mensagens de Transição</span>
                                  <button
                                    type="button"
                                    onClick={() => setSdrStaticMapping([...sdrStaticMapping, { key: '', columnId: '', transitionMessage: '' }])}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem' }}
                                  >
                                    + Adicionar Regra
                                  </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                  {sdrStaticMapping.map((rule, idx) => (
                                    <div key={idx} className="sdr-rule-row" style={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '0.5rem', 
                                      padding: '0.75rem', 
                                      background: 'rgba(255,255,255,0.02)', 
                                      borderRadius: '6px',
                                      border: '1px dashed var(--glass-border)'
                                    }}>
                                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ flex: '0 0 100px' }}>
                                          <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Opção (Ex: 1)"
                                            value={rule.key}
                                            onChange={e => {
                                              const updated = [...sdrStaticMapping];
                                              updated[idx].key = e.target.value;
                                              setSdrStaticMapping(updated);
                                            }}
                                            style={{ width: '100%', background: 'var(--bg-tertiary)' }}
                                          />
                                        </div>
                                        <div style={{ flex: '1' }}>
                                          <select
                                            className="input-field"
                                            value={rule.columnId}
                                            onChange={e => {
                                              const updated = [...sdrStaticMapping];
                                              updated[idx].columnId = e.target.value;
                                              setSdrStaticMapping(updated);
                                            }}
                                            style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                          >
                                            <option value="">Selecione a coluna...</option>
                                            {getColumnsList().map(col => (
                                              <option key={col.id} value={col.id}>{col.name} ({col.pipelineName})</option>
                                            ))}
                                          </select>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = sdrStaticMapping.filter((_, i) => i !== idx);
                                            setSdrStaticMapping(updated);
                                          }}
                                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                      <div>
                                        <input
                                          type="text"
                                          className="input-field"
                                          placeholder="Mensagem de transição quando esta opção for selecionada..."
                                          value={rule.transitionMessage || ''}
                                          onChange={e => {
                                            const updated = [...sdrStaticMapping];
                                            updated[idx].transitionMessage = e.target.value;
                                            setSdrStaticMapping(updated);
                                          }}
                                          style={{ width: '100%', background: 'var(--bg-tertiary)', fontSize: '0.8125rem' }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {sdrRouteMode === 'ai' && (
                              <div className="glass-card sdr-route-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Mapeamento de Intenções por IA e Transições</span>
                                  <button
                                    type="button"
                                    onClick={() => setSdrAiMapping([...sdrAiMapping, { keywords: '', columnId: '', transitionMessage: '' }])}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem' }}
                                  >
                                    + Adicionar Regra
                                  </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                  {sdrAiMapping.map((rule, idx) => (
                                    <div key={idx} className="sdr-rule-row" style={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '0.5rem', 
                                      padding: '0.75rem', 
                                      background: 'rgba(255,255,255,0.02)', 
                                      borderRadius: '6px',
                                      border: '1px dashed var(--glass-border)'
                                    }}>
                                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ flex: '1' }}>
                                          <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Palavras-chave (Ex: suporte, ajuda)"
                                            value={rule.keywords}
                                            onChange={e => {
                                              const updated = [...sdrAiMapping];
                                              updated[idx].keywords = e.target.value;
                                              setSdrAiMapping(updated);
                                            }}
                                            style={{ width: '100%', background: 'var(--bg-tertiary)' }}
                                          />
                                        </div>
                                        <div style={{ flex: '1' }}>
                                          <select
                                            className="input-field"
                                            value={rule.columnId}
                                            onChange={e => {
                                              const updated = [...sdrAiMapping];
                                              updated[idx].columnId = e.target.value;
                                              setSdrAiMapping(updated);
                                            }}
                                            style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                          >
                                            <option value="">Selecione a coluna...</option>
                                            {getColumnsList().map(col => (
                                              <option key={col.id} value={col.id}>{col.name} ({col.pipelineName})</option>
                                            ))}
                                          </select>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = sdrAiMapping.filter((_, i) => i !== idx);
                                            setSdrAiMapping(updated);
                                          }}
                                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                      <div>
                                        <input
                                          type="text"
                                          className="input-field"
                                          placeholder="Mensagem de transição quando esta intenção for detectada..."
                                          value={rule.transitionMessage || ''}
                                          onChange={e => {
                                            const updated = [...sdrAiMapping];
                                            updated[idx].transitionMessage = e.target.value;
                                            setSdrAiMapping(updated);
                                          }}
                                          style={{ width: '100%', background: 'var(--bg-tertiary)', fontSize: '0.8125rem' }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                             )}
                           </div>
                         </div>
                       </>
                     )}
                  {sdrSubTab === 'knowledge' && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                       {/* Hidden File Input */}
                       <input
                         type="file"
                         ref={fileInputRef}
                         onChange={handleFileUpload}
                         multiple
                         accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.csv,.xlsx"
                         style={{ display: 'none' }}
                       />

                       {/* 1. Seção: Base de conhecimento (Uploads) */}
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                           Base de conhecimento
                         </h4>

                         {/* Grid de Arquivos Carregados + Botão Adicionar */}
                         <div style={{
                           display: 'grid',
                           gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                           gap: '1rem',
                           alignItems: 'stretch'
                         }}>
                           {/* Card Botão Adicionar */}
                           <button
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             style={{
                               display: 'flex',
                               flexDirection: 'column',
                               alignItems: 'center',
                               justifyContent: 'center',
                               gap: '0.5rem',
                               minHeight: '110px',
                               padding: '1rem',
                               background: 'var(--bg-secondary)',
                               border: '1.5px dashed var(--glass-border)',
                               borderRadius: '10px',
                               color: 'var(--text-primary)',
                               cursor: 'pointer',
                               transition: 'all 0.2s ease',
                               fontFamily: 'var(--font-sans)'
                             }}
                             onMouseEnter={e => {
                               e.currentTarget.style.borderColor = 'var(--accent-primary)';
                               e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                             }}
                             onMouseLeave={e => {
                               e.currentTarget.style.borderColor = 'var(--glass-border)';
                               e.currentTarget.style.background = 'var(--bg-secondary)';
                             }}
                           >
                             <div style={{
                               width: '36px',
                               height: '36px',
                               borderRadius: '8px',
                               border: '1px solid var(--accent-primary)',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               color: 'var(--accent-primary)',
                               fontSize: '1.25rem'
                             }}>
                               +
                             </div>
                             <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Adicionar</span>
                           </button>

                           {/* Lista de Arquivos Carregados */}
                           {knowledgeFiles.map(file => (
                             <div
                               key={file.id}
                               style={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'space-between',
                                 minHeight: '110px',
                                 padding: '0.875rem',
                                 background: 'var(--bg-secondary)',
                                 border: '1px solid var(--glass-border)',
                                 borderRadius: '10px',
                                 position: 'relative'
                               }}
                             >
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                 <span style={{
                                   fontSize: '0.6875rem',
                                   fontWeight: '700',
                                   padding: '2px 6px',
                                   borderRadius: '4px',
                                   background: 'rgba(34, 197, 94, 0.15)',
                                   color: '#22c55e',
                                   textTransform: 'uppercase'
                                 }}>
                                   {file.type.includes('pdf') ? 'PDF' : file.type.includes('image') || file.type.includes('PNG') || file.type.includes('JPG') ? 'IMG' : 'DOC'}
                                 </span>
                                 <button
                                   type="button"
                                   onClick={() => removeKnowledgeFile(file.id)}
                                   style={{
                                     background: 'none',
                                     border: 'none',
                                     color: 'var(--text-tertiary)',
                                     cursor: 'pointer',
                                     fontSize: '0.875rem',
                                     padding: 0,
                                     lineHeight: 1
                                   }}
                                   onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                   onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                 >
                                   ✕
                                 </button>
                               </div>
                               <div>
                                 <p style={{
                                   fontSize: '0.8125rem',
                                   fontWeight: '500',
                                   color: 'var(--text-primary)',
                                   margin: '0 0 0.2rem 0',
                                   whiteSpace: 'nowrap',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis'
                                 }} title={file.name}>
                                   {file.name}
                                 </p>
                                 <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{file.size}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* 3. Seção: Fontes de Conhecimento (Links) */}
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         <div>
                           <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                             Fontes de Conhecimento (Links)
                           </h4>
                           <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                             Adicione os links desejados (Planilhas Google Sheets, APIs, Webhooks ou URLs externas) para sincronizar dados com o agente de IA.
                           </p>
                         </div>

                         {/* Lista de Fontes */}
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           {knowledgeSources.map((src) => (
                             <div
                               key={src.id}
                               className="glass-card"
                               style={{
                                 padding: '1.25rem',
                                 backgroundColor: 'var(--bg-secondary)',
                                 borderRadius: '10px',
                                 border: '1px solid var(--glass-border)',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 gap: '1rem'
                               }}
                             >
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                   <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                     {src.name}
                                   </span>
                                   <span style={{
                                     fontSize: '0.6875rem',
                                     fontWeight: '600',
                                     padding: '2px 8px',
                                     borderRadius: '12px',
                                     background: '#22c55e',
                                     color: '#fff'
                                   }}>
                                     Link
                                   </span>
                                 </div>

                                 <button
                                   type="button"
                                   onClick={() => removeKnowledgeSource(src.id)}
                                   style={{
                                     background: 'none',
                                     border: 'none',
                                     color: '#ef4444',
                                     cursor: 'pointer',
                                     fontSize: '1rem',
                                     padding: '0.25rem'
                                   }}
                                   title="Excluir Fonte"
                                 >
                                   🗑️
                                 </button>
                               </div>

                               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                 <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                                   <label style={{ ...styles.inputLabel, fontSize: '0.75rem' }}>URL do Link</label>
                                   <input
                                     type="text"
                                     className="input-field"
                                     placeholder="https://..."
                                     value={src.url}
                                     onChange={e => updateKnowledgeSource(src.id, 'url', e.target.value)}
                                     style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', width: '100%', fontSize: '0.8125rem' }}
                                   />
                                 </div>
                               </div>
                             </div>
                           ))}

                           {/* Botão Adicionar Nova Fonte */}
                           <button
                             type="button"
                             onClick={addKnowledgeSource}
                             style={{
                               padding: '0.875rem',
                               background: 'none',
                               border: '1.5px dashed var(--glass-border)',
                               borderRadius: '10px',
                               color: '#22c55e',
                               fontWeight: '500',
                               fontSize: '0.875rem',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               gap: '0.5rem',
                               transition: 'all 0.2s ease',
                               fontFamily: 'var(--font-sans)'
                             }}
                             onMouseEnter={e => {
                               e.currentTarget.style.borderColor = '#22c55e';
                               e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
                             }}
                             onMouseLeave={e => {
                               e.currentTarget.style.borderColor = 'var(--glass-border)';
                               e.currentTarget.style.background = 'none';
                             }}
                           >
                             + Adicionar nova fonte de conhecimento
                           </button>
                         </div>

                         {/* 4. Seção: Integração Banco de Dados Supabase (RAG & Histórico de Conversas) */}
                         <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                 <span style={{ fontSize: '1.1rem' }}>⚡</span>
                                 <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                                   Integração Banco de Dados Supabase (RAG & Histórico)
                                 </h4>
                               </div>
                               <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                 Conecte a URL e a Chave do Supabase para armazenar documentos vetoriais e persistir todas as conversas do WhatsApp.
                               </p>
                             </div>
                             <button
                               type="button"
                               onClick={() => setShowSupabaseSqlModal(true)}
                               className="btn btn-secondary"
                               style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '6px', gap: '0.35rem' }}
                             >
                               📋 Gerar SQL das Tabelas
                             </button>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                             <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                 URL do Projeto Supabase
                               </label>
                               <input
                                 type="text"
                                 className="input-field"
                                 placeholder="https://xyzxyz.supabase.co"
                                 value={supabaseUrl}
                                 onChange={e => setSupabaseUrl(e.target.value)}
                                 style={{ width: '100%', background: 'var(--bg-tertiary)' }}
                               />
                             </div>

                             <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                 Chave Anon / Service Role Key
                               </label>
                               <div style={{ position: 'relative' }}>
                                 <input
                                   type={showSupabaseKey ? "text" : "password"}
                                   className="input-field"
                                   placeholder="eyJh..."
                                   value={supabaseAnonKey}
                                   onChange={e => setSupabaseAnonKey(e.target.value)}
                                   style={{ width: '100%', background: 'var(--bg-tertiary)', paddingRight: '2.5rem' }}
                                 />
                                 <button
                                   type="button"
                                   onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                                   style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.85rem' }}
                                 >
                                   {showSupabaseKey ? '🙈' : '👁️'}
                                 </button>
                               </div>
                             </div>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                             <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                 Bucket de Documentos (Storage RAG)
                               </label>
                               <input
                                 type="text"
                                 className="input-field"
                                 placeholder="knowledge_base"
                                 value={supabaseBucket}
                                 onChange={e => setSupabaseBucket(e.target.value)}
                                 style={{ width: '100%', background: 'var(--bg-tertiary)' }}
                               />
                             </div>

                             <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                 Tabela de Mensagens do Chat
                               </label>
                               <input
                                 type="text"
                                 className="input-field"
                                 placeholder="chat_messages"
                                 value={supabaseTable}
                                 onChange={e => setSupabaseTable(e.target.value)}
                                 style={{ width: '100%', background: 'var(--bg-tertiary)' }}
                               />
                             </div>
                           </div>

                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                             <button
                               type="button"
                               onClick={testSupabaseConnection}
                               className="btn btn-secondary"
                               style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                             >
                               🔍 Testar Conexão Supabase
                             </button>

                             {supabaseTestStatus && (
                               <span style={{
                                 fontSize: '0.8125rem',
                                 color: supabaseTestStatus.success ? '#22c55e' : '#ef4444',
                                 fontWeight: '500'
                               }}>
                                 {supabaseTestStatus.msg}
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                  )}

                  {sdrSubTab === 'test' && (
                    <div className="glass-card" style={{
                      padding: '1.5rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      minHeight: '450px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>💬 Simulador do Agente (Canal de Teste Local)</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Envie mensagens como se fossem o cliente. O agente responderá em tempo real seguindo suas regras.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => clearChat('client_teste_agente')}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', borderColor: 'var(--glass-border)' }}
                        >
                          Limpar Conversa de Teste
                        </button>
                      </div>

                      <div style={{
                        flex: 1,
                        background: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        padding: '1rem',
                        overflowY: 'auto',
                        maxHeight: '300px',
                        minHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        {testMessages.length === 0 ? (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.8125rem', opacity: 0.7 }}>
                            Nenhuma mensagem simulada. Digite abaixo para iniciar o teste!
                          </div>
                        ) : (
                          testMessages.map((msg, index) => {
                            const isContact = msg.sender === 'contact';
                            return (
                              <div key={index} style={{
                                display: 'flex',
                                justifyContent: isContact ? 'flex-start' : 'flex-end',
                                width: '100%'
                              }}>
                                <div style={{
                                  maxWidth: '80%',
                                  padding: '0.5rem 0.875rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8125rem',
                                  lineHeight: '1.4',
                                  backgroundColor: isContact ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                  color: isContact ? 'var(--text-primary)' : 'var(--bg-primary)',
                                  border: isContact ? '1px solid var(--glass-border)' : 'none',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  <div style={{ fontSize: '0.6875rem', opacity: 0.6, marginBottom: '0.25rem', fontWeight: 'bold' }}>
                                    {isContact ? 'Cliente (Você)' : 'Agente'}
                                  </div>
                                  {msg.file && msg.file.type && msg.file.type.includes('audio') && (
                                    <div style={{ marginTop: '0.25rem' }}>
                                      <audio controls src={msg.file.url} style={{ height: '32px', maxWidth: '220px' }} />
                                    </div>
                                  )}
                                  {msg.file && msg.file.type && msg.file.type.startsWith('image/') && (
                                    <div 
                                      style={{ marginTop: '0.25rem', marginBottom: '0.25rem', cursor: 'pointer' }}
                                      onClick={() => setSimPreviewFile({ name: msg.file.name || 'Imagem de Teste', url: msg.file.url, type: msg.file.type })}
                                      title="Clique para visualizar em tela cheia"
                                    >
                                      <img src={msg.file.url} alt="Preview" style={{ maxWidth: '200px', maxHeight: '180px', borderRadius: '6px', objectFit: 'cover', display: 'block' }} />
                                    </div>
                                  )}
                                  {msg.file && msg.file.type && !msg.file.type.startsWith('image/') && !msg.file.type.includes('audio') && (
                                    <div 
                                      onClick={() => setSimPreviewFile({ name: msg.file.name || 'Documento de Teste', url: msg.file.url, type: msg.file.type })}
                                      style={{
                                        marginTop: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        border: '1px solid var(--glass-border)',
                                        transition: 'background 0.2s'
                                      }}
                                      title="Clique para abrir e visualizar este documento"
                                    >
                                      <Paperclip size={16} style={{ color: 'var(--accent-cyan)' }} />
                                      <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{msg.file.name || 'Documento'}</span>
                                      <Eye size={14} style={{ color: 'var(--text-secondary)', opacity: 0.8 }} />
                                    </div>
                                  )}
                                  <div>{msg.text}</div>
                                  <div style={{ fontSize: '0.625rem', textAlign: 'right', opacity: 0.5, marginTop: '0.25rem' }}>
                                    {msg.time}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={testChatEndRef} />
                      </div>

                      <input
                        type="file"
                        ref={simFileInputRef}
                        onChange={handleSimFileUpload}
                        style={{ display: 'none' }}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!testInput.trim()) return;
                        sendMessage('client_teste_agente', testInput);
                        setTestInput('');
                      }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {isSimRecording ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            flex: 1,
                            background: 'var(--bg-tertiary)',
                            padding: '0.4rem 0.875rem',
                            borderRadius: '6px',
                            border: '1px solid var(--accent-primary)'
                          }}>
                            <span className="animate-pulse-mic" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                              Gravando áudio: {Math.floor(simRecordingTime / 60)}:{(simRecordingTime % 60).toString().padStart(2, '0')}
                            </span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={cancelSimRecording}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                                title="Cancelar gravação"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={stopSimRecording}
                                className="btn btn-primary"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Square size={12} fill="currentColor" /> Enviar Áudio
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => simFileInputRef.current?.click()}
                              style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-secondary)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Anexar Foto ou Documento"
                            >
                              <Paperclip size={18} />
                            </button>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Digite como o cliente..."
                              value={testInput}
                              onChange={(e) => setTestInput(e.target.value)}
                              style={{ flex: 1, background: 'var(--bg-tertiary)' }}
                            />
                            <button
                              type="button"
                              onClick={startSimRecording}
                              style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--accent-cyan)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Gravar áudio de teste"
                            >
                              <Mic size={18} />
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '4px' }}>
                              Enviar
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* Simulator Document & Photo Lightbox Preview Modal */}
          {simPreviewFile && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999999,
                backdropFilter: 'blur(10px)',
                margin: 0,
                padding: 0
              }}
              onClick={() => { setSimPreviewFile(null); resetSimPan(); }}
            >
              <div 
                style={{
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0px',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: 'none',
                  position: 'relative',
                  margin: 0
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header controls */}
                <div style={{
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-tertiary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Paperclip size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {simPreviewFile.name || 'Visualizador de Documento'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <a
                      href={simPreviewFile.url}
                      download={simPreviewFile.name}
                      className="btn btn-secondary"
                      style={{ padding: '0.375rem 0.875rem', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}
                    >
                      Baixar Arquivo
                    </a>
                    <button
                      type="button"
                      onClick={() => { setSimPreviewFile(null); resetSimPan(); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Navigation Arrow Controls for pan/scroll, Zoom and Exit */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--glass-border)'
                }}>
                  {/* Left side: Exit / Close Button (in the red circle location) */}
                  <button 
                    type="button" 
                    onClick={() => { setSimPreviewFile(null); resetSimPan(); }} 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '5px 14px', 
                      fontSize: '0.8125rem', 
                      fontWeight: '600',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                      color: '#ef4444', 
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Sair da Visualização"
                  >
                    <X size={16} /> <span>Sair da Visualização</span>
                  </button>

                  {/* Right side: Zoom & Position controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: '0.25rem', fontWeight: '500' }}>Zoom & Posição:</span>
                    <button type="button" onClick={handleSimZoomIn} className="btn btn-primary" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} title="Aumentar Zoom (+)">
                      <ZoomIn size={15} /> <span>Zoom +</span>
                    </button>
                    <button type="button" onClick={handleSimZoomOut} className="btn btn-secondary" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} title="Diminuir Zoom (-)">
                      <ZoomOut size={15} /> <span>Zoom -</span>
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600', minWidth: '45px', textAlign: 'center' }}>
                      {Math.round(simZoomScale * 100)}%
                    </span>
                    <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--glass-border)', margin: '0 0.25rem' }} />
                    <button type="button" onClick={() => moveSimPan(0, 60)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Cima">
                      <ArrowUp size={16} />
                    </button>
                    <button type="button" onClick={() => moveSimPan(0, -60)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Baixo">
                      <ArrowDown size={16} />
                    </button>
                    <button type="button" onClick={() => moveSimPan(60, 0)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Esquerda">
                      <ArrowLeft size={16} />
                    </button>
                    <button type="button" onClick={() => moveSimPan(-60, 0)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Direita">
                      <ArrowRight size={16} />
                    </button>
                    <button type="button" onClick={resetSimPan} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Centralizar e Resetar Zoom">
                      <RotateCcw size={14} /> Resetar
                    </button>
                  </div>
                </div>

                {/* Viewport content area centered with theme background */}
                <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    transform: `translate(${simPanX}px, ${simPanY}px) scale(${simZoomScale})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {simPreviewFile.url && (simPreviewFile.url.includes('pdf') || simPreviewFile.name?.endsWith('.pdf')) ? (
                      <iframe 
                        src={`${simPreviewFile.url}#toolbar=0&navpanes=0`} 
                        title={simPreviewFile.name}
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      />
                    ) : simPreviewFile.url && (simPreviewFile.type?.startsWith('image/') || simPreviewFile.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                      <img 
                        src={simPreviewFile.url} 
                        alt={simPreviewFile.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        <Paperclip size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5, color: 'var(--accent-cyan)' }} />
                        <h4>Pré-visualização direta indisponível</h4>
                        <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>Clique abaixo para baixar e abrir o arquivo no seu computador.</p>
                        <a
                          href={simPreviewFile.url}
                          download={simPreviewFile.name}
                          className="btn btn-primary"
                          style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          Baixar {simPreviewFile.name}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Edit User Modal */}
      {showAddInstanceModal && (
        <div className="modal-overlay" onClick={() => setShowAddInstanceModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <button className="modal-close" onClick={() => setShowAddInstanceModal(false)}>
              <X size={20} />
            </button>
            <h3 style={styles.modalTitle}>Adicionar Nova Instância</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Cadastre uma nova instância para conectar uma nova linha telefônica ao sistema.
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newInstanceInput.trim()) return;
              addWaInstance(newInstanceInput.trim(), newInstanceLabelInput.trim());
              setNewInstanceInput('');
              setNewInstanceLabelInput('');
              setShowAddInstanceModal(false);
              alert("✅ Nova instância registrada! Agora você pode alternar e filtrar por ela nas abas do sistema.");
            }} style={{ marginTop: '1.25rem' }}>
              <div className="input-group">
                <label style={styles.inputLabel}>Número de Telefone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: (37) 99999-0000" 
                  value={newInstanceLabelInput} 
                  onChange={e => setNewInstanceLabelInput(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Nome da Instância</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: CRM Base Vendas 2" 
                  value={newInstanceInput} 
                  onChange={e => setNewInstanceInput(e.target.value)} 
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddInstanceModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Adicionar Instância
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.editModal}>
            <button className="modal-close" onClick={() => setEditingUser(null)}>
              <X size={20} />
            </button>
            <h3 style={styles.modalTitle}>Editar Usuário</h3>
            
            <form onSubmit={handleEditUserSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label style={styles.inputLabel}>Nome Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editUserName} 
                  onChange={e => setEditUserName(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>E-mail de Acesso</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={editUserEmail} 
                  onChange={e => setEditUserEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Função / Cargo</label>
                <select 
                  className="input-field" 
                  value={editUserRole}
                  onChange={e => setEditUserRole(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Status</label>
                <select 
                  className="input-field" 
                  value={editUserStatus}
                  onChange={e => setEditUserStatus(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>Senha de Acesso</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={editUserPassword} 
                  onChange={e => setEditUserPassword(e.target.value)} 
                  placeholder="Defina a senha"
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-cyan" style={styles.saveBtn}>
                  <Save size={14} />
                  <span>Salvar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSaved && (
        <div style={styles.saveAlertOverlay}>
          <div className="glass-panel" style={styles.saveAlertBox}>
            <CheckCircle size={20} style={{ color: 'var(--accent-success)' }} />
            <span>Configurações salvas com sucesso!</span>
          </div>
        </div>
      )}

      {/* Modal SQL Generator para Supabase */}
      {showSupabaseSqlModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Script SQL do Banco de Dados Supabase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSupabaseSqlModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Copie o código SQL abaixo e cole no <strong>SQL Editor do seu painel Supabase</strong>. Ele cria automaticamente a extensão vetorial <code>pgvector</code>, as tabelas de conhecimento RAG e a tabela de histórico de conversas dos clientes.
            </p>

            <div style={{ position: 'relative' }}>
              <textarea
                readOnly
                rows={22}
                value={`-- 1. Habilitar extensão pgvector para busca semântica RAG (opcional para documentos)
create extension if not exists vector;

-- 2. Tabela de Conhecimento RAG de Documentos
create table if not exists "knowledge_base" (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  content text not null,
  embedding vector(1538),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 3. Tabela Estruturada de Mensagens do Chat (Nome configurado: "${supabaseTable || 'mensagens_de_bate_papo'}")
create table if not exists "${(supabaseTable || 'mensagens_de_bate_papo').replace(/["\s]/g, '')}" (
  id uuid primary key default gen_random_uuid(),
  id_do_cliente text,
  remetente text,
  nome_do_remetente text,
  texto text,
  data_envio text,
  hora_envio text,
  tipo_midia text default 'texto',
  documento_url text,
  documento_nome text,
  imagem_url text,
  audio_url text,
  audio_transcricao text,
  carimbo_de_data_hora bigint default extract(epoch from now()),
  created_at timestamp with time zone default now()
);

-- 4. Habilitar Permissões Públicas de Acesso (RLS Desativado)
alter table if exists "${(supabaseTable || 'mensagens_de_bate_papo').replace(/["\s]/g, '')}" disable row level security;
alter table if exists "knowledge_base" disable row level security;`}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  padding: '1rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: '#10b981',
                  resize: 'none',
                  lineHeight: 1.4
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const cleanTbl = (supabaseTable || 'mensagens_de_bate_papo').replace(/["\s]/g, '');
                  const sqlText = `-- 1. Habilitar extensão pgvector\ncreate extension if not exists vector;\n\n-- 2. Tabela de Conhecimento RAG\ncreate table if not exists "knowledge_base" (\n  id uuid primary key default gen_random_uuid(),\n  file_name text not null,\n  content text not null,\n  embedding vector(1538),\n  metadata jsonb default '{}'::jsonb,\n  created_at timestamp with time zone default now()\n);\n\n-- 3. Tabela de Mensagens do Chat (${cleanTbl})\ncreate table if not exists "${cleanTbl}" (\n  id uuid primary key default gen_random_uuid(),\n  id_do_cliente text,\n  remetente text,\n  nome_do_remetente text,\n  texto text,\n  data_envio text,\n  hora_envio text,\n  tipo_midia text default 'texto',\n  documento_url text,\n  documento_nome text,\n  imagem_url text,\n  audio_url text,\n  audio_transcricao text,\n  carimbo_de_data_hora bigint default extract(epoch from now()),\n  created_at timestamp with time zone default now()\n);\n\n-- 4. Desativar RLS\nalter table if exists "${cleanTbl}" disable row level security;\nalter table if exists "knowledge_base" disable row level security;`;
                  navigator.clipboard.writeText(sqlText);
                  alert('Script SQL copiado para a área de transferência!');
                }}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', borderRadius: '6px' }}
              >
                📋 Copiar Código SQL
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSupabaseSqlModal(false)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', borderRadius: '6px' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  diagBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
  },
  diagBadgeOffline: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    display: 'flex',
    alignItems: 'center',
  },
  saveBtn: {
    borderRadius: '20px',
    padding: '0.5rem 1.25rem',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(242, 155, 17, 0.3)',
  },
  accordionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    width: '100%',
    maxWidth: '900px',
  },
  panelRow: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    transition: 'var(--transition-smooth)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: 'var(--glass-highlight)',
  },
  panelHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  panelTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
  },
  inlineBadge: {
    fontSize: '0.625rem',
    padding: '0.125rem 0.5rem',
    marginLeft: '0.5rem',
  },
  panelContent: {
    padding: '1.5rem',
    borderTop: '1px solid var(--glass-border)',
    backgroundColor: 'var(--bg-primary)',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    width: '100%',
  },
  contentActions: {
    gridColumn: '1 / -1',
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  sectionHeader: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-heading)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid var(--glass-border)',
  },
  th: {
    padding: '0.5rem 0.75rem',
    color: 'var(--text-tertiary)',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  td: {
    padding: '0.75rem',
    color: 'var(--text-primary)',
  },
  deleteUserBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    ':hover': {
      color: 'var(--accent-danger)'
    },
    ':disabled': {
      opacity: '0.3',
      cursor: 'not-allowed'
    }
  },
  actionUserBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  editModal: {
    width: '90%',
    maxWidth: '500px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '2rem',
    position: 'relative',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  inputLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
  },
  inviteUserSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--glass-border)',
  },
  inviteForm: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
  },
  togglesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
  },
  toggleTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  toggleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  saveAlertOverlay: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 1000,
  },
  saveAlertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  waDescription: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  waContainerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    width: '100%',
  },
  waLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  waDetailsCard: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  waDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  waDetailLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.05em',
  },
  waDetailValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  waActionButtonsRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  waConnectBtn: {
    flex: 1,
    background: 'var(--accent-success)',
    color: '#ffffff',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  waDisconnectBtn: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    fontWeight: '600',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  waRefreshBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  waRightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBoxCard: {
    width: '100%',
    maxWidth: '350px',
    minHeight: '230px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  waConnectedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  successPulseCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waConnectedText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  waLoadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  waQrState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  qrCodeWrapper: {
    padding: '0.75rem',
    background: '#ffffff',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
  qrImage: {
    width: '220px',
    height: '220px',
    display: 'block',
    imageRendering: 'pixelated',
  },
  waScanningText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  waScanningSubtext: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    maxWidth: '220px',
    lineHeight: '1.3',
  },
  waDisconnectedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }
};
