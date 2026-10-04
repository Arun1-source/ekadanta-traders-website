// Cinematic dusk skyline drawn as SVG: towers, a crane, a container ship and a low gold sun.
// It is decorative, so it is hidden from assistive technology.

const BACK = [
  [0, 110, 250], [105, 70, 330], [170, 95, 220], [262, 80, 360], [338, 120, 270], [455, 75, 310],
  [525, 100, 230], [620, 70, 390], [685, 110, 280], [790, 90, 340], [875, 120, 240], [990, 80, 300],
  [1065, 100, 370], [1160, 85, 250], [1240, 110, 320], [1345, 90, 260], [1430, 80, 340], [1505, 100, 280],
];
const FRONT = [
  [30, 90, 170], [115, 60, 250], [170, 100, 140], [265, 70, 210], [330, 120, 120], [450, 80, 190],
  [535, 60, 270], [640, 110, 150], [745, 80, 220], [830, 100, 130], [1000, 70, 200], [1070, 120, 160],
  [1195, 80, 240], [1280, 100, 140], [1450, 90, 210], [1535, 80, 160],
];
const GROUND = 760;

function Windows({ buildings }) {
  const lights = [];
  buildings.forEach(([x, w, h], i) => {
    const top = GROUND - h;
    for (let row = 0; row < Math.floor((h - 24) / 26); row += 1) {
      for (let col = 0; col < Math.floor((w - 16) / 20); col += 1) {
        if ((i * 7 + row * 5 + col * 3) % 4 === 0) {
          lights.push(<rect key={`${i}-${row}-${col}`} x={x + 12 + col * 20} y={top + 16 + row * 26} width="8" height="12" fill="#e8ce85" opacity="0.75" />);
        }
      }
    }
  });
  return <g>{lights}</g>;
}

export default function HeroArt() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060b15" />
          <stop offset="0.5" stopColor="#0f1b33" />
          <stop offset="0.82" stopColor="#3b3250" />
          <stop offset="1" stopColor="#9a7640" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3d58a" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#d9b65f" stopOpacity="0.4" />
          <stop offset="1" stopColor="#c9a24b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a40" />
          <stop offset="1" stopColor="#070d18" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#hero-sky)" />
      {[[120, 90], [300, 160], [520, 70], [760, 130], [980, 60], [1240, 110], [1450, 70], [60, 230], [680, 40]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#f3f0e8" opacity="0.7" />
      ))}
      <circle cx="1130" cy="600" r="300" fill="url(#hero-sun)" />
      <circle cx="1130" cy="640" r="58" fill="#f3d58a" opacity="0.92" />

      <g fill="#1a2640" opacity="0.9">
        {BACK.map(([x, w, h]) => (
          <rect key={`b${x}`} x={x} y={GROUND - h} width={w} height={h} />
        ))}
      </g>
      <g fill="#0b1426">
        {FRONT.map(([x, w, h]) => (
          <rect key={`f${x}`} x={x} y={GROUND - h} width={w} height={h} />
        ))}
      </g>
      <Windows buildings={FRONT} />

      {/* tower crane */}
      <g stroke="#0b1426" strokeWidth="7" fill="none" strokeLinecap="square">
        <path d="M1380 760V330M1380 330h-210M1380 330h110M1380 330l-70-60M1380 330l60-60M1310 270h130" />
        <path d="M1195 330v70" strokeWidth="3" />
      </g>
      <rect x="1180" y="400" width="30" height="22" fill="#c9a24b" opacity="0.85" />

      <rect x="0" y={GROUND} width="1600" height={900 - GROUND} fill="url(#hero-water)" />
      <rect x="1060" y={GROUND} width="150" height="140" fill="#f3d58a" opacity="0.12" />

      {/* container ship */}
      <g>
        <path d="M80 790h430l-40 36H122z" fill="#070d18" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`c1-${i}`} x={130 + i * 56} y="752" width="50" height="38" fill={i % 2 ? '#c9a24b' : '#22334f'} opacity="0.95" />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={`c2-${i}`} x={158 + i * 56} y="714" width="50" height="38" fill={i % 2 ? '#22334f' : '#a98233'} opacity="0.95" />
        ))}
        <rect x="450" y="730" width="34" height="60" fill="#111c32" />
        <rect x="456" y="738" width="22" height="8" fill="#e8ce85" opacity="0.8" />
      </g>
    </svg>
  );
}
