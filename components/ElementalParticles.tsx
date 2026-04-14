import { useState } from 'react';
import { motion } from 'motion/react';
import { ELEMENT_PARTICLE_COLORS, Element } from '@/lib/gameData';

interface Particle {
  x: number;
  y: number;
  color: string;
  duration: number;
  id: number;
}

export function ElementalParticles({ element }: { element: string }) {
  const [particles] = useState<Particle[]>(() => {
    const palette = ELEMENT_PARTICLE_COLORS[element as Element] || ELEMENT_PARTICLE_COLORS.Light;

    return Array.from({ length: 20 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 20;
      const distance = 40 + Math.random() * 60;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const duration = 0.4 + Math.random() * 0.4;
      return { x, y, color, duration, id: i };
    });
  });

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          className={`absolute w-3 h-3 rounded-full ${p.color} shadow-[0_0_10px_currentColor]`}
        />
      ))}
    </div>
  );
}
