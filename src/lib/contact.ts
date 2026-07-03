export type ContactPlatform = "email" | "telegram" | "twitter" | "github";

export const CONTACT_PLATFORMS: {
  code: ContactPlatform;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    code: "twitter",
    label: "Twitter (X)",
    hint: "We'll link to x.com/<handle>.",
    placeholder: "username",
  },
  {
    code: "github",
    label: "GitHub",
    hint: "We'll link to github.com/<handle>.",
    placeholder: "username",
  },
  {
    code: "telegram",
    label: "Telegram",
    hint: "We'll link to t.me/<handle>.",
    placeholder: "username",
  },
  {
    code: "email",
    label: "Email",
    hint: "We'll show a mailto link.",
    placeholder: "you@example.com",
  },
];

export function buildContactUrl(
  platform: ContactPlatform,
  raw: string
): string {
  const value = raw.trim().replace(/^@/, "");
  switch (platform) {
    case "email":
      return `mailto:${value}`;
    case "telegram":
      return `https://t.me/${value}`;
    case "twitter":
      return `https://x.com/${value}`;
    case "github":
      return `https://github.com/${value}`;
  }
}

export type ParsedContact = {
  platform: ContactPlatform | "legacy";
  handle: string;
  url: string | null;
  label: string;
};

export function parseContact(stored: string): ParsedContact {
  const raw = (stored ?? "").trim();
  if (!raw) {
    return { platform: "legacy", handle: "", url: null, label: "" };
  }

  if (/^mailto:/i.test(raw)) {
    const handle = raw.replace(/^mailto:/i, "");
    return { platform: "email", handle, url: raw, label: handle };
  }

  let host = "";
  let path = "";
  try {
    const u = new URL(raw);
    host = u.host.toLowerCase().replace(/^www\./, "");
    path = u.pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return { platform: "legacy", handle: raw, url: null, label: `@${raw}` };
  }

  if (host === "x.com" || host === "twitter.com") {
    return {
      platform: "twitter",
      handle: path,
      url: raw,
      label: `@${path} on X`,
    };
  }
  if (host === "github.com") {
    return {
      platform: "github",
      handle: path,
      url: raw,
      label: `${path} on GitHub`,
    };
  }
  if (host === "t.me" || host === "telegram.me") {
    return {
      platform: "telegram",
      handle: path,
      url: raw,
      label: `@${path} on Telegram`,
    };
  }

  return { platform: "legacy", handle: raw, url: raw, label: raw };
}
