/*
  Warnings:

  - The primary key for the `miembro_equipos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `miembro_equipos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `miembro_equipos` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` MODIFY `birthdate` DATE NOT NULL DEFAULT ('2023-12-01');
