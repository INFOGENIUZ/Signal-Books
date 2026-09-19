import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  Wind, 
  RefreshCw,
  X,
  Compass
} from 'lucide-react';

interface WeatherData {
  temp: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  cityName: string;
  lastUpdated: string;
}

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const UZ_WEEKDAYS = [
  'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'
];

const UZ_SEASONS: Record<number, string> = {
  11: 'Qish fasli', 0: 'Qish fasli', 1: 'Qish fasli',
  2: 'Bahor fasli', 3: 'Bahor fasli', 4: 'Bahor fasli',
  5: 'Yoz fasli', 6: 'Yoz fasli', 7: 'Yoz fasli',
  8: 'Kuz fasli', 9: 'Kuz fasli', 10: 'Kuz fasli',
};

function getWeatherDescription(code: number, isDay: boolean): { label: string; icon: React.ComponentType<{ className?: string }> } {
  // WMO Weather interpretation codes (WW)
  if (code === 0) {
    return { 
      label: isDay ? 'Musaffo ochiq osmon' : 'Yulduzli ochiq tun', 
      icon: isDay ? Sun : Moon 
    };
  }
  if (code === 1 || code === 2) {
    return { 
      label: isDay ? 'Qisman bulutli' : 'Tungi bulutli', 
      icon: isDay ? CloudSun : CloudMoon 
    };
  }
  if (code === 3) {
    return { label: 'Bulutli havo', icon: Cloud };
  }
  if (code === 45 || code === 48) {
    return { label: 'Tumanli', icon: CloudFog };
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Mayda yomg‘ir', icon: CloudRain };
  }
  if (code >= 61 && code <= 67) {
    return { label: 'Yomg‘irli havo', icon: CloudRain };
  }
  if (code >= 71 && code <= 77) {
    return { label: 'Qor yog‘moqda', icon: CloudSnow };
  }
  if (code >= 80 && code <= 82) {
    return { label: 'Kuchli jala', icon: CloudRain };
  }
  if (code >= 85 && code <= 86) {
    return { label: 'Bo‘ronli qor', icon: CloudSnow };
  }
  if (code >= 95 && code <= 99) {
    return { label: 'Momaqaldiroq', icon: CloudLightning };
  }
  return { label: isDay ? 'Quyoshli' : 'Ochiq havo', icon: isDay ? Sun : Moon };
}

