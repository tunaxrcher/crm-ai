/*
  Warnings:

  - Made the column `checkinLat` on table `CheckinCheckout` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkinLng` on table `CheckinCheckout` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `CheckinCheckout` DROP FOREIGN KEY `CheckinCheckout_characterId_fkey`;

-- DropIndex
DROP INDEX `CheckinCheckout_checkinAt_idx` ON `CheckinCheckout`;

-- AlterTable
ALTER TABLE `CheckinCheckout` ADD COLUMN `autoCheckoutAt` DATETIME(3) NULL,
    ADD COLUMN `autoCheckoutNote` VARCHAR(191) NULL,
    ADD COLUMN `isAutoCheckout` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `checkinAt` DROP DEFAULT,
    MODIFY `checkinLat` DOUBLE NOT NULL,
    MODIFY `checkinLng` DOUBLE NOT NULL,
    MODIFY `lateLevel` INTEGER NULL DEFAULT 0,
    MODIFY `lateMinutes` INTEGER NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `CheckinCheckout` ADD CONSTRAINT `CheckinCheckout_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `CheckinCheckout` RENAME INDEX `CheckinCheckout_characterId_idx` TO `CheckinCheckout_characterId_fkey`;

-- RenameIndex
ALTER TABLE `CheckinCheckout` RENAME INDEX `CheckinCheckout_workLocationId_idx` TO `CheckinCheckout_workLocationId_fkey`;
