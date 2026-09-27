CREATE TYPE "public"."payment_kind" AS ENUM('registration', 'extra_video');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "payment_kind" NOT NULL,
	"tournament_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reference" text NOT NULL,
	"paid_on" date NOT NULL,
	"receipt_path" text NOT NULL,
	"status" "payment_status" DEFAULT 'pending_review' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "payment_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;