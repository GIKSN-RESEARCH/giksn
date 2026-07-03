ALTER TYPE "public"."status" ADD VALUE 'Product';--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;