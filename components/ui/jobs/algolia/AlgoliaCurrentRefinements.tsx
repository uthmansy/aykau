"use client";

import { useCurrentRefinements } from "react-instantsearch";
import { Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";

export default function AlgoliaCurrentRefinements() {
  const { items } = useCurrentRefinements();

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        // Skip the default status/source filters
        if (item.attribute === "status" || item.attribute === "source") {
          return null;
        }

        return item.refinements.map((refinement) => (
          <Tag
            key={`${item.attribute}-${refinement.value}`}
            closable
            onClose={(e) => {
              e.preventDefault();
              item.refine(refinement.value);
            }}
            className="bg-primary-container! text-on-primary-container! border-none! rounded-full! px-3! py-1! font-inter! text-[12px]!"
          >
            <span className="font-semibold">
              {item.attribute.replace("_", " ")}:
            </span>{" "}
            {refinement.label}
          </Tag>
        ));
      })}
    </div>
  );
}
