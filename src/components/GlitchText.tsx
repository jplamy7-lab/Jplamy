import { motion } from 'motion/react';
import React from 'react';

interface GlitchTextProps {
  children: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ children, className }) => {
  return (
    <div className={`relative group inline-block ${className}`}>
      <span className="relative z-10 group-hover:animate-glitch">{children}</span>
      <span className="absolute top-0 left-0 -z-10 text-[var(--neon-pink)] opacity-0 group-hover:opacity-70 group-hover:translate-x-1" style={{ clipPath: 'inset(10% 0 0 0)' }}>
        {children}
      </span>
      <span className="absolute top-0 left-0 -z-10 text-[var(--neon-blue)] opacity-0 group-hover:opacity-70 group-hover:-translate-x-1" style={{ clipPath: 'inset(0 0 10% 0)' }}>
        {children}
      </span>
    </div>
  );
};
