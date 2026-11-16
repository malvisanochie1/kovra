import { useEffect, useRef, useState } from 'react';

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Animates a number from its previous value to `target`, for totals and offers that tick. */
export function useCountUp(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    let frame = 0;
    const began = Date.now();

    const step = () => {
      const t = Math.min(1, (Date.now() - began) / duration);
      const next = Math.round(start + (target - start) * easeOut(t));
      setValue(next);
      from.current = next;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
