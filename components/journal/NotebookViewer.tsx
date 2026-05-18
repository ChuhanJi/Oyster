"use client";

import { useState, useEffect, createContext, useContext } from "react";
import type { SavedPhoto, Sticker } from "@/lib/types";

const ZoomCtx = createContext<((idx: number) => void) | null>(null);

// ── Notebook geometry ────────────────────────────────────────────
const PAGE_W = 580;
const NB_W   = PAGE_W * 2;
const PAGE_H = 740;
const SCALE  = 1.28;

// ── Design constants ─────────────────────────────────────────────
const ROTATIONS = [-2.4, 1.7, -1.1, 2.6, -2.0, 1.4, -1.9, 2.2];
const TAPE_CFG  = [
  { x: -16, r: -11 }, { x: 18, r: 9 },
  { x: -20, r: 14 },  { x: 14, r: -8 },
  { x: -12, r: 12 },  { x: 20, r: -13 },
  { x: -18, r: 10 },  { x: 16, r: -10 },
];

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// ── Tape strip ────────────────────────────────────────────────────
function Tape({ x, r }: { x: number; r: number }) {
  return (
    <div style={{
      position: "absolute",
      top: -10, left: `calc(50% + ${x}px)`,
      transform: `translateX(-50%) rotate(${r}deg)`,
      width: 52, height: 18,
      background: "rgba(255,252,195,0.7)",
      backgroundImage:
        "repeating-linear-gradient(90deg,transparent 0,transparent 3px," +
        "rgba(0,0,0,0.024) 3px,rgba(0,0,0,0.024) 4px)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.09)",
      borderRadius: 1,
      zIndex: 5,
    }} />
  );
}

// ── Photo cell ────────────────────────────────────────────────────
function PhotoCell({ photo, idx }: { photo: SavedPhoto; idx: number }) {
  const rot    = ROTATIONS[idx % ROTATIONS.length];
  const tape   = TAPE_CFG[idx % TAPE_CFG.length];
  const onZoom = useContext(ZoomCtx);
  return (
    <div
      onClick={() => onZoom?.(idx)}
      style={{
        position: "relative",
        transform: `rotate(${rot}deg)`,
        transformOrigin: "center center",
        display: "inline-block",
        flexShrink: 0,
        cursor: "zoom-in",
      }}
    >
      <Tape x={tape.x} r={tape.r} />
      <div style={{
        background: "#FFFFFF",
        padding: 4,
        boxShadow:
          "0 5px 16px rgba(0,0,0,0.16)," +
          "0 2px 5px rgba(0,0,0,0.09)," +
          "0 1px 2px rgba(0,0,0,0.06)",
        maxWidth: 240,
      }}>
        <img
          src={photo.dataUrl}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "auto", maxHeight: 255, objectFit: "cover", display: "block" }}
        />
      </div>
      {photo.stickers.map((s: Sticker) => (
        <div key={s.id} style={{
          position: "absolute",
          left: `${-8 + s.x * 1.16}%`,
          top:  `${-8 + s.y * 1.16}%`,
          transform: "translate(-50%,-50%)",
          fontSize: 44, lineHeight: 1, zIndex: 10,
          filter: "url(#nb-sticker-border)",
        }}>
          {s.emoji}
        </div>
      ))}
    </div>
  );
}

// ── Photo slot: photo + caption side by side ──────────────────────
// Deterministic scatter positions — all within 20%–70% of slot area
const SCATTER_LEFT = ["22%", "48%", "30%", "54%", "20%", "42%", "58%", "26%"];

