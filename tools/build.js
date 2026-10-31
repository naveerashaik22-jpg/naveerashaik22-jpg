// NØVERRA asset generator — run: node tools/build.js
// Emits self-contained SVGs into ../assets (no external fonts/images, so GitHub renders them as-is).
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
const ICONS = path.join(__dirname, 'icons');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  midnight: '#05040B', deep: '#10091F', violet: '#4B1F83',
  lavender: '#A78BFA', star: '#E9DFFF', blue: '#6475FF',
};
const SERIF = "'Cormorant Garamond','Playfair Display',Georgia,'Times New Roman',serif";
const SANS = "'Inter','Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Courier New',monospace";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => +n.toFixed(2);

function starfield({ n, w, h, seed, yMax = h, twinkle = 0, tint = true }) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * yMax;
    const big = r() < 0.08;
    const rad = big ? 0.9 + r() * 0.9 : 0.25 + r() * 0.65;
    const op = 0.25 + r() * 0.7;
    const col = tint && r() < 0.25 ? C.lavender : C.star;
    if (i < twinkle) {
      const d = 2.5 + r() * 4, b = r() * 5;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="${col}" opacity="${f(op)}"><animate attributeName="opacity" values="${f(op)};${f(op * 0.15)};${f(op)}" dur="${f(d)}s" begin="-${f(b)}s" repeatCount="indefinite"/></circle>`;
    } else {
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="${col}" opacity="${f(op)}"/>`;
    }
  }
  return s;
}

// Four-point sparkle with soft halo and fine cross-flares.
function sparkle(x, y, r, { flare = 0, halo = 1, pulse = false } = {}) {
  const k = r * 0.12;
  const body = `M${x},${y - r} Q${x + k},${y - k} ${x + r},${y} Q${x + k},${y + k} ${x},${y + r} Q${x - k},${y + k} ${x - r},${y} Q${x - k},${y - k} ${x},${y - r}Z`;
  let s = `<circle cx="${x}" cy="${y}" r="${r * 1.6}" fill="url(#halo)" opacity="${halo}">${pulse ? `<animate attributeName="opacity" values="${halo};${halo * 0.55};${halo}" dur="5s" repeatCount="indefinite"/>` : ''}</circle>`;
  if (flare) {
    s += `<rect x="${x - flare}" y="${y - 0.5}" width="${flare * 2}" height="1" fill="url(#flareH)"/>`;
    s += `<rect x="${x - 0.5}" y="${y - flare * 0.7}" width="1" height="${flare * 1.4}" fill="url(#flareV)"/>`;
  }
  s += `<path d="${body}" fill="${C.star}" filter="url(#glowS)"/>`;
  return s;
}

function icon(name, x, y, size) {
  const raw = fs.readFileSync(path.join(ICONS, name + '.svg'), 'utf8');
  const fill = (raw.match(/fill="(#[0-9a-fA-F]+)"/) || [, C.star])[1];
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').replace(/<title>[\s\S]*?<\/title>/, '');
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}">${inner}</svg>`;
}

