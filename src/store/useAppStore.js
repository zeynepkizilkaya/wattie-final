import { create } from "zustand";
import { mockNotifications } from "../lib/mockData";

let toastId = 0;

export const useAppStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,

  // Theme & Appearance State
  theme: localStorage.getItem("wattie_theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("wattie_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  accentColor: localStorage.getItem("wattie_accent") || "purple",
  setAccentColor: (color) => {
    localStorage.setItem("wattie_accent", color);
    const hexMap = {
      purple: "#7c9eff",
      blue: "#3b82f6",
      green: "#10b981",
      orange: "#f59e0b",
    };
    document.documentElement.style.setProperty("--arc", hexMap[color] || "#7c9eff");
    set({ accentColor: color });
  },

  // Home Selection System State (null = All Homes Aggregate)
  selectedHomeId: null,
  selectHome: (id) => set({ selectedHomeId: id }),
  clearSelectedHome: () => set({ selectedHomeId: null }),

  // Sidebar & Navigation State
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // System & Preference Settings
  pollInterval: Number(localStorage.getItem("wattie_poll")) || 2000,
  setPollInterval: (ms) => {
    localStorage.setItem("wattie_poll", String(ms));
    set({ pollInterval: ms });
  },
  notificationSettings: {
    email: true,
    quotaWarning: true,
    quotaBreach: true,
    deviceAnomaly: true,
    aiRecommendation: true,
  },
  updateNotificationSetting: (key, value) =>
    set((s) => ({
      notificationSettings: { ...s.notificationSettings, [key]: value },
    })),
  animationsEnabled: true,
  toggleAnimations: () => set((s) => ({ animationsEnabled: !s.animationsEnabled })),

  // Notification State
  notifications: mockNotifications(),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  // Toast System
  toasts: [],
  pushToast: (message, tone = "info") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Profile Update
  updateUser: (updated) => set((s) => ({ user: { ...s.user, ...updated } })),

  // Authentication
  login: (user) => set({ isAuthenticated: true, user }),
  loginAsDemo: () =>
    set({
      isAuthenticated: true,
      user: { email: "demo@wattie.ai", name: "Zeynep" },
    }),
  logout: () => set({ isAuthenticated: false, user: null, selectedHomeId: null }),
}));
