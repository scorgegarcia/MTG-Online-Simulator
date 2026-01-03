-- AlterTable
ALTER TABLE `deck_cards` ADD COLUMN `custom_card_id` VARCHAR(191) NULL,
    ADD COLUMN `is_custom` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `scryfall_id` VARCHAR(191) NULL;
