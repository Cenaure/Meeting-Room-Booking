-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "working_hours_start" TEXT NOT NULL DEFAULT '09:00',
    "working_hours_end" TEXT NOT NULL DEFAULT '19:00',

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_name_key" ON "room"("name");
