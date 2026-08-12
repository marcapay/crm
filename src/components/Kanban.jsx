import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Calendar, 
  AlertCircle, 
  X, 
  Check,
  Users,
  Filter,
  Rocket,
  RefreshCw,
  Phone,
  ArrowRightLeft,
  Smile,
  Paperclip,
  Send,
  Mic,
  Signature,
  CornerUpLeft
} from 'lucide-react';

// Helper component to dynamically fetch and display media from the WhatsApp server
const MediaWrapper = ({ file, fetchMediaBase64, onImageClick }) => {
  const [url, setUrl] = useState(file.url);
  const [loading, setLoading] = useState(!file.url && !!file.keyId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url && file.keyId) {
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
  }, [file.keyId, url, fetchMediaBase64]);

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

  if (file.type.startsWith('image/')) {
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

  if (file.type.startsWith('audio/')) {
    return (
      <audio 
        src={mediaUrl} 
        controls 
        style={{ maxWidth: '100%', marginTop: '0.25rem', display: 'block' }} 
      />
    );
  }

  if (file.type.startsWith('video/')) {
    return (
      <video 
        src={mediaUrl} 
        controls 
        style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '0.25rem', borderRadius: '6px', display: 'block' }} 
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
      <Paperclip size={16} style={{ color: 'var(--accent-cyan)' }} />
      <a href={mediaUrl} download={file.name} style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: '500', fontSize: '0.8125rem', wordBreak: 'break-all' }}>
        {file.name}
      </a>
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

