-- AlterTable
ALTER TABLE `users` ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL,
    MODIFY `birthdate` DATE NOT NULL DEFAULT ('2023-12-01');
