/*
  Warnings:

  - The primary key for the `Categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `partNumber` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Inventory` table. All the data in the column will be lost.
  - The primary key for the `Warehouse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Quantity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_InventoryToSupplier` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `itemId` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lowStockLevel` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reorderQuantity` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCostDollar` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCostVES` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeterReading" AS ENUM ('None', 'Hours', 'Kilometers', 'Miles', 'Date');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('Supplier', 'Distributor', 'Manufacturer');

-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('Requisition', 'Ordered', 'Received_Partial', 'Received', 'Close');

-- CreateEnum
CREATE TYPE "TaxBy" AS ENUM ('Both', 'None', 'One', 'Two');

-- CreateEnum
CREATE TYPE "Shipping" AS ENUM ('Air', 'Courier', 'Expedited', 'Ground', 'Next_Day');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Normal', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('Recurring', 'Repair', 'Renewal');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('Open', 'In_Progress', 'On_Hold', 'Complete');

-- CreateEnum
CREATE TYPE "AdminType" AS ENUM ('Admin', 'Standard', 'Operator');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('Active', 'Inactive');

-- DropForeignKey
ALTER TABLE "Quantity" DROP CONSTRAINT "Quantity_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "Quantity" DROP CONSTRAINT "Quantity_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Quantity" DROP CONSTRAINT "Quantity_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "_InventoryToSupplier" DROP CONSTRAINT "_InventoryToSupplier_A_fkey";

-- DropForeignKey
ALTER TABLE "_InventoryToSupplier" DROP CONSTRAINT "_InventoryToSupplier_B_fkey";

-- DropIndex
DROP INDEX "Inventory_partNumber_key";

-- AlterTable
ALTER TABLE "Categories" DROP CONSTRAINT "Categories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Categories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Categories_id_seq";

-- AlterTable
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_pkey",
DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "partNumber",
DROP COLUMN "type",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "lowStockLevel" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reorderQuantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitCostDollar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitCostVES" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "warehouseId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "inventory_id_seq";

-- AlterTable
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_pkey",
ADD COLUMN     "tax1" DOUBLE PRECISION,
ADD COLUMN     "tax2" DOUBLE PRECISION,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Warehouse_id_seq";

-- DropTable
DROP TABLE "Quantity";

-- DropTable
DROP TABLE "Supplier";

-- DropTable
DROP TABLE "_InventoryToSupplier";

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "keywords" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "meterTracking" BOOLEAN NOT NULL,
    "primaryMeter" "MeterReading",
    "primaryMeterReading" DOUBLE PRECISION,
    "secondaryMeter" "MeterReading",
    "secondaryMeterReading" DOUBLE PRECISION,
    "equipmentTypeId" TEXT,
    "makeId" TEXT,
    "modelId" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Make" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Make_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitTypeId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "UnitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "vendorType" "VendorType" NOT NULL,
    "phone" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVendor" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "vendorId" TEXT,
    "manufacturerId" TEXT,
    "vendorPartNumber" TEXT,
    "barcode" TEXT,

    CONSTRAINT "ItemVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "poNumber" SERIAL NOT NULL,
    "dateOpened" TIMESTAMP(3) NOT NULL,
    "dateRequired" TIMESTAMP(3),
    "shipVia" "Shipping",
    "invoice" TEXT,
    "workOrder" INTEGER,
    "notes" TEXT,
    "poStatus" "StatusType" NOT NULL,
    "taxBy" "TaxBy" NOT NULL,
    "tax1" DOUBLE PRECISION NOT NULL,
    "tax2" DOUBLE PRECISION NOT NULL,
    "freight" DOUBLE PRECISION NOT NULL,
    "buyerId" TEXT,
    "termsId" TEXT,
    "warehouseId" TEXT NOT NULL,
    "vendorId" TEXT,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "description" TEXT,
    "invoice" TEXT,
    "qtyOrdered" INTEGER NOT NULL,
    "qtyReceived" INTEGER NOT NULL,
    "qtyRemaining" INTEGER NOT NULL,
    "unitCostDollar" DOUBLE PRECISION NOT NULL,
    "unitCostVES" DOUBLE PRECISION NOT NULL,
    "tax1" DOUBLE PRECISION,
    "tax2" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "vendorId" TEXT,
    "purchaseOrderId" TEXT,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issuance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "qtyIssued" INTEGER NOT NULL,
    "unitCostDollar" DOUBLE PRECISION,
    "unitCostVES" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "inventoryId" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "workOrderTaskId" TEXT,

    CONSTRAINT "Issuance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "woNumber" SERIAL NOT NULL,
    "scheduled" TIMESTAMP(3) NOT NULL,
    "due" TIMESTAMP(3),
    "dateStarted" TIMESTAMP(3),
    "dateCompleted" TIMESTAMP(3),
    "priority" "Priority" NOT NULL,
    "workOrderType" TEXT,
    "notes" TEXT,
    "woStatus" "WorkOrderStatus" NOT NULL,
    "employeeId" TEXT,
    "equipmentId" TEXT NOT NULL,
    "tax1" DOUBLE PRECISION NOT NULL,
    "tax2" DOUBLE PRECISION NOT NULL,
    "primaryMeterReading" DOUBLE PRECISION,
    "secondaryMeterReading" DOUBLE PRECISION,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Labor" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "laborRate" DOUBLE PRECISION NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workOrderTaskId" TEXT,

    CONSTRAINT "Labor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderTask" (
    "id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "repairTaskId" TEXT,
    "recurringTaskId" TEXT,

    CONSTRAINT "WorkOrderTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTask" (
    "id" TEXT NOT NULL,
    "taskStatus" "TaskStatus" NOT NULL,
    "taskType" "TaskType" NOT NULL,
    "taskId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "maintenanceTemplateId" TEXT,

    CONSTRAINT "RecurringTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairTask" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "taskType" "TaskType" NOT NULL,
    "priority" "Priority" NOT NULL,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL,
    "taskId" TEXT NOT NULL,
    "employeeId" TEXT,
    "repairTypeId" TEXT,

    CONSTRAINT "RepairTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RepairType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maintenanceTemplateId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "recurringTaskId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,

    CONSTRAINT "TaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTracking" (
    "id" TEXT NOT NULL,
    "trackByDate" BOOLEAN,
    "trackByDateEvery" BOOLEAN,
    "dateInterval" INTEGER,
    "dateAdvanceNotice" INTEGER,
    "dateNextDue" TIMESTAMP(3),
    "dateLastPerformed" TIMESTAMP(3),
    "trackByPrimary" BOOLEAN,
    "trackByPrimaryEvery" BOOLEAN,
    "primaryMeterType" "MeterReading",
    "primaryInterval" DOUBLE PRECISION,
    "primaryAdvanceNotice" DOUBLE PRECISION,
    "primaryNextDue" DOUBLE PRECISION,
    "primaryLastPerformed" DOUBLE PRECISION,
    "trackBySecondary" BOOLEAN,
    "trackBySecondaryEvery" BOOLEAN,
    "secondaryMeterType" "MeterReading",
    "secondaryInterval" DOUBLE PRECISION,
    "secondaryAdvanceNotice" DOUBLE PRECISION,
    "secondaryNextDue" DOUBLE PRECISION,
    "secondaryLastPerformed" DOUBLE PRECISION,
    "recurringTaskId" TEXT,
    "repairTaskId" TEXT,

    CONSTRAINT "TaskTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DateNextDue" (
    "id" TEXT NOT NULL,
    "taskTrackingId" TEXT NOT NULL,
    "dateNextDue" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DateNextDue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimaryNextDue" (
    "id" TEXT NOT NULL,
    "taskTrackingId" TEXT NOT NULL,
    "primaryNextDue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PrimaryNextDue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecondaryNextDue" (
    "id" TEXT NOT NULL,
    "taskTrackingId" TEXT NOT NULL,
    "secondaryNextDue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SecondaryNextDue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MaintenanceTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "employeeStatus" "EmployeeStatus" NOT NULL,
    "laborRate" DOUBLE PRECISION NOT NULL,
    "loginAllowed" BOOLEAN NOT NULL,
    "email" TEXT,
    "adminType" "AdminType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serial_key" ON "Equipment"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Make_name_key" ON "Make"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_name_key" ON "Model"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentType_name_key" ON "EquipmentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_partNumber_key" ON "Item"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Terms_name_key" ON "Terms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RepairType_name_key" ON "RepairType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTracking_recurringTaskId_key" ON "TaskTracking"("recurringTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTracking_repairTaskId_key" ON "TaskTracking"("repairTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "UnitType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVendor" ADD CONSTRAINT "ItemVendor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVendor" ADD CONSTRAINT "ItemVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVendor" ADD CONSTRAINT "ItemVendor_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "Terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issuance" ADD CONSTRAINT "Issuance_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issuance" ADD CONSTRAINT "Issuance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issuance" ADD CONSTRAINT "Issuance_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issuance" ADD CONSTRAINT "Issuance_workOrderTaskId_fkey" FOREIGN KEY ("workOrderTaskId") REFERENCES "WorkOrderTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Labor" ADD CONSTRAINT "Labor_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Labor" ADD CONSTRAINT "Labor_workOrderTaskId_fkey" FOREIGN KEY ("workOrderTaskId") REFERENCES "WorkOrderTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderTask" ADD CONSTRAINT "WorkOrderTask_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderTask" ADD CONSTRAINT "WorkOrderTask_repairTaskId_fkey" FOREIGN KEY ("repairTaskId") REFERENCES "RepairTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderTask" ADD CONSTRAINT "WorkOrderTask_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "RecurringTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_maintenanceTemplateId_fkey" FOREIGN KEY ("maintenanceTemplateId") REFERENCES "MaintenanceTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTask" ADD CONSTRAINT "RepairTask_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTask" ADD CONSTRAINT "RepairTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTask" ADD CONSTRAINT "RepairTask_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTask" ADD CONSTRAINT "RepairTask_repairTypeId_fkey" FOREIGN KEY ("repairTypeId") REFERENCES "RepairType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_maintenanceTemplateId_fkey" FOREIGN KEY ("maintenanceTemplateId") REFERENCES "MaintenanceTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "RecurringTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTracking" ADD CONSTRAINT "TaskTracking_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "RecurringTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTracking" ADD CONSTRAINT "TaskTracking_repairTaskId_fkey" FOREIGN KEY ("repairTaskId") REFERENCES "RepairTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DateNextDue" ADD CONSTRAINT "DateNextDue_taskTrackingId_fkey" FOREIGN KEY ("taskTrackingId") REFERENCES "TaskTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrimaryNextDue" ADD CONSTRAINT "PrimaryNextDue_taskTrackingId_fkey" FOREIGN KEY ("taskTrackingId") REFERENCES "TaskTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecondaryNextDue" ADD CONSTRAINT "SecondaryNextDue_taskTrackingId_fkey" FOREIGN KEY ("taskTrackingId") REFERENCES "TaskTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
