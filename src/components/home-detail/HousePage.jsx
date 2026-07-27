import { useState, useRef, useMemo, useEffect, useCallback, Suspense, Component } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  LineChart,
  Sun,
  Clock,
  Sparkles,
} from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { InteriorModel } from "./InteriorModel";
import { CAMERA_PRESETS, DEVICES_CONFIG } from "./roomPresets";
import { DeviceInfoPanel } from "./DeviceInfoPanel";
import { MOCK_TELEMETRY } from "./mockTelemetry";

class GLTFErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("InteriorModel GLTF load fallback triggered:", error?.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function FallbackRoomFloor() {
  return (
    <group position={[0, -0.8, 0]}>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[12, 0.4, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>
      <mesh position={[-3, 0.6, -3]}>
        <boxGeometry args={[2.5, 1.2, 2]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} />
      </mesh>
      <mesh position={[3, 0.6, -3]}>
        <boxGeometry args={[2.8, 1.4, 2]} />
        <meshStandardMaterial color="#818cf8" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 2]}>
        <boxGeometry args={[4, 1.0, 2.5]} />
        <meshStandardMaterial color="#c084fc" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Waveform({ color }) {
  return (
    <svg width="60" height="12" viewBox="0 0 60 12" fill="none" style={{ opacity: 0.85 }}>
      <motion.path
        d="M0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6",
            "M0 6 Q 6 11, 12 6 T 24 6 T 36 6 T 48 6 T 60 6",
            "M0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6",
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

function DeviceCard({ id, name, roomName, isSelected = false, onClick, deviceState }) {
  const [hovered, setHovered] = useState(false);
  const telemetry = deviceState;

  const config = useMemo(() => {
    switch (id) {
      case "refrigerator":
        return {
          accentColor: "#38bdf8",
          glowColor: "rgba(56, 189, 248, 0.25)",
          svg: (
            <svg viewBox="0 0 60 90" width="44" height="66" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
              <polygon points="5,15 25,5 25,85 5,75" fill="#0f172a" />
              <polygon points="25,5 45,12 45,45 25,38" fill="#38bdf8" />
              <polygon points="45,12 55,9 55,42 45,45" fill="#0ea5e9" />
              <polygon points="25,41 45,48 45,80 25,73" fill="#0284c7" />
              <polygon points="45,48 55,45 55,77 45,80" fill="#0369a1" />
              <line x1="43" y1="20" x2="43" y2="35" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="43" y1="53" x2="43" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <polygon points="25,5 45,12 55,9 35,2" fill="#7dd3fc" />
            </svg>
          ),
        };
      case "computer":
        return {
          accentColor: "#818cf8",
          glowColor: "rgba(129, 140, 248, 0.25)",
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
              <polygon points="5,60 75,60 65,75 15,75" fill="#1e1b4b" opacity="0.6" />
              <polygon points="36,45 44,45 42,58 38,58" fill="#4f46e5" />
              <polygon points="30,58 50,58 48,62 32,62" fill="#3730a3" />
              <polygon points="15,15 65,15 65,45 15,45" fill="#4338ca" />
              <polygon points="18,17 62,17 62,42 18,42" fill="#1e1b4b" />
              <polygon points="22,20 58,20 58,38 22,38" fill="url(#screenGrad)" opacity="0.8" />
              <polygon points="25,64 55,64 52,69 28,69" fill="#1e1b4b" />
              <polygon points="26,65 54,65 51,68 29,68" fill="#818cf8" opacity="0.5" />
              <polygon points="58,66 63,66 62,68 59,68" fill="#818cf8" />
              <defs>
                <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          ),
        };
      case "television":
        return {
          accentColor: "#c084fc",
          glowColor: "rgba(192, 132, 252, 0.25)",
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
              <polygon points="10,50 70,50 65,65 15,65" fill="#581c87" />
              <line x1="15" y1="65" x2="15" y2="70" stroke="#3b0764" strokeWidth="2.5" />
              <line x1="65" y1="65" x2="65" y2="70" stroke="#3b0764" strokeWidth="2.5" />
              <polygon points="15,58 65,58 64,59 16,59" fill="#c084fc" opacity="0.4" />
              <rect x="37" y="42" width="6" height="8" fill="#6b21a8" />
              <polygon points="32,48 48,48 46,50 34,50" fill="#581c87" />
              <polygon points="8,15 72,15 72,42 8,42" fill="#3b0764" />
              <polygon points="10,17 70,17 70,40 10,40" fill="#1e152a" />
              <polygon points="10,17 70,17 70,40 10,40" fill="url(#tvGrad)" opacity="0.75" />
              <defs>
                <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06101b" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          ),
        };
      case "lights":
        return {
          accentColor: "#fbbf24",
          glowColor: "rgba(251, 191, 36, 0.25)",
          svg: (
            <svg viewBox="0 0 80 90" width="50" height="56" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
              <polygon points="30,80 50,80 48,83 32,83" fill="#d97706" />
              <line x1="40" y1="35" x2="40" y2="80" stroke="#b45309" strokeWidth="2.5" />
              <polygon points="28,35 52,35 58,15 22,15" fill="#f59e0b" />
              <polygon points="30,17 50,17 48,33 32,33" fill="#fef08a" opacity="0.3" />
              <circle cx="40" cy="40" r="12" fill="url(#lampGlow)" opacity="0.5" />
              <defs>
                <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          ),
        };
      case "oven":
      default:
        return {
          accentColor: "#fb923c",
          glowColor: "rgba(251, 146, 60, 0.25)",
          svg: (
            <svg viewBox="0 0 80 90" width="50" height="56" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
              <polygon points="20,5 60,5 65,22 15,22" fill="#7c2d12" />
              <polygon points="15,22 65,22 60,26 20,26" fill="url(#hoodGlow)" opacity="0.4" />
              <polygon points="15,50 65,50 65,85 15,85" fill="#451a03" />
              <polygon points="15,50 65,50 60,56 20,56" fill="#1c1917" />
              <ellipse cx="30" cy="53" rx="6" ry="2" fill="#ea580c" opacity="0.8" />
              <ellipse cx="50" cy="53" rx="5" ry="1.8" fill="#ea580c" opacity="0.8" />
              <circle cx="22" cy="62" r="2" fill="#fdba74" />
              <circle cx="32" cy="62" r="2" fill="#fdba74" />
              <circle cx="48" cy="62" r="2" fill="#fdba74" />
              <circle cx="58" cy="62" r="2" fill="#fdba74" />
              <polygon points="22,68 58,68 58,80 22,80" fill="#1c1917" />
              <polygon points="24,70 56,70 56,78 24,78" fill="#f97316" opacity="0.15" />
              <line x1="28" y1="67" x2="52" y2="67" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="hoodGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          ),
        };
    }
  }, [id]);

  const { accentColor, glowColor, svg } = config;
  const isOnline = telemetry?.status === "online";
  const currentPower = telemetry?.currentPower ?? 0;

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.03 }}
      animate={{
        borderColor: isSelected ? accentColor : "rgba(255, 255, 255, 0.08)",
        boxShadow: isSelected
          ? `0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px ${glowColor}, inset 0 0 12px rgba(255, 255, 255, 0.03)`
          : hovered
          ? `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 10px ${glowColor}`
          : "0 8px 32px rgba(0, 0, 0, 0.3)",
        background: isSelected
          ? "rgba(6, 16, 27, 0.85)"
          : hovered
          ? "rgba(255, 255, 255, 0.06)"
          : "rgba(255, 255, 255, 0.02)",
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "1.25rem",
        padding: "1rem 1.25rem",
        borderRadius: "16px",
        border: "1px solid",
        backdropFilter: "blur(24px)",
        cursor: "pointer",
        width: "100%",
        maxWidth: "315px",
        height: "115px",
        userSelect: "none",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "80px",
          height: "80px",
          background: accentColor,
          opacity: isSelected ? 0.08 : hovered ? 0.04 : 0,
          filter: "blur(24px)",
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "76px",
          flexShrink: 0,
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        {svg}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          minWidth: 0,
          gap: "0.15rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.45)",
              fontWeight: 500,
            }}
          >
            {roomName}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "0.15rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isOnline ? "#10b981" : "#6b7280",
                boxShadow: isOnline ? "0 0 8px #10b981" : "none",
              }}
            />
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: isOnline ? "#10b981" : "rgba(255, 255, 255, 0.45)",
                letterSpacing: "0.05em",
              }}
            >
              {isOnline ? "Active" : "Offline"}
            </span>
          </div>

          {isOnline && (
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: accentColor,
                fontFamily: "monospace",
              }}
            >
              {currentPower} W
            </span>
          )}
        </div>

        {isOnline && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "12px",
            }}
          >
            <Waveform color={accentColor} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CameraController({ controlsRef }) {
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  return null;
}

