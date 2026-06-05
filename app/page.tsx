// app/page.tsx
"use client";

import { Button, Typography, Card, Tag } from "antd";
import {
  CheckCircleOutlined,
  MessageOutlined,
  WalletOutlined,
  ArrowRightOutlined,
  StarFilled,
} from "@ant-design/icons";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      <main className="flex-grow">
        {/* 1. Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center">
            <Tag
              color="default"
              className="!px-3 !py-1 !rounded-full !text-sm !font-medium !border-gray-200 !text-gray-600 mb-6"
            >
              🚀 The #1 Marketplace for Home Services
            </Tag>
            <Title
              level={1}
              className="!text-5xl md:!text-6xl !font-extrabold !text-gray-900 !leading-tight !mb-6 tracking-tight"
            >
              Connect with Top-Rated <br className="hidden md:block" />
              <span className="text-gray-500">Artisans in Your Area</span>
            </Title>
            <Paragraph className="!text-xl !text-gray-500 !max-w-2xl !mx-auto !mb-10 !leading-relaxed">
              Get your home projects done right with aykau. Find verified
              professionals, receive transparent quotes, and chat securely—all
              in one place.
            </Paragraph>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                type="primary"
                size="large"
                className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-xl !h-12 !px-8 !text-base !font-semibold flex items-center gap-2"
              >
                Post a Job for Free <ArrowRightOutlined />
              </Button>
              <Button
                size="large"
                className="!rounded-xl !h-12 !px-8 !text-base !font-semibold !border-gray-200 hover:!border-gray-400 hover:!text-gray-900"
              >
                Become an Artisan
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <Text className="!text-sm !font-medium">Verified Pros</Text>
              </div>
              <div className="flex items-center gap-2">
                <StarFilled className="text-yellow-500" />
                <Text className="!text-sm !font-medium">
                  4.9/5 Average Rating
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <WalletOutlined className="text-gray-600" />
                <Text className="!text-sm !font-medium">
                  Transparent Pricing
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Features Section */}
        <section className="bg-gray-50 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Title
                level={2}
                className="!text-3xl !font-bold !text-gray-900 !mb-4"
              >
                Everything you need to get the job done
              </Title>
              <Text className="!text-lg !text-gray-500">
                We've simplified the process of hiring and working with
                professionals on aykau.
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card
                className="!border-0 !shadow-sm !rounded-2xl hover:shadow-md transition-shadow duration-300"
                styles={{ body: { padding: "32px" } }}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircleOutlined className="text-2xl text-blue-600" />
                </div>
                <Title
                  level={4}
                  className="!text-lg !font-bold !text-gray-900 !mb-3"
                >
                  Verified Professionals
                </Title>
                <Text className="!text-gray-500 !leading-relaxed">
                  Every artisan undergoes a strict verification process,
                  including ID checks and skill assessments, so you can hire
                  with confidence.
                </Text>
              </Card>

              <Card
                className="!border-0 !shadow-sm !rounded-2xl hover:shadow-md transition-shadow duration-300"
                styles={{ body: { padding: "32px" } }}
              >
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                  <MessageOutlined className="text-2xl text-purple-600" />
                </div>
                <Title
                  level={4}
                  className="!text-lg !font-bold !text-gray-900 !mb-3"
                >
                  Real-Time Chat
                </Title>
                <Text className="!text-gray-500 !leading-relaxed">
                  Discuss project details, share photos, and negotiate terms
                  directly through our secure, built-in messaging system.
                </Text>
              </Card>

              <Card
                className="!border-0 !shadow-sm !rounded-2xl hover:shadow-md transition-shadow duration-300"
                styles={{ body: { padding: "32px" } }}
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                  <WalletOutlined className="text-2xl text-green-600" />
                </div>
                <Title
                  level={4}
                  className="!text-lg !font-bold !text-gray-900 !mb-3"
                >
                  Transparent Quotes
                </Title>
                <Text className="!text-gray-500 !leading-relaxed">
                  Receive detailed, itemized quotes from multiple artisans.
                  Compare prices and reviews to find the perfect fit for your
                  budget.
                </Text>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Title
                level={2}
                className="!text-3xl !font-bold !text-gray-900 !mb-4"
              >
                How it works
              </Title>
            </div>

            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Post your job",
                  desc: "Describe what you need, set your budget, and add photos. It takes less than 2 minutes.",
                },
                {
                  step: "02",
                  title: "Receive quotes",
                  desc: "Verified artisans in your area will review your job and send you competitive, detailed quotes.",
                },
                {
                  step: "03",
                  title: "Hire and chat",
                  desc: "Compare quotes, message your favorite artisan to clarify details, and hire them with one click.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-start gap-6 md:gap-10"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <Title
                      level={3}
                      className="!text-xl !font-bold !text-gray-900 !mb-2"
                    >
                      {item.title}
                    </Title>
                    <Text className="!text-lg !text-gray-500 !leading-relaxed">
                      {item.desc}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CTA Section */}
        <section className="bg-gray-900 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Title
              level={2}
              className="!text-3xl md:!text-4xl !font-bold !text-white !mb-6"
            >
              Ready to get your project started?
            </Title>
            <Text className="!text-lg !text-gray-400 !block !mb-10 !max-w-2xl !mx-auto">
              Join thousands of homeowners and artisans who trust aykau to get
              the job done right.
            </Text>
            <Button
              type="primary"
              size="large"
              className="!bg-white !text-gray-900 hover:!bg-gray-100 !border-0 !rounded-xl !h-12 !px-8 !text-base !font-semibold"
            >
              Create a Free Account
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
