-- Add missing SEO and navigation fields.
ALTER TABLE `Category`
    ADD COLUMN `showInHeader` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `Article`
    ADD COLUMN `noFollow` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `noIndex` BOOLEAN NOT NULL DEFAULT false;

-- Preserve legacy redirects while moving to the current model.
DROP INDEX `Redirect_source_key` ON `Redirect`;

ALTER TABLE `Redirect`
    CHANGE COLUMN `source` `sourcePath` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `destination` `targetPath` VARCHAR(191) NOT NULL,
    ADD COLUMN `statusCode` INTEGER NOT NULL DEFAULT 301,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

UPDATE `Redirect`
SET
    `statusCode` = CASE WHEN `permanent` = true THEN 301 ELSE 302 END,
    `updatedAt` = `createdAt`;

ALTER TABLE `Redirect`
    DROP COLUMN `permanent`,
    MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

CREATE UNIQUE INDEX `Redirect_sourcePath_key` ON `Redirect`(`sourcePath`);

-- Create the missing content tables.
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDesc` TEXT NULL,
    `noIndex` BOOLEAN NOT NULL DEFAULT false,
    `noFollow` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `showInHeader` BOOLEAN NOT NULL DEFAULT false,
    `showInFooter` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    INDEX `Page_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `City` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `keywords` TEXT NULL,
    `metaTitle` TEXT NULL,
    `metaDesc` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `City_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `keywords` TEXT NULL,
    `metaTitle` TEXT NULL,
    `metaDesc` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CityServiceContent` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `customTitle` TEXT NULL,
    `customDescription` TEXT NULL,
    `metaTitle` TEXT NULL,
    `metaDesc` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CityServiceContent_cityId_serviceId_key`(`cityId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `GlobalServiceTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `titleTemplate` TEXT NOT NULL,
    `descTemplate` TEXT NOT NULL,
    `introTemplates` TEXT NULL,
    `outroTemplates` TEXT NULL,
    `faqTemplates` TEXT NULL,
    `neighborhoodTemplates` TEXT NULL,
    `testimonialTemplates` TEXT NULL,
    `metaTitleTemplate` TEXT NULL,
    `metaDescTemplate` TEXT NULL,
    `imageTemplates` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Car` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `metaTitle` TEXT NULL,
    `metaDesc` TEXT NULL,
    `keywords` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Car_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CarServiceContent` (
    `id` VARCHAR(191) NOT NULL,
    `carId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `customTitle` TEXT NULL,
    `customDescription` TEXT NULL,
    `metaTitle` TEXT NULL,
    `metaDesc` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CarServiceContent_carId_serviceId_key`(`carId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `GlobalCarServiceTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `titleTemplate` TEXT NOT NULL,
    `descTemplate` TEXT NOT NULL,
    `introTemplates` TEXT NULL,
    `outroTemplates` TEXT NULL,
    `faqTemplates` TEXT NULL,
    `neighborhoodTemplates` TEXT NULL,
    `testimonialTemplates` TEXT NULL,
    `metaTitleTemplate` TEXT NULL,
    `metaDescTemplate` TEXT NULL,
    `imageTemplates` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CityServiceContent`
    ADD CONSTRAINT `CityServiceContent_cityId_fkey`
        FOREIGN KEY (`cityId`) REFERENCES `City`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `CityServiceContent_serviceId_fkey`
        FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CarServiceContent`
    ADD CONSTRAINT `CarServiceContent_carId_fkey`
        FOREIGN KEY (`carId`) REFERENCES `Car`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `CarServiceContent_serviceId_fkey`
        FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;
