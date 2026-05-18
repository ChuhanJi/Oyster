"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { getAllJournals } from "@/lib/db";
import type { JournalEntry } from "@/lib/types";
import { countryCodes } from "@/lib/countryCodes";

interface CountryFeature extends Feature<Geometry> {
  id: string | number;
}

const W = 1728;
const H = 1117;
const MAX_PINS = 5;

const PASTEL_COLORS = [
  "#FFC8D2", // pink
  "#F1C7F7", // lavender
  "#FFE1B1", // peach
  "#C8CDFD", // periwinkle
  "#D2EDAB", // sage
  "#B2DCFB", // blue
  "#AEE7E6", // teal
  "#FDF9DB", // cream
];

function unlockedColor(alpha2: string): string {
  const h = alpha2.charCodeAt(0) * 31 + (alpha2.charCodeAt(1) || 0);
  return PASTEL_COLORS[h % PASTEL_COLORS.length];
}

function stableRandom(seed: string, salt: number): number {
  let h = salt * 2654435761;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return ((h >>> 0) % 10000) / 10000;
}

type PhotoPin = {
  key: string;
  cx: number;
  cy: number;
  angle: number;
  dataUrl: string;
  alpha2: string;
  overflow?: number;
};

export default function WorldMap({
  onUnlockedCount,
}: {
  onUnlockedCount?: (n: number) => void;
}) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [transform, setTransform] = useState({ scale: 1.22, x: -170, y: -100 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const projection = useMemo(
    () =>
      geoNaturalEarth1().fitSize([W, H], { type: "Sphere" } as Parameters<
        ReturnType<typeof geoNaturalEarth1>["fitSize"]
      >[1]),
    []
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    fetch("/countries-110m.json")
      .then((r) => r.json())
      .then((world) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { features } = feature(world, world.objects.countries) as any;
        setCountries(features);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const load = () => {
      getAllJournals()
        .then((entries) => {
          setJournals(entries);
          const unique = new Set(entries.map((e) => e.countryCode)).size;
          onUnlockedCount?.(unique);
        })
        .catch(console.error);
    };
    load();
    // Re-fetch when tab/page becomes visible again (handles router-cache navigation)
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [onUnlockedCount]);

  const unlockedMap = useMemo(() => {
    return journals.reduce<Record<string, JournalEntry[]>>((acc, j) => {
      (acc[j.countryCode] ??= []).push(j);
      return acc;
    }, {});
  }, [journals]);

  // Build photo pins: all photos from all trips, scattered near centroid
  const photoPins = useMemo(() => {
    const result: PhotoPin[] = [];

    for (const country of countries) {
      if (country.id == null) continue;
      const numericId = String(country.id).padStart(3, "0");
      const code = countryCodes[numericId];
      if (!code) continue;
      const trips = unlockedMap[code.alpha2];
      if (!trips?.length) continue;

      const centroid = projection(geoCentroid(country));
      if (!centroid) continue;
      const [cx, cy] = centroid;

      // All photos from all trips
      const allPhotos = trips.flatMap(t => t.photos);
      const display = allPhotos.slice(0, MAX_PINS);
      const overflow = allPhotos.length - display.length;
      const half = (display.length - 1) / 2;

      display.forEach((photo, i) => {
        const angle = -18 + stableRandom(photo.id, 0) * 36;
        const ox = (i - half) * 58 + (stableRandom(photo.id, 2) - 0.5) * 30;
        const oy = (stableRandom(photo.id, 1) - 0.5) * 54;
        result.push({
          key: `pin-${code.alpha2}-${photo.id}`,
          cx: cx + ox,
          cy: cy + oy,
          angle,
          dataUrl: photo.dataUrl,
          alpha2: code.alpha2,
        });
      });

      if (overflow > 0) {
        const lastOx = (display.length - 1 - half) * 40 + 42;
        result.push({
          key: `overflow-${code.alpha2}`,
          cx: cx + lastOx,
          cy,
          angle: 0,
          dataUrl: "",
          alpha2: code.alpha2,
          overflow,
        });
      }
    }
    return result;
  }, [countries, unlockedMap, projection]);

  const svgCoord = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const { x: px, y: py } = svgCoord(e.clientX, e.clientY);
      setTransform((prev) => {
        const newScale = Math.max(0.8, Math.min(10, prev.scale * factor));
        const r = newScale / prev.scale;
        return { scale: newScale, x: px - r * (px - prev.x), y: py - r * (py - prev.y) };
      });
    },
    [svgCoord]
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragMoved.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setHoveredId(null);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 14}px`;
      tooltipRef.current.style.top  = `${e.clientY - 32}px`;
    }
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    const rect = svgRef.current!.getBoundingClientRect();
    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx * (W / rect.width),
      y: prev.y + dy * (H / rect.height),
    }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const handleCountryClick = useCallback(
    (numericId: string) => {
      if (dragMoved.current) return;
      const code = countryCodes[numericId];
      if (!code || !unlockedMap[code.alpha2]) return;
      router.push(`/country/${code.alpha2}`);
    },
    [unlockedMap, router]
  );

  const hoveredName = hoveredId ? (countryCodes[hoveredId]?.name ?? null) : null;

  return (
    <>
    {/* Country name tooltip */}
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 50,
        opacity: hoveredName ? 1 : 0,
        transition: "opacity 120ms ease",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(8px)",
        padding: "5px 11px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-text-primary)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.07)",
        whiteSpace: "nowrap",
      }}
    >
      {hoveredName}
    </div>

    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "100%", display: "block", userSelect: "none" }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <defs>
        <filter id="land-shadow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="rgba(0,0,0,0.22)" />
        </filter>
      </defs>

      <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
        {/* Country fills */}
        <g filter="url(#land-shadow)">
        {countries.map((country, idx) => {
          const rawId = country.id;
          const numericId = rawId != null ? String(rawId).padStart(3, "0") : "";
          const code = numericId ? countryCodes[numericId] : undefined;
          const isUnlocked = Boolean(code && unlockedMap[code.alpha2]);
          const d = pathGen(country) ?? "";
          const isHovered = hoveredId === numericId && numericId !== "";
          return (
            <path
              key={rawId != null ? String(rawId) : `country-${idx}`}
              d={d}
              fill={isUnlocked && code ? unlockedColor(code.alpha2) : "var(--color-map-unvisited)"}
              stroke="var(--color-bg)"
              strokeWidth={0.5}
              style={{
                cursor: isUnlocked ? "pointer" : "default",
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: isHovered ? "scale(1.07)" : "scale(1)",
                transition: "transform 180ms ease, fill 150ms ease",
                filter: isHovered ? "brightness(0.93)" : "none",
              }}
              onClick={() => handleCountryClick(numericId)}
              onMouseEnter={() => { if (!dragging.current && numericId) setHoveredId(numericId); }}
              onMouseLeave={() => setHoveredId(null)}
            />
          );
        })}
        </g>

        {/* Photo pins */}
        {photoPins.map((p) => (
          <g
            key={p.key}
            transform={`translate(${p.cx} ${p.cy}) rotate(${p.angle})`}
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              if (!dragMoved.current) router.push(`/country/${p.alpha2}`);
            }}
          >
            {p.overflow !== undefined ? (
              /* Overflow badge */
              <>
                <circle r="20" fill="white" />
                <circle r="20" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontWeight="500"
                  fill="#555555"
                  style={{ userSelect: "none", fontFamily: "-apple-system, sans-serif" }}
                >
                  +{p.overflow}
                </text>
              </>
            ) : (
              /* Photo pin */
              <>
                <defs>
                  <clipPath id={`c-${p.key}`}>
                    <rect x="-20" y="-20" width="40" height="40" rx="3" />
                  </clipPath>
                </defs>
                {/* Drop shadow */}
                <rect
                  x="-22" y="-22" width="44" height="44" rx="5"
                  fill="rgba(0,0,0,0.16)"
                  transform="translate(1 3)"
                />
                {/* White border frame */}
                <rect x="-22" y="-22" width="44" height="44" rx="5" fill="white" />
                {/* Photo */}
                <image
                  href={p.dataUrl}
                  x="-20" y="-20"
                  width="40" height="40"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#c-${p.key})`}
                />
              </>
            )}
          </g>
        ))}

      </g>
    </svg>
    </>
  );
}
