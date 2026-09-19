import React from 'react';

/**
 * AnimatedAtmosphere
 * Elegant, luxury atmospheric animated background for the library.
 * Features slow-floating golden light orbs, soft nebulae, and subtle celestial dust motes.
 * Designed to run smoothly with GPU acceleration and is completely disabled when reading a book.
 */
export const AnimatedAtmosphere: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-700"
      aria-hidden="true"
    >
      {/* 1. Large Luminous Ambient Orbs (Soft warm amber & antique copper) */}
      <div 
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-amber-600/10 blur-[120px] animate-ambient-float-1"
        style={{ animationDuration: '22s' }}
      />
      <div 
        className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-orange-600/8 blur-[130px] animate-ambient-float-2"
        style={{ animationDuration: '28s' }}
      />
      <div 
        className="absolute -bottom-24 left-1/4 w-[36rem] h-[36rem] rounded-full bg-amber-500/8 blur-[140px] animate-ambient-float-3"
        style={{ animationDuration: '25s' }}
      />

      {/* 2. Floating Golden Literary Dust Motes (Subtle twinkling particles) */}
      <div className="absolute inset-0 opacity-40">
        <span className="ambient-mote mote-1" style={{ top: '15%', left: '20%', animationDelay: '0s' }} />
        <span className="ambient-mote mote-2" style={{ top: '45%', left: '85%', animationDelay: '2.5s' }} />
        <span className="ambient-mote mote-3" style={{ top: '70%', left: '15%', animationDelay: '5s' }} />
        <span className="ambient-mote mote-1" style={{ top: '85%', left: '70%', animationDelay: '1.2s' }} />
        <span className="ambient-mote mote-2" style={{ top: '25%', left: '60%', animationDelay: '3.8s' }} />
        <span className="ambient-mote mote-3" style={{ top: '60%', left: '40%', animationDelay: '6.5s' }} />
        <span className="ambient-mote mote-1" style={{ top: '35%', left: '10%', animationDelay: '4.2s' }} />
        <span className="ambient-mote mote-2" style={{ top: '10%', left: '45%', animationDelay: '7.1s' }} />
      </div>

      {/* 3. Subtle Vignette and Film Grain Texture Overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0C0A08]/40 to-[#0C0A08]/90" />
    </div>
  );
};
