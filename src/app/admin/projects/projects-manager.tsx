"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createProject,
  deleteProject,
  listProjects,
  toggleFeatureProject,
  togglePublishProject,
  updateProject,
  type ProjectFormValues,
} from "@/actions/content";
import { ContentList } from "@/components/admin/content-list";
import { MdxEditor } from "@/components/admin/mdx-editor";
import { SlugFields } from "@/components/admin/slug-fields";
import { parseCommaList } from "@/lib/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/queries/projects";

const emptyForm = (): ProjectFormValues => ({
  title: "",
  slug: "",
  description: "",
  bodyMdx: "",
  status: "Exploratory",
  visibility: "public",
  domains: [],
  goals: [],
  repo: null,
  contact: null,
  featured: false,
});

export function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<ProjectFormValues>(emptyForm());
  const [domainsInput, setDomainsInput] = useState("");
  const [goalsInput, setGoalsInput] = useState("");

  const { data: projects = initialProjects } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: listProjects,
    initialData: initialProjects,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: ProjectFormValues = {
        ...form,
        domains: parseCommaList(domainsInput),
        goals: parseCommaList(goalsInput),
      };
      return editingId
        ? updateProject(editingId, payload)
        : createProject(payload);
    },
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success(editingId ? "Project updated" : "Project created");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      resetForm();
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      togglePublishProject(id, publish),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleFeatureProject(id, featured),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("Deleted");
    },
  });

  const listItems = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        title: project.title,
        meta: `${project.status} • ${project.visibility} • /${project.slug}`,
        isPublished: project.visibility === "public",
        isFeatured: project.featured,
      })),
    [projects]
  );

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    setDomainsInput("");
    setGoalsInput("");
  }

  function startEdit(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setEditingId(project.id);
    setSlugTouched(true);
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description,
      bodyMdx: project.bodyMdx,
      status: project.status,
      visibility: project.visibility,
      domains: project.domains,
      goals: project.goals,
      repo: project.repo,
      contact: project.contact,
      featured: project.featured,
    });
    setDomainsInput((project.domains ?? []).join(", "));
    setGoalsInput((project.goals ?? []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Project" : "New Project"}
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
            <label className="text-sm text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as ProjectFormValues["status"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option>Active</option>
                <option>Open for Contributors</option>
                <option>Completed</option>
                <option>Exploratory</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Visibility</label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visibility: e.target.value as ProjectFormValues["visibility"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option value="public">Public</option>
                <option value="contributor">Contributor only</option>
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
              <label className="text-sm text-muted-foreground">Repo URL</label>
              <Input
                value={form.repo ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, repo: e.target.value || null }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Contact</label>
              <Input
                value={form.contact ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value || null }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Goals (comma separated)</label>
            <Input
              value={goalsInput}
              onChange={(e) => setGoalsInput(e.target.value)}
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
                : "Create project"}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">
          Existing projects ({projects.length})
        </h3>
        <ContentList
          items={listItems}
          emptyMessage="No projects yet."
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
          publishLabel={{ on: "Make public", off: "Hide public" }}
        />
      </div>
    </div>
  );
}