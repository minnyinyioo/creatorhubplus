CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentRequestId` int NOT NULL,
	`userId` int NOT NULL,
	`invoiceNumber` varchar(40) NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`serviceLabel` varchar(160) NOT NULL,
	`customerName` varchar(120) NOT NULL,
	`customerEmail` varchar(320),
	`paymentMethod` varchar(40) NOT NULL,
	`amountMmk` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'MMK',
	`status` enum('issued','voided') NOT NULL DEFAULT 'issued',
	`pdfStorageKey` text NOT NULL,
	`pdfUrl` text NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_paymentRequestId_unique` UNIQUE(`paymentRequestId`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_paymentRequestId_payment_requests_id_fk` FOREIGN KEY (`paymentRequestId`) REFERENCES `payment_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `invoices_user_issued_idx` ON `invoices` (`userId`,`issuedAt`);--> statement-breakpoint
CREATE INDEX `invoices_order_idx` ON `invoices` (`orderNumber`);