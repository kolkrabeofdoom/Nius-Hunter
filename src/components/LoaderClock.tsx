import React from 'react';
import { motion } from 'motion/react';

export default function LoaderClock() {
  return (
    <div className="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-inner">
      {/* Hour hand */}
      <motion.div
        className="absolute w-[2px] h-[8px] bg-white rounded-full"
        style={{ originY: 1, top: 'calc(50% - 8px)' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      />
      {/* Minute hand */}
      <motion.div
        className="absolute w-[1.5px] h-[12px] bg-white opacity-80 rounded-full"
        style={{ originY: 1, top: 'calc(50% - 12px)' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      {/* Center dot */}
      <div className="absolute w-[4px] h-[4px] bg-white rounded-full z-10 shadow-sm" />
    </div>
  );
}
