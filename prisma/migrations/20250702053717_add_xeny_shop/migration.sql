-- CreateTable
CREATE TABLE `XenyShopItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(191) NOT NULL,
    `itemType` ENUM('special_item', 'exclusive_portrait', 'premium_title', 'rare_cosmetic', 'limited_edition', 'event_item') NOT NULL,
    `price` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `stock` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `validFrom` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NULL,
    `minLevel` INTEGER NULL,
    `maxPurchasePerUser` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `XenyPurchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `shopItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `totalPrice` INTEGER NOT NULL,
    `status` ENUM('pending', 'completed', 'cancelled', 'refunded', 'expired') NOT NULL DEFAULT 'pending',
    `appliedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `characterId` INTEGER NOT NULL,

    INDEX `XenyPurchase_characterId_fkey`(`characterId`),
    INDEX `XenyPurchase_shopItemId_fkey`(`shopItemId`),
    INDEX `XenyPurchase_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `XenyPurchase` ADD CONSTRAINT `XenyPurchase_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyPurchase` ADD CONSTRAINT `XenyPurchase_shopItemId_fkey` FOREIGN KEY (`shopItemId`) REFERENCES `XenyShopItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyPurchase` ADD CONSTRAINT `XenyPurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
