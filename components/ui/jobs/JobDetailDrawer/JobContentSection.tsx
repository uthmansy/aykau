"use client";

import { Image } from "antd";
import { JobListing } from "@/lib/jobs/types";

interface Props {
  job: JobListing;
}

export default function JobContentSection({ job }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Job Description
        </h3>
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20">
          <p className="font-inter text-[16px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      </div>

      {job.photo_urls?.length && job.photo_urls.length > 0 && (
        <div>
          <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Attachments
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {job.photo_urls.slice(0, 6).map((url, idx) => (
              <Image
                key={idx}
                src={url}
                alt={`Attachment ${idx + 1}`}
                className="aspect-square object-cover rounded-lg border border-outline-variant/20 hover:scale-105 transition-transform cursor-pointer"
                preview={{ mask: false }}
              />
            ))}
          </div>
        </div>
      )}

      {(job.access_notes || job.frequency || job.custom_details) && (
        <div className="bg-surface-container rounded-2xl p-5 space-y-4 border border-outline-variant/20">
          {job.access_notes && (
            <div>
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                Access Notes
              </span>
              <p className="font-inter text-[14px] text-on-surface leading-relaxed">
                {job.access_notes}
              </p>
            </div>
          )}
          {job.frequency && (
            <div>
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                Frequency
              </span>
              <p className="font-inter text-[14px] text-on-surface capitalize">
                {job.frequency}
              </p>
            </div>
          )}
          {job.custom_details && Object.keys(job.custom_details).length > 0 && (
            <div>
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
                Additional Details
              </span>
              <div className="space-y-0">
                {Object.entries(job.custom_details).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between font-inter text-[14px] py-2 border-b border-outline-variant/20 last:border-0"
                  >
                    <span className="text-on-surface-variant capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-on-surface font-medium text-right max-w-[60%]">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
