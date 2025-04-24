"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  EmployeeFormValues,
  IssuanceFormValues,
  Option,
  ReceiptFormValues,
  RecurringTaskFormValues,
  VendorFormValues,
  EquipmentFormValues,
  WorkOrderFormValues,
  PurchaseOrderItemsFormValues,
  LaborFormValues
} from "./definitions";
import prisma from "./prisma";
import { MeterReading, Prisma, PrismaClient, Shipping, Task, TaxBy, WorkOrderStatus } from "@prisma/client";
import { StatusType } from "@prisma/client";
import { Vendor, Employee, PurchaseOrder, Equipment, WorkOrder, RepairTask, Receipt, TaskTracking, WorkOrderTask } from "./zod";
import { InventoryFormValues, PurchaseOrderFormValues, RepairTaskFormValues } from "./definitions";
import { TaskType, Priority } from "@prisma/client";

import { PurchaseOrderFormSchema } from "./definitions";
import { calculateNextDueDate, calculateNextDueNumber, calculateNextDueNumber2, calculateNextDueTimestamp, formatLabel } from "./utils";
import { TaskStatus } from "@prisma/client";
import { date } from "zod";
import { empty } from "@prisma/client/runtime/library";
import { create } from "domain";


////////////////////////////////////// EQUIPMENT //////////////////////////////////////

async function createMake(
  tx: Prisma.TransactionClient,
  data: { value: string; label: string } | null
) {
  // Check if data is null or value is null
  if (!data || !data.value) {
    return null;
  }

  // Perform the upsert operation
  const make = await tx.make.upsert({
    where: { id: data.value },
    create: { name: data.label },
    update: {},
  });

  // Return the ID of the created or updated term
  return make.id;
}

async function createModel(
  tx: Prisma.TransactionClient,
  data: { value: string; label: string } | null
) {
  // Check if data is null or value is null
  if (!data || !data.value) {
    return null;
  }

  // Perform the upsert operation
  const model = await tx.model.upsert({
    where: { id: data.value },
    create: { name: data.label },
    update: {},
  });

  // Return the ID of the created or updated term
  return model.id;
}

async function createEquipmentType(
  tx: Prisma.TransactionClient,
  data: { value: string; label: string } | null
) {
  // Check if data is null or value is null
  if (!data || !data.value) {
    return null;
  }

  // Perform the upsert operation
  const equipmentType = await tx.equipmentType.upsert({
    where: { id: data.value },
    create: { name: data.label },
    update: {},
  });

  // Return the ID of the created or updated term
  return equipmentType.id;
}

export async function createEquipment(data: EquipmentFormValues) {
  try {
    await prisma.$transaction(async (tx) => {
      // Create or find the make
      const make = await createMake(tx, data.make);

      // Create or find the model
      const model = await createModel(tx, data.model);

      // Create or find the equipment type
      const equipmentType = await createEquipmentType(tx, data.equipmentType);

      // Create the equipment
      await tx.equipment.create({
        data: {
          unitNumber: data.unitNumber,
          description: data.description || "",
          year: data.year || 0,
          makeId: make, // Connect the equipment to the make
          modelId: model, // Connect the equipment to the model
          equipmentTypeId: equipmentType, // Connect the equipment to the equipment type
          keywords: data.keywords || "", // Add default or optional properties
          serial: data.serial || "",
          tag: data.tag || "",
          primaryMeter: data.primaryMeter?.value as MeterReading,
          primaryMeterReading: data.primaryMeterReading || 0,
          secondaryMeter: data.secondaryMeter?.value as MeterReading,
          secondaryMeterReading: data.secondaryMeterReading || 0,
          meterTracking: data.meterTracking
        },
      });
    });
  } catch (error: any) {
    console.error(error);
    // Handle errors if needed
    return { error: "An error occurred while creating the equipment." };
  }
  revalidatePath("/dashboard/equipment");
  redirect("/dashboard/equipment");
}

////////////////////////////////////// TASKS //////////////////////////////////////

export async function createTask(
  tx: Prisma.TransactionClient,
  data: { value: string; label: string } | null
) {
  // Check if data is null or value is null
  if (!data || !data.value) {
    // return null;
    throw new Error("Task not found or created");
  }

  // Perform the upsert operation
  const task = await tx.task.upsert({
    where: { id: data.value },
    create: { description: data.label },
    update: {},
  });

  // Return the ID of the created or updated term
  return task.id;
}

export async function createRepairType(
  tx: Prisma.TransactionClient,
  data: { value: string; label: string } | null
) {
  // Check if data is null or value is null
  if (!data || !data.value) {
    return null;
    // throw new Error("Repair not found or created");
  }

  // Perform the upsert operation
  const repairType = await tx.repairType.upsert({
    where: { id: data.value },
    create: { name: data.label },
    update: {},
  });

  // Return the ID of the created or updated term
  return repairType.id;
}

export async function createRepairTask(
  data: RepairTaskFormValues,
  tx?: Prisma.TransactionClient
): Promise<
  | {
      success: true;
      message: string;
      id: string;
    }
  | { error: { field: string; message: string }[] }
> {
  try {

    console.log("Creating repair task with data:", data);
    if (!data.equipment?.value) {
      return {
        error: [{ field: "equipment", message: "Equipment is required" }],
      };
    }

    const run = async (client: Prisma.TransactionClient) => {
      if (!data.equipment?.value) {
        return {
          error: [{ field: "equipment", message: "Equipment is required" }],
        };
      }

      const [task, repairType] = await Promise.all([
        createTask(client, data.task),
        createRepairType(client, data.repairType),
      ]);

      const repairTask = await client.repairTask.upsert({
        where: { id: data.id || "" },
        update: {
          equipmentId: data.equipment.value,
          taskId: task,
          employeeId: data.employee?.value,
          repairTypeId: repairType,
          priority: "Normal",
          notes: data.notes,
          taskTracking: {
            update: {
              dateNextDue: data.taskTracking?.dateNextDue,
            },
          },
        },
        create: {
          equipmentId: data.equipment.value,
          completed: false,
          taskType: data.taskType.value as TaskType,
          taskId: task,
          employeeId: data.employee?.value,
          repairTypeId: repairType,
          priority: data.priority?.value as Priority,
          notes: data.notes,
          taskTracking: {
            create: {
              dateNextDue: data.taskTracking?.dateNextDue ?? new Date(),
            },
          },
        },
      });

      return repairTask;
    };

    const result = tx ? await run(tx) : await prisma.$transaction(run);

    // ✅ Type narrowing
    if ("error" in result) {
      return result;
    }

    return {
      success: true,
      message: "Repair request added successfully.",
      id: result.id, // ✅ Now TypeScript knows result has .id
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => ({
          field,
          message: `${field} is taken`,
        }));
        return { error: errors };
      }
    }

    console.error("Unexpected error:", error);
    throw error;
  }
}

export async function deleteRepairTask(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.repairTask.delete({
        where: {
          id: id,
        },
      });
    });

    revalidatePath(`/dashboard/equipment`);

    return {
      success: true,
      message: "Repair task deleted successfully.",
    };
  } catch (error: any) {
    console.error("Error in deleteRepairTask:", error);

    return {
      error: {
        message: error?.message || "An unexpected error occurred",
      },
    };
  }
}

