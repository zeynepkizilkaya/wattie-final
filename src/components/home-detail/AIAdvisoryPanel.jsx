function formatDate(iso) {
  if (!iso) {
    return "-";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const triggerLabel = {
  QUOTA_BREACH_80: "Kota %80 uyarısı",
  QUOTA_BREACH_100: "Kota %100 aşımı",
  DEVICE_ANOMALY: "Cihaz anomalisi",

  // Backend EventLog değerleri
  PENALTY_ACTIVATED: "Kota %100 aşımı",
  ANOMALY_DETECTED: "Cihaz anomalisi",
  QUOTA_80: "Kota %80 uyarısı",
};

export default function AIAdvisoryPanel({
  advisories = [],
  events = [],
  contactEmail,
}) {
  /*
   * Frontend'in eski yapısı:
   * advisories = [
   *   {
   *     id,
   *     triggeredBy,
   *     createdAt,
   *     subject,
   *     body
   *   }
   * ]
   *
   * Backend'in mevcut EventLog yapısı:
   * events = [
   *   {
   *     id,
   *     eventType,
   *     details,
   *     aiRecommendation,
   *     createdAt
   *   }
   * ]
   *
   * İkisini de destekliyoruz.
   */

  const normalizedAdvisories = [
    ...(Array.isArray(advisories)
      ? advisories.slice(0, 5).map((adv) => ({
          id: adv.id,
          triggeredBy: adv.triggeredBy,
          createdAt: adv.createdAt,
          subject:
            adv.subject ||
            "AI Tasarruf Önerisi",
          body:
            adv.body ||
            adv.aiRecommendation ||
            adv.details ||
            "",
        }))
      : []),

    ...(Array.isArray(events)
      ? events.map((event) => ({
          id: `event-${event.id}`,
          triggeredBy:
            event.eventType,
          createdAt:
            event.createdAt,
          subject:
            "Wattie AI Enerji Önerisi",
          body:
            event.aiRecommendation ||
            event.details ||
            "",
        }))
      : []),
  ];

  return (
    <div className="advisory-panel glass-panel">
      <div className="advisory-header">
        <h3>AI Tasarruf Önerileri</h3>

        <span className="mono muted">
          → {contactEmail || "E-posta tanımlı değil"}
        </span>
      </div>

      {normalizedAdvisories.length === 0 && (
        <p className="appliance-empty">
          Henüz gönderilmiş bir AI önerisi yok.
          Kota veya cihaz eşiği aşıldığında burada
          listelenecek.
        </p>
      )}

      <div className="advisory-list">
        {normalizedAdvisories.map((adv) => (
          <div
            key={adv.id}
            className="advisory-item"
          >
            <div className="advisory-item-head">
              <span className="advisory-trigger">
                {triggerLabel[adv.triggeredBy] ||
                  "Bildirim"}
              </span>

              <span className="mono muted">
                {formatDate(adv.createdAt)}
              </span>
            </div>

            <h4>
              {adv.subject}
            </h4>

            <p>
              {adv.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}