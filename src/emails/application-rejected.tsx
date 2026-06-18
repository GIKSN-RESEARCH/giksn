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

export function ApplicationRejectedEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Update on your GIKSN contributor application.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{site.name}</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for applying. We are not moving forward with your application
            at this time. The lab accepts only a small number of contributors per
            cohort.
          </Text>
          <Text style={muted}>
            You can still follow public research and join the open Telegram channel.
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