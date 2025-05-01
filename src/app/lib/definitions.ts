// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

import { z } from "zod";
import { 
  TaskSchema, 
  RecurringTaskSchema, 
  EquipmentSchema, 
  TaskItemSchema,
  TaskTrackingSchema, 
  ReceiptSchema,  
  IssuanceSchema,
  VendorTypeSchema,
  EmployeeStatusSchema,
  AdminTypeSchema,
  RepairTaskSchema,
  TaskTypeSchema,
  WorkOrderSchema,
  PurchaseOrderSchema,
  VendorSchema,
  EmployeeSchema,
  ItemSchema,
  MeterReadingSchema,
  LaborSchema,
  DateNextDueSchema,
  PrimaryNextDueSchema,
  SecondaryNextDueSchema
 } from "./zod";

//////////////////////////////////// OPTION //////////////////////////////////

// Reusable schema for value-label pair
const OptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export type Option = z.infer<typeof OptionSchema>;

//////////////////////////////////// REPAIR TASK //////////////////////////////////

export const RepairTaskFormSchema = RepairTaskSchema.pick({
  id: true,
  notes: true,
}).extend({
  taskType: OptionSchema,
  priority: OptionSchema.nullable(),
  equipment: OptionSchema.nullable(),
  task: OptionSchema.nullable().refine(
    (val) => val !== null && val.value !== undefined && val.label !== undefined,
    { message: "Please specify a valid vendor type" }
  ), // Ensure it is not null and contains valid value and label,
  employee: OptionSchema.nullable(),
  repairType: OptionSchema.nullable(),
  taskTracking: TaskTrackingSchema
  .extend({
    DateNextDue: z.array(DateNextDueSchema.omit({taskTrackingId: true})),
    PrimaryNextDue: z.array(PrimaryNextDueSchema.omit({taskTrackingId: true})),
    SecondaryNextDue: z.array(SecondaryNextDueSchema.omit({taskTrackingId: true}))
  }).nullable(),
})

export type RepairTaskFormValues = z.infer<typeof RepairTaskFormSchema>;


//////////////////////////////////// RECURRING TASK //////////////////////////////////

export const RecurringTaskFormSchema = RecurringTaskSchema.pick({
  id: true,
  equipmentId: true,
  taskType: true,
  maintenanceTemplateId: true,
}).extend({
  taskStatus: OptionSchema.nullable(),
  task: OptionSchema.nullable().refine(
    (val) => val !== null && val.value !== undefined && val.label !== undefined,
    { message: "Please select a task" }
  ), // Ensure it is not null and contains valid value and label
  taskItem: z.array(
    TaskItemSchema.pick({
      id: true,
      quantity: true,
      recurringTaskId: true,
    }).extend({
      item: ItemSchema.pick({
        name: true,
        description: true,
        quantity: true,
      })
        .extend({
          value: z.string(),
          label: z.string(),
          unitCostDollar: z.number(),
        })
        .nullable()
        .refine(
          (val) => val === null || (typeof val.value === "string" && typeof val.label === "string"),
          { message: "Item must have value and label if not null" }
        ),
    })
  ),  
  taskTracking: TaskTrackingSchema
  .extend({
    DateNextDue: z.array(DateNextDueSchema.omit({taskTrackingId: true})),
    PrimaryNextDue: z.array(PrimaryNextDueSchema.omit({taskTrackingId: true})),
    SecondaryNextDue: z.array(SecondaryNextDueSchema.omit({taskTrackingId: true}))
  }).nullable(),
});



export type RecurringTaskFormValues = z.infer<typeof RecurringTaskFormSchema>;


//////////////////////////////////// EQUIPMENT //////////////////////////////////

export const EquipmentFormSchema = EquipmentSchema.pick({
  id: true,
  unitNumber: true,
  description: true,
  year: true,
  keywords: true,
  serial: true,
  tag: true,
  meterTracking: true,
  primaryMeterReading: true,
  secondaryMeterReading: true,
}).extend({
  equipmentType: OptionSchema.nullable(),
  make: OptionSchema.nullable(),
  model: OptionSchema.nullable(),
  primaryMeter: OptionSchema.nullable(),
  secondaryMeter: OptionSchema.nullable(),
  // repairTask: z.array(RepairTaskFormSchema),
  // recurringTask: z.array(RecurringTaskFormSchema)
})

export type EquipmentFormValues = z.infer<typeof EquipmentFormSchema>