const COMMON_DEFS = `
  <radialGradient id="halo"><stop offset="0" stop-color="${C.star}" stop-opacity=".55"/><stop offset=".35" stop-color="${C.lavender}" stop-opacity=".22"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></radialGradient>
  <linearGradient id="flareH" x1="0" x2="1"><stop offset="0" stop-color="${C.star}" stop-opacity="0"/><stop offset=".5" stop-color="${C.star}" stop-opacity=".9"/><stop offset="1" stop-color="${C.star}" stop-opacity="0"/></linearGradient>
  <linearGradient id="flareV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.star}" stop-opacity="0"/><stop offset=".5" stop-color="${C.star}" stop-opacity=".9"/><stop offset="1" stop-color="${C.star}" stop-opacity="0"/></linearGradient>
  <filter id="glowS" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="blur6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="blur14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <linearGradient id="border" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.lavender}" stop-opacity=".55"/><stop offset=".45" stop-color="${C.violet}" stop-opacity=".35"/><stop offset="1" stop-color="${C.blue}" stop-opacity=".5"/></linearGradient>
  <linearGradient id="ringG" x1="0" x2="1"><stop offset="0" stop-color="${C.lavender}" stop-opacity="0"/><stop offset=".25" stop-color="${C.lavender}" stop-opacity=".75"/><stop offset=".5" stop-color="${C.star}" stop-opacity=".95"/><stop offset=".75" stop-color="${C.blue}" stop-opacity=".7"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></linearGradient>
  <linearGradient id="lineG" x1="0" x2="1"><stop offset="0" stop-color="${C.lavender}" stop-opacity="0"/><stop offset="1" stop-color="${C.star}" stop-opacity=".8"/></linearGradient>
  <linearGradient id="lineGR" x1="0" x2="1"><stop offset="0" stop-color="${C.star}" stop-opacity=".8"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></linearGradient>`;

