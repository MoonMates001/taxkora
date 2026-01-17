import { useState, useEffect, useRef } from "react";

interface UseCountAnimationOptions {
  end: number;
  duration?: number;
  startOnView?: boolean;
}

export const useCountAnimation = ({ 
  end, 
  duration = 2000, 
  startOnView = true 
}: UseCountAnimationOptions) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return { count, ref };
};

export const formatStatValue = (value: number, suffix: string = ""): string => {
  if (value >= 1000000000) {
    return `₦${(value / 1000000000).toFixed(1)}B${suffix}`;
  }
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M${suffix}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K${suffix}`;
  }
  return `${value}${suffix}`;
};
