// components/jobs/JobInfoCard.tsx
import { Card, Typography, Tag, Divider } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface Props {
  job: any;
}

export default function JobInfoCard({ job }: Props) {
  const formatBudget = (budgetKey: string) => {
    const map: Record<string, string> = {
      "under-10k": "Under ₦10,000",
      "10k-50k": "₦10,000 - ₦50,000",
      "50k-100k": "₦50,000 - ₦100,000",
      "100k-500k": "₦100,000 - ₦500,000",
      "500k+": "₦500,000+",
      flexible: "Flexible / Get Quotes",
    };
    return map[budgetKey] || budgetKey;
  };

  return (
    <Card className="!rounded-2xl !border-gray-200 !shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <Title level={2} className="!text-gray-900 !mb-2 !leading-tight">
            {job.title}
          </Title>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarOutlined />
              Posted{" "}
              {new Date(job.created_at).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {job.location && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <EnvironmentOutlined />
                  {job.location}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <Tag
            color={
              job.status === "open"
                ? "success"
                : job.status === "in_progress"
                ? "processing"
                : "default"
            }
            className="!rounded-full !px-3 !py-1 !text-xs !uppercase !m-0"
          >
            {job.status?.replace("_", " ")}
          </Tag>
          <div className="text-right">
            <Text className="!text-gray-500 !text-xs block">Budget</Text>
            <Text strong className="!text-gray-900 !text-lg">
              {formatBudget(job.budget)}
            </Text>
          </div>
        </div>
      </div>

      <Divider className="!my-4" />

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {job.urgency && (
          <div className="flex items-start gap-3">
            <ClockCircleOutlined className="text-gray-400 mt-1" />
            <div>
              <Text className="!text-gray-500 !text-xs block">Urgency</Text>
              <Text className="!text-gray-900 !font-medium capitalize">
                {job.urgency?.replace("-", " ")}
              </Text>
            </div>
          </div>
        )}
        {job.subcategory && (
          <div className="flex items-start gap-3">
            <StarOutlined className="text-gray-400 mt-1" />
            <div>
              <Text className="!text-gray-500 !text-xs block">Category</Text>
              <Text className="!text-gray-900 !font-medium">
                {job.subcategory}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <Text strong className="!text-gray-900 !text-sm block mb-2">
          Job Description
        </Text>
        <Paragraph className="!text-gray-700 !text-[15px] !leading-relaxed whitespace-pre-wrap">
          {job.description}
        </Paragraph>
      </div>
    </Card>
  );
}
