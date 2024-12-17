/*
  Warnings:

  - The primary key for the `estadisticas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `estadisticas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `estadisticas` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` MODIFY `birthdate` DATE NOT NULL DEFAULT ('2023-12-01');
