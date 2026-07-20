'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Direction = 'up' | 'down' | 'left' | 'right';

interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export default function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.6,
  once = true,
}: RevealProps) {
  const getOffset = (dir: Direction) => {
    const map: Record<Direction, { x?: number; y?: number }> = {
      up: { y: 40 },
      down: { y: -40 },
      left: { x: 40 },
      right: { x: -40 },
    };
    return map[dir];
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getOffset(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