export async function createRecurringTask(data: RecurringTaskFormValues) {
  
  try {
    await prisma.$transaction(async (tx) => {
      // Create or find the task
      const task = await createTask(tx, data.task);

      const recurringTask = await tx.recurringTask.upsert({
        where: {
          id: data.id || "",
        },
        update:{
          task: { connect: { id: task } }, // Connect the task to the specific task
          taskStatus: data.taskStatus?.value as TaskStatus,
          taskTracking: {
            update: {

              // Handle trackByDate deletion
              ...(data.taskTracking?.trackByDate
                ? {
                    trackByDate: true,
                    trackByDateEvery: data.taskTracking.trackByDateEvery,
                    dateInterval: data.taskTracking.trackByDateEvery ? ( data.taskTracking.dateInterval ) : null,
                    dateAdvanceNotice: data.taskTracking.dateAdvanceNotice,
                    dateLastPerformed: data.taskTracking.dateLastPerformed,
                    dateNextDue: data.taskTracking.trackByDateEvery
                      ? calculateNextDueTimestamp({
                          lastPerformed: data.taskTracking.dateLastPerformed,
                          interval: data.taskTracking.dateInterval,
                        })
                      : null,
                      DateNextDue: data.taskTracking?.trackByDateEvery ? (
                          {
                            deleteMany: {
                              taskTrackingId: data.taskTracking?.id,
                            },
                          }
                        ):(
                          {
                            deleteMany: {
                              taskTrackingId: data.taskTracking?.id,
                            },
                            create: data.taskTracking?.DateNextDue.map((date) => ({
                              dateNextDue: date.dateNextDue
                            })),
                          }
                        ),
                  }
                : {
                    trackByDate: false,
                    trackByDateEvery: true,
                    dateInterval: null,
                    dateAdvanceNotice: null,
                    dateLastPerformed: null,
                    dateNextDue: null,
                    DateNextDue: { deleteMany: { taskTrackingId: data.taskTracking?.id } },
                  }),              

              // Handle trackByPrimary deletion
              ...(data.taskTracking?.trackByPrimary
                ? {
                    trackByPrimary: true,
                    trackByPrimaryEvery: data.taskTracking.trackByPrimaryEvery,
                    primaryMeterType: data.taskTracking.primaryMeterType,
                    primaryInterval: data.taskTracking.trackByPrimaryEvery ? ( data.taskTracking.primaryInterval ) : null,
                    primaryAdvanceNotice: data.taskTracking.primaryAdvanceNotice,
                    primaryLastPerformed: data.taskTracking.primaryLastPerformed,
                    primaryNextDue: data.taskTracking.trackByPrimaryEvery
                      ? calculateNextDueNumber2({
                          lastPerformed: data.taskTracking.primaryLastPerformed,
                          interval: data.taskTracking.primaryInterval,
                        })
                      : null,
                      PrimaryNextDue: data.taskTracking?.trackByPrimaryEvery ? (
                        {
                          deleteMany: {
                            taskTrackingId: data.taskTracking?.id,
                          },
                        }
                      ):(
                        {
                          deleteMany: {
                            taskTrackingId: data.taskTracking?.id,
                          },
                          create: data.taskTracking?.PrimaryNextDue.map((meter) => ({
                            primaryNextDue: meter.primaryNextDue,
                          })),
                        }
                      ),
                  }
                : {
                    trackByPrimary: false,
                    trackByPrimaryEvery: true,
                    primaryInterval: null,
                    primaryAdvanceNotice: null,
                    primaryLastPerformed: null,
                    primaryNextDue: null,
                    PrimaryNextDue: { deleteMany: { taskTrackingId: data.taskTracking?.id } },
                  }),

              // Handle trackBySecondary deletion
              ...(data.taskTracking?.trackBySecondary
                ? {
                    trackBySecondary: true,
                    trackBySecondaryEvery: data.taskTracking.trackBySecondaryEvery,
                    secondaryMeterType: data.taskTracking.secondaryMeterType,
                    secondaryInterval: data.taskTracking.trackBySecondaryEvery ? ( data.taskTracking.secondaryInterval ) : null,
                    secondaryAdvanceNotice: data.taskTracking.secondaryAdvanceNotice,
                    secondaryLastPerformed: data.taskTracking.secondaryLastPerformed,
                    secondaryNextDue: data.taskTracking.trackBySecondaryEvery
                      ? calculateNextDueNumber2({
                          lastPerformed: data.taskTracking.secondaryLastPerformed,
                          interval: data.taskTracking.secondaryInterval,
                        })
                      : null,
                    SecondaryNextDue: data.taskTracking?.trackBySecondaryEvery ? (
                      {
                        deleteMany: {
                          taskTrackingId: data.taskTracking?.id,
                        },
                      }
                    ):(
                      {
                        deleteMany: {
                          taskTrackingId: data.taskTracking?.id,
                        },
                        create: data.taskTracking?.SecondaryNextDue.map((meter) => ({
                          secondaryNextDue: meter.secondaryNextDue,
                        })),
                      }
                    ),
                  }
                : {
                    trackBySecondary: false,
                    trackBySecondaryEvery: true,
                    secondaryInterval: null,
                    secondaryAdvanceNotice: null,
                    secondaryLastPerformed: null,
                    secondaryNextDue: null,
                    SecondaryNextDue: { deleteMany: { taskTrackingId: data.taskTracking?.id } },
                  })
            }
          }
        },
        create:{
          equipment: { connect: { id: data.equipmentId } }, // Connect the task to the equipment
          task: { connect: { id: task } }, // Connect the task to the specific task
          taskType: "Recurring",
          taskStatus: data.taskStatus?.value as TaskStatus,
          taskTracking: {
            create: {
              trackByDate: data.taskTracking?.trackByDate,
              trackByDateEvery: data.taskTracking?.trackByDateEvery,
              dateInterval: data.taskTracking?.dateInterval,
              dateAdvanceNotice: data.taskTracking?.dateAdvanceNotice,
              dateLastPerformed: data.taskTracking?.dateLastPerformed,
              dateNextDue: data.taskTracking?.trackByDateEvery? (
                calculateNextDueTimestamp({
                  lastPerformed: data.taskTracking?.dateLastPerformed,
                  interval: data.taskTracking?.dateInterval
                })
              ):(
                null
              ),
              DateNextDue: data.taskTracking?.trackByDateEvery
              ? {
                  create: data.taskTracking.DateNextDue.map((date) => ({
                    dateNextDue: date.dateNextDue,
                  })),
                }
              : undefined,

              trackByPrimary: data.taskTracking?.trackByPrimary,
              trackByPrimaryEvery: data.taskTracking?.trackByPrimaryEvery,
              primaryMeterType: data.taskTracking?.primaryMeterType,
              primaryInterval: data.taskTracking?.primaryInterval,
              primaryAdvanceNotice: data.taskTracking?.primaryAdvanceNotice,
              primaryLastPerformed: data.taskTracking?.primaryLastPerformed,
              primaryNextDue: data.taskTracking?.trackByPrimaryEvery ? 
              (
                calculateNextDueNumber2({
                  lastPerformed: data.taskTracking?.primaryLastPerformed,
                  interval: data.taskTracking?.primaryInterval
                })
              ):(
                null
              ),
              PrimaryNextDue: data.taskTracking?.trackByPrimaryEvery
              ? {
                  create: data.taskTracking.PrimaryNextDue.map((meter) => ({
                    primaryNextDue: meter.primaryNextDue,
                  })),
                }
              : undefined,

              trackBySecondary: data.taskTracking?.trackBySecondary,
              trackBySecondaryEvery: data.taskTracking?.trackBySecondaryEvery,
              secondaryMeterType: data.taskTracking?.secondaryMeterType,
              secondaryInterval: data.taskTracking?.secondaryInterval,
              secondaryAdvanceNotice: data.taskTracking?.secondaryAdvanceNotice,
              secondaryLastPerformed: data.taskTracking?.secondaryLastPerformed,
              secondaryNextDue: data.taskTracking?.trackBySecondaryEvery ? (
                calculateNextDueNumber2({
                  lastPerformed: data.taskTracking?.secondaryLastPerformed,
                  interval: data.taskTracking?.secondaryInterval
                })
              ):(
                null
              ),
              SecondaryNextDue: data.taskTracking?.trackBySecondaryEvery
              ? {
                  create: data.taskTracking.SecondaryNextDue.map((meter) => ({
                    secondaryNextDue: meter.secondaryNextDue
                  })),
                }
              : undefined,

            }
          }
        }
      });
    });

    revalidatePath("/dashboard/equipment");

    return { 
      success: true, 
      message: "Recurring task added successfully.", 
      id: data.equipmentId, // Return the ID of the created repair request
    };
    
  } catch (error: any) {
    console.log(error);

    if (error.code === "P2002" && error.meta?.target?.includes("partNumber")) {
      return {
        error: {
          field: "partNumber",
          message: "Part number already exists",
        },
      };
    }
  }
}

