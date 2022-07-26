/*
  Warnings:

  - You are about to drop the column `post_id` on the `address` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_post_id_fkey`;

-- AlterTable
ALTER TABLE `address` DROP COLUMN `post_id`;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_id_fkey` FOREIGN KEY (`id`) REFERENCES `Posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
