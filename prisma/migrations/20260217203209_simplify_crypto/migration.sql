/*
  Warnings:

  - You are about to drop the column `nonce` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `messageNonce` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `telegramId` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `telegramIdHash` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `telegramIdNonce` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `telegramIdEnc` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "nonce";

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "messageNonce",
DROP COLUMN "telegramId",
DROP COLUMN "telegramIdHash",
DROP COLUMN "telegramIdNonce",
ADD COLUMN     "telegramIdEnc" TEXT NOT NULL;
