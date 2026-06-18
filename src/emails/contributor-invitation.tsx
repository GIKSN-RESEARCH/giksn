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

export function ContributorInvitationEmail({
  name,
  inviteUrl,
  telegramToken,
  botUsername,
  expiresAt,
}: {
  name: string;
  inviteUrl: string;
  telegramToken: string;
  botUsername?: string;
  expiresAt: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your GIKSN contributor invitation is ready.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{site.name}</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Your contributor application was accepted. Redeem your platform invitation
            using the same email address you applied with.
          </Text>
          <Button href={inviteUrl} style={button}>
            Redeem invitation
          </Button>
          <Text style={text}>
            After signing in, you will see your Telegram access token once on the
            onboarding screen. Send it to{" "}
            {botUsername ? `@${botUsername}` : "the lab Telegram bot"} to join private
            channels — not shareable invite links.
          </Text>
          <Text style={mono}>Telegram token: {telegramToken}</Text>
          <Text style={muted}>Invitation expires {expiresAt}.</Text>
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

const mono = {
  color: "#22d3ee",
  fontFamily: "monospace",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 16px",
  wordBreak: "break-all" as const,
};

const muted = {
  color: "#737373",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "24px 0 0",
};