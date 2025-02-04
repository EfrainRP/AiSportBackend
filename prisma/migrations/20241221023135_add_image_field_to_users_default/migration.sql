-- AlterTable
ALTER TABLE `users` MODIFY `birthdate` DATE NOT NULL DEFAULT ('2023-12-01'),
    MODIFY `image` VARCHAR(255) NOT NULL DEFAULT 'logoPerfil.jpg';