const wrap = (w, h, title, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">
<title>${title}</title>
<defs>${COMMON_DEFS}${defs}</defs>
${body}
</svg>
`;

// ───────────────────────── BANNER ─────────────────────────
function banner() {
  const W = 1200, H = 420;
  const defs = `
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <radialGradient id="bgA" cx=".8" cy=".25" r=".7"><stop offset="0" stop-color="${C.violet}" stop-opacity=".75"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="bgB" cx=".12" cy=".7" r=".6"><stop offset="0" stop-color="#2b1263" stop-opacity=".7"/><stop offset="1" stop-color="${C.deep}" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
  <linearGradient id="planet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0f38"/><stop offset=".12" stop-color="#0b0618"/><stop offset="1" stop-color="${C.midnight}"/></linearGradient>
  <linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="${C.violet}" stop-opacity="0"/><stop offset=".22" stop-color="${C.lavender}" stop-opacity=".8"/><stop offset=".5" stop-color="${C.star}"/><stop offset=".8" stop-color="${C.blue}" stop-opacity=".85"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
  <linearGradient id="title" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="${C.star}"/><stop offset="1" stop-color="#b9a4f2"/></linearGradient>
  <radialGradient id="moon" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#8d86a6"/><stop offset=".6" stop-color="#3b3354"/><stop offset="1" stop-color="#120d22"/></radialGradient>
  <filter id="glowT" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="9" result="b"/><feColorMatrix in="b" type="matrix" values="0.66 0 0 0 0.1  0 0.55 0 0 0.05  0 0 1 0 0.3  0 0 0 0.75 0" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  const cx = 600, cy = 215;
  const ringPath = (rx, ry) => `M${-rx},0 a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0`;

  const body = `
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${C.midnight}"/>
  <rect width="${W}" height="${H}" fill="url(#bgA)"/>
  <rect width="${W}" height="${H}" fill="url(#bgB)"/>

  <!-- nebula clouds -->
  <g filter="url(#blur30)">
    <ellipse cx="1040" cy="150" rx="210" ry="80" fill="#5a2aa6" opacity=".55" transform="rotate(-24 1040 150)"/>
    <ellipse cx="1130" cy="330" rx="200" ry="90" fill="#7a4fd0" opacity=".45"/>
    <ellipse cx="90" cy="300" rx="200" ry="80" fill="#3b1a78" opacity=".6" transform="rotate(18 90 300)"/>
    <ellipse cx="330" cy="40" rx="190" ry="40" fill="#2a1260" opacity=".5" transform="rotate(-8 330 40)"/>
    <ellipse cx="780" cy="30" rx="150" ry="30" fill="#3a1d78" opacity=".4"/>
  </g>
  <g filter="url(#blur14)" opacity=".7">
    <ellipse cx="1090" cy="270" rx="110" ry="26" fill="#9d7bf0" opacity=".45" transform="rotate(-14 1090 270)"/>
    <ellipse cx="1000" cy="360" rx="150" ry="22" fill="#b79cff" opacity=".35" transform="rotate(-6 1000 360)"/>
    <ellipse cx="130" cy="350" rx="140" ry="20" fill="#7a58d6" opacity=".4" transform="rotate(10 130 350)"/>
  </g>

  <!-- distant galaxy -->
  <g transform="translate(205 92) rotate(-28)" opacity=".85">
    <ellipse rx="46" ry="11" fill="${C.lavender}" opacity=".28" filter="url(#blur6)"/>
    <ellipse rx="26" ry="6" fill="${C.star}" opacity=".35" filter="url(#blur6)"/>
    <ellipse rx="3.5" ry="2" fill="#fff" opacity=".9"/>
  </g>

  <!-- star dust -->
  ${starfield({ n: 360, w: W, h: H, seed: 11, yMax: 330, twinkle: 34 })}

  <!-- light trails -->
  <line x1="70" y1="48" x2="270" y2="118" stroke="url(#lineG)" stroke-width="1" opacity=".45"/>
  <line x1="930" y1="22" x2="1120" y2="96" stroke="url(#lineG)" stroke-width=".8" opacity=".35"/>

  <!-- moon -->
  <circle cx="1088" cy="34" r="40" fill="url(#moon)" opacity=".9"/>
  <circle cx="1088" cy="34" r="40" fill="none" stroke="${C.lavender}" stroke-opacity=".25"/>

  <!-- orbital rings behind title -->
  <g transform="translate(${cx} ${cy}) rotate(-7)">
    <path d="${ringPath(560, 92)}" fill="none" stroke="url(#ringG)" stroke-width="1.3" opacity=".6"/>
    <path d="${ringPath(470, 70)}" fill="none" stroke="${C.lavender}" stroke-opacity=".28" stroke-width="1" stroke-dasharray="2 9"/>
    <path d="${ringPath(620, 118)}" fill="none" stroke="url(#ringG)" stroke-width=".8" opacity=".3"/>
    <circle r="3.4" fill="${C.star}" filter="url(#glowS)"><animateMotion dur="38s" repeatCount="indefinite" path="${ringPath(560, 92)}"/></circle>
    <circle r="2.2" fill="${C.blue}" filter="url(#glowS)"><animateMotion dur="55s" repeatCount="indefinite" rotate="auto" path="${ringPath(470, 70)}"/></circle>
  </g>

  <!-- luminous stars -->
  ${sparkle(600, 82, 15, { flare: 70, pulse: true })}
  ${sparkle(1010, 140, 24, { flare: 120, pulse: true })}
  ${sparkle(185, 215, 6, { flare: 22 })}
  ${sparkle(905, 300, 5, { flare: 16 })}

  <!-- planetary horizon -->
  <circle cx="560" cy="1090" r="780" fill="none" stroke="${C.blue}" stroke-width="26" opacity=".18" filter="url(#blur14)"/>
  <circle cx="560" cy="1090" r="776" fill="none" stroke="${C.lavender}" stroke-width="9" opacity=".5" filter="url(#blur6)"/>
  <circle cx="560" cy="1090" r="772" fill="url(#planet)"/>
  <circle cx="560" cy="1090" r="772" fill="none" stroke="url(#rim)" stroke-width="2.2"/>
  <g clip-path="url(#frame)" opacity=".5">
    <path d="M-20 392 Q300 330 620 330 T1240 372" fill="none" stroke="${C.lavender}" stroke-opacity=".18"/>
    <path d="M-20 410 Q320 360 640 356 T1240 396" fill="none" stroke="${C.blue}" stroke-opacity=".16"/>
  </g>
  <g opacity=".55">${starfield({ n: 46, w: W, h: 40, seed: 77, yMax: 1, tint: true }).replace(/cy="([\d.]+)"/g, (m, y) => `cy="${380 + +y * 36}"`).replace(/r="[\d.]+"/g, 'r="0.7"')}</g>

  <!-- title -->
  <line x1="205" y1="190" x2="330" y2="190" stroke="url(#lineG)" stroke-width="1"/>
  <line x1="870" y1="190" x2="995" y2="190" stroke="url(#lineGR)" stroke-width="1"/>
  <text x="${cx + 12}" y="212" text-anchor="middle" font-family="${SERIF}" font-size="82" font-weight="500" letter-spacing="24" fill="url(#title)" filter="url(#glowT)">NØVERRA</text>
  <text x="${cx + 6}" y="262" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="500" letter-spacing="9" fill="${C.star}" opacity=".85">EXPLORE · BUILD · INNOVATE</text>

  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="url(#border)"/>`;
  return wrap(W, H, 'NØVERRA — Explore, Build, Innovate', defs, body);
}

