CREATE TABLE `workspace_library_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`kind` enum('template','guide','prompt') NOT NULL DEFAULT 'template',
	`description` text NOT NULL,
	`pinned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_library_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studioName` varchar(120) NOT NULL DEFAULT 'My studio',
	`focusLengthMinutes` int NOT NULL DEFAULT 50,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `workspace_tasks` ADD `archived` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `workspace_library_items` ADD CONSTRAINT `workspace_library_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_settings` ADD CONSTRAINT `workspace_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `workspace_library_user_pinned_idx` ON `workspace_library_items` (`userId`,`pinned`,`updatedAt`);