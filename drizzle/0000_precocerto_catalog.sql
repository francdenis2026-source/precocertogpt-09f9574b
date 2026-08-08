CREATE TABLE `establishments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'Supermercado' NOT NULL,
	`neighborhood` text NOT NULL,
	`city` text DEFAULT 'Feijó' NOT NULL,
	`state` text DEFAULT 'AC' NOT NULL,
	`phone` text,
	`brand_color` text DEFAULT '#1473E6' NOT NULL,
	`verified` integer DEFAULT true NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_establishments_slug` ON `establishments` (`slug`);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`size` text NOT NULL,
	`unit` text NOT NULL,
	`barcode` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_products_slug` ON `products` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_products_search` ON `products` (`normalized_name`,`category`);
--> statement-breakpoint
CREATE TABLE `prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`establishment_id` integer NOT NULL,
	`value` real NOT NULL,
	`previous_value` real,
	`verified` integer DEFAULT true NOT NULL,
	`captured_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
	FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_prices_product_value` ON `prices` (`product_id`,`value`);
--> statement-breakpoint
CREATE INDEX `idx_prices_establishment` ON `prices` (`establishment_id`);
--> statement-breakpoint
CREATE TABLE `user_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_action_unique` ON `user_actions` (`user_id`,`action`,`entity_type`,`entity_id`);
--> statement-breakpoint
CREATE INDEX `idx_user_actions_user` ON `user_actions` (`user_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
