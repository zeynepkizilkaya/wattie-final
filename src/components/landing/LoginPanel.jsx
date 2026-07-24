import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";

export default function LoginPanel() {
  const login = useAppStore((s) => s.login);
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);

  const [email, setEmail] = useState("demo@wattie.ai");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepText, setAuthStepText] = useState("");
  const [authProgress, setAuthProgress] = useState(0);

  const runAuthSequence = (onSuccess) => {
    setIsAuthenticating(true);
    setAuthStepText("Elektrik Şebekesi & IoT Veri Akışı Bağlanıyor...");
    setAuthProgress(30);

    setTimeout(() => {
      setAuthStepText("Yapay Zeka Analitik Modeli Yükleniyor...");
      setAuthProgress(70);
    }, 450);

    setTimeout(() => {
      setAuthStepText("Akıllı Ev Portalı Hazırlanıyor...");
      setAuthProgress(98);
    }, 900);

    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess();
    }, 1200);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    runAuthSequence(() => {
      login({ email, name: email.split("@")[0] });
    });
  };

  const handleDemoClick = () => {
    runAuthSequence(() => {
      loginAsDemo();
    });
  };

  return (
    <div className="login-card-wrapper">
      <motion.div
        className="glass-card login-panel primary-focus"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <div className="login-header">
          <span className="login-eyebrow mono">⚡ WATTIE // AKILLI ENERJİ PORTALI</span>
          <h2>Hoş Geldiniz</h2>
          <p className="login-sub">
            Akıllı ev enerji sisteminizi izlemek ve yapay zeka analizlerini görüntülemek için giriş yapın.
          </p>
        </div>

        {error && <div className="field-error">{error}</div>}

        <form onSubmit={handleSignIn} aria-label="Giriş Formu">
          <div className="field">
            <label htmlFor="email-input">E-posta Adresi</label>
            <input
              id="email-input"
              type="email"
              placeholder="ornek@wattie.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthenticating}
              required
              aria-required="true"
            />
          </div>

          <div className="field">
            <label htmlFor="password-input">Şifre</label>
            <div className="password-input-wrapper">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isAuthenticating}
                required
                aria-required="true"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                aria-label={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isAuthenticating}
              />
              <span>Beni Hatırla</span>
            </label>
            <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
              Şifremi Unuttum
            </a>
          </div>

          {/* Primary Action Button */}
          <button type="submit" className="btn-primary" disabled={isAuthenticating}>
            Giriş Yap
          </button>

          {/* Secondary Action Button (Outline Ghost Style) */}
          <button
            type="button"
            className="btn-demo-outline"
            onClick={handleDemoClick}
            disabled={isAuthenticating}
          >
            ⚡ DEMO MODU İLE DENE
          </button>
        </form>

        {/* Security & Trust Assurance */}
        <div className="security-trust-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Verileriniz 256-bit SSL ve Uçtan Uca Şifreleme ile Korunur</span>
        </div>

        {/* Footer Technical Hint */}
        <div className="login-hint">
          <span>v2.4 SaaS Platformu</span>
        </div>

        {/* Multi-Step Post-Login Loading Sequence */}
        <AnimatePresence>
          {isAuthenticating && (
            <motion.div
              className="auth-loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="loading-spinner-ring" />
              <p className="loading-step-text mono">{authStepText}</p>
              <div className="loading-progress-bar">
                <motion.div
                  className="loading-progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${authProgress}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