export async function upsertTaskItem(data: RecurringTaskFormValues['taskItem'][number]) {
  try {
    if (!data.item || !data.item.value || !data.recurringTaskId) {
      throw new Error("Item and Recurring Task ID are required");
    }

    const inventoryId: string = data.item.value; 
    const recurringTaskId: string = data.recurringTaskId;

    const result = await prisma.$transaction(async (tx) => {
      const taskItem = await tx.taskItem.upsert({
        where: { id: data.id || "" },
        update: {
          inventoryId,
          quantity: data.quantity,
        },
        create: {
          recurringTaskId,
          inventoryId,
          quantity: data.quantity,
        },
        select: {
          id: true,
          quantity: true,
          recurringTaskId: true,
          inventory: {
            select: {
              id: true,
              item: {
                select: {
                  id: true,
                  name: true,
                  partNumber: true,
                  description: true,
                  unitType: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              receipts: {
                where: { qtyRemaining: { gt: 0 } },
                take: 1,
                orderBy: { createdAt: "asc" },
                select: {
                  unitCostDollar: true,
                },
              },
            },
          },
        },
      });

      return {
        id: taskItem.id,
        quantity: taskItem.quantity,
        recurringTaskId: taskItem.recurringTaskId,
        item: taskItem.inventory?.item
          ? {
              value: taskItem.inventory.id,
              label: taskItem.inventory.item.partNumber,
              name: taskItem.inventory.item.name,
              description: taskItem.inventory.item.description,
              quantity: data.quantity, // Keep the existing quantity
              unitCostDollar: taskItem.inventory.receipts?.[0]?.unitCostDollar ?? 0,
            }
          : null,
      };
    });

    revalidatePath("/dashboard/equipment");

    return { 
      success: true, 
      message: "Recurring task added successfully.",
      data: result
    };

  } catch (error: any) {
    console.error("Error in upsertTaskItem:", error);

    return {
      error: {
        message: error?.message || "An unexpected error occurred",
      },
    };
  }
}

export async function deleteTaskItem(data: RecurringTaskFormValues['taskItem'][number]) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.taskItem.delete({
        where: {
          id: data.id,
        },
      });
    });
    
    revalidatePath(`/dashboard/equipment`);

    return {
      success: true,
      message: "Task deleted successfully.",
    };
  } catch (error: any) {
    console.error("Error in upsertTaskItem:", error);

    return {
      error: {
        message: error?.message || "An unexpected error occurred",
      },
    };
  }
}

////////////////////////////////////// INVENTORY //////////////////////////////////////

