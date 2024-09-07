-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `fsurname` VARCHAR(50) NOT NULL,
    `msurname` VARCHAR(50) NOT NULL,
    `nickname` VARCHAR(50) NULL,
    `email` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(255) NOT NULL DEFAULT 'N/E',
    `password` VARCHAR(255) NOT NULL,
    `birthdate` DATE NOT NULL DEFAULT ('2023-12-01'),
    `image` VARCHAR(255) NOT NULL DEFAULT 'userprofile.webp',
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `users_nickname_unique`(`nickname`),
    UNIQUE INDEX `users_email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `equipos_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partidos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `horaPartido` TIME(0) NOT NULL,
    `fechaPartido` DATE NOT NULL,
    `jornada` DATE NOT NULL,
    `resLocal` INTEGER UNSIGNED NULL,
    `resVisitante` INTEGER UNSIGNED NULL,
    `equipoLocal_id` BIGINT UNSIGNED NOT NULL,
    `equipoVisitante_id` BIGINT UNSIGNED NOT NULL,
    `torneo_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `partidos_equipolocal_id_foreign`(`equipoLocal_id`),
    INDEX `partidos_equipovisitante_id_foreign`(`equipoVisitante_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torneos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `ubicacion` VARCHAR(255) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `fechaInicio` DATE NOT NULL,
    `fechaFin` DATE NOT NULL,
    `cantEquipo` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `torneos_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estadisticas` (
    `torneo_id` BIGINT UNSIGNED NOT NULL,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `PT` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `CA` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `DC` INTEGER NOT NULL DEFAULT 0,
    `CC` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `estadisticas_equipo_id_foreign`(`equipo_id`),
    INDEX `estadisticas_torneo_id_foreign`(`torneo_id`),
    PRIMARY KEY (`torneo_id`, `equipo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `miembro_equipos` (
    `user_miembro` VARCHAR(255) NOT NULL,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `miembro_equipos_equipo_id_foreign`(`equipo_id`),
    PRIMARY KEY (`user_miembro`, `equipo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `equipo_id` BIGINT UNSIGNED NULL,
    `torneo_id` BIGINT UNSIGNED NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `user_id2` BIGINT UNSIGNED NULL,
    `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `notifications_equipo_id_foreign`(`equipo_id`),
    INDEX `notifications_torneo_id_foreign`(`torneo_id`),
    INDEX `notifications_user_id2_foreign`(`user_id2`),
    INDEX `notifications_user_id_foreign`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partido_torneos` (
    `torneo_id` BIGINT UNSIGNED NOT NULL,
    `partido_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `partido_torneos_partido_id_foreign`(`partido_id`),
    INDEX `partido_torneos_torneo_id_foreign`(`torneo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `password_reset_tokens_email_index`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` TIMESTAMP(0) NULL,
    `expires_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `personal_access_tokens_token_unique`(`token`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type`, `tokenable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- AddForeignKey
ALTER TABLE `partido_torneos` ADD CONSTRAINT `partido_torneos_partido_id_foreign` FOREIGN KEY (`partido_id`) REFERENCES `partidos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `partido_torneos` ADD CONSTRAINT `partido_torneos_torneo_id_foreign` FOREIGN KEY (`torneo_id`) REFERENCES `torneos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
