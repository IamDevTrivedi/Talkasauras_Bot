-- CreateEnum
CREATE TYPE "WritingStyle" AS ENUM ('DEFAULT', 'FORMAL', 'DESCRIPTIVE', 'CONCISE');

-- CreateEnum
CREATE TYPE "Model" AS ENUM ('DEFAULT');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "telegramIdHash" TEXT NOT NULL,
    "customInstructions" TEXT NOT NULL DEFAULT '',
    "writingStyle" "WritingStyle" NOT NULL DEFAULT 'DEFAULT',
    "model" "Model" NOT NULL DEFAULT 'DEFAULT',
    "temporaryOn" BOOLEAN NOT NULL DEFAULT false,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" BIGINT NOT NULL,
    "lastActive" BIGINT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("telegramIdHash")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "telegramIdHash" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "role" BYTEA NOT NULL,
    "nonce" BYTEA NOT NULL,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