export async function createItem(data: InventoryFormValues) {
  try {
    await prisma.$transaction(async (tx) => {
      // Upsert Unit Type
      const unitTypeId = await upsertUnitType(tx, data.unitType);

      // Upsert Item (needs the unitTypeId)
      const item = await upsertItem(tx, data, unitTypeId);
      
      // Run inventory and supplier operations concurrently
      await Promise.all([
        upsertInventory(tx, item.id, data),
        upsertVendors(tx, item.id, data)
      ]);
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002" && error.meta?.target?.includes("partNumber")) {
      return {
        error: {
          field: "partNumber",
          message: "Part number already exists",
        },
      };
    }
  }

  // Revalidate path and redirect
  revalidatePath("/dashboard/inventory");
}

// Helper function to upsert unit type
async function upsertUnitType(tx: Prisma.TransactionClient, unitType: Option | null) {
  if (!unitType) {
    // Handle the case where unitType is null, return null or a default value
    return null;
  }

  const { id } = await tx.unitType.upsert({
    where: { id: unitType?.value || "" },
    create: { name: unitType?.label },
    update: {},
  });

  // Correct the return value to unitTypeId
  return id;
}

// Helper function to upsert unit type
async function upsertManufacturer(tx: Prisma.TransactionClient, manufacturer: Option | null) {
  if (!manufacturer) {
    // Handle the case where unitType is null, return null or a default value
    return null;
  }

  const { id } = await tx.manufacturer.upsert({
    where: { id: manufacturer?.value || "" },
    create: { name: manufacturer?.label },
    update: {},
  });

  // Correct the return value to unitTypeId
  return id;
}

// Helper function to upsert item
async function upsertItem(tx: Prisma.TransactionClient, data: InventoryFormValues, unitTypeId: string | null) {
  const item = await tx.item.upsert({
    where: { id: data.id || "" },
    create: {
      partNumber: data.partNumber,
      name: data.name,
      description: data.description,
      categoryId: data.category?.value,
      unitTypeId: unitTypeId,
      quantity: 0
    },
    update: {
      partNumber: data.partNumber,
      name: data.name,
      description: data.description,
      categoryId: data.category?.value,
      unitTypeId: unitTypeId,
    }
  });
  return item;
}

// Helper function to handle inventory for each warehouse
async function upsertInventory(
  tx: Prisma.TransactionClient,
  itemId: string,
  data: InventoryFormValues
) {
  const inventoryPromises = data.inventory.map(async (inventoryData) => {
    // Skip if warehouse data is null
    if (inventoryData.warehouse === null) {
      console.log(`Skipping warehouse with id ${inventoryData.id} because it is null`);
      return;
    }

    const inventory = await tx.inventory.upsert({
      where: { id: inventoryData.id || "" },
      create: {
        quantity: inventoryData.quantity,
        reorderQuantity: inventoryData.reorderQuantity,
        lowStockLevel: inventoryData.lowStockLevel,
        unitCostDollar: inventoryData.unitCostDollar,
        unitCostVES: inventoryData.unitCostVES,
        location: inventoryData.location,
        itemId,
        warehouseId: inventoryData.warehouse.value,
      },
      update: {
        quantity: inventoryData.quantity,
        reorderQuantity: inventoryData.reorderQuantity,
        lowStockLevel: inventoryData.lowStockLevel,
        unitCostDollar: inventoryData.unitCostDollar,
        unitCostVES: inventoryData.unitCostVES,
        location: inventoryData.location,
      },
    });

    // Log the inventory transaction after the upsert
    return tx.receipt.create({
      data: {
        date: new Date(),
        description: "Initial Stock",
        qtyOrdered: inventoryData.quantity,
        qtyReceived: inventoryData.quantity,
        qtyRemaining: inventoryData.quantity,
        unitCostDollar: inventoryData.unitCostDollar,
        unitCostVES: inventoryData.unitCostVES,
        inventoryId: inventory.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });

  await Promise.all(inventoryPromises);
}

// Helper function to handle vendors
async function upsertVendors(
  tx: Prisma.TransactionClient,
  itemId: string,
  data: InventoryFormValues
) {
  // If there are no vendors to process, exit early.
  if (!data.vendors || data.vendors.length === 0) return;

  const vendorPromises = data.vendors.map(async (vendorData) => {

    const manufacturerId = await upsertManufacturer(tx, vendorData.manufacturer);

    // If an id exists, use upsert; otherwise, create a new record.
    if (vendorData.vendor?.value) {
      return tx.itemVendor.upsert({
        where: { id: vendorData.id },
        update: {
          vendorId: vendorData.vendor?.value,
          manufacturerId: manufacturerId,
          vendorPartNumber: vendorData.vendorPartNumber,
          barcode: vendorData.barcode,
        },
        create: {
          itemId,
          vendorId: vendorData.vendor?.value,
          manufacturerId: manufacturerId,
          vendorPartNumber: vendorData.vendorPartNumber,
          barcode: vendorData.barcode,
        }
      });
    }
  });

  await Promise.all(vendorPromises);
}

export async function deleteVendor(id: string) {
  try {
    // Delete the vendor by ID
    await prisma.itemVendor.delete({
      where: {
        id: id, // Deleting by unique `id`
      },
    });

    // Revalidate cache and return success response
    revalidatePath("/dashboard/vendors");
    return { 
      success: true, 
      message: "Vendor deleted successfully."
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        // Handle unique constraint errors
        const errors = error.meta.target.map((field: string) => {
          if (field === "email") {
            return {
              field: "email",
              message: "Email is already taken.",
            };
          } else if (field === "username") {
            return {
              field: "username",
              message: "Username is already taken.",
            };
          } else {
            return {
              field,
              message: `${field} is already taken.`,
            };
          }
        });

        return {
          success: false,
          error: errors,
        };
      }
    }

    // Catch-all error handler for other Prisma or runtime errors
    return {
      success: false,
      message: "An unexpected error occurred.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

////////////////////////////////////// RECEIPTS //////////////////////////////////////

export async function upsertReceipt(data: ReceiptFormValues) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!data.item || !data.item.value) {
        throw new Error("Item is required");
      }

      // If needed, calculate the difference in qtyReceived from a previous receipt.
      if (data.purchaseOrderId === null) {
        const previousReceipt = data.id
          ? await tx.receipt.findUnique({ where: { id: data.id } })
          : 0;
        const qtyDifference = previousReceipt
          ? data.qtyReceived - previousReceipt.qtyReceived
          : data.qtyReceived;

        await tx.inventory.update({
          where: { id: data.item.value },
          data: {
            quantity: { increment: qtyDifference },
          },
        });
      }

      // Upsert the receipt (create new or update existing)
      const receipt = await tx.receipt.upsert({
        where: { id: data.id || "" },
        update: {
          date: data.date,
          qtyOrdered: data.purchaseOrderId ? data.qtyOrdered : data.qtyReceived,
          qtyReceived: data.qtyReceived,
          qtyRemaining: data.purchaseOrderId ? data.qtyOrdered : data.qtyReceived, // Adjust if your business logic differs
          unitCostDollar: data.unitCostDollar,
          unitCostVES: data.unitCostVES,
          tax1: data.tax1,
          tax2: data.tax2,
          invoice: data.invoice,
          purchaseOrderId: data.purchaseOrderId,
          vendorId: data.vendor?.value ? data.vendor.value : null,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          inventoryId: data.item.value,
          date: data.date,
          qtyOrdered: data.purchaseOrderId ? data.qtyOrdered : data.qtyReceived,
          qtyReceived: data.qtyReceived,
          qtyRemaining: data.purchaseOrderId ? data.qtyOrdered : data.qtyReceived,
          unitCostDollar: data.unitCostDollar,
          unitCostVES: data.unitCostVES,
          tax1: data.tax1,
          tax2: data.tax2,
          invoice: data.invoice,
          purchaseOrderId: data.purchaseOrderId,
          vendorId: data.vendor?.value,
          description: data.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          date: true,
          purchaseOrderId: true,
          qtyOrdered: true,
          qtyReceived: true,
          unitCostDollar: true,
          unitCostVES: true,
          description: true,
          invoice: true,
          tax1: true,
          tax2: true,
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
          inventory: {
            select: {
              item: {
                select: {
                  id: true,
                  partNumber: true,
                  name: true,
                  description: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });

      // Map the receipt to match the expected structure.
      // Note that the top-level `item` is mapped from receipt.inventory.item,
      // and we transform vendor to include `value` and `label`.
      const mappedReceipt = {
        id: receipt.id,
        date: receipt.date,
        purchaseOrderId: receipt.purchaseOrderId,
        qtyOrdered: receipt.qtyOrdered,
        qtyReceived: receipt.qtyReceived,
        unitCostDollar: receipt.unitCostDollar,
        unitCostVES: receipt.unitCostVES,
        description: receipt.description,
        invoice: receipt.invoice,
        tax1: receipt.tax1,
        tax2: receipt.tax2,
        vendor: receipt.vendor
          ? {
              value: receipt.vendor.id,
              label: receipt.vendor.name,
            }
          : null,
        item: receipt.inventory?.item
          ? {
              description: receipt.inventory.item.description,
              value: receipt.inventory.item.id, // Using `id` as the value.
              label: receipt.inventory.item.partNumber, // Using `partNumber` as the label.
              name: receipt.inventory.item.name,
              quantity: receipt.inventory.item.quantity,
            }
          : null,
      };

      // Optionally revalidate the inventory path.
      revalidatePath("/dashboard/inventory");

      return mappedReceipt;
    });

    return {
      success: true,
      message: data.id
        ? "Receipt updated successfully."
        : "Receipt created successfully.",
      data: result,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations (e.g., P2002)
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => ({
          field,
          message: `${field} is taken`,
        }));
        return { error: errors };
      }
    }
    return {
      error: [{ message: "An unexpected error occurred." }],
    };
  }
}

export async function deleteReceipt(receiptId: string) {

}

////////////////////////////////////// ISSUANCES //////////////////////////////////////

// export async function createIssuance( data: IssuanceFormValues) {
//   try {
//     const result = await prisma.$transaction(async (tx) => {

//       if (data.item?.value == null || data.equipment?.value == null) {
//         throw new Error("Item and Equipment are required");
//       }

//       let qtyToIssue = data.qtyIssued; // Remaining quantity to issue

//       // Step 1: Fetch all receipts with remaining quantity, ordered by FIFO
//       const receipts = await tx.receipt.findMany({
//         where: {
//           inventoryId: data.item.value,
//           qtyRemaining: { gt: 0 },
//         },
//         orderBy: { createdAt: 'asc' }, // FIFO order
//       });

//       // Validation: Ensure there is enough total quantity to fulfill the issuance
//       const totalAvailableQty = receipts.reduce((sum, receipt) => sum + (receipt.qtyRemaining || 0), 0);
//       if (qtyToIssue > totalAvailableQty) {
//         throw new Error(
//           `Insufficient quantity available. Available: ${totalAvailableQty}, Requested: ${qtyToIssue}`
//         );
//       }

//       // Step 2: Deduct quantity from receipts
//       for (const receipt of receipts) {
//         if (qtyToIssue <= 0) break; // Stop if the requested quantity is fully issued

//         const qtyFromThisReceipt = Math.min(qtyToIssue, receipt.qtyRemaining ?? 0);
//         qtyToIssue -= qtyFromThisReceipt;

//         // Update the receipt's remaining quantity
//         await tx.receipt.update({
//           where: { id: receipt.id },
//           data: {
//             qtyRemaining: { decrement: qtyFromThisReceipt },
//           },
//         });

//         // Create Issuance Record
//         await tx.issuance.create({
//           data: {
//             equipmentId: data.equipment.value,
//             date: data.date,
//             description: data?.description,
//             qtyIssued: qtyFromThisReceipt, // Quantity issued from this receipt
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             inventoryId: data.item.value,
//             receiptId: receipt.id
//           },
//         });
//       }

//       // Step 3: Update Inventory Quantity
//       await tx.inventory.update({
//         where: {
//           id: data.item.value,
//         },
//         data: {
//           quantity: { decrement: data.qtyIssued },
//         },
//       });
      
//       revalidatePath('/dashboard/inventory');

//       return data.item.value; // Return the issuance record
//     });

//     // Revalidate inventory data path
//     return {
//       success: true,
//       message: "Issuance created successfully.",
//       id: result,
//     };
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       // Handle unique constraint violations (e.g., P2002)
//       if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
//         const errors = error.meta.target.map((field: string) => ({
//           field,
//           message: `${field} is taken`,
//         }));
//         return { error: errors };
//       }
//     }
//     return {
//       error: [{ message: "An unexpected error occurred." }],
//     };
//   }
// }

export async function createIssuance(data: IssuanceFormValues) {
  try {
    const issuanceRecords = await prisma.$transaction(async (tx) => {
      
      if (data.item?.value == null || data.equipment?.value == null) {
        throw new Error("Item and Equipment are required");
      }

      let qtyToIssue = data.qtyIssued; // Remaining quantity to issue

      // Step 1: Fetch all receipts with remaining quantity, ordered by FIFO
      const receipts = await tx.receipt.findMany({
        where: {
          inventoryId: data.item.value,
          qtyRemaining: { gt: 0 },
          OR: [
            { purchaseOrder: null },
            { purchaseOrder: { poStatus: 'Close' } }
          ]
        },
        orderBy: { createdAt: "asc" }, // FIFO order
      });

      // Validation: Ensure there is enough total quantity to fulfill the issuance
      const totalAvailableQty = receipts.reduce(
        (sum, receipt) => sum + (receipt.qtyRemaining || 0),
        0
      );
      if (qtyToIssue > totalAvailableQty) {
        throw new Error(
          `Insufficient quantity available. Available: ${totalAvailableQty}, Requested: ${qtyToIssue}`
        );
      }

      // Array to hold the created issuance records
      const createdIssuances = [];

      // Step 2: Deduct quantity from receipts and create issuance records
      for (const receipt of receipts) {
        if (qtyToIssue <= 0) break; // Stop if the requested quantity is fully issued

        const qtyFromThisReceipt = Math.min(qtyToIssue, receipt.qtyRemaining ?? 0);
        qtyToIssue -= qtyFromThisReceipt;

        // Update the receipt's remaining quantity
        await tx.receipt.update({
          where: { id: receipt.id },
          data: {
            qtyRemaining: { decrement: qtyFromThisReceipt },
          },
        });

        // Create Issuance Record and store it in the array
        const issuance = await tx.issuance.create({
          data: {
            equipmentId: data.equipment.value,
            date: data.date,
            description: data?.description,
            qtyIssued: qtyFromThisReceipt,
            unitCostDollar: data.item.unitCostDollar,
            unitCostVES: data.item.unitCostVES,
            createdAt: new Date(),
            updatedAt: new Date(),
            inventoryId: data.item.value,
            receiptId: receipt.id,
            workOrderTaskId: data.workOrderTaskId,
          },
          select: {
            id: true,
            date: true,
            qtyIssued: true,
            description: true,
            workOrderTaskId: true,
            equipment: {
              select: {
                id: true,
                unitNumber: true,
              }
            },
            inventory: {
              select: {
                id: true,
                quantity: true,
                location: true,
                warehouse: {
                  select: {
                    id: true,
                    name: true,
                  }
                },
                item:{ 
                  select: {
                    partNumber: true,
                    unitType: {
                      select: {
                        name: true,
                      }
                    }

                  }
                }
              }
            },
            receipt: {
              select: {
                id: true,
                qtyRemaining: true,
                unitCostDollar: true,
                unitCostVES: true,
                vendor: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        });
        createdIssuances.push(issuance);
      }

      // Step 3: Update Inventory Quantity
      await tx.inventory.update({
        where: {
          id: data.item.value,
        },
        data: {
          quantity: { decrement: data.qtyIssued },
        },
      });

      // Revalidate inventory path
      revalidatePath("/dashboard/inventory");

      // Return all created issuance records
      return createdIssuances;
    });

    // Map each issuance record to the desired item shape
    const mappedIssuances = issuanceRecords.map((issuance) => {
      // Get the first receipt record from the inventory join (if available)
      return {
        id: issuance.id,
        date: issuance.date,
        qtyIssued: issuance.qtyIssued,
        description: issuance.description,
        workOrderTaskId: issuance.workOrderTaskId,
        receiptId: issuance.receipt.id,
        equipment: issuance.equipment
          ? { value: issuance.equipment.id, label: issuance.equipment.unitNumber}
          : null,
        item: {
          value: issuance.inventory.id,
          label: issuance.inventory.item.partNumber,
          quantity: issuance.inventory.quantity,
          qtyRemaining: issuance.receipt.qtyRemaining,
          location: issuance.inventory.location,
          unitCostDollar: issuance.receipt.unitCostDollar,
          unitCostVES: issuance.receipt.unitCostVES,
          unitType: issuance.inventory.item.unitType?.name ?? '',
          vendor: issuance.receipt?.vendor?.name  ?? null,
          warehouse: issuance.inventory.warehouse.id,
        },
      };
    });

    return {
      success: true,
      message: "Issuance created successfully.",
      data: mappedIssuances,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations (e.g., P2002)
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => ({
          field,
          message: `${field} is taken`,
        }));
        return { error: errors };
      }
    }
    return {
      error: [{ message: "An unexpected error occurred." }],
    };
  }
}

export async function updateIssuance(data: IssuanceFormValues) {
  // Helper function to map raw issuance data to the expected structure.
  const mapIssuance = (issuance: any) => ({
    id: issuance.id,
    date: issuance.date,
    recurringTaskId: issuance.recurringTaskId,
    repairTaskId: issuance.repairTaskId,
    description: issuance.description,
    qtyIssued: issuance.qtyIssued,
    workOrderId: issuance.workOrderId,
    // Use receipt.id if available; if not, fallback to receiptId field.
    receiptId: issuance.receipt?.id ?? issuance.receiptId,
    equipment: issuance.equipment 
      ? { value: issuance.equipment.id, label: issuance.equipment.unitNumber } 
      : null,
    item: {
      value: issuance.inventory.id,
      label: issuance.inventory.item.partNumber,
      quantity: issuance.inventory.quantity,
      qtyRemaining: issuance.receipt.qtyRemaining,
      location: issuance.inventory.location,
      unitCostDollar: issuance.receipt.unitCostDollar,
      unitCostVES: issuance.receipt.unitCostVES,
      unitType: issuance.inventory.item.unitType?.name ?? '',
      vendor: issuance.receipt?.vendor?.name ?? null,
      warehouse: issuance.inventory.warehouse.id,
    },
  });

  try {
    // Ensure an issuance id is provided.
    if (!data.id) {
      throw new Error("Issuance id is required for update.");
    }

    // Fetch the existing issuance record with all required fields.
    const existingIssuance = await prisma.issuance.findUnique({
      where: { id: data.id },
      select: {
        qtyIssued: true,
        receipt: {
          select: {
            qtyRemaining: true,
          }
        }
      },
    });

    if (!existingIssuance) {
      throw new Error(`Issuance with id ${data.id} not found.`);
    }

    const previousQty = existingIssuance.qtyIssued;
    const requestedQty = data.qtyIssued;

    // Subtraction: Calculate the difference to reverse.
    const difference = previousQty - requestedQty;

    // Use a transaction to update the issuance, the receipt, and the inventory.
    const updatedIssuance = await prisma.$transaction(async (tx) => {
      const issuanceUpdate = await tx.issuance.update({
        where: { id: data.id },
        data: {
          qtyIssued: data.qtyIssued,
          updatedAt: new Date(),
          receipt: {
            update: {
              qtyRemaining: { increment: difference },
            }
          },
          inventory: {
            update: {
              quantity: { increment: difference },
            }
          }
        },
        select: {
          id: true,
          date: true,
          workOrderTaskId: true,
          receiptId: true,
          description: true,
          qtyIssued: true,
          equipment: {
            select: {
              id: true,
              unitNumber: true,
            },
          },
          inventory: {
            select: {
              id: true,
              quantity: true,
              location: true,
              warehouse: {
                select: {
                  id: true,
                  name: true,
                },
              },
              item: {
                select: {
                  partNumber: true,
                  unitType: {
                    select: { name: true },
                  },
                },
              },
            },
          },
          receipt: {
            select: {
              id: true,
              qtyRemaining: true,
              unitCostDollar: true,
              unitCostVES: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return issuanceUpdate;
    });

     // Ensure that updatedIssuance is defined before mapping.
     if (!updatedIssuance) {
      throw new Error("Issuance update failed: no record returned.");
    }

    return {
      success: true,
      message: `Issuance decreased by ${difference} unit(s).`,
      data: mapIssuance(updatedIssuance),
    };

  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => ({
          field,
          message: `${field} is taken`,
        }));
        return { error: errors };
      }
    }
    return {
      error: [{ message: "An unexpected error occurred." }],
    };
  }
}

export async function deleteIssuance(data: IssuanceFormValues) {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete the issuance record
      await tx.issuance.delete({
        where: { id: data.id },
      });

      // Optionally update the inventory quantity if needed.
      // Uncomment and adjust the following code if inventory updates are required.
      await tx.inventory.update({
        where: { id: data.item.value },
        data: {
          quantity: { increment: data.qtyIssued },
          receipts: {
            update: {
              where: { id: data.receiptId },
              data: {
                qtyRemaining: { increment: data.qtyIssued },
              },
            },
          }
        },
      });
    });

    return {
      success: true,
      message: "Issuance deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting issuance:", error);
    throw error;
  }
}

// Define the response type for clarity
type IssuanceResponse = {
  action: "addition" | "subtraction";
  success: boolean;
  message: string;
  data: any; // This can be an array or an object.
  error?: { field: string; message: string }[];
};

export async function upsertIssuance(data: IssuanceFormValues): Promise<IssuanceResponse> {

  const mapIssuance = (issuance: any) => ({
    id: issuance.id,
    date: issuance.date,
    recurringTaskId: issuance.recurringTaskId,
    repairTaskId: issuance.repairTaskId,
    description: issuance.description,
    qtyIssued: issuance.qtyIssued,
    workOrderId: issuance.workOrderId,
    // Use receipt.id if available; if not, fallback to receiptId field.
    receiptId: issuance.receipt?.id ?? issuance.receiptId,
    equipment: issuance.equipment 
      ? { value: issuance.equipment.id, label: issuance.equipment.unitNumber } 
      : null,
    item: {
      value: issuance.inventory.id,
      label: issuance.inventory.item.partNumber,
      quantity: issuance.inventory.quantity,
      qtyRemaining: issuance.receipt.qtyRemaining,
      location: issuance.inventory.location,
      unitCostDollar: issuance.receipt.unitCostDollar,
      unitCostVES: issuance.receipt.unitCostVES,
      unitType: issuance.inventory.item.unitType?.name ?? '',
      vendor: issuance.receipt?.vendor?.name ?? null,
      warehouse: issuance.inventory.warehouse.id,
    },
  });

  try {
    // Attempt to fetch an existing issuance record by its id.
    const existingIssuance = await prisma.issuance.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        date: true,
        workOrderTaskId: true,
        description: true,
        qtyIssued: true,
        equipment: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        inventory: {
          select: {
            id: true,
            quantity: true,
            location: true,
            warehouse: {
              select: {
                id: true,
                name: true,
              },
            },
            item: {
              select: {
                partNumber: true,
                unitType: {
                  select: { name: true },
                },
              },
            },
          },
        },
        receipt: {
          select: {
            id: true,
            qtyReceived: true,
            qtyRemaining: true,
            unitCostDollar: true,
            unitCostVES: true,
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If no issuance exists, call createIssuance which returns an array.
    if (!existingIssuance) {
      const newIssuance = await createIssuance(data);

      if (!newIssuance) {
        throw new Error("Issuance creation failed: no record returned.");
      }

      // Here, newIssuance.data is expected to be an array.
      return {
        success: true,
        message: `Issuance created successfully.`,
        data: newIssuance.data,
        action: "addition",
      };
    } else {

      if ((data.qtyIssued - existingIssuance.qtyIssued) > existingIssuance.receipt.qtyRemaining) {

        const qtyToFillReceipt = existingIssuance.receipt.qtyReceived;
        const newQtyIssued = data.qtyIssued - existingIssuance.receipt.qtyReceived;
      
        const updatedIssaunce = await updateIssuance({...data, qtyIssued: qtyToFillReceipt});
        const increasedIssuance = await createIssuance({ ...data, qtyIssued: newQtyIssued });

        // Default to an empty array if increasedIssuance.data is undefined.
        const newIssuanceRecords = increasedIssuance.data || [];
        // const combinedIssuances = [mapIssuance(existingIssuance), ...newIssuanceRecords];

        const combinedIssuances = [updatedIssaunce.data, ...newIssuanceRecords];

      
        // // Optionally, combine records with the same receiptId.
        // const groupedIssuances = Object.values(
        //   combinedIssuances.reduce((acc, issuance) => {
        //     const key = issuance.receiptId;
        //     if (acc[key]) {
        //       // For example, sum the issued quantities.
        //       acc[key].qtyIssued += issuance.qtyIssued;
        //     } else {
        //       acc[key] = { ...issuance };
        //     }
        //     return acc;
        //   }, {} as Record<string, typeof combinedIssuances[number]>)
        // );

        return {
          success: true,
          message: "Issuance updated successfully.",
          data: combinedIssuances, // or simply combinedIssuances if no grouping is needed.
          action: "addition",
        };
      } else if ((data.qtyIssued - existingIssuance.qtyIssued) < existingIssuance.receipt.qtyRemaining) {
        //If an issuance exists, call updateIssuance which returns an object.
        const increasedIssuance = await updateIssuance(data);

        if (!increasedIssuance) {
          throw new Error("Issuance update failed: no record returned.");
        }

        return {
          success: true,
          message: `Issuance updated successfully.`,
          data: increasedIssuance.data,
          action: "subtraction",
        };
      } else {
        //If an issuance exists, call updateIssuance which returns an object.
        const decreasedIssuance = await updateIssuance(data);

        if (!decreasedIssuance) {
          throw new Error("Issuance update failed: no record returned.");
        }

        // Here, decreasedIssuance.data is expected to be an object.
        return {
          success: true,
          message: `Issuance updated successfully.`,
          data: decreasedIssuance.data,
          action: "subtraction",
        };
      }
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations (e.g., P2002)
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => ({
          field,
          message: `${field} is taken`,
        }));
        return {
          success: false,
          message: "Unique constraint error",
          data: null,
          action: "addition", // Default value when error occurs
          error: errors,
        };
      }
    }
    // Provide a complete error response with all required properties.
    return {
      success: false,
      message: "An unexpected error occurred.",
      data: null,
      action: "addition", // Default value when error occurs
      error: [{ field: "unknown", message: "An unexpected error occurred." }],
    };
  }
}

export async function upsertLabor(data: LaborFormValues) {
  try {

    if (!data.employee.value){
      throw new Error("Employee is required");
    }

    const laborData = await prisma.$transaction(async (tx) => {
      // Update the purchase order tax field
      const labor = await tx.labor.upsert({
        where: { id: data.id },
        update: {
          employeeId: data.employee.value,
          hours: data.hours,
          laborRate: data.laborRate,
        },
        create: {
          employeeId: data.employee.value,
          date: new Date(),
          hours: data.hours,
          laborRate: data.laborRate,
          workOrderTaskId: data.workOrderTaskId,
        },
        select: {
          id: true,
          date: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          hours: true,
          laborRate: true,
          workOrderTaskId: true,
        }
      });

      const mappedLabor = {
        id: labor.id,
        date: labor.date,
        employee: {
          value: labor.employee.id,
          label: `${labor.employee.firstName} ${labor.employee.lastName}`,
          laborRate: labor.laborRate,
        },
        hours: labor.hours,
        laborRate: labor.laborRate,
        workOrderTaskId: labor.workOrderTaskId
      }

      return mappedLabor;
    });

    revalidatePath(`/dashboard/workorders`);

    return {
      success: true,
      message: "Labor updated successfully.",
      data: laborData
    };
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => ({
          field,
          message: `${field} is taken`,
        }));
        return { error: errors };
      }
    }
    return {
      error: [{ message: "An unexpected error occurred." }],
    };
  }
}

export async function deleteLabor(data: LaborFormValues) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.labor.delete({
        where: {
          id: data.id,
        },
      });
    });
    
    revalidatePath(`/dashboard/workorders`);

    return {
      success: true,
      message: "Labor deleted successfully.",
    };
  } catch (error) {
    console.error("Error adding order items to purchase order:", error);
    throw new Error("Failed to add order items to purchase order.");
  }
}

