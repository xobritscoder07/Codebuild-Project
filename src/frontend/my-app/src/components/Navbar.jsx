import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import gsap from "gsap";
import logo from "../assets/logo.png" ;

const links = [
  ["Home", "/"],
  ["Overview", "/overview"],
  ["Network", "/network"],
  ["System Health", "/system-health"],
];

function Navbar({ apiStatus }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const indicatorRef = useRef(null);

  const statusLabel =
    apiStatus === "connected"
      ? "API Connected"
      : apiStatus === "connecting"
        ? "Connecting"
        : "API Disconnected";

  const statusStyles = {
    connected: "bg-[#effaf8] text-teal-dark border-teal/20",
    connecting: "bg-amber/10 text-amber border-amber/20",
    disconnected: "bg-red/10 text-red border-red/20"
  };

  const statusColor = apiStatus === "connected" ? "bg-teal" : apiStatus === "connecting" ? "bg-amber" : "bg-red";

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP Smooth Navigation Indicator
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    
    const activeLink = navRef.current.querySelector("a.active");
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      const left = linkRect.left - navRect.left;
      const width = linkRect.width;

      gsap.to(indicatorRef.current, {
        x: left,
        width: width,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  }, [location.pathname]);

  return (
    <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${scrolled ? 'top-3 w-[95%] max-w-7xl bg-white/90 backdrop-blur-md rounded-2xl shadow-custom text-ink' : 'top-0 w-full bg-white text-ink shadow-sm'}`}>
      <div className="flex justify-between items-center px-4 md:px-8 h-16 max-w-7xl mx-auto gap-2 md:gap-4">
        
        {/* Brand */}
        <NavLink to="/" className="flex-1 flex items-center whitespace-nowrap transition-opacity hover:opacity-80 min-w-0" onClick={() => setOpen(false)}>
          <img src={logo} alt="AEGIS AI" className="h-8 sm:h-10 lg:h-[48px] w-auto object-contain max-w-full" />
        </NavLink>
        
        {/* Hamburger — only on mobile */}
        <button
          className={`nav-hamburger z-[1000] text-2xl focus:outline-none text-ink`}
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? "✕" : "≡"}
        </button>
        
        {/* Nav Links — centered on desktop */}
        <nav
          className={`nav-links-container flex-none mx-2 ${open ? 'mobile-open' : ''} ${scrolled ? 'scrolled' : ''}`}
          ref={navRef}
        >
          {/* GSAP Animated Indicator — desktop only */}
          <div 
            ref={indicatorRef} 
            className="nav-indicator"
          />
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link font-nunito ${isActive ? 'active text-teal' : 'text-muted hover:text-teal'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        
        {/* Meta / Status */}
        <div className="flex-1 flex justify-end hidden md:flex min-w-0">
          <span className={`inline-flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-full text-[10px] lg:text-xs font-semibold uppercase tracking-wider font-nunito border whitespace-nowrap ${statusStyles[apiStatus] || statusStyles.disconnected}`}>
            <i className={`w-1.5 h-1.5 rounded-full ${statusColor} ${apiStatus === 'connecting' ? 'animate-pulse' : ''}`} />
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
