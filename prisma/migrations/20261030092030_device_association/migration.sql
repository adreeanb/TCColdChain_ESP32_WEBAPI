/*
  Warnings:

  - You are about to drop the column `not_fixed` on the `cold_units` table. All the data in the column will be lost.
  - You are about to drop the `ColdUnitDevice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `device_id` to the `temperature_readings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cold_units" DROP COLUMN "not_fixed",
ADD COLUMN     "is_fixed_location" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "temperature_readings" ADD COLUMN     "device_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "ColdUnitDevice";

-- CreateTable
CREATE TABLE "cold_unit_devices" (
    "id" TEXT NOT NULL,
    "mac_address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enterprise_id" TEXT NOT NULL,

    CONSTRAINT "cold_unit_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "association_history" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "cold_unit_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "association_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unbound_telemetry" (
    "id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "device_id" TEXT NOT NULL,

    CONSTRAINT "unbound_telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cold_unit_devices_mac_address_key" ON "cold_unit_devices"("mac_address");

-- CreateIndex
CREATE INDEX "cold_unit_devices_enterprise_id_idx" ON "cold_unit_devices"("enterprise_id");

-- CreateIndex
CREATE INDEX "association_history_device_id_idx" ON "association_history"("device_id");

-- CreateIndex
CREATE INDEX "association_history_cold_unit_id_idx" ON "association_history"("cold_unit_id");

-- CreateIndex
CREATE INDEX "unbound_telemetry_device_id_idx" ON "unbound_telemetry"("device_id");

-- CreateIndex
CREATE INDEX "unbound_telemetry_expires_at_idx" ON "unbound_telemetry"("expires_at");

-- CreateIndex
CREATE INDEX "temperature_readings_cold_unit_id_timestamp_idx" ON "temperature_readings"("cold_unit_id", "timestamp");

-- CreateIndex
CREATE INDEX "temperature_readings_device_id_idx" ON "temperature_readings"("device_id");

-- AddForeignKey
ALTER TABLE "cold_unit_devices" ADD CONSTRAINT "cold_unit_devices_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_history" ADD CONSTRAINT "association_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "cold_unit_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_history" ADD CONSTRAINT "association_history_cold_unit_id_fkey" FOREIGN KEY ("cold_unit_id") REFERENCES "cold_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_readings" ADD CONSTRAINT "temperature_readings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "cold_unit_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unbound_telemetry" ADD CONSTRAINT "unbound_telemetry_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "cold_unit_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Garante no máximo um vínculo ativo por placa (índice parcial não é expresso no schema do Prisma)
CREATE UNIQUE INDEX "association_history_active_device_key" ON "association_history"("device_id") WHERE "end_date" IS NULL;
