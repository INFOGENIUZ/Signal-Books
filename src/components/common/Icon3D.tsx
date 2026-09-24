import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Folder, 
  Headphones, 
  Bookmark, 
  Clock, 
  Info, 
  User, 
  ShieldCheck, 
  Search, 
  Download, 
  Star, 
  Eye, 
  Play, 
  Pause, 
  Mic2, 
  Flame, 
  Heart, 
  Trash2, 
  Lock, 
  Settings, 
  HardDrive,
  GraduationCap,
  Calculator,
  Globe,
  Brain,
  Briefcase,
  Scale,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  Compass,
  MapPin,
  Wind,
  RefreshCw,
  Bell,
  Menu
} from 'lucide-react';

/**
 * Verified 3D Fluency Icon URLs from Icons8 CDN with fail-safe vector fallback
 */
export const ICON_3D_MAP: Record<string, string> = {
  // Navigation & Core App
  home: 'https://img.icons8.com/3d-fluency/94/home.png',
  books: 'https://img.icons8.com/3d-fluency/94/open-book.png',
  categories: 'https://img.icons8.com/3d-fluency/94/opened-folder.png',
  audio: 'https://img.icons8.com/3d-fluency/94/headset.png',
  favorites: 'https://img.icons8.com/3d-fluency/94/star.png',
  history: 'https://img.icons8.com/3d-fluency/94/time.png',
  about: 'https://img.icons8.com/3d-fluency/94/info.png',
  user: 'https://img.icons8.com/3d-fluency/94/user.png',
  admin: 'https://img.icons8.com/3d-fluency/94/shield.png',
  search: 'https://img.icons8.com/3d-fluency/94/search.png',
  download: 'https://img.icons8.com/3d-fluency/94/download.png',
  star: 'https://img.icons8.com/3d-fluency/94/star.png',
  eye: 'https://img.icons8.com/3d-fluency/94/eye.png',
  play: 'https://img.icons8.com/3d-fluency/94/play.png',
  pause: 'https://img.icons8.com/3d-fluency/94/pause.png',
  mic: 'https://img.icons8.com/3d-fluency/94/microphone.png',
  fire: 'https://img.icons8.com/3d-fluency/94/fire.png',
  heart: 'https://img.icons8.com/3d-fluency/94/heart.png',
  trash: 'https://img.icons8.com/3d-fluency/94/trash.png',
  lock: 'https://img.icons8.com/3d-fluency/94/lock.png',
  settings: 'https://img.icons8.com/3d-fluency/94/settings.png',
  drive: 'https://img.icons8.com/3d-fluency/94/google-drive.png',
  menu: 'https://img.icons8.com/3d-fluency/94/menu.png',
  bell: 'https://img.icons8.com/3d-fluency/94/alarm.png',
  telegram: 'https://img.icons8.com/3d-fluency/94/telegram.png',
  sparkles: 'https://img.icons8.com/3d-fluency/94/sparkles.png',
  'check-mark': 'https://img.icons8.com/3d-fluency/94/checkmark.png',
  chat: 'https://img.icons8.com/3d-fluency/94/speech-bubble.png',
  sent: 'https://img.icons8.com/3d-fluency/94/paper-plane.png',
  rocket: 'https://img.icons8.com/3d-fluency/94/rocket.png',
  phone: 'https://img.icons8.com/3d-fluency/94/smartphone.png',

  // Weather & Time 3D Icons
  sun: 'https://img.icons8.com/3d-fluency/94/sun.png',
  moon: 'https://img.icons8.com/3d-fluency/94/moon.png',
  cloud: 'https://img.icons8.com/3d-fluency/94/cloud.png',
  'cloud-sun': 'https://img.icons8.com/3d-fluency/94/partly-cloudy-day.png',
  'cloud-moon': 'https://img.icons8.com/3d-fluency/94/partly-cloudy-night.png',
  rain: 'https://img.icons8.com/3d-fluency/94/rain.png',
  snow: 'https://img.icons8.com/3d-fluency/94/snow.png',
  lightning: 'https://img.icons8.com/3d-fluency/94/lightning.png',
  fog: 'https://img.icons8.com/3d-fluency/94/fog.png',
  clock: 'https://img.icons8.com/3d-fluency/94/time.png',
  calendar: 'https://img.icons8.com/3d-fluency/94/calendar.png',
  compass: 'https://img.icons8.com/3d-fluency/94/compass.png',
  location: 'https://img.icons8.com/3d-fluency/94/marker.png',
  wind: 'https://img.icons8.com/3d-fluency/94/wind.png',
  refresh: 'https://img.icons8.com/3d-fluency/94/refresh.png',

  // Categories 3D Icons
  badiiy: 'https://img.icons8.com/3d-fluency/94/open-book.png',
  maktab: 'https://img.icons8.com/3d-fluency/94/graduation-cap.png',
  it: 'https://img.icons8.com/3d-fluency/94/laptop.png',
  matematika: 'https://img.icons8.com/3d-fluency/94/calculator.png',
  tarix: 'https://img.icons8.com/3d-fluency/94/scroll.png',
  ilmiy: 'https://img.icons8.com/3d-fluency/94/test-tube.png',
  bolalar: 'https://img.icons8.com/3d-fluency/94/teddy-bear.png',
  tillari: 'https://img.icons8.com/3d-fluency/94/globe.png',
  psixologiya: 'https://img.icons8.com/3d-fluency/94/brain.png',
  biznes: 'https://img.icons8.com/3d-fluency/94/briefcase.png',
  huquq: 'https://img.icons8.com/3d-fluency/94/law.png',
  diniy: 'https://img.icons8.com/3d-fluency/94/mosque.png'
};

