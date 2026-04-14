import { motion, AnimatePresence } from 'motion/react';

export type FloatingTextType = 'damage' | 'heal' | 'weak' | 'spark' | 'bb' | 'bc';

export interface FloatingTextData {
  id: string;
  text: string;
  type: FloatingTextType;
  x: number | string;
  y: number | string;
}

export function FloatingText({ data }: { data: FloatingTextData }) {
  let colorClass = 'text-white';
  let scale = 1;
  let yOffset = -40;

  switch (data.type) {
    case 'damage':
      colorClass = 'text-red-500';
      break;
    case 'heal':
      colorClass = 'text-emerald-400';
      yOffset = -30;
      break;
    case 'weak':
      colorClass = 'text-yellow-400 italic';
      scale = 1.2;
      yOffset = -50;
      break;
    case 'spark':
      colorClass = 'text-cyan-300 italic';
      scale = 1.3;
      yOffset = -60;
      break;
    case 'bb':
      colorClass = 'text-fuchsia-400 font-black';
      scale = 1.5;
      yOffset = -70;
      break;
    case 'bc':
      colorClass = 'text-cyan-400 font-bold';
      scale = 0.9;
      yOffset = -30;
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: scale * 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: yOffset, scale: [scale * 0.5, scale * 1.2, scale, scale * 0.8] }}
      transition={{ duration: 0.8, ease: "easeOut", times: [0, 0.1, 0.7, 1] }}
      className={`absolute pointer-events-none z-50 font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)] ${colorClass}`}
      style={{ 
        left: data.x, 
        top: data.y,
        textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
      }}
    >
      {data.text}
    </motion.div>
  );
}
