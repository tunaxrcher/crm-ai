/*
  Warnings:

  - You are about to drop the column `userId` on the `CheckinCheckout` table. All the data in the column will be lost.
  - Added the required column `characterId` to the `CheckinCheckout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CheckinCheckout` DROP FOREIGN KEY `CheckinCheckout_userId_fkey`;

-- AlterTable
ALTER TABLE `Character` ADD COLUMN `salary` DOUBLE NULL,
    ADD COLUMN `workEndTime` VARCHAR(191) NULL,
    ADD COLUMN `workStartTime` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CheckinCheckout` DROP COLUMN `userId`,
    ADD COLUMN `characterId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `CheckinCheckout_characterId_idx` ON `CheckinCheckout`(`characterId`);

-- AddForeignKey
ALTER TABLE `CheckinCheckout` ADD CONSTRAINT `CheckinCheckout_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
