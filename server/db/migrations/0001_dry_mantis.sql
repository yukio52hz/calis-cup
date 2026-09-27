CREATE TYPE "public"."registration_status" AS ENUM('pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'under_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tournament_status" AS ENUM('draft', 'active', 'finished');--> statement-breakpoint
CREATE TABLE "challenge_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"name" text NOT NULL,
	"repetitions" integer NOT NULL,
	"penalty_seconds" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_exercises" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_id" uuid NOT NULL,
	"name" text NOT NULL,
	"objective" text,
	"rules" text[] DEFAULT '{}' NOT NULL,
	"example_video_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenges_weekId_unique" UNIQUE("week_id")
);
--> statement-breakpoint
ALTER TABLE "challenges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "category" NOT NULL,
	"status" "registration_status" DEFAULT 'pending_review' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_tournamentId_userId_unique" UNIQUE("tournament_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "registrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"video_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"duration_ms" integer,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"raw_time_ms" integer,
	"penalty_ms" integer,
	"final_time_ms" integer,
	"reviewer_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_videoPath_unique" UNIQUE("video_path"),
	CONSTRAINT "submissions_challengeId_userId_attemptNumber_unique" UNIQUE("challenge_id","user_id","attempt_number")
);
--> statement-breakpoint
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tournament_weeks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tournament_weeks_tournamentId_weekNumber_unique" UNIQUE("tournament_id","week_number")
);
--> statement-breakpoint
ALTER TABLE "tournament_weeks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"registration_fee" integer NOT NULL,
	"extra_video_fee" integer NOT NULL,
	"sinpe_number" text,
	"status" "tournament_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tournaments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "tournaments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "challenge_exercises" ADD CONSTRAINT "challenge_exercises_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_week_id_tournament_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."tournament_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_weeks" ADD CONSTRAINT "tournament_weeks_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;