////////////////////////////////// PURCHASE ORDERS //////////////////////////////////

export async function createPurchaseOrder(data: PurchaseOrderFormValues) {
  try {
    const purchaseOrder = await prisma.$transaction(async (tx) => {

      // Create or find the terms
      const terms = await handleTermCreation(tx, data.terms)

      // Create a new purchase order
      return await tx.purchaseOrder.upsert({
        where: {
          id: data.id || "",
        },
        update: {
          warehouseId: data.warehouse?.value,
          vendorId: data.vendor?.value,
          dateOpened: data.dateOpened,
          dateRequired: data.dateRequired,
          termsId: terms,
          shipVia: data.shipVia?.value as Shipping, // Cast to enum type
          invoice: data.invoice,
          workOrder: data.workOrder,
          notes: data.notes,
          poStatus: data.poStatus as StatusType, // Cast to enum type
          buyerId: data.buyer?.value,
          taxBy: data.taxBy.value as TaxBy, // Cast to enum type
          tax1: data.tax1,
          tax2: data.tax2,
          freight: data.freight
        },
        create: {
          warehouseId: data.warehouse?.value ?? '',
          vendorId: data.vendor?.value,
          dateOpened: data.dateOpened,
          dateRequired: data.dateRequired,
          termsId: terms,
          shipVia: data.shipVia?.value as Shipping,
          invoice: data.invoice,
          workOrder: data.workOrder,
          notes: data.notes,
          poStatus: data.poStatus as StatusType,
          buyerId: data.buyer?.value,
          taxBy: data.taxBy.value as TaxBy,
          tax1: data.tax1,
          tax2: data.tax2,
          freight: data.freight
        },
      });
    });
    revalidatePath("/dashboard/purchaseorders");
    return {
      success: true,
      message: "Purchase order created successfully.",
      id: purchaseOrder.id,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => {
          if (field === "email") {
            return {
              field: "email",
              message: "Email is taken",
            };
          } else if (field === "username") {
            return {
              field: "username",
              message: "Username is taken",
            };
          } else {
            return {
              field,
              message: `${field} is taken`,
            };
          }
        });

        return {
          error: errors,
        };
      }
    }
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.delete({
        where: {
          id: id ,
        },
      });
    });
    
    revalidatePath(`/dashboard/purchaseorders`);

    return {
      success: true,
      message: "Purchase order status updated successfully.",
    };
  } catch (error) {
    console.error("Error adding order items to purchase order:", error);
    throw new Error("Failed to add order items to purchase order.");
  }
}

