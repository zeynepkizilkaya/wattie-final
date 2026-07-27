import { homesSeed, nextId, applianceCatalog, mockAutomationRules } from "./mockData";

// VoltWise Core hazır olduğunda VITE_API_BASE tanımlanarak gerçek uçlara geçilir.
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || "";
const USE_MOCK = !API_BASE;

// ---- in-memory mock "veritabanı" (sayfa yenilenene kadar kalıcı) ----
let db = JSON.parse(JSON.stringify(homesSeed));
let automationDb = mockAutomationRules("home-1");

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function simulateDrift() {
  // Apache Ignite telemetri polling simülasyonu
  db.forEach((home) => {
    home.appliances.forEach((a) => {
      const delta = (Math.random() - 0.48) * a.safeWatt * 0.06;
      a.currentWatt = Math.max(5, Math.round(a.currentWatt + delta));
      if (a.currentWatt > a.safeWatt) {
        a.breachStreak = Math.min(9, a.breachStreak + (Math.random() > 0.6 ? 1 : 0));
      } else if (Math.random() > 0.5) {
        a.breachStreak = Math.max(0, a.breachStreak - 1);
      }
      a.isAnomalous = a.breachStreak >= 3;
    });

    home.usedKwh = Math.round((home.usedKwh + Math.random() * 0.3) * 10) / 10;
    home.usedTry = Math.round(home.usedKwh * 6);

    const ratio = home.usedKwh / home.quotaKwh;
    if (ratio >= 1.0) {
      home.tariffState = "PENALTY";
    } else if (ratio >= 0.8) {
      home.tariffState = "WARNING";
    } else {
      home.tariffState = "NORMAL";
    }
  });
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = "";
      try {
        const json = JSON.parse(text);
        message = json.message || json.error || "";
      } catch {
        message = "";
      }
      throw new ApiError(message || "Sunucudan geçerli bir yanıt alınamadı. Lütfen tekrar deneyin.", res.status);
    }
    if (res.status === 204) return undefined;
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.", 0);
  }
}

// Transform raw backend data into frontend Home type format
export function transformHome(raw, status, appliances, breachStates) {
  const totalKwh = status?.totalKwh ?? 0;
  const totalCost = status?.totalCost ?? 0;
  const penaltyActive = status?.penaltyActive ?? false;

  const kwhRatio = raw.powerQuotaKwh > 0 ? totalKwh / raw.powerQuotaKwh : 0;
  const costRatio = raw.financialQuota > 0 ? totalCost / raw.financialQuota : 0;
  const quotaUsagePercent = Math.max(kwhRatio, costRatio) * 100;

  return {
    id: String(raw.id),
    name: raw.name,
    address: raw.address,
    contactEmail: raw.contactEmail,
    powerQuotaKwh: raw.powerQuotaKwh,
    financialQuota: raw.financialQuota,
    normalTariffRate: raw.normalTariffRate,
    penaltyTariffRate: raw.penaltyTariffRate,
    quotaUsagePercent,
    totalConsumptionKwh: totalKwh,
    billingAmountTry: totalCost,
    penaltyActive,
    usedKwh: totalKwh,
    usedTry: totalCost,
    quotaKwh: raw.powerQuotaKwh,
    quotaTry: raw.financialQuota,
    tariffState: penaltyActive ? "PENALTY" : quotaUsagePercent >= 80 ? "WARNING" : "NORMAL",
    appliances: appliances.map((a) => ({
      id: String(a.id),
      name: a.name,
      type: a.type,
      safeWatt: a.safeLimitWatts,
      safeLimit: a.safeLimitWatts,
      currentWatt: 0,
      consecutiveBreaches: breachStates?.get(String(a.id)) ?? 0,
      breachStreak: breachStates?.get(String(a.id)) ?? 0,
      isAnomalous: (breachStates?.get(String(a.id)) ?? 0) >= 3,
    })),
    createdAt: raw.createdAt,
  };
}

