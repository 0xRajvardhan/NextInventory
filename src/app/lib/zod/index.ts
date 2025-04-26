import { z } from 'zod';
import type { Prisma } from '@prisma/client';
// import { isValidPhoneNumber } from 'libphonenumber-js';
import { phoneNumberSchema } from './customValidators';
/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const EquipmentScalarFieldEnumSchema = z.enum(['id','unitNumber','description','year','keywords','serial','tag','meterTracking','primaryMeter','primaryMeterReading','secondaryMeter','secondaryMeterReading','equipmentTypeId','makeId','modelId']);

export const MakeScalarFieldEnumSchema = z.enum(['id','name']);

export const ModelScalarFieldEnumSchema = z.enum(['id','name']);

export const EquipmentTypeScalarFieldEnumSchema = z.enum(['id','name']);

export const ItemScalarFieldEnumSchema = z.enum(['id','partNumber','name','description','categoryId','quantity','unitTypeId']);

export const UnitTypeScalarFieldEnumSchema = z.enum(['id','name']);

export const CategoriesScalarFieldEnumSchema = z.enum(['id','name']);

export const WarehouseScalarFieldEnumSchema = z.enum(['id','name','tax1','tax2']);

export const VendorScalarFieldEnumSchema = z.enum(['id','name','contact','vendorType','phone','keywords','address']);

export const ItemVendorScalarFieldEnumSchema = z.enum(['id','itemId','vendorId','manufacturerId','vendorPartNumber','barcode']);

export const ManufacturerScalarFieldEnumSchema = z.enum(['id','name']);

export const InventoryScalarFieldEnumSchema = z.enum(['id','quantity','reorderQuantity','lowStockLevel','unitCostDollar','location','itemId','warehouseId','unitCostVES']);

export const PurchaseOrderScalarFieldEnumSchema = z.enum(['id','poNumber','dateOpened','dateRequired','shipVia','invoice','workOrder','notes','poStatus','taxBy','tax1','tax2','freight','buyerId','termsId','warehouseId','vendorId']);

export const ReceiptScalarFieldEnumSchema = z.enum(['id','date','description','invoice','qtyOrdered','qtyReceived','qtyRemaining','unitCostDollar','unitCostVES','tax1','tax2','createdAt','updatedAt','inventoryId','vendorId','purchaseOrderId']);

export const IssuanceScalarFieldEnumSchema = z.enum(['id','date','description','qtyIssued','unitCostDollar','unitCostVES','createdAt','updatedAt','inventoryId','receiptId','equipmentId','workOrderTaskId']);

export const TermsScalarFieldEnumSchema = z.enum(['id','name']);

export const WorkOrderScalarFieldEnumSchema = z.enum(['id','woNumber','scheduled','due','dateStarted','dateCompleted','priority','workOrderType','notes','woStatus','employeeId','equipmentId','tax1','tax2','primaryMeterReading','secondaryMeterReading']);

export const LaborScalarFieldEnumSchema = z.enum(['id','date','hours','laborRate','employeeId','workOrderTaskId']);

export const WorkOrderTaskScalarFieldEnumSchema = z.enum(['id','completed','workOrderId','repairTaskId','recurringTaskId']);

export const RecurringTaskScalarFieldEnumSchema = z.enum(['id','taskStatus','taskType','taskId','equipmentId','maintenanceTemplateId']);

export const RepairTaskScalarFieldEnumSchema = z.enum(['id','equipmentId','taskType','priority','notes','completed','taskId','employeeId','repairTypeId']);

export const RepairTypeScalarFieldEnumSchema = z.enum(['id','name']);

export const TaskScalarFieldEnumSchema = z.enum(['id','description','maintenanceTemplateId']);

export const TaskItemScalarFieldEnumSchema = z.enum(['id','quantity','recurringTaskId','inventoryId']);

export const TaskTrackingScalarFieldEnumSchema = z.enum(['id','trackByDate','trackByDateEvery','dateInterval','dateAdvanceNotice','dateNextDue','dateLastPerformed','trackByPrimary','trackByPrimaryEvery','primaryMeterType','primaryInterval','primaryAdvanceNotice','primaryNextDue','primaryLastPerformed','trackBySecondary','trackBySecondaryEvery','secondaryMeterType','secondaryInterval','secondaryAdvanceNotice','secondaryNextDue','secondaryLastPerformed','recurringTaskId','repairTaskId']);

export const DateNextDueScalarFieldEnumSchema = z.enum(['id','taskTrackingId','dateNextDue']);

