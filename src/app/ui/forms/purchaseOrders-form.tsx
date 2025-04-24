"use client";

import { useForm, FormProvider } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createPurchaseOrder } from "@/app/lib/actions";
import SelectInput from "../components/RHF/selectInput";
import DateInput from "../components/RHF/dateInput";
import TextInput from "../components/RHF/textInput";
import TextAreaInput from "../components/RHF/textAreaInput";
import NumericInput from "../components/RHF/numericInput";
import CreatableSelectInput from "../components/RHF/creatableSelectInput";
import { useRouter } from "next/navigation";
import { Shipping } from "@prisma/client";
import { enumToOptions } from "@/app/lib/utils";
import { Button } from "../components/button";
import { Spinner } from "flowbite-react";
import {
  Option,
  PurchaseOrderFormSchema,
  PurchaseOrderFormValues,
} from "@/app/lib/definitions";
import AsyncSelectInput from "../components/RHF/asyncSelectInput";
import AsyncCreatableSelectInput from "../components/RHF/asyncCreatableSelectInput";
import { fetchEmployees, fetchTerms, fetchVendors, fetchWarehouses } from "@/app/lib/data";

// Define form default values
const defaultValues: PurchaseOrderFormValues = {
  id: "",
  warehouse: null,
  vendor: null,
  dateOpened: new Date(),
  dateRequired: null,
  buyer: null,
  terms: null,
  shipVia: null,
  invoice: null,
  workOrder: null,
  poStatus: 'Requisition',
  notes: "",
  taxBy: {value: 'None', label: 'None'},
  tax1: 0,
  tax2: 0,
  freight: 0,
  poNumber: 0,
  receipts: [],
};

export default function PurchaseOrdersForm({
  purchaseOrder,
  warehouses,
  vendors,
  employees,
  terms,
}: {
  purchaseOrder?: PurchaseOrderFormValues;
  warehouses: Option[];
  vendors: Option[];
  employees: Option[];
  terms: Option[];
}) {
  
  const methods = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(PurchaseOrderFormSchema), // Remove id from schema
    defaultValues: purchaseOrder
      ? purchaseOrder
      : defaultValues
  });

  const {
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
  } = methods;
  const shipping = enumToOptions(Shipping)
  const router = useRouter();
  
  const handleSave = async (data: PurchaseOrderFormValues) => {

    try {
      const response = await createPurchaseOrder(data);

      if (response?.error) {
        // Handle server error
        console.error("Server error:", response.error);
      } else {
        router.push(`/dashboard/purchaseorders/${response?.id}`); // Change to the desired path
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="flex rounded-md bg-gray-50 p-6 grid grid-cols-2">
          <div>
            {/* Ship To */}
            <AsyncSelectInput
              className="flex items-center mb-4"
              required={true}
              labelText="Ship To"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name={`warehouse`}
              loadOptionsFn={fetchWarehouses}
              placeholder="Select Warehouse"
              isEditMode={true}
            />
            {/* Vendor */}
            <AsyncSelectInput
              className="flex items-center mb-4"
              labelText="Vendor"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name={`vendor`}
              loadOptionsFn={fetchVendors}
              placeholder="Choose Vendor"
              isEditMode={true}
            />
            {/* Date Opened */}
            <DateInput
              className="flex items-center mb-4"
              required={true}
              name={"dateOpened"}
              labelText="Date Opened"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              isEditMode={true}
            />
            {/* Date Opened */}
            <DateInput
              className="flex items-center mb-4"
              name={"dateRequired"}
              labelText="Date Required"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              isEditMode={true}
            />
            {/* Buyer */}
            <AsyncSelectInput
              className="flex items-center mb-4"
              labelText="Buyer"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name={`buyer`}
              loadOptionsFn={fetchEmployees}
              placeholder="Choose Buyer"
              isEditMode={true}
            />
          </div>
          <div>
            {/* Terms */}
            <AsyncCreatableSelectInput
              className="flex items-center mb-4"
              labelText="Terms"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name={`terms`}
              loadOptionsFn={fetchTerms}
              placeholder="Select Terms"
              isEditMode={true}
            />
            {/* Shipping */}
            <SelectInput
              className="flex items-center mb-4"
              options={shipping}
              labelText="Ship via"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name="shipVia"
              placeholder="Select Shipping"
              isEditMode={true}
            />
            {/* Invoice */}
            <TextInput
              className="flex mb-4 items-center"
              labelText="Invoice"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name="invoice"
              // placeholder="Enter invoice..."
              isEditMode={true}
            />
            {/* Work Order Number */}
            <NumericInput
              className="flex mb-4 items-center"
              labelText="Work Order #"
              labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
              name="workOrder"
              isEditMode={true}
            />
            {/* Initial Notes */}
            <TextAreaInput
              className="flex items-center"
              labelText="Notes"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              name="notes"
              rows={2}
              // placeholder="Enter initial notes..."
              isEditMode={true}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">          
            <Button type="button" 
              onClick={() => purchaseOrder ? router.push(`/dashboard/purchaseorders/${purchaseOrder.id}`) : router.push(`/dashboard/employees`) } className="bg-red-500 text-white hover:bg-red-600">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitSuccessful}>
              {isSubmitSuccessful ? (
                <div className="flex items-center gap-2">
                  <Spinner /> {/* Show a spinner */}
                  Saving...
                </div>
              ) : (
                purchaseOrder ? "Update  Purchase Order" : "Create Purchase Order"
              )}
            </Button>
          </div>
      </form>
    </FormProvider>

      
  );
}
