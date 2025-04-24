"use client";

import { Button } from "../components/button";
import React from "react";

import TextInput from "../components/RHF/textInput";
import DateInput from "../components/RHF/dateInput";
import NumericInput from "../components/RHF/numericInput";
import SelectInput from "../components/RHF/selectInput";

import { useForm, FormProvider } from "react-hook-form"; // Import the useForm hook
import { zodResolver } from "@hookform/resolvers/zod";
import { createIssuance } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

import { Option, IssuanceFormSchema, IssuanceFormValues } from "@/app/lib/definitions";
import AsyncSelectInput from "../components/RHF/asyncSelectInput";
import { fetchEquipment } from "@/app/lib/data";


export default function IssuancesForm({
  inventoryId,
  issuance,
  isEditMode = false
}: {
  inventoryId: string;
  issuance?: IssuanceFormValues;
  isEditMode?: boolean;
}) {

  const defaultValues: IssuanceFormValues = {
    id: "",
    date: new Date(),    
    qtyIssued: 0,
    description: "",
    workOrderTaskId: null,
    receiptId: '',
    equipment: null,
    item: {
      value: inventoryId,
      label: '',
      quantity: 0,
      qtyRemaining: 0,
      location: '',
      unitCostDollar: 0,
      unitCostVES: 0,
      unitType: '',
      vendor: '',
      warehouse: '',
    }
  }

  const methods = useForm<IssuanceFormValues>({
    resolver: zodResolver(IssuanceFormSchema),
    defaultValues: issuance
      ? issuance
      : defaultValues
  });

  const { handleSubmit, formState: {isSubmitting} } = methods;
  const router = useRouter();

  const handleSave = async (data: IssuanceFormValues) => {
    try {
      const response = await createIssuance(data);
      if (response?.error) {
        console.log("Server returned errors:", response.error); // Add this line to check the structure
        // response.error.forEach((error: { field: string; message: string }) => {
        //   if (error.field && error.message) {
        //     setError(error.field as keyof Vendor, {
        //       type: "manual",
        //       message: error.message,
        //     });
        //   }
        // });
      } else {
        console.log(response);
        router.push(`/dashboard/inventory/${inventoryId}`); // Change to the desired path
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };


  return (
    <FormProvider {...methods}>
    <form onSubmit={handleSubmit(handleSave)}>
      <div className="w-full">
        <div className="grid grid-cols-1 w-full xl:w-1/3 rounded-md bg-gray-50 p-6">
          <AsyncSelectInput
            className="flex items-center mb-4"
            labelText="Equipment"
            labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
            name="equipment"
            loadOptionsFn={fetchEquipment}
            placeholder="Select equipment..."
            isEditMode={isEditMode}
          />
          <DateInput
            className="flex mb-4 items-center"
            required
            labelText="Date"
            labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
            name="date"
            isEditMode={isEditMode}
          />
          <NumericInput
            className="flex mb-4 items-center"
            labelText="Quantity Received"
            labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
            name="qtyIssued"
            placeholder="Enter contact name..."
            isEditMode={isEditMode}
          />
          <TextInput
            className="flex mb-4 items-center"
            labelText="Description"
            labelClassName="flex w-32 justify-end items-center text-sm font-medium mr-6"
            name="description"
            placeholder="Enter description..."
            isEditMode={isEditMode}
          />
        </div>
      </div>
      <div className="flex w-1/3 justify-end gap-4 mt-4 mb-4">          
        <Button type="button" 
          onClick={() => issuance ? router.push(`/dashboard/inventory/${inventoryId}`) : router.push(`/dashboard/inventory/${inventoryId}`) } className="bg-red-500 text-white hover:bg-red-600">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Spinner /> {/* Show a spinner */}
              Saving...
            </div>
          ) : (
            issuance ? "Update Issuance" : "Create Issuance"
          )}
        </Button>
      </div>
    </form>
    </FormProvider>
  );
}
