import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ClientLogo from './ClientLogo';
import { 
  LayoutDashboard, 
  Columns, 
  MessageSquare, 
  Users, 
  Link2, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  User,
  Bell,
  Building2
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { 
    activeModule, 
    setActiveModule, 
    profile, 
    logout, 
    theme, 
    setTheme,
    unreadChats = []
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);

  const hasUnreadMessages = unreadChats && unreadChats.length > 0;

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', name: 'Kanban', icon: Columns },
    { id: 'conversas', name: 'Conversas', icon: MessageSquare },
    { id: 'clientes', name: 'Clientes', icon: Users },
    { id: 'gestao-portais', name: 'Portais (Prop. / Inq.)', icon: Building2 },
    { id: 'links-rapidos', name: 'Atalhos Rápidos', icon: Link2 },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  return (
    <aside className={`glass-panel app-sidebar ${isOpen ? 'open' : ''}`} style={styles.sidebar}>
      <div style={styles.header}>
        <ClientLogo height={32} theme={theme} />
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                if (onClose) onClose();
              }}
              style={{
                ...styles.navItem,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--glass-highlight)' : 'transparent',
                borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit' }} />
              <span style={styles.navText}>{item.name}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer} ref={menuRef}>
        <div style={styles.themeToggleArea}>
          <button 
            onClick={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark');
              if (onClose) onClose();
            }}
            style={styles.themeBtn}
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={18} style={{color: '#f59e0b'}} /> : <Moon size={18} style={{color: '#4f46e5'}} />}
            <span style={styles.themeText}>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>

        {/* Profile Card Click Toggle */}
        <div 
          style={styles.profileCard} 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            style={styles.avatar} 
          />
          <div style={styles.profileInfo}>
            <span style={styles.profileName}>{profile.name}</span>
            <span style={styles.profileRole}>{profile.role}</span>
          </div>

          {/* Notification Bell Icon on Far Right */}
          <div 
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', cursor: 'pointer', marginLeft: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveModule('conversas');
              if (onClose) onClose();
            }}
            title={hasUnreadMessages ? `${unreadChats.length} nova(s) mensagem(ns) não lida(s)` : 'Sem novas mensagens'}
          >
            <Bell size={16} style={{ color: 'var(--text-tertiary)' }} />
            {hasUnreadMessages && (
              <span 
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  boxShadow: '0 0 6px #ef4444'
                }}
              />
            )}
          </div>
        </div>

        {/* Context Menu (Dropdown) triggered by Profile Click */}
        {isProfileOpen && (
          <div className="glass-panel" style={styles.profileDropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.dropdownName}>{profile.name.toUpperCase()}</div>
              <div style={styles.dropdownEmail}>{profile.email}</div>
            </div>
            
            <div style={styles.dropdownDivider} />
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveModule('perfil'); 
                setIsProfileOpen(false); 
                if (onClose) onClose();
              }}
              style={styles.dropdownItem}
            >
              <User size={14} style={styles.dropdownIcon} />
              <span>Perfil</span>
            </button>

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveModule('configuracoes'); 
                setIsProfileOpen(false); 
                if (onClose) onClose();
              }}
              style={styles.dropdownItem}
            >
              <Settings size={14} style={styles.dropdownIcon} />
              <span>Configurações</span>
            </button>

            <div style={styles.dropdownDivider} />

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                logout(); 
                if (onClose) onClose();
              }}
              style={{ ...styles.dropdownItem, color: 'var(--accent-danger)' }}
            >
              <LogOut size={14} style={styles.dropdownIcon} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '0',
    borderTop: '0',
    borderBottom: '0',
    borderLeft: '0',
    position: 'relative',
    zIndex: 100,
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '2rem 1.5rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '1.5rem 1rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    paddingLeft: '1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid transparent',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    transition: 'var(--transition-smooth)',
    zIndex: 2,
  },
  navText: {
    flex: 1,
  },
  activeIndicator: {
    width: '4px',
    height: '14px',
    borderRadius: '2px',
    backgroundColor: 'var(--accent-primary)',
    position: 'absolute',
    right: '8px',
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
  },
  themeToggleArea: {
    display: 'flex',
    justifyContent: 'center',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-highlight)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  themeText: {
    flex: 1,
    textAlign: 'left',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    background: 'var(--glass-highlight)',
    border: '1px solid var(--glass-border)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    ':hover': {
      borderColor: 'rgba(31, 181, 228, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.04)'
    }
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--accent-cyan)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileRole: {
    fontSize: '0.625rem',
    color: 'var(--text-tertiary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileDropdown: {
    position: 'absolute',
    bottom: '76px',
    left: '1rem',
    right: '1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0.75rem 0',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
    zIndex: 150,
  },
  dropdownHeader: {
    padding: '0.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  dropdownName: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '0.04em',
  },
  dropdownEmail: {
    fontSize: '0.6875rem',
    color: 'var(--text-secondary)',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'var(--glass-border)',
    margin: '0.5rem 0',
  },
  dropdownItem: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'var(--glass-highlight)',
    }
  },
  dropdownIcon: {
    color: 'var(--text-secondary)',
  }
};
