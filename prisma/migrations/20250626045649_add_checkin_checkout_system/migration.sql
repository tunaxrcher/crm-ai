-- CreateTable
CREATE TABLE `WorkLocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `radius` DOUBLE NOT NULL DEFAULT 100,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckinCheckout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `workLocationId` INTEGER NULL,
    `checkinAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `checkinPhotoUrl` VARCHAR(191) NULL,
    `checkinLat` DOUBLE NULL,
    `checkinLng` DOUBLE NULL,
    `checkinType` ENUM('onsite', 'offsite') NOT NULL DEFAULT 'onsite',
    `checkoutAt` DATETIME(3) NULL,
    `checkoutPhotoUrl` VARCHAR(191) NULL,
    `checkoutLat` DOUBLE NULL,
    `checkoutLng` DOUBLE NULL,
    `totalHours` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CheckinCheckout_userId_idx`(`userId`),
    INDEX `CheckinCheckout_workLocationId_idx`(`workLocationId`),
    INDEX `CheckinCheckout_checkinAt_idx`(`checkinAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CheckinCheckout` ADD CONSTRAINT `CheckinCheckout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckinCheckout` ADD CONSTRAINT `CheckinCheckout_workLocationId_fkey` FOREIGN KEY (`workLocationId`) REFERENCES `WorkLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
