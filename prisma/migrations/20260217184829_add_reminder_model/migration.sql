-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "telegramId" TEXT NOT NULL,
    "telegramIdNonce" TEXT NOT NULL,
    "telegramIdHash" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageNonce" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL,
    "remindAt" BIGINT NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);
