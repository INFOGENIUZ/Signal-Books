/**
 * Google Drive link parser and URL generator
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - Direct IDs
 */

export interface GoogleDriveParsedInfo {
  isDrive: boolean;
  fileId: string | null;
  originalUrl: string;
  previewUrl: string;
  downloadUrl: string;
  viewUrl: string;
  thumbnailUrl: string; // First page thumbnail directly from Google Drive
}

/**
 * Generates an elegant SVG Data URL for the book's 1st page (title cover)
 * Used automatically when admin uploads a book so no manual image upload is required.
 */
export function generateFirstPageBookCover(
  title: string = 'Kitob', 
  author: string = 'Muallif', 
  category: string = 'Badiiy adabiyot',
  year: number = new Date().getFullYear()
): string {
  const safeTitle = (title || 'Kitob').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAuthor = (author || 'Muallif').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = (category || 'Kutubxona').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Pick an elegant palette based on title character code
  const palettes = [
    { bg: '#131b2e', accent: '#38bdf8', gold: '#fbbf24', border: '#1e293b' },
    { bg: '#1c1917', accent: '#f59e0b', gold: '#fde68a', border: '#292524' },
    { bg: '#064e3b', accent: '#34d399', gold: '#fef08a', border: '#065f46' },
    { bg: '#4c0519', accent: '#fb7185', gold: '#fed7aa', border: '#881337' },
    { bg: '#1e1b4b', accent: '#818cf8', gold: '#fde047', border: '#312e81' },
  ];
  const charSum = (title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = palettes[charSum % palettes.length];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color.bg}" />
        <stop offset="100%" stop-color="#090d16" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color.gold}" />
        <stop offset="50%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="${color.gold}" />
      </linearGradient>
      <pattern id="ornament" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="${color.accent}" stroke-width="0.75" opacity="0.08"/>
      </pattern>
    </defs>
    
    <!-- Cover Background -->
    <rect width="600" height="900" fill="url(#bgGrad)" />
    <rect width="600" height="900" fill="url(#ornament)" />

    <!-- Spine shadow -->
    <rect x="0" y="0" width="35" height="900" fill="black" opacity="0.25" />
    <line x1="35" y1="0" x2="35" y2="900" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

    <!-- Decorative Border Frames -->
    <rect x="45" y="45" width="510" height="810" fill="none" stroke="${color.gold}" stroke-width="2" opacity="0.6" rx="4" />
    <rect x="53" y="53" width="494" height="794" fill="none" stroke="${color.gold}" stroke-width="0.75" stroke-dasharray="4,4" opacity="0.4" rx="2" />

    <!-- Corner Ornaments -->
    <path d="M 45 65 L 65 65 L 65 45" fill="none" stroke="${color.gold}" stroke-width="3" />
    <path d="M 555 65 L 535 65 L 535 45" fill="none" stroke="${color.gold}" stroke-width="3" />
    <path d="M 45 835 L 65 835 L 65 855" fill="none" stroke="${color.gold}" stroke-width="3" />
    <path d="M 555 835 L 535 835 L 535 855" fill="none" stroke="${color.gold}" stroke-width="3" />

    <!-- Header / Category Badge -->
    <text x="300" y="140" text-anchor="middle" fill="${color.gold}" font-size="14" font-family="sans-serif" font-weight="600" letter-spacing="4" opacity="0.85">
      ${safeCategory.toUpperCase()}
    </text>
    <line x1="220" y1="160" x2="380" y2="160" stroke="${color.gold}" stroke-width="1" opacity="0.5" />

    <!-- Emblem -->
    <g transform="translate(270, 210) scale(1.2)">
      <polygon points="25,5 45,45 5,45" fill="none" stroke="${color.gold}" stroke-width="1.5" opacity="0.6"/>
      <circle cx="25" cy="28" r="8" fill="none" stroke="${color.accent}" stroke-width="1.5" opacity="0.8"/>
    </g>

    <!-- Book Title -->
    <foreignObject x="75" y="320" width="450" height="260">
      <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; height:100%; font-family:serif; color:#ffffff;">
        <h1 style="font-size:36px; font-weight:700; line-height:1.25; margin:0; text-shadow:0 2px 10px rgba(0,0,0,0.8); letter-spacing:0.5px; color:#ffffff;">
          ${safeTitle}
        </h1>
        <div style="width:80px; height:2px; background:${color.gold}; margin:24px auto 0 auto; opacity:0.8;"></div>
      </div>
    </foreignObject>

    <!-- Author Name -->
    <text x="300" y="660" text-anchor="middle" fill="#ffffff" font-size="22" font-family="serif" font-style="italic" font-weight="500" letter-spacing="1">
      ${safeAuthor}
    </text>

    <!-- Bottom Footer Tag -->
    <text x="300" y="780" text-anchor="middle" fill="${color.gold}" font-size="12" font-family="sans-serif" letter-spacing="3" opacity="0.8">
      SIGNAL BOOKS • ${year}
    </text>
    <text x="300" y="805" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif" letter-spacing="1" opacity="0.6">
      1-SAHIFA • ASL NUSXA
    </text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates a luxury SVG Data URL specifically for Audio Books
 * Contains headphones emblem, sound waves, author and narrator credentials.
 */
