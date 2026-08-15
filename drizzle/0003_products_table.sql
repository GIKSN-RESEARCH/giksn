CREATE TYPE "public"."product_status" AS ENUM('Alpha', 'Beta', 'Stable');--> statement-breakpoint

CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"version" varchar(40),
	"status" "product_status" DEFAULT 'Alpha' NOT NULL,
	"license" text NOT NULL,
	"category" "category" NOT NULL,
	"description" text NOT NULL,
	"highlights" jsonb NOT NULL,
	"install" jsonb,
	"paper_ref" jsonb,
	"links" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX "products_slug_uniq" ON "products" USING btree ("slug");--> statement-breakpoint

CREATE INDEX "products_sort_idx" ON "products" USING btree ("sort_order");--> statement-breakpoint

INSERT INTO "products" (
  "slug",
  "name",
  "tagline",
  "version",
  "status",
  "license",
  "category",
  "description",
  "highlights",
  "install",
  "paper_ref",
  "links",
  "sort_order"
) VALUES (
  'rinne',
  'Rinne',
  'Local, open-source, terminal-first AI orchestration.',
  '0.1.8',
  'Alpha',
  'MIT OR Apache-2.0',
  'AI',
  'A CLI harness that plans work into a JSON DAG, distributes it across the AI coding tools and model APIs already on your machine, then drives it to completion through a generator-evaluator loop. You never open Claude Code, Codex, Grok or OpenCode yourself. You live in Rinne. It reaches down to those tools as workers.',
  '["Conductor planning turns a prompt into a JSON DAG of tasks with roles and evaluators.","Two worker families, one contract: autonomous harness CLIs and raw OpenAI-compatible APIs.","Verifying loop with critique; evaluators can be AI, a tool, or you.","No hosted component, no telemetry, no accounts. Keys stay in the OS keychain.","Pool-aware tiered routing that never dies on a rate-limited worker."]'::jsonb,
  '{"label":"Install (macOS or Linux)","command":"curl -fsSL https://raw.githubusercontent.com/GIKSN-RESEARCH/Rinne/main/install.sh | sh"}'::jsonb,
  '{"category":"AI","slug":"rinne-local-terminal-first-ai-orchestration","label":"Read the paper"}'::jsonb,
  '[{"label":"rinne.giksn.com","href":"https://rinne.giksn.com"},{"label":"GitHub repository","href":"https://github.com/GIKSN-RESEARCH/Rinne"},{"label":"Latest release","href":"https://github.com/GIKSN-RESEARCH/Rinne/releases/latest"},{"label":"Install script","href":"https://raw.githubusercontent.com/GIKSN-RESEARCH/Rinne/main/install.sh"},{"label":"Report an issue","href":"https://github.com/GIKSN-RESEARCH/Rinne/issues"}]'::jsonb,
  0
);
