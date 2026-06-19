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
  discordToken,
  discordUrl,
  guildName,
  expiresAt,
}: {
  name: string;
  inviteUrl: string;
  discordToken: string;
  discordUrl?: string;
  guildName: string;
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
            After signing in, connect Discord on the onboarding screen to join{" "}
            {guildName}
            {discordUrl ? " and unlock private channels" : ""}. One-click OAuth is
            preferred; you can also run <code>/redeem</code> in Discord with your access
            token.
          </Text>
          <Text style={mono}>Discord token: {discordToken}</Text>
          {discordUrl ? (
            <Button href={discordUrl} style={buttonOutline}>
              Join public Discord
            </Button>
          ) : null}
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

const buttonOutline = {
  backgroundColor: "transparent",
  color: "#22d3ee",
  border: "1px solid #22d3ee",
  borderRadius: "8px",
  fontSize: "14px",
  padding: "10px 16px",
  textDecoration: "none",
  display: "inline-block",
  margin: "0 0 16px",
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
  margin: "12px 0 0",
};