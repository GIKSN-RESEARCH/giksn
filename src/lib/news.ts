export type NewsItem = {
  slug: string;
  title: string;
  href?: string | null;
  listed: boolean;
  updated?: string;
};

export function newsHrefIsExternal(href: string): boolean {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return host !== "giksn.com" && host !== "localhost";
  } catch {
    return true;
  }
}
