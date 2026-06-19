// emails/ResetPasswordEmail.tsx
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

interface ResetPasswordEmailProps {
  fullName: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  fullName,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Aykau password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>Aykau</Text>
          </Section>

          <Text style={heading}>Hi {fullName || "there"},</Text>

          <Text style={paragraph}>
            We received a request to reset your password. Click the button below
            to create a new password.
          </Text>

          <Section style={buttonContainer}>
            <Button href={resetUrl} style={button}>
              Reset Password
            </Button>
          </Section>

          <Text style={paragraph}>
            If you didn't request a password reset, you can safely ignore this
            email. Your password will remain unchanged.
          </Text>

          <Text style={smallText}>
            This link will expire in 1 hour for security reasons.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this email because you requested a password reset
            for your Aykau account.
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
