import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Search, 
  Star, 
  MessageSquare, 
  Phone, 
  Mail, 
  MoreVertical, 
  Smile, 
  Paperclip,
  TrendingUp,
  ArrowUpRight,
  Signature,
  X,
  Mic,
  Check,
  Trash2,
  UserMinus,
  Eraser,
  CornerUpLeft,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// Helper component to dynamically fetch and display media from the WhatsApp server
const MediaWrapper = ({ file, fetchMediaBase64, onImageClick, onFileClick }) => {
  const [url, setUrl] = useState(file.url);
  const [loading, setLoading] = useState(!file.url && !!file.keyId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url && file.keyId && !error) {
      setLoading(true);
      fetchMediaBase64(file.keyId)
        .then(res => {
          if (res) {
            setUrl(res.startsWith('data:') ? res : `data:${file.type};base64,${res}`);
          } else {
            setError(true);
          }
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [file.keyId, url, error, fetchMediaBase64]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', opacity: 0.8 }}>
        <span className="animate-pulse-mic" style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: '500' }}>
          Carregando mídia...
        </span>
      </div>
    );
  }

  if (error || (!url && !file.url)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', color: '#f87171' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: '500' }}>Mídia expirada no WhatsApp</span>
      </div>
    );
  }

  const mediaUrl = url || file.url;

  if (file.type && file.type.startsWith('image/')) {
    if (file.isSticker) {
      return (
        <img 
          src={mediaUrl} 
          alt={file.name} 
          style={{ maxWidth: '120px', maxHeight: '120px', display: 'block', borderRadius: '4px' }} 
        />
      );
    }
    return (
      <img 
        src={mediaUrl} 
        alt={file.name} 
        style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', objectFit: 'cover', display: 'block', cursor: 'pointer' }} 
        onClick={() => onImageClick ? onImageClick(mediaUrl) : window.open(mediaUrl, '_blank')} 
      />
    );
  }

  if (file.type && file.type.startsWith('audio/')) {
    return (
      <audio 
        src={mediaUrl} 
        controls 
        style={{ maxWidth: '100%', marginTop: '0.25rem', display: 'block' }} 
      />
    );
  }

  if (file.type && file.type.startsWith('video/')) {
    return (
      <video 
        src={mediaUrl} 
        controls 
        style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '0.25rem', borderRadius: '6px', display: 'block' }} 
      />
    );
  }

  return (
    <div 
      onClick={() => onFileClick ? onFileClick({ name: file.name, url: mediaUrl, type: file.type }) : window.open(mediaUrl, '_blank')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'background 0.2s'
      }}
      title="Clique para abrir e visualizar este documento"
    >
      <Paperclip size={18} style={{ color: 'var(--accent-cyan)' }} />
      <span style={{ color: 'var(--accent-cyan)', fontWeight: '600', fontSize: '0.8125rem', flex: 1, wordBreak: 'break-all' }}>
        {file.name}
      </span>
      <Eye size={16} style={{ color: 'var(--text-secondary)', opacity: 0.8 }} />
    </div>
  );
};

const isPlaceholderText = (text) => {
  if (!text) return false;
  return text === "🔊 Áudio Recebido" || 
         text === "🎤 Áudio Recebido" || 
         text === "📷 Imagem Recebida" || 
         text === "📄 Documento Recebido" || 
         text === "👾 Figurinha Recebida" || 
         text === "🎥 Vídeo Recebido";
};

const parseTimeStrToTimestamp = (timeStr) => {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toLowerCase();
  if (cleaned === 'ontem') {
    return Math.floor(Date.now() / 1000) - 24 * 3600;
  }
  const parts = cleaned.split(':');
  if (parts.length === 2) {
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    if (!isNaN(hh) && !isNaN(mm)) {
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      return Math.floor(d.getTime() / 1000);
    }
  }
  return 0;
};

