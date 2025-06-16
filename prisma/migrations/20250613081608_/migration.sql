/*
  Warnings:

  - You are about to drop the column `userId` on the `AssignedQuest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `AssignedQuest` DROP FOREIGN KEY `AssignedQuest_userId_fkey`;

-- AlterTable
ALTER TABLE `AssignedQuest` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `Quest` ADD COLUMN `jobClassId` INTEGER NULL;
