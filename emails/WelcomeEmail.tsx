// emails/WelcomeEmail.tsx
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

interface WelcomeEmailProps {
  fullName: string;
  role: "customer" | "artisan";
  dashboardUrl: string;
}

export default function WelcomeEmail({
  fullName,
  role,
  dashboardUrl,
}: WelcomeEmailProps) {
  const isArtisan = role === "artisan";

  return (
    <Html>
      <Head />
      <Preview>Welcome to Aykau!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>Aykau</Text>
          </Section>

          <Text style={heading}>Welcome to Aykau, {fullName || "there"}!</Text>

          <Text style={paragraph}>
            {isArtisan
              ? "Your account has been verified and you're ready to start receiving job requests from clients. Complete your profile to showcase your skills and attract more customers."
              : "Your account has been verified and you're ready to find talented artisans for your projects. Browse our marketplace to discover skilled professionals near you."}
          </Text>

          <Section style={card}>
            <Text style={cardTitle}>
              {isArtisan
                ? "🔨 Next Steps for Artisans"
                : "🎯 Next Steps for Customers"}
            </Text>
            {isArtisan ? (
              <>
                <Text style={cardText}>
                  ✓ Complete your professional profile
                </Text>
                <Text style={cardText}>
                  ✓ Upload portfolio images of your work
                </Text>
                <Text style={cardText}>✓ Set your service areas and rates</Text>
                <Text style={cardText}>✓ Start receiving job requests</Text>
              </>
            ) : (
              <>
                <Text style={cardText}>✓ Browse artisans by category</Text>
                <Text style={cardText}>✓ Post your first job request</Text>
                <Text style={cardText}>
                  ✓ Receive quotes from skilled professionals
                </Text>
                <Text style={cardText}>✓ Hire and manage your projects</Text>
              </>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button href={dashboardUrl} style={button}>
              {isArtisan ? "Complete Your Profile" : "Browse Artisans"}
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions, our support team is here to help you get
            started.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this email because you created an Aykau account.
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

const card = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 48px",
  border: "1px solid #e9ecef",
};

const cardTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0 0 12px 0",
};

const cardText = {
  fontSize: "14px",
  color: "#4a4a4a",
  margin: "8px 0",
  lineHeight: "1.5",
};

const buttonContainer = {
  padding: "0 48px",
  marginTop: "24px",
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
