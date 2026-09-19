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
