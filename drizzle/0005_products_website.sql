ALTER TABLE "products" ADD COLUMN "website" text;--> statement-breakpoint
UPDATE "products" SET "website" = 'https://rinne.giksn.com' WHERE "slug" = 'rinne';
