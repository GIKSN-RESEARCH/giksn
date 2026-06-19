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

export function ApplicationReceivedEmail({
  name,
}: {
  name: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>We received your GIKSN Research contributor application.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{site.name}</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thanks for applying to contribute. We review applications manually and
            respond via email. Only a small number of contributors are onboarded at
            a time.
          </Text>
          <Text style={muted}>
            If accepted, you will receive a platform invitation and Discord connect
            instructions in a follow-up email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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