function PhotoSlot({ photo, idx }: { photo: SavedPhoto | null; idx: number }) {
  if (!photo) return null;
  const hasCaption = !!photo.caption;

  if (!hasCaption) {
    const left = SCATTER_LEFT[idx % SCATTER_LEFT.length];
    return (
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "absolute", left, top: "50%", transform: "translateY(-50%)" }}>
          <PhotoCell photo={photo} idx={idx} />
        </div>
      </div>
    );
  }

  const photoFirst = idx % 2 === 0;
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "row",
      alignItems: "center", justifyContent: "flex-start",
      gap: 18, minWidth: 0, padding: "6px 0",
    }}>
      {photoFirst ? (
        <>
          <PhotoCell photo={photo} idx={idx} />
          <div style={{
            flex: 1, minWidth: 0,
            fontFamily: "var(--font-caveat), cursive",
            fontSize: 20, color: "#5C4E3E",
            lineHeight: 1.6, wordBreak: "break-word",
          }}>
            {photo.caption}
          </div>
        </>
      ) : (
        <>
          <div style={{
            flex: 1, minWidth: 0,
            fontFamily: "var(--font-caveat), cursive",
            fontSize: 20, color: "#5C4E3E",
            lineHeight: 1.6, wordBreak: "break-word",
          }}>
            {photo.caption}
          </div>
          <PhotoCell photo={photo} idx={idx} />
        </>
      )}
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────────
function PageHeader({ city, destination, date }: { city: string; destination: string; date: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontFamily: "var(--font-caveat), cursive",
        fontSize: 28, fontWeight: 600, color: "#3E342A", lineHeight: 1.1,
      }}>
        {city || destination}
      </div>
      <div style={{
        fontFamily: "var(--font-caveat), cursive",
        fontSize: 17, color: "#9A8A78", marginTop: 3,
      }}>
        {fmtDate(date)}
      </div>
      <div style={{ marginTop: 10, height: 1, background: "rgba(0,0,0,0.07)" }} />
    </div>
  );
}

// ── Single notebook page ──────────────────────────────────────────
function NotebookPage({
  pageIdx, allPhotos, isLeft, showHeader, headerProps, style,
}: {
  pageIdx: number;
  allPhotos: (SavedPhoto | null)[];
  isLeft: boolean;
  showHeader?: boolean;
  headerProps?: { city: string; destination: string; date: string };
  style?: React.CSSProperties;
}) {
  const slot0 = allPhotos[pageIdx * 2]     ?? null;
  const slot1 = allPhotos[pageIdx * 2 + 1] ?? null;
  const idx0  = pageIdx * 2;
  const idx1  = pageIdx * 2 + 1;

  return (
    <div style={{
      width: PAGE_W, height: PAGE_H,
      background: "#F8F5EC",
      backgroundImage:
        "repeating-linear-gradient(transparent,transparent 27px," +
        "rgba(0,0,0,0.034) 27px,rgba(0,0,0,0.034) 28px)",
      backgroundPositionY: 10,
      position: "relative",
      overflow: "hidden",
      padding: "30px 32px 24px",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      ...style,
    }}>
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        [isLeft ? "left" : "right"]: 0, width: 14,
        background: isLeft
          ? "linear-gradient(to right,rgba(0,0,0,0.06),transparent)"
          : "linear-gradient(to left,rgba(0,0,0,0.06),transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        [isLeft ? "right" : "left"]: 0, width: 18,
        background: isLeft
          ? "linear-gradient(to left,rgba(0,0,0,0.05),transparent)"
          : "linear-gradient(to right,rgba(0,0,0,0.05),transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 7,
        background: "linear-gradient(180deg,rgba(0,0,0,0.04),transparent)",
        pointerEvents: "none",
      }} />

      {showHeader && headerProps && <PageHeader {...headerProps} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <PhotoSlot photo={slot0} idx={idx0} />
        {slot0 && slot1 && (
          <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "2px 0" }} />
        )}
        <PhotoSlot photo={slot1} idx={idx1} />
      </div>

      <div style={{
        position: "absolute", bottom: 12,
        [isLeft ? "left" : "right"]: 32,
        fontFamily: "var(--font-caveat), cursive",
        fontSize: 12, color: "rgba(0,0,0,0.18)",
      }}>
        {pageIdx + 1}
      </div>
    </div>
  );
}

// ── Arrow button ──────────────────────────────────────────────────
function PageArrow({ dir }: { dir: "left" | "right" }) {
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.8)",
        fontSize: 18, color: "rgba(0,0,0,0.38)",
        userSelect: "none", transition: "background 150ms ease",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.95)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.75)")}
    >
      {dir === "left" ? "‹" : "›"}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────
