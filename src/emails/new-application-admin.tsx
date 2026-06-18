import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

import { site } from "@/lib/site";

export function NewApplicationAdminEmail({
  applicantName,
  applicantEmail,
  domains,
  adminUrl,
}: {
  applicantName: string;
  applicantEmail: string;
  domains: string[];
  adminUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>New contributor application from {applicantName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>New application</Heading>
          <Text style={text}>
            <strong>{applicantName}</strong> ({applicantEmail}) applied to
            contribute.
          </Text>
          <Text style={text}>
            Domains: {domains.length > 0 ? domains.join(", ") : "—"}
          </Text>
          <Link href={adminUrl} style={link}>
            Review in admin →
          </Link>
          <Text style={muted}>{site.name}</Text>
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
  margin: "0 0 16px",
};

const text = {
  color: "#d4d4d4",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const link = {
  color: "#fafafa",
  fontSize: "15px",
  textDecoration: "underline",
};

const muted = {
  color: "#737373",
  fontSize: "12px",
  margin: "24px 0 0",
};