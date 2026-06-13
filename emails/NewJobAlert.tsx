// emails/NewJobAlert.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface NewJobAlertProps {
  fullName: string;
  jobTitle: string;
  budget: string;
  subcategory: string;
  jobUrl: string;
  unsubscribeUrl: string;
}

export default function NewJobAlert({
  fullName,
  jobTitle,
  budget,
  subcategory,
  jobUrl,
  unsubscribeUrl,
}: NewJobAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>New {subcategory} job matching your skills!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Hi {fullName || "there"},</Text>

          <Text style={paragraph}>
            A new job matching your <strong>{subcategory}</strong> skills just
            posted near you. Don't miss this opportunity!
          </Text>

          <Section style={card}>
            <Text style={jobTitleText}>{jobTitle}</Text>
            <Text style={budgetText}>💰 Budget: {budget}</Text>
            <Text style={categoryText}>📋 Category: {subcategory}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button href={jobUrl} style={button}>
              View & Quote Now →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this email because you opted in to job alerts for{" "}
            <strong>{subcategory}</strong>.
          </Text>

          <Text style={unsubscribe}>
            <a href={unsubscribeUrl} style={link}>
              Click here to unsubscribe from job alerts
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Inline styles (required for email clients)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "32px",
  padding: "0 48px",
  color: "#1a1a1a",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#4a4a4a",
  padding: "0 48px",
  marginTop: "16px",
};

const card = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 48px",
  border: "1px solid #e9ecef",
};

const jobTitleText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0 0 12px 0",
};

const budgetText = {
  fontSize: "16px",
  color: "#28a745",
  fontWeight: "600",
  margin: "8px 0",
};

const categoryText = {
  fontSize: "14px",
  color: "#6c757d",
  margin: "8px 0 0 0",
};

const buttonContainer = {
  padding: "0 48px",
  marginTop: "24px",
};

const button = {
  backgroundColor: "#1a1a1a",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
};

const hr = {
  borderColor: "#e9ecef",
  margin: "32px 48px",
};

const footer = {
  fontSize: "12px",
  color: "#6c757d",
  padding: "0 48px",
  lineHeight: "1.5",
};

const unsubscribe = {
  fontSize: "12px",
  color: "#6c757d",
  padding: "8px 48px 0",
};

const link = {
  color: "#007bff",
  textDecoration: "underline",
};
