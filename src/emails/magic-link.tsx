import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

import { site } from "@/lib/site";

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to GIKSN Research</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{site.name}</Heading>
          <Text style={text}>Use the button below to sign in. This link expires soon.</Text>
          <Button href={url} style={button}>
            Sign in
          </Button>
          <Text style={muted}>If you did not request this, you can ignore this email.</Text>
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

const button = {
  backgroundColor: "#fafafa",
  color: "#0a0a0a",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600" as const,
  padding: "12px 20px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 20px",
};

const muted = {
  color: "#737373",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "24px 0 0",
};