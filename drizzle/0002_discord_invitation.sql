ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "discord_access_token" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "discord_user_id" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "discord_token_redeemed_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_discord_access_token_unique" ON "invitations" ("discord_access_token");