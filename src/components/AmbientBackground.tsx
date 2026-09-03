import React, { useEffect, useState } from 'react';

export const AmbientBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized coordinates
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep dark canvas */}
      <div className="absolute inset-0 bg-[#070708]" />

      {/* Architectural grid */}
      <div className="architectural-grid absolute inset-0 opacity-40" />

      {/* Subtle mouse-reactive ambient glow - monochromatic white/neutral only */}
      <div
        className="absolute rounded-full transition-transform duration-700 ease-out"
        style={{
          width: '700px',
          height: '700px',
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 45%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Subtle top vignette */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#070708] via-transparent to-transparent opacity-80" />
      
      {/* Subtle bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070708] via-transparent to-transparent opacity-80" />
    </div>
  );
};
