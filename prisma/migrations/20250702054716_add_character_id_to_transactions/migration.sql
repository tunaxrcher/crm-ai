-- AlterTable
ALTER TABLE `TokenTransaction` ADD COLUMN `characterId` INTEGER NULL;

-- AlterTable
ALTER TABLE `XenyTransaction` ADD COLUMN `characterId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `TokenTransaction_characterId_fkey` ON `TokenTransaction`(`characterId`);

-- CreateIndex
CREATE INDEX `XenyTransaction_characterId_fkey` ON `XenyTransaction`(`characterId`);

-- AddForeignKey
ALTER TABLE `TokenTransaction` ADD CONSTRAINT `TokenTransaction_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `XenyTransaction` ADD CONSTRAINT `XenyTransaction_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
