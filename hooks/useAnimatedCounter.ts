'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

export function useAnimatedCounter(
  target: number,
  duration = 0.6,
  decimals = 0
): React.MutableRefObject<HTMLSpanElement | null> {
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const prevRef = useRef<number>(target);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;

    const controls = animate(from, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest: number) => {
        if (nodeRef.current) {
          nodeRef.current.textContent = latest.toFixed(decimals);
        }
      },
    });

    return () => controls.stop();
  }, [target, duration, decimals]);

  return nodeRef;
}
