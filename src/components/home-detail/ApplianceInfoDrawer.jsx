import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function statusOf(a) {
  if (a.isAnomalous) return "anomalous";
  if (a.currentWatt > a.safeWatt) return "warn";
  return "ok";
}

export default function ApplianceInfoDrawer({ groupName, appliance, appliances = [], onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Support single appliance passed directly or group of appliances
  let group = [];
  let title = "";

  if (appliance) {
    group = [appliance];
    title = appliance.name;
  } else if (groupName && Array.isArray(appliances)) {
    group = appliances.filter((a) => a.name === groupName);
    title = groupName;
  }

  const isOpen = group.length > 0;
  const anomalousCount = group.filter((a) => a.isAnomalous).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="appliance-drawer glass-panel"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow mono">CİHAZ DETAYI</span>
                <h3>{title}</h3>
              </div>
              <button className="btn-icon" onClick={onClose} aria-label="Kapat">✕</button>
            </div>

            <p className="drawer-sub">
              Evde <strong>{group.length}</strong> adet {title.toLowerCase()} kayıtlı
              {anomalousCount > 0 && (
                <> — <span className="text-danger">{anomalousCount} tanesi anomali bildiriyor</span></>
              )}
              .
            </p>

            <div className="drawer-device-list">
              {group.map((a) => {
                const status = statusOf(a);
                const pctOfSafe = Math.round((a.currentWatt / a.safeWatt) * 100);
                return (
                  <div key={a.id} className={`drawer-device ${status}`}>
                    <div className="drawer-device-top">
                      <span className={`status-dot ${status}`} />
                      <span>{a.room} {a.homeName ? `· ${a.homeName}` : ""}</span>
                      <span className={`appliance-row-status ${status}`}>
                        {status === "anomalous" ? "Anomali" : status === "warn" ? "Sınırda" : "Normal"}
                      </span>
                    </div>
                    <div className="drawer-device-watt">
                      <span className="mono big">{a.currentWatt}W</span>
                      <span className="mono muted">/ {a.safeWatt}W güvenli sınır</span>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{
                          width: `${Math.min(100, pctOfSafe)}%`,
                          background: status === "ok" ? "var(--current)" : status === "warn" ? "var(--volt)" : "var(--danger)",
                        }}
                      />
                    </div>
                    {a.isAnomalous && (
                      <p className="drawer-device-note">
                        Bu cihaz {a.breachStreak} ardışık ölçümde güvenli sınırı aştı. Sisteme bağlı e-posta adresine
                        AI tarafından uyarı gönderildi.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
