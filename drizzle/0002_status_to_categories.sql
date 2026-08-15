-- Replace lifecycle status enum with content categories:
-- Research | Writings | Products | Programs
-- Maps old values: Product → Products; everything else → Research

ALTER TABLE "papers" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint

CREATE TYPE "public"."status_new" AS ENUM('Research', 'Writings', 'Products', 'Programs');--> statement-breakpoint

ALTER TABLE "papers"
  ALTER COLUMN "status" TYPE "public"."status_new"
  USING (
    CASE "status"::text
      WHEN 'Product' THEN 'Products'
      ELSE 'Research'
    END
  )::"public"."status_new";--> statement-breakpoint

DROP TYPE "public"."status";--> statement-breakpoint

ALTER TYPE "public"."status_new" RENAME TO "status";--> statement-breakpoint

ALTER TABLE "papers" ALTER COLUMN "status" SET DEFAULT 'Research'::"public"."status";
