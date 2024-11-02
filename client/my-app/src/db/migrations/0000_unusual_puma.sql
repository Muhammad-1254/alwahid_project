CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`avatarUrl` text
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`textContent` text,
	`mediaContent` text,
	`mediaType` text,
	`ownerId` text NOT NULL,
	`chatId` text,
	`groupId` text,
	`sentAt` text NOT NULL,
	`deliveredAt` text,
	`readAt` text,
	FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`bio` text,
	`firstname` text NOT NULL,
	`lastname` text NOT NULL,
	`avatarUrl` text,
	`isSpecialUser` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `user_group_association` (
	`userId` text NOT NULL,
	`groupId` text NOT NULL,
	PRIMARY KEY(`userId`, `groupId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON UPDATE cascade ON DELETE cascade
);
