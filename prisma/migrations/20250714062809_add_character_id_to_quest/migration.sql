-- AlterTable
ALTER TABLE `Quest` ADD COLUMN `characterId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Quest_characterId_fkey` ON `Quest`(`characterId`);

-- AddForeignKey
ALTER TABLE `Quest` ADD CONSTRAINT `Quest_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
