-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `Comments_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
