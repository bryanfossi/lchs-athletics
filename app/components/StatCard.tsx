"use client";

import { useState, useEffect, useRef } from "react";

export function StatIcon({ icon, className }: { icon?: string; className?: string }) {
  if (icon === 'star') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
  if (icon === 'medal') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM9.5 1H5l2.5 5h4L9.5 1zm5 0l-2 5h4l2.5-5H14.5z" />
    </svg>
  );
  if (icon === 'user') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
  // Default: trophy
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

export interface StatCardProps {
  title: string;
  value: string;
  icon?: string;
  visible: boolean;
  delay: number;
  primaryColor: string;
  secondaryColor: string;
}

export function StatCard({ title, value, icon, visible, delay, primaryColor }: StatCardProps) {
  const numMatch = value.match(/^(\d+)/);
  const numTarget = numMatch ? parseInt(numMatch[1]) : null;
  const suffix = numTarget !== null ? value.slice(String(numTarget).length) : '';
  const [displayNum, setDisplayNum] = useState(0);
  const [numPop, setNumPop] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current || numTarget === null) return;
    started.current = true;
    const duration = 2000;
    let frameId: number;
    const timer = setTimeout(() => {
      const startTs = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startTs) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayNum(Math.round(eased * numTarget));
        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        } else {
          setNumPop(true);
          setTimeout(() => setNumPop(false), 350);
        }
      };
      frameId = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timer); if (frameId) cancelAnimationFrame(frameId); };
  }, [visible, numTarget, delay]);

  const displayValue = numTarget !== null ? String(displayNum) + suffix : value;

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-t-4"
      style={{
        borderColor: primaryColor,
        animation: visible ? `statCardIn 0.55s ease-out ${delay}ms both` : 'none',
        opacity: visible ? undefined : 0,
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
      >
        <StatIcon icon={icon} className="w-8 h-8" />
      </div>
      <div
        className="text-5xl font-black mb-3 tabular-nums transition-transform duration-200"
        style={{ color: primaryColor, transform: numPop ? 'scale(1.15)' : 'scale(1)' }}
      >
        {displayValue}
      </div>
      <div className="text-gray-600 font-semibold text-base leading-tight">{title}</div>
    </div>
  );
}
