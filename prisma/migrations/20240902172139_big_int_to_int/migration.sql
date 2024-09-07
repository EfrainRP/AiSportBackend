/*
  Warnings:

  - The primary key for the `equipos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `equipos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `equipos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `estadisticas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `torneo_id` on the `estadisticas` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `equipo_id` on the `estadisticas` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `miembro_equipos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `equipo_id` on the `miembro_equipos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `equipo_id` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `torneo_id` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id2` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `partidos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `partidos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `equipoLocal_id` on the `partidos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `equipoVisitante_id` on the `partidos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `torneo_id` on the `partidos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `personal_access_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `personal_access_tokens` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `tokenable_id` on the `personal_access_tokens` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `torneos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `torneos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `torneos` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.

*/
-- DropForeignKey
ALTER TABLE `equipos` DROP FOREIGN KEY `equipos_user_id_foreign`;

-- DropForeignKey
ALTER TABLE `estadisticas` DROP FOREIGN KEY `estadisticas_equipo_id_foreign`;

-- DropForeignKey
ALTER TABLE `estadisticas` DROP FOREIGN KEY `estadisticas_torneo_id_foreign`;

-- DropForeignKey
ALTER TABLE `miembro_equipos` DROP FOREIGN KEY `miembro_equipos_equipo_id_foreign`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_equipo_id_foreign`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_torneo_id_foreign`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_user_id_foreign`;

-- DropForeignKey
ALTER TABLE `partidos` DROP FOREIGN KEY `partidos_equipolocal_id_foreign`;

-- DropForeignKey
ALTER TABLE `partidos` DROP FOREIGN KEY `partidos_equipovisitante_id_foreign`;

-- DropForeignKey
ALTER TABLE `partidos` DROP FOREIGN KEY `partidos_torneo_id_foreign`;

-- DropForeignKey
ALTER TABLE `torneos` DROP FOREIGN KEY `torneos_user_id_foreign`;

-- AlterTable
ALTER TABLE `equipos` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `estadisticas` DROP PRIMARY KEY,
    MODIFY `torneo_id` INTEGER UNSIGNED NOT NULL,
    MODIFY `equipo_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`torneo_id`, `equipo_id`);

-- AlterTable
ALTER TABLE `miembro_equipos` DROP PRIMARY KEY,
    MODIFY `equipo_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`user_miembro`, `equipo_id`);

-- AlterTable
ALTER TABLE `notifications` MODIFY `equipo_id` INTEGER UNSIGNED NULL,
    MODIFY `torneo_id` INTEGER UNSIGNED NULL,
    MODIFY `user_id` INTEGER UNSIGNED NOT NULL,
    MODIFY `user_id2` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `partidos` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `equipoLocal_id` INTEGER UNSIGNED NOT NULL,
    MODIFY `equipoVisitante_id` INTEGER UNSIGNED NOT NULL,
    MODIFY `torneo_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `personal_access_tokens` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `tokenable_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `torneos` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `equipos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `partidos` ADD CONSTRAINT `partidos_equipolocal_id_foreign` FOREIGN KEY (`equipoLocal_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `partidos` ADD CONSTRAINT `partidos_equipovisitante_id_foreign` FOREIGN KEY (`equipoVisitante_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `partidos` ADD CONSTRAINT `partidos_torneo_id_foreign` FOREIGN KEY (`torneo_id`) REFERENCES `torneos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `torneos` ADD CONSTRAINT `torneos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `estadisticas` ADD CONSTRAINT `estadisticas_equipo_id_foreign` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `estadisticas` ADD CONSTRAINT `estadisticas_torneo_id_foreign` FOREIGN KEY (`torneo_id`) REFERENCES `torneos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `miembro_equipos` ADD CONSTRAINT `miembro_equipos_equipo_id_foreign` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_equipo_id_foreign` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_torneo_id_foreign` FOREIGN KEY (`torneo_id`) REFERENCES `torneos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
