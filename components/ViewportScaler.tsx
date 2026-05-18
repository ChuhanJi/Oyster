"use client";

import { useEffect } from "react";

const DESIGN_W = 1728;
const DESIGN_H = 1117;

export default function ViewportScaler() {
  useEffect(() => {
    const apply = () => {
      const scale = Math.min(1, window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
      document.documentElement.style.zoom = String(scale);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return null;
}
