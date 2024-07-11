-- CreateTable
CREATE TABLE "normal_users" (
    "user_id" UUID NOT NULL,

    CONSTRAINT "normal_users_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "normal_users" ADD CONSTRAINT "normal_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
