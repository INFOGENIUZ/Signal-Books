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
 * Generates a luxury Square (1:1) SVG Data URL specifically for Audio Books
 * Designed with vinyl grooves, gold rim lighting, headphones emblem, and studio credentials.
 */
/**
 * Generates an ultra-crisp, high-fidelity luxury Audiobook cover in pure SVG (no foreignObject)
 * Perfectly compatible with all browser <img> tags without security restrictions.
 */
export function generateAudioBookCover(
  title: string,
  author: string,
  narrator: string = '',
  category: string = 'Badiiy adabiyot',
  year: number = new Date().getFullYear(),
  style: 'gold' | 'emerald' | 'sapphire' | 'violet' = 'gold'
): string {
  const safeTitle = (title || 'Audio Kitob').replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });

  const safeAuthor = (author || 'Muallif').replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      default: return c;
    }
  });

  const safeNarrator = (narrator && narrator !== 'Professional suxandon' ? narrator : '').replace(/[<>&"']/g, '');
  const safeCategory = (category || 'Ovozli kutubxona').replace(/[<>&"']/g, '');

  // Word wrap title into 1-3 lines cleanly without foreignObject
  const words = safeTitle.split(' ');
  const lines: string[] = [];
  let curLine = '';
  for (const w of words) {
    if ((curLine + ' ' + w).trim().length <= 22) {
      curLine = (curLine + ' ' + w).trim();
    } else {
      if (curLine) lines.push(curLine);
      curLine = w;
      if (lines.length >= 3) break;
    }
  }
  if (curLine && lines.length < 3) lines.push(curLine);
  if (lines.length === 0) lines.push(safeTitle.slice(0, 24));

  // Color palettes
  const palettes = {
    gold: {
      bg1: '#1A1208',
      bg2: '#0F0B05',
      accent1: '#fef08a',
      accent2: '#f59e0b',
      accent3: '#b45309',
      glow: '#f59e0b',
      badgeBg: '#26180B'
    },
    emerald: {
      bg1: '#071811',
      bg2: '#040F0A',
      accent1: '#a7f3d0',
      accent2: '#10b981',
      accent3: '#047857',
      glow: '#10b981',
      badgeBg: '#09291C'
    },
    sapphire: {
      bg1: '#081424',
      bg2: '#050D18',
      accent1: '#bae6fd',
      accent2: '#0ea5e9',
      accent3: '#0369a1',
      glow: '#0284c7',
      badgeBg: '#0C2038'
    },
    violet: {
      bg1: '#190A24',
      bg2: '#0F0517',
      accent1: '#f5d0fe',
      accent2: '#c026d3',
      accent3: '#701a75',
      glow: '#a21caf',
      badgeBg: '#250E36'
    }
  };

  const p = palettes[style] || palettes.gold;

  // Title vertical centering based on line count
  const titleStartY = lines.length === 1 ? 465 : lines.length === 2 ? 445 : 430;
  const lineHeight = 42;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
    <defs>
      <linearGradient id="audioBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg1}" />
        <stop offset="60%" stop-color="${p.bg2}" />
        <stop offset="100%" stop-color="#050302" />
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="36%" r="55%">
        <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.28" />
        <stop offset="50%" stop-color="${p.accent2}" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.accent1}" />
        <stop offset="50%" stop-color="${p.accent2}" />
        <stop offset="100%" stop-color="${p.accent3}" />
      </linearGradient>
    </defs>

    <!-- Canvas Background -->
    <rect width="800" height="800" fill="url(#audioBg)" />
    <rect width="800" height="800" fill="url(#centerGlow)" />

    <!-- Vinyl Disc Grooves & Audio Rings -->
    <circle cx="400" cy="270" r="230" fill="none" stroke="${p.accent2}" stroke-width="1.2" opacity="0.06" />
    <circle cx="400" cy="270" r="190" fill="none" stroke="${p.accent2}" stroke-width="1.2" opacity="0.09" />
    <circle cx="400" cy="270" r="150" fill="none" stroke="${p.accent2}" stroke-width="1.2" opacity="0.12" />
    <circle cx="400" cy="270" r="110" fill="none" stroke="${p.accent2}" stroke-width="1.5" opacity="0.16" />
    <circle cx="400" cy="270" r="70" fill="none" stroke="${p.accent2}" stroke-width="1.5" opacity="0.22" />

    <!-- Premium Frame Borders -->
    <rect x="32" y="32" width="736" height="736" rx="28" fill="none" stroke="url(#primaryGrad)" stroke-width="2.5" opacity="0.65" />
    <rect x="42" y="42" width="716" height="716" rx="20" fill="none" stroke="${p.accent2}" stroke-width="0.8" opacity="0.25" />

    <!-- Top Badge Row: Signal Audio Studio -->
    <rect x="250" y="58" width="300" height="36" rx="18" fill="${p.badgeBg}" stroke="url(#primaryGrad)" stroke-width="1.2" />
    <text x="400" y="81" text-anchor="middle" fill="${p.accent1}" font-size="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" letter-spacing="3.5">
      AUDIO KITOB • HQ STEREO
    </text>

    <!-- Category Label -->
    <text x="400" y="124" text-anchor="middle" fill="${p.accent2}" font-size="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" letter-spacing="3" opacity="0.9">
      ${safeCategory.toUpperCase()}
    </text>

    <!-- Central Headphones Icon -->
    <g transform="translate(346, 175) scale(2.2)">
      <path d="M 12 30 A 16 16 0 0 1 36 30" fill="none" stroke="url(#primaryGrad)" stroke-width="3.5" stroke-linecap="round" />
      <rect x="7" y="25" width="8" height="16" rx="4" fill="url(#primaryGrad)" />
      <rect x="33" y="25" width="8" height="16" rx="4" fill="url(#primaryGrad)" />
      <circle cx="11" cy="33" r="1.5" fill="#000000" />
      <circle cx="37" cy="33" r="1.5" fill="#000000" />
    </g>

    <!-- Soundwave Equalizer Bars -->
    <g transform="translate(250, 320)">
      <rect x="0" y="18" width="6" height="24" rx="3" fill="${p.accent2}" opacity="0.4"/>
      <rect x="16" y="10" width="6" height="40" rx="3" fill="${p.accent2}" opacity="0.7"/>
      <rect x="32" y="4" width="6" height="52" rx="3" fill="${p.accent1}" opacity="0.9"/>
      <rect x="48" y="14" width="6" height="32" rx="3" fill="${p.accent2}" opacity="0.75"/>
      <rect x="64" y="0" width="6" height="60" rx="3" fill="${p.accent1}" opacity="1"/>
      <rect x="80" y="8" width="6" height="44" rx="3" fill="${p.accent2}" opacity="0.8"/>
      <rect x="96" y="2" width="6" height="56" rx="3" fill="${p.accent1}" opacity="0.95"/>
      <rect x="112" y="12" width="6" height="36" rx="3" fill="${p.accent2}" opacity="0.75"/>
      <rect x="128" y="6" width="6" height="48" rx="3" fill="${p.accent1}" opacity="0.9"/>
      <rect x="144" y="0" width="6" height="60" rx="3" fill="${p.accent2}" opacity="1"/>
      <rect x="160" y="8" width="6" height="44" rx="3" fill="${p.accent2}" opacity="0.8"/>
      <rect x="176" y="2" width="6" height="56" rx="3" fill="${p.accent1}" opacity="0.95"/>
      <rect x="192" y="12" width="6" height="36" rx="3" fill="${p.accent2}" opacity="0.75"/>
      <rect x="208" y="4" width="6" height="52" rx="3" fill="${p.accent1}" opacity="0.9"/>
      <rect x="224" y="10" width="6" height="40" rx="3" fill="${p.accent2}" opacity="0.7"/>
      <rect x="240" y="14" width="6" height="32" rx="3" fill="${p.accent2}" opacity="0.6"/>
      <rect x="256" y="18" width="6" height="24" rx="3" fill="${p.accent2}" opacity="0.4"/>
      <rect x="272" y="22" width="6" height="16" rx="3" fill="${p.accent2}" opacity="0.3"/>
      <rect x="288" y="26" width="6" height="8" rx="3" fill="${p.accent2}" opacity="0.2"/>
    </g>

    <!-- Book Title (Pure SVG Text with multiple tspan, 100% reliable) -->
    <text x="400" y="${titleStartY}" text-anchor="middle" fill="#ffffff" font-size="${lines.length > 2 ? 30 : 35}" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" letter-spacing="0.5">
      ${lines.map((l, i) => `<tspan x="400" dy="${i === 0 ? 0 : lineHeight}">${l}</tspan>`).join('')}
    </text>

    <!-- Title Separator Divider -->
    <rect x="340" y="${titleStartY + lines.length * lineHeight - (lines.length > 1 ? 15 : 20)}" width="120" height="3" rx="1.5" fill="url(#primaryGrad)" />

    <!-- Author Name -->
    <text x="400" y="${titleStartY + lines.length * lineHeight + 25}" text-anchor="middle" fill="${p.accent1}" font-size="22" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="600" letter-spacing="0.5">
      ${safeAuthor}
    </text>

    <!-- Narrator or Category Badge -->
    <rect x="180" y="660" width="440" height="44" rx="22" fill="${p.badgeBg}" stroke="url(#primaryGrad)" stroke-width="1.2" />
    <text x="400" y="688" text-anchor="middle" fill="${p.accent2}" font-size="13.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" letter-spacing="0.4">
      ${safeNarrator ? `Ovoz beruvchi: <tspan fill="#ffffff" font-weight="700">${safeNarrator}</tspan>` : `<tspan fill="#ffffff" font-weight="700">${safeCategory} • Audio Kitob</tspan>`}
    </text>

    <!-- Bottom Footer Tag -->
    <text x="400" y="745" text-anchor="middle" fill="#78716c" font-size="11" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" letter-spacing="2.5">
      DOLBY DIGITAL • PROFESSIONAL YARATILGAN • ${year}
    </text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns an embed preview iframe URL for Google Drive (great for 1-click fallback player)
 */
export function getGoogleDrivePreviewUrl(urlOrFileId?: string): string {
  if (!urlOrFileId) return '';
  const trimmed = urlOrFileId.trim();
  const driveInfo = parseGoogleDriveUrl(trimmed);
  if (driveInfo.isDrive && driveInfo.fileId) {
    return `https://drive.google.com/file/d/${driveInfo.fileId}/preview`;
  }
  return trimmed;
}

/**
 * Converts any audio URL or Google Drive link/ID into a streamable direct audio URL
 */
export function getDirectAudioUrl(urlOrFileId?: string): string {
  if (!urlOrFileId) return '';
  const trimmed = urlOrFileId.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const driveInfo = parseGoogleDriveUrl(trimmed);
  if (driveInfo.isDrive && driveInfo.fileId) {
    return `/api/drive-audio?id=${driveInfo.fileId}`;
  }
  return trimmed;
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
