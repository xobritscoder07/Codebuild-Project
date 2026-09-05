import React from "react";

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap mb-2 md:flex-col md:items-start md:gap-4">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-teal mb-2.5 bg-teal/10 px-3.5 py-1.5 rounded-full border border-teal/15 font-nunito">
          <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
          {eyebrow}
        </div>
        <h1 className="text-[clamp(30px,4vw,46px)] font-normal leading-[1.08] tracking-tight text-ink my-2 font-slabo drop-shadow-[0.5px_0.5px_0_rgba(0,0,0,0.2)]">
          {title}
        </h1>
        <p className="text-muted max-w-[680px] m-0 leading-relaxed text-[15px] font-nunito">
          {description}
        </p>
      </div>
      {children && (
        <div className="flex gap-2.5 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
