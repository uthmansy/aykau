// components/jobs/JobContentSection.tsx
import { Image } from "antd";
import { JobListing } from "@/lib/jobs/types";

interface Props {
  job: JobListing;
}

export default function JobContentSection({ job }: Props) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Job Description
        </h3>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
            {job.description}
          </p>
        </div>
      </div>

      {/* Photos */}
      {job.photo_urls?.length && job.photo_urls.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Attachments
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {job.photo_urls.slice(0, 6).map((url, idx) => (
              <Image
                key={idx}
                src={url}
                alt={`Attachment ${idx + 1}`}
                className="aspect-square object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                preview={{
                  mask: false,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Details */}
      {(job.access_notes || job.frequency || job.custom_details) && (
        <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
          {job.access_notes && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Access Notes
              </span>
              <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                {job.access_notes}
              </p>
            </div>
          )}
          {job.frequency && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Frequency
              </span>
              <p className="text-sm text-gray-700 mt-1.5 capitalize">
                {job.frequency}
              </p>
            </div>
          )}
          {job.custom_details && Object.keys(job.custom_details).length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Additional Details
              </span>
              <div className="mt-2 space-y-2">
                {Object.entries(job.custom_details).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between text-sm py-1.5 border-b border-gray-200 last:border-0"
                  >
                    <span className="text-gray-500 capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-gray-900 font-medium">
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