export function generateAudioBookCover(
  title: string = 'Audio Kitob',
  author: string = 'Muallif',
  narrator: string = 'Professional suxandon',
  category: string = 'Audio kitoblar',
  year: number = new Date().getFullYear()
): string {
  const safeTitle = (title || 'Audio Kitob').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAuthor = (author || 'Muallif').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeNarrator = (narrator || 'Professional suxandon').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = (category || 'Ovozli kutubxona').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
    <defs>
      <linearGradient id="audioBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#190F07" />
        <stop offset="50%" stop-color="#120A05" />
        <stop offset="100%" stop-color="#080503" />
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="38%" r="45%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25" />
        <stop offset="60%" stop-color="#ea580c" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="600" height="900" fill="url(#audioBg)" />
    <rect width="600" height="900" fill="url(#centerGlow)" />

    <!-- Vinyl Grooves Graphic -->
    <circle cx="300" cy="330" r="230" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.06" />
    <circle cx="300" cy="330" r="190" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.08" />
    <circle cx="300" cy="330" r="150" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.1" />

    <!-- Luxury Borders -->
    <rect x="24" y="24" width="552" height="852" rx="16" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.3" />
    <rect x="34" y="34" width="532" height="832" rx="12" fill="none" stroke="#ea580c" stroke-width="0.8" opacity="0.2" />

    <!-- Top Badge -->
    <rect x="190" y="60" width="220" height="34" rx="17" fill="#26170c" stroke="#f59e0b" stroke-width="1" opacity="0.75" />
    <text x="300" y="82" text-anchor="middle" fill="#fbbf24" font-size="12" font-family="sans-serif" font-weight="700" letter-spacing="3">
      🎧 AUDIO KITOB
    </text>

    <!-- Category -->
    <text x="300" y="130" text-anchor="middle" fill="#d97706" font-size="12" font-family="sans-serif" font-weight="600" letter-spacing="4" opacity="0.85">
      ${safeCategory.toUpperCase()}
    </text>

    <!-- Headphones Big Graphic -->
    <g transform="translate(230, 180) scale(2.8)">
      <!-- Headband -->
      <path d="M 10 28 A 15 15 0 0 1 40 28" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" />
      <!-- Left Ear Cup -->
      <rect x="6" y="24" width="7" height="15" rx="3.5" fill="url(#goldGrad)" />
      <!-- Right Ear Cup -->
      <rect x="37" y="24" width="7" height="15" rx="3.5" fill="url(#goldGrad)" />
      <!-- Inner detail -->
      <line x1="9.5" y1="27" x2="9.5" y2="36" stroke="#120A05" stroke-width="1.5" />
      <line x1="40.5" y1="27" x2="40.5" y2="36" stroke="#120A05" stroke-width="1.5" />
    </g>

    <!-- Sound Wave Bars Graphic -->
    <g transform="translate(180, 340)">
      <rect x="0" y="16" width="4" height="20" rx="2" fill="#f59e0b" opacity="0.6"/>
      <rect x="12" y="10" width="4" height="32" rx="2" fill="#f59e0b" opacity="0.75"/>
      <rect x="24" y="4" width="4" height="44" rx="2" fill="#f59e0b" opacity="0.85"/>
      <rect x="36" y="14" width="4" height="24" rx="2" fill="#f59e0b" opacity="0.7"/>
      <rect x="48" y="0" width="4" height="52" rx="2" fill="#fbbf24" opacity="0.95"/>
      <rect x="60" y="8" width="4" height="36" rx="2" fill="#f59e0b" opacity="0.8"/>
      <rect x="72" y="2" width="4" height="48" rx="2" fill="#fbbf24" opacity="0.9"/>
      <rect x="84" y="12" width="4" height="28" rx="2" fill="#f59e0b" opacity="0.75"/>
      <rect x="96" y="6" width="4" height="40" rx="2" fill="#fbbf24" opacity="0.85"/>
      <rect x="108" y="0" width="4" height="52" rx="2" fill="#f59e0b" opacity="0.95"/>
      <rect x="120" y="10" width="4" height="32" rx="2" fill="#f59e0b" opacity="0.8"/>
      <rect x="132" y="2" width="4" height="48" rx="2" fill="#fbbf24" opacity="0.9"/>
      <rect x="144" y="16" width="4" height="20" rx="2" fill="#f59e0b" opacity="0.65"/>
      <rect x="156" y="8" width="4" height="36" rx="2" fill="#f59e0b" opacity="0.8"/>
      <rect x="168" y="14" width="4" height="24" rx="2" fill="#f59e0b" opacity="0.7"/>
      <rect x="180" y="4" width="4" height="44" rx="2" fill="#f59e0b" opacity="0.85"/>
      <rect x="192" y="12" width="4" height="28" rx="2" fill="#f59e0b" opacity="0.7"/>
      <rect x="204" y="8" width="4" height="36" rx="2" fill="#f59e0b" opacity="0.75"/>
      <rect x="216" y="16" width="4" height="20" rx="2" fill="#f59e0b" opacity="0.6"/>
      <rect x="228" y="20" width="4" height="12" rx="2" fill="#f59e0b" opacity="0.5"/>
    </g>

    <!-- Book Title -->
    <foreignObject x="60" y="425" width="480" height="200">
      <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; height:100%; font-family:serif; color:#ffffff;">
        <h1 style="font-size:32px; font-weight:700; line-height:1.25; margin:0; text-shadow:0 3px 12px rgba(0,0,0,0.9); letter-spacing:0.5px; color:#ffffff;">
          ${safeTitle}
        </h1>
        <div style="width:70px; height:2.5px; background:linear-gradient(90deg, transparent, #fbbf24, transparent); margin:18px auto 0 auto;"></div>
      </div>
    </foreignObject>

    <!-- Author Name -->
    <text x="300" y="650" text-anchor="middle" fill="#fde68a" font-size="22" font-family="serif" font-style="italic" font-weight="600" letter-spacing="1">
      ${safeAuthor}
    </text>

    <!-- Narrator Badge -->
    <rect x="120" y="685" width="360" height="42" rx="21" fill="#1C1108" stroke="#f59e0b" stroke-width="1" opacity="0.7" />
    <text x="300" y="711" text-anchor="middle" fill="#d97706" font-size="13" font-family="sans-serif" font-weight="600" letter-spacing="0.5">
      🎙️ Suxandon: <tspan fill="#ffffff" font-weight="700">${safeNarrator}</tspan>
    </text>

    <!-- Bottom Footer Tag -->
    <text x="300" y="800" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="sans-serif" font-weight="700" letter-spacing="3" opacity="0.8">
      SIGNAL BOOKS • OVOZLI KUTUBXONA
    </text>
    <text x="300" y="825" text-anchor="middle" fill="#78716c" font-size="10" font-family="sans-serif" letter-spacing="1.5">
      STUDIO HQ STEREO • ${year}
    </text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function parseGoogleDriveUrl(url: string = ''): GoogleDriveParsedInfo {
  if (!url || typeof url !== 'string') {
    return {
      isDrive: false,
      fileId: null,
      originalUrl: '',
      previewUrl: '',
      downloadUrl: '',
      viewUrl: '',
      thumbnailUrl: ''
    };
  }

  const trimmed = url.trim();

  // Check pattern: /(?:file|document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)
  const matchFileD = trimmed.match(/\/(?:file|document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    const id = matchFileD[1];
    return {
      isDrive: true,
      fileId: id,
      originalUrl: trimmed,
      previewUrl: `https://drive.google.com/file/d/${id}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`
    };
  }

  // Check pattern: [?&]id=([a-zA-Z0-9_-]+) or /open?id=...
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    const id = matchIdParam[1];
    return {
      isDrive: true,
      fileId: id,
      originalUrl: trimmed,
      previewUrl: `https://drive.google.com/file/d/${id}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`
    };
  }

  // If plain ID of typical length (25-45 characters alphanumeric)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return {
      isDrive: true,
      fileId: trimmed,
      originalUrl: `https://drive.google.com/file/d/${trimmed}/view`,
      previewUrl: `https://drive.google.com/file/d/${trimmed}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${trimmed}`,
      viewUrl: `https://drive.google.com/file/d/${trimmed}/view`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${trimmed}&sz=w800`
    };
  }

  // Not a recognizable Google Drive URL, return normal URL
  return {
    isDrive: false,
    fileId: null,
    originalUrl: trimmed,
    previewUrl: trimmed,
    downloadUrl: trimmed,
    viewUrl: trimmed,
    thumbnailUrl: ''
  };
}
