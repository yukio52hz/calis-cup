ALTER TABLE "submissions" ALTER COLUMN "video_path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "video_deleted_at" timestamp with time zone;