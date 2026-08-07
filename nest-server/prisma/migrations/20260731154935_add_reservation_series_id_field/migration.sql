/*
  Warnings:

  - A unique constraint covering the columns `[reservation_series_id]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Reservation_time_start_time_end_room_id_status_idx";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "reservation_series_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservation_series_id_key" ON "Reservation"("reservation_series_id");

-- CreateIndex
CREATE INDEX "Reservation_time_start_time_end_room_id_status_reservation__idx" ON "Reservation"("time_start", "time_end", "room_id", "status", "reservation_series_id");
