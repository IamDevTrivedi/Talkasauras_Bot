-- AlterTable
ALTER TABLE "User" ALTER COLUMN "customInstructions" DROP NOT NULL,
ALTER COLUMN "customInstructions" DROP DEFAULT;
