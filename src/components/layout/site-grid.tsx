/** Full-viewport grid — sits above section backgrounds, below content (z-10). */
export function SiteGrid() {
  return (
    <div
      className="grid-overlay pointer-events-none fixed inset-0 z-5 opacity-(--site-grid-opacity)"
      aria-hidden
    />
  );
}