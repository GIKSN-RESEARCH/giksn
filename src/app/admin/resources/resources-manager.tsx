"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createResource,
  deleteResource,
  listResources,
  togglePublishResource,
  updateResource,
  type ResourceFormValues,
} from "@/actions/content";
import { ContentList } from "@/components/admin/content-list";
import { MdxEditor } from "@/components/admin/mdx-editor";
import { SlugFields } from "@/components/admin/slug-fields";
import { parseCommaList } from "@/lib/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Resource } from "@/lib/queries/resources";

const emptyForm = (): ResourceFormValues => ({
  title: "",
  slug: "",
  summary: "",
  bodyMdx: "",
  category: "Tooling",
  url: "",
  domains: [],
  tags: [],
  status: "published",
});

export function ResourcesManager({
  initialResources,
}: {
  initialResources: Resource[];
}) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<ResourceFormValues>(emptyForm());
  const [domainsInput, setDomainsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showMdx, setShowMdx] = useState(false);

  const { data: resources = initialResources } = useQuery({
    queryKey: ["admin", "resources"],
    queryFn: listResources,
    initialData: initialResources,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: ResourceFormValues = {
        ...form,
        domains: parseCommaList(domainsInput),
        tags: parseCommaList(tagsInput),
        bodyMdx: form.bodyMdx?.trim() ? form.bodyMdx : null,
      };
      return editingId
        ? updateResource(editingId, payload)
        : createResource(payload);
    },
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success(editingId ? "Resource updated" : "Resource created");
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
      resetForm();
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      togglePublishResource(id, publish),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast.success("Deleted");
    },
  });

  const listItems = useMemo(
    () =>
      resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        meta: `${resource.category} • ${resource.status} • ${resource.url}`,
        isPublished: resource.status === "published",
      })),
    [resources]
  );

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    setDomainsInput("");
    setTagsInput("");
    setShowMdx(false);
  }

  function startEdit(id: string) {
    const resource = resources.find((r) => r.id === id);
    if (!resource) return;
    setEditingId(resource.id);
    setSlugTouched(true);
    setForm({
      title: resource.title,
      slug: resource.slug,
      summary: resource.summary,
      bodyMdx: resource.bodyMdx ?? "",
      category: resource.category,
      url: resource.url,
      domains: resource.domains,
      tags: resource.tags,
      status: resource.status,
    });
    setDomainsInput((resource.domains ?? []).join(", "));
    setTagsInput((resource.tags ?? []).join(", "));
    setShowMdx(Boolean(resource.bodyMdx));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Resource" : "New Resource"}
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
            <label className="text-sm text-muted-foreground">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as ResourceFormValues["status"],
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

          <div>
            <label className="text-sm text-muted-foreground">External URL</label>
            <Input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://"
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMdx((open) => !open)}
            >
              {showMdx ? "Hide optional MDX explainer" : "Add optional MDX explainer"}
            </Button>
          </div>

          {showMdx ? (
            <MdxEditor
              value={form.bodyMdx ?? ""}
              onChange={(bodyMdx) => setForm((f) => ({ ...f, bodyMdx }))}
            />
          ) : null}

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Create resource"}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">
          Existing resources ({resources.length})
        </h3>
        <ContentList
          items={listItems}
          emptyMessage="No resources yet."
          onEdit={startEdit}
          onTogglePublish={(id, publish) =>
            publishMutation.mutate({ id, publish })
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