// components/jobs/manage/QuotesList.tsx
"use client";

import { useState } from "react";
import { List, Card, Tag, Avatar, Typography, Button, Empty } from "antd";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import QuoteDetailModal from "./QuoteDetailModal";

const { Text, Title } = Typography;

interface Props {
  quotes: any[];
  jobId: string;
  onQuoteAction: () => void;
}

export default function QuotesList({ quotes, jobId, onQuoteAction }: Props) {
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "blue";
      case "responded":
        return "orange";
      case "accepted":
        return "green";
      case "declined":
        return "red";
      default:
        return "default";
    }
  };

  const openModal = (quote: any) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);

    // Optional: Mark quote as viewed by customer
    // supabase.from('job_quotes').update({ is_viewed: true }).eq('id', quote.id)
  };

  return (
    <>
      <Title level={4} className="mb-4!">
        Received Quotes ({quotes.length})
      </Title>

      {quotes.length === 0 ? (
        <Card className="rounded-xl text-center py-10">
          <Empty description="No quotes received yet." />
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 2, xxl: 2 }}
          dataSource={quotes}
          renderItem={(quote: any) => (
            <List.Item>
              <Card
                hoverable
                className="rounded-xl shadow-sm border-gray-100 h-full"
                actions={[
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => openModal(quote)}
                  >
                    View Details
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      src={quote.artisan?.avatar_url}
                      icon={<UserOutlined />}
                      size={48}
                    />
                  }
                  title={
                    <div className="flex justify-between items-center">
                      <span>
                        {quote.artisan?.full_name ||
                          quote.artisan?.username ||
                          "Artisan"}
                      </span>
                      <Tag
                        color={getStatusColor(quote.status)}
                        className="rounded-full"
                      >
                        {quote.status}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="mt-2">
                      <Text strong className="text-lg text-blue-600 block">
                        {quote.quoted_price
                          ? `₦${Number(quote.quoted_price).toLocaleString()}`
                          : "Price on request"}
                      </Text>
                      <Text type="secondary" className="text-sm line-clamp-2">
                        {quote.message}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedQuote(null);
          }}
          quote={selectedQuote}
          onActionComplete={onQuoteAction}
        />
      )}
    </>
  );
}
