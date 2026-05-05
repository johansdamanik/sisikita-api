-- AlterTable: make email and password nullable, add OAuth fields
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AddColumn
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "providerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_provider_providerId_key" ON "users"("provider", "providerId");
