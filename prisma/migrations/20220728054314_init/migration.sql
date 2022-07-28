-- AlterTable
ALTER TABLE `address` MODIFY `city` VARCHAR(191) NULL,
    MODIFY `district` VARCHAR(191) NULL,
    MODIFY `ward` VARCHAR(191) NULL,
    MODIFY `street` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `images` MODIFY `image_path` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `messages` MODIFY `message` VARCHAR(500) NULL,
    MODIFY `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `posts` MODIFY `content` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `reviews` MODIFY `review` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `full_name` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL;