async function handleTermCreation(
  tx: Prisma.TransactionClient,
  data: { value: string; label: string } | null
) {
  // Check if data is null or value is null
  if (!data || !data.value) {
    return null;
  }

  // Perform the upsert operation
  const term = await tx.terms.upsert({
    where: { id: data.value },
    create: { name: data.label },
    update: {},
  });

  // Return the ID of the created or updated term
  return term.id;
}

export async function deleteItem(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.receipt.delete({
        where: {
          id: id ,
        },
      });
    });
  } catch (error) {
    console.error("Error adding order items to purchase order:", error);
    throw new Error("Failed to add order items to purchase order.");
  }

  revalidatePath(`/dashboard/purchaseorders`);
}

interface UpsertTaxParams {
  tax: number;
  taxField: "tax1" | "tax2";
  purchaseOrderId?: string;
  workOrderId?: string;
}

export async function upsertTax({
  tax,
  taxField,
  purchaseOrderId,
  workOrderId,
}: UpsertTaxParams) {
  if (!purchaseOrderId && !workOrderId) {
    throw new Error("Either purchaseOrderId or workOrderId must be provided.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (purchaseOrderId) {
        await tx.purchaseOrder.update({
          where: { id: purchaseOrderId },
          data: { [taxField]: tax },
        });

        await tx.receipt.updateMany({
          where: { purchaseOrderId },
          data: { [taxField]: tax },
        });
      } else if (workOrderId) {
        await tx.workOrder.update({
          where: { id: workOrderId },
          data: { [taxField]: tax },
        });
      }
    });

    revalidatePath(
      purchaseOrderId ? `/dashboard/purchaseorders` : `/dashboard/workorders`
    );

    return {
      success: true,
      message: "Tax updated successfully.",
    };
  } catch (error) {
    console.error("Error updating tax:", error);
    throw new Error("Failed to update tax.");
  }
}

