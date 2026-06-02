"use client";

import { Card, Typography, Divider, Tag } from "antd";
import {
  EnvironmentOutlined,
  WalletOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { SERVICE_CATEGORIES, SERVICE_SUBCATEGORIES } from "../JobPostingForm";
import { JobListing } from "@/lib/jobs/types";

const { Title, Text, Paragraph } = Typography;

interface Props {
  job: JobListing;
}

function JobDetailSummary({ job }: Props) {
  const categoryConfig = SERVICE_CATEGORIES.find(
    (c) => c.value === job.category
  );
  const subcategoryConfig = SERVICE_SUBCATEGORIES[job.category]?.find(
    (s) => s.value === job.subcategory
  );

  const budgetLabel =
    {
      "under-10k": "Under ₦10k",
      "10k-50k": "₦10k – ₦50k",
      "50k-100k": "₦50k – ₦100k",
      "100k-500k": "₦100k – ₦500k",
      "500k+": "₦500k+",
      flexible: "Flexible",
    }[job.budget] || job.budget;

  return (
    <div className="lg:col-span-1">
      <Card
        title={<span className="font-semibold text-gray-900">Job Summary</span>}
        className="sticky top-6 rounded-xl shadow-sm border-gray-100"
        styles={{
          body: { padding: "16px" },
          header: { borderBottom: "1px solid #f3f4f6", padding: "16px" },
        }}
      >
        <div className="space-y-4">
          <div>
            <Tag color="default" variant="solid" className="mb-2 rounded-full">
              {categoryConfig?.label}
            </Tag>
            <Title level={5} className="mb-1! text-gray-900!">
              {subcategoryConfig?.label || job.subcategory}
            </Title>
          </div>
          <Divider className="my-3!" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <WalletOutlined className="text-gray-400" />
              <span>
                Budget: <strong className="text-gray-900">{budgetLabel}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <EnvironmentOutlined className="text-gray-400" />
              <span>
                Location:{" "}
                <strong className="text-gray-900">
                  {job.state_code || job.lga_name || "Remote"}
                </strong>
              </span>
            </div>
            {job.preferred_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarOutlined className="text-gray-400" />
                <span>
                  Date:{" "}
                  <strong className="text-gray-900">
                    {new Date(job.preferred_date).toLocaleDateString("en-NG")}
                  </strong>
                </span>
              </div>
            )}
          </div>
          <Divider className="my-3!" />
          <div>
            <Text
              strong
              className="block mb-2 text-xs uppercase text-gray-500 tracking-wide"
            >
              Description
            </Text>
            <Paragraph
              className="mb-0! text-gray-700 text-sm leading-relaxed"
              ellipsis={{ rows: 6, expandable: true, symbol: "more" }}
            >
              {job.description}
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default JobDetailSummary;
