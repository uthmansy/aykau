// app/page.tsx
"use client";

import { Button, Typography, Card, Tag, Space, Flex } from "antd";
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#fbf8ff" }}
    >
      <LandingHeader />

      <main style={{ flexGrow: 1 }}>
        {/* 1. Hero Section */}
        <section
          style={{
            paddingTop: "5rem",
            paddingBottom: "8rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{ maxWidth: "896px", margin: "0 auto", textAlign: "center" }}
          >
            <Tag
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: 9999,
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "1px solid #c7c5d3",
                background: "transparent",
                color: "#464651",
                marginBottom: "1.5rem",
              }}
            >
              🚀 The #1 Marketplace for Home Services
            </Tag>

            <Title
              level={1}
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                color: "#1b1b20",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
                letterSpacing: "-0.02em",
              }}
              className="manrope-heading" // global class for Manrope
            >
              Connect with Top-Rated{" "}
              <span style={{ color: "#777682" }}>Artisans in Your Area</span>
            </Title>

            <Paragraph
              style={{
                fontSize: "1.125rem",
                color: "#464651",
                maxWidth: "672px",
                margin: "0 auto 2rem auto",
                lineHeight: 1.5,
              }}
            >
              Get your home projects done right with aykau. Find verified
              professionals, receive transparent quotes, and chat securely—all
              in one place.
            </Paragraph>

            <Space size="middle" wrap style={{ justifyContent: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  height: 48,
                  padding: "0 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: 12,
                }}
              >
                Post a Job for Free
              </Button>

              <Button
                size="large"
                style={{
                  height: 48,
                  padding: "0 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: 12,
                  borderColor: "#15196c",
                  color: "#15196c",
                  background: "transparent",
                }}
              >
                Become an Artisan
              </Button>
            </Space>

            {/* Trust Badges */}
            <Flex
              gap="middle"
              wrap
              justify="center"
              style={{ marginTop: "3rem", color: "#777682" }}
            >
              <Space size="small">
                <CheckCircleOutlined style={{ color: "#10B981" }} />
                <Text style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  Verified Pros
                </Text>
              </Space>
              <Space size="small">
                <StarFilled style={{ color: "#f5b042" }} />
                <Text style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  4.9/5 Average Rating
                </Text>
              </Space>
              <Space size="small">
                <WalletOutlined style={{ color: "#a53b15" }} />
                <Text style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  Transparent Pricing
                </Text>
              </Space>
            </Flex>
          </div>
        </section>

        {/* 2. Features Section */}
        <section style={{ background: "#f5f2fa", padding: "6rem 1.5rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <Title
                level={2}
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "#1b1b20",
                  marginBottom: "1rem",
                }}
                className="manrope-heading"
              >
                Everything you need to get the job done
              </Title>
              <Text style={{ fontSize: "1.125rem", color: "#464651" }}>
                We've simplified the process of hiring and working with
                professionals on aykau.
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card
                style={{
                  border: "none",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  background: "#ffffff",
                }}
                bodyStyle={{ padding: "2rem" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#e0e0ff",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: "1.5rem", color: "#15196c" }}
                  />
                </div>
                <Title
                  level={4}
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#1b1b20",
                    marginBottom: "0.5rem",
                  }}
                >
                  Verified Professionals
                </Title>
                <Text style={{ color: "#464651", lineHeight: 1.5 }}>
                  Every artisan undergoes a strict verification process,
                  including ID checks and skill assessments, so you can hire
                  with confidence.
                </Text>
              </Card>

              <Card
                style={{
                  border: "none",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  background: "#ffffff",
                }}
                bodyStyle={{ padding: "2rem" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#ffdbd0",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <MessageOutlined
                    style={{ fontSize: "1.5rem", color: "#a53b15" }}
                  />
                </div>
                <Title
                  level={4}
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  Real-Time Chat
                </Title>
                <Text style={{ color: "#464651", lineHeight: 1.5 }}>
                  Discuss project details, share photos, and negotiate terms
                  directly through our secure, built-in messaging system.
                </Text>
              </Card>

              <Card
                style={{
                  border: "none",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  background: "#ffffff",
                }}
                bodyStyle={{ padding: "2rem" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#ecfdf5",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <WalletOutlined
                    style={{ fontSize: "1.5rem", color: "#10B981" }}
                  />
                </div>
                <Title
                  level={4}
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  Transparent Quotes
                </Title>
                <Text style={{ color: "#464651", lineHeight: 1.5 }}>
                  Receive detailed, itemized quotes from multiple artisans.
                  Compare prices and reviews to find the perfect fit for your
                  budget.
                </Text>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section style={{ padding: "6rem 1.5rem" }}>
          <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <Title
                level={2}
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "#1b1b20",
                }}
                className="manrope-heading"
              >
                How it works
              </Title>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "3rem" }}
            >
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
              ].map((item) => (
                <Flex
                  key={item.step}
                  gap="middle"
                  align="flex-start"
                  style={{ flexWrap: "wrap" }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 64,
                      height: 64,
                      background: "#15196c",
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ paddingTop: "0.5rem" }}>
                    <Title
                      level={3}
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "#1b1b20",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </Title>
                    <Text
                      style={{
                        fontSize: "1rem",
                        color: "#464651",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </Text>
                  </div>
                </Flex>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CTA Section */}
        <section style={{ background: "#0F172A", padding: "5rem 1.5rem" }}>
          <div
            style={{ maxWidth: "896px", margin: "0 auto", textAlign: "center" }}
          >
            <Title
              level={2}
              style={{
                fontSize: "1.875rem",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "1.5rem",
              }}
              className="manrope-heading"
            >
              Ready to get your project started?
            </Title>
            <Text
              style={{
                fontSize: "1.125rem",
                color: "#c7c5d3",
                display: "block",
                marginBottom: "2rem",
                maxWidth: "672px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Join thousands of homeowners and artisans who trust aykau to get
              the job done right.
            </Text>
            <Button
              type="primary"
              size="large"
              style={{
                height: 48,
                padding: "0 2rem",
                fontSize: "1rem",
                fontWeight: 500,
                borderRadius: 12,
                background: "#a53b15",
                borderColor: "#a53b15",
              }}
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