export async function upsertTaxBy(
  purchaseOrderId: string,
  taxBy: TaxBy
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update the purchase order tax field
      const taxByResponse = await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          taxBy: taxBy, // computed property to update either tax1 or tax2
        },
        select: {
          taxBy: true,
        }
      });

      return taxByResponse;
    });

    revalidatePath(`/dashboard/purchaseorders`);

    return {
      success: true,
      message: "TaxBy updated successfully.",
      taxBy: {
        value: result.taxBy,
        label: result.taxBy,
      }
    };
  } catch (error) {
    console.error("Error updating tax:", error);
    throw new Error("Failed to update tax.");
  }
}

export async function upsertFreight(
  purchaseOrderId: string,
  freight: number
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update the purchase order tax field
      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          freight: freight, // computed property to update either tax1 or tax2
        },
      });
    });

    revalidatePath(`/dashboard/purchaseorders`);

    return {
      success: true,
      message: "Freight updated successfully.",
    };
  } catch (error) {
    console.error("Error updating freight:", error);
    throw new Error("Failed to update freight.");
  }
}


export async function updatePOStatus(id: string, status: StatusType): Promise<{ success: boolean; message: string; data: StatusType }> {
  try {
     const result = await prisma.$transaction(async (tx) => {
      const poStatus = await tx.purchaseOrder.update({
        where: {
          id: id,
        },
        data: {
          poStatus: status,
        },
        select: {
          poStatus: true
        }
      });

      return poStatus;
    });

    return {
      success: true,
      message: "Purchase order status updated successfully.",
      data: result.poStatus
    };
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    throw new Error("Failed to update purchase order status.");
  }
}

export async function closePurchaseOrder(receipts: any) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update each receipt to set qtyReceived to qtyOrdered
      for (const receipt of receipts) {
        await tx.receipt.update({
          where: {
            id: receipt.id,
          },
          data: {
            qtyRemaining: receipt.qtyOrdered,
          },
        });
      }

      // await updatePOStatus(receipts[0].purchaseOrderId, "Closed" as StatusType);

    });

    revalidatePath(`/dashboard/purchaseorders/${receipts[0].purchaseOrderId}`);

    return {
      success: true,
      message: "Purchase order and receipts updated successfully.",
    };
  } catch (error) {
    console.error("Error closing purchase order:", error);
    throw new Error("Failed to close purchase order.");
  }
}

/////////////////////////////////// WORK ORDERS /////////////////////////////////////

export async function upsertWorkOrderType(
  purchaseOrderId: string,
  taxBy: TaxBy
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update the purchase order tax field
      const taxByResponse = await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          taxBy: taxBy, // computed property to update either tax1 or tax2
        },
        select: {
          taxBy: true,
        }
      });

      return taxByResponse;
    });

    revalidatePath(`/dashboard/purchaseorders`);

    return {
      success: true,
      message: "TaxBy updated successfully.",
      taxBy: {
        value: result.taxBy,
        label: result.taxBy,
      }
    };
  } catch (error) {
    console.error("Error updating tax:", error);
    throw new Error("Failed to update tax.");
  }
}

export async function createWorkOrder(data: WorkOrderFormValues) {
  try {
    const workOrder = await prisma.$transaction(async (tx) => {
      if (!data.equipment?.value) {
        throw new Error("Equipment and Employee are required");
      }

      // 1. Create the work order record
      const createdWorkOrder = await tx.workOrder.create({
        data: {
          equipmentId: data.equipment.value,
          employeeId: data.employee?.value ?? null,
          scheduled: data.scheduled,
          due: data.due,
          priority: data.priority?.value as Priority,
          workOrderType: data.workOrderType?.value,
          notes: data.notes,
          woStatus: "Open",
          tax1: 0,
          tax2: 0,
          primaryMeterReading: data.primaryMeterReading,
          secondaryMeterReading: data.secondaryMeterReading,
        },
      });

      const tasksToCreate: {
        workOrderId: string;
        recurringTaskId?: string;
        repairTaskId?: string;
        completed: boolean;
      }[] = [];

      for (const taskEntry of data.tasks) {
        const { id, task } = taskEntry;

        if (!task?.taskType || !task.task?.value) continue;

        if (task.taskType === "Repair") {
          if (!task.task?.value) {
            throw new Error("Missing task value for Repair task");
          }

          let repairTaskId = task.task.value;

          // If the task is new and has no ID, create it first
          if (!taskEntry.id) {
            const createdRepairTask = await createRepairTask({
              id: "",
              taskType: { value: task.taskType, label: task.taskType },
              priority: {
                value: 'Normal',
                label: 'Normal'
              },
              equipment: data.equipment,
              repairType: null, // or taskEntry.repairType if available
              task: task.task,
              taskTracking: task.taskTracking,
              employee: null,
              notes: null,
            }, tx);

            if ("error" in createdRepairTask) {
              throw new Error("Failed to create repair task");
            } else {
              repairTaskId = createdRepairTask.id;
            }            
          }

          tasksToCreate.push({
            workOrderId: createdWorkOrder.id,
            repairTaskId: repairTaskId,
            completed: false,
          });

        } else if (task.taskType === "Recurring") {
          if (!task.task?.value) {
            throw new Error("Missing task value for Recurring task");
          }

          tasksToCreate.push({
            workOrderId: createdWorkOrder.id,
            recurringTaskId: id,
            completed: false,
          });
        }
      }

      console.log("Tasks to create:", tasksToCreate);

      // Bulk create all tasks
      if (tasksToCreate.length > 0) {
        await tx.workOrderTask.createMany({
          data: tasksToCreate,
        });
      }

      return createdWorkOrder;
    });

    revalidatePath("/dashboard/workorders");

    return {
      success: true,
      message: "Work order created successfully.",
      id: workOrder.id,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => {
          if (field === "email") {
            return { field: "email", message: "Email is taken" };
          } else if (field === "username") {
            return { field: "username", message: "Username is taken" };
          } else {
            return { field, message: `${field} is taken` };
          }
        });
        return { error: errors };
      }
    }
    throw error;
  }
}

