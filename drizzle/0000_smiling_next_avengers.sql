CREATE TYPE "public"."application_status" AS ENUM('pending', 'under_review', 'accepted', 'rejected', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."insight_category" AS ENUM('Tooling & Use Cases', 'Frontier Analysis', 'Cross-Domain Thinking', 'Community Spotlights');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('Active', 'Open for Contributors', 'Completed', 'Exploratory');--> statement-breakpoint
CREATE TYPE "public"."publication_type" AS ENUM('Paper', 'Report', 'Preprint', 'Explainer');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'contributor');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'contributor');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(256) NOT NULL,
	"domains" text[] DEFAULT '{}' NOT NULL,
	"background" text NOT NULL,
	"cv_url" text,
	"links" jsonb DEFAULT '{}'::jsonb,
	"motivation" text NOT NULL,
	"evidence" text NOT NULL,
	"referral" text,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"reviewer_notes" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(256) NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"body_mdx" text NOT NULL,
	"category" "insight_category" NOT NULL,
	"domains" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"cover_image_url" text,
	"substack_url" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"author_id" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insights_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"token" text NOT NULL,
	"telegram_access_token" text NOT NULL,
	"telegram_user_id" text,
	"telegram_token_redeemed_at" timestamp with time zone,
	"role" "role" DEFAULT 'contributor' NOT NULL,
	"application_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "invitations_telegram_access_token_unique" UNIQUE("telegram_access_token")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"mime_type" text,
	"size" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"handle" varchar(64) NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"domains" text[] DEFAULT '{}' NOT NULL,
	"links" jsonb DEFAULT '{}'::jsonb,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"body_mdx" text NOT NULL,
	"status" "project_status" DEFAULT 'Exploratory' NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"domains" text[] DEFAULT '{}' NOT NULL,
	"leads" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"goals" text[] DEFAULT '{}' NOT NULL,
	"outputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"repo" text,
	"contact" text,
	"featured" boolean DEFAULT false NOT NULL,
	"author_id" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" text NOT NULL,
	"abstract" text NOT NULL,
	"body_mdx" text NOT NULL,
	"type" "publication_type" NOT NULL,
	"domains" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"authors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '{}'::jsonb,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"author_id" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publications_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body_mdx" text,
	"category" text NOT NULL,
	"domains" text[] DEFAULT '{}' NOT NULL,
	"url" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'contributor' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_email_idx" ON "applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "insight_status_idx" ON "insights" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_visibility_idx" ON "projects" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "pub_status_idx" ON "publications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "resource_status_idx" ON "resources" USING btree ("status");