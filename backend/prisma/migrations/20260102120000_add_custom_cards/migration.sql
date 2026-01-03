-- CreateTable
CREATE TABLE `custom_cards` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `source` ENUM('EDITOR', 'URLS') NOT NULL DEFAULT 'EDITOR',
    `name` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `front_image_url` VARCHAR(512) NULL,
    `back_image_url` VARCHAR(512) NULL,
    `art_url` VARCHAR(512) NULL,
    `mana_cost_generic` INTEGER NOT NULL DEFAULT 0,
    `mana_cost_symbols` JSON NULL,
    `type_line` VARCHAR(191) NULL,
    `rules_text` TEXT NULL,
    `power` VARCHAR(191) NULL,
    `toughness` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `custom_cards_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `custom_cards` ADD CONSTRAINT `custom_cards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

