/*
  Warnings:

  - You are about to drop the column `partyId` on the `AssignedQuest` table. All the data in the column will be lost.
  - The values [party_bonus] on the enum `TokenTransaction_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Party` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartyMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartyQuest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AssignedQuest` DROP FOREIGN KEY `AssignedQuest_partyId_fkey`;

-- DropForeignKey
ALTER TABLE `PartyMember` DROP FOREIGN KEY `PartyMember_partyId_fkey`;

-- DropForeignKey
ALTER TABLE `PartyMember` DROP FOREIGN KEY `PartyMember_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PartyQuest` DROP FOREIGN KEY `PartyQuest_partyId_fkey`;

-- DropForeignKey
ALTER TABLE `PartyQuest` DROP FOREIGN KEY `PartyQuest_questId_fkey`;

-- AlterTable
ALTER TABLE `AssignedQuest` DROP COLUMN `partyId`;

-- AlterTable
ALTER TABLE `TokenTransaction` MODIFY `type` ENUM('quest_completion', 'streak_bonus', 'weekly_bonus', 'monthly_bonus', 'achievement_reward', 'level_up_reward', 'first_quest_bonus', 'perfect_rating_bonus', 'shop_purchase', 'admin_grant', 'admin_deduct', 'event_reward', 'referral_bonus') NOT NULL;

-- DropTable
DROP TABLE `Party`;

-- DropTable
DROP TABLE `PartyMember`;

-- DropTable
DROP TABLE `PartyQuest`;
