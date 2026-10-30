-- AlterTable
ALTER TABLE "cold_units" ADD COLUMN     "not_fixed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ColdUnitDevice" (
    "id" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,

    CONSTRAINT "ColdUnitDevice_pkey" PRIMARY KEY ("id")
);
