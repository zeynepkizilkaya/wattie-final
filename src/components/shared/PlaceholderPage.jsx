import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PlaceholderPage({ title, description, icon }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="placeholder-page-wrapper glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: "60px 24px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "40px auto 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "rgba(124, 158, 255, 0.12)",
          border: "1px solid rgba(124, 158, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
        }}
      >
        {icon || "⚡"}
      </div>

      <h2 style={{ fontSize: "24px", color: "#ffffff", margin: 0 }}>
        {title || "Yakında Hizmetinizde"}
      </h2>

      <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: "1.5", maxWidth: "420px" }}>
        {description ||
          "Bu modül Wattie platformunun gelecek sürümünde yayınlanacaktır. Enerji izleme ve analitik işlemlerinizi Dashboard üzerinden gerçekleştirebilirsiniz."}
      </p>

      <button
        type="button"
        className="btn-primary"
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: "12px" }}
      >
        ← Dashboard'a Dön
      </button>
    </motion.div>
  );
}
