CREATE TABLE "extra_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"submission_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "extra_attempts_paymentId_unique" UNIQUE("payment_id"),
	CONSTRAINT "extra_attempts_submissionId_unique" UNIQUE("submission_id")
);
--> statement-breakpoint
ALTER TABLE "extra_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "extra_attempts" ADD CONSTRAINT "extra_attempts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_attempts" ADD CONSTRAINT "extra_attempts_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_attempts" ADD CONSTRAINT "extra_attempts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_attempts" ADD CONSTRAINT "extra_attempts_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE set null ON UPDATE no action;