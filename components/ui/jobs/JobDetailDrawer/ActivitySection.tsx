"use client";

import {
  EyeOutlined,
  MessageOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";

interface Props {
  job: JobListing;
}

export default function ActivitySection({ job }: Props) {
  const activity = {
    viewed_count: job.viewed_count || 0,
    quote_count: job.quote_count || 0,
  };

  return (
    <div className="space-y-6">
      <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
        Job Activity
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-5 text-center border border-outline-variant/20">
          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mx-auto mb-3">
            <EyeOutlined className="text-primary text-[18px]" />
          </div>
          <div className="font-manrope text-[24px] font-semibold text-primary">
            {activity.viewed_count}
          </div>
          <div className="font-inter text-[12px] text-on-surface-variant mt-1">
            Views
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 text-center border border-outline-variant/20">
          <div className="w-10 h-10 rounded-lg bg-secondary/5 flex items-center justify-center mx-auto mb-3">
            <MessageOutlined className="text-secondary text-[18px]" />
          </div>
          <div className="font-manrope text-[24px] font-semibold text-primary">
            {activity.quote_count}
          </div>
          <div className="font-inter text-[12px] text-on-surface-variant mt-1">
            Quotes
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20">
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-4">
          Recent Activity
        </span>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-success-emerald/10 flex items-center justify-center flex-none">
                <CheckCircleFilled className="text-success-emerald text-[14px]" />
              </div>
              <div className="w-px h-full bg-outline-variant/30 mt-2" />
            </div>
            <div className="pb-4">
              <p className="font-inter text-[14px] font-medium text-on-surface">
                Job Posted
              </p>
              <p className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                {new Date(job.created_at!).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {(job.quote_count ?? 0) > 0 && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center flex-none">
                  <MessageOutlined className="text-primary text-[14px]" />
                </div>
              </div>
              <div>
                <p className="font-inter text-[14px] font-medium text-on-surface">
                  First Quote Received
                </p>
                <p className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                  Recently
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {job.expires_at && (
        <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-none">
            <ClockCircleOutlined className="text-warning text-[18px]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-inter text-[14px] font-semibold text-warning">
                Expires in
              </span>
              <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning font-inter text-[10px] font-bold uppercase tracking-wider">
                {Math.ceil(
                  (new Date(job.expires_at).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </span>
            </div>
            <p className="font-inter text-[12px] text-on-surface-variant">
              {new Date(job.expires_at).toLocaleDateString("en-NG", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
