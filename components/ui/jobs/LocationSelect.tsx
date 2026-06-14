"use client";

import { Form, Input, Select } from "antd";
import {
  getStates,
  getLgasByState,
  getLgaById,
  formatLgaOptions,
} from "@/lib/helpers/location";

interface Props {
  updateData: (data: any) => void;
}

export default function LocationSelect({ updateData }: Props) {
  const form = Form.useFormInstance();
  const stateCode = Form.useWatch("state", form);
  const lgas = stateCode ? getLgasByState(stateCode) : [];

  const inputClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! h-12! px-4! font-inter! text-[16px]! focus:ring-1! focus:ring-primary/30!";
  const selectClasses =
    "w-full! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-12! [&_.ant-select-selector]:shadow-none! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[16px]!";
  const labelClass =
    "font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant";

  return (
    <>
      <Form.Item
        name="state"
        label={
          <span className={labelClass}>Which state are you based in?</span>
        }
        rules={[{ required: true, message: "Please select your state" }]}
        className="mb-4!"
      >
        <Select
          placeholder="Select your state"
          options={getStates().map((s) => ({ value: s.code, label: s.name }))}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          onChange={() => {
            form.setFieldsValue({ lgaId: undefined, city: undefined });
            updateData({
              lgaId: undefined,
              lgaName: undefined,
              lgaCoordinates: undefined,
            });
          }}
          optionFilterProp="label"
          className={selectClasses}
        />
      </Form.Item>

      {stateCode ? (
        <Form.Item
          name="lgaId"
          label={<span className={labelClass}>Local Government Area</span>}
          rules={[{ required: true, message: "Please select your LGA" }]}
          className="mb-4!"
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
              if (lga)
                updateData({
                  lgaId,
                  lgaName: lga.name,
                  lgaCoordinates: { lat: lga.latitude, lng: lga.longitude },
                });
            }}
            optionFilterProp="label"
            className={selectClasses}
          />
        </Form.Item>
      ) : (
        <Form.Item
          label={<span className={labelClass}>Local Government Area</span>}
          className="mb-4!"
        >
          <Select
            disabled
            placeholder="Select a state first"
            className={selectClasses}
          />
        </Form.Item>
      )}

      <Form.Item
        name="city"
        label={<span className={labelClass}>City / Area (optional)</span>}
        extra={
          <span className="font-inter text-[12px] text-outline mt-1 block">
            e.g. Ikeja, Lekki, Garki — or leave blank to use LGA name
          </span>
        }
        className="mb-4!"
      >
        <Input placeholder="e.g. Aba, Umuahia" className={inputClasses} />
      </Form.Item>

      <Form.Item
        name="postCode"
        label={<span className={labelClass}>Post Code</span>}
        rules={[{ required: true, message: "Please enter your Post Code" }]}
        className="mb-4!"
      >
        <Input placeholder="e.g. 450001" className={inputClasses} />
      </Form.Item>

      <Form.Item
        name="addressPreference"
        label={
          <span className={labelClass}>
            How do you prefer to share your address?
          </span>
        }
        rules={[{ required: true }]}
        extra={
          <span className="font-inter text-[12px] text-outline mt-1 block">
            Your exact address is only shared with professionals you accept
          </span>
        }
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
          className={selectClasses}
        />
      </Form.Item>

      {form.getFieldValue("lgaCoordinates") && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mt-2 flex items-center gap-2">
          <span className="text-primary">📍</span>
          <span className="font-inter text-[12px] text-on-surface-variant">
            Coordinates: {form.getFieldValue("lgaCoordinates")?.lat.toFixed(4)},{" "}
            {form.getFieldValue("lgaCoordinates")?.lng.toFixed(4)}
          </span>
        </div>
      )}
    </>
  );
}
