"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPinSelectorProps {
  value?: { lat: number; lng: number };
  onChange?: (value: { lat: number; lng: number }) => void;
  disabled?: boolean;
  initialZoom?: number;
  height?: string;
  className?: string;
  defaultCoords?: { lat: number; lng: number };
}

export default function MapPinSelector({
  value,
  onChange,
  disabled = false,
  initialZoom = 15,
  height = "400px",
  className,
  defaultCoords,
}: MapPinSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const isProgrammaticUpdate = useRef(false);
  const isInitialMount = useRef(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Early return if window is undefined or ref is not attached
    if (typeof window === "undefined" || !mapRef.current) return;

    // Prevent re-initialization
    if ((mapRef.current as any)._leaflet_id) return;

    const initMap = async () => {
      // Explicitly capture the current value to ensure it's not null for TS
      const container = mapRef.current;
      if (!container) return;

      try {
        const leaflet = await import("leaflet");
        const L = leaflet.default;

        // Fix Leaflet default icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const center: [number, number] = value
          ? [value.lat, value.lng]
          : defaultCoords
            ? [defaultCoords.lat, defaultCoords.lng]
            : [6.5244, 3.3792];

        // Now 'container' is guaranteed to be HTMLDivElement by the check above
        const map = L.map(container, {
          zoomControl: true,
          dragging: !disabled,
        }).setView(center, initialZoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapInstance.current = map;
        setIsLoading(false);

        map.on("moveend", () => {
          if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
          }
          if (disabled || isProgrammaticUpdate.current) return;
          const center = map.getCenter();
          onChange?.({ lat: center.lat, lng: center.lng });
        });
      } catch (err) {
        console.error("Failed to initialize Leaflet:", err);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapInstance.current || !value) return;
    const currentCenter = mapInstance.current.getCenter();
    const dist = mapInstance.current.distance(currentCenter, [
      value.lat,
      value.lng,
    ]);
    if (dist > 5) {
      isProgrammaticUpdate.current = true;
      mapInstance.current.setView([value.lat, value.lng], undefined, {
        animate: true,
      });
      setTimeout(() => {
        isProgrammaticUpdate.current = false;
      }, 500);
    }
  }, [value]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const toggle = (fn: string, enable: boolean) =>
      (map as any)[fn]?.[enable ? "enable" : "disable"]();
    ["dragging", "touchZoom", "doubleClickZoom", "scrollWheelZoom"].forEach(
      (fn) => toggle(fn, !disabled)
    );
  }, [disabled]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-outline-variant/20 shadow-[var(--shadow-level-1)] ${className || ""}`}
      style={{ height }}
    >
      <div ref={mapRef} className="w-full h-full" />

      {/* Fixed Center Pin - Uses Navy Primary Color */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] drop-shadow-lg">
        <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
          <path
            d="M16 0C7.163 0 0 7.163 0 16C0 26.4 16 44 16 44C16 44 32 26.4 32 16C32 7.163 24.837 0 16 0Z"
            fill="var(--primary)"
          />
          <circle cx="16" cy="16" r="6" fill="white" />
        </svg>
      </div>

      {/* Coordinates Badge - Glassmorphism */}
      {value && !isLoading && (
        <div className="absolute bottom-3 left-3 bg-surface-glass backdrop-blur-glass border border-white/20 rounded-lg px-3 py-1.5 font-mono text-[12px] text-on-surface shadow-md pointer-events-none z-[1000]">
          📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low rounded-2xl text-on-surface-variant font-inter text-[14px]">
          Loading map...
        </div>
      )}
    </div>
  );
}
