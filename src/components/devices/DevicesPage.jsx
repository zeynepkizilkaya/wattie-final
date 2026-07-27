import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import ApplianceInfoDrawer from "../home-detail/ApplianceInfoDrawer";
import SkeletonCard from "../shared/Skeleton";
import "./devices.css";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [drawerHomeId, setDrawerHomeId] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await api.getAllDevices();
        setDevices(data);
      } catch (err) {
        console.error("Cihazlar alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.homeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "anomalous") return d.isAnomalous;
    if (activeFilter === "warning") return d.currentWatt > d.safeWatt && !d.isAnomalous;
    if (activeFilter === "normal") return d.currentWatt <= d.safeWatt;
    return true;
  });

  const totalAnomalies = devices.filter((d) => d.isAnomalous).length;
  const totalWarnings = devices.filter((d) => d.currentWatt > d.safeWatt && !d.isAnomalous).length;

  const handleDeviceClick = (device) => {
    setSelectedAppliance(device);
    setDrawerHomeId(device.homeId);
  };

  return (
    <motion.div
      className="devices-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="devices-header-section">
        <div>
          <h2>Tüm Bağlı Cihazlar & Telemetri</h2>
          <p className="subtitle">Tüm konutlarınızdaki IoT ve elektrikli cihazların anlık güç tüketimlerini ve anomalilerini izleyin.</p>
        </div>

        <div className="devices-kpi-row">
          <div className="kpi-chip">
            <span>Toplam Cihaz</span>
            <strong className="mono">{devices.length}</strong>
          </div>
          <div className="kpi-chip danger">
            <span>Aktif Anomali</span>
            <strong className="mono">{totalAnomalies}</strong>
          </div>
          <div className="kpi-chip warning">
            <span>Limit Aşımı</span>
            <strong className="mono">{totalWarnings}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="devices-controls-bar glass-panel">
        <div className="filter-tabs">
          <button
            type="button"
            className={`tab-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            Tümü ({devices.length})
          </button>
          <button
            type="button"
            className={`tab-btn danger ${activeFilter === "anomalous" ? "active" : ""}`}
            onClick={() => setActiveFilter("anomalous")}
          >
            Anomalili ({totalAnomalies})
          </button>
          <button
            type="button"
            className={`tab-btn warning ${activeFilter === "warning" ? "active" : ""}`}
            onClick={() => setActiveFilter("warning")}
          >
            Sınırda ({totalWarnings})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeFilter === "normal" ? "active" : ""}`}
            onClick={() => setActiveFilter("normal")}
          >
            Normal
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Cihaz, oda veya ev ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Devices Table */}
      {loading ? (
        <div className="devices-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="devices-empty-state glass-panel">
          <span>Arama kriterlerine uygun cihaz bulunamadı.</span>
        </div>
      ) : (
        <div className="devices-table-wrapper glass-panel">
          <table className="devices-table">
            <thead>
              <tr>
                <th>CİHAZ ADI</th>
                <th>ODA</th>
                <th>KONUT ADI</th>
                <th>ANLIK TÜKETİM</th>
                <th>GÜVENLİ LİMİT</th>
                <th>YÜKLEME %</th>
                <th>İHLAL STREAK</th>
                <th>DURUM</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => {
                const loadPct = Math.min(100, Math.round((device.currentWatt / device.safeWatt) * 100));
                const isOver = device.currentWatt > device.safeWatt;

                return (
                  <tr
                    key={device.id}
                    className={`device-row ${device.isAnomalous ? "is-anomalous" : ""}`}
                    onClick={() => handleDeviceClick(device)}
                  >
                    <td className="device-name-cell">
                      <strong>{device.name}</strong>
                    </td>
                    <td>{device.room}</td>
                    <td>{device.homeName}</td>
                    <td className="mono">{device.currentWatt} W</td>
                    <td className="mono">{device.safeWatt} W</td>
                    <td>
                      <div className="table-meter-bar">
                        <div
                          className="table-meter-fill"
                          style={{
                            width: `${loadPct}%`,
                            background: device.isAnomalous
                              ? "var(--danger)"
                              : isOver
                              ? "var(--clr-warning)"
                              : "var(--current)",
                          }}
                        />
                      </div>
                    </td>
                    <td className="mono text-center">
                      {device.breachStreak > 0 ? (
                        <span className="streak-badge danger">{device.breachStreak}x</span>
                      ) : (
                        <span className="streak-badge normal">0</span>
                      )}
                    </td>
                    <td>
                      {device.isAnomalous ? (
                        <span className="badge danger">ANOMALİ</span>
                      ) : isOver ? (
                        <span className="badge warning">SINIRDA</span>
                      ) : (
                        <span className="badge normal">NORMAL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Appliance Info Drawer */}
      <ApplianceInfoDrawer
        appliance={selectedAppliance}
        homeId={drawerHomeId}
        onClose={() => setSelectedAppliance(null)}
      />
    </motion.div>
  );
}
