import React from 'react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-line mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-10 lg:py-14 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Brand & Description */}
        <div className="flex flex-col items-center lg:items-start gap-3 max-w-sm text-center lg:text-left">
          <img src={logo} alt="AEGIS AI" className="h-10 md:h-[50px] w-auto object-contain" />
          <p className="text-[14px] text-muted font-nunito leading-relaxed">
            Advanced Behavioral Security Intelligence. Protecting your network infrastructure with real-time AI-driven threat detection.
          </p>
        </div>

        {/* Links & Meta Info */}
        <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:w-auto">
          <nav className="flex flex-wrap justify-center lg:justify-end gap-6 md:gap-8 w-full" aria-label="Footer navigation">
          </nav>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[13px] text-muted font-nunito bg-page/80 px-6 py-4 sm:py-3 rounded-2xl sm:rounded-full border border-line/60 w-full sm:w-auto">
            <span>
              Built by <strong className="text-ink font-bold">Team CodeBytes</strong>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>&copy; {new Date().getFullYear()} AEGIS AI</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
