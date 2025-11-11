/*
  Warnings:

  - Made the column `logo` on table `Partner` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Partner" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "logo" SET NOT NULL;
