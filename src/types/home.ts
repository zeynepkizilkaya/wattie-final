export interface Appliance {
  id: string;
  name: string;
  type?: string;
  safeLimit: number;
  currentWatt: number;
  consecutiveBreaches: number;
  createdAt?: string;
}

export interface Home {
  id: string;
  name: string;
  address?: string;
  contactEmail?: string;
  powerQuotaKwh: number;
  financialQuota: number;
  normalTariffRate: number;
  penaltyTariffRate: number;
  quotaUsagePercent: number;
  totalConsumptionKwh: number;
  billingAmountTry: number;
  penaltyActive: boolean;
  appliances: Appliance[];
  createdAt?: string;
}

export interface HomeStatus {
  homeId: number;
  totalKwh: number;
  totalCost: number;
  penaltyActive: boolean;
}

export interface DailyConsumption {
  date: string;
  totalKwh: number;
  totalCost: number;
}

export interface CreateHomeRequest {
  name: string;
  address?: string;
  contactEmail: string;
  powerQuotaKwh: number;
  financialQuota: number;
  normalTariffRate: number;
  penaltyTariffRate: number;
  appliances: { name: string; type?: string; safeLimitWatts: number }[];
}

export interface AddApplianceRequest {
  name: string;
  type?: string;
  safeLimitWatts: number;
}

export interface EventLog {
  id: string;
  eventType: 'QUOTA_80' | 'QUOTA_100' | 'PENALTY_ACTIVATED' | 'ANOMALY_DETECTED';
  details: string;
  aiRecommendation?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  homeId: string;
  homeName: string;
  type: 'quota_warning' | 'quota_breach' | 'anomaly' | 'recommendation';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Recommendation {
  id: string;
  homeId: string;
  type: 'energy_saving' | 'anomaly_alert' | 'quota_warning' | 'general';
  title: string;
  message: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}
