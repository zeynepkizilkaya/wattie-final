import { useAppStore } from "../../store/useAppStore";

export default function HomeSelector({ homes = [], onAddHomeClick }) {
  const selectedHomeId = useAppStore((s) => s.selectedHomeId);
  const selectHome = useAppStore((s) => s.selectHome);
  const clearSelectedHome = useAppStore((s) => s.clearSelectedHome);

  const totalKwh = homes.reduce((sum, h) => sum + (h.usedKwh || 0), 0);
  const totalKw = (totalKwh / 100).toFixed(2);

  return (
    <div className="home-selector-bar">
      <button
        type="button"
        className="add-home-btn"
        onClick={onAddHomeClick}
      >
        + Konut Ekle
      </button>

      <div
        className={`home-chip ${selectedHomeId === null ? "active" : ""}`}
        onClick={() => clearSelectedHome()}
      >
        <div className="chip-header">
          <span className="chip-dot all" />
          <span className="chip-title">Tüm Evler</span>
        </div>
        <div className="chip-sub mono">{totalKw} kW Toplam</div>
        <span className="chip-badge normal">Genel Özeti 3D Gör</span>
      </div>

      {homes.map((h) => {
        const isSelected = selectedHomeId === h.id;
        const quotaPct = Math.min(
          100,
          Math.round((h.usedKwh / (h.quotaKwh || 1)) * 100)
        );
        const isPenalty = h.tariffState === "PENALTY" || quotaPct >= 100;
        const isWarning =
          h.tariffState === "WARNING" || (quotaPct >= 80 && !isPenalty);

        return (
          <div
            key={h.id}
            className={`home-chip ${isSelected ? "active" : ""} ${
              isPenalty ? "penalty" : isWarning ? "warning" : "normal"
            }`}
            onClick={() => selectHome(h.id)}
          >
            <div className="chip-header">
              <span
                className={`chip-dot ${
                  isPenalty ? "penalty" : isWarning ? "warning" : "normal"
                }`}
              />
              <span className="chip-title">{h.name}</span>
            </div>
            <div className="chip-sub mono">
              {h.usedKwh} kWh / {h.quotaKwh}
            </div>
            <span
              className={`chip-badge ${
                isPenalty ? "penalty" : isWarning ? "warning" : "normal"
              }`}
            >
              {isPenalty
                ? "Ceza Tarifesi"
                : isWarning
                ? "%80 Uyarısı"
                : "Normal"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