export async function createWorkOrderTask(data: WorkOrderTask) {
  try {
    const workOrderTask = await prisma.$transaction(async (tx) => {
      // Create a new work order task
      const createdWorkOrderTask = await tx.workOrderTask.create({
        data: {
          workOrderId: data.workOrderId, // Replace with actual work order ID
          recurringTaskId: data.recurringTaskId, // Replace with actual recurring task ID
          repairTaskId: data.repairTaskId, // Replace with actual repair task ID
          completed: false,
        },
        select: {
          id: true,
          workOrderId: true,
          recurringTask: true,
          repairTask: {
            select: {
              task: {
                select: {
                  id: true,
                  description: true,
                }
              },
              taskTracking: true,
              priority: true,
            }
          },
          completed: true,
        }
      });

      return createdWorkOrderTask;
    });

    return workOrderTask;
    
  } catch (error) {
    console.error("Error creating work order task:", error);
    throw error;
  }
}

export async function deleteWorkOrderTask(data: WorkOrderFormValues["tasks"][number]) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete all issuance (parts) related to this task
      for (const part of data.parts) {
        await deleteIssuance(part);
      }

      // 2. Get the work order task including repair task
      const workOrderTask = await tx.workOrderTask.findUnique({
        where: { id: data.id },
        include: { repairTask: true },
      });

      // 3. Conditionally delete the repair task
      if (workOrderTask?.repairTask && workOrderTask.repairTask.employeeId == null) {
        await tx.repairTask.delete({
          where: { id: workOrderTask.repairTask.id },
        });
      }

      // 4. Delete the work order task
      await tx.workOrderTask.delete({
        where: { id: data.id },
      });
    });

    revalidatePath(`/dashboard/workorders`);

    return {
      success: true,
      message: "Work order task and associated parts deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting work order task:", error);
    throw error;
  }
}


export async function upsertMeter(
  workOrderId: string,
  meter: number,
  field: "primaryMeterReading" | "secondaryMeterReading"
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update the purchase order tax field
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          [field]: meter, // computed property to update either tax1 or tax2
        },
      });
    });

    revalidatePath(`/dashboard/workorders`);

    return {
      success: true,
      message: "Meter updated successfully.",
    };
  } catch (error) {
    console.error("Error updating tax:", error);
    throw new Error("Failed to update tax.");
  }
}

export async function upsertComplete(
  workOrderTaskId: string,
  status: boolean
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update the purchase order tax field
      await tx.workOrderTask.update({
        where: { id: workOrderTaskId },
        data: {
          completed: status, // computed property to update either tax1 or tax2
        },
      });
    });

    revalidatePath(`/dashboard/workorders`);

    return {
      success: true,
      message: "Meter updated successfully.",
    };
  } catch (error) {
    console.error("Error updating tax:", error);
    throw new Error("Failed to update tax.");
  }
}

export async function upsertWOStatus(id: string, status: WorkOrderStatus): Promise<{ success: boolean; message: string; data: WorkOrderStatus }> {
  try {
     const result = await prisma.$transaction(async (tx) => {
      const poStatus = await tx.workOrder.update({
        where: {
          id: id,
        },
        data: {
          woStatus: status,
          dateStarted: new Date(),
          dateCompleted: status === "Complete" ? new Date() : null,
        },
        select: {
          woStatus: true,

        }
      });

      return poStatus;
    });

    return {
      success: true,
      message: "Purchase order status updated successfully.",
      data: result.woStatus
    };
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    throw new Error("Failed to update purchase order status.");
  }
}

export async function closeWorkOrder(data: WorkOrderFormValues) {
  try {
    await prisma.$transaction(async (tx) => {
      // Ensure the work order exists before updating
      const workOrder = await tx.workOrder.findUnique({
        where: { id: data.id },
      });

      if (!workOrder) {
        throw new Error("Work order not found.");
      }

      // ✅ Update WorkOrder & its Equipment with new meter readings
      await tx.workOrder.update({
        where: { id: data.id },
        data: {
          equipment: {
            update: {
              primaryMeterReading: data.primaryMeterReading,
              secondaryMeterReading: data.secondaryMeterReading,
            },
          },
          primaryMeterReading: data.primaryMeterReading,
          secondaryMeterReading: data.secondaryMeterReading,
        },
      });

      // ✅ Find all WorkOrderTasks linked to this WorkOrder
      const workOrderTasks = await tx.workOrderTask.findMany({
        where: { workOrderId: data.id },
        include: {
          recurringTask: {
            include: {
              taskTracking: true,
            },
          },
        },
      });

      // ✅ Update task tracking & set all tasks to completed
      for (const task of workOrderTasks) {
        if (task.recurringTask?.taskTracking) {
          await tx.taskTracking.update({
            where: { id: task.recurringTask.taskTracking.id },
            data: {
              primaryLastPerformed: data.primaryMeterReading,
              secondaryLastPerformed: data.secondaryMeterReading,
            },
          });
        }

        // ✅ Mark the task as completed
        await tx.workOrderTask.update({
          where: { id: task.id },
          data: {
            completed: true,
          },
        });
      }
    });

    return {
      success: true,
      message: `Work order ${data.id} closed successfully. All tasks marked as completed.`
    };
  } catch (error) {
    console.error("Error closing work order:", error);
    throw new Error("Failed to close work order.");
  }
}

/////////////////////////////////// EMPLOYEE /////////////////////////////////////

export async function createEmployee(data: EmployeeFormValues) {
  try {
    const employee = await prisma.$transaction(async (tx) => {
      // Create a new employee
      return await tx.employee.upsert({
        where: {
          id: data.id || "",
        },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          employeeStatus: data.employeeStatus?.value,
          laborRate: data.laborRate,
          email: data.email,
          adminType: data.adminType?.value,
          loginAllowed: data.loginAllowed,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          employeeStatus: data.employeeStatus?.value || 'Active',
          laborRate: data.laborRate,
          email: data.email,
          adminType: data.adminType?.value || 'Operator',
          loginAllowed: data.loginAllowed,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });
    });
    revalidatePath("/dashboard/employees");
    return { 
      success: true, 
      message: "Employee added successfully.", 
      id: employee.id 
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        const errors = error.meta.target.map((field: string) => {
          if (field === "email") {
            return {
              field: "email",
              message: "Email is taken",
            };
          } else if (field === "username") {
            return {
              field: "username",
              message: "Username is taken",
            };
          } else {
            return {
              field,
              message: `${field} is taken`,
            };
          }
        });

        return {
          error: errors,
        };
      }
    }

    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   if (error.code === 'P2002' && error.meta?.target?.includes("email")) {
    //     // Return an error object with the relevant information
    //     return {
    //       error: {
    //         field: 'email',
    //         message: 'Email is taken',
    //       },
    //     };
    //   }
    // }
    // if (error.code === "P2002" && error.meta?.target?.includes("email")) {
    //   // Return an error object with the relevant information
    //   return {
    //     error: {
    //       field: "email",
    //       message: "Email is taken",
    //     },
    //   };
    // }
  }

  // revalidatePath("/dashboard/vendors");

  // return true
  // redirect("/dashboard/vendors");
}

////////////////////////////////////// VENDORS ////////////////////////////////////////

export async function createVendor(data: VendorFormValues) {
  try {
    const vendor = await prisma.$transaction(async (tx) => {
      return await tx.vendor.upsert({
        where: {
          id: data.id || "", // For upsert, using id to check if updating or creating
        },
        update: {
          name: data.name.toUpperCase(),
          contact: data.contact,
          vendorType: data.vendorType?.value || "Supplier",
          phone: data.phone,
          keywords: data.keywords,
          address: data.address,
        },
        create: {
          name: data.name.toUpperCase(),
          contact: data.contact,
          vendorType: data.vendorType?.value || "Supplier",
          phone: data.phone,
          keywords: data.keywords,
          address: data.address,
        },
      });
    });

    // Trigger page revalidation after successful vendor creation/updating
    revalidatePath("/dashboard/vendors");
    // redirect(`/dashboard/vendors/${vendor.id}`);


    // Return success response with vendor id and message
    return {
      success: true,
      message: data.id ? "Vendor updated successfully." : "Vendor created successfully.",
      id: vendor.id
    };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation (error code: P2002)
      if (error.code === "P2002" && Array.isArray(error.meta?.target)) {
        // Map the fields from error.meta.target to custom messages
        const errors = error.meta.target.map((field: string ) => {
          return {
            field,
            message: `${field} is taken`,
          };
        });

        // Return formatted error list
        return {
          error: errors,
        };
      }
    }

    // Return generic error if not handled above
    return {
      error: [{ message: "An unexpected error occurred." }]
    };
  }
}