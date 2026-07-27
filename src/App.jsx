import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import ToastStack from "./components/shared/ToastStack";
import AppLayout from "./components/shared/AppLayout";

const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const DevicesPage = lazy(() => import("./components/devices/DevicesPage"));
const RoomsPage = lazy(() => import("./components/rooms/RoomsPage"));
const EnergyPage = lazy(() => import("./components/energy/EnergyPage"));
const AutomationPage = lazy(() => import("./components/automation/AutomationPage"));
const AnalyticsPage = lazy(() => import("./components/analytics/AnalyticsPage"));
const AIAssistantPage = lazy(() => import("./components/ai-assistant/AIAssistantPage"));
const SettingsPage = lazy(() => import("./components/settings/SettingsPage"));
const HomeDetailPage = lazy(() => import("./components/home-detail/HomeDetailPage"));

const HousePageModule = lazy(() =>
  import("./components/home-detail/HousePage").then((m) => ({ default: m.HousePage }))
);

function RouteFallback() {
  return <div className="route-fallback mono">Wattie Sistem Verileri Yükleniyor…</div>;
}

function RequireAuth({ children }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Landing & Login Page */}
          <Route
            path="/"
            element={
              <RedirectIfAuthed>
                <LandingPage />
              </RedirectIfAuthed>
            }
          />

          {/* Fullscreen 3D Kat Planı & Daire İçi Görünümü */}
          <Route
            path="/house"
            element={
              <RequireAuth>
                <HousePageModule />
              </RequireAuth>
            }
          />
          <Route
            path="/house/:homeId"
            element={
              <RequireAuth>
                <HousePageModule />
              </RequireAuth>
            }
          />

          {/* Authenticated Application Layout with Sidebar */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/energy" element={<EnergyPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Single House Detail View with Sidebar */}
            <Route path="/home/:homeId" element={<HomeDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastStack />
    </BrowserRouter>
  );
}
