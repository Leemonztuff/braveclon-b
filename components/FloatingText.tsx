import { motion } from 'motion/react';

export type FloatingTextType = 'damage' | 'heal' | 'weak' | 'spark' | 'bb' | 'bc' | 'buff' | 'od' | 'critical' | 'combo';

export interface FloatingTextData {
  id: string;
  text: string;
  type: FloatingTextType;
  x: number | string;
  y: number | string;
  damage?: number;
}

export function FloatingText({ data }: { data: FloatingTextData }) {
  let colorClass = 'text-white';
  let scale = 1;
  let yOffset = -40;
  let fontSize = 'text-xl';
  let glowEffect = '';

  switch (data.type) {
    case 'damage':
      colorClass = 'text-red-500';
      if (data.damage && data.damage >= 1000) {
        scale = 1.4;
        fontSize = 'text-2xl';
        glowEffect = 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';
      } else if (data.damage && data.damage >= 500) {
        scale = 1.2;
        fontSize = 'text-xl';
        glowEffect = 'drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]';
      }
      break;
    case 'heal':
      colorClass = 'text-emerald-400';
      yOffset = -30;
      glowEffect = 'drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]';
      break;
    case 'weak':
      colorClass = 'text-yellow-400 italic';
      scale = 1.2;
      yOffset = -50;
      fontSize = 'text-2xl';
      glowEffect = 'drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]';
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
      fontSize = 'text-3xl';
      glowEffect = 'drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]';
      break;
    case 'bc':
      colorClass = 'text-cyan-400 font-bold';
      scale = 0.9;
      yOffset = -30;
      fontSize = 'text-lg';
      break;
    case 'buff':
      colorClass = 'text-green-400 font-bold';
      scale = 1.2;
      yOffset = -50;
      fontSize = 'text-xl';
      glowEffect = 'drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]';
      break;
    case 'od':
      colorClass = 'text-yellow-400 font-black';
      scale = 1.8;
      yOffset = -80;
      fontSize = 'text-3xl';
      glowEffect = 'drop-shadow-[0_0_20px_rgba(250,204,21,1)]';
      break;
    case 'critical':
      colorClass = 'text-orange-400 font-black';
      scale = 2.0;
      yOffset = -90;
      fontSize = 'text-4xl';
      glowEffect = 'drop-shadow-[0_0_25px_rgba(249,115,22,1)] animate-pulse';
      break;
    case 'combo':
      colorClass = 'text-purple-400 font-black';
      scale = 1.3;
      yOffset = -60;
      fontSize = 'text-2xl';
      glowEffect = 'drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]';
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: scale * 0.3, rotate: -10 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: yOffset, 
        scale: [scale * 0.3, scale * 1.3, scale, scale * 0.7],
        rotate: [0, 5, 0, -3]
      }}
      transition={{ duration: 0.9, ease: "easeOut", times: [0, 0.15, 0.6, 1] }}
      className={`absolute pointer-events-none z-50 font-black ${fontSize} ${colorClass} ${glowEffect}`}
      style={{ 
        left: data.x, 
        top: data.y,
        textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 10px currentColor'
      }}
    >
      {data.text}
    </motion.div>
  );
}
