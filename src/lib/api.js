import { homesSeed, nextId, applianceCatalog } from "./mockData";

// VoltWise Core hazır olduğunda VITE_API_BASE tanımlanarak gerçek uçlara geçilir.
// Örn: VITE_API_BASE=http://localhost:8080/api  ->  USE_MOCK otomatik false olur.
const API_BASE = import.meta.env.VITE_API_BASE;
const USE_MOCK = !API_BASE;

// ---- in-memory mock "veritabanı" (sayfa yenilenene kadar kalıcı) ----
let db = JSON.parse(JSON.stringify(homesSeed));

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function simulateDrift() {
  // Apache Ignite'tan gelen yüksek frekanslı telemetri pollingini taklit eder.
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
    home.usedKwh = Math.round((home.usedKwh + Math.random() * 0.4) * 10) / 10;
    home.usedTry = Math.round(home.usedKwh * 6);
    home.tariffState = home.usedKwh > home.quotaKwh ? "PENALTY" : "NORMAL";
  });
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      throw new ApiError("Sunucudan geçerli bir yanıt alınamadı. Lütfen tekrar deneyin.", res.status);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.", 0);
  }
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
      return JSON.parse(JSON.stringify(db)).map((h) => ({
        ...h,
        appliances: undefined,
      }));
    }
    return request("/homes/status");
  },

  async getHomeDetail(homeId) {
    if (USE_MOCK) {
      await wait(350);
      simulateDrift();
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      return JSON.parse(JSON.stringify(home));
    }
    return request(`/homes/${homeId}/status`);
  },

  async getHomeHistory(homeId) {
    if (USE_MOCK) {
      await wait(400);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      return home.dailyHistory;
    }
    return request(`/homes/${homeId}/history`);
  },

  async addAppliance(homeId, appliance) {
    if (USE_MOCK) {
      await wait(500);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      const created = {
        id: nextId(),
        name: appliance.name,
        room: appliance.room,
        icon: appliance.icon || "plug",
        safeWatt: Number(appliance.safeWatt),
        currentWatt: Math.round(Number(appliance.safeWatt) * 0.4),
        breachStreak: 0,
        isAnomalous: false,
        in3D: false,
      };
      home.appliances.push(created);
      return created;
    }
    return request(`/homes/${homeId}/appliances`, { method: "POST", body: JSON.stringify(appliance) });
  },

  async deleteAppliance(homeId, applianceId) {
    if (USE_MOCK) {
      await wait(400);
      const home = db.find((h) => h.id === homeId);
      if (!home) throw new ApiError("Konut bulunamadı.", 404);
      home.appliances = home.appliances.filter((a) => a.id !== applianceId);
      return { success: true };
    }
    return request(`/homes/${homeId}/appliances/${applianceId}`, { method: "DELETE" });
  },
};

export { ApiError, applianceCatalog };
