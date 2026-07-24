import { create } from "zustand";

let toastId = 0;

export const useAppStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,

  toasts: [],
  pushToast: (message, tone = "info") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  login: (user) => set({ isAuthenticated: true, user }),
  loginAsDemo: () =>
    set({
      isAuthenticated: true,
      user: { email: "demo@wattie.ai", name: "Demo Kullanıcı" },
    }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
