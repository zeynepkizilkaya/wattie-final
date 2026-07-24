import { motion } from "framer-motion";

function pct(used, quota) {
  return Math.min(100, Math.round((used / quota) * 100));
}

export default function HomeCard({ home, onOpen, index }) {
  const isBreached = home.tariffState === "PENALTY";
  const usage = pct(home.usedKwh, home.quotaKwh);

  return (
    <motion.button
      className={`home-card glass-panel ${isBreached ? "is-breached" : ""}`}
      onClick={() => onOpen(home.id)}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <div className="home-card-top">
        <div>
          <h3>{home.name}</h3>
          <span className="home-card-address">{home.address}</span>
        </div>
        {isBreached && <span className="breach-badge">KOTA AŞILDI</span>}
      </div>

      <div className="home-card-meter">
        <div className="meter-track">
          <motion.div
            className="meter-fill"
            style={{ background: isBreached ? "var(--danger)" : "var(--current)" }}
            initial={{ width: 0 }}
            animate={{ width: `${usage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="meter-labels mono">
          <span>{home.usedKwh} kWh</span>
          <span>{usage}%</span>
          <span>{home.quotaKwh} kWh kota</span>
        </div>
      </div>

      <div className="home-card-footer">
        <span className="mono">{home.usedTry.toLocaleString("tr-TR")} ₺ / ay</span>
        <span className={`tariff-pill ${isBreached ? "danger" : "normal"}`}>
          {isBreached ? "Ceza Tarifesi" : "Normal Tarife"}
        </span>
      </div>
    </motion.button>
  );
}
