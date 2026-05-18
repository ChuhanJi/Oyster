"use client";

import { useEffect } from "react";

const DESIGN_W = 1728;
const DESIGN_H = 1117;

export default function ViewportScaler() {
  useEffect(() => {
    const apply = () => {
      const scale = Math.min(1, window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
      // Apply zoom only to body, not html — avoids breaking 100vh/100vw calculations
      document.body.style.zoom = String(scale);
      // Offset the body so it stays top-left aligned after zoom
      document.body.style.transformOrigin = "top left";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return null;
}
