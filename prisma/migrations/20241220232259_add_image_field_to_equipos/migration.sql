-- AlterTable
ALTER TABLE `equipos` ADD COLUMN `image` VARCHAR(255) NOT NULL DEFAULT 'userprofile.webp';

-- AlterTable
ALTER TABLE `users` MODIFY `birthdate` DATE NOT NULL DEFAULT ('2023-12-01');
