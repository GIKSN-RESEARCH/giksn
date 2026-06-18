import { getPublishedInsights } from "@/lib/queries/insights";
import { getPublishedPublications } from "@/lib/queries/publications";
import { site } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type FeedItem = {
  title: string;
  description: string;
  link: string;
  pubDate: Date | null;
  guid: string;
};

export async function GET() {
  const [publications, insights] = await Promise.all([
    getPublishedPublications(),
    getPublishedInsights(),
  ]);

  const items: FeedItem[] = [
    ...publications.map((pub) => ({
      title: pub.title,
      description: pub.abstract,
      link: `${site.url}/publications/${pub.slug}`,
      pubDate: pub.publishedAt,
      guid: `${site.url}/publications/${pub.slug}`,
    })),
    ...insights.map((item) => ({
      title: item.title,
      description: item.excerpt,
      link: `${site.url}/insights/${item.slug}`,
      pubDate: item.publishedAt,
      guid: `${site.url}/insights/${item.slug}`,
    })),
  ].sort((a, b) => {
    const aTime = a.pubDate?.getTime() ?? 0;
    const bTime = b.pubDate?.getTime() ?? 0;
    return bTime - aTime;
  });

  const channelItems = items
    .map((item) => {
      const pubDate = item.pubDate
        ? item.pubDate.toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(site.url)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${channelItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}