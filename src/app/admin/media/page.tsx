import { MediaPicker } from "@/components/admin/media-picker";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload assets to Vercel Blob. Use Insert from any content editor, or copy URLs here.
        </p>
      </div>
      <MediaPicker />
    </div>
  );
}