import React from 'react';

/**
 * AnimatedAtmosphere
 * GPU-accelerated luxury background atmosphere.
 * Features slow-floating golden ambient orbs, geometric bookish grid, and literary motes.
 * Uses hardware-accelerated 3D CSS transforms (`translate3d`) for 60 FPS performance on mid-range phones.
 */
export const AnimatedAtmosphere: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Subtle Bookish Geometric Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* 2. Luminous Ambient Light Orbs (GPU-accelerated with translate3d) */}
      <div 
        className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-500/18 via-orange-600/8 to-transparent blur-3xl animate-ambient-float-1 pointer-events-none"
        style={{ animationDuration: '22s', transform: 'translate3d(0,0,0)' }}
      />
      <div 
        className="absolute top-1/4 -right-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-bl from-orange-500/15 via-amber-600/6 to-transparent blur-3xl animate-ambient-float-2 pointer-events-none"
        style={{ animationDuration: '28s', transform: 'translate3d(0,0,0)' }}
      />
      <div 
        className="absolute bottom-1/4 -left-20 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-amber-600/12 via-orange-500/5 to-transparent blur-3xl animate-ambient-float-3 pointer-events-none"
        style={{ animationDuration: '26s', transform: 'translate3d(0,0,0)' }}
      />
      <div 
        className="absolute -bottom-32 right-1/4 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tl from-amber-500/14 via-yellow-600/6 to-transparent blur-3xl animate-ambient-float-1 pointer-events-none"
        style={{ animationDuration: '32s', transform: 'translate3d(0,0,0)' }}
      />

      {/* 3. Gentle Golden Dust Particles */}
      <div className="absolute inset-0 opacity-50">
        <span className="ambient-mote mote-1" style={{ top: '12%', left: '20%', animationDelay: '0s' }} />
        <span className="ambient-mote mote-2" style={{ top: '38%', left: '82%', animationDelay: '2.2s' }} />
        <span className="ambient-mote mote-3" style={{ top: '65%', left: '12%', animationDelay: '4.8s' }} />
        <span className="ambient-mote mote-1" style={{ top: '82%', left: '72%', animationDelay: '1.5s' }} />
        <span className="ambient-mote mote-2" style={{ top: '22%', left: '58%', animationDelay: '3.6s' }} />
        <span className="ambient-mote mote-3" style={{ top: '50%', left: '42%', animationDelay: '6.0s' }} />
        <span className="ambient-mote mote-1" style={{ top: '90%', left: '30%', animationDelay: '2.8s' }} />
      </div>

      {/* 4. Subtle Ambient Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A08]/50 via-transparent to-[#0C0A08]/85 pointer-events-none" />
    </div>
  );
};
