// One illustration per service, drawn as SVG so the site works with no image files.
// To use your own photographs, see "Replacing the artwork with real photos" in README.md.

const Frame = ({ id, from, to, children }) => (
<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect width="480" height="300" fill={`url(#${id})`} />
    {children}
  </svg>
);

const lit = (items, fill = '#e8ce85', opacity = 0.8) =>
  items.map(([x, y, w = 8, h = 11]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} />);

function Property() {
  return (
    <Frame id="art-property" from="#13213d" to="#4a3d5a">
      <circle cx="388" cy="88" r="36" fill="#e8ce85" opacity="0.9" />
      <rect x="36" y="104" width="76" height="196" fill="#0e1830" />
      <rect x="120" y="64" width="64" height="236" fill="#0a1326" />
      <rect x="320" y="124" width="92" height="176" fill="#0e1830" />
      {lit([[48, 120], [70, 120], [92, 120], [48, 152], [92, 152], [70, 184], [48, 216], [92, 216], [132, 84], [156, 84], [132, 116], [156, 148], [132, 180], [156, 212], [334, 142], [360, 142], [386, 142], [334, 178], [386, 178], [360, 214]])}
      <path d="M176 300V196l74-52 74 52v104z" fill="#182640" />
      <path d="M164 200l86-62 86 62" fill="none" stroke="#c9a24b" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="232" y="232" width="36" height="68" rx="3" fill="#c9a24b" />
      {lit([[196, 214, 20, 20], [284, 214, 20, 20]], '#f3d58a', 0.9)}
      <rect x="0" y="288" width="480" height="12" fill="#070d18" />
    </Frame>
  );
}

function Trade() {
  return (
    <Frame id="art-trade" from="#0d1730" to="#5a4a46">
      <circle cx="104" cy="96" r="30" fill="#e8ce85" opacity="0.85" />
      <path d="M0 214h480v86H0z" fill="#0a1224" />
      <path d="M0 236h480" stroke="#e8ce85" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="12 10" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={`a${i}`} x={88 + i * 62} y="152" width="58" height="42" fill={['#22334f', '#c9a24b', '#182640', '#a98233'][i]} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={`b${i}`} x={118 + i * 62} y="110" width="58" height="42" fill={['#c9a24b', '#22334f', '#e8ce85'][i]} opacity="0.95" />
      ))}
      <path d="M52 194h376l-34 40H88z" fill="#070d18" />
      <g stroke="#0a1224" strokeWidth="6" fill="none">
        <path d="M400 214V60h60M400 60l-70 0M330 60v40" />
      </g>
      <rect x="322" y="100" width="16" height="16" fill="#c9a24b" />
    </Frame>
  );
}

function Construction() {
  return (
    <Frame id="art-construction" from="#101c36" to="#5b4a50">
      <circle cx="404" cy="76" r="30" fill="#e8ce85" opacity="0.85" />
      <g fill="none" stroke="#c9a24b" strokeWidth="3">
        <rect x="120" y="116" width="170" height="184" />
        {[152, 188, 224, 260].map((y) => (
          <path key={y} d={`M120 ${y}h170`} />
        ))}
        {[162, 205, 248].map((x) => (
          <path key={x} d={`M${x} 116v184`} />
        ))}
      </g>
      <rect x="120" y="224" width="170" height="76" fill="#0e1830" opacity="0.9" />
      <g stroke="#0a1224" strokeWidth="7" fill="none">
        <path d="M356 300V70M356 70H196M356 70h70M356 70l-52-40M356 70l40-40" />
        <path d="M228 70v44" strokeWidth="3" />
      </g>
      <path d="M214 114h28l-6 20h-16z" fill="#e8ce85" />
      <rect x="0" y="288" width="480" height="12" fill="#070d18" />
    </Frame>
  );
}

