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
import AreaProprietario from './components/AreaProprietario';
import AreaInquilino from './components/AreaInquilino';
import PainelGestaoPortais from './components/PainelGestaoPortais';
import Financeiro from './components/Financeiro';

export default function App() {
  const { isAuthenticated, profile, activeModule } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Auth />;
  }

  // 1. Role-based Portal Isolation
  const normalizedRole = (profile?.role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalizedRole === 'proprietario') {
    return <AreaProprietario />;
  }

  if (normalizedRole === 'inquilino') {
    return <AreaInquilino />;
  }

  // 2. Admin / Imobiliária View
  const renderActiveModule = () => {
    // Bloqueia acesso a Configurações para usuário de cargo 'Normal'
    if (normalizedRole === 'normal' && activeModule === 'configuracoes') {
      return <Dashboard />;
    }

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <Kanban />;
      case 'conversas':
        return <Conversas />;
      case 'clientes':
        return <Clientes />;
      case 'financeiro':
        return <Financeiro />;
      case 'gestao-portais':
        return <PainelGestaoPortais />;
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

  return (
    <div className="app-container">


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
          {import.meta.env.VITE_CLIENT_NAME || 'CRM Base'}
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
