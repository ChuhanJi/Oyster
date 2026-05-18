"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/tripStore";
import type { Photo } from "@/lib/types";

function LensText() {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <path id="topArc" d="M 22,100 A 78,78 0 0,1 178,100" />
        <path id="bottomArc" d="M 32,100 A 68,68 0 0,0 168,100" />
      </defs>
      <text style={{ fontSize: 9.5, letterSpacing: 1.3 }} fill="rgba(255,255,255,0.42)">
        <textPath href="#topArc" startOffset="5%">FUJINON ASPHERICAL LENS</textPath>
      </text>
      <text style={{ fontSize: 8.5, letterSpacing: 1.1 }} fill="rgba(255,255,255,0.3)">
        <textPath href="#bottomArc" startOffset="12%">SUPER EBC  f=23mm  1:2.8</textPath>
      </text>
    </svg>
  );
}

function Rib({ angle }: { angle: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "50%",
        height: 2,
        transformOrigin: "0 50%",
        transform: `rotate(${angle}deg)`,
        background: "linear-gradient(to right, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 70%, transparent)",
      }}
    />
  );
}

export default function Step2Page() {
  const router = useRouter();
  const { addPhotos } = useTripStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList) => {
      const newPhotos: Photo[] = Array.from(files)
        .slice(0, 8)
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          caption: "",
          stickers: [],
        }));
      addPhotos(newPhotos);
      router.push("/add/step3");
    },
    [addPhotos, router]
  );

  const handleShutter = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        width: "100%",
      }}
    >
      {/* ── Camera housing ──────────────────────────────────────── */}
      <div>
        <div
          onClick={handleShutter}
          style={{
            position: "relative",
            width: 820,
            borderRadius: 18,
            boxShadow:
              "0 40px 80px rgba(0,0,0,0.6), 0 12px 32px rgba(0,0,0,0.42), 0 4px 10px rgba(0,0,0,0.28)",
            overflow: "hidden",
            userSelect: "none",
            cursor: "pointer",
          }}
        >
          {/* ═══════════════════════════════════════════════════════
              TOP PLATE — brushed aluminium
          ═══════════════════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              height: 118,
              // Multi-stop linear gradient: bright at top → dips mid → slight recovery
              background:
                "linear-gradient(180deg, #EFEFEF 0%, #E2E2E2 8%, #D2D2D2 22%, #C4C4C4 40%, #CACACA 52%, #BABABA 65%, #ACACAC 80%, #A0A0A0 100%)",
            }}
          >
            {/* Horizontal micro-lines — brushed aluminium direction */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage:
                "repeating-linear-gradient(180deg," +
                "transparent 0px, transparent 1px," +
                "rgba(255,255,255,0.11) 1px, rgba(255,255,255,0.11) 2px," +
                "transparent 2px, transparent 3.5px," +
                "rgba(0,0,0,0.05) 3.5px, rgba(0,0,0,0.05) 4.5px)",
            }} />
            {/* Primary specular sweep — angled bright ellipse top-left */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(ellipse 55% 90% at 34% 0%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.22) 35%, transparent 65%)",
            }} />
            {/* Secondary glint — lower-right bounce */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(ellipse 35% 45% at 74% 100%, rgba(255,255,255,0.24) 0%, transparent 70%)",
            }} />
            {/* Top edge bright line */}
            <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 1.5, background: "rgba(255,255,255,0.82)", borderRadius: 1 }} />
            {/* Bottom shadow — junction with body */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.45) 100%)" }} />

            {/* ── Mode dial ── */}
            <div
              style={{
                position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)",
                width: 76, height: 76, borderRadius: "50%",
                // Convex chrome: bright hot spot top-left, dark opposite, faint rim-light bottom-right
                background:
                  "radial-gradient(circle at 30% 22%," +
                  "#FFFFFF 0%, #F4F4F4 4%, #E2E2E2 12%," +
                  "#C8C8C8 22%, #A8A8A8 36%, #848484 52%," +
                  "#6E6E6E 64%, #808080 76%, #606060 88%, #484848 100%)",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.58), 0 2px 6px rgba(0,0,0,0.32)," +
                  "inset 0 2px 4px rgba(255,255,255,0.65), inset 0 -2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div key={deg} style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: "42%", height: 1.5, transformOrigin: "0 50%",
                  transform: `rotate(${deg}deg)`,
                  background: "rgba(0,0,0,0.18)",
                }} />
              ))}
              <span style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", fontSize: 7.5, fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>P</span>
              <span style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", fontSize: 7.5, fontWeight: 700, color: "#CC2222" }}>A</span>
              {/* Rim ring */}
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(0,0,0,0.18)", pointerEvents: "none" }} />
            </div>

            {/* ── Shutter button ── */}
            <div
              style={{
                position: "absolute",
                left: 106,
                top: "50%",
                transform: "translateY(-20%)",
                width: 46,
                height: 22,
                borderRadius: 11,
                background:
                  "radial-gradient(ellipse at 45% 30%," +
                  "#F8F8F8 0%, #EBEBEB 25%, #D4D4D4 55%, #C0C0C0 80%, #B0B0B0 100%)",
                boxShadow:
                  "0 4px 10px rgba(0,0,0,0.48), 0 2px 4px rgba(0,0,0,0.28)," +
                  "inset 0 2px 3px rgba(255,255,255,0.82), inset 0 -1px 2px rgba(0,0,0,0.18)",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Cable release thread socket */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, #D0D0D0 0%, #A8A8A8 55%, #989898 100%)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4), inset 0 -0.5px 1px rgba(255,255,255,0.3)",
              }} />
            </div>

            {/* ── EV dial ── */}
            <div
              style={{
                position: "absolute", left: 162, top: "50%",
                transform: "translateY(-50%)",
                width: 46, height: 46, borderRadius: "50%",
                background:
                  "radial-gradient(circle at 32% 26%," +
                  "#EEEEEE 0%, #E0E0E0 8%, #C8C8C8 24%," +
                  "#ABABAB 42%, #888888 60%, #787878 80%, #666666 100%)",
                boxShadow:
                  "0 5px 14px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.28)," +
                  "inset 0 2px 3px rgba(255,255,255,0.65), inset 0 -1px 2px rgba(0,0,0,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(0,0,0,0.42)", letterSpacing: "0.04em" }}>EV</span>
            </div>

            {/* ── Hot shoe rail ── */}
            <div style={{
              position: "absolute", left: 250, top: 12,
              width: 80, height: 11, borderRadius: "2px 2px 0 0",
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.12) 100%)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.36), 0 1px 0 rgba(255,255,255,0.4)",
            }} />

            {/* ── Pop-up flash housing (closed) — thin, flush with plate ── */}
            <div style={{
              position: "absolute", left: 250, top: 24,
              width: 80, height: 22, borderRadius: "0 0 3px 3px",
              background:
                "linear-gradient(180deg, #D6D6D6 0%, #C8C8C8 45%, #BEBEBE 100%)",
              boxShadow:
                "0 2px 5px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.12)," +
                "inset 0 1px 2px rgba(255,255,255,0.52), inset 0 -1px 1px rgba(0,0,0,0.08)",
              borderTop: "1px solid rgba(0,0,0,0.18)",
            }}>
              {/* Seam line suggesting flash panel separation */}
              <div style={{
                position: "absolute", top: 8, left: 6, right: 6, height: 1,
                background: "rgba(0,0,0,0.12)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.3)",
              }} />
            </div>

            {/* ── FUJIFILM wordmark ── */}
            <span style={{
              position: "absolute", left: 364, bottom: 14,
              fontSize: 10, fontWeight: 700,
              color: "rgba(0,0,0,0.34)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              FUJIFILM
            </span>

            {/* ── Speaker grille ── */}
            <div style={{
              position: "absolute", right: 160, top: "50%",
              transform: "translateY(-50%)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 7px)",
              gridTemplateRows: "repeat(3, 7px)",
              gap: 4,
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  width: 3.5, height: 3.5, borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)",
                  boxShadow: "inset 0 1px 1px rgba(0,0,0,0.3), 0 0.5px 0 rgba(255,255,255,0.2)",
                }} />
              ))}
            </div>

            {/* ── Viewfinder ── */}
            <div style={{
              position: "absolute", right: 18, top: 17,
              width: 122, height: 80, borderRadius: 6,
              background: "linear-gradient(145deg, #1A2838 0%, #0C1620 42%, #060A10 100%)",
              border: "2px solid #525252",
              boxShadow:
                "inset 0 4px 14px rgba(0,0,0,0.92), inset 0 -1px 4px rgba(15,35,70,0.3)," +
                "0 1px 0 rgba(255,255,255,0.25), 0 2px 0 rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(50,90,150,0.22) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 42, height: 28, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 1 }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1, height: 13, background: "rgba(255,255,255,0.16)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 13, height: 1, background: "rgba(255,255,255,0.16)" }} />
            </div>

            {/* ── X100V model text ── */}
            <span style={{
              position: "absolute", right: 154, bottom: 15,
              fontSize: 9, fontWeight: 700,
              color: "rgba(0,0,0,0.3)",
              letterSpacing: "0.14em",
            }}>X100V</span>
          </div>

          {/* ═══════════════════════════════════════════════════════
              JUNCTION — occlusion shadow between plate and body
          ═══════════════════════════════════════════════════════ */}
          <div style={{
            height: 7,
            background: "linear-gradient(180deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.16) 60%, transparent 100%)",
          }} />

          {/* ═══════════════════════════════════════════════════════
              BODY — black leatherette with real volume
          ═══════════════════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              height: 375,
              // Base: dark charcoal — NOT pure black. Light from top-left quadrant.
              background:
                "radial-gradient(ellipse 70% 55% at 36% 12%, #252525 0%, #161616 42%, #0C0C0C 72%, #080808 100%)",
            }}
          >
            {/* Leatherette pebble texture — two offset dot grids */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.055) 0.8px, transparent 0.8px)," +
                "radial-gradient(circle, rgba(0,0,0,0.28) 0.8px, transparent 0.8px)",
              backgroundSize: "4px 4px, 3.2px 3.2px",
              backgroundPosition: "0 0, 1.6px 1.6px",
            }} />
            {/* Top ambient light catch */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(ellipse 55% 35% at 38% 2%, rgba(255,255,255,0.065) 0%, transparent 100%)",
            }} />
            {/* Left depth vignette */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.22) 12%, rgba(0,0,0,0.04) 22%, transparent 32%)" }} />
            {/* Right depth vignette */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(270deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.22) 12%, rgba(0,0,0,0.04) 22%, transparent 32%)" }} />
            {/* Bottom weight vignette */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 20%, transparent 45%)" }} />
            {/* Top-center edge catch (subtle) */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 12%)" }} />

            {/* Chrome top strip */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background:
                "linear-gradient(90deg, #505050 0%, #909090 10%, #C8C8C8 25%, #E8E8E8 50%, #C8C8C8 75%, #909090 90%, #505050 100%)",
            }} />
            {/* Chrome bottom strip */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background:
                "linear-gradient(90deg, #404040 0%, #787878 10%, #AAAAAA 25%, #C0C0C0 50%, #AAAAAA 75%, #787878 90%, #404040 100%)",
            }} />

            {/* ── Lens assembly ────────────────────────────────── */}
            <div
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                transform: "translate(-56%, -50%)",
                width: 316, height: 316,
              }}
            >
              {/* Outer chrome bezel — convex ring with strong specular */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 22%," +
                  "#FFFFFF 0%, #F0F0F0 5%, #D8D8D8 15%," +
                  "#B0B0B0 28%, #787878 46%," +
                  "#909090 58%, #C4C4C4 68%," +
                  "#888888 80%, #585858 90%, #3C3C3C 100%)",
                boxShadow:
                  "0 14px 44px rgba(0,0,0,0.82), 0 5px 14px rgba(0,0,0,0.62)," +
                  "inset 0 3px 6px rgba(255,255,255,0.48), inset 0 -3px 6px rgba(0,0,0,0.4)",
              }} />
              {/* Conic glint on bezel */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
                background:
                  "conic-gradient(from 195deg at 30% 22%," +
                  "rgba(255,255,255,0.5) 0deg," +
                  "rgba(255,255,255,0.08) 45deg," +
                  "transparent 110deg," +
                  "rgba(255,255,255,0.1) 260deg," +
                  "rgba(255,255,255,0.38) 315deg," +
                  "rgba(255,255,255,0.5) 360deg)",
              }} />

              {/* Ribbed focus ring */}
              <div style={{
                position: "absolute", inset: 15, borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 24%, #484848 0%, #262626 48%, #141414 76%, #0C0C0C 100%)",
                boxShadow:
                  "inset 0 4px 10px rgba(0,0,0,0.78), inset 0 -1px 3px rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}>
                {Array.from({ length: 26 }).map((_, i) => (
                  <Rib key={i} angle={(i * 360) / 26} />
                ))}
                {/* Focus ring top sheen */}
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(ellipse 68% 38% at 34% 10%, rgba(255,255,255,0.1) 0%, transparent 100%)" }} />
              </div>

              {/* Text ring */}
              <div style={{
                position: "absolute", inset: 30, borderRadius: "50%",
                background:
                  "radial-gradient(circle at 34% 28%, #383838 0%, #1E1E1E 50%, #0E0E0E 80%, #060606 100%)",
                boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}>
                <LensText />
              </div>

              {/* Dark inner barrel */}
              <div style={{
                position: "absolute", inset: 54, borderRadius: "50%",
                background:
                  "radial-gradient(circle at 32% 26%, #2A2A2A 0%, #121212 50%, #060606 100%)",
                boxShadow: "inset 0 5px 14px rgba(0,0,0,0.92)",
              }} />
              {/* Barrel accent ring */}
              <div style={{ position: "absolute", inset: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />

              {/* Lens glass — deep blue-tinted with multi-layer reflections */}
              <div style={{
                position: "absolute", inset: 76, borderRadius: "50%",
                background:
                  "radial-gradient(circle at 28% 22%," +
                  "rgba(52,72,128,0.48) 0%," +
                  "rgba(16,24,52,0.82) 38%," +
                  "rgba(4,6,16,0.97) 72%," +
                  "#020306 100%)",
                boxShadow:
                  "inset 0 8px 24px rgba(0,0,0,0.98), inset 0 -3px 10px rgba(14,32,80,0.38)",
                overflow: "hidden",
              }}>
                {/* Main specular */}
                <div style={{
                  position: "absolute", top: "6%", left: "9%",
                  width: "42%", height: "30%", borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.16) 48%, transparent 100%)",
                  transform: "rotate(-30deg)",
                }} />
                {/* Blue secondary */}
                <div style={{
                  position: "absolute", bottom: "8%", right: "6%",
                  width: "34%", height: "22%", borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(60,100,210,0.26) 0%, transparent 100%)",
                }} />
                {/* Nano-coating shimmer */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
                  background:
                    "conic-gradient(from 110deg," +
                    "transparent 0%, rgba(80,140,220,0.06) 15%," +
                    "transparent 30%, rgba(140,80,200,0.05) 50%," +
                    "transparent 65%, rgba(80,180,120,0.04) 80%," +
                    "transparent 100%)",
                }} />
                {/* Deep center */}
                <div style={{
                  position: "absolute", inset: "20%", borderRadius: "50%",
                  background: "radial-gradient(circle, #010204 0%, #020408 55%, rgba(6,10,22,0.95) 100%)",
                }} />
              </div>
              {/* Glass outer ring */}
              <div style={{ position: "absolute", inset: 70, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            </div>

            {/* ── Red power indicator LED — camera is on ── */}
            <div style={{
              position: "absolute",
              right: 52,
              top: 28,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #FF6B6B 0%, #E81010 55%, #C00000 100%)",
              boxShadow:
                "0 0 6px 2px rgba(220,20,20,0.55), 0 0 12px 4px rgba(200,10,10,0.25)," +
                "inset 0 1px 1px rgba(255,180,180,0.6)",
            }} />

            {/* Strap lug — left */}
            <div style={{
              position: "absolute", left: -10, top: "50%",
              transform: "translateY(-50%)",
              width: 16, height: 38, borderRadius: "0 5px 5px 0",
              background:
                "linear-gradient(90deg, #525252 0%, #AEAEAE 35%, #D0D0D0 55%, #989898 78%, #626262 100%)",
              boxShadow: "3px 0 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)",
            }} />
            {/* Strap lug — right */}
            <div style={{
              position: "absolute", right: -10, top: "50%",
              transform: "translateY(-50%)",
              width: 16, height: 38, borderRadius: "5px 0 0 5px",
              background:
                "linear-gradient(270deg, #525252 0%, #AEAEAE 35%, #D0D0D0 55%, #989898 78%, #626262 100%)",
              boxShadow: "-3px 0 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)",
            }} />
          </div>

          {/* ═══════════════════════════════════════════════════════
              BASE PLATE — physical thickness / weight
          ═══════════════════════════════════════════════════════ */}
          <div style={{
            height: 13,
            background:
              "linear-gradient(180deg, #7E7E7E 0%, #686868 30%, #525252 65%, #404040 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.38), inset 0 -1px 0 rgba(255,255,255,0.06)",
          }} />
        </div>
      </div>

      {/* ── Instruction label ──────────────────────────────────────── */}
      <p style={{ fontSize: 17, fontWeight: 400, color: "var(--color-text-secondary)", letterSpacing: "0.02em", margin: "20px 0 0" }}>
        Click the camera to add photos
      </p>

      {/* ── Hidden file input ──────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
        }}
      />

    </div>
  );
}
