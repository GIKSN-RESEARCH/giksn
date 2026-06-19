import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

import { site } from "@/lib/site";

export function ApplicationWaitlistedEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your GIKSN application is on the waitlist.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{site.name}</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Your application is on our waitlist. We may reach out if capacity opens
            in a future cohort. No action is needed right now.
          </Text>
          <Text style={muted}>
            Public publications, insights, and the open Discord server remain available.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "520px",
};

const heading = {
  color: "#fafafa",
  fontSize: "20px",
  fontWeight: "600" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#d4d4d4",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const muted = {
  color: "#737373",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "24px 0 0",
};