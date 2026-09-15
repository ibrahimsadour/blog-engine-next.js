-- CreateTable
CREATE TABLE `LoginRateLimit` (
    `key` VARCHAR(191) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `windowStartedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `blockedUntil` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LoginRateLimit_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
