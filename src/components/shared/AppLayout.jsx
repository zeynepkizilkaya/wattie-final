import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationDropdown from "./NotificationDropdown";
import { useAppStore } from "../../store/useAppStore";
import { api } from "../../lib/api";
import "./app-layout.css";

export default function AppLayout() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const selectHome = useAppStore((s) => s.selectHome);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [homesData, setHomesData] = useState([]);
  const searchContainerRef = useRef(null);

  const navigate = useNavigate();

  // Load homes data for real-time search
  useEffect(() => {
    api.getHomes().then((data) => {
      setHomesData(data || []);
    }).catch(() => {});
  }, []);

  // Filter search items dynamically
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    homesData.forEach((home) => {
      if (home.name?.toLowerCase().includes(q) || home.address?.toLowerCase().includes(q)) {
        results.push({
          type: "home",
          title: home.name,
          subtitle: `${home.address || "Akıllı Konut"} • ${home.usedKwh} kWh`,
          path: `/home/${home.id}`,
          homeId: home.id,
        });
      }

      if (home.appliances) {
        home.appliances.forEach((app) => {
          if (app.name?.toLowerCase().includes(q) || app.room?.toLowerCase().includes(q) || app.type?.toLowerCase().includes(q)) {
            results.push({
              type: "device",
              title: `${app.name} (${app.room})`,
              subtitle: `${home.name} • ${(app.currentWatt / 1000).toFixed(2)} kW`,
              path: "/devices",
              homeId: home.id,
            });
          }
        });
      }
    });

    if ("otomasyon".includes(q) || "kural".includes(q)) {
      results.push({ type: "page", title: "Otomasyon & Kurallar", subtitle: "Akıllı Senaryolar", path: "/automation" });
    }
    if ("enerji".includes(q) || "güneş".includes(q) || "batarya".includes(q)) {
      results.push({ type: "page", title: "Enerji Üretimi & Depolama", subtitle: "Solar & Tesla Powerwall", path: "/energy" });
    }
    if ("analitik".includes(q) || "grafik".includes(q) || "fatura".includes(q)) {
      results.push({ type: "page", title: "Analitik & Fatura Tahmini", subtitle: "Tarife & Tüketim", path: "/analytics" });
    }

    setSearchResults(results.slice(0, 7));
  }, [searchQuery, homesData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (item) => {
    setIsSearching(false);
    setSearchQuery("");
    if (item.homeId) {
      selectHome(item.homeId);
    }
    navigate(item.path);
  };

  return (
    <div className="app-layout-wrapper circuit-bg">
      <Sidebar />

      <div className={`app-main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Top Header Bar */}
        <header className="app-top-header glass-panel">
          <div className="header-left">
            <button
              type="button"
              className="hamburger-toggle-btn mobile-only"
              onClick={toggleMobileMenu}
              aria-label="Menüyü Aç"
              title="Menüyü Aç"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="header-search-container" ref={searchContainerRef}>
              <div className="header-search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Cihaz, ev veya otomasyon ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsSearching(true)}
                />
                {searchQuery && (
                  <button type="button" className="search-clear-btn" onClick={() => setSearchQuery("")}>✕</button>
                )}
              </div>

              {isSearching && (
                <div className="search-results-dropdown glass-panel">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => handleSelectResult(item)}
                      >
                        <div className="result-icon-box">
                          {item.type === "home" ? "🏠" : item.type === "device" ? "⚡" : "📊"}
                        </div>
                        <div className="result-info">
                          <span className="result-title">{item.title}</span>
                          <span className="result-sub">{item.subtitle}</span>
                        </div>
                        <span className="result-arrow">→</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-empty">
                      <span>"{searchQuery}" için sonuç bulunamadı.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <div className="live-status-badge">
              <span className="live-dot" />
              <span className="live-text mono">CANLI VERİ AKIŞI</span>
            </div>

            <button
              type="button"
              className="theme-toggle-header-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>

            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content Body */}
        <main className="app-page-body">
          <Outlet />
        </main>

        {/* Sleek Professional Page Footer */}
        <footer className="app-main-footer glass-panel">
          <div className="footer-left">
            <strong>Wattie Smart Energy</strong>
            <span className="footer-sub mono">© 2026 Voltwise Technology · IoT Enerji İzleme ve Bütçe Denetimi Platformu</span>
          </div>
          <div className="footer-right">
            <span className="footer-status-pill">
              <span className="status-dot green" /> Tüm Sistemler Aktif
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
