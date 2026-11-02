CREATE TYPE "subscript"."integration_status" AS ENUM('connected', 'revoked', 'error');--> statement-breakpoint
CREATE TABLE "subscript"."bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"integration_id" uuid NOT NULL,
	"provider_account_id" text NOT NULL,
	"currency" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "bank_accounts_currency_iso" CHECK (currency ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "subscript"."integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"status" "subscript"."integration_status" DEFAULT 'connected' NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "subscript"."categories" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscript"."bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "subscript"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscript"."bank_accounts" ADD CONSTRAINT "bank_accounts_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "subscript"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscript"."integrations" ADD CONSTRAINT "integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "subscript"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bank_accounts_provider_account_unique" ON "subscript"."bank_accounts" USING btree ("integration_id","provider_account_id");--> statement-breakpoint
CREATE INDEX "bank_accounts_user_idx" ON "subscript"."bank_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integrations_user_provider_unique" ON "subscript"."integrations" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "integrations_user_status_idx" ON "subscript"."integrations" USING btree ("user_id","status");