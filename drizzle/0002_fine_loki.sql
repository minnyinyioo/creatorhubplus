CREATE TABLE `support_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`caseCode` varchar(32) NOT NULL,
	`serviceKey` varchar(40) NOT NULL,
	`serviceLabel` varchar(160) NOT NULL,
	`platformName` varchar(100) NOT NULL,
	`issueSummary` varchar(180) NOT NULL,
	`details` text NOT NULL,
	`status` enum('open','clarification_requested','resolved','closed') NOT NULL DEFAULT 'open',
	`staffNote` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_cases_caseCode_unique` UNIQUE(`caseCode`)
);
--> statement-breakpoint
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `support_cases_user_created_idx` ON `support_cases` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `support_cases_status_created_idx` ON `support_cases` (`status`,`createdAt`);