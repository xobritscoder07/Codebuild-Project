import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap-trial";
import { ScrollToPlugin } from "gsap-trial/ScrollToPlugin";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SmoothScroll from "./SmoothScroll";
import { api } from "../services/api";

gsap.registerPlugin(ScrollToPlugin);

export default function Layout({ children }) {
  const [apiStatus, setApiStatus] = useState("connecting");
  const shellRef = useRef(null);

  useEffect(() => {
    let active = true;
    api
      .getHealth()
      .then(() => active && setApiStatus("connected"))
      .catch(() => active && setApiStatus("disconnected"));
    return () => {
      active = false;
    };
  }, []);

  // Page entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (
        !window.matchMedia ||
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        gsap.from(".page > *", {
          opacity: 0,
          y: 18,
          duration: 0.6,
          stagger: 0.06,
          ease: "power2.out",
        });
        gsap.from(".page .motion-card", {
          opacity: 0,
          y: 16,
          duration: 0.55,
          stagger: 0.07,
          delay: 0.12,
          ease: "power2.out",
        });
      }
    }, shellRef);
    return () => ctx.revert();
  });

  // Smooth Scrolling for Hash Links
  useEffect(() => {
    const handleHashClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;
      
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        e.preventDefault();
        const dest = document.querySelector(href);
        if (dest) {
          gsap.to(window, {
            duration: 0.8,
            scrollTo: { y: dest, offsetY: 80 },
            ease: "power3.inOut"
          });
          // Update URL hash without jumping
          window.history.pushState(null, null, href);
        }
      }
    };

    document.addEventListener("click", handleHashClick);
    return () => document.removeEventListener("click", handleHashClick);
  }, []);

  return (
    <div className="app-shell" ref={shellRef}>
      <Navbar apiStatus={apiStatus} />
      <SmoothScroll>
        <main className="page">{children}</main>
        <Footer />
      </SmoothScroll>
    </div>
  );
}
