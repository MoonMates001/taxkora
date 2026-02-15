import { useState, useEffect, useCallback, useRef } from "react";

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-border/50">
      <div 
        className="h-full bg-gradient-to-r from-primary via-teal-500 to-coral-500 will-change-transform"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
