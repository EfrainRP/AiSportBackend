-- DropForeignKey
ALTER TABLE `partidos` DROP FOREIGN KEY `partidos_equipolocal_id_foreign`;

-- DropForeignKey
ALTER TABLE `partidos` DROP FOREIGN KEY `partidos_equipovisitante_id_foreign`;

-- AlterTable
ALTER TABLE `partidos` ADD COLUMN `ordenPartido` INTEGER UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `partidos` ADD CONSTRAINT `partidos_equipolocal_id_foreign` FOREIGN KEY (`equipoLocal_id`) REFERENCES `equipos`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `partidos` ADD CONSTRAINT `partidos_equipovisitante_id_foreign` FOREIGN KEY (`equipoVisitante_id`) REFERENCES `equipos`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
