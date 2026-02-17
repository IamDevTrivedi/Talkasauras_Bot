-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "feedback" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
