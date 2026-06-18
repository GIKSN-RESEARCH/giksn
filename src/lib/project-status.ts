export const projectStatusStyles: Record<
  string,
  { label: string; className: string }
> = {
  Active: {
    label: "Active",
    className: "border-cyan-500/40 text-cyan-200",
  },
  "Open for Contributors": {
    label: "Open for Contributors",
    className: "border-orange-500/40 text-orange-200",
  },
  Completed: {
    label: "Completed",
    className: "border-foreground/20 text-muted-foreground",
  },
  Exploratory: {
    label: "Exploratory",
    className: "border-purple-500/40 text-purple-200",
  },
};