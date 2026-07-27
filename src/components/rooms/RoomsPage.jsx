import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api } from "../../lib/api";
import { mockRoomHistory } from "../../lib/mockData";
import { useAppStore } from "../../store/useAppStore";
import ApplianceInfoDrawer from "../home-detail/ApplianceInfoDrawer";
import SkeletonCard from "../shared/Skeleton";
import "./rooms.css";

export default function RoomsPage() {
  const [homes, setHomes] = useState([]);
  const selectedHomeId = useAppStore((s) => s.selectedHomeId);
  const selectHome = useAppStore((s) => s.selectHome);

  const [activeHomeId, setActiveHomeId] = useState(selectedHomeId || "home-1");
  const [currentHome, setCurrentHome] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.getHomes();
        setHomes(data);

        const targetId = activeHomeId || data[0]?.id || "home-1";
        const homeDetail = await api.getHomeDetail(targetId);
        setCurrentHome(homeDetail);

        if (homeDetail.appliances && homeDetail.appliances.length > 0) {
          const firstRoom = homeDetail.appliances[0].room;
          setSelectedRoom(firstRoom);
        }
      } catch (err) {
        console.error("Odalar verisi yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeHomeId]);

  const handleHomeChange = async (e) => {
    const newId = e.target.value;
    setActiveHomeId(newId);
    selectHome(newId);
  };

  if (loading || !currentHome) {
    return (
      <div className="rooms-page-container">
        <div className="rooms-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const roomsMap = {};
  currentHome.appliances.forEach((a) => {
    const rName = a.room || "Diğer";
    if (!roomsMap[rName]) {
      roomsMap[rName] = { name: rName, appliances: [], totalWatt: 0, hasAnomaly: false, hasWarning: false };
    }
    roomsMap[rName].appliances.push(a);
    roomsMap[rName].totalWatt += a.currentWatt;
    if (a.isAnomalous) roomsMap[rName].hasAnomaly = true;
    if (a.currentWatt > a.safeWatt && !a.isAnomalous) roomsMap[rName].hasWarning = true;
  });

  const roomList = Object.values(roomsMap);
  const activeRoomData = selectedRoom ? roomsMap[selectedRoom] : roomList[0];
  const roomChartData = mockRoomHistory(currentHome.id, selectedRoom);

  return (
    <motion.div
      className="rooms-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="rooms-header-section">
        <div>
          <h2>Odalar & Bölge Tüketim Yönetimi</h2>
          <p className="subtitle">Seçili konuttaki odaların anlık güç dağılımı ve cihaz telemetrisi.</p>
        </div>

        <div className="rooms-home-select glass-panel">
          <select value={activeHomeId} onChange={handleHomeChange}>
            {homes.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.address})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="room-cards-grid">
        {roomList.map((r) => {
          const isSelected = selectedRoom === r.name;
          const kwVal = (r.totalWatt / 1000).toFixed(2);

          return (
            <motion.div
              key={r.name}
              className={`glass-panel room-card ${isSelected ? "active" : ""} ${
                r.hasAnomaly ? "has-anomaly" : r.hasWarning ? "has-warning" : ""
              }`}
              onClick={() => setSelectedRoom(r.name)}
              whileHover={{ y: -3 }}
            >
              <div className="card-top">
                <span className="room-title">{r.name}</span>
              </div>

              <div className="card-body">
                <strong className="room-kw mono">{kwVal} kW</strong>
                <span className="room-device-count">{r.appliances.length} Cihaz</span>
              </div>

              <div className="card-footer">
                {r.hasAnomaly ? (
                  <span className="status-pill danger">Anomali Tespit Edildi</span>
                ) : r.hasWarning ? (
                  <span className="status-pill warning">Sınır Eşiğinde</span>
                ) : (
                  <span className="status-pill normal">Normal Çalışma</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Room Details & Devices Table */}
      {activeRoomData && (
        <div className="room-detail-section">
          <div className="glass-panel room-devices-panel">
            <div className="panel-header">
              <h3>{activeRoomData.name} Cihazları</h3>
              <span className="mono subtitle">
                {(activeRoomData.totalWatt / 1000).toFixed(2)} kW Anlık Çekim
              </span>
            </div>

            <table className="room-devices-table">
              <thead>
                <tr>
                  <th>CİHAZ ADI</th>
                  <th>ANLIK TÜKETİM</th>
                  <th>GÜVENLİ LİMİT</th>
                  <th>YÜKLEME</th>
                  <th>DURUM</th>
                </tr>
              </thead>
              <tbody>
                {activeRoomData.appliances.map((appliance) => {
                  const pct = Math.min(100, Math.round((appliance.currentWatt / appliance.safeWatt) * 100));
                  const isOver = appliance.currentWatt > appliance.safeWatt;

                  return (
                    <tr
                      key={appliance.id}
                      className={`device-row ${appliance.isAnomalous ? "anomalous" : ""}`}
                      onClick={() => setSelectedAppliance(appliance)}
                    >
                      <td className="name-cell">
                        <strong>{appliance.name}</strong>
                      </td>
                      <td className="mono">{appliance.currentWatt} W</td>
                      <td className="mono">{appliance.safeWatt} W</td>
                      <td>
                        <div className="table-meter-bar">
                          <div
                            className="table-meter-fill"
                            style={{
                              width: `${pct}%`,
                              background: appliance.isAnomalous
                                ? "var(--danger)"
                                : isOver
                                ? "var(--clr-warning)"
                                : "var(--current)",
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {appliance.isAnomalous ? (
                          <span className="status-pill danger">Anomali</span>
                        ) : isOver ? (
                          <span className="status-pill warning">Sınırda</span>
                        ) : (
                          <span className="status-pill normal">Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 7-Day Room Consumption AreaChart */}
          <div className="glass-panel room-chart-panel">
            <div className="panel-header">
              <h3>{activeRoomData.name} — Son 7 Günlük Tüketim</h3>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={roomChartData}>
                  <XAxis dataKey="date" stroke="var(--text-3)" fontSize={11} />
                  <YAxis stroke="var(--text-3)" fontSize={11} unit=" kWh" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 15, 25, 0.94)",
                      borderColor: "var(--panel-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kwh"
                    name="Oda Tüketimi"
                    stroke="var(--arc)"
                    fill="rgba(124, 158, 255, 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Appliance Info Drawer */}
      <ApplianceInfoDrawer
        appliance={selectedAppliance}
        onClose={() => setSelectedAppliance(null)}
      />
    </motion.div>
  );
}