// ───────────────────────── ABOUT ─────────────────────────
function about() {
  const W = 1200, H = 310;
  const defs = `
  <clipPath id="p"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c0719"/><stop offset="1" stop-color="#120a26"/></linearGradient>
  <radialGradient id="glowR" cx=".85" cy=".45" r=".55"><stop offset="0" stop-color="${C.violet}" stop-opacity=".55"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="pl" cx=".32" cy=".3" r=".85"><stop offset="0" stop-color="#6f4cc4"/><stop offset=".45" stop-color="#2a1259"/><stop offset="1" stop-color="#0a0618"/></radialGradient>
  <linearGradient id="statement" x1="0" x2="1"><stop offset="0" stop-color="${C.lavender}"/><stop offset="1" stop-color="${C.star}"/></linearGradient>`;

  const ring = (rx, ry) => `M${-rx},0 A${rx},${ry} 0 1,0 ${rx},0 A${rx},${ry} 0 1,0 ${-rx},0`;
  const ox = 975, oy = 155;
  const body = `
<g clip-path="url(#p)">
  <rect width="${W}" height="${H}" fill="url(#panel)"/>
  <rect width="${W}" height="${H}" fill="url(#glowR)"/>
  ${starfield({ n: 120, w: W, h: H, seed: 5, twinkle: 12 })}

  <!-- orbit illustration -->
  <g transform="translate(${ox} ${oy}) rotate(-17)">
    <path d="M-185,0 A185,46 0 0,1 185,0" fill="none" stroke="url(#ringG)" stroke-width="1" opacity=".5"/>
    <path d="M-148,0 A148,36 0 0,1 148,0" fill="none" stroke="${C.lavender}" stroke-opacity=".55" stroke-width="1.4"/>
    <path d="M-112,0 A112,27 0 0,1 112,0" fill="none" stroke="${C.blue}" stroke-opacity=".4" stroke-width="1" stroke-dasharray="2 7"/>
    <circle r="50" fill="url(#pl)"/>
    <circle r="50" fill="none" stroke="${C.lavender}" stroke-opacity=".5"/>
    <path d="M-40,-30 A50,50 0 0,1 30,-40" fill="none" stroke="${C.star}" stroke-opacity=".7" stroke-width="1.6" filter="url(#glowS)"/>
    <path d="M-185,0 A185,46 0 0,0 185,0" fill="none" stroke="url(#ringG)" stroke-width="1" opacity=".5"/>
    <path d="M-148,0 A148,36 0 0,0 148,0" fill="none" stroke="${C.star}" stroke-opacity=".75" stroke-width="1.6"/>
    <path d="M-112,0 A112,27 0 0,0 112,0" fill="none" stroke="${C.blue}" stroke-opacity=".4" stroke-width="1" stroke-dasharray="2 7"/>
    <circle r="3.2" fill="${C.star}" filter="url(#glowS)"><animateMotion dur="24s" repeatCount="indefinite" path="${ring(148, 36)}"/></circle>
    <circle r="2.2" fill="${C.blue}" filter="url(#glowS)"><animateMotion dur="40s" repeatCount="indefinite" path="${ring(185, 46)}"/></circle>
  </g>
  ${sparkle(1058, 78, 22, { flare: 70, pulse: true })}
  ${sparkle(842, 236, 5, { flare: 14 })}
  ${sparkle(1130, 250, 4, { flare: 10 })}

  <!-- heading -->
  <path d="M58,40 Q60.4,45.6 66,48 Q60.4,50.4 58,56 Q55.6,50.4 50,48 Q55.6,45.6 58,40Z" fill="${C.lavender}" filter="url(#glowS)"/>
  <text x="82" y="55" font-family="${SANS}" font-size="22" font-weight="600" letter-spacing="5" fill="${C.star}">ABOUT ME</text>
  <text x="${W - 56}" y="54" text-anchor="end" font-family="${MONO}" font-size="12" letter-spacing="1.5" fill="${C.lavender}" opacity=".8">SHAIK NAVEERA</text>
  <line x1="50" y1="76" x2="760" y2="76" stroke="url(#lineGR)" stroke-width="1" opacity=".5"/>
  <text x="50" y="100" font-family="${MONO}" font-size="12" letter-spacing="1.8" fill="#8e9bff">CREATIVE TECHNOLOGIST  ·  AI/ML EXPLORER  ·  B.TECH COMPUTER SCIENCE</text>

  <!-- copy -->
  <g font-family="${SANS}" font-size="17" fill="#cfc4ee">
    <text x="50" y="143">Hey, I'm <tspan fill="${C.lavender}" font-weight="600">Naveera</tspan> — a Computer Science undergraduate fascinated by</text>
    <text x="50" y="169">Artificial Intelligence, Machine Learning and creative software engineering.</text>
    <text x="50" y="205">I enjoy exploring unconventional ideas, experimenting with technology and</text>
    <text x="50" y="231">transforming concepts into meaningful projects.</text>
  </g>
  <text x="50" y="276" font-family="${SERIF}" font-style="italic" font-size="21" letter-spacing="7" fill="url(#statement)">— DREAM. DEVELOP. DISRUPT. —</text>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="url(#border)"/>`;
  return wrap(W, H, 'About — Hey, I\'m Naveera', defs, body);
}