export default function NotebookViewer({
  photos,
  meta,
  loading = false,
  scale = SCALE,
}: {
  photos: SavedPhoto[];
  meta: { city: string; destination: string; date: string };
  loading?: boolean;
  scale?: number;
}) {
  const totalPages   = Math.ceil(photos.length / 2);
  const totalSpreads = Math.ceil(totalPages / 2);

  const [spreadIdx, setSpreadIdx]   = useState(0);
  const [flipDir, setFlipDir]       = useState<"idle" | "forward" | "backward">("idle");
  const [pendingSpread, setPending] = useState(0);
  const [flipAngle, setFlipAngle]   = useState(0);
  const [zoomedIdx, setZoomedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (zoomedIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setZoomedIdx(i => (i !== null && i > 0                  ? i - 1 : i));
      if (e.key === "ArrowRight") setZoomedIdx(i => (i !== null && i < photos.length - 1  ? i + 1 : i));
      if (e.key === "Escape")     setZoomedIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedIdx, photos.length]);

  useEffect(() => {
    if (flipDir === "idle") return;
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setFlipAngle(flipDir === "forward" ? -180 : 180);
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [flipDir]);

  const padded: (SavedPhoto | null)[] = [...photos];
  while (padded.length < totalPages * 2) padded.push(null);

  const canForward  = spreadIdx < totalSpreads - 1;
  const canBackward = spreadIdx > 0;
  const isFlipping  = flipDir !== "idle";

  const doFlip = (dir: "forward" | "backward") => {
    if (isFlipping) return;
    const next = dir === "forward" ? spreadIdx + 1 : spreadIdx - 1;
    setPending(next);
    setFlipAngle(0);
    setFlipDir(dir);
  };

  const onFlipEnd = () => {
    setSpreadIdx(pendingSpread);
    setFlipDir("idle");
    setFlipAngle(0);
  };

  const curL = spreadIdx * 2;
  const curR = spreadIdx * 2 + 1;
  const tgtL = pendingSpread * 2;
  const tgtR = pendingSpread * 2 + 1;

  return (
    <ZoomCtx.Provider value={setZoomedIdx}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* SVG filter for solid sticker borders */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="nb-sticker-border" x="-25%" y="-25%" width="150%" height="150%">
            <feMorphology operator="dilate" radius="3" in="SourceAlpha" result="dilated" />
            <feFlood floodColor="white" result="white" />
            <feComposite in="white" in2="dilated" operator="in" result="whiteBorder" />
            <feOffset dx="0" dy="3" in="dilated" result="shadowShape" />
            <feGaussianBlur stdDeviation="4" in="shadowShape" result="blurredShadow" />
            <feFlood floodColor="black" floodOpacity="0.28" result="shadowColor" />
            <feComposite in="shadowColor" in2="blurredShadow" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="whiteBorder" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Spread counter — sits above the notebook, right-aligned within its width */}
      {totalSpreads > 1 && (
        <div style={{ width: NB_W * scale, display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
          <span style={{
            fontFamily: "var(--font-caveat), cursive",
            fontSize: 18, fontWeight: 600, color: "var(--color-text-secondary)",
          }}>
            {spreadIdx + 1} / {totalSpreads}
          </span>
        </div>
      )}

      {/* Scale wrapper */}
      <div style={{
        width: NB_W * scale, height: PAGE_H * scale,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <div style={{
          width: NB_W, height: PAGE_H,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          boxShadow:
            "0 48px 96px rgba(0,0,0,0.22)," +
            "0 16px 40px rgba(0,0,0,0.12)," +
            "0 4px 10px rgba(0,0,0,0.07)",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          {/* Static left page */}
          <div style={{ position: "absolute", left: 0, top: 0, width: PAGE_W, height: PAGE_H }}>
            <NotebookPage
              pageIdx={isFlipping && flipDir === "backward" ? tgtL : curL}
              allPhotos={padded} isLeft
              showHeader={(isFlipping && flipDir === "backward" ? tgtL : curL) === 0}
              headerProps={meta}
            />
          </div>

          {/* Static right page */}
          <div style={{ position: "absolute", left: PAGE_W, top: 0, width: PAGE_W, height: PAGE_H }}>
            <NotebookPage
              pageIdx={isFlipping && flipDir === "forward" ? tgtR : curR}
              allPhotos={padded} isLeft={false}
            />
          </div>

          {/* Center spine */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: "50%", transform: "translateX(-50%)",
            width: 1, background: "rgba(0,0,0,0.10)",
            zIndex: 5, pointerEvents: "none",
          }} />

          {/* Flip element */}
          {isFlipping && (
            <div
              style={{
                position: "absolute",
                top: 0, height: PAGE_H, width: PAGE_W,
                left: flipDir === "forward" ? PAGE_W : 0,
                transformOrigin: flipDir === "forward" ? "left center" : "right center",
                transform: `perspective(2600px) rotateY(${flipAngle}deg)`,
                transition: "transform 720ms ease-in-out",
                transformStyle: "preserve-3d",
                zIndex: 10,
              }}
              onTransitionEnd={onFlipEnd}
            >
              <div style={{
                position: "absolute", inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              } as React.CSSProperties}>
                <NotebookPage
                  pageIdx={flipDir === "forward" ? curR : curL}
                  allPhotos={padded}
                  isLeft={flipDir !== "forward"}
                  showHeader={(flipDir === "forward" ? curR : curL) === 0}
                  headerProps={meta}
                />
              </div>
              <div style={{
                position: "absolute", inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              } as React.CSSProperties}>
                <NotebookPage
                  pageIdx={flipDir === "forward" ? tgtL : tgtR}
                  allPhotos={padded}
                  isLeft={flipDir === "forward"}
                  showHeader={(flipDir === "forward" ? tgtL : tgtR) === 0}
                  headerProps={meta}
                />
              </div>
            </div>
          )}

          {/* Nav arrows */}
          {canBackward && !isFlipping && (
            <div onClick={() => doFlip("backward")} style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 72,
              cursor: "pointer", zIndex: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PageArrow dir="left" />
            </div>
          )}
          {canForward && !isFlipping && (
            <div onClick={() => doFlip("forward")} style={{
              position: "absolute", top: 0, right: 0, bottom: 0, width: 72,
              cursor: "pointer", zIndex: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PageArrow dir="right" />
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(246,246,246,0.75)", backdropFilter: "blur(4px)", zIndex: 50,
          fontSize: 14, color: "var(--color-text-secondary)",
        }}>
          Developing photos…
        </div>
      )}
    </div>

    {/* Zoom overlay */}
    {zoomedIdx !== null && (
      <div
        onClick={() => setZoomedIdx(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.88)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 24, cursor: "zoom-out",
        }}
      >
        {/* Middle row: ‹  photo  › */}
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: 20 }}
        >
          <button
            onClick={() => setZoomedIdx(i => (i !== null && i > 0 ? i - 1 : i))}
            disabled={zoomedIdx === 0}
            style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "rgba(255,255,255,0.12)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: zoomedIdx === 0 ? "default" : "pointer",
              color: "white", opacity: zoomedIdx === 0 ? 0.2 : 1,
              transition: "background 150ms, opacity 150ms",
            }}
            onMouseEnter={e => { if (zoomedIdx > 0) e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div style={{ position: "relative", maxWidth: "80vw", maxHeight: "78vh" }}>
            <img
              src={photos[zoomedIdx].dataUrl}
              alt=""
              draggable={false}
              style={{
                display: "block",
                maxWidth: "80vw", maxHeight: "78vh",
                objectFit: "contain",
                boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "38%",
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)",
              pointerEvents: "none",
            }} />
            {photos[zoomedIdx].stickers.map((s: Sticker) => (
              <div key={s.id} style={{
                position: "absolute",
                left: `${s.x}%`, top: `${s.y}%`,
                transform: "translate(-50%,-50%)",
                fontSize: 36, lineHeight: 1, zIndex: 10,
                pointerEvents: "none",
              }}>
                {s.emoji}
              </div>
            ))}
          </div>

          <button
            onClick={() => setZoomedIdx(i => (i !== null && i < photos.length - 1 ? i + 1 : i))}
            disabled={zoomedIdx === photos.length - 1}
            style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "rgba(255,255,255,0.12)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: zoomedIdx === photos.length - 1 ? "default" : "pointer",
              color: "white", opacity: zoomedIdx === photos.length - 1 ? 0.2 : 1,
              transition: "background 150ms, opacity 150ms",
            }}
            onMouseEnter={e => { if (zoomedIdx < photos.length - 1) e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Dots */}
        {photos.length > 1 && (
          <div
            onClick={e => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setZoomedIdx(i)}
                style={{
                  width: i === zoomedIdx ? 20 : 8, height: 8, borderRadius: 4,
                  background: i === zoomedIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "width 200ms ease, background 200ms ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    )}
    </ZoomCtx.Provider>
  );
}