export default function Conversas() {
  const { 
    clients, 
    chats, 
    sendMessage, 
    reactToMessage,
    editMessage,
    deleteSingleMessage,
    updateClient,
    deleteClient,
    clearChat,
    activeChatClientId, 
    setActiveChatClientId,
    setActiveModule,
    profile,
    unreadChats,
    fetchMediaBase64,
    waStatus,
    waInstances,
    selectedInstanceFilter,
    setSelectedInstanceFilter,
    systemUsers = [],
    quickReplies = []
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);

  // Slash commands filter logic
  const getSlashQuery = (text) => {
    const match = text.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
    return match ? match[1].toLowerCase() : null;
  };

  const currentSlashQuery = getSlashQuery(inputText);
  const filteredSlashReplies = currentSlashQuery !== null
    ? quickReplies.filter(r => (r.shortcut || '').toLowerCase().includes(currentSlashQuery) || (r.title || '').toLowerCase().includes(currentSlashQuery))
    : [];

  useEffect(() => {
    if (currentSlashQuery !== null && filteredSlashReplies.length > 0) {
      setShowSlashMenu(true);
      setSelectedSlashIndex(0);
    } else {
      setShowSlashMenu(false);
    }
  }, [inputText, currentSlashQuery]);

  const handleSelectSlashReply = (reply) => {
    const newText = inputText.replace(/(?:^|\s)\/[a-zA-Z0-9_-]*$/, (match) => {
      const leadingSpace = match.startsWith(' ') ? ' ' : '';
      return leadingSpace + reply.content;
    });
    setInputText(newText);
    setShowSlashMenu(false);
  };
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'starred'
  const [starredClients, setStarredClients] = useState(() => {
    const saved = localStorage.getItem('crmbase_starred_clients');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('crmbase_starred_clients', JSON.stringify(starredClients));
  }, [starredClients]);

  const [useSignature, setUseSignature] = useState(true);
  const [isSignatureHovered, setIsSignatureHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);
  const [activeMsgMenuId, setActiveMsgMenuId] = useState(null);
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const [isTransferSubOpen, setIsTransferSubOpen] = useState(false);
  const [isAssignSubOpen, setIsAssignSubOpen] = useState(false);
  const [isStatusSubOpen, setIsStatusSubOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [previewPanX, setPreviewPanX] = useState(0);
  const [previewPanY, setPreviewPanY] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const resetPan = () => {
    setPreviewPanX(0);
    setPreviewPanY(0);
    setZoomScale(1);
  };
  const movePan = (dx, dy) => {
    setPreviewPanX(prev => prev + dx);
    setPreviewPanY(prev => prev + dy);
  };
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5));
  const [replyingTo, setReplyingTo] = useState(null);

  const replyingToRef = useRef(null);
  useEffect(() => {
    replyingToRef.current = replyingTo;
  }, [replyingTo]);

  // Audio Recording States & Refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const options = { mimeType: 'audio/webm' };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size > 1.5 * 1024 * 1024) {
          alert("Áudio muito longo. Gravações devem ser menores que 1.5MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = {
            name: `audio_${Date.now()}.webm`,
            type: audioBlob.type || 'audio/webm',
            url: event.target.result
          };
          
          const quoted = replyingToRef.current ? {
            id: replyingToRef.current.id,
            text: replyingToRef.current.text,
            sender: replyingToRef.current.sender,
            senderName: replyingToRef.current.senderName,
            file: replyingToRef.current.file
          } : null;

          sendMessage(activeClient.id, '', fileData, useSignature ? (profile?.name || 'Miguel') : null, quoted);
          setReplyingTo(null);
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
  };

  const cleanupRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const transferMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (transferMenuRef.current && !transferMenuRef.current.contains(event.target)) {
        setShowTransferMenu(false);
      }
      if (!event.target.closest('.message-context-menu') && !event.target.closest('.message-chevron-btn')) {
        setActiveMsgMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find active client data (null if no client is selected)
  const activeClient = clients.find(c => c.id === activeChatClientId) || null;

  const handleTransfer = (dept) => {
    if (!activeClient) return;
    updateClient({
      ...activeClient,
      status: dept
    });
    setShowTransferMenu(false);
  };
  
  const getMsgTimestamp = (msg) => {
    if (msg.timestamp) return msg.timestamp;
    if (msg.time) {
      const ts = parseTimeStrToTimestamp(msg.time);
      if (ts > 0) return ts;
    }
    return 0;
  };

  const activeMessages = activeClient
    ? [...(chats[activeClient.id] || [])].sort((a, b) => getMsgTimestamp(a) - getMsgTimestamp(b))
    : [];

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChatClientId]);

  // Filter and sort clients by most recent message timestamp & instance filter
  const filteredClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            client.phone?.includes(searchQuery);
      
      const matchesInstance = selectedInstanceFilter === 'all' || 
                              client.instanceName === selectedInstanceFilter ||
                              !client.instanceName;

      if (!matchesInstance) return false;

      if (filter === 'starred') {
        return matchesSearch && starredClients.includes(client.id);
      }
      if (filter === 'unread') {
        return matchesSearch && unreadChats.includes(client.id);
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      const getLatestTime = (client) => {
        if (client.lastMessageTimestamp) return client.lastMessageTimestamp;
        
        if (client.lastMessageTime) {
          const ts = parseTimeStrToTimestamp(client.lastMessageTime);
          if (ts > 0) return ts;
        }

        const msgs = chats[client.id] || [];
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.timestamp) return lastMsg.timestamp;
          if (lastMsg.time) {
            const ts = parseTimeStrToTimestamp(lastMsg.time);
            if (ts > 0) return ts;
          }
        }
        return 0;
      };
      return getLatestTime(b) - getLatestTime(a);
    });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeClient) return;



    const quoted = replyingTo ? {
      id: replyingTo.id,
      text: replyingTo.text,
      sender: replyingTo.sender,
      senderName: replyingTo.senderName,
      file: replyingTo.file
    } : null;

    sendMessage(activeClient.id, inputText, null, useSignature ? (profile?.name || 'Miguel') : null, quoted);
    setInputText('');
    setReplyingTo(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeClient) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert("Para manter o armazenamento local leve, escolha um arquivo menor que 2.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        url: event.target.result
      };
      
      const quoted = replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        sender: replyingTo.sender,
        senderName: replyingTo.senderName,
        file: replyingTo.file
      } : null;

      const isTextOrDoc = file.type?.includes('text') || file.name?.match(/\.(txt|csv|json|md)$/i);

      if (isTextOrDoc) {
        const textReader = new FileReader();
        textReader.onload = (tEvent) => {
          fileData.textContent = tEvent.target.result;
          sendMessage(
            activeClient.id, 
            `Enviou o arquivo: ${file.name}`, 
            fileData, 
            useSignature ? (profile?.name || 'Miguel') : null,
            quoted
          );
          setReplyingTo(null);
        };
        textReader.readAsText(file);
      } else {
        sendMessage(
          activeClient.id, 
          `Enviou o arquivo: ${file.name}`, 
          fileData, 
          useSignature ? (profile?.name || 'Miguel') : null,
          quoted
        );
        setReplyingTo(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const handleSelectEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  const toggleStar = (clientId, e) => {
    e.stopPropagation();
    if (starredClients.includes(clientId)) {
      setStarredClients(prev => prev.filter(id => id !== clientId));
    } else {
      setStarredClients(prev => [...prev, clientId]);
    }
  };

  const navigateToClients = () => {
    setActiveModule('clientes');
  };

  const navigateToKanban = () => {
    setActiveModule('kanban');
  };

  const handleClearChat = () => {
    if (!activeClient) return;
    if (confirm(`Deseja realmente limpar todo o histórico de mensagens com "${activeClient.name}"?`)) {
      clearChat(activeClient.id);
    }
  };

  const handleDeleteContact = () => {
    if (!activeClient) return;
    if (confirm(`Tem certeza que deseja apagar o contato "${activeClient.name}" e todas as suas mensagens do sistema?`)) {
      const remainingClients = clients.filter(c => c.id !== activeClient.id);
      deleteClient(activeClient.id);
      if (remainingClients.length > 0) {
        setActiveChatClientId(remainingClients[0].id);
      } else {
        setActiveChatClientId(null);
      }
    }
  };

  return (
    <div className={`conversas-container ${activeClient ? 'has-active-chat' : ''}`} style={styles.container}>
      {/* Sidebar - Contacts List */}
      <div className="glass-panel conversas-sidebar" style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ ...styles.sidebarTitle, marginBottom: 0 }}>Conversas</h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '3px 7px',
              borderRadius: '10px',
              backgroundColor: waStatus === 'ONLINE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: waStatus === 'ONLINE' ? 'var(--accent-success)' : 'var(--accent-danger)',
              border: waStatus === 'ONLINE' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: waStatus === 'ONLINE' ? 'var(--accent-success)' : 'var(--accent-danger)',
                display: 'inline-block'
              }} />
              <span>{waStatus === 'ONLINE' ? 'WhatsApp Online' : 'WhatsApp Offline'}</span>
            </div>
          </div>

          {/* Multi-Instance Filter Dropdown */}
          <div style={{ marginBottom: '0.75rem' }}>
            <select
              value={selectedInstanceFilter}
              onChange={e => setSelectedInstanceFilter(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.4rem 0.625rem',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Todas as Instâncias ({waInstances.length})</option>
              {waInstances.map(inst => (
                <option key={inst.id} value={inst.instanceName} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  {inst.name} ({inst.instanceName})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input 
              type="text" 
              className="input-field" 
              style={styles.searchInput}
              placeholder="Buscar contato..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={styles.filterBar}>
            <button 
              onClick={() => setFilter('all')} 
              style={{...styles.filterTab, color: filter === 'all' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderBottomColor: filter === 'all' ? 'var(--accent-cyan)' : 'transparent'}}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('unread')} 
              style={{...styles.filterTab, color: filter === 'unread' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderBottomColor: filter === 'unread' ? 'var(--accent-cyan)' : 'transparent'}}
            >
              Não Lidas
            </button>
            <button 
              onClick={() => setFilter('starred')} 
              style={{...styles.filterTab, color: filter === 'starred' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderBottomColor: filter === 'starred' ? 'var(--accent-cyan)' : 'transparent'}}
            >
              Favoritos
            </button>
          </div>
        </div>

        <div style={styles.contactList}>
          {filteredClients.map(client => {
            const clientMsgs = chats[client.id] || [];
            const lastMsg = clientMsgs[clientMsgs.length - 1];
            const isActive = activeChatClientId === client.id;
            const isStarred = starredClients.includes(client.id);

            return (
              <div
                key={client.id}
                onClick={() => setActiveChatClientId(client.id)}
                style={{
                  ...styles.contactRow,
                  backgroundColor: isActive ? 'var(--glass-highlight)' : 'transparent',
                  borderColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent'
                }}
                className="glass-card-hover"
              >
                <div style={styles.contactLeft}>
                  <div style={styles.avatar}>
                    {client.profilePicUrl ? (
                      <img 
                        src={client.profilePicUrl} 
                        alt={client.name} 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      client.name ? client.name.split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() : '?'
                    )}
                  </div>
                  <div style={styles.contactInfo}>
                    <span style={styles.contactName}>{client.name}</span>
                    <span style={styles.contactLastMsg}>
                      {clientMsgs.length > 0
                        ? (lastMsg ? lastMsg.text : 'Sem mensagens ainda.')
                        : (client.lastMessageText && client.lastMessageTimestamp > 0 ? client.lastMessageText : 'Sem mensagens ainda.')}
                    </span>
                  </div>
                </div>

                <div style={styles.contactRight}>
                  <span style={styles.contactTime}>
                    {clientMsgs.length > 0
                      ? (lastMsg ? lastMsg.time : '')
                      : (client.lastMessageText && client.lastMessageTimestamp > 0 ? client.lastMessageTime : '')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {unreadChats.includes(client.id) && client.id !== activeChatClientId && (
                      <div 
                        style={{
                          backgroundColor: 'var(--accent-cyan)',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          boxShadow: '0 0 8px var(--accent-cyan)'
                        }}
                        title="Mensagem não lida"
                      />
                    )}
                    <button 
                      onClick={(e) => toggleStar(client.id, e)} 
                      style={styles.starBtn}
                    >
                      <Star 
                        size={14} 
                        fill={isStarred ? 'var(--accent-warning)' : 'none'} 
                        color={isStarred ? 'var(--accent-warning)' : 'var(--text-tertiary)'} 
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div style={styles.emptyContacts}>
              <MessageSquare size={20} />
              <span>Nenhum contato encontrado.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="glass-panel conversas-chat-area" style={styles.chatArea}>
        {activeClient ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                <button 
                  type="button"
                  className="mobile-chat-back-btn" 
                  onClick={() => setActiveChatClientId(null)}
                  title="Voltar para contatos"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="19" y1="12" x2="5" y2="12"></line>
                     <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <div style={styles.avatarLarge}>
                  {activeClient.profilePicUrl ? (
                    <img 
                      src={activeClient.profilePicUrl} 
                      alt={activeClient.name} 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    activeClient.name ? activeClient.name.split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() : '?'
                  )}
                </div>
                <div>
                  <h3 className="chat-header-name-text" style={styles.chatHeaderName}>{activeClient.name}</h3>
                  <div style={styles.chatHeaderSub}>
                    <span className="chat-header-name-text">{activeClient.email || activeClient.phone}</span>
                    {activeClient.assignedUser && (() => {
                      const assigned = systemUsers.find(u => u.name === activeClient.assignedUser);
                      const uColor = assigned?.color || '#3b82f6';
                      return (
                        <span style={{ 
                          fontSize: '0.6875rem', 
                          padding: '1px 6px', 
                          marginLeft: '0.375rem',
                          backgroundColor: uColor + '25',
                          color: uColor,
                          border: `1px solid ${uColor}55`,
                          borderRadius: '10px',
                          fontWeight: '600'
                        }}>
                          👤 {activeClient.assignedUser}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div style={styles.chatHeaderRight}>
                <button 
                  onClick={navigateToClients} 
                  style={styles.headerActionBtn}
                  title="Ver no CRM"
                >
                  <Phone size={14} />
                  <span className="chat-header-btn-text">CRM</span>
                </button>
                <button 
                  onClick={navigateToKanban} 
                  style={styles.headerActionBtn}
                  title="Ver no Kanban"
                >
                  <TrendingUp size={14} />
                  <span className="chat-header-btn-text">Negócio</span>
                </button>
                <div ref={transferMenuRef} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowTransferMenu(!showTransferMenu)}
                    style={{
                      ...styles.headerActionIconBtn,
                      backgroundColor: showTransferMenu ? 'var(--glass-highlight)' : 'transparent',
                      color: showTransferMenu ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                    }}
                    title="Ações do Contato"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {showTransferMenu && (
                    <div style={styles.transferDropdown}>
                      {/* Section 1: Transferir para (Collapsible Accordion) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsTransferSubOpen(prev => !prev);
                        }}
                        style={{
                          ...styles.transferHeader,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Transferir para:</span>
                        {isTransferSubOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isTransferSubOpen && (
                        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                          {(() => {
                            const saved = localStorage.getItem('crmbase_pipelines');
                            const pipelinesList = saved ? JSON.parse(saved) : [
                              { id: 'pessoal', name: 'Pessoal' },
                              { id: 'contabil_fiscal', name: 'Contábil/Fiscal' },
                              { id: 'documentos_fiscais', name: 'Emissão de Documentos Fiscais' },
                              { id: 'administrativo', name: 'Administrativo' }
                            ];
                            return pipelinesList.map((p) => {
                              const isCurrent = activeClient?.status?.trim().toLowerCase() === p.name.trim().toLowerCase();
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleTransfer(p.name);
                                  }}
                                  style={{
                                    ...styles.transferOption,
                                    paddingLeft: '1.25rem',
                                    color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                    fontWeight: isCurrent ? '600' : 'normal',
                                  }}
                                  className="transfer-option-hover"
                                >
                                  <span>{p.name}</span>
                                  {isCurrent && <span style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>• atual</span>}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      )}

                      {/* Section 2: Atribuir Operador (Collapsible Accordion) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsAssignSubOpen(prev => !prev);
                        }}
                        style={{
                          ...styles.transferHeader,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Atribuir Operador:</span>
                        {isAssignSubOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isAssignSubOpen && (
                        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (activeClient) updateClient({ ...activeClient, assignedUser: null });
                              setShowTransferMenu(false);
                            }}
                            style={{
                              ...styles.transferOption,
                              paddingLeft: '1.25rem',
                              color: !activeClient?.assignedUser ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            }}
                            className="transfer-option-hover"
                          >
                            <span>Sem Atribuição</span>
                            {!activeClient?.assignedUser && <span style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>• atual</span>}
                          </button>
                          {systemUsers.map(user => {
                            const isAssigned = activeClient?.assignedUser === user.name;
                            const uColor = user.color || '#3b82f6';
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (activeClient) updateClient({ ...activeClient, assignedUser: user.name });
                                  setShowTransferMenu(false);
                                }}
                                style={{
                                  ...styles.transferOption,
                                  paddingLeft: '1.25rem',
                                  color: isAssigned ? uColor : 'var(--text-primary)',
                                  fontWeight: isAssigned ? '600' : 'normal',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                                className="transfer-option-hover"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: uColor, display: 'inline-block' }} />
                                  <span>{user.name}</span>
                                </div>
                                {isAssigned && <span style={{ color: uColor, fontSize: '10px' }}>• atual</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Section 2: Status / Prioridade (Collapsible Accordion) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsStatusSubOpen(prev => !prev);
                        }}
                        style={{
                          ...styles.transferHeader,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Status / Prioridade:</span>
                        {isStatusSubOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isStatusSubOpen && (
                        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                          {[
                            { name: 'Prioridade Alta', val: 'Alta' },
                            { name: 'Prioridade Média', val: 'Média' },
                            { name: 'Prioridade Baixa', val: 'Baixa' }
                          ].map((st) => (
                            <button
                              key={st.val}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (activeClient) {
                                  updateClient({ ...activeClient, priority: st.val });
                                }
                                setShowTransferMenu(false);
                              }}
                              style={{
                                ...styles.transferOption,
                                paddingLeft: '1.25rem',
                                color: activeClient?.priority === st.val ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                fontWeight: activeClient?.priority === st.val ? '600' : 'normal',
                              }}
                              className="transfer-option-hover"
                            >
                              <span>{st.name}</span>
                              {activeClient?.priority === st.val && <span style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>• atual</span>}
                            </button>
                          ))}
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />

                      <button
                        type="button"
                        onClick={() => {
                          handleClearChat();
                          setShowTransferMenu(false);
                        }}
                        style={{
                          ...styles.transferOption,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                        className="transfer-option-hover"
                      >
                        <Eraser size={14} style={{ color: 'var(--accent-primary)' }} />
                        <span>Limpar Conversa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteContact();
                          setShowTransferMenu(false);
                        }}
                        style={{
                          ...styles.transferOption,
                          color: '#fca5a5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                        className="transfer-option-hover"
                      >
                        <UserMinus size={14} style={{ color: '#ef4444' }} />
                        <span>Apagar Contato</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Pane */}
            <div style={styles.messagesPane}>
              {activeMessages.map(msg => {
                if (msg.senderName === 'Sistema') {
                  return (
                    <div key={msg.id} style={styles.systemMessageRow}>
                      <div style={styles.systemMessageBadge}>
                        {msg.text}
                      </div>
                    </div>
                  );
                }
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={msg.id} 
                    id={msg.id}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => {
                      setHoveredMessageId(null);
                      if (activeReactionMenuId === msg.id) setActiveReactionMenuId(null);
                    }}
                    style={{
                      ...styles.messageRow,
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Trigger for User message (placed BEFORE bubble, appearing to its LEFT) */}
                    {isUser && (hoveredMessageId === msg.id || activeReactionMenuId === msg.id) && (
                      <div style={{ ...styles.reactionTriggerContainerRight, gap: '4px' }}>
                        {activeReactionMenuId === msg.id && (
                          <div style={styles.reactionOptionsBarRight}>
                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                              <span 
                                key={emoji} 
                                onClick={() => {
                                  reactToMessage(activeClient.id, msg.id, emoji);
                                  setActiveReactionMenuId(null);
                                }}
                                style={styles.reactionOptionEmoji}
                                className="emoji-item-hover"
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        <button 
                          type="button" 
                          onClick={() => setReplyingTo(msg)}
                          style={styles.messageReactionTrigger}
                          title="Responder"
                        >
                          <CornerUpLeft size={13} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setActiveReactionMenuId(activeReactionMenuId === msg.id ? null : msg.id)}
                          style={styles.messageReactionTrigger}
                          title="Reagir"
                        >
                          <Smile size={13} />
                        </button>
                      </div>
                    )}

                    <div 
                      style={{
                        ...styles.messageBubble,
                        backgroundColor: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: isUser ? 'var(--bg-primary)' : 'var(--text-primary)',
                        borderBottomRightRadius: isUser ? '2px' : '12px',
                        borderBottomLeftRadius: isUser ? '12px' : '2px',
                        position: 'relative',
                        marginBottom: msg.reaction ? '12px' : '0px',
                      }}
                    >


                      {msg.senderName && (
                        <span style={styles.messageSenderName}>
                          {msg.senderName}
                        </span>
                      )}

                      {/* Quoted Message (Reply Box) */}
                      {msg.quotedMessage && (
                        <div 
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            borderLeft: '4px solid ' + (msg.quotedMessage.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-cyan)'),
                            padding: '0.375rem 0.5rem',
                            borderRadius: '4px',
                            marginBottom: '0.375rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.125rem',
                            cursor: 'pointer',
                            opacity: 0.85,
                          }}
                          onClick={() => {
                            const el = document.getElementById(msg.quotedMessage.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                        >
                          <span style={{ fontWeight: '600', color: msg.quotedMessage.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-cyan)' }}>
                            {msg.quotedMessage.senderName || (msg.quotedMessage.sender === 'user' ? 'Você' : 'Contato')}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                            {msg.quotedMessage.text || (msg.quotedMessage.file ? `📁 ${msg.quotedMessage.file.name}` : 'Mídia')}
                          </span>
                        </div>
                      )}
                      
                      {msg.file ? (
                        <div style={styles.fileMessageContainer}>
                          <MediaWrapper file={msg.file} fetchMediaBase64={fetchMediaBase64} onImageClick={setZoomedImage} onFileClick={setPreviewFile} />
                          {msg.text && !isPlaceholderText(msg.text) && <p style={{ ...styles.messageText, marginTop: '0.375rem' }}>{msg.text}</p>}
                        </div>
                      ) : (
                        <p style={styles.messageText}>{msg.text}</p>
                      )}
                      
                      {/* Reacted Emoji Badge rendered at the bottom edge of the bubble */}
                      {msg.reaction && (
                        <div 
                          style={{
                            ...styles.reactionBadge,
                            left: isUser ? '10px' : 'auto',
                            right: isUser ? 'auto' : '10px',
                          }}
                          onClick={() => reactToMessage(activeClient.id, msg.id, msg.reaction)}
                          title="Remover Reação"
                        >
                          {msg.reaction}
                        </div>
                      )}
                      
                      <span style={{
                        ...styles.messageTime,
                        color: isUser ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-tertiary)'
                      }}>
                        {msg.time}{msg.isEdited ? ' (Editada)' : ''}
                      </span>
                    </div>

                    {/* Trigger for Contact message (placed AFTER bubble, appearing to its RIGHT) */}
                    {!isUser && (hoveredMessageId === msg.id || activeReactionMenuId === msg.id) && (
                      <div style={{ ...styles.reactionTriggerContainerLeft, gap: '4px' }}>
                        <button 
                          type="button" 
                          onClick={() => setActiveReactionMenuId(activeReactionMenuId === msg.id ? null : msg.id)}
                          style={styles.messageReactionTrigger}
                          title="Reagir"
                        >
                          <Smile size={13} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setReplyingTo(msg)}
                          style={styles.messageReactionTrigger}
                          title="Responder"
                        >
                          <CornerUpLeft size={13} />
                        </button>
                        {activeReactionMenuId === msg.id && (
                          <div style={styles.reactionOptionsBarLeft}>
                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                              <span 
                                key={emoji} 
                                onClick={() => {
                                  reactToMessage(activeClient.id, msg.id, emoji);
                                  setActiveReactionMenuId(null);
                                }}
                                style={styles.reactionOptionEmoji}
                                className="emoji-item-hover"
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area with Signature Button and File Selector */}
            <div style={{ ...styles.inputAreaContainer, position: 'relative' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />



              {/* Reply Preview Bar */}
              {replyingTo && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-secondary)',
                    borderLeft: '4px solid ' + (replyingTo.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-cyan)'),
                    padding: '0.5rem 1rem',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    borderBottom: '1px solid var(--glass-border)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: replyingTo.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-cyan)' }}>
                      Respondendo a {replyingTo.senderName || (replyingTo.sender === 'user' ? 'Você' : 'Contato')}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      {replyingTo.text || (replyingTo.file ? `📁 ${replyingTo.file.name}` : 'Mídia')}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      borderRadius: '50%',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Emoji Picker Overlay */}
              {showEmojiPicker && (
                <div style={styles.emojiPickerContainer}>
                  <div style={styles.emojiPickerHeader}>
                    <span>Emojis Populares</span>
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(false)} 
                      style={styles.emojiPickerCloseBtn}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={styles.emojiGrid}>
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
                      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
                      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
                      '🤩', '🥳', '😏', '😒', '😞', '😔', '👍', '👎', '👊', '✊',
                      '👏', '🙌', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜'
                    ].map(emoji => (
                      <span 
                        key={emoji} 
                        onClick={() => handleSelectEmoji(emoji)} 
                        style={styles.emojiItem}
                        className="emoji-item-hover"
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <style>{`
                @keyframes pulse-mic {
                  0%, 100% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0.3;
                  }
                }
                .animate-pulse-mic {
                  animation: pulse-mic 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
              `}</style>

              {activeClient?.isSimulator && (
                <div style={{
                  padding: '0.625rem 1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
                  color: '#93c5fd',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500'
                }}>
                  <span>🤖</span>
                  <span><strong>Modo de Simulação Ativo</strong>: Suas mensagens digitadas simulam a fala do cliente no WhatsApp para testar as regras e o roteamento automático do agente. Use a opção de limpar conversa para reiniciar a triagem.</span>
                </div>
              )}

              {isRecording ? (
                <form onSubmit={(e) => { e.preventDefault(); stopRecording(); }} style={styles.inputPanel}>
                  <button 
                    type="button" 
                    onClick={cancelRecording} 
                    style={{
                      ...styles.inputActionBtn,
                      color: 'var(--accent-danger)'
                    }}
                    title="Cancelar gravação"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                    <span className="animate-pulse-mic" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.875rem', color: '#e9edef', fontWeight: '500' }}>
                      Gravando ({formatTime(recordingTime)})
                    </span>
                  </div>

                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ ...styles.sendBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
                    title="Enviar áudio"
                  >
                    <Check size={18} style={{ color: '#ffffff' }} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSend} style={styles.inputPanel}>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    style={styles.inputActionBtn}
                    title="Anexar arquivo"
                  >
                    <Paperclip size={18} />
                  </button>


                  
                  {/* Signature Toggle Button Styled like Screenshot */}
                  <div 
                    style={styles.tooltipContainer}
                    onMouseEnter={() => setIsSignatureHovered(true)}
                    onMouseLeave={() => setIsSignatureHovered(false)}
                  >
                    <button 
                      type="button" 
                      onClick={() => setUseSignature(!useSignature)}
                      style={{
                        ...styles.signatureBtn,
                        borderColor: useSignature ? 'var(--accent-success)' : 'var(--glass-border)',
                        backgroundColor: useSignature ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        color: useSignature ? '#34d399' : 'var(--text-secondary)',
                      }}
                    >
                      <Signature size={16} />
                    </button>
                    {isSignatureHovered && (
                      <div style={styles.tooltipText}>
                        {useSignature ? "Desativar Assinatura" : "Ativar Assinatura"}
                      </div>
                    )}
                  </div>

                  {/* Slash Command Autocomplete Popup Menu */}
                  {showSlashMenu && filteredSlashReplies.length > 0 && (
                    <div 
                      className="glass-panel"
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '1rem',
                        right: '1rem',
                        marginBottom: '0.5rem',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        padding: '0.5rem'
                      }}
                    >
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', padding: '0.25rem 0.5rem', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Respostas Rápidas (Pressione Tab ou Enter para selecionar)
                      </div>
                      {filteredSlashReplies.map((reply, idx) => (
                        <div
                          key={reply.id}
                          onClick={() => handleSelectSlashReply(reply)}
                          onMouseEnter={() => setSelectedSlashIndex(idx)}
                          style={{
                            padding: '0.625rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: selectedSlashIndex === idx ? 'var(--glass-highlight)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            borderLeft: selectedSlashIndex === idx ? '3px solid var(--accent-cyan)' : '3px solid transparent'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                              {reply.title}
                            </span>
                            <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                              /{reply.shortcut}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {reply.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="text" 
                    className="input-field" 
                    style={styles.chatInput}
                    placeholder={activeClient?.isSimulator ? "Digite como o cliente (Simulador de WhatsApp)..." : "Digite sua mensagem ou / para respostas rápidas..."}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (showSlashMenu && filteredSlashReplies.length > 0) {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedSlashIndex(prev => (prev + 1) % filteredSlashReplies.length);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedSlashIndex(prev => (prev - 1 + filteredSlashReplies.length) % filteredSlashReplies.length);
                        } else if (e.key === 'Enter' || e.key === 'Tab') {
                          e.preventDefault();
                          handleSelectSlashReply(filteredSlashReplies[selectedSlashIndex]);
                        } else if (e.key === 'Escape') {
                          setShowSlashMenu(false);
                        }
                      }
                    }}
                  />
                  
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    style={{
                      ...styles.inputActionBtn,
                      color: showEmojiPicker ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                    }}
                    title="Inserir Emojis"
                  >
                    <Smile size={18} />
                  </button>

                  <button 
                    type={inputText.trim() ? "submit" : "button"}
                    onClick={inputText.trim() ? null : startRecording}
                    className="btn btn-primary"
                    style={{
                      ...styles.sendBtn,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      width: inputText.trim() ? 'auto' : '44px',
                      height: '44px',
                      padding: inputText.trim() ? '0 1.25rem' : '0',
                      borderRadius: inputText.trim() ? '20px' : '50%'
                    }}
                    title={inputText.trim() ? "Enviar" : "Gravar áudio"}
                  >
                    {inputText.trim() ? (
                      <>
                        <Send size={14} />
                        <span>Enviar</span>
                      </>
                    ) : (
                      <Mic size={16} />
                    )}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div style={styles.emptyChatState}>
            <MessageSquare size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
            <h3>Nenhuma Conversa Ativa</h3>
            <p>Selecione um cliente na lista lateral para iniciar o atendimento.</p>
          </div>
        )}
      </div>

      {/* Zoomed Image Lightbox */}
      {zoomedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s ease-in-out',
          }}
          onClick={() => setZoomedImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={24} />
          </button>
          
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              cursor: 'default',
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
          />
        </div>
      )}

      {/* Document & PDF Preview Lightbox Modal */}
      {previewFile && (
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
          onClick={() => { setPreviewFile(null); resetPan(); }}
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
                  {previewFile.name || 'Visualizador de Documento'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.875rem', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}
                >
                  Baixar Arquivo
                </a>
                <button
                  type="button"
                  onClick={() => { setPreviewFile(null); resetPan(); }}
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
                onClick={() => { setPreviewFile(null); resetPan(); }} 
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
                <button type="button" onClick={handleZoomIn} className="btn btn-primary" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} title="Aumentar Zoom (+)">
                  <ZoomIn size={15} /> <span>Zoom +</span>
                </button>
                <button type="button" onClick={handleZoomOut} className="btn btn-secondary" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} title="Diminuir Zoom (-)">
                  <ZoomOut size={15} /> <span>Zoom -</span>
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600', minWidth: '45px', textAlign: 'center' }}>
                  {Math.round(zoomScale * 100)}%
                </span>
                <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--glass-border)', margin: '0 0.25rem' }} />
                <button type="button" onClick={() => movePan(0, 60)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Cima">
                  <ArrowUp size={16} />
                </button>
                <button type="button" onClick={() => movePan(0, -60)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Baixo">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => movePan(60, 0)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Esquerda">
                  <ArrowLeft size={16} />
                </button>
                <button type="button" onClick={() => movePan(-60, 0)} className="btn btn-secondary" style={{ padding: '4px 8px' }} title="Mover para Direita">
                  <ArrowRight size={16} />
                </button>
                <button type="button" onClick={resetPan} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Centralizar e Resetar Zoom">
                  <RotateCcw size={14} /> Resetar
                </button>
              </div>
            </div>

            {/* Viewport content area centered with theme background */}
            <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                height: '100%',
                transform: `translate(${previewPanX}px, ${previewPanY}px) scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {previewFile.url && (previewFile.url.includes('pdf') || previewFile.name?.endsWith('.pdf')) ? (
                  <iframe 
                    src={`${previewFile.url}#toolbar=0&navpanes=0`} 
                    title={previewFile.name}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                ) : previewFile.url && (previewFile.type?.startsWith('image/') || previewFile.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <Paperclip size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5, color: 'var(--accent-cyan)' }} />
                    <h4>Pré-visualização direta indisponível</h4>
                    <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>Clique abaixo para baixar e abrir o arquivo no seu computador.</p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className="btn btn-primary"
                      style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      Baixar {previewFile.name}
                    </a>
                  </div>
                )}
              </div>
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
    width: '100%',
    height: 'calc(100vh - 4rem)',
    gap: '1.5rem',
  },
  sidebar: {
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  sidebarHeader: {
    padding: '1.25rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    fontFamily: 'var(--font-heading)',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-tertiary)',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '2.5rem',
    height: '2.25rem',
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
  },
  filterTab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    paddingBottom: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'var(--transition-smooth)',
  },
  contactList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  contactRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  contactLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    overflow: 'hidden',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8125rem',
    fontWeight: '700',
    position: 'relative',
    flexShrink: 0,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-success)',
    border: '2px solid var(--bg-secondary)',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contactName: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  contactLastMsg: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '160px',
  },
  contactRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  contactTime: {
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },
  emptyContacts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: 'var(--text-tertiary)',
    padding: '3rem 1rem',
    fontSize: '0.75rem',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--glass-border)',
    backgroundColor: 'var(--glass-highlight)',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatarLarge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
  },
  chatHeaderName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  chatHeaderSub: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-success)',
  },
  chatHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  headerActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    ':hover': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--glass-highlight)',
    }
  },
  headerActionIconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  messagesPane: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    background: 'var(--bg-primary)',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  messageText: {
    fontSize: '0.875rem',
    lineHeight: '1.4',
  },
  messageTime: {
    fontSize: '0.625rem',
    alignSelf: 'flex-end',
  },
  inputPanel: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'var(--glass-highlight)',
  },
  chatInput: {
    flex: 1,
    height: '2.5rem',
    borderRadius: '20px',
    padding: '0 1.25rem',
  },
  inputActionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    ':hover': {
      color: 'var(--text-primary)'
    }
  },
  sendBtn: {
    height: '2.5rem',
    borderRadius: '20px',
    padding: '0 1.25rem',
  },
  emptyChatState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    padding: '2rem',
    textAlign: 'center',
  },
  inputAreaContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  signatureBtn: {
    background: 'none',
    border: '1px solid var(--glass-border)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '0',
    flexShrink: 0,
  },
  tooltipContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    position: 'absolute',
    bottom: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    backgroundColor: '#131b26',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    zIndex: 100,
    border: '1px solid var(--glass-border)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  messageSenderName: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '0.25rem',
    display: 'block',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '2px',
  },
  fileMessageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  fileImagePreview: {
    maxWidth: '100%',
    maxHeight: '180px',
    borderRadius: '6px',
    objectFit: 'cover',
    display: 'block',
    cursor: 'pointer',
  },
  fileGenericPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
  },
  fileNameLink: {
    color: 'var(--accent-cyan)',
    textDecoration: 'underline',
    fontWeight: '500',
    fontSize: '0.8125rem',
    wordBreak: 'break-all',
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: '4.25rem',
    right: '1.5rem',
    width: '280px',
    height: '220px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  emojiPickerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  emojiPickerCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '4px',
  },
  emojiGrid: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.25rem',
  },
  emojiItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
  },
  reactionTriggerContainerLeft: {
    position: 'relative',
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  reactionTriggerContainerRight: {
    position: 'relative',
    marginRight: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  messageReactionTrigger: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  reactionOptionsBarLeft: {
    position: 'absolute',
    bottom: '30px',
    left: '0px',
    display: 'flex',
    gap: '0.375rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '4px 8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    whiteSpace: 'nowrap',
  },
  reactionOptionsBarRight: {
    position: 'absolute',
    bottom: '30px',
    right: '0px',
    display: 'flex',
    gap: '0.375rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '4px 8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    whiteSpace: 'nowrap',
  },
  reactionOptionEmoji: {
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '2px',
    borderRadius: '50%',
    transition: 'transform 0.15s ease',
    display: 'inline-block',
  },
  reactionBadge: {
    position: 'absolute',
    bottom: '-10px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    padding: '1px 5px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    zIndex: 5,
    userSelect: 'none',
  },
  systemMessageRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: '0.5rem 0',
  },
  systemMessageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    borderRadius: '12px',
    padding: '6px 14px',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  transferDropdown: {
    position: 'absolute',
    top: '2.5rem',
    right: '0',
    width: '240px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  transferHeader: {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  transferOption: {
    background: 'none',
    border: 'none',
    padding: '0.625rem 0.75rem',
    textAlign: 'left',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    width: '100%',
  }
}
