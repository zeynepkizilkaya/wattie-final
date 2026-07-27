// Mock veri kaynağı — VoltWise Core & Wattie AI platformu için zenginleştirilmiş mock veriler

let idCounter = 1000;
export const nextId = () => `dev-${idCounter++}`;

const applianceTypes = [
  { type: "Televizyon", room: "Oturma Odası", safeWatt: 180, icon: "tv" },
  { type: "Buzdolabı", room: "Mutfak", safeWatt: 220, icon: "fridge" },
  { type: "Klima", room: "Yatak Odası", safeWatt: 1400, icon: "ac" },
  { type: "Çamaşır Makinesi", room: "Banyo", safeWatt: 900, icon: "washer" },
  { type: "Fırın", room: "Mutfak", safeWatt: 2000, icon: "oven" },
  { type: "Aydınlatma", room: "Oturma Odası", safeWatt: 60, icon: "light" },
];

function makeAppliance(type, room, safeWatt, icon, overrides = {}) {
  const currentWatt = overrides.currentWatt ?? Math.round(safeWatt * (0.4 + Math.random() * 0.5));
  const breachStreak = overrides.breachStreak ?? 0;
  return {
    id: nextId(),
    name: type,
    room,
    icon,
    safeWatt,
    currentWatt,
    breachStreak,
    isAnomalous: breachStreak >= 3,
    in3D: true,
    ...overrides,
  };
}

export const homesSeed = [
  {
    id: "home-1",
    name: "Sahil Villası",
    ownerName: "Elif Yıldız",
    contactEmail: "elif.yildiz@example.com",
    address: "Karşıyaka, İzmir",
    quotaKwh: 420,
    usedKwh: 468,
    quotaTry: 2400,
    usedTry: 2760,
    tariffState: "PENALTY", // > 100%
    appliances: [
      makeAppliance("Televizyon", "Oturma Odası", 180, "tv", { id: "app-tv-1", currentWatt: 210, breachStreak: 4, isAnomalous: true }),
      makeAppliance("Televizyon", "Yatak Odası", 140, "tv", { id: "app-tv-2", currentWatt: 90, breachStreak: 0 }),
      makeAppliance("Buzdolabı", "Mutfak", 220, "fridge", { id: "app-fridge-1" }),
      makeAppliance("Klima", "Yatak Odası", 1400, "ac", { id: "app-ac-1", currentWatt: 1650, breachStreak: 5, isAnomalous: true }),
      makeAppliance("Çamaşır Makinesi", "Banyo", 900, "washer", { id: "app-wash-1" }),
    ],
    dailyHistory: genHistory(58),
    advisories: [
      {
        id: "adv-1",
        createdAt: daysAgo(0),
        subject: "Bütçe aşımı ve klima anomalisi bildirimi",
        body:
          "Merhaba Elif Hanım, Sahil Villası bu ay bütçe kotasının %111'ini kullandı ve ceza tarifesine geçildi. Yatak odasındaki klima son 5 ölçüm periyodunda güvenli sınırın üzerinde çalışıyor; filtre bakımı veya termostat ayarını 24°C'nin üzerine çekmenizi öneririz. Ayrıca oturma odasındaki televizyonun bekleme modunda dahi yüksek tüketim gösterdiği tespit edildi, kullanılmadığında fişten çekilmesi tavsiye edilir.",
        triggeredBy: "QUOTA_BREACH_100",
      },
    ],
  },
  {
    id: "home-2",
    name: "Bahçeli Ev",
    ownerName: "Mert Kaya",
    contactEmail: "mert.kaya@example.com",
    address: "Çankaya, Ankara",
    quotaKwh: 300,
    usedKwh: 255, // 85% Warning threshold
    quotaTry: 1800,
    usedTry: 1530,
    tariffState: "WARNING", // 80% - 99%
    appliances: [
      makeAppliance("Televizyon", "Oturma Odası", 180, "tv", { id: "app2-tv-1" }),
      makeAppliance("Buzdolabı", "Mutfak", 220, "fridge", { id: "app2-fridge-1" }),
      makeAppliance("Aydınlatma", "Oturma Odası", 60, "light", { id: "app2-light-1" }),
      makeAppliance("Fırın", "Mutfak", 2000, "oven", { id: "app2-oven-1" }),
    ],
    dailyHistory: genHistory(28),
    advisories: [
      {
        id: "adv-80",
        createdAt: daysAgo(0),
        subject: "Kota %85 Seviyesine Ulaştı",
        body:
          "Merhaba Mert Bey, Bahçeli Ev için tanımlanan aylık kotanın %85'ine ulaşıldı. Bütçe aşımı riskine karşı gereksiz aydınlatmaları ve fırın kullanım saatlerini akşam 22:00 sonrasına kaydırmanızı öneririz.",
        triggeredBy: "QUOTA_BREACH_80",
      },
    ],
  },
  {
    id: "home-3",
    name: "Şehir Merkezi Dairesi",
    ownerName: "Aylin Demir",
    contactEmail: "aylin.demir@example.com",
    address: "Kadıköy, İstanbul",
    quotaKwh: 250,
    usedKwh: 268,
    quotaTry: 1500,
    usedTry: 1608,
    tariffState: "PENALTY",
    appliances: [
      makeAppliance("Televizyon", "Oturma Odası", 180, "tv", { id: "app3-tv-1", currentWatt: 205, breachStreak: 3, isAnomalous: true }),
      makeAppliance("Buzdolabı", "Mutfak", 220, "fridge", { id: "app3-fridge-1" }),
      makeAppliance("Çamaşır Makinesi", "Banyo", 900, "washer", { id: "app3-wash-1" }),
    ],
    dailyHistory: genHistory(31),
    advisories: [
      {
        id: "adv-2",
        createdAt: daysAgo(1),
        subject: "Kota eşiği %80 uyarısı",
        body:
          "Merhaba Aylin Hanım, dairenizin aylık enerji bütçesinin %80'ine ulaşıldı. Oturma odasındaki televizyonun ortalamanın üzerinde güç çektiği görülüyor; ekran parlaklığını azaltmanız ay sonuna kadar bütçenizi korumanıza yardımcı olabilir.",
        triggeredBy: "QUOTA_BREACH_80",
      },
    ],
  },
  {
    id: "home-4",
    name: "Yayla Bungalov",
    ownerName: "Deniz Aksoy",
    contactEmail: "deniz.aksoy@example.com",
    address: "Uludağ, Bursa",
    quotaKwh: 180,
    usedKwh: 96,
    quotaTry: 1100,
    usedTry: 588,
    tariffState: "NORMAL",
    appliances: [
      makeAppliance("Aydınlatma", "Oturma Odası", 60, "light", { id: "app4-light-1" }),
      makeAppliance("Buzdolabı", "Mutfak", 220, "fridge", { id: "app4-fridge-1" }),
    ],
    dailyHistory: genHistory(14),
    advisories: [],
  },
  {
    id: "home-5",
    name: "Loft Daire",
    ownerName: "Selin Arslan",
    contactEmail: "selin.arslan@example.com",
    address: "Beşiktaş, İstanbul",
    quotaKwh: 260,
    usedKwh: 179,
    quotaTry: 1560,
    usedTry: 1074,
    tariffState: "NORMAL",
    appliances: [
      makeAppliance("Televizyon", "Oturma Odası", 180, "tv", { id: "app5-tv-1" }),
      makeAppliance("Fırın", "Mutfak", 2000, "oven", { id: "app5-oven-1" }),
      makeAppliance("Klima", "Yatak Odası", 1400, "ac", { id: "app5-ac-1" }),
    ],
    dailyHistory: genHistory(22),
    advisories: [],
  },
];

