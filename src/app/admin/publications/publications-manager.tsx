"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createPublication,
  deletePublication,
  listPublications,
  toggleFeaturePublication,
  togglePublishPublication,
  updatePublication,
  type PublicationFormValues,
} from "@/actions/content";
import { ContentList } from "@/components/admin/content-list";
import { MdxEditor } from "@/components/admin/mdx-editor";
import { SlugFields } from "@/components/admin/slug-fields";
import { parseCommaList } from "@/lib/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Publication } from "@/lib/queries/publications";

const emptyForm = (): PublicationFormValues => ({
  title: "",
  slug: "",
  abstract: "",
  bodyMdx: "",
  type: "Paper",
  status: "draft",
  domains: [],
  tags: [],
  authors: [],
  links: {},
  featured: false,
  publishedAt: null,
});

export function PublicationsManager({
  initialPublications,
}: {
  initialPublications: Publication[];
}) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<PublicationFormValues>(emptyForm());
  const [domainsInput, setDomainsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const { data: publications = initialPublications } = useQuery({
    queryKey: ["admin", "publications"],
    queryFn: listPublications,
    initialData: initialPublications,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: PublicationFormValues = {
        ...form,
        domains: parseCommaList(domainsInput),
        tags: parseCommaList(tagsInput),
      };
      return editingId
        ? updatePublication(editingId, payload)
        : createPublication(payload);
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editingId ? "Publication updated" : "Publication created");
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
      resetForm();
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      togglePublishPublication(id, publish),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleFeaturePublication(id, featured),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
      toast.success("Deleted");
    },
  });

  const listItems = useMemo(
    () =>
      publications.map((pub) => ({
        id: pub.id,
        title: pub.title,
        meta: `${pub.type} • ${pub.status} • /${pub.slug}`,
        isPublished: pub.status === "published",
        isFeatured: pub.featured,
      })),
    [publications]
  );

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    setDomainsInput("");
    setTagsInput("");
  }

  function startEdit(id: string) {
    const pub = publications.find((p) => p.id === id);
    if (!pub) return;
    setEditingId(pub.id);
    setSlugTouched(true);
    setForm({
      title: pub.title,
      slug: pub.slug,
      abstract: pub.abstract,
      bodyMdx: pub.bodyMdx,
      type: pub.type,
      status: pub.status,
      domains: pub.domains,
      tags: pub.tags,
      authors: pub.authors ?? [],
      links: (pub.links as Record<string, string>) ?? {},
      featured: pub.featured,
      publishedAt: pub.publishedAt?.toISOString() ?? null,
    });
    setDomainsInput((pub.domains ?? []).join(", "));
    setTagsInput((pub.tags ?? []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Publication" : "New Publication"}
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
            <label className="text-sm text-muted-foreground">Abstract</label>
            <textarea
              value={form.abstract}
              onChange={(e) =>
                setForm((f) => ({ ...f, abstract: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as PublicationFormValues["type"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option>Paper</option>
                <option>Report</option>
                <option>Preprint</option>
                <option>Explainer</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as PublicationFormValues["status"],
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
                placeholder="AGI, Hardware"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="alignment, scaling"
              className="mt-1"
            />
          </div>

          <MdxEditor
            value={form.bodyMdx}
            onChange={(bodyMdx) => setForm((f) => ({ ...f, bodyMdx }))}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Create publication"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">
          Existing publications ({publications.length})
        </h3>
        <ContentList
          items={listItems}
          emptyMessage="No publications yet. Create one above."
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