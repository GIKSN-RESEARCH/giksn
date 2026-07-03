CREATE TYPE "public"."category" AS ENUM('AI', 'DT', 'HW', 'DS', 'UP');--> statement-breakpoint
CREATE TYPE "public"."kind" AS ENUM('Original', 'Survey');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Exploration', 'Draft', 'Preprint', 'Published', 'Landmark');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paper_id" uuid NOT NULL,
	"parent_id" uuid,
	"author" text NOT NULL,
	"handle" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "papers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"category" "category" NOT NULL,
	"kind" "kind" DEFAULT 'Original' NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" text NOT NULL,
	"abstract" text NOT NULL,
	"status" "status" DEFAULT 'Exploration' NOT NULL,
	"author" text NOT NULL,
	"author_handle" text NOT NULL,
	"posted" timestamp with time zone DEFAULT now() NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL,
	"reading_minutes" integer DEFAULT 3 NOT NULL,
	"body" jsonb NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admins_email_uniq" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "comments_paper_idx" ON "comments" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "papers_category_slug_uniq" ON "papers" USING btree ("category","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "papers_category_number_uniq" ON "papers" USING btree ("category","number");--> statement-breakpoint
CREATE INDEX "papers_updated_idx" ON "papers" USING btree ("updated");