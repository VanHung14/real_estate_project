/*
  Warnings:

  - You are about to drop the column `user_id` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `buyer_id` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reviews` DROP COLUMN `user_id`,
    ADD COLUMN `buyer_id` INTEGER NOT NULL;
