ALTER TABLE "programs" ADD COLUMN "sectors" jsonb DEFAULT '[]'::jsonb NOT NULL;