export const TaskDetailsSchema = z.array(
  z.object({
    repairTask: RepairTaskSchema.pick({
      id: true,
      equipmentId: true,
      // dueBy: true,
      notes: true,
    }).extend({
      employee: EmployeeSchema.pick({
        firstName: true,
        lastName: true,
      }).nullable(),
      task: TaskSchema.pick({
        description: true,
      }),
      taskTracking: TaskTrackingSchema.pick({
        dateNextDue: true,
      }).nullable(),
    }).nullable(),
    recurringTask: RecurringTaskSchema.pick({
      id: true,
      equipmentId: true,
    }).extend({
      task: TaskSchema.pick({
        description: true,
      }),
      taskTracking: TaskTrackingSchema.extend({
        DateNextDue: z.array(z.date()),
        PrimaryNextDue: z.array(z.number()),
        SecondaryNextDue: z.array(z.number()),
      }).nullable(),
    }).nullable(),
  })
);

export type TaskDetails = z.infer<typeof TaskDetailsSchema>;

//////////////////////////////////// INVENTORY //////////////////////////////////

export const InventoryFormSchema = z.object({
  id: z.string(),
  partNumber: z.string().min(1, { message: "Part number must not be empty" }),
  name: z.string().nullable(),
  description: z.string().nullable(),
  category: OptionSchema.nullable(),
  unitType: OptionSchema.nullable(),
  inventory: z.array(
    z.object({
      id: z.string(),
      warehouse: OptionSchema.nullable(),
      quantity: z.number().min(1, { message: "Quantity must be greater than 0" }),
      reorderQuantity: z.number(),
      lowStockLevel: z.number(),
      unitCostDollar: z.number(),
      unitCostVES: z.number(),
      location: z.string(),
    }).superRefine((data, ctx) => {
      // Check that warehouse is not null.
      if (data.warehouse === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a warehouse",
          path: ["warehouse"],
        });
      }
    })
  ),
  vendors: z.array(
    z.object({
      id: z.string(),
      vendor: OptionSchema.nullable(),
      manufacturer: OptionSchema.nullable(),
      vendorPartNumber: z.string(),
      barcode: z.string(),
    })
  ),
});

export type InventoryFormValues = z.infer<typeof InventoryFormSchema>;

//////////////////////////////////// RECEIPT //////////////////////////////////

export const ReceiptFormSchema = ReceiptSchema.pick({
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
}).extend({
  vendor: OptionSchema.nullable(),
  item: ItemSchema.pick({
    name: true, 
    description: true,
    quantity: true
  }).extend({
    value: z.string(),
    label: z.string()
  })
  .nullable().refine((val) => val === null || (val.value !== undefined && val.label !== undefined), {
    message: "Please select priority",
  }), // Ensure it is not null and contains a valid value and label,
})

// .superRefine((data, ctx) => {
//   if (data.qtyReceived > data.qtyOrdered) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Quantity received cannot be greater than quantity ordered",
//       path: ["qtyReceived"], // This points the error to qtyReceived
//     });
//   }
// })

export type ReceiptFormValues = z.infer<typeof ReceiptFormSchema>;

//////////////////////////////////// PURCHASE ORDERS //////////////////////////////////


export const PurchaseOrderFormSchema = PurchaseOrderSchema.pick({
  id: true,
  dateOpened: true,
  dateRequired: true,
  invoice: true,
  workOrder: true,
  notes: true,
  poNumber: true,
  poStatus: true,
  tax1: true,
  tax2: true,
  freight: true,
}).extend({
  taxBy: OptionSchema,
  warehouse: OptionSchema.nullable().refine(
    (val) => val !== null && val.value !== undefined && val.label !== undefined,
    { message: "Please select a warehouse" }
  ), // Ensure it is not null and contains valid value and label,
  vendor: OptionSchema.nullable(),
  buyer: OptionSchema.nullable(),
  terms: OptionSchema.nullable(),
  shipVia: OptionSchema.nullable(),
  receipts: z.array(ReceiptFormSchema)
});

export type PurchaseOrderFormValues = z.infer<typeof PurchaseOrderFormSchema>;

export const PurchaseOrderItemsFormSchema = PurchaseOrderFormSchema.pick({
  id: true,
  warehouse: true,
  poStatus: true,
  taxBy: true,
  tax1: true,
  tax2: true,
  freight: true,
  receipts: true
})

export type PurchaseOrderItemsFormValues = z.infer<typeof PurchaseOrderItemsFormSchema>;

//////////////////////////////////// LABOR //////////////////////////////////

export const LaborFormSchema = LaborSchema.pick({
  id: true,
  date: true,
  hours: true,
  laborRate: true,
  workOrderTaskId: true,
}).extend({
  employee: z.object({
    value: z.string(),
    label: z.string(),
    laborRate: z.number(), 
  })
})

export type LaborFormValues = z.infer<typeof LaborFormSchema>;

//////////////////////////////////// ISSUANCE //////////////////////////////////

