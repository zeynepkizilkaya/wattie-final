import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

function randomBoltPath(width, height) {
  const points = [];
  const segments = 10;
  let x = width * (0.38 + Math.random() * 0.24);
  points.push([x, 0]);
  for (let i = 1; i <= segments; i++) {
    const y = (height / segments) * i;
    x += (Math.random() - 0.5) * width * 0.18;
    x = Math.max(width * 0.1, Math.min(width * 0.9, x));
    points.push([x, y]);
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

function randomBranchPath(startX, startY, width, height, dir = 1) {
  const points = [[startX, startY]];
  const segments = 4;
  let x = startX;
  for (let i = 1; i <= segments; i++) {
    const y = startY + ((height - startY) / segments) * i * 0.45;
    x += dir * (Math.random() * 0.8 + 0.2) * width * 0.14;
    x = Math.max(width * 0.05, Math.min(width * 0.95, x));
    points.push([x, y]);
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

export default function LightningStrike({ strikeKey }) {
  const paths = useMemo(() => {
    const main = randomBoltPath(400, 800);
    const branch1 = randomBranchPath(180 + Math.random() * 100, 180 + Math.random() * 150, 400, 800, -1);
    const branch2 = randomBranchPath(160 + Math.random() * 120, 320 + Math.random() * 150, 400, 800, 1);
    const branch3 = randomBranchPath(220 + Math.random() * 80, 450 + Math.random() * 100, 400, 800, -1);
    return { main, branch1, branch2, branch3 };
  }, [strikeKey]);

  const filterId = `lightning-glow-${strikeKey}`;

  return (
    <AnimatePresence mode="wait">
      {strikeKey > 0 && (
        <motion.div
          key={strikeKey}
          className="lightning-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.65, times: [0, 0.08, 0.45, 1] }}
        >
          <svg viewBox="0 0 400 800" preserveAspectRatio="none" className="lightning-svg">
            <defs>
              <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="9" result="blur1" />
                <feGaussianBlur stdDeviation="3" in="SourceGraphic" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Main Intense Golden Bolt */}
            <motion.path
              d={paths.main}
              fill="none"
              stroke="#ffc93c"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${filterId})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1], ease: "easeOut" }}
            />
            {/* Inner White Core for Realistic Electric Intensity */}
            <motion.path
              d={paths.main}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1], ease: "easeOut" }}
            />
            {/* Golden Branch 1 */}
            <motion.path
              d={paths.branch1}
              fill="none"
              stroke="#ffe066"
              strokeWidth={2.5}
              strokeLinecap="round"
              filter={`url(#${filterId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
            />
            {/* Golden Branch 2 */}
            <motion.path
              d={paths.branch2}
              fill="none"
              stroke="#ffd32a"
              strokeWidth={2}
              strokeLinecap="round"
              filter={`url(#${filterId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 0.75, 0] }}
              transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
            />
            {/* Golden Branch 3 */}
            <motion.path
              d={paths.branch3}
              fill="none"
              stroke="#ffc93c"
              strokeWidth={1.5}
              strokeLinecap="round"
              filter={`url(#${filterId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.3, delay: 0.14, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
