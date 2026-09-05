import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const toneBorders = {
  teal: 'border-t-teal',
  critical: 'border-t-red',
  warning: 'border-t-amber',
  safe: 'border-t-teal',
};

const toneBg = {
  teal: 'bg-teal/10 text-teal-dark',
  critical: 'bg-red/10 text-red',
  warning: 'bg-amber/10 text-amber-700',
  safe: 'bg-teal/10 text-teal-dark',
};

export default function StatCard({
  label,
  value,
  detail,
  tone = "teal",
  icon = "◆",
}) {
  const valueRef = useRef(null);

  useEffect(() => {
    const numericValue = Number(String(value).replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(numericValue) || !valueRef.current) return undefined;
    const suffix = String(value).replace(/[0-9.,]/g, "");
    const counter = { current: 0 };
    const tween = gsap.to(counter, {
      current: numericValue,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        if (valueRef.current) {
          valueRef.current.textContent = `${Math.round(counter.current).toLocaleString()}${suffix}`;
        }
      },
    });
    return () => tween.kill();
  }, [value]);

  return (
    <article
      className={`bg-white border border-[#e8eef2] border-t-[3px] ${toneBorders[tone] || toneBorders.teal} rounded-2xl p-[22px_20px] min-h-[148px] flex flex-col justify-between transition-all duration-300 cursor-default hover:-translate-y-1 hover:shadow-hover`}
    >
      <div className="flex justify-between items-center gap-3">
        <span className="font-sans text-[11px] font-semibold tracking-[0.06em] uppercase text-muted">
          {label}
        </span>
        <span className={`w-9 h-9 flex items-center justify-center rounded-[10px] text-base font-bold ${toneBg[tone] || toneBg.teal}`}>
          {icon}
        </span>
      </div>
      <strong ref={valueRef} className={`font-mono text-[28px] font-extrabold block mt-3 mb-1.5 ${tone === 'critical' ? 'text-red' : 'text-ink'}`}>
        {value}
      </strong>
      <span className="font-nunito text-[10px] tracking-[0.04em] text-[#8896a1]">
        {detail}
      </span>
    </article>
  );
}
