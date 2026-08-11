import { motion } from 'framer-motion';
import { PackageCheck, ScanLine, TrendingUp } from 'lucide-react';
import './warehouse-scene.css';

/**
 * Self-contained animated warehouse illustration for the login screen.
 * Pure inline SVG + CSS animation (no external video), so it always loads:
 * storage racks, a conveyor moving crates past a scanner, a forklift, and
 * a live "activity" feed — to convey a real, working WMS.
 */
const WarehouseScene = () => (
  <div className="wh-scene" role="img" aria-label="Animated warehouse operations">
    <svg viewBox="0 0 480 340" className="wh-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="whFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2350" />
          <stop offset="1" stopColor="#1b1636" />
        </linearGradient>
        <linearGradient id="whBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Floor */}
      <rect x="0" y="250" width="480" height="90" fill="url(#whFloor)" />
      <line x1="0" y1="250" x2="480" y2="250" stroke="#4c3a8a" strokeWidth="1.5" opacity="0.6" />

      {/* ---- Storage racks (back) ---- */}
      {[30, 150].map((rx) => (
        <g key={rx} opacity="0.95">
          {/* uprights */}
          <rect x={rx} y="70" width="6" height="180" rx="2" fill="#3b3466" />
          <rect x={rx + 104} y="70" width="6" height="180" rx="2" fill="#3b3466" />
          {/* shelves */}
          {[110, 165, 220].map((sy) => (
            <rect key={sy} x={rx} y={sy} width="110" height="6" rx="2" fill="#4a4176" />
          ))}
          {/* boxes on shelves */}
          {[
            { x: rx + 12, y: 82, c: '#6366f1' },
            { x: rx + 48, y: 82, c: '#8b5cf6' },
            { x: rx + 80, y: 86, c: '#f59e0b' },
            { x: rx + 16, y: 137, c: '#ec4899' },
            { x: rx + 58, y: 133, c: '#22d3ee' },
            { x: rx + 20, y: 190, c: '#8b5cf6' },
            { x: rx + 62, y: 192, c: '#6366f1' },
          ].map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width="26" height="24" rx="3" fill={b.c} />
              <rect x={b.x} y={b.y + 9} width="26" height="3" fill="#000" opacity="0.15" />
            </g>
          ))}
        </g>
      ))}

      {/* ---- Conveyor belt ---- */}
      <g>
        <rect x="20" y="286" width="440" height="16" rx="8" fill="#26214a" />
        {Array.from({ length: 15 }).map((_, i) => (
          <circle key={i} cx={34 + i * 30} cy="294" r="5" fill="#3b3466" />
        ))}
      </g>

      {/* ---- Moving crates on the belt ---- */}
      {['c1', 'c2', 'c3', 'c4'].map((c, i) => (
        <g key={c} className={`wh-crate ${c}`}>
          <rect x="40" y="262" width="30" height="24" rx="3" fill={['#6366f1', '#ec4899', '#f59e0b', '#8b5cf6'][i]} />
          <rect x="40" y="271" width="30" height="3" fill="#000" opacity="0.18" />
          <rect x="51" y="262" width="8" height="24" fill="#fff" opacity="0.12" />
        </g>
      ))}

      {/* ---- Scanner arch + beam ---- */}
      <g>
        <rect x="232" y="228" width="8" height="62" rx="3" fill="#0e7490" />
        <rect x="232" y="228" width="40" height="8" rx="3" fill="#0e7490" />
        <rect className="wh-beam" x="240" y="236" width="20" height="54" fill="url(#whBeam)" />
        <line className="wh-beam-line" x1="242" y1="238" x2="242" y2="290" stroke="#67e8f9" strokeWidth="2" />
      </g>

      {/* ---- Forklift ---- */}
      <g className="wh-forklift">
        <rect x="8" y="224" width="34" height="22" rx="4" fill="#f59e0b" />
        <rect x="30" y="212" width="16" height="16" rx="3" fill="#fbbf24" />
        <rect x="44" y="206" width="4" height="40" rx="2" fill="#334155" />
        <rect x="44" y="242" width="20" height="4" rx="2" fill="#334155" />
        <rect x="50" y="226" width="18" height="16" rx="2" fill="#8b5cf6" />
        <circle cx="18" cy="248" r="7" fill="#1e293b" />
        <circle cx="38" cy="248" r="7" fill="#1e293b" />
      </g>
    </svg>

    {/* ---- Live activity chips (HTML overlay) ---- */}
    <div className="wh-feed">
      <motion.div
        className="wh-chip"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: [0, 1, 1, 0], x: [30, 0, 0, 30] }}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.85, 1], delay: 0 }}
      >
        <span className="wh-chip-ic in"><PackageCheck size={15} /></span>
        <div><strong>Inbound received</strong><small>+120 units · Wireless Mouse</small></div>
      </motion.div>

      <motion.div
        className="wh-chip"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: [0, 1, 1, 0], x: [30, 0, 0, 30] }}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.85, 1], delay: 1.7 }}
      >
        <span className="wh-chip-ic scan"><ScanLine size={15} /></span>
        <div><strong>SKU scanned</strong><small>ELE-MOU-001 · Aisle A1-R2</small></div>
      </motion.div>

      <motion.div
        className="wh-chip"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: [0, 1, 1, 0], x: [30, 0, 0, 30] }}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.85, 1], delay: 3.4 }}
      >
        <span className="wh-chip-ic up"><TrendingUp size={15} /></span>
        <div><strong>Stock updated</strong><small>Live inventory · 1,230 units</small></div>
      </motion.div>
    </div>
  </div>
);

export default WarehouseScene;
