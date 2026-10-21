// 마을 배경 그림 (1600×1000, 화면에 맞춰 잘림). 게임판이 잘 보이게 가운데는 단순하게, 꾸밈은 가장자리에.
const INK = '#3A2A1C';
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
const sky = (id, top, bottom) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#${id})"/>`;
const cloud = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 40 C0 10 40 0 60 20 C80 -10 140 0 140 30 C170 30 180 70 150 76 H10 C-20 76 -20 44 0 40Z" fill="#fff" stroke="${INK}" stroke-width="6"/></g>`;
const roundTree = (x, y, s = 1, leaf = '#5DBB63') => `<g transform="translate(${x} ${y}) scale(${s})">
<rect x="-14" y="40" width="28" height="90" rx="8" fill="#A8652A" stroke="${INK}" stroke-width="7"/>
<circle cx="0" cy="0" r="70" fill="${leaf}" stroke="${INK}" stroke-width="7"/><circle cx="-24" cy="-20" r="12" fill="#fff" opacity=".3"/></g>`;

export const BACKGROUNDS = {
  'forest-base': svg(`${sky('s', '#A9DCF2', '#E3F5E0')}
${cloud(180, 90, 1.1)}${cloud(1240, 120, 0.9)}
<path d="M0 640 C300 560 520 600 800 640 C1080 680 1300 590 1600 620 V1000 H0Z" fill="#9ED37F" stroke="${INK}" stroke-width="7"/>
<path d="M0 760 C360 700 700 760 1000 740 C1260 724 1440 700 1600 720 V1000 H0Z" fill="#7CC261"/>
${roundTree(90, 560, 1.2)}${roundTree(250, 620, 0.9, '#4FAE59')}${roundTree(1480, 560, 1.25, '#4FAE59')}${roundTree(1330, 640, 0.85)}
<g transform="translate(1180 820)"><rect x="-10" y="0" width="20" height="40" rx="6" fill="#FFF6E6" stroke="${INK}" stroke-width="6"/><path d="M-44 4 C-44 -40 44 -40 44 4Z" fill="#FF6B5E" stroke="${INK}" stroke-width="6"/><circle cx="-14" cy="-14" r="7" fill="#fff"/><circle cx="16" cy="-8" r="6" fill="#fff"/></g>`),

  'sea-base': svg(`${sky('s', '#9FD8F5', '#E7F7FD')}
${cloud(220, 100, 1)}${cloud(1260, 80, 1.1)}
<path d="M60 560 L190 330 L260 420 L320 360 L430 560Z" fill="#FFFFFF" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<path d="M190 330 L215 420 L260 420Z" fill="#D9F0FA"/>
<path d="M1220 560 L1330 380 L1410 470 L1470 420 L1560 560Z" fill="#FFFFFF" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<path d="M0 540 H1600 V1000 H0Z" fill="#4DB2E3"/>
<path d="M0 540 C100 520 200 560 300 540 C400 520 500 560 600 540 C700 520 800 560 900 540 C1000 520 1100 560 1200 540 C1300 520 1400 560 1500 540 C1550 530 1580 540 1600 540" fill="none" stroke="${INK}" stroke-width="7"/>
<path d="M0 700 C200 680 400 720 600 700 C800 680 1000 720 1200 700 C1400 680 1500 700 1600 700 V1000 H0Z" fill="#3A9ED3"/>
<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"><path d="M140 640 q30 -16 60 0"/><path d="M1380 620 q30 -16 60 0"/><path d="M1180 880 q30 -16 60 0"/><path d="M260 900 q30 -16 60 0"/></g>`),

  'dino-base': svg(`${sky('s', '#FFD9A8', '#FFF1DC')}
${cloud(1200, 90, 0.9)}
<path d="M120 600 L330 260 L380 300 L420 250 L640 600Z" fill="#B27A55" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<path d="M330 260 L380 300 L420 250 C400 200 350 200 330 260Z" fill="#FF7A59" stroke="${INK}" stroke-width="6"/>
<circle cx="360" cy="170" r="30" fill="#EADFD3" stroke="${INK}" stroke-width="5"/><circle cx="410" cy="120" r="22" fill="#EADFD3" stroke="${INK}" stroke-width="5"/>
<path d="M0 620 C300 580 600 640 900 610 C1200 580 1400 620 1600 600 V1000 H0Z" fill="#E6C27A" stroke="${INK}" stroke-width="7"/>
<path d="M0 780 C400 740 800 800 1200 770 C1400 755 1520 760 1600 770 V1000 H0Z" fill="#D9AE5F"/>
<g transform="translate(1440 600)"><rect x="-12" y="-220" width="24" height="230" rx="10" fill="#A8652A" stroke="${INK}" stroke-width="6"/>
<path d="M0 -220 C-80 -260 -150 -220 -170 -180 C-110 -210 -60 -210 0 -220Z M0 -220 C80 -260 150 -220 170 -180 C110 -210 60 -210 0 -220Z M0 -220 C-40 -300 20 -320 60 -300 C20 -290 10 -260 0 -220Z" fill="#5DBB63" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></g>
<g transform="translate(90 720)" fill="#6CC04A" stroke="${INK}" stroke-width="6"><path d="M0 0 C-10 -60 10 -120 40 -150 C30 -100 30 -50 20 0Z"/><path d="M30 0 C40 -50 80 -90 120 -100 C90 -60 70 -30 60 0Z"/></g>`),

  'farm-base': svg(`${sky('s', '#A9DCF2', '#EAF7FC')}
${cloud(260, 90, 1)}${cloud(1180, 120, 0.9)}
<path d="M0 600 C320 560 640 620 960 590 C1240 566 1440 580 1600 590 V1000 H0Z" fill="#9ED37F" stroke="${INK}" stroke-width="7"/>
<g transform="translate(1300 330)"><path d="M0 120 L120 20 L240 120 V290 H0Z" fill="#E8584A" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<path d="M-20 130 L120 10 L260 130" fill="none" stroke="#FFF6E6" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="80" y="170" width="80" height="120" fill="#FFF6E6" stroke="${INK}" stroke-width="6"/><path d="M80 170 L160 290 M160 170 L80 290" stroke="#E8584A" stroke-width="8"/>
<circle cx="120" cy="100" r="22" fill="#FFF6E6" stroke="${INK}" stroke-width="6"/></g>
<g stroke="${INK}" stroke-width="6" fill="#FFF6E6"><rect x="40" y="560" width="22" height="120" rx="6"/><rect x="180" y="560" width="22" height="120" rx="6"/><rect x="320" y="560" width="22" height="120" rx="6"/>
<rect x="20" y="585" width="340" height="20" rx="8"/><rect x="20" y="635" width="340" height="20" rx="8"/></g>
<path d="M0 800 C400 760 800 820 1200 790 C1400 775 1520 780 1600 790 V1000 H0Z" fill="#7CC261"/>`),
};