// ───────────────────── ARSENAL + TERMINAL ─────────────────────
function arsenal() {
  const W = 1200, H = 290;
  const AW = 870;            // arsenal panel width
  const TX = 900, TW = 300;  // terminal panel
  const defs = `
  <clipPath id="pa"><rect width="${AW}" height="${H}" rx="18"/></clipPath>
  <clipPath id="pt"><rect x="${TX}" width="${TW}" height="${H}" rx="18"/></clipPath>
  <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c0719"/><stop offset="1" stop-color="#110a24"/></linearGradient>
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1031"/><stop offset="1" stop-color="#0f0820"/></linearGradient>
  <radialGradient id="tglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.lavender}" stop-opacity=".18"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></radialGradient>`;

  const groups = [
    { name: 'LANGUAGES', items: [['python', 'Python'], ['cplusplus', 'C++'], ['javascript', 'JavaScript']] },
    { name: 'WEB DEVELOPMENT', items: [['html5', 'HTML'], ['css3', 'CSS'], ['react', 'React']] },
    { name: 'AI / ML &amp; TOOLS', items: [['scikitlearn', ['Machine', 'Learning']], ['jupyter', 'Jupyter'], ['git', 'Git'], ['github', 'GitHub']] },
  ];
  const slot = 72, tile = 56, gap = 32;
  let x = 44, g = '';
  groups.forEach((grp, gi) => {
    const gw = grp.items.length * slot;
    g += `<text x="${x}" y="128" font-family="${SANS}" font-size="12.5" font-weight="600" letter-spacing="2.5" fill="${C.star}" opacity=".9">${grp.name}</text>`;
    g += `<line x1="${x}" y1="140" x2="${x + gw - 14}" y2="140" stroke="${C.lavender}" stroke-opacity=".22"/>`;
    grp.items.forEach(([ic, label], i) => {
      const tx = x + i * slot, ty = 158;
      g += `<circle cx="${tx + tile / 2}" cy="${ty + tile / 2}" r="${tile * 0.8}" fill="url(#tglow)"/>`;
      g += `<rect x="${tx}" y="${ty}" width="${tile}" height="${tile}" rx="15" fill="url(#tile)" stroke="${C.lavender}" stroke-opacity=".28"/>`;
      g += icon(ic, tx + (tile - 30) / 2, ty + (tile - 30) / 2, 30);
      const lines = Array.isArray(label) ? label : [label];
      lines.forEach((ln, li) => {
        g += `<text x="${tx + tile / 2}" y="${ty + tile + 20 + li * 13}" text-anchor="middle" font-family="${MONO}" font-size="10.5" fill="#a99fc9">${ln}</text>`;
      });
    });
    x += gw + gap;
    if (gi < groups.length - 1) g += `<line x1="${x - gap / 2 - 7}" y1="112" x2="${x - gap / 2 - 7}" y2="238" stroke="${C.lavender}" stroke-opacity=".18" stroke-dasharray="2 5"/>`;
  });

  // terminal typewriter
  const lines = ['coding...', 'learning...', 'building...', 'forever.'];
  const D = 14, step = 9.8, startX = TX + 34, baseY = 128, lh = 34;
  let ta = '', clips = '';
  let t0 = 0.05;
  lines.forEach((ln, i) => {
    const n = ln.length + 2;               // "> " + text
    const dur = (n * 0.07) / D;            // 70 ms per char
    const full = 250;
    const kt = [0], vv = [0];
    for (let k = 1; k <= n; k++) { kt.push(+(t0 + dur * k / n).toFixed(4)); vv.push(k === n ? full : f(step * k)); }
    kt.push(0.95); vv.push(0); kt.push(1); vv.push(0);
    clips += `<clipPath id="tc${i}"><rect x="${startX}" y="${baseY + i * lh - 20}" height="28" width="0"><animate attributeName="width" calcMode="discrete" dur="${D}s" repeatCount="indefinite" keyTimes="${kt.join(';')}" values="${vv.join(';')}"/></rect></clipPath>`;
    const col = i === lines.length - 1 ? C.star : '#cfc4ee';
    ta += `<text x="${startX}" y="${baseY + i * lh}" font-family="${MONO}" font-size="17" clip-path="url(#tc${i})"><tspan fill="${C.lavender}">&gt; </tspan><tspan fill="${col}">${ln}</tspan></text>`;
    t0 += dur + 0.045;
  });
  const lastEnd = t0 - 0.045;
  const cursor = `<rect x="${startX + 10 * (lines[3].length + 2) + 2}" y="${baseY + 3 * lh - 3}" width="10" height="2.2" fill="${C.star}" opacity="0"><animate attributeName="opacity" calcMode="discrete" dur="1.1s" repeatCount="indefinite" values="0.95;0" keyTimes="0;0.5"/></rect>`;

  const body = `
<g clip-path="url(#pa)">
  <rect width="${AW}" height="${H}" fill="url(#panel)"/>
  ${starfield({ n: 90, w: AW, h: H, seed: 21, twinkle: 8 })}
  <text x="44" y="56" font-family="${MONO}" font-size="19" font-weight="700" fill="${C.lavender}">&lt;/&gt;</text>
  <text x="96" y="56" font-family="${SANS}" font-size="22" font-weight="600" letter-spacing="5" fill="${C.star}">TECH ARSENAL</text>
  <text x="${AW - 40}" y="54" text-anchor="end" font-family="${MONO}" font-size="12" letter-spacing="1.5" fill="${C.lavender}" opacity=".75">TOOLS OF CREATION</text>
  <line x1="40" y1="78" x2="${AW - 40}" y2="78" stroke="url(#lineGR)" stroke-width="1" opacity=".45"/>
  ${g}
</g>
<rect x=".5" y=".5" width="${AW - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="url(#border)"/>

<defs>${clips}</defs>
<g clip-path="url(#pt)">
  <rect x="${TX}" width="${TW}" height="${H}" fill="#070510"/>
  <rect x="${TX}" width="${TW}" height="${H}" fill="url(#panel)" opacity=".55"/>
  ${starfield({ n: 55, w: TW, h: H, seed: 33, twinkle: 5 }).replace(/cx="([\d.]+)"/g, (m, v) => `cx="${+v + TX}"`)}
  <!-- ghost planet -->
  <g transform="translate(${TX + 232} ${H - 62}) rotate(-20)" opacity=".5">
    <circle r="40" fill="none" stroke="${C.lavender}" stroke-opacity=".5"/>
    <ellipse rx="40" ry="14" fill="none" stroke="${C.lavender}" stroke-opacity=".3"/>
    <ellipse rx="14" ry="40" fill="none" stroke="${C.lavender}" stroke-opacity=".3"/>
    <ellipse rx="78" ry="16" fill="none" stroke="${C.star}" stroke-opacity=".5"/>
  </g>
  <circle cx="${TX + 30}" cy="38" r="5.5" fill="#ff5f57" opacity=".85"/>
  <circle cx="${TX + 52}" cy="38" r="5.5" fill="#febc2e" opacity=".85"/>
  <circle cx="${TX + 74}" cy="38" r="5.5" fill="#28c840" opacity=".85"/>
  <text x="${TX + TW - 26}" y="42" text-anchor="end" font-family="${MONO}" font-size="11" fill="${C.lavender}" opacity=".6">naveera@noverra</text>
  <line x1="${TX}" y1="64" x2="${TX + TW}" y2="64" stroke="${C.lavender}" stroke-opacity=".15"/>
  ${ta}
  ${cursor}
</g>
<rect x="${TX + .5}" y=".5" width="${TW - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="url(#border)"/>`;
  return wrap(W, H, 'Tech arsenal and terminal', defs, body);
}

