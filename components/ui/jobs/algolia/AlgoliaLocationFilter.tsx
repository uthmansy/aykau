"use client";

import { useState } from "react";
import { useConfigure } from "react-instantsearch";
import { Select, Radio, Button } from "antd";
import { EnvironmentOutlined, AimOutlined } from "@ant-design/icons";
import { useGeolocation } from "@/hooks/useGeolocation";

const RADIUS_OPTIONS = [
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: 25000, label: "25 km" },
  { value: 50000, label: "50 km" },
  { value: "all", label: "Any distance" },
];

type LocationMode = "gps" | "manual" | "none";

export default function AlgoliaLocationFilter() {
  const {
    location,
    loading: geoLoading,
    error: geoError,
    refresh: refreshGeo,
  } = useGeolocation();
  const [mode, setMode] = useState<LocationMode>("gps");
  const [radius, setRadius] = useState<number | "all">(10000);
  const [manualLocation, setManualLocation] = useState<string>("");

  // Configure Algolia geo-search based on mode
  useConfigure({
    aroundLatLng:
      mode === "gps" && location
        ? `${location.lat}, ${location.lng}`
        : undefined,
    aroundRadius: radius === "all" ? "all" : radius,
  });

  const handleModeChange = (newMode: LocationMode) => {
    setMode(newMode);
    if (newMode === "gps" && !location) {
      refreshGeo();
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg! p-4 shadow-[var(--shadow-level-1)]">
      <h3 className="font-inter text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-3">
        Location
      </h3>

      <div className="flex flex-col gap-3">
        {/* Mode Selection */}
        <Radio.Group
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="flex flex-col gap-2"
        >
          <Radio value="gps" className="font-inter text-[14px]!">
            <span className="flex items-center gap-2">
              <AimOutlined className="text-primary" />
              Use my location
            </span>
          </Radio>
          <Radio value="manual" className="font-inter text-[14px]!">
            <span className="flex items-center gap-2">
              <EnvironmentOutlined className="text-primary" />
              Choose location
            </span>
          </Radio>
          <Radio value="none" className="font-inter text-[14px]!">
            Anywhere
          </Radio>
        </Radio.Group>

        {/* GPS Status */}
        {mode === "gps" && (
          <div className="pl-6">
            {geoLoading && (
              <p className="font-inter text-[12px] text-outline">
                Getting your location...
              </p>
            )}
            {geoError && (
              <div className="flex flex-col gap-2">
                <p className="font-inter text-[12px] text-error">{geoError}</p>
                <Button
                  size="small"
                  onClick={refreshGeo}
                  className="rounded-full! bg-primary! text-on-primary!"
                >
                  Try again
                </Button>
              </div>
            )}
            {location && !geoLoading && (
              <p className="font-inter text-[12px] text-success-emerald">
                ✓ Location detected
              </p>
            )}
          </div>
        )}

        {/* Manual Location Input */}
        {mode === "manual" && (
          <div className="pl-6">
            <Select
              placeholder="Select state"
              value={manualLocation || undefined}
              onChange={setManualLocation}
              className="w-full"
              options={[
                { value: "Lagos", label: "Lagos" },
                { value: "Abuja", label: "Abuja" },
                { value: "Rivers", label: "Rivers" },
                { value: "Kano", label: "Kano" },
                { value: "Oyo", label: "Oyo" },
                // Add more states as needed
              ]}
            />
          </div>
        )}

        {/* Radius Selection */}
        {mode !== "none" && (
          <div className="pt-2 border-t border-outline-variant/30">
            <label className="font-inter text-[12px] text-on-surface-variant mb-2 block">
              Search radius
            </label>
            <Select
              value={radius}
              onChange={setRadius}
              className="w-full"
              options={RADIUS_OPTIONS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
