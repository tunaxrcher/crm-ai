-- CreateTable
CREATE TABLE `MonthlyEvaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    `evaluation` TEXT NULL,
    `summary` TEXT NULL,
    `strengths` TEXT NULL,
    `weaknesses` TEXT NULL,
    `improvements` TEXT NULL,
    `isPassed` BOOLEAN NULL,
    `totalSubmissions` INTEGER NOT NULL DEFAULT 0,
    `evaluatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MonthlyEvaluation_characterId_idx`(`characterId`),
    INDEX `MonthlyEvaluation_month_year_idx`(`month`, `year`),
    UNIQUE INDEX `MonthlyEvaluation_characterId_month_year_key`(`characterId`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MonthlyEvaluation` ADD CONSTRAINT `MonthlyEvaluation_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
