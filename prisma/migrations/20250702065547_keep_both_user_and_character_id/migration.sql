/*
  Warnings:

  - Made the column `characterId` on table `TokenTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `characterId` on table `XenyTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `TokenTransaction` DROP FOREIGN KEY `TokenTransaction_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `TokenTransaction` DROP FOREIGN KEY `TokenTransaction_userId_userToken_fkey`;

-- DropForeignKey
ALTER TABLE `TokenTransaction` DROP FOREIGN KEY `TokenTransaction_userId_user_fkey`;

-- DropForeignKey
ALTER TABLE `XenyTransaction` DROP FOREIGN KEY `XenyTransaction_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `XenyTransaction` DROP FOREIGN KEY `XenyTransaction_userId_userXeny_fkey`;

-- DropForeignKey
ALTER TABLE `XenyTransaction` DROP FOREIGN KEY `XenyTransaction_userId_user_fkey`;

-- AlterTable
ALTER TABLE `TokenTransaction` MODIFY `characterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `XenyTransaction` MODIFY `characterId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `TokenTransaction` ADD CONSTRAINT `TokenTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TokenTransaction` ADD CONSTRAINT `TokenTransaction_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyTransaction` ADD CONSTRAINT `XenyTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyTransaction` ADD CONSTRAINT `XenyTransaction_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `TokenTransaction` RENAME INDEX `TokenTransaction_userId_userToken_fkey` TO `TokenTransaction_userId_fkey`;

-- RenameIndex
ALTER TABLE `XenyTransaction` RENAME INDEX `XenyTransaction_userId_userXeny_fkey` TO `XenyTransaction_userId_fkey`;