function Utility() {
  return (
    <Frame id="art-utility" from="#0d1730" to="#33304a">
      <g stroke="#0a1224" strokeWidth="5" fill="none" strokeLinejoin="round">
        <path d="M240 40l-52 260M240 40l52 260M214 150h52M200 220h80M240 40V20M190 62h100M200 98h80" />
        <path d="M205 150l60 70M275 150l-60 70" strokeWidth="3" />
      </g>
      <g stroke="#e8ce85" strokeOpacity="0.7" strokeWidth="1.6" fill="none">
        <path d="M0 96Q95 126 190 62M290 62Q385 126 480 96" />
        <path d="M0 132Q95 162 200 98M280 98Q385 162 480 132" />
      </g>
      <path d="M96 190l-22 40h18l-8 34 34-48H98l16-26z" fill="#c9a24b" />
      <path d="M392 196c-14 22-24 34-24 48a24 24 0 0 0 48 0c0-14-10-26-24-48z" fill="#e8ce85" opacity="0.85" />
      <rect x="0" y="288" width="480" height="12" fill="#070d18" />
    </Frame>
  );
}

function Contractor() {
  return (
    <Frame id="art-contractor" from="#0f1b33" to="#182640">
      <g stroke="#c9a24b" strokeOpacity="0.22" strokeWidth="1">
        {Array.from({ length: 13 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 40} 0v300`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 40}h480`} />
        ))}
      </g>
      <g stroke="#e8ce85" strokeOpacity="0.55" strokeWidth="2" fill="none">
        <path d="M40 240h120v-70h90v70h60M40 240V120h120M310 240V130" />
        <path d="M52 262h98M280 262h130" strokeDasharray="6 6" />
      </g>
      <path d="M170 168a70 62 0 0 1 140 0v10H170z" fill="#c9a24b" />
      <rect x="150" y="176" width="180" height="20" rx="6" fill="#e8ce85" />
      <rect x="226" y="108" width="28" height="68" rx="6" fill="#a98233" />
      <path d="M392 70l36 36-14 14-36-36z" fill="#22334f" stroke="#c9a24b" strokeWidth="2" />
      <path d="M386 120l-60 60" stroke="#c9a24b" strokeWidth="6" strokeLinecap="round" />
    </Frame>
  );
}

function Cars() {
  return (
    <Frame id="art-cars" from="#0d1730" to="#47404f">
      <circle cx="378" cy="92" r="34" fill="#e8ce85" opacity="0.85" />
      <rect x="30" y="120" width="60" height="140" fill="#0e1830" />
      <rect x="380" y="140" width="80" height="120" fill="#0a1326" />
      {lit([[42, 138], [66, 138], [42, 176], [66, 214], [396, 158], [422, 158], [396, 196]])}
      <rect x="0" y="252" width="480" height="48" fill="#070d18" />
      <path d="M0 276h480" stroke="#e8ce85" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="22 16" />
      <path d="M96 252c0-22 8-30 28-34l38-40c8-8 18-12 30-12h72c14 0 26 5 36 15l22 25 34 8c14 3 22 12 22 28v10z" fill="#182640" stroke="#c9a24b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M178 176l-30 38h120l-26-30c-6-6-12-8-20-8z" fill="#0a1224" opacity="0.9" />
      <circle cx="158" cy="254" r="22" fill="#070d18" stroke="#c9a24b" strokeWidth="4" />
      <circle cx="326" cy="254" r="22" fill="#070d18" stroke="#c9a24b" strokeWidth="4" />
      <path d="M392 226l70-16v40l-70-8z" fill="#f3d58a" opacity="0.25" />
      <rect x="378" y="224" width="16" height="9" rx="3" fill="#f3d58a" />
    </Frame>
  );
}

const ART = { property: Property, trade: Trade, construction: Construction, utility: Utility, contractor: Contractor, cars: Cars };

export default function ServiceArt({ id }) {
  const Art = ART[id] ?? Property;
  return <Art />;
}