export const IssuanceFormSchema = IssuanceSchema.pick({
  id: true,
  date: true,
  qtyIssued: true,
  description: true,
  receiptId: true,
  workOrderTaskId: true,
}).extend({
  equipment: OptionSchema.nullable(),
  item: z.object({
    value: z.string(),
    label: z.string(),
    quantity: z.number(),
    qtyRemaining: z.number(),
    location: z.string(),
    unitCostDollar: z.number(),
    unitCostVES: z.number(),
    unitType: z.string(),
    vendor: z.string().nullable(),
    warehouse: z.string(),
  }),
})

export type IssuanceFormValues = z.infer<typeof IssuanceFormSchema>;

//////////////////////////////////// WORK ORDERS //////////////////////////////////


export const WorkOrderFormSchema = WorkOrderSchema.pick({
  id: true,
  scheduled: true,
  due: true,
  dateStarted: true,
  dateCompleted: true,
  notes: true,
  woStatus: true,
  primaryMeterReading: true,
  secondaryMeterReading: true,
  tax1: true,
  tax2: true
}).extend({
  tasks: z.array(
    z.object({
      id: z.string(),
      task: z.discriminatedUnion("taskType", [
        RecurringTaskSchema.pick({
        }).extend({
          taskType: z.literal("Recurring"),
          task: OptionSchema,
          taskTracking: TaskTrackingSchema
          .extend({
            DateNextDue: z.array(DateNextDueSchema.omit({taskTrackingId: true})),
            PrimaryNextDue: z.array(PrimaryNextDueSchema.omit({taskTrackingId: true})),
            SecondaryNextDue: z.array(SecondaryNextDueSchema.omit({taskTrackingId: true}))
          }).nullable(),
          checked: z.boolean().optional(),
        }),
        RepairTaskSchema.pick({
        }).extend({
          taskType: z.literal("Repair"),
          task: OptionSchema,
          taskTracking: TaskTrackingSchema
          .extend({
            DateNextDue: z.array(DateNextDueSchema.omit({taskTrackingId: true})),
            PrimaryNextDue: z.array(PrimaryNextDueSchema.omit({taskTrackingId: true})),
            SecondaryNextDue: z.array(SecondaryNextDueSchema.omit({taskTrackingId: true}))
          }).nullable(),
          priority: z.string().optional(), // ✅ Make priority optional
          checked: z.boolean().optional(),
        }),
      ]).nullable(),
      parts: z.array(IssuanceFormSchema),
      labor: z.array(LaborFormSchema),
      completed: z.boolean().optional(),
    })
  ),
  equipment: z.object({
    value: z.string(),
    label: z.string(),
    description: z.string().optional(),
    primaryMeter: MeterReadingSchema.optional(),
    secondaryMeter: MeterReadingSchema.optional()
  })
    .nullable()
    .refine((val) => val === null || (val.value !== undefined && val.label !== undefined), {
      message: "Please select an equipment",
    }), // Ensure it is not null and contains a valid value and label
  
  employee: OptionSchema.nullable(),
  workOrderType: OptionSchema.nullable(),
  priority: OptionSchema
    .nullable()
    .refine((val) => val === null || (val.value !== undefined && val.label !== undefined), {
      message: "Please select priority",
    }), // Ensure it is not null and contains a valid value and label
});


export type WorkOrderFormValues = z.infer<typeof WorkOrderFormSchema>;

// export const WorkOrderItemsFormSchema = WorkOrderFormSchema.shape.tasks.element.shape.parts.element;

// export type WorkOrderItemsFormValues = z.infer<typeof WorkOrderItemsFormSchema>;

//////////////////////////////////// EMPLOYEE //////////////////////////////////

export const EmployeeFormSchema = EmployeeSchema.extend({
  adminType: z
    .object({
      value: AdminTypeSchema, // Enum value (Supplier, Distributor, Manufacturer)
      label: z.string(), // Label for the enum value (e.g., 'Supplier')
    }),
  employeeStatus: z
    .object({
      value: EmployeeStatusSchema, // Enum value (Supplier, Distributor, Manufacturer)
      label: z.string(), // Label for the enum value (e.g., 'Supplier')
    })
}).superRefine((data, ctx) => {
  // Conditionally validate the email field if loginAllowed is true
  if (data.loginAllowed && !data.email) {
    ctx.addIssue({
      path: ['email'],
      message: "Email is required if login is allowed",
      code: z.ZodIssueCode.custom,
    });
  }
});

export type EmployeeFormValues = z.infer<typeof EmployeeFormSchema>;

//////////////////////////////////// VENDOR //////////////////////////////////

export const VendorFormSchema = VendorSchema.extend({
  vendorType: z
    .object({
      value: VendorTypeSchema, // still strict
      label: z.string(),        // allow translated label
    })
    .nullable()
    .refine(
      (val) => val !== null && val.value !== undefined && val.label !== undefined,
      { message: "Please specify a valid vendor type" }
    ),
});

export type VendorFormValues = z.infer<typeof VendorFormSchema>;
