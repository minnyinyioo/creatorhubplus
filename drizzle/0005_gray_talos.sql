ALTER TABLE `payment_requests` ADD `serviceKey` varchar(40);--> statement-breakpoint
ALTER TABLE `payment_requests` ADD `serviceLabel` varchar(160);--> statement-breakpoint
CREATE INDEX `payment_requests_service_created_idx` ON `payment_requests` (`serviceKey`,`createdAt`);