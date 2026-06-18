CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("abstract", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("body_mdx", '')), 'C')
) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pub_search_vector_idx" ON "publications" USING GIN ("search_vector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pub_title_trgm_idx" ON "publications" USING GIN ("title" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("excerpt", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("body_mdx", '')), 'C')
) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_search_vector_idx" ON "insights" USING GIN ("search_vector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_title_trgm_idx" ON "insights" USING GIN ("title" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("body_mdx", '')), 'C')
) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_search_vector_idx" ON "projects" USING GIN ("search_vector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_title_trgm_idx" ON "projects" USING GIN ("title" gin_trgm_ops);