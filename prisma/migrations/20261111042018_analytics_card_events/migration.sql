-- AlterTable
ALTER TABLE `pageview` ADD COLUMN `ipHash` VARCHAR(191) NULL,
    ADD COLUMN `pageType` VARCHAR(191) NULL,
    ADD COLUMN `sessionId` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL,
    ADD COLUMN `userName` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CardEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `entityTitle` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NULL,
    `ipHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CardEvent_createdAt_idx`(`createdAt`),
    INDEX `CardEvent_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `CardEvent_eventType_createdAt_idx`(`eventType`, `createdAt`),
    INDEX `CardEvent_visitorId_idx`(`visitorId`),
    INDEX `CardEvent_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PageView_sessionId_idx` ON `PageView`(`sessionId`);