export const api = {
  async login(email, password) {
    if (USE_MOCK) {
      await wait(650);
      const ok = email.trim().length > 3 && password.length >= 8;
      if (!ok) throw new ApiError("E-posta veya şifre hatalı. Şifre en az 8 karakter olmalıdır.", 401);
      return { token: "mock-jwt-token", user: { email } };
    }
    return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },

  async getHomes() {
    if (USE_MOCK) {
      await wait(500);
      simulateDrift();
      return JSON.parse(JSON.stringify(db));
    }
    return request("/homes");
  },

  async getHomeStatus(homeId) {
    if (USE_MOCK) {
      await wait(350);
      simulateDrift();
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      return {
        homeId: home.id,
        totalKwh: home.usedKwh,
        totalCost: home.usedTry,
        penaltyActive: home.tariffState === "PENALTY",
      };
    }
    return request(`/homes/${encodeURIComponent(homeId)}/status`);
  },

  async getHomeDetail(homeId) {
    if (USE_MOCK) {
      await wait(350);
      simulateDrift();
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      return JSON.parse(JSON.stringify(home));
    }
    return request(`/homes/${encodeURIComponent(homeId)}`);
  },

  async getHomeHistory(homeId) {
    if (USE_MOCK) {
      await wait(400);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      return home.dailyHistory;
    }
    return request(`/homes/${encodeURIComponent(homeId)}/trend`);
  },

  async getHomeEvents(homeId) {
    if (USE_MOCK) {
      await wait(400);
      const home = db.find((h) => h.id === homeId);
      return [
        {
          id: "evt-1",
          eventType: home?.tariffState === "PENALTY" ? "PENALTY_ACTIVATED" : "QUOTA_80",
          details: `${home?.name || "Konut"} için %80 kota eşiği aşıldı.`,
          aiRecommendation: "Klima ve fırın yükünü dengeleyin.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "evt-2",
          eventType: "ANOMALY_DETECTED",
          details: "Mutfak Buzdolabı 3 ardışık periyotta yüksek akım çekti.",
          aiRecommendation: "Kompresör filtresini kontrol edin.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }
    return request(`/homes/${encodeURIComponent(homeId)}/events`);
  },

  async registerHome(payload) {
    if (USE_MOCK) {
      await wait(600);
      if (!payload.name || !payload.address || !payload.contactEmail) {
        throw new ApiError("Lütfen ev adı, adres ve iletişim e-postasını eksiksiz doldurun.", 400);
      }
      const quotaKwh = Number(payload.quotaKwh) || 300;
      const quotaTry = Number(payload.quotaTry) || 1800;
      const newHome = {
        id: `home-${db.length + 1}`,
        name: payload.name,
        ownerName: payload.ownerName || "Zeynep",
        contactEmail: payload.contactEmail,
        address: payload.address,
        quotaKwh,
        usedKwh: 12,
        quotaTry,
        usedTry: 72,
        tariffState: "NORMAL",
        appliances: [
          {
            id: nextId(),
            name: "Televizyon",
            room: "Oturma Odası",
            icon: "tv",
            safeWatt: 180,
            currentWatt: 85,
            breachStreak: 0,
            isAnomalous: false,
            in3D: true,
          },
          {
            id: nextId(),
            name: "Buzdolabı",
            room: "Mutfak",
            icon: "fridge",
            safeWatt: 220,
            currentWatt: 110,
            breachStreak: 0,
            isAnomalous: false,
            in3D: true,
          },
        ],
        dailyHistory: [
          { date: "01/07", kwh: 12 },
          { date: "02/07", kwh: 14 },
          { date: "03/07", kwh: 11 },
        ],
        advisories: [],
      };
      db.push(newHome);
      return JSON.parse(JSON.stringify(newHome));
    }
    return request("/homes", { method: "POST", body: JSON.stringify(payload) });
  },

  async addAppliance(homeId, appliance) {
    if (USE_MOCK) {
      await wait(500);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      const created = {
        id: nextId(),
        name: appliance.name,
        room: appliance.room || "Genel",
        icon: appliance.icon || "plug",
        safeWatt: Number(appliance.safeWatt || appliance.safeLimitWatts || 500),
        currentWatt: Math.round(Number(appliance.safeWatt || appliance.safeLimitWatts || 500) * 0.4),
        breachStreak: 0,
        isAnomalous: false,
        in3D: false,
      };
      home.appliances.push(created);
      return created;
    }
    return request(`/homes/${encodeURIComponent(homeId)}/appliances`, { method: "POST", body: JSON.stringify(appliance) });
  },

  async deleteAppliance(homeId, applianceId) {
    if (USE_MOCK) {
      await wait(400);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      home.appliances = home.appliances.filter((a) => a.id !== applianceId);
      return { success: true };
    }
    return request(`/homes/${encodeURIComponent(homeId)}/appliances/${applianceId}`, { method: "DELETE" });
  },

  async fetchAdvisory(homeId) {
    if (USE_MOCK) {
      await wait(700);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);

      const isHigh = home.tariffState !== "NORMAL";
      const sampleAdv = {
        id: nextId(),
        createdAt: new Date().toISOString(),
        subject: isHigh
          ? "Yapay Zeka Bütçe Koruma & Otomasyon Önerisi"
          : "Yapay Zeka Tasarruf & Verimlilik Tavsiyesi",
        body: isHigh
          ? `${home.name} için anlık güç çekim yoğunluğu tespit edildi. Fırın ve Klima cihazlarının eşzamanlı çalıştırılması pik yük oluşturuyor. Akıllı priz otomasyonu ile klimayı 24°C sabit moda alarak aylık ₺320 tasarruf sağlayabilirsiniz.`
          : `${home.name} tüketim profili stabil seyrediyor. Bekleme modundaki medya cihazlarını gece 01:00-06:00 arası kapatarak %4 ek enerji verimliliği elde edebilirsiniz.`,
        triggeredBy: isHigh ? "QUOTA_BREACH_80" : "OPTIMIZATION_TIP",
      };

      home.advisories.unshift(sampleAdv);
      return sampleAdv;
    }
    return request(`/homes/${encodeURIComponent(homeId)}/advisory/generate`, { method: "POST" });
  },

  async getAllDevices() {
    if (USE_MOCK) {
      await wait(400);
      simulateDrift();
      const all = [];
      db.forEach((h) => {
        h.appliances.forEach((a) => {
          all.push({
            ...a,
            homeId: h.id,
            homeName: h.name,
          });
        });
      });
      return JSON.parse(JSON.stringify(all));
    }
    return request("/devices");
  },

  // ---- Automation API Endpoints ----
  async getAutomationRules(homeId) {
    if (USE_MOCK) {
      await wait(400);
      return JSON.parse(JSON.stringify(automationDb));
    }
    return request(`/automation/${homeId}/rules`);
  },

  async createAutomationRule(homeId, rule) {
    if (USE_MOCK) {
      await wait(500);
      const newRule = {
        id: `rule-${automationDb.length + 1}`,
        name: rule.name,
        description: rule.description,
        trigger: rule.trigger,
        icon: rule.icon || "⚙️",
        targetDeviceCount: rule.targetDeviceCount || 1,
        estimatedSaving: rule.estimatedSaving || 50,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      automationDb.unshift(newRule);
      return JSON.parse(JSON.stringify(newRule));
    }
    return request(`/automation/${homeId}/rules`, { method: "POST", body: JSON.stringify(rule) });
  },

  async toggleAutomationRule(homeId, ruleId) {
    if (USE_MOCK) {
      await wait(300);
      const rule = automationDb.find((r) => r.id === ruleId);
      if (rule) {
        rule.status = rule.status === "active" ? "paused" : "active";
      }
      return JSON.parse(JSON.stringify(rule));
    }
    return request(`/automation/${homeId}/rules/${ruleId}/toggle`, { method: "PATCH" });
  },

  async deleteAutomationRule(homeId, ruleId) {
    if (USE_MOCK) {
      await wait(300);
      automationDb = automationDb.filter((r) => r.id !== ruleId);
      return { success: true };
    }
    return request(`/automation/${homeId}/rules/${ruleId}`, { method: "DELETE" });
  },
};

export { ApiError, applianceCatalog };
