/*
  Warnings:

  - You are about to drop the `room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "room";

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "working_hours_start" TEXT NOT NULL DEFAULT '09:00',
    "working_hours_end" TEXT NOT NULL DEFAULT '19:00',

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reserved_by" INTEGER,
    "reserver_username" TEXT NOT NULL,
    "room_id" INTEGER NOT NULL,
    "time_start" TIMESTAMP(3) NOT NULL,
    "time_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE INDEX "Reservation_time_start_room_id_idx" ON "Reservation"("time_start", "room_id");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_reserved_by_fkey" FOREIGN KEY ("reserved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
