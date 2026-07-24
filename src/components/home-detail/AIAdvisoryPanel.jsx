function formatDate(iso) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const triggerLabel = {
  QUOTA_BREACH_80: "Kota %80 uyarısı",
  QUOTA_BREACH_100: "Kota %100 aşımı",
  DEVICE_ANOMALY: "Cihaz anomalisi",
};

export default function AIAdvisoryPanel({ advisories, contactEmail }) {
  return (
    <div className="advisory-panel glass-panel">
      <div className="advisory-header">
        <h3>AI Tasarruf Önerileri</h3>
        <span className="mono muted">→ {contactEmail}</span>
      </div>
      {advisories.length === 0 && (
        <p className="appliance-empty">Henüz gönderilmiş bir AI önerisi yok. Kota veya cihaz eşiği aşıldığında burada listelenecek.</p>
      )}
      <div className="advisory-list">
        {advisories.map((adv) => (
          <div key={adv.id} className="advisory-item">
            <div className="advisory-item-head">
              <span className="advisory-trigger">{triggerLabel[adv.triggeredBy] || "Bildirim"}</span>
              <span className="mono muted">{formatDate(adv.createdAt)}</span>
            </div>
            <h4>{adv.subject}</h4>
            <p>{adv.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