export default function Kanban() {
  const { 
    clients, 
    kanbanCards, 
    moveKanbanCard, 
    addKanbanCard, 
    updateKanbanCard, 
    deleteKanbanCard, 
    setActiveModule, 
    setActiveChatClientId,
    chats,
    sendMessage,
    reactToMessage,
    profile,
    fetchMediaBase64,
    updateClient,
    waInstances,
    selectedInstanceFilter,
    setSelectedInstanceFilter,
    systemUsers = []
  } = useApp();

  // Kanban Columns State grouped by Pipeline
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('crmbase_columns');
    return saved ? JSON.parse(saved) : [];
  });

  const [pipelines, setPipelines] = useState(() => {
    const saved = localStorage.getItem('crmbase_pipelines');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('crmbase_columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('crmbase_pipelines', JSON.stringify(pipelines));
  }, [pipelines]);

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState('Todos');
  const [pipelineFilter, setPipelineFilter] = useState('Todos');

  const activePipelineId = pipelineFilter === 'Todos' ? 'pessoal' : pipelineFilter;

  // Drag and Drop States
  const [activeDragId, setActiveDragId] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  
  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);
  const [isMoveCardOpen, setIsMoveCardOpen] = useState(false);
  const [isAddPipelineOpen, setIsAddPipelineOpen] = useState(false);
  const [pipeName, setPipeName] = useState('');

  // Focus targets
  const [currentCard, setCurrentCard] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [clientId, setClientId] = useState('');
  const [column, setColumn] = useState('pessoal');
  const [priority, setPriority] = useState('Média');
  const [date, setDate] = useState('');
  
  // Column Form States
  const [colName, setColName] = useState('');
  const [colColor, setColColor] = useState('#1fb5e4');

  // Drag and Drop handlers
  const handleDragStart = (e, cardId) => {
    setActiveDragId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || activeDragId;
    if (cardId) {
      moveKanbanCard(cardId, targetColumn);
    }
    setActiveDragId(null);
    setDraggedOverColumn(null);
  };

  // Filter Cards list
  const filteredCards = kanbanCards.filter(card => {
    const matchesPriority = priorityFilter === 'Todos' || card.priority === priorityFilter;
    if (!matchesPriority) return false;

    if (selectedInstanceFilter !== 'all') {
      const cardClient = clients.find(c => c.id === card.clientId);
      if (cardClient && cardClient.instanceName && cardClient.instanceName !== selectedInstanceFilter) {
        return false;
      }
    }

    return true;
  });

  // Reset Filters
  const handleResetFilters = () => {
    setPriorityFilter('Todos');
    setPipelineFilter('Todos');
  };

  // Card Creation
  const openAddModal = (colId) => {
    setColumn(colId);
    setTitle('');
    setDesc('');
    setClientId(clients[0]?.id || '');
    setPriority('Média');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAddOpen(true);
  };

  const handleCreateCard = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addKanbanCard({
      title,
      desc,
      clientId,
      column,
      priority,
      date
    });

    setIsAddOpen(false);
  };

  // Card Editing
  const openEditModal = (card, e) => {
    e.stopPropagation();
    setCurrentCard(card);
    setTitle(card.title);
    setDesc(card.desc);
    setClientId(card.clientId);
    setColumn(card.column);
    setPriority(card.priority);
    setDate(card.date);
    setIsEditOpen(true);
  };

  const handleUpdateCard = (e) => {
    e.preventDefault();
    if (!title.trim() || !currentCard) return;

    updateKanbanCard({
      ...currentCard,
      title,
      desc,
      clientId,
      column,
      priority,
      date
    });

    setIsEditOpen(false);
  };

  // Quick Move Card (Mover Button)
  const openMoveCardModal = (card, e) => {
    e.stopPropagation();
    setCurrentCard(card);
    setColumn(card.column);
    setIsMoveCardOpen(true);
  };

  const handleQuickMove = (targetColId) => {
    if (currentCard) {
      moveKanbanCard(currentCard.id, targetColId);
    }
    setIsMoveCardOpen(false);
  };

  // Custom Column Operations
  const handleCreateColumn = (e) => {
    e.preventDefault();
    if (!colName.trim()) return;

    const newColId = `col_${Date.now()}`;
    setColumns(prev => [...prev, { id: newColId, pipelineId: activePipelineId, name: colName, color: colColor }]);
    setIsAddColumnOpen(false);
  };

  const openEditColumnModal = (col, e) => {
    e.stopPropagation();
    setCurrentColumn(col);
    setColName(col.name);
    setColColor(col.color);
    setIsEditColumnOpen(true);
  };

  const handleUpdateColumn = (e) => {
    e.preventDefault();
    if (!colName.trim() || !currentColumn) return;

    setColumns(prev => prev.map(c => c.id === currentColumn.id ? { ...c, name: colName, color: colColor } : c));
    setIsEditColumnOpen(false);
  };

  const handleDeleteColumn = (colId, e) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta coluna? Todos os cards nela serão transferidos.')) {
      setColumns(prev => prev.filter(c => c.id !== colId));
      // Move orphaned cards to the first column within the same pipeline
      const fallbackCol = columns.find(c => c.id !== colId && c.pipelineId === activePipelineId)?.id || `${activePipelineId}_a_fazer`;
      kanbanCards.forEach(card => {
        if (card.column === colId) {
          moveKanbanCard(card.id, fallbackCol);
        }
      });
    }
  };

  const handleCreatePipeline = (e) => {
    e.preventDefault();
    if (!pipeName.trim()) return;

    const newPipeId = `pipe_${Date.now()}`;
    setPipelines(prev => [...prev, { id: newPipeId, name: pipeName }]);
    setColumns(prev => [
      ...prev,
      { id: `${newPipeId}_a_fazer`, pipelineId: newPipeId, name: 'A Fazer', color: '#1fb5e4' },
      { id: `${newPipeId}_em_andamento`, pipelineId: newPipeId, name: 'Em Andamento', color: '#f29b11' },
      { id: `${newPipeId}_concluido`, pipelineId: newPipeId, name: 'Concluído', color: '#10b981' }
    ]);
    setPipelineFilter(newPipeId);
    setPipeName('');
    setIsAddPipelineOpen(false);
  };

  const handleDeletePipeline = () => {
    if (pipelineFilter === 'Todos') {
      alert("Por favor, selecione um pipeline específico para excluir.");
      return;
    }
    const targetPipe = pipelines.find(p => p.id === pipelineFilter);
    if (!targetPipe) return;

    if (window.confirm(`Tem certeza que deseja excluir o pipeline "${targetPipe.name}"? Todos os cards e colunas nele serão removidos.`)) {
      setPipelines(prev => prev.filter(p => p.id !== pipelineFilter));
      setColumns(prev => prev.filter(col => col.pipelineId !== pipelineFilter));
      kanbanCards.forEach(card => {
        if (card.column.startsWith(pipelineFilter)) {
          deleteKanbanCard(card.id);
        }
      });
      const remainingPipes = pipelines.filter(p => p.id !== pipelineFilter);
      const fallbackPipe = remainingPipes[0]?.id || 'Todos';
      setPipelineFilter(fallbackPipe);
    }
  };

  // WhatsApp Chat Modal States
  const [activeChatClient, setActiveChatClient] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const chatMessagesEndRef = useRef(null);
  const chatFileInputRef = useRef(null);

  // Emojis, Reactions & Signature States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);
  const [useSignature, setUseSignature] = useState(true);
  const [isSignatureHovered, setIsSignatureHovered] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
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
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatClient]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // WhatsApp click handler
  const handleWhatsAppClick = (client, e) => {
    e.stopPropagation();
    if (!client) return;
    setActiveChatClient(client);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeChatClient) return;

    const quoted = replyingTo ? {
      id: replyingTo.id,
      text: replyingTo.text,
      sender: replyingTo.sender,
      senderName: replyingTo.senderName,
      file: replyingTo.file
    } : null;

    sendMessage(activeChatClient.id, chatInputText, null, useSignature ? (profile?.name || 'Miguel') : null, quoted);
    setChatInputText('');
    setReplyingTo(null);
  };

  const handleChatFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatClient) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Para manter o armazenamento local leve, escolha um arquivo menor que 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        type: file.type,
        url: event.target.result
      };
      
      const quoted = replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        sender: replyingTo.sender,
        senderName: replyingTo.senderName,
        file: replyingTo.file
      } : null;

      sendMessage(activeChatClient.id, `Enviou o arquivo: ${file.name}`, fileData, useSignature ? (profile?.name || 'Miguel') : null, quoted);
      setReplyingTo(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

          sendMessage(activeChatClient.id, '', fileData, useSignature ? (profile?.name || 'Miguel') : null, quoted);
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

  const handleSelectEmoji = (emoji) => {
    setChatInputText(prev => prev + emoji);
  };

  return (
    <div style={styles.container}>
      <header className="module-header kanban-header" style={styles.header}>
        {/* Filters and Search Hub */}
        <div className="kanban-filter-hub" style={styles.filterHub}>
          {/* Instance Filter */}
          <div style={styles.filterSelectWrapper}>
            <Filter size={14} style={styles.filterIcon} />
            <select 
              value={selectedInstanceFilter} 
              onChange={e => setSelectedInstanceFilter(e.target.value)}
              style={{ ...styles.filterSelect, color: 'var(--accent-cyan)', fontWeight: '600' }}
            >
              <option value="all" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Todas as Instâncias ({waInstances.length})</option>
              {waInstances.map(inst => (
                <option key={inst.id} value={inst.instanceName} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  {inst.name} ({inst.instanceName})
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div style={styles.filterSelectWrapper}>
            <Filter size={14} style={styles.filterIcon} />
            <select 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="Todos">Todas as Prioridades</option>
              <option value="Alta">Prioridade Alta</option>
              <option value="Média">Prioridade Média</option>
              <option value="Baixa">Prioridade Baixa</option>
            </select>
          </div>

          {/* Pipeline Filter */}
          <div style={styles.filterSelectWrapper}>
            <Rocket size={14} style={styles.filterIcon} />
            <select 
              value={pipelineFilter} 
              onChange={e => setPipelineFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="Todos">Pipelines</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            {pipelineFilter !== 'Todos' && (
              <button 
                onClick={handleDeletePipeline} 
                style={styles.deletePipelineIconBtn}
                title="Excluir Pipeline Ativo"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Create Buttons */}
        <div className="kanban-header-actions" style={styles.headerActions}>
          <button onClick={() => setIsAddPipelineOpen(true)} style={styles.addColumnBtn}>
            <Plus size={14} />
            <span>Novo Pipeline</span>
          </button>
          
          <button onClick={() => setIsAddColumnOpen(true)} style={styles.addColumnBtn}>
            <Plus size={14} />
            <span>Nova Coluna</span>
          </button>
          
          <button onClick={() => openAddModal(`${activePipelineId}_a_fazer`)} className="btn btn-primary" style={styles.addLeadBtn}>
            <Plus size={16} />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </header>

      {/* Board Columns Container */}
      <div className="kanban-board-scroll" style={styles.board}>
        {columns
          .filter(col => col.pipelineId === activePipelineId)
          .map(col => {
          const colCards = filteredCards.filter(c => c.column === col.id);
          const isOver = draggedOverColumn === col.id;
          
          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className="glass-panel"
              style={{
                ...styles.column,
                borderTop: `4px solid ${col.color}`,
                borderColor: isOver ? col.color : 'var(--glass-border)',
                backgroundColor: isOver ? 'rgba(255, 255, 255, 0.015)' : 'var(--bg-secondary)',
              }}
            >
              {/* Column Header */}
              <div style={styles.columnHeader}>
                <div style={styles.columnTitleBlock}>
                  <h4 style={styles.columnName} onClick={(e) => openEditColumnModal(col, e)}>
                    {col.name}
                  </h4>
                  <button onClick={(e) => openEditColumnModal(col, e)} style={styles.columnActionBtn} title="Editar">
                    <Pencil size={11} />
                  </button>
                  {/* Count Badge */}
                  <span style={{ ...styles.columnBadge, backgroundColor: col.color }}>
                    {colCards.length}
                  </span>
                </div>
                
                {/* Delete button for custom columns */}
                {col.id.startsWith('col_') && (
                  <button onClick={(e) => handleDeleteColumn(col.id, e)} style={styles.columnDeleteBtn} title="Excluir Coluna">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div style={styles.columnSubtitle}>{colCards.length} negócios</div>

              {/* Cards List */}
              <div style={styles.cardsList}>
                {colCards.map(card => {
                  const cardClient = clients.find(c => c.id === card.clientId);
                  const initials = cardClient && cardClient.name ? cardClient.name.split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'TA';
                  
                  // Circle color based on client index to look like the screen
                  const avatarColors = ['#a855f7', '#1fb5e4', '#f29b11', '#00a2e0', '#10b981'];
                  const avatarBg = avatarColors[clients.findIndex(c => c.id === card.clientId) % avatarColors.length] || '#1fb5e4';

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onClick={(e) => openEditModal(card, e)}
                      style={styles.card}
                      className="glass-card-hover"
                    >
                      {/* Card main row: Avatar + Name/Phone */}
                      <div style={styles.cardContent}>
                        <div style={{ ...styles.cardAvatar, backgroundColor: avatarBg }}>
                          {initials}
                        </div>
                        <div style={styles.cardTextGroup}>
                          <div style={styles.cardTitle}>{card.title}</div>
                          {cardClient && (
                            <div style={styles.cardPhoneRow}>
                              <Phone size={10} style={{ color: 'var(--text-tertiary)' }} />
                              <span style={styles.cardPhone}>{cardClient.phone || 'Sem fone'}</span>
                            </div>
                          )}
                          {cardClient && cardClient.assignedUser && (() => {
                            const assigned = systemUsers.find(u => u.name === cardClient.assignedUser);
                            const userColor = assigned?.color || '#3b82f6';
                            return (
                              <div style={{ marginTop: '0.25rem' }}>
                                <span style={{ 
                                  backgroundColor: userColor + '22',
                                  color: userColor,
                                  border: `1px solid ${userColor}55`,
                                  fontSize: '0.625rem',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  👤 {cardClient.assignedUser}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Card actions row */}
                      <div style={styles.cardActionsRow}>
                        {cardClient && (
                          <button 
                            onClick={(e) => handleWhatsAppClick(cardClient, e)}
                            style={styles.whatsappBtn}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.792-4.382 9.795-9.79.002-2.618-1.01-5.078-2.852-6.92C16.37 2.053 13.915 1.04 11.29 1.04 5.892 1.04 1.503 5.424 1.501 10.835c-.001 1.503.411 2.977 1.192 4.3l-.994 3.63 3.72-.976-.11.066zM17.15 14.54c-.284-.143-1.68-.83-1.94-.925-.26-.096-.45-.143-.64.143-.19.285-.735.925-.9 1.114-.166.19-.33.21-.615.068-1.393-.694-2.285-1.228-3.21-2.812-.246-.42.247-.39.704-1.304.075-.153.037-.285-.018-.38-.056-.094-.447-1.077-.612-1.474-.16-.388-.323-.335-.446-.34-.114-.006-.246-.007-.377-.007-.132 0-.348.049-.53.248-.182.198-.694.678-.694 1.654s.71 1.916.81 2.047c.098.13 1.394 2.13 3.38 2.982.473.203.842.325 1.13.418.475.152.908.13 1.25.079.382-.057 1.68-.687 1.918-1.353.24-.666.24-1.235.168-1.353-.07-.118-.255-.213-.538-.356z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </button>
                        )}
                        <button 
                          onClick={(e) => openMoveCardModal(card, e)}
                          style={styles.moveBtn}
                        >
                          <ArrowRightLeft size={10} style={{ marginRight: '4px' }} />
                          <span>Mover</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {colCards.length === 0 && (
                  <div style={styles.emptyDropCard} onClick={() => openAddModal(col.id)}>
                    <Plus size={18} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={styles.emptyDropText}>Nenhum lead</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Card Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.modal}>
            <button className="modal-close" onClick={() => setIsAddOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Adicionar Tarefa</h3>
            
            <form onSubmit={handleCreateCard} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Título do Negócio</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Ex: Ana Silva - Processamento"
                  required
                />
              </div>

              <div className="input-group">
                <label>Descrição / Anotações</label>
                <textarea 
                  className="input-field" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  placeholder="Ex: Realizar tarefas da coluna."
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div className="input-group">
                <label>Vincular Cliente</label>
                <select 
                  className="input-field" 
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalRow}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Prioridade</label>
                  <select 
                    className="input-field" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label>Data Limite</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={styles.modal}>
            <button className="modal-close" onClick={() => setIsEditOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Editar Tarefa / Oportunidade</h3>
            
            <form onSubmit={handleUpdateCard} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Título do Negócio</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>Descrição / Anotações</label>
                <textarea 
                  className="input-field" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div className="input-group">
                <label>Vincular Cliente</label>
                <select 
                  className="input-field" 
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalRow}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Prioridade</label>
                  <select 
                    className="input-field" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label>Data Limite</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ ...styles.modalActions, justifyContent: 'space-between' }}>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => {
                    if(confirm("Tem certeza que deseja excluir esta tarefa?")){
                      deleteKanbanCard(currentCard.id);
                      setIsEditOpen(false);
                    }
                  }}
                >
                  Excluir Tarefa
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Move Context Dialog */}
      {isMoveCardOpen && currentCard && (
        <div className="modal-overlay" onClick={() => setIsMoveCardOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ ...styles.modal, maxWidth: '380px' }}>
            <button className="modal-close" onClick={() => setIsMoveCardOpen(false)}><X size={18} /></button>
            <h3 style={styles.modalTitle}>Mover para Coluna</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Escolha para qual coluna deseja transferir a tarefa de <strong>{currentCard.title}</strong>:
            </p>

            <div style={styles.moveOptionsList}>
              {columns
                .filter(c => c.pipelineId === activePipelineId)
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleQuickMove(c.id)}
                    style={{
                      ...styles.moveOptionRow,
                      borderLeftColor: c.color,
                      backgroundColor: currentCard.column === c.id ? 'var(--glass-highlight)' : 'transparent',
                      fontWeight: currentCard.column === c.id ? '600' : 'normal'
                    }}
                    className="glass-card-hover"
                  >
                    <span>{c.name}</span>
                    {currentCard.column === c.id && <Check size={14} style={{ color: 'var(--accent-cyan)' }} />}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Column Modal */}
      {isAddColumnOpen && (
        <div className="modal-overlay" onClick={() => setIsAddColumnOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ ...styles.modal, maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setIsAddColumnOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Nova Coluna</h3>
            
            <form onSubmit={handleCreateColumn} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Nome da Coluna</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={colName} 
                  onChange={e => setColName(e.target.value)} 
                  placeholder="Ex: Auditoria"
                  required
                />
              </div>

              <div className="input-group">
                <label>Cor Identificadora</label>
                <div style={styles.colorPickerContainer}>
                  {['#1fb5e4', '#a855f7', '#f29b11', '#00a2e0', '#10b981', '#ef4444'].map(c => (
                    <div 
                      key={c}
                      onClick={() => setColColor(c)}
                      style={{
                        ...styles.colorDot,
                        backgroundColor: c,
                        boxShadow: colColor === c ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddColumnOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Column Modal */}
      {isEditColumnOpen && (
        <div className="modal-overlay" onClick={() => setIsEditColumnOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ ...styles.modal, maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setIsEditColumnOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Editar Coluna</h3>
            
            <form onSubmit={handleUpdateColumn} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Nome da Coluna</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={colName} 
                  onChange={e => setColName(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>Cor Identificadora</label>
                <div style={styles.colorPickerContainer}>
                  {['#1fb5e4', '#a855f7', '#f29b11', '#00a2e0', '#10b981', '#ef4444'].map(c => (
                    <div 
                      key={c}
                      onClick={() => setColColor(c)}
                      style={{
                        ...styles.colorDot,
                        backgroundColor: c,
                        boxShadow: colColor === c ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ ...styles.modalActions, justifyContent: currentColumn ? 'space-between' : 'flex-end' }}>
                {currentColumn && (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={(e) => {
                      handleDeleteColumn(currentColumn.id, e);
                      setIsEditColumnOpen(false);
                    }}
                  >
                    Excluir Coluna
                  </button>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditColumnOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Pipeline Modal */}
      {isAddPipelineOpen && (
        <div className="modal-overlay" onClick={() => setIsAddPipelineOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ ...styles.modal, maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setIsAddPipelineOpen(false)}><X size={20} /></button>
            <h3 style={styles.modalTitle}>Novo Pipeline</h3>
            
            <form onSubmit={handleCreatePipeline} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Nome do Pipeline</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={pipeName} 
                  onChange={e => setPipeName(e.target.value)} 
                  placeholder="Ex: Auditoria"
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddPipelineOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Chat Modal (Ellos Style) */}
      {activeChatClient && (
        <div 
          className="modal-overlay" 
          onClick={() => setActiveChatClient(null)}
          style={{
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000
          }}
        >
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
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
          <div 
            className="modal-content glass-panel kanban-chat-drawer" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              ...styles.chatModal,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Header */}
            <div style={styles.chatModalHeader}>
              <div style={styles.chatModalHeaderLeft}>
                <div style={styles.chatModalAvatar}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.chatModalName}>{activeChatClient.name}</h3>
                  <span style={styles.chatModalPhone}>{activeChatClient.phone}</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatClient(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8696a0',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                className="glass-card-hover"
              >
                <X size={22} />
              </button>
            </div>

            {/* Messages Body */}
            <div 
              style={{
                ...styles.chatModalBody,
                backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QMeFdIhuG.png')",
                backgroundColor: "#0b141a",
                backgroundSize: "400px"
              }}
            >
              {(chats[activeChatClient.id] || []).length === 0 ? (
                <div style={styles.emptyChatContainer}>
                  <div style={styles.emptyChatBadge}>
                    <span style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>🔒</span>
                    As mensagens e chamadas são protegidas com a criptografia de ponta a ponta do CRM.<br/><br/>
                    Inicie a conversa com <b>{activeChatClient.name}</b>.
                  </div>
                </div>
              ) : (
                (chats[activeChatClient.id] || []).map(msg => {
                  if (msg.senderName === 'Sistema') {
                    return (
                      <div key={msg.id} style={styles.systemMsgRow}>
                        <div style={styles.systemMsgBadge}>{msg.text}</div>
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
                        setActiveReactionMenuId(null);
                      }}
                      style={{
                        ...styles.msgRow,
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* Hover trigger for user messages (react icon shown to its left) */}
                      {isUser && (hoveredMessageId === msg.id || activeReactionMenuId === msg.id) && (
                        <div style={{ ...styles.reactionTriggerContainerRight, gap: '4px' }}>
                          {activeReactionMenuId === msg.id && (
                            <div style={styles.reactionOptionsBarRight}>
                              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                                <span 
                                  key={emoji} 
                                  onClick={() => {
                                    reactToMessage(activeChatClient.id, msg.id, emoji);
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
                          ...styles.msgBubble,
                          backgroundColor: isUser ? '#005c4b' : '#202c33',
                          color: '#e9edef',
                          borderBottomRightRadius: isUser ? '2px' : '8px',
                          borderBottomLeftRadius: isUser ? '8px' : '2px',
                          marginBottom: msg.reaction ? '12px' : '0px',
                        }}
                      >
                        {msg.senderName && <span style={styles.msgSenderName}>{msg.senderName}</span>}
                        
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
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <MediaWrapper file={msg.file} fetchMediaBase64={fetchMediaBase64} onImageClick={setZoomedImage} />
                            {msg.text && !isPlaceholderText(msg.text) && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem' }}>{msg.text}</p>}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: '1.4' }}>{msg.text}</p>
                        )}

                        {/* Reaction Pill Badge */}
                        {msg.reaction && (
                          <div 
                            style={{
                              ...styles.reactionBadge,
                              left: isUser ? '10px' : 'auto',
                              right: isUser ? 'auto' : '10px',
                            }}
                            onClick={() => reactToMessage(activeChatClient.id, msg.id, msg.reaction)}
                            title="Remover Reação"
                          >
                            {msg.reaction}
                          </div>
                        )}

                        <span style={styles.msgTime}>{msg.time}</span>
                      </div>

                      {/* Hover trigger for contact messages (react icon shown to its right) */}
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
                                    reactToMessage(activeChatClient.id, msg.id, emoji);
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
                })
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Input Form Area with Emoji Picker and Signature Toggle */}
            <div style={{ position: 'relative', width: '100%' }}>

              {/* Reply Preview Bar */}
              {replyingTo && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#202c33',
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
                    <span style={{ fontSize: '0.8125rem', color: '#8696a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                      {replyingTo.text || (replyingTo.file ? `📁 ${replyingTo.file.name}` : 'Mídia')}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8696a0',
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
              {showEmojiPicker && !isRecording && (
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

              {isRecording ? (
                <form onSubmit={(e) => { e.preventDefault(); stopRecording(); }} style={styles.chatModalInputRow}>
                  <button 
                    type="button" 
                    onClick={cancelRecording} 
                    style={{
                      ...styles.chatModalActionBtn,
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
                    style={styles.chatModalGreenBtn}
                    title="Enviar áudio"
                  >
                    <Check size={18} style={{ color: '#ffffff' }} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendChat} style={styles.chatModalInputRow}>
                  <input 
                    type="file" 
                    ref={chatFileInputRef} 
                    onChange={handleChatFileChange} 
                    style={{ display: 'none' }}
                  />
                  
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      ...styles.chatModalActionBtn,
                      color: showEmojiPicker ? 'var(--accent-cyan)' : '#8696a0'
                    }}
                    title="Emojis"
                  >
                    <Smile size={22} />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => chatFileInputRef.current?.click()} 
                    style={styles.chatModalActionBtn}
                    title="Anexar arquivo"
                  >
                    <Paperclip size={22} style={{ color: '#8696a0' }} />
                  </button>

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
                        color: useSignature ? '#34d399' : '#8696a0',
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
                  
                  <input 
                    type="text" 
                    className="input-field" 
                    style={styles.chatModalInputField}
                    placeholder="Digite uma mensagem"
                    value={chatInputText}
                    onChange={e => setChatInputText(e.target.value)}
                  />
                  
                  <button 
                    type={chatInputText.trim() ? "submit" : "button"}
                    onClick={chatInputText.trim() ? null : startRecording}
                    style={styles.chatModalGreenBtn}
                    title={chatInputText.trim() ? "Enviar" : "Gravar áudio"}
                  >
                    {chatInputText.trim() ? (
                      <Send size={16} style={{ color: '#ffffff', marginLeft: '2px' }} />
                    ) : (
                      <Mic size={18} style={{ color: '#ffffff' }} />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterHub: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  filterSelectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    position: 'absolute',
    left: '0.875rem',
    color: 'var(--text-secondary)',
    pointerEvents: 'none',
  },
  filterSelect: {
    padding: '0.5rem 1rem 0.5rem 2.25rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8125rem',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    minWidth: '160px',
    transition: 'var(--transition-smooth)',
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23a0aec0\' height=\'18\' viewBox=\'0 0 24 24\' width=\'18\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: '28px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  addColumnBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px dashed var(--glass-border)',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  addLeadBtn: {
    borderRadius: '20px',
    padding: '0.5rem 1.25rem',
  },
  board: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'flex-start',
    width: '100%',
    flex: 1,
    overflowX: 'auto',
    paddingBottom: '1rem',
  },
  column: {
    width: '290px',
    minWidth: '290px',
    borderRadius: '12px',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 165px)',
    borderLeftWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderStyle: 'solid',
    boxShadow: 'var(--card-shadow)',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  columnTitleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: '85%',
  },
  columnName: {
    fontSize: '0.9375rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  columnActionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  columnBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    borderRadius: '50%',
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  columnDeleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    ':hover': {
      color: 'var(--accent-danger)'
    }
  },
  columnSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  cardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '2px',
    marginBottom: '0.5rem',
  },
  card: {
    cursor: 'grab',
    borderRadius: '12px',
    padding: '1rem',
    backgroundColor: 'var(--bg-secondary)', // Dark/Light background for card
    border: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: 'var(--card-shadow)',
    transition: 'var(--transition-smooth)',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  cardAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  cardTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardPhoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.125rem',
  },
  cardPhone: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  cardActionsRow: {
    display: 'flex',
    gap: '0.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '0.625rem',
  },
  whatsappBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem 0.5rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    border: '1.2px solid #10b981',
    color: '#10b981',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    ':hover': {
      backgroundColor: 'rgba(16, 181, 129, 0.08)'
    }
  },
  moveBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem 0.5rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  emptyDropCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '2.5rem 1rem',
    border: '1px dashed rgba(255, 255, 255, 0.07)',
    borderRadius: '8px',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  emptyDropText: {
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  modalRow: {
    display: 'flex',
    gap: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.75rem',
  },
  moveOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.25rem',
  },
  moveOptionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    border: '1px solid var(--glass-border)',
    borderLeftWidth: '4px',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  colorPickerContainer: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem 0',
  },
  colorDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  deletePipelineIconBtn: {
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  chatModal: {
    width: '450px',
    maxWidth: '100%',
    height: '100vh',
    maxHeight: 'none',
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
    border: '1px solid var(--glass-border)',
    borderRight: 'none',
    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.45)',
    backgroundColor: 'var(--bg-primary)',
    margin: 0,
  },
  chatModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--glass-border)',
  },
  chatModalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  chatModalAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#00a884',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chatModalName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: '1.2',
  },
  chatModalPhone: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  chatModalBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  emptyChatContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '1rem',
  },
  emptyChatBadge: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    padding: '0.875rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    textAlign: 'center',
    lineHeight: '1.45',
    border: '1px solid var(--glass-border)',
    maxWidth: '85%',
  },
  systemMsgRow: {
    display: 'flex',
    justifyContent: 'center',
    margin: '0.25rem 0',
  },
  systemMsgBadge: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    padding: '0.35rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.6875rem',
    border: '1px solid var(--glass-border)',
  },
  msgRow: {
    display: 'flex',
    width: '100%',
  },
  msgBubble: {
    padding: '0.375rem 0.625rem',
    borderRadius: '8px',
    maxWidth: '75%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 1.5px rgba(0, 0, 0, 0.2)',
  },
  msgSenderName: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#53bdeb',
    marginBottom: '0.125rem',
  },
  msgFileImage: {
    maxWidth: '100%',
    maxHeight: '180px',
    borderRadius: '6px',
    marginTop: '0.125rem',
    cursor: 'pointer',
    objectFit: 'cover',
  },
  msgFileGeneric: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  msgFileLink: {
    color: '#ffffff',
    textDecoration: 'underline',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '140px',
  },
  msgTime: {
    alignSelf: 'flex-end',
    fontSize: '0.625rem',
    color: '#8696a0',
    marginTop: '0.125rem',
  },
  chatModalInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--glass-border)',
  },
  chatModalActionBtn: {
    background: 'none',
    border: 'none',
    color: '#8696a0',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  chatModalInputField: {
    flex: 1,
    height: '2.5rem',
    padding: '0 0.875rem',
    backgroundColor: '#2a3942',
    border: 'none',
    borderRadius: '8px',
    color: '#e9edef',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem',
    outline: 'none',
  },
  chatModalGreenBtn: {
    height: '2.375rem',
    width: '2.375rem',
    borderRadius: '50%',
    backgroundColor: '#00a884',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.2s',
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
  }
};
