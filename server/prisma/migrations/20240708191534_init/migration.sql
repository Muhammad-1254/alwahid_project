-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('admin', 'creator', 'special_user', 'normal_user');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'phone', 'google', 'facebook');

-- CreateEnum
CREATE TYPE "Qualification" AS ENUM ('graduated', 'student', 'teacher', 'other');

-- CreateEnum
CREATE TYPE "PostMediaType" AS ENUM ('image', 'video', 'audio', 'document');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstname" VARCHAR(80) NOT NULL,
    "lastname" VARCHAR(80) NOT NULL,
    "avatar_url" TEXT,
    "age" INTEGER NOT NULL,
    "phone_number" VARCHAR(20),
    "gender" "Gender" NOT NULL,
    "user_type" "UserType" NOT NULL,
    "auth_provider" "AuthProvider" NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "location_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "user_id" UUID NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "creator_users" (
    "user_id" UUID NOT NULL,
    "authorized_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "works_on" VARCHAR(255) NOT NULL,
    "qualification" "Qualification" NOT NULL,
    "authorized_admin_id" UUID NOT NULL,
    "work_location_id" UUID NOT NULL,

    CONSTRAINT "creator_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "text_content" TEXT NOT NULL,
    "post_by" "UserType" NOT NULL,
    "creator_user_id" UUID,
    "admin_user_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_medias" (
    "id" UUID NOT NULL,
    "media_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "PostMediaType" NOT NULL,
    "post_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_medias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_users" ADD CONSTRAINT "creator_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_users" ADD CONSTRAINT "creator_users_authorized_admin_id_fkey" FOREIGN KEY ("authorized_admin_id") REFERENCES "admin_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_users" ADD CONSTRAINT "creator_users_work_location_id_fkey" FOREIGN KEY ("work_location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "creator_users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_medias" ADD CONSTRAINT "post_medias_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE SET NULL;
