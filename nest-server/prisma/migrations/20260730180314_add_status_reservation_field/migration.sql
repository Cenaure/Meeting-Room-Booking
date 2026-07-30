-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('cancelled', 'active');

-- DropIndex
DROP INDEX "Reservation_time_start_room_id_idx";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "Reservation_time_start_time_end_room_id_status_idx" ON "Reservation"("time_start", "time_end", "room_id", "status");