function genHistory(baseKwh) {
  const days = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = 0.75 + Math.random() * 0.5;
    days.push({
      date: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
      kwh: Math.round((baseKwh / 14) * noise * 10) / 10,
    });
  }
  return days;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const applianceCatalog = applianceTypes;

export function mockRoomHistory(homeId, roomName) {
  const now = new Date();
  const history = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    history.push({
      date: d.toLocaleDateString("tr-TR", { weekday: "short" }),
      kwh: Number((1.5 + Math.random() * 3.2).toFixed(1)),
    });
  }
  return history;
}

export function mockAutomationRules(homeId) {
  return [
    {
      id: "rule-1",
      name: "Gece Tarifesi Optimizasyonu",
      description: "Çamaşır ve bulaşık makinelerini 22:00-06:00 arasında düşük tarifede çalıştır.",
      trigger: "Zamanlama (22:00 - 06:00)",
      icon: "⚡",
      targetDeviceCount: 2,
      estimatedSaving: 45,
      status: "active",
      createdAt: daysAgo(2),
    },
    {
      id: "rule-2",
      name: "Klima Sıcaklık Limiti",
      description: "Klima 24°C altına düşürülemesin, dış ortam > 30°C ise 26°C sabit tut.",
      trigger: "Sıcaklık Eşiği (>30°C)",
      icon: "🌡️",
      targetDeviceCount: 1,
      estimatedSaving: 78,
      status: "active",
      createdAt: daysAgo(5),
    },
    {
      id: "rule-3",
      name: "Kota Aşımı Acil Kesme",
      description: "Aylık bütçe %100 aşıldığında kritik olmayan aydınlatma ve televizyonu otomatik kapat.",
      trigger: "Kota Aşımı (%100)",
      icon: "🔴",
      targetDeviceCount: 4,
      estimatedSaving: 120,
      status: "paused",
      createdAt: daysAgo(10),
    },
  ];
}

export function mockAutomationPerformance(homeId) {
  return {
    monthlySaving: 243,
    activeRules: 18,
    blockedBreaches: 3,
    trend: [
      { month: "Oca", saving: 180 },
      { month: "Şub", saving: 210 },
      { month: "Mar", saving: 195 },
      { month: "Nis", saving: 230 },
      { month: "May", saving: 260 },
      { month: "Haz", saving: 243 },
    ],
  };
}

