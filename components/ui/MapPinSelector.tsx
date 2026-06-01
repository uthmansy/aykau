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
  /** Fallback coordinates when `value` is undefined */
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
    if (typeof window === "undefined" || !mapRef.current) return;

    // 🛡️ BULLETPROOF CHECK: If Leaflet already attached an ID to this DOM element,
    // it means the map is already initialized. Skip to prevent the crash.
    if ((mapRef.current as any)._leaflet_id) {
      return;
    }

    const initMap = async () => {
      try {
        const leaflet = await import("leaflet");
        const L = leaflet.default;

        // Fix default icon paths for Webpack/Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Priority: Ant Form value > Component defaultCoords > Fallback (Lagos, Nigeria)
        const center: [number, number] = value
          ? [value.lat, value.lng]
          : defaultCoords
          ? [defaultCoords.lat, defaultCoords.lng]
          : [6.5244, 3.3792]; // Changed from London to Lagos for your Nigerian context
        //@ts-ignore
        const map = L.map(mapRef.current, {
          zoomControl: true,
          dragging: !disabled,
        }).setView(center, initialZoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapInstance.current = map;
        setIsLoading(false);

        // Skip first moveend (triggered by initial setView)
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

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = run only once per mount

  // Sync external value changes (form reset, API fetch, stepping back/forth)
  useEffect(() => {
    if (!mapInstance.current || !value) return;

    const currentCenter = mapInstance.current.getCenter();
    const dist = mapInstance.current.distance(currentCenter, [
      value.lat,
      value.lng,
    ]);

    // Only pan if the new coordinates are meaningfully different (> 5 meters)
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

  // Toggle interactions when disabled prop changes
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
      style={{ position: "relative", width: "100%", height, borderRadius: 8 }}
      className={className}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 8,
          border: "1px solid #d9d9d9",
        }}
      />

      {/* Fixed Center Pin */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -100%)",
          pointerEvents: "none",
          zIndex: 1000,
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))",
        }}
      >
        <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
          <path
            d="M16 0C7.163 0 0 7.163 0 16C0 26.4 16 44 16 44C16 44 32 26.4 32 16C32 7.163 24.837 0 16 0Z"
            fill="#1890ff"
          />
          <circle cx="16" cy="16" r="6" fill="white" />
        </svg>
      </div>

      {/* Coordinates Badge */}
      {value && !isLoading && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            background: "rgba(255,255,255,0.95)",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: "12px",
            color: "#333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            pointerEvents: "none",
            zIndex: 1000,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      )}

      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            borderRadius: 8,
            color: "#8c8c8c",
            fontSize: "14px",
          }}
        >
          Loading map...
        </div>
      )}
    </div>
  );
}
