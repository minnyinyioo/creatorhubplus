CREATE TABLE `payment_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestCode` varchar(32) NOT NULL,
	`paymentMethod` varchar(40) NOT NULL,
	`payerName` varchar(120) NOT NULL,
	`accountHint` varchar(8),
	`amountMmk` int NOT NULL,
	`paymentReference` varchar(100),
	`receiptStorageKey` text NOT NULL,
	`receiptUrl` text NOT NULL,
	`receiptName` varchar(255) NOT NULL,
	`receiptContentType` varchar(80) NOT NULL,
	`status` enum('pending_review','verified','rejected') NOT NULL DEFAULT 'pending_review',
	`reviewNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_requests_requestCode_unique` UNIQUE(`requestCode`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payment_requests_user_created_idx` ON `payment_requests` (`userId`,`createdAt`);