function CameraRefHolder({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      cameraRef.current = camera;
    }
  }, [camera, cameraRef]);
  return null;
}

export function HousePage() {
  const navigate = useNavigate();
  const { homeId } = useParams();
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // Live telemetry state
  const [deviceStates, setDeviceStates] = useState(() => {
    const initial = {};
    Object.keys(MOCK_TELEMETRY).forEach((id) => {
      initial[id] = { ...MOCK_TELEMETRY[id] };
    });
    return initial;
  });

  const handlePowerToggle = useCallback((deviceId, status) => {
    const defaultPowerValues = {
      refrigerator: 85,
      computer: 145,
      television: 110,
      oven: 98,
      lights: 28,
    };
    setDeviceStates((prev) => {
      const updatedDevice = { ...prev[deviceId] };
      updatedDevice.status = status;
      updatedDevice.currentPower = status === "online" ? defaultPowerValues[deviceId] || 50 : 0;
      return {
        ...prev,
        [deviceId]: updatedDevice,
      };
    });
  }, []);

  // Left Smart Panel Clock State
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Status state
  const [lastUpdatedSec, setLastUpdatedSec] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLastUpdatedSec(0);
  }, [deviceStates]);

  // Background music audio loop
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/audio/disco.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    let fadeInterval = null;

    const playAudio = () => {
      audio
        .play()
        .then(() => {
          let vol = 0;
          fadeInterval = setInterval(() => {
            if (audioRef.current) {
              if (vol < 0.2) {
                vol += 0.01;
                audio.volume = Math.min(vol, 0.2);
              } else {
                clearInterval(fadeInterval);
              }
            } else {
              clearInterval(fadeInterval);
            }
          }, 100);
        })
        .catch(() => {});
    };

    const startTimeout = setTimeout(() => {
      playAudio();
    }, 500);

    const handleFirstInteraction = () => {
      if (audio.paused) {
        playAudio();
      }
      document.removeEventListener("click", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);

    return () => {
      clearTimeout(startTimeout);
      if (fadeInterval) clearInterval(fadeInterval);
      audio.pause();
      audioRef.current = null;
      document.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const [hoveredDeviceId, setHoveredDeviceId] = useState(null);

  const activeDevice = DEVICES_CONFIG.find((d) => d.id === activeDeviceId);

  const handleDeviceClick = (deviceId) => {
    setActiveDeviceId((prev) => (prev === deviceId ? null : deviceId));
  };

  const consumers = useMemo(() => {
    const ids = ["refrigerator", "computer", "television", "lights"];
    const colors = {
      refrigerator: "#38bdf8",
      computer: "#818cf8",
      television: "#c084fc",
      lights: "#fbbf24",
    };
    return ids
      .map((id) => {
        const data = deviceStates[id];
        return {
          name: data?.name || id,
          power: data?.status === "online" ? data.currentPower : 0,
          color: colors[id] || "#fb923c",
        };
      })
      .sort((a, b) => b.power - a.power);
  }, [deviceStates]);

  const { totalCurrentPower, totalTodayEnergy, onlineCount } = useMemo(() => {
    const ids = ["refrigerator", "computer", "television", "oven", "lights"];
    let power = 0;
    let energy = 0;
    let online = 0;
    ids.forEach((id) => {
      const data = deviceStates[id];
      if (data) {
        if (data.status === "online") {
          power += data.currentPower;
          online += 1;
        }
        energy += data.todayConsumption;
      }
    });
    return {
      totalCurrentPower: power,
      totalTodayEnergy: parseFloat(energy.toFixed(2)),
      onlineCount: online,
    };
  }, [deviceStates]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 20px minmax(0, 1fr)",
        alignContent: "start",
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #0f1629 0%, #030712 100%)",
        color: "#fff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "1.25rem",
        paddingRight: activeDeviceId ? "340px" : "1.25rem",
        transition: "padding-right 250ms ease",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Floating Glass Mute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 10000,
          background: "rgba(6, 16, 27, 0.5)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          fontSize: "1.2rem",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(6, 16, 27, 0.5)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Background Decorative Glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0) 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.04) 0%, rgba(251, 146, 60, 0) 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: "none",
          margin: "0 0 1.25rem 0",
          padding: "0 0.5rem",
          zIndex: 1,
          gridColumn: 3,
          gridRow: 1,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: 0,
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            House Digital Twin
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(255, 255, 255, 0.5)",
              margin: "0.25rem 0 0 0",
              fontWeight: 400,
            }}
          >
            {activeDevice
              ? `Monitoring: ${activeDevice.name} (${activeDevice.room})`
              : "Select a device or explore the apartment freely."}
          </p>
        </div>

        <button
          onClick={() => navigate(homeId ? `/home/${homeId}` : "/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            color: "#e5e7eb",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      {/* Top Summary Cards */}
      <div
        style={{
          width: "100%",
          maxWidth: "none",
          margin: "0 0 1.25rem 0",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "1rem",
          padding: "0 0.5rem",
          zIndex: 1,
          gridColumn: 3,
          gridRow: 2,
        }}
      >
        {/* Status Card */}
        <div
          style={{
            background: "rgba(6, 16, 27, 0.4)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
              boxShadow: "0 0 10px rgba(16, 185, 129, 0.1)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255, 255, 255, 0.45)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Home Status
            </div>
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#fff",
                marginTop: "0.15rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {onlineCount}/5 Devices Active
            </div>
          </div>
        </div>

        {/* Live Power Usage */}
        <div
          style={{
            background: "rgba(6, 16, 27, 0.4)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255, 255, 255, 0.45)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Total Demand
            </div>
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#fff",
                marginTop: "0.15rem",
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {totalCurrentPower} W
            </div>
          </div>
        </div>

        {/* Today's Energy */}
        <div
          style={{
            background: "rgba(6, 16, 27, 0.4)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(129, 140, 248, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#818cf8",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
              <path d="M17 2v5" />
              <path d="M7 2v5" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255, 255, 255, 0.45)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Today's Energy
            </div>
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#fff",
                marginTop: "0.15rem",
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {totalTodayEnergy} kWh
            </div>
          </div>
        </div>

        {/* System Health */}
        <div
          style={{
            background: "rgba(6, 16, 27, 0.4)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(192, 132, 252, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c084fc",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255, 255, 255, 0.45)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              VoltWise Health
            </div>
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#c084fc",
                marginTop: "0.15rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Optimal
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ display: "contents" }}>
        {/* Left Smart Info Panel */}
        <aside
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "2.25rem",
            flexShrink: 0,
            boxSizing: "border-box",
            gridColumn: 1,
            gridRow: "1 / span 5",
          }}
        >
          {/* Weather Card */}
          <div
            style={{
              background: "rgba(6, 16, 27, 0.45)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>29°C</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", fontWeight: 500 }}>Sunny</span>
              </div>
              <Sun size={32} color="#fbbf24" style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))" }} />
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#fff",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                paddingTop: "0.5rem",
              }}
            >
              Istanbul
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "0.1rem" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "0.5rem 0.65rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.03)",
                }}
              >
                <span style={{ fontSize: "0.62rem", color: "rgba(255, 255, 255, 0.4)", fontWeight: 600, textTransform: "uppercase" }}>Humidity</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e5e7eb", marginTop: "0.1rem" }}>46%</span>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "0.5rem 0.65rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.03)",
                }}
              >
                <span style={{ fontSize: "0.62rem", color: "rgba(255, 255, 255, 0.4)", fontWeight: 600, textTransform: "uppercase" }}>Wind</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e5e7eb", marginTop: "0.1rem" }}>14 km/h</span>
              </div>
            </div>
          </div>

          {/* Clock Card */}
          <div
            style={{
              background: "rgba(6, 16, 27, 0.45)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "rgba(255, 255, 255, 0.45)",
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Clock size={14} color="#38bdf8" />
              <span>System Clock</span>
            </div>
            <div
              style={{
                fontSize: "2.1rem",
                fontWeight: 700,
                color: "#fff",
                fontFamily: "monospace",
                letterSpacing: "-0.02em",
                margin: "0.1rem 0",
              }}
            >
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: 600 }}>
              {time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Live Status Card */}
          <div
            style={{
              background: "rgba(6, 16, 27, 0.45)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}
              />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", letterSpacing: "0.06em" }}>LIVE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.65rem", color: "rgba(255, 255, 255, 0.4)", fontWeight: 600, textTransform: "uppercase" }}>Last Updated</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>
                {lastUpdatedSec === 0 ? "Just now" : lastUpdatedSec === 1 ? "1 sec ago" : `${lastUpdatedSec} sec ago`}
              </span>
            </div>
          </div>

          {/* AI Energy Insight */}
          <div
            style={{
              background: "rgba(6, 16, 27, 0.45)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#c084fc",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                paddingBottom: "0.5rem",
              }}
            >
              <Sparkles size={14} color="#c084fc" />
              <span>AI Energy Insight</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.78rem", lineHeight: 1.4, color: "#cbd5e1" }}>
              <strong style={{ color: "#10b981" }}>Great job!</strong>
              <p style={{ margin: 0 }}>
                Your energy usage today is <strong style={{ color: "#10b981" }}>18% lower</strong> than yesterday. Keep it up!
              </p>
            </div>
            <button
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "8px",
                background: "rgba(192, 132, 252, 0.04)",
                border: "1px solid rgba(192, 132, 252, 0.2)",
                color: "#c084fc",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: "0.2rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(192, 132, 252, 0.1)";
                e.currentTarget.style.border = "1px solid rgba(192, 132, 252, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(192, 132, 252, 0.04)";
                e.currentTarget.style.border = "1px solid rgba(192, 132, 252, 0.2)";
              }}
            >
              View All Insights
            </button>
          </div>
        </aside>

        {/* 3D Viewport Main Canvas */}
        <main
          style={{
            flex: 1,
            display: "flex",
            background: "radial-gradient(circle at center, rgba(16, 28, 48, 0.4) 0%, rgba(6, 16, 27, 0.8) 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.6), 0 12px 40px rgba(0, 0, 0, 0.4)",
            position: "relative",
            height: "450px",
            minHeight: "450px",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            gridColumn: 3,
            gridRow: 3,
          }}
        >
          <div
            style={{
              position: "absolute",
              color: "rgba(255, 255, 255, 0.12)",
              fontSize: "0.85rem",
              fontFamily: "monospace",
              top: "20px",
              left: "20px",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            {activeDevice ? `SYS.VIEWPORT.3D [ZOOM_IN: ${activeDevice.name.toUpperCase()}]` : "SYS.VIEWPORT.3D [READY]"}
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <Canvas
              shadows
              camera={{ position: [0.01, 10.5, 9.5], fov: 40 }}
              gl={{
                antialias: true,
                alpha: true,
                outputColorSpace: THREE.SRGBColorSpace,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2,
              }}
            >
              <Suspense fallback={null}>
                <color attach="background" args={["#06101b"]} />
                <ambientLight intensity={1.3} color="#8ba0c3" />
                <hemisphereLight skyColor="#38bdf8" groundColor="#0f172a" intensity={1.6} />
                <directionalLight position={[12, 22, 12]} intensity={2.4} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
                <pointLight position={[-6, 10, -6]} intensity={1.5} color="#818cf8" />

                <GLTFErrorBoundary fallback={<FallbackRoomFloor />}>
                  <InteriorModel
                    position={[0, -1.8, 0]}
                    scale={0.045}
                    onMeshClick={handleDeviceClick}
                    activeDeviceId={activeDeviceId}
                    hoveredDeviceId={hoveredDeviceId}
                    onHoverChange={setHoveredDeviceId}
                    deviceStates={deviceStates}
                  />
                </GLTFErrorBoundary>
                <CameraRefHolder cameraRef={cameraRef} />
                <CameraController controlsRef={controlsRef} />
                <OrbitControls
                  ref={controlsRef}
                  enabled={true}
                  enableDamping
                  dampingFactor={0.05}
                  minDistance={0.01}
                  maxDistance={500}
                  enablePan={true}
                  screenSpacePanning={true}
                />
              </Suspense>
            </Canvas>
          </div>
        </main>
      </div>

      {/* Bottom Device Cards Bar */}
      <footer
        style={{
          width: "100%",
          maxWidth: "none",
          margin: "1rem 0 0",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          justifyContent: "center",
          justifyItems: "center",
          gap: "1.25rem",
          padding: "0 0.5rem",
          gridColumn: 3,
          gridRow: 4,
        }}
      >
        {DEVICES_CONFIG.map((device) => (
          <DeviceCard
            key={device.id}
            id={device.id}
            name={device.name}
            roomName={device.room}
            isSelected={activeDeviceId === device.id}
            onClick={() => handleDeviceClick(device.id)}
            deviceState={deviceStates[device.id]}
          />
        ))}
      </footer>

      {/* Bottom Analytics Section */}
      <section
        style={{
          width: "100%",
          maxWidth: "none",
          margin: "1.5rem 0 3rem",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "1.5rem",
          padding: "0 0.5rem",
          boxSizing: "border-box",
          gridColumn: 3,
          gridRow: 5,
        }}
      >
        {/* Energy Trend Card */}
        <div
          style={{
            background: "rgba(6, 16, 27, 0.45)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              paddingBottom: "0.65rem",
            }}
          >
            <LineChart size={16} color="#38bdf8" />
            <span>Energy Trend (Today)</span>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "120px" }}>
            <svg viewBox="0 0 300 100" width="100%" height="120" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 0 90 Q 30 85, 60 80 T 120 65 T 180 35 T 240 55 T 300 25 L 300 100 L 0 100 Z" fill="url(#chartGrad)" />
              <motion.path
                d="M 0 90 Q 30 85, 60 80 T 120 65 T 180 35 T 240 55 T 300 25"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <circle cx="180" cy="35" r="4" fill="#38bdf8" />
              <circle cx="180" cy="35" r="8" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Top Consumers Card */}
        <div
          style={{
            background: "rgba(6, 16, 27, 0.45)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              paddingBottom: "0.65rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Top Consumers</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1, justifyContent: "center" }}>
            {consumers.map((c) => (
              <div key={c.name} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600 }}>
                  <span style={{ color: "#fff" }}>{c.name}</span>
                  <span style={{ color: c.color, fontFamily: "monospace", fontWeight: 700 }}>{c.power} W</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "3px", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.power / 150) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ height: "100%", background: c.color, borderRadius: "3px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeDeviceId && (
          <DeviceInfoPanel
            deviceId={activeDeviceId}
            onClose={() => setActiveDeviceId(null)}
            deviceState={deviceStates[activeDeviceId]}
            onPowerToggle={handlePowerToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
