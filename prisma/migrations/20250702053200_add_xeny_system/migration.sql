-- CreateTable
CREATE TABLE `UserXeny` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currentXeny` INTEGER NOT NULL DEFAULT 0,
    `totalEarnedXeny` INTEGER NOT NULL DEFAULT 0,
    `totalSpentXeny` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserXeny_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `XenyTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `type` ENUM('gacha_reward', 'shop_purchase', 'admin_grant', 'admin_deduct', 'event_reward', 'referral_bonus', 'exchange_from_token', 'exchange_to_token') NOT NULL,
    `description` VARCHAR(191) NULL,
    `referenceId` INTEGER NULL,
    `referenceType` VARCHAR(191) NULL,
    `balanceBefore` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `XenyTransaction_userId_userXeny_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserXeny` ADD CONSTRAINT `UserXeny_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyTransaction` ADD CONSTRAINT `XenyTransaction_userId_userXeny_fkey` FOREIGN KEY (`userId`) REFERENCES `UserXeny`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyTransaction` ADD CONSTRAINT `XenyTransaction_userId_user_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
