"use client";

import { Button } from "../components/button";
import TextInput from "../components/RHF/textInput";

import { FormProvider, useForm } from "react-hook-form"; // Import the useForm hook
import { zodResolver } from "@hookform/resolvers/zod";
import { upsertReceipt } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import DateInput from "../components/RHF/dateInput";
import NumericInput from "../components/RHF/numericInput";
import AsyncSelectInput from "../components/RHF/asyncSelectInput";
import { fetchVendors } from "@/app/lib/data";
import { ReceiptFormSchema, ReceiptFormValues } from "@/app/lib/definitions";

export default function ReceiptsForm({
  inventoryId,
  receipt,
  isEditMode = false
}: {
  inventoryId: string;
  receipt?: ReceiptFormValues;
  isEditMode?: boolean;
}) {

  const defaultValues: ReceiptFormValues = {
    id: "",  
    date: new Date(),         // Matches Date | null (non-null here for default)
    purchaseOrderId: null,    // Matches string | null
    qtyOrdered: 0,         // Matches number | null
    qtyReceived: 0,           // Matches number | null (non-null for default)  
    unitCostDollar: 0,        // Matches number | null (non-null for default)
    unitCostVES: 0,           // Matches number | null (non-null for default)
    description: null,        // Matches string | null
    invoice: null,            // Matches string | null
    tax1: 0,
    tax2: 0,
    vendor: null,           // Matches string | null
    item: {
      value: inventoryId,
      label: '',
      name: '',
      description: '',
      quantity: 0,
    },           // Matches string | null
  };

  const methods = useForm<ReceiptFormValues>({
    resolver: zodResolver(ReceiptFormSchema),
    defaultValues: receipt
      ? receipt
      : defaultValues
  });

  const { handleSubmit, setError, formState: { isSubmitSuccessful } } = methods;

  const router = useRouter();

  const handleSave = async (data: ReceiptFormValues) => {
    try {
      const response = await upsertReceipt(data);
      
      if (response?.error) {
        // console.log("Server returned errors:", response.error); // Add this line to check the structure
        // response.error.forEach((error: { field: string; message: string }) => {
        //   if (error.field && error.message) {
        //     setError(error.field as keyof ReceiptFormValues, {
        //       type: "manual",
        //       message: error.message,
        //     });
        //   }
        // });
      } else {
        console.log(response);
        router.push(`/dashboard/inventory/${inventoryId}/receipt/${response?.data.id}`); // Change to the desired path
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="w-full">
          <div className="grid grid-cols-1 w-full xl:w-1/3 ml:w-1/3 rounded-md bg-gray-50 p-6">
            {
              receipt && isEditMode === false ? (
                <AsyncSelectInput
                  className="flex items-center mb-4"
                  labelText="Vendor"
                  labelClassName="flex w-60 justify-end mr-6 text-sm font-medium"
                  name="vendor"
                  placeholder="Select a vendor..."
                  loadOptionsFn={fetchVendors}
                  isEditMode={isEditMode}
                />
              ) : (
                <DateInput
                  className="flex mb-4 items-center"
                  required
                  labelText="Date"
                  labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
                  name="date"
                  isEditMode={isEditMode}
                />
              )
            }
            <NumericInput
              className="flex mb-4 items-center"
              labelText="Quantity Received"
              labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
              controllerClassName="flex w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              name="qtyReceived"
              placeholder="Enter contact name..."
              decimalScale={0}
              isEditMode={isEditMode}
            />
            {
              receipt && isEditMode === false ? (
                <NumericInput
                  className="flex mb-4 items-center"
                  labelText="Qty Remaining"
                  labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
                  controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                  name="qtyRemaining"
                  decimalScale={0}
                  isEditMode={isEditMode}
                />
              ): null
            }
            <NumericInput
              className="flex mb-4 items-center"
              labelText="Unit Cost Dollar"
              labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
              pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
              controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              unitLabel="$"
              name="unitCostDollar"
              prefix={true}
              decimalScale={2}
              isEditMode={isEditMode}
            />
            <NumericInput
              className="flex mb-4 items-center"
              labelText="Unit Cost Ves"
              labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
              pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
              controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              unitLabel="VES"
              name="unitCostVES"
              prefix={true}
              decimalScale={2}
              isEditMode={isEditMode}
            />
            <NumericInput
              className="flex mb-4 items-center"
              labelText="Tax 1"
              labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
              pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
              controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              unitLabel="%"
              name="tax1"
              decimalScale={2}
              fixedDecimalScale={false}
              isAllowed={(values) => {
                const { floatValue } = values;
                if (floatValue === undefined) return true;
                return floatValue >= 0 && floatValue <= 100;
              }}
              isEditMode={isEditMode}
            />
            <NumericInput
              className="flex items-center mb-4"
              labelText="Tax 2"
              labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
              pClasslassName="flex px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
              controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              unitLabel="%"
              name="tax2"
              decimalScale={2}
              fixedDecimalScale={false}
              isAllowed={(values) => {
                const { floatValue } = values;
                if (floatValue === undefined) return true;
                return floatValue >= 0 && floatValue <= 100;
              }}
              isEditMode={isEditMode}
            />
            {
              receipt && isEditMode === true ? (
                <TextInput
                  className="flex items-center mb-4"
                  labelText="Invoice Number"
                  labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
                  name="invoice"
                  placeholder="Enter invoice number..."
                  isEditMode={isEditMode}
                />
              ) : null
            }
            <AsyncSelectInput
              className="flex items-center mb-4"
              labelText="Vendor"
              labelClassName="flex w-60 justify-end mr-6 text-sm font-medium"
              name="vendor"
              placeholder="Select a vendor..."
              loadOptionsFn={fetchVendors}
              isEditMode={isEditMode}
            />
            <TextInput
              className="flex items-center mb-4"
              labelText="Description"
              labelClassName="flex w-60 justify-end text-sm font-medium mr-6"
              name="description"
              placeholder="Enter description..."
              isEditMode={isEditMode}
            />
            {
              receipt && isEditMode === false ? (
                <TextInput
                  className="flex items-center mb"
                  labelText="Invoice Number"
                  labelClassName="flex w-60 justify-end items-center text-sm font-medium mr-6"
                  name="invoice"
                  placeholder="Enter invoice number..."
                  isEditMode={isEditMode}
                />
              ) : null
            }
          </div>
        </div>
        <div className="flex w-1/3 justify-end gap-4 mt-4 mb-4">
          {isEditMode ? (
            <>
              <Button type="button" 
                onClick={() => receipt ? router.push(`/dashboard/inventory/${inventoryId}/receipt/${receipt?.id}`) : router.push(`/dashboard/inventory/${inventoryId}`) } className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitSuccessful}>
                {isSubmitSuccessful ? (
                  <div className="flex items-center gap-2">
                    <Spinner /> {/* Show a spinner */}
                    Saving...
                  </div>
                ) : (
                  receipt ? "Update Receipt" : "Create Receipt"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" 
                onClick={() => router.push(`/dashboard/inventory/${inventoryId}?tab=Receipts`)} className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/inventory/${inventoryId}/receipt/${receipt?.id}/edit`)
                }
              >
                Edit Receipt
              </Button>
            </> 
          )}  
        </div>
      </form>
    </FormProvider>
  );
}
