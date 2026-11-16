CREATE TYPE "mirsaad_todo"."TaskStatus" AS ENUM ('PENDING', 'COMPLETED');
CREATE TYPE "mirsaad_todo"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE "mirsaad_todo"."users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mirsaad_todo"."tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "status" "mirsaad_todo"."TaskStatus" NOT NULL DEFAULT 'PENDING',
  "priority" "mirsaad_todo"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "due_date" TIMESTAMPTZ(3),
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "mirsaad_todo"."users"("email");
CREATE INDEX "tasks_user_id_status_idx" ON "mirsaad_todo"."tasks"("user_id", "status");
CREATE INDEX "tasks_user_id_due_date_idx" ON "mirsaad_todo"."tasks"("user_id", "due_date");
CREATE INDEX "tasks_user_id_priority_idx" ON "mirsaad_todo"."tasks"("user_id", "priority");

ALTER TABLE "mirsaad_todo"."tasks"
  ADD CONSTRAINT "tasks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "mirsaad_todo"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
