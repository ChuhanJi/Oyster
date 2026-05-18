"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/tripStore";

const EMOJIS = [
  "✈️","🌍","🗺️","📸","🏖️","🏔️","🌅","🌃",
  "🍜","🍣","🍕","🥂","☕","🍦","🎡","🎭",
  "🎒","🧳","🗽","🗼","🏯","⛩️","🌸","🌊",
  "❤️","✨","🌟","💫","🎉","🥳","😍","🤩",
];

const PHOTO_W = 520; // photo width (height is natural)
const SLOT    = 572; // track slot per photo

// Place sticker near one of the four edges
function edgePlacement() {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: 15 + Math.random() * 70, y:  3 + Math.random() * 8 }; // top
    case 1: return { x: 89 + Math.random() * 8,  y: 15 + Math.random() * 70 }; // right
    case 2: return { x: 15 + Math.random() * 70, y: 89 + Math.random() * 8 }; // bottom
    default: return { x:  3 + Math.random() * 8,  y: 15 + Math.random() * 70 }; // left
  }
}

export default function Step3Page() {
  const router = useRouter();
  const { draft, removePhoto, updatePhotoCaption, addSticker, moveSticker } =
    useTripStore();
  const photos = draft.photos;

  const [idx, setIdx] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [track, setTrack] = useState(1500);

  useEffect(() => {
    const compute = () => setTrack(Math.max(SLOT + 2, window.innerWidth));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Carousel drag
  const dragStartX = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rawOffset, setRawOffset] = useState(0);

  // Sticker drag
  const [activeSticker, setActiveSticker] = useState<{ photoId: string; stickerId: string } | null>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const current = photos[idx];

  const goTo = useCallback((i: number) => {
    setIdx(Math.max(0, Math.min(photos.length - 1, i)));
    setPickerOpen(false);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length > 0) setIdx((i) => Math.min(i, photos.length - 1));
  }, [photos.length]);

  // ── Carousel drag ────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartX.current = e.clientX;
    setDragging(false);
    setRawOffset(0);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const d = e.clientX - dragStartX.current;
    if (Math.abs(d) > 5) setDragging(true);
    setRawOffset(d);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      if (rawOffset < -SLOT / 3 && idx < photos.length - 1) goTo(idx + 1);
      else if (rawOffset > SLOT / 3 && idx > 0) goTo(idx - 1);
    } else {
      // Tap on a side photo → navigate
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = rect.left + rect.width / 2;
        if (e.clientX < cx - PHOTO_W / 2 && idx > 0) goTo(idx - 1);
        else if (e.clientX > cx + PHOTO_W / 2 && idx < photos.length - 1) goTo(idx + 1);
      }
    }
    dragStartX.current = null;
    setDragging(false);
    setRawOffset(0);
  };

  // ── Sticker drag ─────────────────────────────────────────────────
  const onStickerDown = (e: React.MouseEvent, photoId: string, stickerId: string) => {
    e.stopPropagation();
    setActiveSticker({ photoId, stickerId });
  };
  useEffect(() => {
    if (!activeSticker) return;
    const onMove = (e: MouseEvent) => {
      const el = photoRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      moveSticker(activeSticker.photoId, activeSticker.stickerId, x, y);
    };
    const onUp = () => setActiveSticker(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [activeSticker, moveSticker]);

  // ── Emoji ─────────────────────────────────────────────────────────
  const handleEmoji = (emoji: string) => {
    if (!current) return;
    const { x, y } = edgePlacement();
    addSticker(current.id, emoji, x, y);
    setPickerOpen(false);
  };

  // ── Remove ───────────────────────────────────────────────────────
  const handleRemove = () => {
    if (photos.length === 1) { router.push("/add/step2"); return; }
    removePhoto(current.id);
  };


  if (!current) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 80 }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>No photos yet.</p>
        <button className="btn-primary" onClick={() => router.push("/add/step2")}>← Back</button>
      </div>
    );
  }

  const origin = (track - SLOT) / 2;
  const trackX = origin - idx * SLOT + rawOffset;
  const fractIdx = idx - rawOffset / SLOT;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      onClick={() => setPickerOpen(false)}
    >
      {/* SVG filter — solid white border + shadow for stickers */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="sticker-border" x="-25%" y="-25%" width="150%" height="150%">
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
      {/* ── Carousel ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{
          width: track,
          overflowX: "clip",   // clips side photos horizontally without touching vertical
          overflowY: "visible", // lets sticker borders bleed above/below freely
          position: "relative",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
          // Height follows the center photo's natural height
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Scrolling track */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "24px 0 32px",
            transform: `translateX(${trackX}px)`,
            transition: dragging ? "none" : "transform 340ms cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
          }}
        >
          {photos.map((photo, i) => {
            const dist = Math.abs(i - fractIdx);
            const clamped = Math.min(dist, 1);
            const scale = 1 - clamped * 0.28;
            const opacity = 1 - clamped * 0.5;
            const isCenter = i === idx;

            return (
              <div
                key={photo.id}
                style={{ width: SLOT, flexShrink: 0, display: "flex", justifyContent: "center" }}
              >
                {/* Photo wrapper — stickers are positioned relative to this */}
                <div
                  ref={isCenter ? photoRef : undefined}
                  onMouseEnter={() => isCenter && setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  style={{
                    position: "relative",
                    width: PHOTO_W,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    opacity,
                    transition: dragging
                      ? "none"
                      : "transform 340ms cubic-bezier(0.4,0,0.2,1), opacity 340ms ease",
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Image — natural aspect ratio, capped so controls always stay visible */}
                  <div style={{
                    width: "100%",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: isCenter
                      ? "0 24px 64px rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.1)"
                      : "0 8px 24px rgba(0,0,0,0.12)",
                    transition: dragging ? "none" : "box-shadow 340ms ease",
                  }}>
                    <img
                      src={photo.url}
                      alt=""
                      draggable={false}
                      style={{ width: "100%", height: "auto", maxHeight: "calc(100vh / 0.9 - 320px)", objectFit: "cover", display: "block" }}
                    />
                  </div>

                  {/* Stickers — can overflow photo edges */}
                  {isCenter && photo.stickers.map((s) => (
                    <div
                      key={s.id}
                      onMouseDown={(e) => onStickerDown(e, photo.id, s.id)}
                      style={{
                        position: "absolute",
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: 58,
                        cursor: activeSticker?.stickerId === s.id ? "grabbing" : "grab",
                        userSelect: "none",
                        zIndex: 10,
                        lineHeight: 1,
                        filter: "url(#sticker-border)",
                      }}
                    >
                      {s.emoji}
                    </div>
                  ))}

                  {/* Remove button */}
                  {isCenter && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                      style={{
                        position: "absolute", top: 12, right: 12,
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(0,0,0,0.52)", border: "none",
                        cursor: "pointer", color: "#FFF", fontSize: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 20, backdropFilter: "blur(4px)",
                        opacity: hovering ? 1 : 0,
                        transition: "opacity 180ms ease",
                        pointerEvents: hovering ? "auto" : "none",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Left edge fade */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: 130, pointerEvents: "none",
          background: "linear-gradient(to right, var(--color-bg) 0%, transparent 100%)",
        }} />
        {/* Right edge fade */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 130, pointerEvents: "none",
          background: "linear-gradient(to left, var(--color-bg) 0%, transparent 100%)",
        }} />
      </div>

      {/* ── Dots ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        {photos.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === idx ? 22 : 7, height: 7, borderRadius: 4,
              background: i === idx ? "#1A1A1A" : "rgba(0,0,0,0.16)",
              cursor: "pointer",
              transition: "width 260ms cubic-bezier(0.4,0,0.2,1), background 260ms ease",
            }}
          />
        ))}
      </div>

      {/* ── Per-photo controls ─────────────────────────────────────── */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28, width: PHOTO_W, position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emoji button */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: pickerOpen ? "#1A1A1A" : "var(--color-surface-raised)",
              border: "1.5px solid var(--color-border)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              transition: "background 150ms ease",
            }}
          >
            <span style={{ fontSize: 24, filter: pickerOpen ? "grayscale(1) brightness(10)" : "none", lineHeight: 1 }}>
              😊
            </span>
          </button>

          {pickerOpen && (
            <div
              style={{
                position: "absolute",
                bottom: 58, left: 0,
                width: 360,
                background: "var(--color-surface-raised)",
                borderRadius: 20,
                boxShadow: "0 20px 56px rgba(0,0,0,0.16), 0 4px 14px rgba(0,0,0,0.08)",
                padding: 16,
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: 4,
                zIndex: 100,
              }}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmoji(emoji)}
                  style={{
                    width: 38, height: 38, border: "none",
                    background: "none", cursor: "pointer",
                    fontSize: 24, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Caption */}
        <input
          type="text"
          value={current.caption}
          onChange={(e) => updatePhotoCaption(current.id, e.target.value)}
          placeholder="Write something…"
          className="caption-input"
          style={{
            flex: 1, height: 48,
            background: "transparent",
            border: "none",
            borderBottom: "1.5px solid rgba(0,0,0,0.11)",
            outline: "none",
            fontSize: 26,
            fontFamily: "var(--font-caveat), cursive",
            color: "var(--color-text-primary)",
            caretColor: "var(--color-text-primary)",
            padding: "0 4px 2px",
          }}
        />
      </div>

      {/* ── Bottom actions ────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }} onClick={(e) => e.stopPropagation()}>
        <button className="btn-primary" onClick={() => router.push("/add/journal")}>
          Done
        </button>
      </div>
    </div>
  );
}
