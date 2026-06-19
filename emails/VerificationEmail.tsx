// emails/VerificationEmail.tsx
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

interface VerificationEmailProps {
  fullName: string;
  verificationUrl: string;
}

export default function VerificationEmail({
  fullName,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Aykau email address</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>Aykau</Text>
          </Section>

          <Text style={heading}>Welcome, {fullName || "there"}!</Text>

          <Text style={paragraph}>
            Thanks for signing up for Aykau. To get started, please verify your
            email address by clicking the button below.
          </Text>

          <Section style={buttonContainer}>
            <Button href={verificationUrl} style={button}>
              Verify Email Address
            </Button>
          </Section>

          <Text style={paragraph}>
            This helps us ensure the security of your account and lets you
            access all features of the platform.
          </Text>

          <Text style={smallText}>
            If you didn't create an account with Aykau, you can safely ignore
            this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this email because you signed up for an Aykau
            account.
          </Text>

          <Text style={footerSmall}>© 2024 Aykau. All rights reserved.</Text>
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

const logoSection = {
  padding: "32px 48px 0",
};

const logo = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#15196c",
  margin: "0",
  letterSpacing: "-0.02em",
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

const smallText = {
  fontSize: "14px",
  color: "#6c757d",
  padding: "0 48px",
  marginTop: "16px",
  fontStyle: "italic",
};

const buttonContainer = {
  padding: "24px 48px",
};

const button = {
  backgroundColor: "#15196c",
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

const footerSmall = {
  fontSize: "11px",
  color: "#9ca3af",
  padding: "8px 48px 0",
  textAlign: "center" as const,
};
