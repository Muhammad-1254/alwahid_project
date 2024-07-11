/*
  Warnings:

  - Added the required column `authroized_special_user_by_admin` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "creator_users" ALTER COLUMN "authorized_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authroized_special_user_at" TIMESTAMP(3),
ADD COLUMN     "authroized_special_user_by_admin" UUID NOT NULL,
ADD COLUMN     "authroized_special_user_by_creator_id" UUID,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_special_user" BOOLEAN NOT NULL DEFAULT false;
