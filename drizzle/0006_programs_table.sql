CREATE TYPE "public"."program_status" AS ENUM('Open', 'Upcoming', 'Rolling', 'Closed');--> statement-breakpoint

CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"status" "program_status" DEFAULT 'Upcoming' NOT NULL,
	"website" text,
	"category" "category" NOT NULL,
	"description" text NOT NULL,
	"highlights" jsonb NOT NULL,
	"listed" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX "programs_slug_uniq" ON "programs" USING btree ("slug");--> statement-breakpoint

CREATE INDEX "programs_sort_idx" ON "programs" USING btree ("sort_order");
