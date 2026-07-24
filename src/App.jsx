import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import ToastStack from "./components/shared/ToastStack";

const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const HomeDetailPage = lazy(() => import("./components/home-detail/HomeDetailPage"));

function RouteFallback() {
  return <div className="route-fallback mono">yükleniyor…</div>;
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
          <Route
            path="/"
            element={
              <RedirectIfAuthed>
                <LandingPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/home/:homeId"
            element={
              <RequireAuth>
                <HomeDetailPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastStack />
    </BrowserRouter>
  );
}
