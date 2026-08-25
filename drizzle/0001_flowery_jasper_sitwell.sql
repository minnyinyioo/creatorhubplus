CREATE TABLE `merchant_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentMethod` varchar(40) NOT NULL,
	`providerLabel` varchar(80) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`accountName` varchar(160) NOT NULL,
	`accountIdentifier` varchar(160) NOT NULL,
	`instructions` text NOT NULL,
	`qrUrl` text,
	`qrStorageKey` text,
	`isActive` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchant_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `merchant_recipients_paymentMethod_unique` UNIQUE(`paymentMethod`)
);
--> statement-breakpoint
ALTER TABLE `payment_requests` MODIFY COLUMN `status` enum('pending_review','clarification_requested','verified','rejected') NOT NULL DEFAULT 'pending_review';--> statement-breakpoint
ALTER TABLE `payment_requests` ADD `reviewedByUserId` int;--> statement-breakpoint
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payment_requests_status_created_idx` ON `payment_requests` (`status`,`createdAt`);