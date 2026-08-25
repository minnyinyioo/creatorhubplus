CREATE TABLE `workspace_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`viewKey` enum('Today','Orbit','Rhythm','Offers') NOT NULL DEFAULT 'Today',
	`title` varchar(180) NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 25,
	`completed` int NOT NULL DEFAULT 0,
	`timerSeconds` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workspace_tasks` ADD CONSTRAINT `workspace_tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `workspace_tasks_user_view_order_idx` ON `workspace_tasks` (`userId`,`viewKey`,`sortOrder`);