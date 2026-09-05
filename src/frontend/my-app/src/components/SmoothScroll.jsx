import React, { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap-trial";
import { ScrollTrigger } from "gsap-trial/ScrollTrigger";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SmoothScroll({ children }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    // Instantiate ScrollSmoother
    let smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.5, // seconds for momentum
      effects: true, // enables data-speed and data-lag
      smoothTouch: 0.1, // much less smoothing on touch devices
    });

    return () => {
      if (smoother) {
        smoother.kill();
      }
    };
  }, []);

  useLayoutEffect(() => {
    // Scroll to top on route change smoothly (or instantly)
    // ScrollSmoother manages the scroll pos natively via ScrollTrigger
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [location.pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
