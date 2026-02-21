/*
  Warnings:

  - You are about to drop the column `keyVersion` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `keyVersion` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "keyVersion";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "keyVersion";

-- DropEnum
DROP TYPE "MessageRole";
