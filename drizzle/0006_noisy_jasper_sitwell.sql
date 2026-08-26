CREATE TABLE `payment_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paymentRequestId` int,
	`kind` enum('submitted','clarification_requested','verified','rejected') NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_service_catalog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceKey` varchar(40) NOT NULL,
	`serviceLabel` varchar(160) NOT NULL,
	`priceMmk` int,
	`priceLabel` varchar(120) NOT NULL DEFAULT 'Quote required',
	`isActive` int NOT NULL DEFAULT 1,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_service_catalog_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_service_catalog_serviceKey_unique` UNIQUE(`serviceKey`)
);
--> statement-breakpoint
ALTER TABLE `payment_requests` ADD `orderNumber` varchar(32);--> statement-breakpoint
UPDATE `payment_requests` SET `orderNumber` = CONCAT('ORD-', LPAD(`id`, 10, '0')) WHERE `orderNumber` IS NULL;--> statement-breakpoint
ALTER TABLE `payment_requests` MODIFY `orderNumber` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `payment_requests` ADD `quotedAmountMmk` int;--> statement-breakpoint
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_orderNumber_unique` UNIQUE(`orderNumber`);--> statement-breakpoint
ALTER TABLE `payment_notifications` ADD CONSTRAINT `payment_notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_notifications` ADD CONSTRAINT `payment_notifications_paymentRequestId_payment_requests_id_fk` FOREIGN KEY (`paymentRequestId`) REFERENCES `payment_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_service_catalog` ADD CONSTRAINT `payment_service_catalog_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payment_notifications_user_read_created_idx` ON `payment_notifications` (`userId`,`readAt`,`createdAt`);