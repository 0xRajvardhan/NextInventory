"use server";

import { unstable_noStore as noStore } from "next/cache";
import prisma from "./prisma";
import {
  MeterReading,
  Priority,
  TaskType,
} from "@prisma/client/wasm";
import { VendorType } from "@prisma/client/wasm";
import { LaborFormValues, Option } from "./definitions";
import { formatLabel } from "./utils";
import { isTaskDue } from "../ui/components/isDue";
import { IssuanceFormValues } from "./definitions";



const ITEMS_PER_PAGE = 5;


//////////////////////////////////// EQUIPMENT //////////////////////////////////

export async function fetchFilteredEquipmet(
  query: string,
  currentPage: number
) {
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const equipments = await prisma.equipment.findMany({
      where: {
        OR: [
          { unitNumber: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          { description: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
        ],
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      include: {
        equipmentType: {
          select: {
            name: true,
          },
        },
        make: {
          select: {
            name: true,
          },
        },
        model: {
          select: {
            name: true,
          },
        },
      },
    });

    return equipments;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw new Error("Failed to fetch filtered products.");
  }
}

export async function fetchEquipmentPages(query: string) {
  try {
    const count = await prisma.equipment.count({
      where: {
        OR: [
          { unitNumber: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          { description: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
        ],
      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Error fetching total number of inventory items:", error);
    throw new Error("Failed to fetch total number of inventory items.");
  }
}

export async function fetchEquipmentById(id: string) {
  noStore();
  try {
    // Retrieve the equipment information by ID
    const equipment = await prisma.equipment.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        unitNumber: true,
        description: true,
        year: true,
        keywords: true,
        serial: true,
        tag: true,
        meterTracking: true,
        make: {
          select: {
            id: true,
            name: true,
          },
        },
        model: {
          select: {
            id: true,
            name: true,
          },
        },
        equipmentType: true,
        primaryMeter: true,
        primaryMeterReading: true,
        secondaryMeter: true,
        secondaryMeterReading: true,
        repairTask: {
          select: {
            id: true,
            equipmentId: true,
            taskId: true,
            // dueBy: true,
            employeeId: true,
            taskType: true,
            repairTypeId: true,
            priority: true,
            notes: true,
            equipment: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
            task: {
              select: {
                id: true,
                description: true,
              },
            },
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            repairType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        recurringTask: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!equipment) {
      return null;
    }

    // Transform make, model, and other fields into value-label format
    const transformedEquipment = {
      ...equipment,
      equipmentType: equipment.equipmentType
        ? { value: equipment.equipmentType.id, label: equipment.equipmentType.name }
        : null,
      make: equipment.make
        ? { value: equipment.make.id, label: equipment.make.name }
        : null,
      model: equipment.model
        ? { value: equipment.model.id, label: equipment.model.name }
        : null,
      primaryMeter: equipment.primaryMeter
        ? { value: equipment.primaryMeter, label: equipment.primaryMeter }
        : null,
      secondaryMeter: equipment.secondaryMeter
        ? { value: equipment.secondaryMeter, label: equipment.secondaryMeter }
        : null,
      repairTask: equipment.repairTask.map(task => ({
        id: task.id,
        taskType: { value: task.taskType, label: task.taskType },
        priority: { value: task.priority, label: task.priority },
        // dueBy: task.dueBy,
        notes: task.notes,
        equipment: task.equipment
          ? { value: task.equipment.id, label: task.equipment.unitNumber }
          : { value: "unknown", label: "Unknown Equipment" }, // Provide default
        task: task.task
          ? { value: task.task.id, label: task.task.description }
          : { value: "unknown", label: "Unknown Task" }, // Provide default
        employee: task.employee
          ? { value: task.employee.id, label: `${task.employee.firstName} ${task.employee.lastName}` }
          : { value: "unknown", label: "Unknown Employee" }, // Provide default
        repairType: task.repairType
          ? { value: task.repairType.id, label: task.repairType.name }
          : { value: "unknown", label: "Unknown Repair Type" }, // Provide default
      })),
    };

    return transformedEquipment;
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    throw error;
  }
}

export async function fetchEquipment(): Promise<Option[]> {
  try {
    const equipmentData = await prisma.equipment.findMany({
      select: {
        id: true,
        unitNumber: true,
      },
    });
    const equipments = equipmentData.map((equipment) => ({
      value: equipment.id, // Assuming id is a string, map it directly
      label: equipment.unitNumber, // Map unitNumber as label
    }));

    return equipments ;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw new Error("Failed to fetch equipment.");
  }
}

//////////////////////////////////// EQUIPMENT HELPERS //////////////////////////////////

export async function fetchEquipmentType(query: string): Promise<Option[]> {
  try {
    const equipmentTypeData = await prisma.equipmentType.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive' // Case-insensitive search
        }
      }
    });

    // Map the employees to the desired format
    const equipmentType = equipmentTypeData.map((equipmentType) => ({
      value: equipmentType.id, // Assuming `id` is a string
      label: equipmentType.name, // Combine first and last name
    }));


    return equipmentType;
  } catch (error) {
    console.error("Error fetching equipmentType:", error);
    throw new Error("Failed to fetch equipmentType.");
  }
}

export async function fetchMake(query: string): Promise<Option[]> {
  try {
    // Fetch employees from the database
    const makeData = await prisma.make.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    // Map the employees to the desired format
    const make = makeData.map((make) => ({
      value: make.id, // Assuming `id` is a string
      label: make.name, // Combine first and last name
    }));

    return make; // Return the filtered employees array directly
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees.");
  }
}

export async function fetchModel(query: string): Promise<Option[]> {
  try {
    // Fetch employees from the database
    const modelData = await prisma.model.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    // Map the employees to the desired format
    const model = modelData.map((model) => ({
      value: model.id, // Assuming `id` is a string
      label: model.name, // Combine first and last name
    }));

    return model; // Return the filtered employees array directly
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees.");
  }
}

export async function fetchEquipmentPartsById(id: string) {
  noStore(); // Ensure no caching if required
  try {
    const parts = await prisma.taskItem.findMany({
      // where: { id:  },
      select: {
        id: true,
        inventory: {
          select: {
            item: {
              select: {
                id: true,
                name: true,
                partNumber: true,
              },
            },
          },
        },
        quantity: true,
      },
    });

    if (!parts || parts.length === 0) {
      return [];
    }

    return parts;
  } catch (error) {
    console.error("Error fetching equipment parts:", error);
    throw error;
  }
}

//////////////////////////////////// TASKS //////////////////////////////////

export async function fetchTasks(query: string): Promise<Option[]> {
  try {
    // Fetch all tasks from the database
    const tasksData = await prisma.task.findMany({
      where: {
        description: {
          contains: query, // Filter tasks by description containing inputValue
          mode: 'insensitive',  // Case-insensitive search (optional)
        },
      },
    });

    // Map the tasks to the desired format
    const tasks = tasksData.map((task) => ({
      value: task.id,        // Assuming id is a string, map it directly
      label: task.description, // Map description as label
    }));

    return tasks; // Return the filtered tasks array directly
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks.");
  }
}

export async function fetchTasksByEquipmentId(equipmentId: string, query: string, currentPage: number) {
  noStore();

  try {
    const ITEMS_PER_PAGE = 10; 
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const tasks = await prisma.taskTracking.findMany({
      where: {
        OR: [
          {
            recurringTask: {
              equipmentId: equipmentId,
              task: {
                description: { contains: query, mode: "insensitive" },
              },
            },
          },
          {
            repairTask: {
              equipmentId: equipmentId,
              task: {
                description: { contains: query, mode: "insensitive" },
              }
            },
          },
        ],
      },
      select: {
        recurringTask: {
          select: {
            id: true,
            equipmentId: true,
            task: {
              select: { description: true },
            },
            taskTracking: {
              include: {
                DateNextDue: {
                  select: {
                    id: true,
                    dateNextDue: true
                  }
                },
                PrimaryNextDue: {
                  select: {
                    id: true,
                    primaryNextDue: true
                  }
                },
                SecondaryNextDue: {
                  select: {
                    id: true,
                    secondaryNextDue: true 
                  }
                },
              }
            }
          },
        },
        repairTask: {
          select: {
            id: true,
            equipmentId: true,
            notes: true,
            task: {
              select: { description: true },
            },
            employee: {
              select: { 
                firstName: true, 
                lastName: true 
              },
            },
            taskTracking: {
              include: {
                DateNextDue: {
                  select: {
                    id: true,
                    dateNextDue: true
                  }
                },
                PrimaryNextDue: {
                  select: {
                    id: true,
                    primaryNextDue: true
                  }
                },
                SecondaryNextDue: {
                  select: {
                    id: true,
                    secondaryNextDue: true 
                  }
                },
              }
            }
          },
        },
      },
      orderBy: [
        { dateNextDue: 'asc' }, // First sort by soonest due date
        { primaryNextDue: 'asc' }, // Then sort by soonest primary meter due
        { secondaryNextDue: 'asc' }, // Finally sort by soonest secondary meter due
      ],
      skip: offset, 
      take: ITEMS_PER_PAGE, 
    });

    // Map DateNextDue, PrimaryNextDue, and SecondaryNextDue into simple arrays of values
    const mappedTasks = tasks.map(task => ({
      ...task,
      recurringTask: task.recurringTask ? {
        ...task.recurringTask,
      } : null,
      repairTask: task.repairTask ? {
        ...task.repairTask,
      } : null
    }));

    return mappedTasks;
  } catch (error) {
    console.error("Error fetching tasks by equipment ID:", error);
    throw error;
  }
}

//////////////////////////////////// REPAIR TASK //////////////////////////////////

export async function fetchRepairRequestsByEquipmentId(id: string) {
  noStore();
  try {
    // Retrieve the vendor information by ID
    const repairRequests = await prisma.repairTask.findMany({
      where: {
        equipmentId: id
      },
      include: {
        task: {
          select: {
            description: true
          }
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    return repairRequests;
  } catch (error) {
    console.error("Error fetching purchase order by ID:", error);
    throw error;
  }
}

export async function fetchRepairTaskById(id: string) {
  noStore();
  try {
    // Retrieve the repair task by ID
    const repairRequest = await prisma.repairTask.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        notes: true,
        taskType: true,
        priority: true,
        equipment: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        task: {
          select: {
            id: true,
            description: true,
          },
        },
        taskTracking: {
          include: {
            DateNextDue: true,
            PrimaryNextDue: true,
            SecondaryNextDue: true,
          }
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        repairType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Map to value-label format if repairRequest exists
    if (repairRequest) {
      return {
        id: repairRequest.id,
        taskType: repairRequest.taskType
          ? { value: repairRequest.taskType, label: repairRequest.taskType }
          : { value: "unknown", label: "Unknown Task Type" },
        priority: repairRequest.priority
          ? { value: repairRequest.priority, label: repairRequest.priority }
          : { value: "unknown", label: "Unknown Priority" },
        // dueBy: repairRequest.dueBy || null,
        notes: repairRequest.notes || "No notes provided",
        equipment: repairRequest.equipment
          ? {
              value: repairRequest.equipment.id,
              label: repairRequest.equipment.unitNumber,
            }
          : { value: "unknown", label: "Unknown Equipment" },
        task: repairRequest.task
          ? { value: repairRequest.task.id, label: repairRequest.task.description }
          : { value: "unknown", label: "Unknown Task" },
        employee: repairRequest.employee
          ? {
              value: repairRequest.employee.id,
              label: `${repairRequest.employee.firstName} ${repairRequest.employee.lastName}`,
            }
          : { value: "unknown", label: "Unknown Employee" },
        repairType: repairRequest.repairType
          ? {
              value: repairRequest.repairType.id,
              label: repairRequest.repairType.name,
            }
          : { value: "unknown", label: "Unknown Repair Type" },
        taskTracking: repairRequest.taskTracking
      };
    }

    // If no repairRequest is found, return null
    return null;
  } catch (error) {
    console.error("Error fetching repair task by ID:", error);
    throw error;
  }
}

//////////////////////////////////// RECURRING TASK //////////////////////////////////

export async function fetchRecurringTaskById(id: string) {
  noStore();
  try {
    // Retrieve the recurring task by ID
    const recurringRequest = await prisma.recurringTask.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        equipmentId: true,
        taskType: true,
        maintenanceTemplateId: true,
        task: {
          select: {
            id: true,
            description: true,
          },
        },
        taskStatus: true,
        taskTracking: {
          include: {
            DateNextDue: true,
            PrimaryNextDue: true,
            SecondaryNextDue: true,
          }
        },
        taskItem: {
          select: {
            id: true,
            recurringTaskId: true,
            inventory: {
              select: {
                id: true,
                item: {
                  select: {                    
                    id: true,
                    name: true,
                    description: true,
                    quantity: true,
                    partNumber: true,
                  }
                },
                receipts: {
                  where: { qtyRemaining: { gt: 0 } },
                  take: 1,
                  orderBy: { createdAt: "asc" },
                  select: {
                    unitCostDollar: true,
                  },
                },
              }
            },
            quantity: true
          }
        },
      },
    });

    // Map to value-label format if recurringRequest exists
    if (recurringRequest) {
      return {
        ...recurringRequest,
        task: recurringRequest.task
          ? { value: recurringRequest.task.id, label: recurringRequest.task.description }
          : null,
        taskStatus: recurringRequest.taskStatus
          ? { value: recurringRequest.taskStatus, label: recurringRequest.taskStatus }
          : null,
        taskItem: recurringRequest.taskItem.map((taskItem) => ({
          id: taskItem.id,
          quantity: taskItem.quantity,
          recurringTaskId: taskItem.recurringTaskId,
          item: taskItem.inventory?.item
            ? {
                value: taskItem.inventory.id, // Required ID for value
                label: taskItem.inventory.item.partNumber, // Fallback label
                name: taskItem.inventory.item.name,
                description: taskItem.inventory.item.description,
                quantity: taskItem.inventory.item.quantity,
                unitCostDollar:
                  taskItem.inventory.receipts?.[0]?.unitCostDollar ?? 0, // Default to 0 if no receipt found
              }
            : null,
        })),
      };
    }

    // If no recurringRequest is found, return null
    return null;
  } catch (error) {
    console.error("Error fetching recurring task by ID:", error);
    throw error;
  }
}


export async function fetchRecurringTasksById(id: string){
  try{
    const recurringTasks = await prisma.recurringTask.findMany({
      where: {
        equipmentId: id,
      },
      include: {
        task: true, // Include related Task details
        // tracking: true, // Include related Tracking details if needed
        // parts: {
        //   include: {
        //     item: true, // Include details of the parts
        //   },
        // },
      },
    });
    return recurringTasks
  } catch (error){
    console.error("Error fetching recurring tasks by ID:", error);
    throw error;
  }
}

//////////////////////////////////// INVENTORY //////////////////////////////////

export async function fetchInventoryItems(
  query: string,
  currentPage: number,
  warehouse: string
) {
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    // Fetch matching inventory items, filtering by warehouse and related item fields
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        AND: [
          {
            OR: [
              { item: 
                { partNumber: {contains: query, mode: "insensitive" } },
              },
              { item: 
                { name: {contains: query, mode: "insensitive" } },
              },
                
            ],
          },
          // Only include items that have inventory in the specified warehouse
          { warehouseId: warehouse ? warehouse : undefined },
        ],
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      select: {
        id: true,
        location: true,
        quantity: true,
        unitCostDollar: true,
        unitCostVES: true,
        item: {
          select: {
            partNumber: true,
            name: true,
            category: true,
            vendors: {
              select: {
                vendor: {
                  select: {
                    name: true,
                  },
                },
                manufacturer: {
                  select: {
                    name: true,
                  },
                },
              },
            },

          }
        }
      },
    });

    const items = inventoryItems.map(({ item, ...inventoryData }) => ({
      ...inventoryData,
      ...item, // merges the nested item properties into the root object
    }));

    return items;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw new Error("Failed to fetch filtered products.");
  }
}

export async function fetchInventoryPages(query: string, warehouse: string) {
  try {
    // Fetch items based on the query conditions
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { partNumber: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          { description: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          // {
          //   inventory: {
          //     every: {
          //       warehouseId: { equals: warehouse } // Filter by warehouseId
          //     }
          //   }
          // },
          {
            category: {
              name: {
                contains: query, // Adjust based on your schema
                mode: "insensitive",
              },
            },
          },
          {
            vendors: {
              some: {
                vendor: {
                  name: {
                    contains: query, // Adjust based on your schema
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      },
      // take: ITEMS_PER_PAGE,
      // skip: offset,
      select: {
        id: true,
        partNumber: true,
        name: true,
        category: {
          select: {
            name: true,
          },
        },
        // Assuming 'inventory' is the name of the relation in the Item model
        inventory: {
          select: {
            warehouseId: true,
            location: true,
            quantity: true,
            unitCostDollar: true,
            unitCostVES: true,
          },
          where: warehouse ? { warehouseId: warehouse } : undefined, // Conditionally apply where filter
        },
        // Include vendor information
        vendors: {
          select: {
            vendor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Flatten the data to include each unique item
    const flattenedItems = items.flatMap((item) =>
      item.inventory.map((inventory) => ({
        ...item,
        inventory: inventory.warehouseId,
      }))
    );

    // Count the number of unique items
    const uniqueItemCount = flattenedItems.length;
    // Calculate the total number of pages based on unique item count
    const totalPages = Math.ceil(uniqueItemCount / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Error fetching total number of inventory items:", error);
    throw new Error("Failed to fetch total number of inventory items.");
  }
}

export async function fetchItemByInventoryId(inventoryId: string) {
  noStore();

  try {
    // Query the Inventory record by its unique id and include the related item.
    const inventoryRecord = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: {
        id: true,
        warehouse: { select: { id: true, name: true } },
        reorderQuantity: true,
        location: true,
        lowStockLevel: true,
        quantity: true,
        unitCostDollar: true,
        unitCostVES: true,
        item: {
          select: {
            id: true,
            partNumber: true,
            name: true,
            description: true,
            unitType: {
              select: {
                id: true,
                name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            vendors: {
              select: {
                id: true,
                vendor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                manufacturer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                vendorPartNumber: true,
                barcode: true,
              },
            },
          },
        },
      },
    });

    if (!inventoryRecord || !inventoryRecord.item) {
      throw new Error("Item not found for the given inventory ID");
    }

    const item = inventoryRecord.item;

    // Transform the item as needed.
    const transformedItem = {
      id: item.id,
      partNumber: item.partNumber,
      name: item.name ? item.name : null,
      description: item.description,
      category: item.category
        ? { value: item.category.id, label: item.category.name }
        : null,
      unitType: item. unitType ? { value: item.unitType.id, label: item.unitType.name } : null,
      vendors: item.vendors.map((vendor) => ({
        id: vendor.id,
        vendor: vendor.vendor ? {
          value: vendor.vendor.id,
          label: vendor.vendor.name,
        } : null,
        manufacturer: vendor.manufacturer ? {
          value: vendor.manufacturer.id,
          label: vendor.manufacturer.name,
        } : null,
        vendorPartNumber: vendor.vendorPartNumber,
        barcode: vendor.barcode,
      })),
    };

    return transformedItem;
  } catch (error) {
    console.error("Error fetching item by inventory ID:", error);
    throw error;
  }
}

export async function fetchItemById(inventoryId: string) {
  noStore();

  try {
    // Query the Inventory record by its unique id and include the related item.
    const inventoryRecord = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        item: {
          select: {
            id: true,
            partNumber: true,
            name: true,
            description: true,
            unitType: {
              select: {
                id: true,
                name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            // Include additional nested relations if needed.
            inventory: {
              select: {
                id: true,
                warehouse: { select: { id: true, name: true } },
                reorderQuantity: true,
                location: true,
                lowStockLevel: true,
                quantity: true,
                unitCostDollar: true,
                unitCostVES: true,
              },
            },
            vendors: {
              select: {
                id: true,
                vendor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                manufacturer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                vendorPartNumber: true,
                barcode: true,
              },
            },
          },
        },
      },
    });

    if (!inventoryRecord || !inventoryRecord.item) {
      throw new Error("Item not found for the given inventory ID");
    }

    const item = inventoryRecord.item;

    // Transform the item as needed.
    const transformedItem = {
      id: item.id,
      partNumber: item.partNumber,
      name: item.name ? item.name : null,
      description: item.description,
      category: item.category
        ? { value: item.category.id, label: item.category.name }
        : null,
      unitType: item. unitType ? { value: item.unitType.id, label: item.unitType.name } : null,
      inventory: item.inventory.map((inventoryItem) => ({
        id: inventoryItem.id,
        warehouse: {
          value: inventoryItem.warehouse.id,
          label: inventoryItem.warehouse.name,
        },
        reorderQuantity: inventoryItem.reorderQuantity,
        location: inventoryItem.location,
        lowStockLevel: inventoryItem.lowStockLevel,
        quantity: inventoryItem.quantity,
        unitCostDollar: inventoryItem.unitCostDollar,
        unitCostVES: inventoryItem.unitCostVES,
      })),
      vendors: item.vendors.map((vendor) => ({
        id: vendor.id,
        vendor: vendor.vendor ? {
          value: vendor.vendor.id,
          label: vendor.vendor.name,
        } : null,
        manufacturer: vendor.manufacturer ? {
          value: vendor.manufacturer.id,
          label: vendor.manufacturer.name,
        } : null,
        vendorPartNumber: vendor.vendorPartNumber,
        barcode: vendor.barcode,
      })),
    };

    return transformedItem;
  } catch (error) {
    console.error("Error fetching item by inventory ID:", error);
    throw error;
  }
}

//////////////////////////////////// INVENTORY HELPERS //////////////////////////////////

export async function fetchUnitType(): Promise<Option[]> {
  try {
    const unitTypeData = await prisma.unitType.findMany();
    // Map the database results to the desired format for the front end
    const unitType = unitTypeData.map((option) => ({
      value: option.id, // Assuming id is a string, map it directly
      label: option.name, // Map unitNumber as label
    }));

    return unitType;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}

export async function fetchRepairTypes(inputValue: string): Promise<Option[]> {
  try {
    const repairTypesData = await prisma.repairType.findMany({
      where: {
        name: {
          contains: inputValue,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    // Map the database results to the desired format
    const repairTypes = repairTypesData.map((repairType) => ({
      value: repairType.id, // Assuming `id` is a string
      label: repairType.name, // Map `name` as label
    }));

    return repairTypes;
  } catch (error) {
    console.error("Error fetching repair types:", error);
    throw new Error("Failed to fetch repair types.");
  }
}

export async function fetchCategories(query: string): Promise<Option[]> {
  try {
    const categoriesData = await prisma.categories.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        }
      }
    });
    // Map the database results to the desired format for the front end
    const categories = categoriesData.map((category) => ({
      value: category.id, // Assuming id is a string, map it directly
      label: category.name, // Map unitNumber as label
    }));
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories.");
  }
}

export async function fetchWarehouses(query: string): Promise<Option[]> {
  try {
    const warehousesData = await prisma.warehouse.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        }
      }
    });
    const warehouses = warehousesData.map((warehouse) => ({
      value: warehouse.id, // Assuming id is a string, map it directly
      label: warehouse.name, // Map unitNumber as label
    }));
    return warehouses;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw new Error("Failed to fetch warehouses.");
  }
}

export async function fetchManufacturers(query: string): Promise<Option[]> {
  try {
    const manufacturersData = await prisma.manufacturer.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        }
      }
    });
    const manufacturers = manufacturersData.map((manufacturer) => ({
      value: manufacturer.id, // Assuming id is a string, map it directly
      label: manufacturer.name, // Map unitNumber as label
    }));
    return manufacturers;
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    throw new Error("Failed to fetch manufacturers.");
  }
}

//////////////////////////////////// PURCHASE ORDER HELPERS //////////////////////////////////

interface Option2 {
  id: string,
  name: string | null,
  partNumber: string,
  quantity: number,
  description: string | null,
  reorderQuantity: number,
  warehouse: string
}

interface Option3 {
  value: string,  
  label: string,
  name: string | null,
  quantity: number,
  description: string | null,
  reorderQuantity: number,
  warehouse: string
}

export async function fetchItems(
  query: string,
  warehouseId: string
): Promise<Record<string, Option3[]>> {
  noStore();
  try {
    const itemsData = await prisma.inventory.findMany({
      where: {
        ...(warehouseId ? { warehouseId } : {}), // Only filter by warehouseId if it's not empty
        item: {
          OR: [
            { partNumber: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      },
      select: {
        id: true,
        quantity: true,
        reorderQuantity: true,
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        item: {
          select: {
            name: true,
            partNumber: true,
            description: true,
          },
        },
      },
    });

    // Process data into grouped structure by warehouse name
    return itemsData.reduce((groups, record) => {
      const warehouseName = record.warehouse.name;

      if (!groups[warehouseName]) {
        groups[warehouseName] = [];
      }

      groups[warehouseName].push({
        value: record.id,
        name: record.item.name || '',
        label: record.item.partNumber,
        description: record.item.description || null,
        quantity: record.quantity,
        reorderQuantity: record.reorderQuantity,
        warehouse: warehouseName,
      });

      return groups;
    }, {} as Record<string, Option3[]>);
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}

export async function fetchSelectItems2(
  query: string,
  warehouseId: string
): Promise<Record<string, Option3[]>> {
  try {
    const itemsData = await prisma.item.findMany({
      where: {
        OR: [
          { partNumber: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        partNumber: true,
        description: true,
        quantity: true,
        inventory: {
          select: {
            id: true,
            reorderQuantity: true,
            warehouse: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Process data into grouped structure in one step
    return itemsData.reduce((groups, item) => {
      const inventory = item.inventory[0]; // Get first inventory record if exists
      if (!inventory) return groups; // Skip if no inventory data

      const warehouseName = inventory.warehouse.name;

      if (!groups[warehouseName]) {
        groups[warehouseName] = [];
      }

      groups[warehouseName].push({
        value: item.inventory[0].id,
        name: item.name || '',
        label: item.partNumber,
        description: item.description || null,
        quantity: item.quantity,
        reorderQuantity: inventory.reorderQuantity,
        warehouse: warehouseName,
      });

      return groups;
    }, {} as Record<string, Option3[]>);
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}


export async function fetchSelectItems(query: string, warehouseId: string): Promise<{ items: Option2[] }> {
  try {
    const itemsData = await prisma.item.findMany({
      where: {
        OR: [
          { partNumber: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        partNumber: true,
        description: true,
        quantity: true,
        inventory: {
          // where: {
          //   warehouseId: warehouseId, // Filter inventory by warehouseId
          // },
        select: {
          reorderQuantity: true,
          warehouse: {
            select: {
              id: true,
              name: true,
            }
          }
        }
        }
      }
    });


    const items = itemsData.map((item) => ({
      id: item.id, // Assuming id is a string, map it directly
      // label: `${item.partNumber} - ${item.description}`, // Combine partNumber and description for better display
      name: item.name ,
      partNumber: item.partNumber,
      description: item.description,
      quantity: item.quantity,
      reorderQuantity: item.inventory[0].reorderQuantity,
      warehouse: item.inventory[0].warehouse.name
      
    }));

    return { items };
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}

export async function fetchSelectItemById(id: string): Promise<Option | null> {
  try {
    const itemData = await prisma.item.findUnique({
      where: { id },
    });

    if (!itemData) {
      return null; // Return null if no item is found
    }

    // Return the item in the expected format
    return {
      value: itemData.id,
      label: `${itemData.partNumber} ${itemData.description}`,
    };
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    throw new Error("Failed to fetch item by ID.");
  }
}

//////////////////////////////////// EMPLOYEES //////////////////////////////////

export async function fetchEmployees(): Promise<Option[]> {
  try {
    const employeesData = await prisma.employee.findMany();
    const employees = employeesData.map((employee) => ({
      value: employee.id, // Assuming id is a string, map it directly
      label: `${employee.firstName} ${employee.lastName}`, // Map unitNumber as label
    }));
    return employees;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}

export async function fetchEmployeeById(id: string) {
  noStore();
  try {
    // Retrieve the vendor information by ID
    const employee = await prisma.employee.findUnique({
      where: {
        id: id,
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Map vendorType to value-label structure
    const transformedEmployee = {
      ...employee,
      employeeStatus: {
        value: employee.employeeStatus,
        label: employee.employeeStatus, // Get label from the map
      },
      adminType: {
        value: employee.adminType,
        label: employee.adminType, // Get label from the map
      }
    };

    return transformedEmployee;
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    throw error;
  }
}

export async function fetchFilteredEmployees(
  query: string,
  currentPage: number
) {
  const ITEMS_PER_PAGE = 10; // Define the number of items per page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Fetch vendors that match the query
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
}

export async function fetchEmployeesPages(query: string) {
  const ITEMS_PER_PAGE = 10; // Define the number of items per page

  try {
    // Query the database to count the total number of vendors matching the query
    const totalVendorsCount = await prisma.employee.count({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // Calculate the total number of pages based on the total count and items per page
    const totalPages = Math.ceil(totalVendorsCount / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Unexpected Error:", error);
    throw new Error("Failed to fetch total number of vendor pages.");
  }
}

interface LaborOption {
  value: string;
  label: string;
  laborRate: number;
}

export async function fetchEmployeesByLabor(
  query: string
): Promise<LaborOption[]> {
  try {
    noStore();
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        laborRate: true,
      },
    });

    return employees.map((employee) => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
      laborRate: employee.laborRate,
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees.");
  }
}

//////////////////////////////////// VENDOR TABLE //////////////////////////////////

export async function fetchFilteredVendors(query: string, currentPage: number) {
  const ITEMS_PER_PAGE = 10; // Define the number of items per page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Fetch vendors that match the query
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          { contact: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          { vendorType: VendorType[query as keyof typeof VendorType] }, // Use the enum value directly
          { phone: { contains: query } }, // Adjust according to your schema
          { keywords: { contains: query } }, // Adjust according to your schema
          { address: { contains: query } }, // Adjust according to your schema
          // Add more fields to search if needed
        ],
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return vendors;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
}

export async function fetchVendorPages(query: string) {
  const ITEMS_PER_PAGE = 10; // Define the number of items per page

  try {
    // Query the database to count the total number of vendors matching the query
    const totalVendorsCount = await prisma.vendor.count({
      where: {
        OR: [
          { name: { contains: query } }, // Adjust according to your schema
          { contact: { contains: query } }, // Adjust according to your schema
          // Add more fields to search if needed
        ],
      },
    });

    // Calculate the total number of pages based on the total count and items per page
    const totalPages = Math.ceil(totalVendorsCount / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Unexpected Error:", error);
    throw new Error("Failed to fetch total number of vendor pages.");
  }
}

//////////////////////////////////// VENDOR FORM ////////////////////////////////////

export async function fetchVendors(query: string): Promise<Option[]> {
  try {
    const vendorsData = await prisma.vendor.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        }
      },
      select:{
        id: true,
        name: true
      }
    });
    const vendors = vendorsData.map((vendor) => ({
      value: vendor.id, // Assuming id is a string, map it directly
      label: vendor.name, // Map unitNumber as label
    }));
    return vendors;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw new Error("Failed to fetch warehouses.");
  }
}
// Function to fetch vendor by ID and transform vendorType to value-label structure
export async function fetchVendorById(id: string) {
  noStore();
  try {
    // Retrieve the vendor information by ID
    const vendor = await prisma.vendor.findUnique({
      where: {
        id: id,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Map vendorType to value-label structure
    const transformedVendor = {
      ...vendor,
      vendorType: {
        value: vendor.vendorType,
        label: vendor.vendorType, // Get label from the map
      },
    };

    return transformedVendor;
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    throw error;
  }
}

//////////////////////////////////// PURCHASE ORDER //////////////////////////////////

export async function fetchFilteredPurchaseOrders(
  query: string,
  currentPage: number
) {
  const ITEMS_PER_PAGE = 5; // Define the number of items per page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Fetch vendors that match the query
    const purchaseorders = await prisma.purchaseOrder.findMany({
      where: {
        OR: [
          { poNumber: parseInt(query) || undefined }, // Adjust according to your schema
          { invoice: { contains: query } }, // Adjust according to your schema
          // { terms: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          {
            vendor: {
              name: {
                contains: query, // Adjust based on your schema
                mode: "insensitive",
              },
            },
          },
          {
            warehouse: {
              name: {
                contains: query, // Adjust based on your schema
                mode: "insensitive",
              },
            },
          },
          // Add more fields to search if needed
        ],
      },
      include: {
        vendor: {
          select: {
            name: true,
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        poNumber: "desc", // Order by PO number in descending order
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return purchaseorders;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
}

export async function fetchPurchaseOrdersPages(query: string) {
  const ITEMS_PER_PAGE = 5; // Define the number of items per page

  try {
    // Query the database to count the total number of vendors matching the query
    const totalPurchaseOrdersCount = await prisma.purchaseOrder.count({
      where: {
        OR: [
          { poNumber: parseInt(query) || undefined }, // Adjust according to your schema
          { invoice: { contains: query } }, // Adjust according to your schema
          // { terms: { contains: query, mode: "insensitive" } }, // Adjust according to your schema
          { vendorId: VendorType[query as keyof typeof VendorType] }, // Use the enum value directly
          // Add more fields to search if needed
        ],
      },
      orderBy: {
        poNumber: "desc", // Order by PO number in descending order
      },
    });

    // Calculate the total number of pages based on the total count and items per page
    const totalPages = Math.ceil(totalPurchaseOrdersCount / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Unexpected Error:", error);
    throw new Error("Failed to fetch total number of vendor pages.");
  }
}

export async function fetchPurchaseOrderById(id: string) {
  noStore();
  try {
    // Retrieve the purchase order information by ID
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        dateOpened: true,
        dateRequired: true,
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        terms: {
          select: {
            id: true,
            name: true,
          },
        },
        shipVia: true,
        invoice: true,
        workOrder: true,
        notes: true,
        poNumber: true,
        poStatus: true,
        taxBy: true,
        tax1 : true,
        tax2 : true,
        freight: true,
        receipts: {
          select: {
            id: true,
            purchaseOrderId: true,
            qtyReceived: true,
            qtyRemaining: true,
            qtyOrdered: true,
            unitCostDollar: true,
            unitCostVES: true,
            invoice: true,
            inventory: {
              select: {
                item: {
                  select: {
                    id: true,
                    partNumber: true,
                    name: true,
                    description: true,
                    quantity: true,
                  }
                }
              }
            }
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new Error(`Purchase order with ID ${id} not found.`);
    }

    // Transform fields to label-value structure
    const transformedPurchaseOrder = {
      ...purchaseOrder,
      warehouse: {
        value: purchaseOrder.warehouse.id,
        label: purchaseOrder.warehouse.name,
      },
      vendor: purchaseOrder.vendor
        ? {
            value: purchaseOrder.vendor.id,
            label: purchaseOrder.vendor.name,
          }
        : null,
      terms: purchaseOrder.terms ? {
        value: purchaseOrder.terms.id,
        label: purchaseOrder.terms.name,
      } : null,
      buyer: purchaseOrder.buyer ?{
        value: purchaseOrder.buyer.id,
        label: `${purchaseOrder.buyer.firstName} ${purchaseOrder.buyer.lastName}`,
      } : null,
      shipVia: purchaseOrder.shipVia ? {
        value: purchaseOrder.shipVia,
        label: formatLabel(purchaseOrder.shipVia),
      } : null,
      taxBy: {
        value: purchaseOrder.taxBy,
        label: purchaseOrder.taxBy,
      },
      receipts: purchaseOrder.receipts.map((receipt) => ({
        id: receipt.id,
        purchaseOrderId: receipt.purchaseOrderId,
        qtyOrdered: receipt.qtyOrdered,
        qtyReceived: receipt.qtyReceived,
        unitCostDollar: receipt.unitCostDollar,
        unitCostVES: receipt.unitCostVES,
        invoice: receipt.invoice,
        item: {
          value: receipt.inventory.item.id, // Item ID
          label: receipt.inventory.item.partNumber, // Part Number and Item Name
          name: receipt.inventory.item.name,
          description: receipt.inventory.item.description,
          quantity: receipt.inventory.item.quantity,
        },
      })),
    };

    return transformedPurchaseOrder;
  } catch (error) {
    console.error("Error fetching purchase order by ID:", error);
    throw error;
  }
}

//////////////////////////////////// PURCHASE ORDER HELPERS //////////////////////////////////

export async function fetchTerms(): Promise<Option[]> {
  try {
    const termsData = await prisma.terms.findMany();
    const terms = termsData.map((term) => ({
      value: term.id, // Assuming id is a string, map it directly
      label: term.name, // Map unitNumber as label
    }));
    return terms;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}

//////////////////////////////////// WORK ORDERS //////////////////////////////////

export async function fetchFilteredWorkOrders(
  query: string,
  currentPage: number
) {
  const ITEMS_PER_PAGE = 5; // Define the number of items per page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Fetch vendors that match the query
    const workorders = await prisma.workOrder.findMany({
      where: {
        OR: [
          { woNumber: parseInt(query) || undefined }, // Adjust according to your schema
          // Add more fields to search if needed          
          {
            equipment: {
              description: {
                contains: query, // Adjust based on your schema
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include:{
        equipment: {
          select: {
            unitNumber: true,
            description: true
          }
        },
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        woNumber: "desc", // Order by PO number in descending order
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return workorders;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
}

export async function fetchWorkOrderById(id: string) {
  noStore();
  try {

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      select: {
        id: true,
        woNumber: true,
        scheduled: true,
        due: true,
        dateStarted: true,
        dateCompleted: true,
        priority: true,
        workOrderType: true,
        notes: true,
        woStatus: true,
        tax1: true,
        tax2: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        primaryMeterReading: true,
        secondaryMeterReading: true,
        equipment: {
          select: {
            id: true,
            unitNumber: true,
            description: true,
            primaryMeter: true,
            secondaryMeter: true,
          },
        },
        tasks: {
          select: {
            id: true,
            labor: {
              select: {
                id: true,
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  }
                },
                date: true,
                hours: true,
                laborRate: true,
                workOrderTaskId: true,
              },
            },
            parts: {
              select: {
                id: true,
                date: true,
                qtyIssued: true,
                description: true,
                workOrderTaskId: true,
                unitCostDollar: true,
                unitCostVES: true,
                inventory: {
                  select: {
                    id: true,
                    location: true,
                    quantity: true,
                    warehouse: {
                      select: {
                        name: true,
                      }
                    },
                    item: {
                      select: {
                        partNumber: true,
                        unitType: {
                          select: {
                            name: true,
                          }
                        }
                      },
                    }
                  }
                },
                receipt: {
                  select: {
                    id: true,
                    qtyRemaining: true,
                    vendor: {
                      select: {
                        name: true,
                      },
                    },
                    unitCostDollar: true,
                    unitCostVES: true,
                  },
                },                    
              },
            },
            recurringTask: {
              select: {
                id: true,
                task: {
                  select: {
                    id: true,
                    description: true,
                  },
                },
              },
            },
            repairTask: {
              select: {
                id: true,
                task: {
                  select: {
                    id: true,
                    description: true,
                  },
                },
              },
            },
            completed: true,
          },
          orderBy: [
            { }
          ]
        },
      },
    });

    if (!workOrder) {
      return null;
    }

    // Transform employee data
    const transformedEmployee = workOrder.employee
      ? {
          value: workOrder.employee.id,
          label: `${workOrder.employee.firstName} ${workOrder.employee.lastName}`,
        }
      : null;

    // Transform tasks and flatten parts
    const transformedTasks = workOrder.tasks.map((record) => {
      let taskType: TaskType = 'Recurring';
      let taskData = null;
      let parts: IssuanceFormValues[] = []; // Explicitly typed empty array
      let labor: LaborFormValues[] = []; // Explicitly typed empty array

      if (record.repairTask) {
        taskType = "Repair";
        taskData = {
          value: record.repairTask.task.id,
          label: record.repairTask.task.description,
        };
      } else if (record.recurringTask) {
        taskType = "Recurring";
        taskData = {
          value: record.recurringTask.task.id,
          label: record.recurringTask.task.description,
        };
      }

      if (record.repairTask?.task) {
        taskType = "Repair";
        parts = record.parts.map((part) => ({
          id: part.id,
          date: part.date,
          qtyIssued: part.qtyIssued,
          workOrderTaskId: part.workOrderTaskId,
          description: part.description,
          receiptId: part.receipt.id,
          recurringTaskId: null, // ✅ Ensure recurring ID is null
          equipment: {
            value: workOrder.equipment.id || "N/A",
            label: workOrder.equipment.unitNumber || "N/A",
          },
          item: {
            value: part.inventory.id || "N/A",
            label: part.inventory.item?.partNumber || "N/A",
            quantity: part.inventory.quantity || 0,      
            qtyRemaining: part.receipt.qtyRemaining || 0,
            location: part.inventory.location || "Unknown",
            unitCostDollar: part.unitCostDollar || 0,
            unitCostVES: part.unitCostVES || 0,
            unitType: part.inventory.item.unitType?.name || "Unknown",
            vendor: part.receipt?.vendor?.name || "Unknown",
            warehouse: part.inventory.warehouse.name || "Unknown",
          },

        }));
        labor = record.labor.map((labor) => ({
          id: labor.id,
          date: labor.date,
          hours: labor.hours,
          employee: {
            value: labor.employee.id,
            label: `${labor.employee.firstName} ${labor.employee.lastName}`,
            laborRate: labor.laborRate,
          },
          laborRate: labor.laborRate,
          workOrderTaskId: labor.workOrderTaskId,
        }));
        
      } else if (record.recurringTask?.task) {
        taskType = "Recurring";
        parts = record.parts.map((part) => ({
          id: part.id,
          date: part.date,
          qtyIssued: part.qtyIssued,
          workOrderTaskId: part.workOrderTaskId,
          description: part.description,
          receiptId: part.receipt.id,
          repairTaskId: null, // ✅ Ensure repair ID is null
          equipment: {
            value: workOrder.equipment.id || "N/A",
            label: workOrder.equipment.unitNumber || "N/A",
          },
          item: {
            value: part.inventory.id || "N/A",
            label: part.inventory.item?.partNumber || 'Unknown',
            quantity: part.inventory.quantity || 0,      
            qtyRemaining: part.receipt.qtyRemaining || 0,
            location: part.inventory.location || 'Unknown',
            unitCostDollar: part.unitCostDollar || 0,
            unitCostVES: part.unitCostVES || 0,
            unitType: part.inventory.item.unitType?.name || 'Unknown',
            vendor: part.receipt?.vendor?.name || null,
            warehouse: part.inventory.warehouse.name || 'Unknown',
          },
        }));
        labor = record.labor.map((labor) => ({
          id: labor.id,
          date: labor.date,
          hours: labor.hours,
          employee: {
            value: labor.employee.id,
            label: `${labor.employee.firstName} ${labor.employee.lastName}`,
            laborRate: labor.laborRate,
          },
          laborRate: labor.laborRate,
          workOrderTaskId: labor.workOrderTaskId,
        }));
      }

      return {
        id: record.id,
        task: {
          taskType,
          taskTracking: null,
          task: taskData,
        },
        parts, // Parts array now correctly contains repairTaskId/recurringTaskId
        labor,
        completed: record.completed,
      };
    });

    // Create transformed work order
    const transformedWorkOrder = {
      id: workOrder.id,
      tax1: workOrder.tax1,
      tax2: workOrder.tax2,
      equipment: {
        value: workOrder.equipment.id,
        label: workOrder.equipment.unitNumber,
        description: workOrder.equipment.description,
        primaryMeter: workOrder.equipment.primaryMeter as MeterReading,
        secondaryMeter: workOrder.equipment.secondaryMeter as MeterReading,
      },
      primaryMeter: workOrder.equipment.primaryMeter as MeterReading,
      primaryMeterReading: workOrder.primaryMeterReading,
      secondaryMeter: workOrder.equipment.secondaryMeter as MeterReading,
      secondaryMeterReading: workOrder.secondaryMeterReading,
      woNumber: workOrder.woNumber,
      scheduled: workOrder.scheduled,
      due: workOrder.due,
      dateStarted: workOrder.dateStarted,
      dateCompleted: workOrder.dateCompleted,
      priority: {
        value: workOrder.priority,
        label: workOrder.priority
      },
      workOrderType: workOrder.workOrderType
      ? { value: workOrder.workOrderType, label: workOrder.workOrderType }
      : { value: "Unknown", label: "Unknown" }, // Provide a fallback value    
      notes: workOrder.notes,
      woStatus: workOrder.woStatus,
      employee: transformedEmployee,
      tasks: transformedTasks,
      checkedTasks: {}, // Add an appropriate default value, possibly an empty object
    };

    return transformedWorkOrder;
  } catch (error) {
    console.error("Error fetching work order by ID:", error);
    throw error;
  }
}

// export async function fetchWorkOrderTasksByEquipmentId(id: string) {
//   noStore();
//   try {
//     const tasks = await prisma.taskTracking.findMany({
//       where: {
//         OR: [
//           { recurringTask: { equipmentId: id } },
//           { repairTask: { equipmentId: id } },
//         ],
//       },
//       select: {
//         recurringTask: {
//           select: {
//             id: true,
//             taskType: true,
//             taskTracking: {
//               include: {
//                 DateNextDue: { select: { id: true, dateNextDue: true } },
//                 PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
//                 SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
//               },
//             },
//             task: { select: { id: true, description: true } },
//           },
//         },
//         repairTask: {
//           select: {
//             id: true,
//             taskType: true,
//             priority: true, // ✅ Only exists for RepairTask
//             taskTracking: {
//               include: {
//                 DateNextDue: { select: { id: true, dateNextDue: true } },
//                 PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
//                 SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
//               },
//             },
//             task: { select: { id: true, description: true } },
//           },
//         },
//       },

//     });

//     if (!tasks.length) {
//       return [];
//     }

//     // Transform tasks into a discriminated union structure
//     const allTasks = tasks
//       .map((t) => {
//         const taskData = t.recurringTask ?? t.repairTask;
//         if (!taskData) return null;

//         const baseTask = {
//           task: {
//             id: taskData.id,
//             taskType: taskData.taskType as "Recurring" | "Repair",
//             task: {
//               value: taskData.task.id,
//               label: taskData.task.description,
//             },
//             taskTracking: taskData.taskTracking
//               ? {
//                   DateNextDue: taskData.taskTracking.DateNextDue.map((d) => ({
//                     id: d.id,
//                     dateNextDue: d.dateNextDue,
//                   })),
//                   PrimaryNextDue: taskData.taskTracking.PrimaryNextDue.map((p) => ({
//                     id: p.id,
//                     primaryNextDue: p.primaryNextDue,
//                   })),
//                   SecondaryNextDue: taskData.taskTracking.SecondaryNextDue.map((s) => ({
//                     id: s.id,
//                     secondaryNextDue: s.secondaryNextDue,
//                   })),
//                 }
//               : null,
//           },
//           parts: [],
//           labor: [],
//           completed: false,
//         };

//         // ✅ Use explicit type guard to check if it's a RepairTask
//         if ("priority" in taskData) {
//           return {
//             ...baseTask,
//             priority: taskData.priority, // ✅ Only added for RepairTask
//           };
//         }

//         return baseTask; // ✅ RecurringTask does not have priority
//       })
//       .filter((task) => task !== null);

//     return allTasks;
//   } catch (error) {
//     console.error("Error fetching tasks by equipment ID:", error);
//     throw new Error("Failed to fetch tasks.");
//   }
// }

export async function fetchWorkOrderTasksByEquipmentId(id: string) {

  console.log(id)
  noStore();
  try {
    const tasks = await prisma.taskTracking.findMany({
      where: {
        OR: [
          { recurringTask: { equipmentId: id } },
          { repairTask: { equipmentId: id } },
        ],
      },
      select: {
        id: true,
        recurringTask: {
          select: {
            id: true,
            taskType: true,
            taskTracking: {
              include: {
                DateNextDue: { select: { id: true, dateNextDue: true } },
                PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
                SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
              },
            },
            task: { select: { id: true, description: true } },
            equipment: {
              select: { primaryMeterReading: true, secondaryMeterReading: true },
            }
          },
        },
        repairTask: {
          select: {
            id: true,
            taskType: true,
            priority: true, // ✅ Only exists for RepairTask
            taskTracking: {
              include: {
                DateNextDue: { select: { id: true, dateNextDue: true } },
                PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
                SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
              },
            },
            task: { select: { id: true, description: true } },
            equipment: {
              select: { primaryMeterReading: true, secondaryMeterReading: true },
            }
          },
        },
        
      },
      orderBy: [
        { dateNextDue: 'asc' }, // First sort by soonest due date
        { primaryNextDue: 'asc' }, // Then sort by soonest primary meter due
        { secondaryNextDue: 'asc' }, // Finally sort by soonest secondary meter due
      ],
    });

    if (!tasks.length) {
      return [];
    }

    // Transform tasks into a discriminated union structure
    const allTasks = tasks
      .map((t) => {
        const taskData = t.recurringTask ?? t.repairTask;

        if (!taskData || !taskData.taskTracking || !isTaskDue(taskData.taskTracking, taskData.equipment)) {
          return null;
        }

        const isRepairTask = "priority" in taskData; // ✅ Type guard to check if it's a RepairTask

        return {
          id: "",
          task: {
            taskType: taskData.taskType as "Recurring" | "Repair",
            task: {
              value: taskData.task.id,
              label: taskData.task.description,
            },
            ...(isRepairTask ? { priority: (taskData as { priority: Priority }).priority } : {}), // ✅ Only include priority for RepairTask
            taskTracking: taskData.taskTracking,
            // checked: true
          },
          parts: [],
          labor: [],
          completed: false,
        };
      })
      .filter((task) => task !== null);

    return allTasks;
  } catch (error) {
    console.error("Error fetching tasks by equipment ID:", error);
    throw new Error("Failed to fetch tasks.");
  }
}

export async function fetchMetersByEquipmentId(id: string) {
  try {
    const equipmentMeters = await prisma.equipment.findUnique({
      where: {
        id: id, // exact match, no contains needed
      },
      select: {
        primaryMeterReading: true,
        secondaryMeterReading: true,
      },
    });

    return equipmentMeters;
  } catch (error) {
    console.error("Error fetching tasks by equipment id:", error);
    throw new Error("Failed to fetch tasks.");
  }
}

// export async function fetchWorkOrderTasksByEquipmentId2(query: string, id: string) {
//   noStore();
//   try {

//     const tasks = await prisma.workOrderTask.findMany({
//       where: {
//         OR: [
//           {
//             recurringTask: {
//               equipmentId: id,
//               task: {
//                 description: {
//                   contains: query,
//                   mode: "insensitive"
//                 }
//               }
//             }
//           },
//           {
//             repairTask: {
//               equipmentId: id,
//               task: {
//                 description: {
//                   contains: query,
//                   mode: "insensitive"
//                 }
//               }
//             }
//           }
//         ]
//       },
//       select: {
//         recurringTask: {
//           select: {
//             id: true,
//             taskType: true,
//             taskTracking: {
//               include: {
//                 DateNextDue: {
//                   select: {
//                     id: true,
//                     dateNextDue: true,
//                   },
//                 },
//                 PrimaryNextDue: {
//                   select: {
//                     id: true,
//                     primaryNextDue: true,
//                   },
//                 },
//                 SecondaryNextDue: {
//                   select: {
//                     id: true,
//                     secondaryNextDue: true,
//                   },
//                 },
//               },
//             },
//             task: { select: { id: true, description: true } },
//             equipment: {
//               select: { primaryMeterReading: true, secondaryMeterReading: true },
//             },
//           },
//         },
//         repairTask: {
//           select: {
//             id: true,
//             taskType: true,
//             priority: true,
//             task: { select: { id: true, description: true } },
//             equipment: {
//               select: { primaryMeterReading: true, secondaryMeterReading: true },
//             },
//           },
//         },
//       },
//     });
    
//     console.log(tasks);
    
//     // Fetch recurring tasks by equipmentId
//     const recurringTasks = await prisma.recurringTask.findMany({
//       where: {
//         equipmentId: id,
//         task: {
//           description: {
//             contains: query, // Partial match
//             mode: "insensitive", // Case-insensitive search
//           },
//         },
//       },
//       select: {
//         id: true,
//         taskType: true,
//         taskTracking: {
//           include: {
//             DateNextDue: {
//               select: {
//                 id: true,
//                 dateNextDue: true,
//               },
//             },
//             PrimaryNextDue: {
//               select: {
//                 id: true,
//                 primaryNextDue: true,
//               },
//             },
//             SecondaryNextDue: {
//               select: {
//                 id: true,
//                 secondaryNextDue: true,
//               },
//             },
//           },
//         },
//         task: { select: { id: true, description: true } },
//         equipment: {
//           select: { primaryMeterReading: true, secondaryMeterReading: true },
//         },
//       },
//     });

//     // Fetch all repair tasks (no filtering by equipmentId)
//     const repairTasks = await prisma.repairTask.findMany({
//       where: {
//         task: {
//           description: {
//             contains: query, // Partial match
//             mode: "insensitive", // Case-insensitive search
//           },
//         },
//       },
//       select: {
//         id: true,
//         taskType: true,
//         priority: true,
//         task: { select: { id: true, description: true } },
//         equipment: {
//           select: { primaryMeterReading: true, secondaryMeterReading: true },
//         },
//       },
//     });

//     // Format recurring tasks (PM Tasks)
//     const formattedRecurringTasks = recurringTasks.map((task) => ({
//       ...task,
//       task: {
//         value: task.task.id,
//         label: task.task.description,
//       },
//       repairTaskId: null,
//       recurringTaskId: task.id,
//       parts: [],
//       labor: [],
//       completed: false,
//     }));

//     // Format repair tasks (Repair Tasks)
//     const formattedRepairTasks = repairTasks.map((task) => ({
//       ...task,
//       task: {
//         value: task.task.id,
//         label: task.task.description,
//       },
//       repairTaskId: task.id,
//       recurringTaskId: null,
//       parts: [],
//       labor: [],
//       completed: false,
//     }));

//     // Group into categories
//     const groupedTasks = [
//       {
//         label: "PM Tasks",
//         options: formattedRecurringTasks,
//       },
//       {
//         label: "Repair Tasks",
//         options: formattedRepairTasks,
//       },
//     ];

//     // if (!formattedRecurringTasks.length && !formattedRepairTasks.length) {
//     //   return [];
//     // }

//     return groupedTasks;
//   } catch (error) {
//     console.error("Error fetching tasks by equipment id:", error);
//     throw new Error("Failed to fetch tasks.");
//   }
// }

// export async function fetchWorkOrderTasksByEquipmentId2(query: string, id: string) {
//   noStore();
//   try {
//     const equipmentTasks = await prisma.workOrderTask.findMany({
//       where: {
//         OR: [
//           {
//             recurringTask: {
//               equipmentId: id,
//               task: {
//                 description: {
//                   contains: query,
//                   mode: "insensitive"
//                 }
//               }
//             }
//           },
//           {
//             repairTask: {
//               equipmentId: id,
//               task: {
//                 description: {
//                   contains: query,
//                   mode: "insensitive"
//                 }
//               }
//             }
//           }
//         ]
//       },
//       select: {
//         id: true,
//         recurringTask: {
//           select: {
//             id: true,
//             taskType: true,
//             taskTracking: {
//               include: {
//                 DateNextDue: { select: { id: true, dateNextDue: true } },
//                 PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
//                 SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
//               },
//             },
//             task: { select: { id: true, description: true } },
//             equipment: {
//               select: {
//                 primaryMeterReading: true,
//                 secondaryMeterReading: true,
//               },
//             },
//           },
//         },
//         repairTask: {
//           select: {
//             id: true,
//             taskType: true,
//             priority: true,
//             task: { select: { id: true, description: true } },
//             taskTracking: {
//               include: {
//                 DateNextDue: { select: { id: true, dateNextDue: true } },
//                 PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
//                 SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
//               },
//             },
//             equipment: {
//               select: {
//                 primaryMeterReading: true,
//                 secondaryMeterReading: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     console.log(equipmentTasks)


//     // Separate out recurring and repair tasks from the result
//     const recurringTasks = equipmentTasks
//       .filter((t) => t.recurringTask && t.recurringTask.task)
//       .map((t) => t.recurringTask!);

//       console.log(recurringTasks)



//     const repairTasks = equipmentTasks
//       .filter((t) => t.repairTask && t.repairTask.task)
//       .map((t) => t.repairTask!);

//     const formattedRecurringTasks = recurringTasks.map((task) => ({
//       id: task.id,
//       task: {
//         taskType: 'Recurring' as const,
//         taskTracking: task.taskTracking,
//         task: {
//           value: task.task.id ?? null,
//           label: task.task.description ?? null,
//         },
//         checked: true
//       },
//       parts: [],
//       labor: [],
//       completed: false,
//     }));

//     const formattedRepairTasks = repairTasks.map((task) => ({
//       id: task.id,
//       task: {
//         taskType: 'Repair' as const, 
//         taskTracking: task.taskTracking,
//         task: {
//           value: task.task.id ?? null,
//           label: task.task.description ?? null,
//         },
//         priority: task.priority ?? null,
//         checked: false
//       },
//       parts: [],
//       labor: [],
//       completed: true,
//     }));

//     // Fetch all available tasks
//     const allTasks = await prisma.task.findMany({
//       select: { id: true, description: true },
//     });

//     // Get a Set of all used task IDs
//     const usedTaskIds = new Set([
//       ...recurringTasks.map((t) => t.task.id),
//       ...repairTasks.map((t) => t.task.id),
//     ]);

//     // Filter tasks that are not yet used in either repair or recurring
//     const newAvailableTasks = allTasks
//       .filter((task) => !usedTaskIds.has(task.id))
//       .map((task) => ({
//         id: "",
//         task: {
//           taskType: "Repair" as const,
//           taskTracking: null,
//           task: {
//             value: task.id,
//             label: task.description,
//           },
//           priority: undefined,
//           checked: true
//         },
//         parts: [],
//         labor: [],
//         completed: false,
//       }));

//     // Combine all into grouped list
//     const groupedTasks = [
//       {
//         label: "PM Tasks",
//         options: formattedRecurringTasks,
//       },
//       {
//         label: "Repair Tasks",
//         options: [...formattedRepairTasks, ...newAvailableTasks],
//       },
//     ];

//     return groupedTasks;
//   } catch (error) {
//     console.error("Error fetching tasks by equipment id:", error);
//     throw new Error("Failed to fetch tasks.");
//   }
// }

export async function fetchWorkOrderTasksByEquipmentId2(query: string, id: string) {
  noStore();
  try {
    const [recurringTasks, repairTasks, allTasks] = await Promise.all([
      prisma.recurringTask.findMany({
        where: {
          equipmentId: id,
          task: {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        select: {
          id: true,
          taskType: true,
          taskTracking: {
            include: {
              DateNextDue: { select: { id: true, dateNextDue: true } },
              PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
              SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
            },
          },
          task: { select: { id: true, description: true } },
          equipment: {
            select: {
              primaryMeterReading: true,
              secondaryMeterReading: true,
            },
          },
        },
      }),

      prisma.repairTask.findMany({
        where: {
          equipmentId: id,
          task: {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        select: {
          id: true,
          taskType: true,
          priority: true,
          task: { select: { id: true, description: true } },
          taskTracking: {
            include: {
              DateNextDue: { select: { id: true, dateNextDue: true } },
              PrimaryNextDue: { select: { id: true, primaryNextDue: true } },
              SecondaryNextDue: { select: { id: true, secondaryNextDue: true } },
            },
          },
          equipment: {
            select: {
              primaryMeterReading: true,
              secondaryMeterReading: true,
            },
          },
        },
      }),

      prisma.task.findMany({
        select: { id: true, description: true },
      }),
    ]);

    // --- Same formatting logic as before ---

    const formattedRecurringTasks = recurringTasks.map((task) => ({
      id: task.id,
      task: {
        taskType: 'Recurring' as const,
        taskTracking: task.taskTracking,
        task: {
          value: task.task.id ?? null,
          label: task.task.description ?? null,
        },
        checked: true,
      },
      parts: [],
      labor: [],
      completed: false,
    }));

    const formattedRepairTasks = repairTasks.map((task) => ({
      id: task.id,
      task: {
        taskType: 'Repair' as const,
        taskTracking: task.taskTracking,
        task: {
          value: task.task.id ?? null,
          label: task.task.description ?? null,
        },
        priority: task.priority ?? null,
        checked: false,
      },
      parts: [],
      labor: [],
      completed: true,
    }));

    const usedTaskIds = new Set([
      ...recurringTasks.map((t) => t.task.id),
      ...repairTasks.map((t) => t.task.id),
    ]);

    const newAvailableTasks = allTasks
      .filter((task) => !usedTaskIds.has(task.id))
      .map((task) => ({
        id: "",
        task: {
          taskType: "Repair" as const,
          taskTracking: null,
          task: {
            value: task.id,
            label: task.description,
          },
          priority: undefined,
          checked: true,
        },
        parts: [],
        labor: [],
        completed: false,
      }));

    const groupedTasks = [
      {
        label: "PM Tasks",
        options: formattedRecurringTasks,
      },
      {
        label: "Repair Tasks",
        options: [...formattedRepairTasks, ...newAvailableTasks],
      },
    ];

    return groupedTasks;
  } catch (error) {
    console.error("Error fetching tasks by equipment id:", error);
    throw new Error("Failed to fetch tasks.");
  }
}




//////////////////////////////////// RECEIPTS //////////////////////////////////

export async function fetchReceiptsPages(query: string) {
  try {
    const count = await prisma.equipment.count({
      where: {
        description: {
          contains: query,
          mode: "insensitive", // case-insensitive search
        },
      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Error fetching total number of inventory items:", error);
    throw new Error("Failed to fetch total number of inventory items.");
  }
}

export async function fetchFilteredReceipts(
  inventoryId: string,
  query: string,
  currentPage: number
) {
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const receipts = await prisma.receipt.findMany({
      where: {
        inventoryId: inventoryId,
        AND: [
          {
            OR: [
              { description: { contains: query, mode: 'insensitive' } },
              { description: null },
            ],
          },
          {
            OR: [
              { purchaseOrder: { poStatus: { equals: 'Close' } } },
              { purchaseOrder: null },
            ],
          },
        ],
      },
      select: {
        id: true,
        date: true,
        description: true,
        qtyReceived: true,
        qtyRemaining: true,
        unitCostDollar: true,
        unitCostVES: true,
        vendor: true,
        purchaseOrder: true,
        createdAt: true,
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return receipts;
  } catch (error) {
    console.error("Error fetching filtered receipts:", error);
    throw new Error("Failed to fetch filtered receipts.");
  }
}


export async function fetchFilteredReceiptsPages(  
  inventoryId: string,
  query: string
) {
  try {
    // Fetch items based on the query conditions
    const receiptsCount = await prisma.receipt.count({
      where: {
        inventoryId: inventoryId,
        description: {
          contains: query, // Case-insensitive partial match
          mode: 'insensitive', // Optional: Makes the search case-insensitive
        }
      },
    });

    const totalPages = Math.ceil(receiptsCount / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Error fetching total number of inventory items:", error);
    throw new Error("Failed to fetch total number of inventory items.");
  }
}

export async function fetchReceipts(inventoryId: string) {
  noStore();
  try {

    const receipts = await prisma.receipt.findMany({
      where: {
        inventoryId: inventoryId,
      },
    })

    return receipts
    
  } catch (error) {
    
  }
}

export async function fetchReceiptById(id: string) {
  noStore();
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        purchaseOrderId: true,
        qtyOrdered: true,
        qtyReceived: true,
        qtyRemaining: true,
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
            id: true,
            item: {
              select: {
                id: true,
                partNumber: true,
                name: true,
                description: true,
                quantity: true,
              }
            }
          }
        }
      },
    });

    if (!receipt) {
      throw new Error(`Receipt with ID ${id} not found.`);
    }

    // Transform both vendor and item fields to a { value, label } format
    const transformedReceipt = {
      ...receipt,
      vendor: receipt.vendor
        ? { value: receipt.vendor.id, label: receipt.vendor.name }
        : null,
      item: { value: receipt.inventory.id, label: receipt.inventory.item.partNumber },

    };

    return transformedReceipt;
  } catch (error) {
    console.error("Error fetching receipt by ID:", error);
    throw error;
  }
}


export async function fetchLatestReceiptByItemId(itemId: string) {
  noStore();
  try {
    const receipt = await prisma.receipt.findFirst({
      where: { 
        inventoryId: itemId
       },
      orderBy: { date: "desc" },
      select: {
        id: true,
        unitCostDollar: true,
        unitCostVES: true,
        vendor: true,
        inventory: {
          select: {
            location: true,
            item: {
              select: {
                id: true,
                partNumber: true,
                unitType: {
                  select: {
                    name: true,
                  },
                },
              }
            }
          }
        }
      },
    });

    if (!receipt) return null;

    return {
      id: receipt.id,
      qtyIssued: 0, // Default value, as it's not part of the receipt data
      item: {
        value: receipt.inventory.item.id,
        label: receipt.inventory.item.partNumber,
      },
      location: receipt.inventory.location,
      vendor: receipt.vendor || "",
      unitType: receipt.inventory.item.unitType?.name || "",
      unitCostDollar: receipt.unitCostDollar || 0,
      unitCostVES: receipt.unitCostVES || 0,
    };
  } catch (error) {
    console.error("Error fetching latest receipt by item ID:", error);
    throw error;
  }
}

interface Option4 {
  value: string; 
  label: string;
  description: string;
  vendor: string | null;
  location: string;
  quantity: number;
  qtyRemaining: number;
  unitType: string;
  unitCostDollar: number;
  unitCostVES: number;
  warehouse: string;
}

export async function fetchSelectItemswithReceipt(
  query: string,
  warehouseId: string
): Promise<Record<string, Option4[]>> {
  try {
    noStore();
    const inventoryData = await prisma.inventory.findMany({
      where: {
        // warehouseId: warehouseId, // Filter inventory by warehouse
        item: {
          OR: [
            { partNumber: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      },
      select: {
        id: true,
        quantity: true,
        reorderQuantity: true,
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        location: true,
        // Join the related item data
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
        // Get the first receipt (if available)
        receipts: {
          where: {
            qtyRemaining: {gt:0}
          },
          take: 1,
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            unitCostDollar: true,
            unitCostVES: true,
            vendor: {
              select: {
                name: true,
              },
            },
            qtyRemaining: true,
          },
        },
      },
    });

    // Group the data by warehouse name
    return inventoryData.reduce((groups, inventory) => {
      const warehouseName = inventory.warehouse.name;

      if (!groups[warehouseName]) {
        groups[warehouseName] = [];
      }

      const receipt =
        inventory.receipts && inventory.receipts.length > 0 ? inventory.receipts[0] : null;

      groups[warehouseName].push({
        value: inventory.id,
        label: inventory.item.partNumber,
        description: inventory.item.description || '',
        vendor: receipt?.vendor?.name || null,
        location: inventory.location || "Unknown",
        quantity: inventory.quantity,
        qtyRemaining: receipt?.qtyRemaining || 0,
        unitType: inventory.item.unitType?.name || '',
        unitCostDollar: receipt?.unitCostDollar || 0,
        unitCostVES: receipt?.unitCostVES || 0,
        warehouse: inventory.warehouse.id,
      });

      return groups;
    }, {} as Record<string, Option4[]>);
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
}

//////////////////////////////////// ISSUANCES //////////////////////////////////

export async function fetchFilteredIssuances(
  inventoryId: string,
  query: string,
  currentPage: number
) {
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const issuances = await prisma.issuance.findMany({
      where: {
        inventoryId: inventoryId,
        description: {
          contains: query, // Case-insensitive partial match
          mode: 'insensitive', // Optional: Makes the search case-insensitive
        }
      },
      select: {
        id: true,
        date: true,
        description: true,
        qtyIssued: true,
        equipment: {
          select: {
            id: true,
            unitNumber: true
          }
        },
        WorkOrderTask: {
          select: {
            workOrder: {
              select: {
                woNumber: true
              }
            }
          }
        },
        receipt:{
          select: {
            unitCostDollar: true,
            unitCostVES: true
          }
        }
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      orderBy: {
        createdAt: 'desc', // Sort by `createdAt` in descending order
      },
    });

    return issuances;
  } catch (error) {
    console.error("Error fetching filtered receipts:", error);
    throw new Error("Failed to fetch filtered receipts.");
  }
}

export async function fetchFilteredIssuancesPages(  
  inventoryId: string,
  query: string
) {
  try {
    // Fetch items based on the query conditions
    const issuancesCount = await prisma.issuance.count({
      where: {
        inventoryId: inventoryId,
        description: {
          contains: query, // Case-insensitive partial match
          mode: 'insensitive', // Optional: Makes the search case-insensitive
        }
      },
    });

    const totalPages = Math.ceil(issuancesCount / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Error fetching total number of inventory items:", error);
    throw new Error("Failed to fetch total number of inventory items.");
  }
}

export async function fetchIssuanceById(id: string) {
  noStore();
  try {
    const issuance = await prisma.issuance.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        description: true,
        equipment: {
          select: {
            id: true,
            unitNumber: true
          }
        },
        qtyIssued: true,
        receipt: {
          select: {
            unitCostDollar: true,
            unitCostVES: true
          }
        },
        inventory: {
          select: {
            item: {
              select: {
                id: true,
                partNumber: true,
              }
            }
          }
        }
      },
    });

    if (!issuance) {
      throw new Error(`Receipt with ID ${id} not found.`);
    }

    // Transform both vendor and item fields to a { value, label } format
    const transformedIssuance = {
      ...issuance,
      equipment: issuance.equipment
        ? { value: issuance.equipment.id, label: issuance.equipment.unitNumber }
        : null,
      item: { value: issuance.inventory.item.id, label: issuance.inventory.item.partNumber },
    };

    return transformedIssuance;
  } catch (error) {
    console.error("Error fetching receipt by ID:", error);
    throw error;
  }
}