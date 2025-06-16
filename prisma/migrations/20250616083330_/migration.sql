-- CreateTable
CREATE TABLE `RewardItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `category` VARCHAR(191) NOT NULL,
    `itemType` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `tokenCost` INTEGER NOT NULL,
    `gachaCost` INTEGER NOT NULL DEFAULT 50,
    `stock` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `rarity` ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL DEFAULT 'common',
    `gachaProbability` DOUBLE NOT NULL DEFAULT 0.1,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RewardPurchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `rewardItemId` INTEGER NOT NULL,
    `purchaseType` ENUM('direct', 'gacha') NOT NULL,
    `tokenSpent` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('pending', 'claimed', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    `claimedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RewardPurchase_characterId_idx`(`characterId`),
    INDEX `RewardPurchase_rewardItemId_idx`(`rewardItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GachaHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `rewardItemId` INTEGER NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `pullNumber` INTEGER NOT NULL,
    `tokenSpent` INTEGER NOT NULL,
    `isWin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GachaHistory_characterId_idx`(`characterId`),
    INDEX `GachaHistory_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRewardStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `totalGachaPulls` INTEGER NOT NULL DEFAULT 0,
    `totalGachaWins` INTEGER NOT NULL DEFAULT 0,
    `totalTokensSpent` INTEGER NOT NULL DEFAULT 0,
    `lastGachaAt` DATETIME(3) NULL,
    `luckyStreak` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserRewardStats_characterId_key`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RewardPurchase` ADD CONSTRAINT `RewardPurchase_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RewardPurchase` ADD CONSTRAINT `RewardPurchase_rewardItemId_fkey` FOREIGN KEY (`rewardItemId`) REFERENCES `RewardItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GachaHistory` ADD CONSTRAINT `GachaHistory_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GachaHistory` ADD CONSTRAINT `GachaHistory_rewardItemId_fkey` FOREIGN KEY (`rewardItemId`) REFERENCES `RewardItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRewardStats` ADD CONSTRAINT `UserRewardStats_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
