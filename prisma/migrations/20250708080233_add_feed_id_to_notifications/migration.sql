-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `feedId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Notification_feedId_fkey` ON `Notification`(`feedId`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_feedId_fkey` FOREIGN KEY (`feedId`) REFERENCES `FeedItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
