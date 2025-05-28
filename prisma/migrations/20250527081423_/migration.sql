-- AlterTable
ALTER TABLE `QuestSubmission` ADD COLUMN `videoAnalysis` JSON NULL,
    ADD COLUMN `videoTranscript` TEXT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `avatar` TEXT NULL;
