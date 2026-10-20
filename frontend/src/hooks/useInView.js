import { useEffect, useRef, useState } from "react";

const hasObserver =
  typeof window !== "undefined" && "IntersectionObserver" in window;

// Returns a ref to attach to an element and whether it has scrolled into view.
export function useInView({ threshold = 0.2, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(!hasObserver);

  useEffect(() => {
    const node = ref.current;

    if (!hasObserver || !node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);

          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

// Counts from 0 up to `target` once `active` becomes true.
export function useCountUp(target, active, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const total = reduceMotion ? 0 : duration;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = total === 0 ? 1 : Math.min((now - start) / total, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}
