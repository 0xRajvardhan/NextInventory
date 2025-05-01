/*
  Warnings:

  - The values [Proveedor,Distribuidor,Fabricante] on the enum `VendorType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VendorType_new" AS ENUM ('Supplier', 'Distributor', 'Manufacturer');
ALTER TABLE "Vendor" ALTER COLUMN "vendorType" TYPE "VendorType_new" USING ("vendorType"::text::"VendorType_new");
ALTER TYPE "VendorType" RENAME TO "VendorType_old";
ALTER TYPE "VendorType_new" RENAME TO "VendorType";
DROP TYPE "VendorType_old";
COMMIT;
