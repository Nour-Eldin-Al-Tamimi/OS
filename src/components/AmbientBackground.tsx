import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Warm white canvas */}
      <div className="absolute inset-0 bg-[#fbfbfa]" />

      {/* Very subtle warm gradient for organic MacBook glass depth */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0) 70%)'
        }}
      />
    </div>
  );
};
