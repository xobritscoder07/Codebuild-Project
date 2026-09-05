import React from "react";

const toneStyles = {
  safe:     "text-teal-dark bg-[#e6f8f6] [&>i]:bg-teal",
  critical: "text-red bg-[#fdf2f4] [&>i]:bg-red",
  warning:  "text-amber-700 bg-[#fef7e8] [&>i]:bg-amber",
  ai:       "text-purple-800 bg-[#ede9fe] [&>i]:bg-purple-600",
};

export default function StatusBadge({ children, tone = "safe" }) {
  const s = toneStyles[tone] || toneStyles.safe;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-nunito text-[10px] font-semibold tracking-[0.05em] uppercase ${s}`}>
      <i className="w-1.5 h-1.5 rounded-full inline-block shrink-0" />
      {children}
    </span>
  );
}
