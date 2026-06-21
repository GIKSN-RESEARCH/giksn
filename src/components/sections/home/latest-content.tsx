import { LatestContentView } from "@/components/sections/home/latest-content-view";
import {
  getHomepageContent,
  homepageContentFallback,
} from "@/lib/queries/featured";

export async function LatestContent() {
  const dbItems = await getHomepageContent();
  const items = dbItems.length > 0 ? dbItems : homepageContentFallback;
  const usingPreview = dbItems.length === 0;

  return <LatestContentView items={items} usingPreview={usingPreview} />;
}