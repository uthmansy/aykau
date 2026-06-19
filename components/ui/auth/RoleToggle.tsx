"use client";

import { Segmented } from "antd";

type Role = "customer" | "artisan";

interface RoleToggleProps {
  value: Role;
  onChange: (role: Role) => void;
}

export default function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="mb-6">
      <label className="block font-inter text-label-sm font-semibold text-outline uppercase tracking-wider mb-3">
        Join as
      </label>
      <Segmented
        block
        value={value}
        onChange={(val) => onChange(val as Role)}
        options={[
          { label: "Customer", value: "customer" },
          { label: "Artisan", value: "artisan" },
        ]}
        className="w-full! bg-surface-container! rounded-xl! p-1! [&_.ant-segmented-item]:rounded-lg! [&_.ant-segmented-item-selected]:bg-surface-container-lowest! [&_.ant-segmented-item-selected]:shadow-sm! [&_.ant-segmented-item-label]:font-inter! [&_.ant-segmented-item-label]:text-label-md! [&_.ant-segmented-item-label]:font-semibold! [&_.ant-segmented-item-label]:py-2.5!"
      />
    </div>
  );
}
