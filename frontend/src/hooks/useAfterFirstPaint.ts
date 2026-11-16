import { useEffect, useState } from 'react';

/**
 * False on the first render, true once the screen has painted and the JS thread
 * is idle. Use it to hold back content below the fold so the visible part of a
 * screen appears immediately.
 */
export function useAfterFirstPaint(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idle: number | undefined;
    const frame = requestAnimationFrame(() => {
      idle = requestIdleCallback(() => setReady(true), { timeout: 300 });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (idle !== undefined) cancelIdleCallback(idle);
    };
  }, []);

  return ready;
}
