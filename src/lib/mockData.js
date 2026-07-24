// Mock veri kaynağı — VoltWise Core devreye alındığında bu dosya yerine
// gerçek REST uçları (api.js içindeki fetch çağrıları) kullanılacaktır.
// Alan adları backend dokümanındaki (Home / Appliance / Telemetry / AI Advisory) yapıyla birebir uyumludur.

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
    tariffState: "PENALTY",
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
    usedKwh: 246,
    quotaTry: 1800,
    usedTry: 1476,
    tariffState: "NORMAL",
    appliances: [
      makeAppliance("Televizyon", "Oturma Odası", 180, "tv", { id: "app2-tv-1" }),
      makeAppliance("Buzdolabı", "Mutfak", 220, "fridge", { id: "app2-fridge-1" }),
      makeAppliance("Aydınlatma", "Oturma Odası", 60, "light", { id: "app2-light-1" }),
      makeAppliance("Fırın", "Mutfak", 2000, "oven", { id: "app2-oven-1" }),
    ],
    dailyHistory: genHistory(28),
    advisories: [],
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
