/*
  Warnings:

  - You are about to alter the column `score` on the `QuestSubmission` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `QuestSubmission` MODIFY `score` INTEGER NULL;
