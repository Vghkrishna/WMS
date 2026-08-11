import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * Animates a number from 0 up to `value` on mount, rendering it through
 * `format` on every frame. Gives dashboard figures a premium "tick-up" feel.
 */
const CountUp = ({ value = 0, duration = 1.1, format = (v) => Math.round(v) }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{format(display)}</>;
};

export default CountUp;