export function mockEnergySources(homeId) {
  return {
    solar: { kw: 3.2, pct: 78, dailyKwh: 18.4, status: "active" },
    battery: { kw: 2.1, pct: 62, capacityKwh: 12.0, status: "charging" },
    grid: { kw: 0.8, pct: 20, status: "importing" },
    evCharger: { kw: 1.4, status: "charging", vehicle: "Tesla Model Y" },
  };
}

export function mockEnergyFlow(homeId) {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, "0")}:00`;
    const isDay = h >= 7 && h <= 19;
    const solar = isDay ? Math.sin(((h - 7) / 12) * Math.PI) * 4.2 + (Math.random() * 0.4) : 0;
    const consumption = 1.2 + Math.sin((h / 24) * Math.PI * 2) * 0.8 + (Math.random() * 0.5);
    const battery = solar > consumption ? Math.min(2.5, solar - consumption) : -Math.min(1.5, consumption - solar);
    const grid = Math.max(0, consumption - solar - Math.max(0, -battery));

    hours.push({
      hour: timeStr,
      consumption: Number(consumption.toFixed(2)),
      solar: Number(solar.toFixed(2)),
      battery: Number(battery.toFixed(2)),
      grid: Number(grid.toFixed(2)),
    });
  }
  return hours;
}

export function mockWeather() {
  return {
    temp: 24,
    condition: "Parçalı Bulutlu",
    wind: "12 km/s",
    uvIndex: 4,
    humidity: "%54",
    icon: "partly-cloudy",
  };
}

export function mockNotifications() {
  return [
    {
      id: "notif-1",
      type: "penalty",
      title: "Ceza Tarifesi Uyarısı",
      message: "Sahil Villası bütçe kotasını %111 aştı.",
      time: "10 dk önce",
      read: false,
    },
    {
      id: "notif-2",
      type: "warning",
      title: "Kota %85 Eşiği",
      message: "Bahçeli Ev aylık kotalarının %85'ine ulaştı.",
      time: "45 dk önce",
      read: false,
    },
    {
      id: "notif-3",
      type: "anomaly",
      title: "Cihaz Anomalisi Tespit Edildi",
      message: "Yatak odası kliması yüksek watt çekiyor (1650W).",
      time: "2 saat önce",
      read: true,
    },
  ];
}

export function mockAnalytics(range = "30d") {
  const multiplier = range === "7d" ? 0.25 : range === "90d" ? 3.0 : 1.0;
  return {
    homeComparison: [
      { name: "Sahil Villası", kwh: Math.round(468 * multiplier), cost: Math.round(2760 * multiplier), status: "PENALTY" },
      { name: "Bahçeli Ev", kwh: Math.round(255 * multiplier), cost: Math.round(1530 * multiplier), status: "WARNING" },
      { name: "Şehir Merkezi", kwh: Math.round(268 * multiplier), cost: Math.round(1608 * multiplier), status: "PENALTY" },
      { name: "Loft Daire", kwh: Math.round(179 * multiplier), cost: Math.round(1074 * multiplier), status: "NORMAL" },
      { name: "Yayla Bungalov", kwh: Math.round(96 * multiplier), cost: Math.round(588 * multiplier), status: "NORMAL" },
    ],
    categoryBreakdown: [
      { category: "İklimlendirme (Klima)", value: 42, color: "#ffc93c" },
      { category: "Mutfak (Fırın/Buzdolabı)", value: 28, color: "#7c9eff" },
      { category: "Yıkama & Çamaşır", value: 18, color: "#3ddc97" },
      { category: "Aydınlatma & Diğer", value: 12, color: "#aeb4c2" },
    ],
  };
}

export function mockAdvisoryHistory() {
  return [
    {
      id: "adv-hist-1",
      homeId: "home-1",
      homeName: "Sahil Villası",
      createdAt: daysAgo(0),
      subject: "Bütçe aşımı ve klima anomalisi bildirimi",
      body: "Sahil Villası bu ay bütçe kotasının %111'ini kullandı. Klimanızı 24°C seviyesine getirin.",
      triggeredBy: "QUOTA_BREACH_100",
    },
    {
      id: "adv-hist-2",
      homeId: "home-2",
      homeName: "Bahçeli Ev",
      createdAt: daysAgo(0),
      subject: "Kota %85 Seviyesine Ulaştı",
      body: "Bahçeli Ev bütçesinin %85'ine ulaştı. Yüksek güçlü cihaz kullanımını akşam saatlerine kaydırın.",
      triggeredBy: "QUOTA_BREACH_80",
    },
    {
      id: "adv-hist-3",
      homeId: "home-1",
      homeName: "Sahil Villası",
      createdAt: daysAgo(1),
      subject: "Televizyon Bekleme Modu Tüketimi",
      body: "Televizyon bekleme modunda saatte 15W çekiyor. Gece saatlerinde fişten çekin.",
      triggeredBy: "DEVICE_ANOMALY",
    },
    {
      id: "adv-hist-4",
      homeId: "home-3",
      homeName: "Şehir Merkezi Dairesi",
      createdAt: daysAgo(2),
      subject: "Aylık %80 Kota Eşiği",
      body: "Dairenizin aylık bütçesinin %80'i doldu.",
      triggeredBy: "QUOTA_BREACH_80",
    },
  ];
}
