import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary detectou erro crítico no CRM:", error, errorInfo);
    // Limpeza profilática se for erro de cota de armazenamento
    const msg = String(error?.message || error);
    if (msg.includes('QuotaExceeded') || msg.includes('setItem') || msg.includes('quota')) {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('crmbase_triage_') || 
              key.startsWith('crmbase_pic_') || 
              key.startsWith('crmbase_read_ts_') ||
              key.includes('poll_handled') ||
              key.includes('temp_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {}
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearStorageAndReload = () => {
    try {
      // 1. Limpa chaves de cache e logs temporários
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('crmbase_triage_') || 
            key.startsWith('crmbase_pic_') || 
            key.startsWith('crmbase_read_ts_') ||
            key.includes('poll_handled') ||
            key.includes('temp_') ||
            key.includes('cache')) {
          localStorage.removeItem(key);
        }
      });

      // 2. Comprime e remove fotos pesadas em base64 do localStorage que causaram o estouro de cota
      ['crmbase_fichas_visita', 'araujo_fichas_visita', 'araujo_portal_properties', 'araujo_imoveis_cadastrados'].forEach(key => {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const cleaned = list.map(item => {
                if (!item || typeof item !== 'object') return item;
                const { fotos, imagensImovel, images, photo, details, ...rest } = item;
                return {
                  ...rest,
                  photo: (typeof photo === 'string' && !photo.startsWith('data:image/')) ? photo : ''
                };
              });
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch (e) {}
      });
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isQuotaError = String(this.state.error?.message || this.state.error).includes('QuotaExceeded') ||
                           String(this.state.error?.message || this.state.error).includes('setItem') ||
                           String(this.state.error?.message || this.state.error).includes('quota');

      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0b0f19',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.75rem', color: '#ffffff' }}>
              Sistema em Recuperação
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              {isQuotaError 
                ? 'O armazenamento local do navegador atingiu o limite de fotos/documentos pesados. Clique no botão abaixo para liberar o cache com segurança e restaurar o sistema.'
                : 'Ocorreu uma instabilidade momentânea na renderização. Seus dados estão preservados com segurança no banco de dados.'}
            </p>

            {this.state.error && (
              <pre style={{
                textAlign: 'left',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#fca5a5',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                maxHeight: '120px'
              }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleClearStorageAndReload}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Liberar Espaço & Restaurar Sistema
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
)