export type Icon3DName = keyof typeof ICON_3D_MAP;

const LUCIDE_FALLBACKS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  books: BookOpen,
  categories: Folder,
  audio: Headphones,
  favorites: Bookmark,
  history: Clock,
  about: Info,
  user: User,
  admin: ShieldCheck,
  search: Search,
  download: Download,
  star: Star,
  eye: Eye,
  play: Play,
  pause: Pause,
  mic: Mic2,
  fire: Flame,
  heart: Heart,
  trash: Trash2,
  lock: Lock,
  settings: Settings,
  drive: HardDrive,
  menu: Menu,
  bell: Bell,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  compass: Compass,
  location: MapPin,
  wind: Wind,
  refresh: RefreshCw,
  clock: Clock,
  badiiy: BookOpen,
  maktab: GraduationCap,
  it: HardDrive,
  matematika: Calculator,
  tarix: BookOpen,
  ilmiy: Sparkles,
  bolalar: Sparkles,
  tillari: Globe,
  psixologiya: Brain,
  biznes: Briefcase,
  huquq: Scale,
  diniy: BookOpen
};

interface Icon3DProps {
  name: Icon3DName | string;
  size?: number | string;
  className?: string;
  alt?: string;
  fallbackLucide?: React.ReactNode;
}

export const Icon3D: React.FC<Icon3DProps> = ({
  name,
  size = 20,
  className = '',
  alt,
  fallbackLucide
}) => {
  const [hasError, setHasError] = useState(false);

  const iconUrl = ICON_3D_MAP[name] || `https://img.icons8.com/3d-fluency/94/${name}.png`;
  const dimensionPx = typeof size === 'number' ? `${size}px` : size;

  if (hasError) {
    if (fallbackLucide) {
      return <>{fallbackLucide}</>;
    }
    const FallbackIcon = LUCIDE_FALLBACKS[name] || BookOpen;
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 p-1 ${className}`}
        style={{ width: dimensionPx, height: dimensionPx, minWidth: dimensionPx, minHeight: dimensionPx }}
      >
        <FallbackIcon className="w-full h-full text-amber-400" />
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={alt || `${name} icon`}
      onError={() => setHasError(true)}
      style={{ width: dimensionPx, height: dimensionPx, minWidth: dimensionPx, minHeight: dimensionPx }}
      className={`object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-105 shrink-0 ${className}`}
      loading="eager"
    />
  );
};
