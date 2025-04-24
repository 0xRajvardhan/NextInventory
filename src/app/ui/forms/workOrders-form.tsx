"use client";

import { useForm, FormProvider} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  WorkOrderFormSchema,
  WorkOrderFormValues,
} from "@/app/lib/definitions";

import SelectInput from "@/app/ui/components/RHF/selectInput";
import DateInput from "@/app/ui/components/RHF/dateInput";
import TextAreaInput from "@/app/ui/components/RHF/textAreaInput";
import AsyncSelectInput from "../components/RHF/asyncSelectInput";

import WorkOrdersTasksForm from "./workOrdersTasks-forms";

import { enumToOptions } from "@/app/lib/utils";
import { MeterReading, Priority } from "@prisma/client";
import { createWorkOrder } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

import { fetchEquipment, fetchEmployees, fetchCategories } from "@/app/lib/data";

import { Button } from "../components/button";
import { Spinner } from "flowbite-react";

export default function WorkOrdersForm({
  workOrder,
  isEditMode
}: {
  workOrder?: WorkOrderFormValues;
  isEditMode: boolean;
}) {
  const methods = useForm<WorkOrderFormValues>({
    resolver: zodResolver(WorkOrderFormSchema),
    defaultValues: workOrder
      ? workOrder
      : {
          id: "",
          equipment: null,
          scheduled: new Date(),
          due: null,
          dateStarted: null,
          dateCompleted: null,
          notes: "",
          employee: null,
          priority: {
            value: Priority.Normal,
            label: "Normal",
          },
          workOrderType: null,
          tasks: [],
          woStatus: 'Open',
          tax1: 0,
          tax2: 0,
          primaryMeterReading: 0,
          secondaryMeterReading: 0,
        },
  });

  const { handleSubmit, getValues, formState: { isSubmitSuccessful }} = methods;

  const router = useRouter();

  const handleSave = async (data: WorkOrderFormValues) => {
    try {
      
      console.log("Before Filtering:", data); // Debugging

      // ✅ Filter tasks where checkedTasks[task.id] is true
      const checkedTasks = getValues("tasks").filter(task => task?.task?.checked);
  
      // ✅ Create new data object with only selected tasks
      const filteredData = {
        ...data,
        tasks: checkedTasks,
      };
  
      console.log("After Filtering:", filteredData); // Debugging
  
      // Send `filteredData` to the API instead of `data`
      const response = await createWorkOrder(filteredData);

      if (response?.error) {
        // Handle server error
        console.error("Server error:", response.error);
      } else {
        router.push(`/dashboard/workorders/${response?.id}`);
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
            {/* Equipment */}
            <AsyncSelectInput
              className="flex items-center mb-4"
              required={true}
              labelText="Equipment"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              name={`equipment`}
              loadOptionsFn={fetchEquipment}
              placeholder="Select equipment..."
              isEditMode={isEditMode}
            />
            {/* Assignee */}
            <AsyncSelectInput
              className="flex items-center mb-4"
              labelText="Assignee"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              name={`employee`}
              loadOptionsFn={fetchEmployees}
              placeholder="Select an assignee..."
              isEditMode={isEditMode}
            />
            {/* Scheduled */}
            <DateInput
              className="flex items-center mb-4"
              name={`scheduled`}
              labelText="Scheduled"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              isEditMode={isEditMode}
            />
            {/* Due */}
            <DateInput
              className="flex items-center"
              name={`due`}
              labelText="Due"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              isEditMode={isEditMode}
            />
          </div>
          <div>
            <SelectInput
              className="flex items-center mb-4"
              required={true}
              labelText="Priority"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              options={enumToOptions(Priority)}
              name={`priority`}
              placeholder="Select a priority..."
              isEditMode={isEditMode}
            />
            {/* Unit Type */}
            <AsyncSelectInput
              className="flex items-center mb-4"
              labelText="Unit Type"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              name="workOrderType"
              loadOptionsFn={fetchCategories}
              placeholder="Select a type..."
              isEditMode={isEditMode}
            />
            {/* Initial Notes */}
            <TextAreaInput
              className="flex items-center"
              labelText="Initial Notes"
              labelClassName="flex w-32 justify-end mr-6 items-center text-sm font-medium"
              name="notes"
              rows={4}
              placeholder="Enter initial notes..."
              isEditMode={isEditMode}
            />
          </div>
        </div>
        <WorkOrdersTasksForm/>          
        <div className="flex justify-end gap-4 mt-4">          
          <Button type="button" 
            onClick={() => workOrder ? router.push(`/dashboard/workorders/${workOrder.id}`) : router.push(`/dashboard/workorders`) } className="bg-red-500 text-white hover:bg-red-600"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitSuccessful}>
            {isSubmitSuccessful ? (
              <div className="flex items-center gap-2">
                <Spinner /> {/* Show a spinner */}
                Saving...
              </div>
            ) : (
              workOrder ? "Update  Work Order" : "Create Work Order"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
