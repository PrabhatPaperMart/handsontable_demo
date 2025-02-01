-- AlterTable
ALTER TABLE `User` ALTER COLUMN `firstName` DROP DEFAULT,
    ALTER COLUMN `lastName` DROP DEFAULT;

-- CreateTable
CREATE TABLE `verifyOtp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verifyOtp_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
