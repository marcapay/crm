import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Kanban from './components/Kanban';
import Conversas from './components/Conversas';
import Clientes from './components/Clientes';
import LinksRapidos from './components/LinksRapidos';
import Configuracoes from './components/Configuracoes';
import Perfil from './components/Perfil';

export default function App() {
  const { isAuthenticated, activeModule } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Route modules
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <Kanban />;
      case 'conversas':
        return <Conversas />;
      case 'clientes':
        return <Clientes />;
      case 'links-rapidos':
        return <LinksRapidos />;
      case 'configuracoes':
        return <Configuracoes />;
      case 'perfil':
        return <Perfil />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      {/* Visual Connected Nodes (Eloos Theme Background) */}
      <svg className="eloos-bg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        {/* Connection pathways */}
        <line x1="15%" y1="25%" x2="40%" y2="55%" stroke="var(--glass-border)" strokeWidth="1" />
        <line x1="40%" y1="55%" x2="75%" y2="35%" stroke="var(--glass-border)" strokeWidth="1" />
        <line x1="75%" y1="35%" x2="90%" y2="75%" stroke="var(--glass-border)" strokeWidth="1" />
        <line x1="40%" y1="55%" x2="60%" y2="85%" stroke="var(--glass-border)" strokeWidth="1" />
        <line x1="15%" y1="25%" x2="60%" y2="85%" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Pulsing Nodes */}
        <circle cx="15%" cy="25%" r="6" fill="var(--accent-primary)" className="animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <circle cx="40%" cy="55%" r="8" fill="var(--accent-cyan)" className="animate-pulse-glow" style={{ animationDelay: '1.2s' }} />
        <circle cx="75%" cy="35%" r="6" fill="var(--accent-secondary)" className="animate-pulse-glow" style={{ animationDelay: '2.4s' }} />
        <circle cx="90%" cy="75%" r="9" fill="var(--accent-success)" className="animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
        <circle cx="60%" cy="85%" r="7" fill="var(--accent-warning)" className="animate-pulse-glow" style={{ animationDelay: '1.8s' }} />
      </svg>

      {/* Mobile Top Header */}
      <div className="mobile-header">
        <button 
          className="hamburger-btn" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.125rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-cyan) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ANÁLISE
        </span>
        <div style={{ width: '44px' }}></div>
      </div>

      {/* Sidebar Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <main className="main-content">
        {renderActiveModule()}
      </main>
    </div>
  );
}
