import { Brain } from 'lucide-react';
import { useScrollY, prefersReducedMotion } from '../hooks/useScrollY';

// A loose constellation of "synapse" nodes, hand-placed to feel organic
// rather than gridded. Coordinates are percentages of a 100x100 viewBox.
const NODES = [
  { x: 10, y: 20 }, { x: 24, y: 10 }, { x: 42, y: 24 }, { x: 60, y: 12 },
  { x: 78, y: 26 }, { x: 92, y: 14 }, { x: 16, y: 44 }, { x: 36, y: 50 },
  { x: 56, y: 44 }, { x: 74, y: 52 }, { x: 90, y: 40 }, { x: 8, y: 68 },
  { x: 28, y: 74 }, { x: 48, y: 68 }, { x: 68, y: 76 }, { x: 86, y: 66 },
  { x: 20, y: 92 }, { x: 44, y: 88 }, { x: 64, y: 94 }, { x: 82, y: 90 },
];

const LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10],
  [6, 7], [7, 8], [8, 9], [9, 10], [6, 11], [7, 12], [8, 13], [9, 14], [10, 15],
  [11, 12], [12, 13], [13, 14], [14, 15], [11, 16], [12, 17], [13, 17], [14, 18], [15, 19],
  [16, 17], [17, 18], [18, 19],
];

// Cycled across nodes so the network reads as colorful without being noisy.
const DOT_COLORS = ['#8b5cf6', '#38bdf8', '#ec4899', '#f59e0b'];

// Fixed, pointer-events-none ambient background: a faint multicolor neural
// network of pulsing synapse nodes plus two ghost brain-outline shapes that
// drift and tilt at different rates on scroll, giving a soft sense of depth.
function BrainField() {
  const rawScrollY = useScrollY();
  const reduceMotion = prefersReducedMotion();
  const scrollY = reduceMotion ? 0 : rawScrollY;
  const driftA = Math.min(scrollY * 0.08, 90);
  const driftB = Math.min(scrollY * 0.14, 140);
  const tiltA = Math.min(scrollY * 0.015, 10);
  const tiltB = Math.min(scrollY * 0.02, -14);

  // Fades the whole layer out behind the center text column (where every
  // section's copy sits) while keeping it visible toward the edges — so it
  // reads as ambient texture instead of competing with body copy.
  const centerMask =
    'radial-gradient(ellipse 60% 65% at 50% 50%, transparent 15%, black 85%)';

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ maskImage: centerMask, WebkitMaskImage: centerMask }}
    >
      {/* ambient color wash — violet top, warm pink/amber lower down */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(124,58,237,0.07),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_15%_55%,rgba(236,72,153,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_85%_80%,rgba(245,158,11,0.04),transparent_70%)]" />

      {/* large ghost brain, upper right — slow drift */}
      <Brain
        strokeWidth={0.5}
        className="absolute -right-28 -top-10 h-[560px] w-[560px] text-brand-purple-300 opacity-[0.22] sm:h-[720px] sm:w-[720px]"
        style={{
          transform: `translateY(${driftA}px) rotate(${tiltA}deg)`,
          transition: 'transform 0.25s linear',
        }}
      />

      {/* smaller ghost brain, lower left — faster drift, opposite tilt */}
      <Brain
        strokeWidth={0.5}
        className="absolute -left-20 bottom-[-4rem] h-[360px] w-[360px] text-pink-300 opacity-[0.2] sm:h-[460px] sm:w-[460px]"
        style={{
          transform: `translateY(${-driftB * 0.4}px) rotate(${tiltB}deg)`,
          transition: 'transform 0.25s linear',
        }}
      />

      {/* neural network of pulsing, multicolor synapses */}
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translateY(${driftA * -0.3}px)`, transition: 'transform 0.25s linear' }}
      >
        {LINKS.map(([a, b], i) => {
          const na = NODES[a];
          const nb = NODES[b];
          return (
            <line
              key={i}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke="#a78bfa"
              strokeWidth="0.1"
              opacity="0.3"
            />
          );
        })}
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r="0.5"
            fill={DOT_COLORS[i % DOT_COLORS.length]}
            className="synapse-dot"
            style={{ animationDelay: `${(i % 8) * 0.35}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

export default BrainField;
