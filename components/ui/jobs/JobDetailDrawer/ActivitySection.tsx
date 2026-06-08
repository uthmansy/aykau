// components/jobs/ActivitySection.tsx
import { Timeline, Tag } from "antd";
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
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Job Activity
      </h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:border-gray-300 transition-colors">
          <EyeOutlined className="text-gray-400 text-xl mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {activity.viewed_count}
          </div>
          <div className="text-xs text-gray-500 mt-1">Views</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:border-gray-300 transition-colors">
          <MessageOutlined className="text-gray-400 text-xl mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {activity.quote_count}
          </div>
          <div className="text-xs text-gray-500 mt-1">Quotes</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Recent Activity
        </span>
        <Timeline
          className="mt-4"
          mode="left"
          items={[
            {
              content: (
                <div className="text-sm">
                  <strong className="text-gray-900 font-medium">
                    Job Posted
                  </strong>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(job.created_at!).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ),
              icon: <CheckCircleFilled style={{ color: "#10b981" }} />,
            },
            {
              content: (
                <div className="text-sm">
                  <strong className="text-gray-900 font-medium">
                    First Quote Received
                  </strong>
                  <p className="text-gray-500 text-xs mt-0.5">2 hours ago</p>
                </div>
              ),
              icon: <MessageOutlined style={{ color: "#6b7280" }} />,
            },
          ]}
        />
      </div>

      {/* Expires */}
      {job.expires_at && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ClockCircleOutlined className="text-amber-500 mt-0.5 text-lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-900 text-sm">
                Expires in
              </span>
              <Tag color="warning" className="rounded-full border-0 text-xs">
                {Math.ceil(
                  (new Date(job.expires_at).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </Tag>
            </div>
            <p className="text-amber-700 text-xs mt-1">
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
