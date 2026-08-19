import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ClientLogo from './ClientLogo';
import { Mail, Lock, LogIn, Key, HelpCircle, User, ArrowRight, CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const { login, register, quickLoginPortal } = useApp();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'recover'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Read directly from DOM to prevent React state sync issues with browser autofill/managers
    const formEmail = e.target.elements.email ? e.target.elements.email.value : email;
    const formPassword = e.target.elements.password ? e.target.elements.password.value : password;
    const formName = e.target.elements.name ? e.target.elements.name.value : name;

    if (mode === 'login') {
      const res = login(formEmail, formPassword);
      if (!res.success) {
        setError(res.message);
      }
    } else if (mode === 'register') {
      if (!formName || !formEmail || !formPassword) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      const res = register(formName, formEmail, formPassword);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setSuccess('Conta criada com sucesso! Você já pode entrar.');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setError('');
        setSuccess('');
      }, 2000);
    } else if (mode === 'recover') {
      if (!email) {
        setError('Por favor, informe seu e-mail.');
        return;
      }
      setSuccess('Instruções de recuperação enviadas para o seu e-mail.');
      setTimeout(() => {
        setMode('login');
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel auth-card" style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ClientLogo height={42} theme="dark" />
        </div>

        <h2 style={styles.title}>
          {mode === 'login' && 'Entrar na Plataforma'}
          {mode === 'register' && 'Criar Nova Conta'}
          {mode === 'recover' && 'Recuperar Senha'}
        </h2>
        <p style={styles.subtitle}>
          Portal de relacionamento e gestão de locações da <strong>Araújo Imóveis</strong>.
        </p>

        {/* Quick Demo Access Buttons */}
        {mode === 'login' && (
          <div style={styles.quickAccessSection}>
            <span style={styles.quickAccessTitle}>Acesso Rápido de Demonstração:</span>
            <div style={styles.quickAccessGrid}>
              <button 
                type="button" 
                style={styles.quickAccessBtnProp} 
                onClick={() => quickLoginPortal('proprietario')}
              >
                🏠 Proprietário
              </button>

              <button 
                type="button" 
                style={styles.quickAccessBtnTen} 
                onClick={() => quickLoginPortal('inquilino')}
              >
                🔑 Inquilino
              </button>

              <button 
                type="button" 
                style={styles.quickAccessBtnAdmin} 
                onClick={() => quickLoginPortal('admin')}
              >
                🏢 Imobiliária
              </button>
            </div>
            <div style={styles.quickDivider}>
              <span>ou entre com seu e-mail</span>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.alertError}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div className="input-group">
              <label>Nome Completo</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  name="name"
                  type="text"
                  className="input-field"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>E-mail</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                name="email"
                type="email"
                className="input-field"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {mode !== 'recover' && (
            <div className="input-group">
              <div style={styles.labelRow}>
                <label>Senha</label>
                {mode === 'login' && (
                  <span onClick={() => setMode('recover')} style={styles.forgotPass}>
                    Esqueceu?
                  </span>
                )}
              </div>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    outline: 'none',
                  }}
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={styles.submitBtn}>
            {mode === 'login' && (
              <>
                <span>Acessar Painel</span>
                <LogIn size={18} />
              </>
            )}
            {mode === 'register' && (
              <>
                <span>Registrar Conta</span>
                <ArrowRight size={18} />
              </>
            )}
            {mode === 'recover' && (
              <>
                <span>Enviar Instruções</span>
                <Key size={18} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          {mode === 'login' ? (
            <p>
              Não possui uma conta?{' '}
              <span onClick={() => setMode('register')} style={styles.link}>
                Criar conta
              </span>
            </p>
          ) : (
            <p>
              Já possui uma conta?{' '}
              <span onClick={() => setMode('login')} style={styles.link}>
                Fazer login
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    minHeight: '100vh',
    background: `linear-gradient(135deg, rgba(8, 12, 20, 0.88) 0%, rgba(15, 23, 42, 0.80) 100%), url('/araujo-bg.jpg') center/cover no-repeat fixed`,
    position: 'relative',
    padding: '1.5rem',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(rgba(0, 212, 255, 0.12) 1px, transparent 1px)`,
    backgroundSize: '28px 28px',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
    border: '1px solid var(--glass-border)',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    marginBottom: '1.5rem',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-cyan) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  title: {
    fontSize: '1.625rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-tertiary)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    paddingLeft: '2.75rem',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPass: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  submitBtn: {
    marginTop: '0.75rem',
    justifyContent: 'center',
    height: '2.75rem',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--border-radius-sm)',
    color: '#f87171',
    fontSize: '0.8125rem',
    marginBottom: '1.25rem',
    lineHeight: '1.4',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: 'var(--border-radius-sm)',
    color: '#34d399',
    fontSize: '0.8125rem',
    marginBottom: '1.25rem',
    lineHeight: '1.4',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent-primary)',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'underline',
  },
  credentialsTip: {
    marginTop: '1.5rem',
    padding: '0.875rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  quickAccessSection: {
    marginBottom: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  quickAccessTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    fontWeight: '600',
  },
  quickAccessGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem',
  },
  quickAccessBtnProp: {
    padding: '0.5rem 0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  quickAccessBtnTen: {
    padding: '0.5rem 0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  quickAccessBtnAdmin: {
    padding: '0.5rem 0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  quickDivider: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    marginTop: '0.5rem',
    position: 'relative',
  }
};
