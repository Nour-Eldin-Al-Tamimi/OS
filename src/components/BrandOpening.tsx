import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface BrandOpeningProps {
  onDismiss: () => void;
}

export const BrandOpening: React.FC<BrandOpeningProps> = ({ onDismiss }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070708] text-white select-none px-6"
      >
        {/* Subtle architectural grid pattern */}
        <div className="architectural-grid absolute inset-0 opacity-60" />

        {/* Framing lines */}
        <div className="absolute top-12 left-12 right-12 flex justify-between items-center text-xs tracking-[0.25em] text-zinc-500 uppercase font-mono">
          <span>Season 01 // Chapter 01</span>
          <span>180 Days</span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Subtle light center halo */}
          <div className="absolute -inset-20 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

          {/* Logo reveal */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-baseline gap-4 mb-8"
          >
            <span className="font-accent-italic text-6xl md:text-8xl tracking-tight text-white font-normal italic">
              Nour
            </span>
            <span className="font-serif-display text-4xl md:text-6xl font-bold tracking-[0.2em] text-zinc-300">
              OS
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-400 mb-12"
          >
            Personal Operating System
          </motion.div>

          <motion.button
            id="brand-enter-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            onClick={onDismiss}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center gap-3 px-8 py-3.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 subtle-glow-sm"
          >
            <span>Enter System</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />
          </motion.button>
        </div>

        <div className="absolute bottom-12 text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          Decide &bull; Start &bull; Execute &bull; Track &bull; Recover
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
