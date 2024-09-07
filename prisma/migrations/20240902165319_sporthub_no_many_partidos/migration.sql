/*
  Warnings:

  - You are about to drop the `partido_torneos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `partido_torneos` DROP FOREIGN KEY `partido_torneos_partido_id_foreign`;

-- DropForeignKey
ALTER TABLE `partido_torneos` DROP FOREIGN KEY `partido_torneos_torneo_id_foreign`;

-- DropTable
DROP TABLE `partido_torneos`;
