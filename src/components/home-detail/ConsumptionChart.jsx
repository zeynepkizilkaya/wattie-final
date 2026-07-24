import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip mono">
      <div>{label}</div>
      <strong>{payload[0].value} kWh</strong>
    </div>
  );
}

export default function ConsumptionChart({ data }) {
  if (!data) return <div className="chart-skeleton" />;

  return (
    <div className="consumption-chart">
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="voltGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c9eff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#7c9eff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#6c7486", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6c7486", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="kwh" stroke="#7c9eff" strokeWidth={2} fill="url(#voltGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
