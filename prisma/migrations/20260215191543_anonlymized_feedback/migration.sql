/*
  Warnings:

  - You are about to drop the column `firstName` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `telegramId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Feedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "firstName",
DROP COLUMN "telegramId",
DROP COLUMN "username";
