/*
  Warnings:

  - Added the required column `telegramIdHash` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "telegramIdHash" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_telegramIdHash_fkey" FOREIGN KEY ("telegramIdHash") REFERENCES "User"("telegramIdHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_telegramIdHash_fkey" FOREIGN KEY ("telegramIdHash") REFERENCES "User"("telegramIdHash") ON DELETE RESTRICT ON UPDATE CASCADE;