export const WeatherClockWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [weather, setWeather] = useState<WeatherData>(() => {
    try {
      const cached = localStorage.getItem('signal_weather_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // If cache is less than 30 mins old, use it
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch {}
    return {
      temp: 22,
      weatherCode: 0,
      isDay: true,
      windSpeed: 5,
      cityName: 'Toshkent',
      lastUpdated: 'Hozir'
    };
  });

  // 1. Clock interval (ticks every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch live weather
  const fetchWeather = async (lat = 41.2995, lon = 69.2401, city = 'Toshkent') => {
    setIsLoadingWeather(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      if (res.ok) {
        const data = await res.json();
        const cur = data.current_weather;
        const newWeather: WeatherData = {
          temp: Math.round(cur.temperature),
          weatherCode: cur.weathercode,
          isDay: Boolean(cur.is_day),
          windSpeed: Math.round(cur.windspeed),
          cityName: city,
          lastUpdated: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        };
        setWeather(newWeather);
        try {
          localStorage.setItem('signal_weather_cache', JSON.stringify({
            timestamp: Date.now(),
            data: newWeather
          }));
        } catch {}
      }
    } catch (e) {
      console.warn('Weather fetch fallback:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    // Attempt geolocation on initial load, otherwise default to Tashkent
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Mahalliy shahar');
        },
        () => {
          fetchWeather(41.2995, 69.2401, 'Toshkent');
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(41.2995, 69.2401, 'Toshkent');
    }

    // Refresh every 20 minutes
    const interval = setInterval(() => {
      fetchWeather();
    }, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpenModal(false);
      }
    };
    if (isOpenModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpenModal]);

  // Date formatting in Uzbek
  const day = currentTime.getDate();
  const monthIdx = currentTime.getMonth();
  const year = currentTime.getFullYear();
  const weekdayIdx = currentTime.getDay();
  const monthName = UZ_MONTHS[monthIdx];
  const weekdayName = UZ_WEEKDAYS[weekdayIdx];
  const seasonName = UZ_SEASONS[monthIdx] || 'Yil fasli';

  // Time formatting
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  // Day of year
  const startOfYear = new Date(year, 0, 1);
  const diffDays = Math.floor((currentTime.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weekNumber = Math.ceil(diffDays / 7);

  const { label: weatherLabel, icon: WeatherIcon } = getWeatherDescription(weather.weatherCode, weather.isDay);
  const formattedTemp = weather.temp > 0 ? `+${weather.temp}°` : `${weather.temp}°`;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* 
        MAIN LUXURY WIDGET PILL 
        Fully responsive styling via Tailwind breakpoints and responsive media classes
      */}
      <button
        onClick={() => setIsOpenModal(!isOpenModal)}
        className="weather-clock-widget group flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#140E0A]/90 hover:bg-[#1C140E] border border-amber-950/80 hover:border-amber-500/40 text-stone-200 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.18)] select-none text-left"
        title="Batafsil ob-havo va taqvim ma'lumotlari"
        aria-label="Soat, sana va ob-havo ma'lumotlari"
      >
        {/* Weather section */}
        <div className="weather-section flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:text-amber-300 transition-transform shadow-inner">
            <WeatherIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold font-mono text-amber-300 tracking-tight">
                {formattedTemp}
              </span>
              <span className="hidden xl:inline text-[10px] text-stone-400 font-medium truncate max-w-[65px]">
                {weather.cityName}
              </span>
            </div>
            <span className="hidden 2xl:inline text-[9px] text-stone-500 truncate max-w-[80px]">
              {weatherLabel}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-4 sm:h-5 bg-amber-950/80 group-hover:bg-amber-500/30 transition-colors shrink-0" />

        {/* Live Clock Section */}
        <div className="clock-section flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-500/80 hidden xs:inline shrink-0" />
          <div className="flex items-baseline font-mono">
            <span className="text-xs sm:text-sm font-bold text-stone-100 tracking-tight">
              {hours}
            </span>
            <span className="text-amber-400 font-bold animate-pulse px-[1px]">:</span>
            <span className="text-xs sm:text-sm font-bold text-stone-100 tracking-tight">
              {minutes}
            </span>
            {/* Seconds (shown on larger screens) */}
            <span className="hidden lg:inline text-[10px] sm:text-xs font-semibold text-stone-400 ml-0.5">
              :{seconds}
            </span>
          </div>
        </div>

        {/* Date Section (hidden on very small screens, visible on md+) */}
        <div className="date-section hidden sm:flex items-center gap-1.5 shrink-0">
          <div className="w-[1px] h-4 sm:h-5 bg-amber-950/80 group-hover:bg-amber-500/30 transition-colors" />
          <CalendarIcon className="w-3.5 h-3.5 text-amber-500/70 hidden md:inline shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-stone-300 whitespace-nowrap">
              <span className="font-semibold text-amber-200">{day}</span>
              <span className="text-stone-400 ml-1 hidden lg:inline">{monthName}</span>
              <span className="text-stone-400 ml-1 lg:hidden">{monthName.slice(0, 3)}</span>
              <span className="text-stone-400 ml-1 hidden xl:inline">{year}</span>
            </span>
            <span className="hidden xl:inline text-[9px] text-amber-400/90 font-medium">
              {weekdayName}
            </span>
          </div>
        </div>

        {/* Micro expand indicator icon */}
        <div className="hidden xs:flex items-center text-stone-600 group-hover:text-amber-400 transition-colors ml-0.5">
          <span className="text-[9px] font-mono">▾</span>
        </div>
      </button>

      {/* 
        DETAILED EXPANDABLE MODAL / POPOVER CARD 
        Displays when user taps or clicks the widget
      */}
      {isOpenModal && (
        <div className="weather-clock-popover absolute right-0 mt-2.5 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-3xl bg-[#140E0A]/95 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 z-50 animate-fade-in text-stone-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-amber-950/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100 font-serif-title">
                  Vaqt & Ob-havo
                </h4>
                <p className="text-[10px] text-stone-400">
                  O‘zbekiston (Toshkent vaqti, UTC+5)
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpenModal(false)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Big Live Clock Display */}
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-b from-[#1C140E] to-[#110B07] border border-amber-950 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80 font-semibold mb-1">
              {weekdayName}, {seasonName}
            </div>
            
            <div className="flex items-baseline font-mono">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
                {hours}
              </span>
              <span className="text-amber-400 text-3xl sm:text-4xl font-extrabold animate-pulse px-1">:</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
                {minutes}
              </span>
              <span className="text-amber-400/70 text-lg sm:text-xl font-bold ml-1.5 font-mono">
                :{seconds}
              </span>
            </div>

            <div className="mt-2 text-xs text-stone-300 font-medium">
              <span>{day}-{monthName}, {year}-yil</span>
            </div>

            <div className="mt-2 flex items-center gap-3 text-[10px] text-stone-400 border-t border-stone-800/80 pt-2 w-full justify-center font-mono">
              <span>Yilning {diffDays}-kuni</span>
              <span>•</span>
              <span>{weekNumber}-hafta</span>
            </div>
          </div>

          {/* Weather Details Card */}
          <div className="p-4 rounded-2xl bg-[#1A120B]/80 border border-amber-950/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                  <WeatherIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-extrabold font-mono text-stone-100">
                      {formattedTemp}C
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      {weather.isDay ? 'Kunduz' : 'Tun'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-medium mt-0.5">
                    {weatherLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchWeather()}
                disabled={isLoadingWeather}
                className="p-2 rounded-xl bg-stone-900/80 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 border border-stone-800 transition-all active:scale-95"
                title="Ob-havoni yangilash"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingWeather ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800/70 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-stone-900">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-stone-500 block">Shahar</span>
                  <span className="text-stone-200 font-semibold truncate block">{weather.cityName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-stone-900">
                <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 block">Shamol</span>
                  <span className="text-stone-200 font-semibold">{weather.windSpeed} km/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 text-center">
            <p className="text-[10px] text-stone-500 font-sans">
              So‘nggi yangilanish: {weather.lastUpdated} • Signal Books Kutubxonasi
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
