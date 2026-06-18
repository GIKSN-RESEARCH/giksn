"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createInsight,
  deleteInsight,
  listInsights,
  toggleFeatureInsight,
  togglePublishInsight,
  updateInsight,
  type InsightFormValues,
} from "@/actions/content";
import { ContentList } from "@/components/admin/content-list";
import { MdxEditor } from "@/components/admin/mdx-editor";
import { SlugFields } from "@/components/admin/slug-fields";
import { insightCategories } from "@/lib/content";
import { parseCommaList } from "@/lib/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Insight } from "@/lib/queries/insights";

const emptyForm = (): InsightFormValues => ({
  title: "",
  slug: "",
  excerpt: "",
  bodyMdx: "",
  category: "Frontier Analysis",
  domains: [],
  tags: [],
  coverImageUrl: null,
  substackUrl: null,
  status: "draft",
  featured: false,
  publishedAt: null,
});

export function InsightsManager({ initialInsights }: { initialInsights: Insight[] }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<InsightFormValues>(emptyForm());
  const [domainsInput, setDomainsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const { data: insights = initialInsights } = useQuery({
    queryKey: ["admin", "insights"],
    queryFn: listInsights,
    initialData: initialInsights,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: InsightFormValues = {
        ...form,
        domains: parseCommaList(domainsInput),
        tags: parseCommaList(tagsInput),
      };
      return editingId
        ? updateInsight(editingId, payload)
        : createInsight(payload);
    },
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success(editingId ? "Insight updated" : "Insight created");
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      resetForm();
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      togglePublishInsight(id, publish),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleFeatureInsight(id, featured),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInsight,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      toast.success("Deleted");
    },
  });

  const listItems = useMemo(
    () =>
      insights.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.category} • ${item.status} • /${item.slug}`,
        isPublished: item.status === "published",
        isFeatured: item.featured,
      })),
    [insights]
  );

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    setDomainsInput("");
    setTagsInput("");
  }

  function startEdit(id: string) {
    const item = insights.find((i) => i.id === id);
    if (!item) return;
    setEditingId(item.id);
    setSlugTouched(true);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      bodyMdx: item.bodyMdx,
      category: item.category,
      domains: item.domains,
      tags: item.tags,
      coverImageUrl: item.coverImageUrl,
      substackUrl: item.substackUrl,
      status: item.status,
      featured: item.featured,
      publishedAt: item.publishedAt?.toISOString() ?? null,
    });
    setDomainsInput((item.domains ?? []).join(", "));
    setTagsInput((item.tags ?? []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Insight" : "New Insight"}
          </h2>
          {editingId ? (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              + New instead
            </Button>
          ) : null}
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <SlugFields
            title={form.title}
            slug={form.slug}
            slugTouched={slugTouched}
            onTitleChange={(title) => setForm((f) => ({ ...f, title }))}
            onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))}
            onSlugTouched={setSlugTouched}
          />

          <div>
            <label className="text-sm text-muted-foreground">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as InsightFormValues["category"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                {insightCategories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as InsightFormValues["status"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Domains</label>
              <Input
                value={domainsInput}
                onChange={(e) => setDomainsInput(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-muted-foreground">Cover image URL</label>
              <Input
                value={form.coverImageUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coverImageUrl: e.target.value || null }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Substack URL</label>
              <Input
                value={form.substackUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, substackUrl: e.target.value || null }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-1"
            />
          </div>

          <MdxEditor
            value={form.bodyMdx}
            onChange={(bodyMdx) => setForm((f) => ({ ...f, bodyMdx }))}
          />

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Create insight"}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">
          Existing insights ({insights.length})
        </h3>
        <ContentList
          items={listItems}
          emptyMessage="No insights yet."
          onEdit={startEdit}
          onTogglePublish={(id, publish) =>
            publishMutation.mutate({ id, publish })
          }
          onToggleFeature={(id, featured) =>
            featureMutation.mutate({ id, featured })
          }
          onDelete={(id, title) => {
            if (!confirm(`Delete "${title}"?`)) return;
            deleteMutation.mutate(id);
          }}
        />
      </div>
    </div>
  );
}