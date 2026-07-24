import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import "./toast.css";

const toneColor = {
  info: "var(--arc)",
  success: "var(--current)",
  error: "var(--danger)",
};

export default function ToastStack() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            className="toast glass-panel"
            style={{ borderLeft: `3px solid ${toneColor[t.tone] || toneColor.info}` }}
            onClick={() => dismissToast(t.id)}
            role="status"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