// ───────────────────────── FOOTER ─────────────────────────
function footer() {
  const W = 1200, H = 150;
  const defs = `
  <clipPath id="p"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <radialGradient id="fg" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="${C.violet}" stop-opacity=".6"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>`;
  const body = `
<g clip-path="url(#p)">
  <rect width="${W}" height="${H}" fill="#08050f"/>
  <rect width="${W}" height="${H}" fill="url(#fg)"/>
  ${starfield({ n: 120, w: W, h: H, seed: 99, twinkle: 12 })}
  ${sparkle(600, 36, 10, { flare: 60, pulse: true })}
  <text x="612" y="88" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="26" letter-spacing="1.5" fill="${C.star}">“A universe of ideas, in constant creation.”</text>
  <text x="606" y="122" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="6" fill="${C.lavender}" opacity=".85">NØVERRA  ·  SHAIK NAVEERA</text>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="url(#border)"/>`;
  return wrap(W, H, 'A universe of ideas, in constant creation', defs, body);
}

// Static twin of an animated SVG: no SMIL, typed terminal lines fully shown, cursor visible.
function toStatic(svg) {
  return svg
    .replace(/<circle[^>]*>\s*<animateMotion[\s\S]*?<\/circle>/g, '')
    .replace(/<animate[\s\S]*?\/>/g, '')
    .replace(/ clip-path="url\(#tc\d\)"/g, '')
    .replace(/(<rect [^>]*?) opacity="0"(>)/g, '$1 opacity=".95"$2');
}

const files = { 'banner.svg': banner(), 'about.svg': about(), 'arsenal.svg': arsenal(), 'footer.svg': footer() };
fs.mkdirSync(path.join(OUT, 'static'), { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), svg);
  fs.writeFileSync(path.join(OUT, 'static', name), toStatic(svg));
  console.log(name, (svg.length / 1024).toFixed(1) + ' KB');
}
