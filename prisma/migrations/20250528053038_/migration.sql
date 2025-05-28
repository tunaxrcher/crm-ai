/*
  Warnings:

  - You are about to drop the column `videoAnalysis` on the `QuestSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `videoTranscript` on the `QuestSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `QuestSubmission` DROP COLUMN `videoAnalysis`,
    DROP COLUMN `videoTranscript`,
    ADD COLUMN `feedback` TEXT NULL,
    ADD COLUMN `mediaAnalysis` TEXT NULL,
    ADD COLUMN `mediaRevisedTranscript` TEXT NULL,
    ADD COLUMN `mediaTranscript` TEXT NULL,
    ADD COLUMN `score` VARCHAR(191) NULL;
