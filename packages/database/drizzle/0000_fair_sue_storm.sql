CREATE SCHEMA "subscript";
--> statement-breakpoint
CREATE TYPE "subscript"."billing_interval" AS ENUM('weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'custom');--> statement-breakpoint
CREATE TYPE "subscript"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "subscript"."subscription_source" AS ENUM('manual', 'email', 'bank', 'import');--> statement-breakpoint
CREATE TYPE "subscript"."subscription_status" AS ENUM('active', 'trial', 'paused', 'cancelled', 'archived');--> statement-breakpoint
CREATE TABLE "subscript"."categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscript"."payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"payment_date" date NOT NULL,
	"status" "subscript"."payment_status" DEFAULT 'completed' NOT NULL,
	"source_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_positive" CHECK (amount_minor > 0),
	CONSTRAINT "payments_currency_iso" CHECK (currency ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "subscript"."subscription_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"effective_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_prices_amount_positive" CHECK (amount_minor > 0),
	CONSTRAINT "subscription_prices_currency_iso" CHECK (currency ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "subscript"."subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"merchant" text NOT NULL,
	"category_id" uuid,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"billing_interval" "subscript"."billing_interval" NOT NULL,
	"custom_interval_days" integer,
	"next_billing_date" date NOT NULL,
	"trial_end_date" date,
	"status" "subscript"."subscription_status" DEFAULT 'active' NOT NULL,
	"source" "subscript"."subscription_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_amount_positive" CHECK (amount_minor > 0),
	CONSTRAINT "subscriptions_currency_iso" CHECK (currency ~ '^[A-Z]{3}$'),
	CONSTRAINT "subscriptions_custom_interval" CHECK ((billing_interval = 'custom' AND custom_interval_days IS NOT NULL AND custom_interval_days > 0) OR (billing_interval <> 'custom' AND custom_interval_days IS NULL))
);
--> statement-breakpoint
CREATE TABLE "subscript"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'Europe/Prague' NOT NULL,
	"default_currency" text DEFAULT 'EUR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_default_currency_iso" CHECK (default_currency ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
ALTER TABLE "subscript"."categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "subscript"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscript"."payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscript"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscript"."subscription_prices" ADD CONSTRAINT "subscription_prices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscript"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscript"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "subscript"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscript"."subscriptions" ADD CONSTRAINT "subscriptions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "subscript"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_name_unique" ON "subscript"."categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "payments_subscription_date_idx" ON "subscript"."payments" USING btree ("subscription_id","payment_date");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_source_reference_unique" ON "subscript"."payments" USING btree ("source_reference") WHERE source_reference is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_prices_effective_unique" ON "subscript"."subscription_prices" USING btree ("subscription_id","effective_date");--> statement-breakpoint
CREATE INDEX "subscriptions_user_status_idx" ON "subscript"."subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_user_next_billing_idx" ON "subscript"."subscriptions" USING btree ("user_id","next_billing_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "subscript"."users" USING btree ("email");
--> statement-breakpoint
REVOKE ALL ON SCHEMA "subscript" FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
GRANT USAGE ON SCHEMA "subscript" TO postgres, service_role;
