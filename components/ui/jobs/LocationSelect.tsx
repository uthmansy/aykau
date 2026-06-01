"use client";

import { Form, Input, Select } from "antd";
import { useCustomerOnboardingStore } from "@/store/customerOnboarding.store";
import {
  getStates,
  getLgasByState,
  getLgaById,
  formatLgaOptions,
} from "@/lib/helpers/location";

interface Props {
  updateData: (data: any) => void;
  data: any;
}

export default function LocationSelect({ updateData, data }: Props) {
  const form = Form.useFormInstance();

  // Reactive state watcher
  const stateCode = Form.useWatch("state", form);

  // Get LGAs for selected state
  const lgas = stateCode ? getLgasByState(stateCode) : [];

  return (
    <>
      {/* State Select */}
      <Form.Item
        name="state"
        label="Which state are you based in?"
        rules={[{ required: true, message: "Please select your state" }]}
      >
        <Select
          placeholder="Select your state"
          options={getStates().map((s) => ({ value: s.code, label: s.name }))}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          onChange={() => {
            // Clear dependent fields when state changes
            form.setFieldsValue({ lgaId: undefined, city: undefined });
            updateData({
              lgaId: undefined,
              lgaName: undefined,
              lgaCoordinates: undefined,
            });
          }}
          style={{ width: "100%" }}
          optionFilterProp="label"
        />
      </Form.Item>

      {/* LGA Select - Only shows when state is selected */}
      {stateCode ? (
        <Form.Item
          name="lgaId"
          label="Local Government Area"
          rules={[{ required: true, message: "Please select your LGA" }]}
        >
          <Select
            placeholder="Search or select LGA"
            options={formatLgaOptions(lgas)}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(lgaId: number) => {
              const lga = getLgaById(lgaId);
              if (lga) {
                // Auto-fill coordinates and LGA name
                updateData({
                  lgaId,
                  lgaName: lga.name,
                  lgaCoordinates: { lat: lga.latitude, lng: lga.longitude },
                });
              }
            }}
            style={{ width: "100%" }}
            optionFilterProp="label"
          />
        </Form.Item>
      ) : (
        <Form.Item label="Local Government Area">
          <Select disabled placeholder="Select a state first" />
        </Form.Item>
      )}

      {/* City/Area - Optional: can be pre-filled from LGA or manual entry */}
      <Form.Item
        name="city"
        label="City / Area (optional)"
        extra="e.g. Ikeja, Lekki, Garki — or leave blank to use LGA name"
      >
        <Input placeholder="e.g. Aba, Umuahia" />
      </Form.Item>

      {/* Post Code */}
      <Form.Item
        name="postCode"
        label="Post Code"
        rules={[{ required: true, message: "Please enter your Post Code" }]}
      >
        <Input placeholder="e.g. 450001" />
      </Form.Item>

      {/* Address Preference */}
      <Form.Item
        name="addressPreference"
        label="How do you prefer to share your address?"
        rules={[{ required: true }]}
        extra="Your exact address is only shared with professionals you accept"
      >
        <Select
          options={[
            {
              value: "on-request",
              label: "Share only when I accept a professional",
            },
            {
              value: "after-booking",
              label: "Share after booking is confirmed",
            },
            {
              value: "landmark",
              label: "Share landmark only (no exact address)",
            },
          ]}
        />
      </Form.Item>

      {/* Optional: Coordinates Preview (for debugging) */}
      {form.getFieldValue("lgaCoordinates") && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded mt-2 border border-blue-100">
          📍 Coordinates: {form.getFieldValue("lgaCoordinates")?.lat.toFixed(4)}
          , {form.getFieldValue("lgaCoordinates")?.lng.toFixed(4)}
          <br />
          <span className="text-gray-400">
            LGA: {form.getFieldValue("lgaName") || "—"}
          </span>
        </div>
      )}
    </>
  );
}
