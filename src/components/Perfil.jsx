import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Save, 
  User, 
  Lock, 
  Camera, 
  CheckCircle 
} from 'lucide-react';

export default function Perfil() {
  const { profile, updateProfile } = useApp();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form profile states
  const [profileName, setProfileName] = useState(profile.name);
  const [profileEmail, setProfileEmail] = useState(profile.email);
  const [profileRole, setProfileRole] = useState(profile.role);
  const [profileAvatar, setProfileAvatar] = useState(profile.avatar);
  const [profilePhone, setProfilePhone] = useState(profile.phone || '37998072208');

  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Alterar Foto input visibility toggle
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if profile changes in context
  useEffect(() => {
    setProfileName(profile.name);
    setProfileEmail(profile.email);
    setProfileRole(profile.role);
    setProfileAvatar(profile.avatar);
    setProfilePhone(profile.phone || '37998072208');

  }, [profile]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is trying to change password
    if (newPassword) {
      const userPassword = profile.password || 'admin';
      if (currentPassword !== userPassword) {
        setPasswordError('Senha atual incorreta.');
        setPasswordSuccess('');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('As senhas não coincidem.');
        setPasswordSuccess('');
        return;
      }
      if (newPassword.length < 4) {
        setPasswordError('A senha deve ter pelo menos 4 caracteres.');
        setPasswordSuccess('');
        return;
      }
    }

    updateProfile({
      name: profileName,
      email: profileEmail,
      role: profileRole,
      avatar: profileAvatar,
      phone: profilePhone,

      ...(newPassword ? { password: newPassword } : {})
    });

    setPasswordError('');
    if (newPassword) {
      setPasswordSuccess('Senha redefinida com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setPasswordSuccess('');
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleProfileSubmit}>
        <header className="module-header perfil-header" style={styles.header}>
          <div>
            <h1 className="title-gradient" style={styles.title}>Meu Perfil</h1>
          </div>

          <button type="submit" className="btn btn-cyan" style={styles.saveProfileBtn}>
            <Save size={16} />
            <span>Salvar Perfil</span>
          </button>
        </header>

        <div style={styles.cardsContainer}>
          {/* CARD 1: Dados Pessoais */}
          <div className="glass-panel" style={styles.profileSectionCard}>
            <div style={styles.cardHeader}>
              <User size={16} style={{ color: 'var(--accent-secondary)' }} />
              <span style={styles.cardHeaderTitle}>Dados Pessoais</span>
            </div>
            
            <div style={styles.cardBodyRow}>
              {/* Left Column: Avatar */}
              <div style={styles.avatarCol}>
                <img 
                  src={profileAvatar} 
                  alt="Avatar" 
                  style={styles.largeAvatar} 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="btn"
                  style={styles.alterAvatarBtn}
                >
                  <Camera size={12} />
                  <span>Upload de Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAvatarInput(!showAvatarInput)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.7rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                >
                  {showAvatarInput ? "Ocultar URL" : "Ou colar URL da imagem"}
                </button>
                {showAvatarInput && (
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Cole a URL da imagem"
                    value={profileAvatar}
                    onChange={e => setProfileAvatar(e.target.value)}
                    style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.375rem 0.75rem', width: '100%' }}
                  />
                )}
              </div>

              {/* Right Column: Fields Grid */}
              <div className="profile-fields-grid" style={styles.fieldsGrid}>
                <div className="input-group">
                  <label style={styles.inputLabel}>NOME COMPLETO</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profileName} 
                    onChange={e => setProfileName(e.target.value)} 
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label style={styles.inputLabel}>E-MAIL</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={profileEmail} 
                    onChange={e => setProfileEmail(e.target.value)} 
                    required
                  />
                </div>

                <div className="input-group">
                  <label style={styles.inputLabel}>TELEFONE/WHATSAPP</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profilePhone} 
                    onChange={e => setProfilePhone(e.target.value)} 
                    placeholder="Ex: 37998072208"
                  />
                </div>

                <div className="input-group">
                  <label style={styles.inputLabel}>PERFIL DE ACESSO</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profileRole} 
                    disabled 
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>
          </div>



          {/* CARD 3: Redefinir Senha */}
          <div className="glass-panel" style={styles.profileSectionCard}>
            <div style={styles.cardHeader}>
              <Lock size={16} style={{ color: 'var(--accent-secondary)' }} />
              <span style={styles.cardHeaderTitle}>Segurança & Redefinição de Senha</span>
            </div>
            
            <div className="profile-fields-grid-3" style={styles.cardFieldsGrid3}>
              <div className="input-group">
                <label style={styles.inputLabel}>SENHA ATUAL (para alterar)</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  placeholder="Senha atual"
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>NOVA SENHA</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Nova senha"
                />
              </div>

              <div className="input-group">
                <label style={styles.inputLabel}>CONFIRMAR NOVA SENHA</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Confirmar nova senha"
                />
              </div>
            </div>

            {passwordError && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: '500' }}>
                ⚠️ {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div style={{ color: 'var(--accent-success)', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: '500' }}>
                ✅ {passwordSuccess}
              </div>
            )}
          </div>
        </div>
      </form>

      {isSaved && (
        <div style={styles.saveAlertOverlay}>
          <div className="glass-panel" style={styles.saveAlertBox}>
            <CheckCircle size={20} style={{ color: 'var(--accent-success)' }} />
            <span>Perfil salvo com sucesso!</span>
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
    fontSize: '2.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: 'var(--font-heading)',
  },
  saveProfileBtn: {
    borderRadius: '20px',
    padding: '0.5rem 1.5rem',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(31, 181, 228, 0.3)',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
    maxWidth: '900px',
  },
  profileSectionCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '0.5rem',
  },
  cardHeaderTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardBodyRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  avatarCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    width: '130px',
  },
  largeAvatar: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--accent-cyan)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  alterAvatarBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    borderRadius: '15px',
    border: '1px solid var(--accent-secondary)',
    color: 'var(--accent-secondary)',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    transition: 'var(--transition-smooth)',
  },
  fieldsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  inputLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
  },

  cardFieldsGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
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
  }
};
