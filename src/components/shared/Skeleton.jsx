import "./skeleton.css";

export function SkeletonLine({ width = "100%", height = 14 }) {
  return <div className="skeleton-line" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card glass-panel">
      <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 14 }} />
      <div className="skeleton-line" style={{ width: "90%", height: 10, marginBottom: 8 }} />
      <div className="skeleton-line" style={{ width: "40%", height: 10 }} />
    </div>
  );
}