export const PrimaryNextDueScalarFieldEnumSchema = z.enum(['id','taskTrackingId','primaryNextDue']);

export const SecondaryNextDueScalarFieldEnumSchema = z.enum(['id','taskTrackingId','secondaryNextDue']);

export const MaintenanceTemplateScalarFieldEnumSchema = z.enum(['id','name']);

export const EmployeeScalarFieldEnumSchema = z.enum(['id','firstName','lastName','phone','employeeStatus','laborRate','loginAllowed','email','adminType','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const EquipmentOrderByRelevanceFieldEnumSchema = z.enum(['id','unitNumber','description','keywords','serial','tag','equipmentTypeId','makeId','modelId']);

export const MakeOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const ModelOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const EquipmentTypeOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const ItemOrderByRelevanceFieldEnumSchema = z.enum(['id','partNumber','name','description','categoryId','unitTypeId']);

export const UnitTypeOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const CategoriesOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const WarehouseOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const VendorOrderByRelevanceFieldEnumSchema = z.enum(['id','name','contact','phone','keywords','address']);

export const ItemVendorOrderByRelevanceFieldEnumSchema = z.enum(['id','itemId','vendorId','manufacturerId','vendorPartNumber','barcode']);

export const ManufacturerOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const InventoryOrderByRelevanceFieldEnumSchema = z.enum(['id','location','itemId','warehouseId']);

export const PurchaseOrderOrderByRelevanceFieldEnumSchema = z.enum(['id','invoice','notes','buyerId','termsId','warehouseId','vendorId']);

export const ReceiptOrderByRelevanceFieldEnumSchema = z.enum(['id','description','invoice','inventoryId','vendorId','purchaseOrderId']);

export const IssuanceOrderByRelevanceFieldEnumSchema = z.enum(['id','description','inventoryId','receiptId','equipmentId','workOrderTaskId']);

export const TermsOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const WorkOrderOrderByRelevanceFieldEnumSchema = z.enum(['id','workOrderType','notes','employeeId','equipmentId']);

export const LaborOrderByRelevanceFieldEnumSchema = z.enum(['id','employeeId','workOrderTaskId']);

export const WorkOrderTaskOrderByRelevanceFieldEnumSchema = z.enum(['id','workOrderId','repairTaskId','recurringTaskId']);

export const RecurringTaskOrderByRelevanceFieldEnumSchema = z.enum(['id','taskId','equipmentId','maintenanceTemplateId']);

export const RepairTaskOrderByRelevanceFieldEnumSchema = z.enum(['id','equipmentId','notes','taskId','employeeId','repairTypeId']);

export const RepairTypeOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const TaskOrderByRelevanceFieldEnumSchema = z.enum(['id','description','maintenanceTemplateId']);

export const TaskItemOrderByRelevanceFieldEnumSchema = z.enum(['id','recurringTaskId','inventoryId']);

export const TaskTrackingOrderByRelevanceFieldEnumSchema = z.enum(['id','recurringTaskId','repairTaskId']);

export const DateNextDueOrderByRelevanceFieldEnumSchema = z.enum(['id','taskTrackingId']);

export const PrimaryNextDueOrderByRelevanceFieldEnumSchema = z.enum(['id','taskTrackingId']);

export const SecondaryNextDueOrderByRelevanceFieldEnumSchema = z.enum(['id','taskTrackingId']);

export const MaintenanceTemplateOrderByRelevanceFieldEnumSchema = z.enum(['id','name']);

export const EmployeeOrderByRelevanceFieldEnumSchema = z.enum(['id','firstName','lastName','phone','email']);

export const MeterReadingSchema = z.enum(['None','Hours','Kilometers','Miles','Date']);

export type MeterReadingType = `${z.infer<typeof MeterReadingSchema>}`

export const VendorTypeSchema = z.enum(['Supplier','Distributor','Manufacturer']);

export type VendorTypeType = `${z.infer<typeof VendorTypeSchema>}`

export const StatusTypeSchema = z.enum(['Requisition','Ordered','Received_Partial','Received','Close']);

export type StatusTypeType = `${z.infer<typeof StatusTypeSchema>}`

export const TaxBySchema = z.enum(['Both','None','One','Two']);

export type TaxByType = `${z.infer<typeof TaxBySchema>}`

export const ShippingSchema = z.enum(['Air','Courier','Expedited','Ground','Next_Day']);

export type ShippingType = `${z.infer<typeof ShippingSchema>}`

export const PrioritySchema = z.enum(['Low','Normal','High','Urgent']);

export type PriorityType = `${z.infer<typeof PrioritySchema>}`

export const TaskTypeSchema = z.enum(['Recurring','Repair','Renewal']);

export type TaskTypeType = `${z.infer<typeof TaskTypeSchema>}`

export const TaskStatusSchema = z.enum(['Active','Inactive']);

export type TaskStatusType = `${z.infer<typeof TaskStatusSchema>}`

export const WorkOrderStatusSchema = z.enum(['Open','In_Progress','On_Hold','Complete']);

export type WorkOrderStatusType = `${z.infer<typeof WorkOrderStatusSchema>}`

export const AdminTypeSchema = z.enum(['Admin','Standard','Operator']);

export type AdminTypeType = `${z.infer<typeof AdminTypeSchema>}`

export const EmployeeStatusSchema = z.enum(['Active','Inactive']);

export type EmployeeStatusType = `${z.infer<typeof EmployeeStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// EQUIPMENT SCHEMA
/////////////////////////////////////////

export const EquipmentSchema = z.object({
  primaryMeter: MeterReadingSchema.nullable(),
  secondaryMeter: MeterReadingSchema.nullable(),
  id: z.string(),
  unitNumber: z.string(),
  description: z.string(),
  year: z.number().int(),
  keywords: z.string(),
  serial: z.string(),
  tag: z.string(),
  meterTracking: z.boolean(),
  primaryMeterReading: z.number().nullable(),
  secondaryMeterReading: z.number().nullable(),
  equipmentTypeId: z.string().nullable(),
  makeId: z.string().nullable(),
  modelId: z.string().nullable(),
})

export type Equipment = z.infer<typeof EquipmentSchema>

/////////////////////////////////////////
// MAKE SCHEMA
/////////////////////////////////////////

export const MakeSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Make = z.infer<typeof MakeSchema>

/////////////////////////////////////////
// MODEL SCHEMA
/////////////////////////////////////////

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Model = z.infer<typeof ModelSchema>

/////////////////////////////////////////
// EQUIPMENT TYPE SCHEMA
/////////////////////////////////////////

export const EquipmentTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type EquipmentType = z.infer<typeof EquipmentTypeSchema>

/////////////////////////////////////////
// ITEM SCHEMA
/////////////////////////////////////////

export const ItemSchema = z.object({
  id: z.string(),
  partNumber: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  quantity: z.number().int(),
  unitTypeId: z.string().nullable(),
})

export type Item = z.infer<typeof ItemSchema>

/////////////////////////////////////////
// UNIT TYPE SCHEMA
/////////////////////////////////////////

export const UnitTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type UnitType = z.infer<typeof UnitTypeSchema>

/////////////////////////////////////////
// CATEGORIES SCHEMA
/////////////////////////////////////////

export const CategoriesSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Categories = z.infer<typeof CategoriesSchema>

/////////////////////////////////////////
// WAREHOUSE SCHEMA
/////////////////////////////////////////

export const WarehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  tax1: z.number().nullable(),
  tax2: z.number().nullable(),
})

export type Warehouse = z.infer<typeof WarehouseSchema>

/////////////////////////////////////////
// VENDOR SCHEMA
/////////////////////////////////////////

export const VendorSchema = z.object({
  vendorType: VendorTypeSchema,
  id: z.string(),
  name: z.string().min(1),
  contact: z.string(),
  // phone: z.string().refine((value) => isValidPhoneNumber(value), { message: "Invalid phone number" }),
  phone: phoneNumberSchema,
  keywords: z.string(),
  address: z.string(),
})

export type Vendor = z.infer<typeof VendorSchema>

/////////////////////////////////////////
// ITEM VENDOR SCHEMA
/////////////////////////////////////////

export const ItemVendorSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  vendorId: z.string().nullable(),
  manufacturerId: z.string().nullable(),
  vendorPartNumber: z.string().nullable(),
  barcode: z.string().nullable(),
})

export type ItemVendor = z.infer<typeof ItemVendorSchema>

/////////////////////////////////////////
// MANUFACTURER SCHEMA
/////////////////////////////////////////

export const ManufacturerSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Manufacturer = z.infer<typeof ManufacturerSchema>

/////////////////////////////////////////
// INVENTORY SCHEMA
/////////////////////////////////////////

export const InventorySchema = z.object({
  id: z.string(),
  quantity: z.number(),
  reorderQuantity: z.number(),
  lowStockLevel: z.number(),
  unitCostDollar: z.number(),
  location: z.string(),
  itemId: z.string(),
  warehouseId: z.string(),
  unitCostVES: z.number(),
})

export type Inventory = z.infer<typeof InventorySchema>

/////////////////////////////////////////
// PURCHASE ORDER SCHEMA
/////////////////////////////////////////

export const PurchaseOrderSchema = z.object({
  shipVia: ShippingSchema.nullable(),
  poStatus: StatusTypeSchema,
  taxBy: TaxBySchema,
  id: z.string(),
  poNumber: z.number().int(),
  dateOpened: z.coerce.date(),
  dateRequired: z.coerce.date().nullable(),
  invoice: z.string().nullable(),
  workOrder: z.number().int().nullable(),
  notes: z.string().nullable(),
  tax1: z.number(),
  tax2: z.number(),
  freight: z.number(),
  buyerId: z.string().nullable(),
  termsId: z.string().nullable(),
  warehouseId: z.string(),
  vendorId: z.string().nullable(),
})

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>

/////////////////////////////////////////
// RECEIPT SCHEMA
/////////////////////////////////////////

export const ReceiptSchema = z.object({
  id: z.string(),
  date: z.coerce.date().nullable(),
  description: z.string().nullable(),
  invoice: z.string().nullable(),
  qtyOrdered: z.number().int(),
  qtyReceived: z.number().int(),
  qtyRemaining: z.number().int(),
  unitCostDollar: z.number(),
  unitCostVES: z.number(),
  tax1: z.number().nullable(),
  tax2: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  inventoryId: z.string(),
  vendorId: z.string().nullable(),
  purchaseOrderId: z.string().nullable(),
})

export type Receipt = z.infer<typeof ReceiptSchema>

/////////////////////////////////////////
// ISSUANCE SCHEMA
/////////////////////////////////////////

export const IssuanceSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  description: z.string().nullable(),
  qtyIssued: z.number().int(),
  unitCostDollar: z.number().nullable(),
  unitCostVES: z.number().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  inventoryId: z.string(),
  receiptId: z.string(),
  equipmentId: z.string().nullable(),
  workOrderTaskId: z.string().nullable(),
})

export type Issuance = z.infer<typeof IssuanceSchema>

/////////////////////////////////////////
// TERMS SCHEMA
/////////////////////////////////////////

export const TermsSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Terms = z.infer<typeof TermsSchema>

/////////////////////////////////////////
// WORK ORDER SCHEMA
/////////////////////////////////////////

export const WorkOrderSchema = z.object({
  priority: PrioritySchema,
  woStatus: WorkOrderStatusSchema,
  id: z.string(),
  woNumber: z.number().int(),
  scheduled: z.coerce.date(),
  due: z.coerce.date().nullable(),
  dateStarted: z.coerce.date().nullable(),
  dateCompleted: z.coerce.date().nullable(),
  workOrderType: z.string().nullable(),
  notes: z.string().nullable(),
  employeeId: z.string().nullable(),
  equipmentId: z.string(),
  tax1: z.number(),
  tax2: z.number(),
  primaryMeterReading: z.number().nullable(),
  secondaryMeterReading: z.number().nullable(),
})

export type WorkOrder = z.infer<typeof WorkOrderSchema>

/////////////////////////////////////////
// LABOR SCHEMA
/////////////////////////////////////////

export const LaborSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  hours: z.number(),
  laborRate: z.number(),
  employeeId: z.string(),
  workOrderTaskId: z.string().nullable(),
})

export type Labor = z.infer<typeof LaborSchema>

/////////////////////////////////////////
// WORK ORDER TASK SCHEMA
/////////////////////////////////////////

export const WorkOrderTaskSchema = z.object({
  id: z.string(),
  completed: z.boolean(),
  workOrderId: z.string(),
  repairTaskId: z.string().nullable(),
  recurringTaskId: z.string().nullable(),
})

export type WorkOrderTask = z.infer<typeof WorkOrderTaskSchema>

/////////////////////////////////////////
// RECURRING TASK SCHEMA
/////////////////////////////////////////

export const RecurringTaskSchema = z.object({
  taskStatus: TaskStatusSchema,
  taskType: TaskTypeSchema,
  id: z.string(),
  taskId: z.string(),
  equipmentId: z.string(),
  maintenanceTemplateId: z.string().nullable(),
})

export type RecurringTask = z.infer<typeof RecurringTaskSchema>

/////////////////////////////////////////
// REPAIR TASK SCHEMA
/////////////////////////////////////////

export const RepairTaskSchema = z.object({
  taskType: TaskTypeSchema,
  priority: PrioritySchema,
  id: z.string(),
  equipmentId: z.string(),
  notes: z.string().nullable(),
  completed: z.boolean(),
  taskId: z.string(),
  employeeId: z.string().nullable(),
  repairTypeId: z.string().nullable(),
})

export type RepairTask = z.infer<typeof RepairTaskSchema>

/////////////////////////////////////////
// REPAIR TYPE SCHEMA
/////////////////////////////////////////

export const RepairTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type RepairType = z.infer<typeof RepairTypeSchema>

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  maintenanceTemplateId: z.string().nullable(),
})

export type Task = z.infer<typeof TaskSchema>

/////////////////////////////////////////
// TASK ITEM SCHEMA
/////////////////////////////////////////

export const TaskItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int(),
  recurringTaskId: z.string(),
  inventoryId: z.string(),
})

export type TaskItem = z.infer<typeof TaskItemSchema>

/////////////////////////////////////////
// TASK TRACKING SCHEMA
/////////////////////////////////////////

export const TaskTrackingSchema = z.object({
  primaryMeterType: MeterReadingSchema.nullable(),
  secondaryMeterType: MeterReadingSchema.nullable(),
  id: z.string(),
  trackByDate: z.boolean().nullable(),
  trackByDateEvery: z.boolean().nullable(),
  dateInterval: z.number().int().nullable(),
  dateAdvanceNotice: z.number().int().nullable(),
  dateNextDue: z.coerce.date().nullable(),
  dateLastPerformed: z.coerce.date().nullable(),
  trackByPrimary: z.boolean().nullable(),
  trackByPrimaryEvery: z.boolean().nullable(),
  primaryInterval: z.number().nullable(),
  primaryAdvanceNotice: z.number().nullable(),
  primaryNextDue: z.number().nullable(),
  primaryLastPerformed: z.number().nullable(),
  trackBySecondary: z.boolean().nullable(),
  trackBySecondaryEvery: z.boolean().nullable(),
  secondaryInterval: z.number().nullable(),
  secondaryAdvanceNotice: z.number().nullable(),
  secondaryNextDue: z.number().nullable(),
  secondaryLastPerformed: z.number().nullable(),
  recurringTaskId: z.string().nullable(),
  repairTaskId: z.string().nullable(),
})

export type TaskTracking = z.infer<typeof TaskTrackingSchema>

/////////////////////////////////////////
// DATE NEXT DUE SCHEMA
/////////////////////////////////////////

export const DateNextDueSchema = z.object({
  id: z.string(),
  taskTrackingId: z.string(),
  dateNextDue: z.coerce.date(),
})

export type DateNextDue = z.infer<typeof DateNextDueSchema>

/////////////////////////////////////////
// PRIMARY NEXT DUE SCHEMA
/////////////////////////////////////////

export const PrimaryNextDueSchema = z.object({
  id: z.string(),
  taskTrackingId: z.string(),
  primaryNextDue: z.number(),
})

export type PrimaryNextDue = z.infer<typeof PrimaryNextDueSchema>

/////////////////////////////////////////
// SECONDARY NEXT DUE SCHEMA
/////////////////////////////////////////

export const SecondaryNextDueSchema = z.object({
  id: z.string(),
  taskTrackingId: z.string(),
  secondaryNextDue: z.number(),
})

export type SecondaryNextDue = z.infer<typeof SecondaryNextDueSchema>

/////////////////////////////////////////
// MAINTENANCE TEMPLATE SCHEMA
/////////////////////////////////////////

export const MaintenanceTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type MaintenanceTemplate = z.infer<typeof MaintenanceTemplateSchema>

/////////////////////////////////////////
// EMPLOYEE SCHEMA
/////////////////////////////////////////

export const EmployeeSchema = z.object({
  employeeStatus: EmployeeStatusSchema,
  adminType: AdminTypeSchema.nullable(),
  id: z.string(),
  firstName: z.string().min(1, { message: "First name must not be empty" }),
  lastName: z.string().min(1, { message: "Last name must not be empty" }),
  // phone: z.string().refine((value) => isValidPhoneNumber(value), { message: "Invalid phone number" }),
  phone: phoneNumberSchema,
  laborRate: z.number(),
  loginAllowed: z.boolean(),
  email: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Employee = z.infer<typeof EmployeeSchema>
