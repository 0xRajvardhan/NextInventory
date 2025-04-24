/*
  Warnings:

  - You are about to drop the column `quantity` on the `Inventory` table. All the data in the column will be lost.

*/
-- AlterTable
CREATE SEQUENCE inventory_id_seq;
ALTER TABLE "Inventory" DROP COLUMN "quantity",
ALTER COLUMN "id" SET DEFAULT nextval('inventory_id_seq'),
ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE inventory_id_seq OWNED BY "Inventory"."id";

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quantity" (
    "id" SERIAL NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reorderQuantity" DOUBLE PRECISION NOT NULL,
    "lowStockLevel" DOUBLE PRECISION NOT NULL,
    "unitCostDollar" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,

    CONSTRAINT "Quantity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InventoryToSupplier" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InventoryToSupplier_AB_unique" ON "_InventoryToSupplier"("A", "B");

-- CreateIndex
CREATE INDEX "_InventoryToSupplier_B_index" ON "_InventoryToSupplier"("B");

-- AddForeignKey
ALTER TABLE "Quantity" ADD CONSTRAINT "Quantity_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quantity" ADD CONSTRAINT "Quantity_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quantity" ADD CONSTRAINT "Quantity_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InventoryToSupplier" ADD CONSTRAINT "_InventoryToSupplier_A_fkey" FOREIGN KEY ("A") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InventoryToSupplier" ADD CONSTRAINT "_InventoryToSupplier_B_fkey" FOREIGN KEY ("B") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
