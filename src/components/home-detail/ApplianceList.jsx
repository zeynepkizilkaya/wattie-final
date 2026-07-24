import { motion, AnimatePresence } from "framer-motion";

function statusOf(a) {
  if (a.isAnomalous) return "anomalous";
  if (a.currentWatt > a.safeWatt) return "warn";
  return "ok";
}

const statusLabel = {
  anomalous: "Anomali",
  warn: "Sınırda",
  ok: "Normal",
};

export default function ApplianceList({ appliances, onSelectAppliance, onDelete, onAddClick }) {
  return (
    <div className="appliance-list glass-panel">
      <div className="appliance-list-header">
        <h3>Eşyalar</h3>
        <button className="btn-small" onClick={onAddClick}>+ Eşya ekle</button>
      </div>
      <div className="appliance-list-scroll">
        <AnimatePresence initial={false}>
          {appliances.map((a) => {
            const status = statusOf(a);
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`appliance-row ${status}`}
              >
                <button className="appliance-row-main" onClick={() => onSelectAppliance(a)}>
                  <span className={`status-dot ${status}`} />
                  <span className="appliance-row-name">
                    {a.name}
                    <small>{a.room}{a.in3D === false ? " · yeni" : ""}</small>
                  </span>
                  <span className="appliance-row-watt mono">{a.currentWatt}W</span>
                  <span className={`appliance-row-status ${status}`}>{statusLabel[status]}</span>
                </button>
                <button
                  className="appliance-row-delete"
                  aria-label={`${a.name} eşyasını sil`}
                  onClick={() => onDelete(a)}
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {appliances.length === 0 && <p className="appliance-empty">Henüz kayıtlı eşya yok.</p>}
      </div>
    </div>
  );
}
