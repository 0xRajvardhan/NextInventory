"use client";

import { Button } from "../components/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RepairTaskFormSchema,
  RepairTaskFormValues,
} from "@/app/lib/definitions";
import { Option } from "@/app/lib/definitions";

import SelectInput from "@/app/ui/components/RHF/selectInput";
import DateInput from "@/app/ui/components/RHF/dateInput";
import TextAreaInput from "@/app/ui/components/RHF/textAreaInput";

import { enumToOptions } from "@/app/lib/utils";
import { Priority } from "@prisma/client";
import { createRepairTask, deleteRepairTask } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

import AsyncSelectInput from "../components/RHF/asyncSelectInput";
import AsyncCreatableSelectInput from "../components/RHF/asyncCreatableSelectInput";

import { fetchTasks, fetchEmployees, fetchRepairTypes, fetchEquipment } from "@/app/lib/data";
import { Spinner } from "flowbite-react";

export default function RepairForm({
  repairTask,
  equipmentId,
  isEditMode = false,
  equipment
}: {
  repairTask?: RepairTaskFormValues;
  equipmentId?: string;
  isEditMode?: boolean;
  equipment?: Option;
}) {  

  const methods = useForm<RepairTaskFormValues>({
    resolver: zodResolver(RepairTaskFormSchema),
    defaultValues: repairTask 
      ? repairTask
      : {
          id: '',
          equipment: equipment ? {
            value: equipment.value,
            label: equipment.label
          } : null,
          task: null,
          employee: null,
          repairType: null,
          priority: {value: 'Normal', label: 'Normal'},
          notes: "",
          taskType: {value: 'Repair', label: 'Repair'},
          taskTracking: {
            id: "",
            recurringTaskId: null,
            repairTaskId: null,

            trackByDate: null,
            trackByDateEvery: null,
            dateInterval: null,
            dateAdvanceNotice: null,
            dateNextDue: null,
            DateNextDue: [
              {
                id: "",
                dateNextDue: new Date()
              }
            ],
            dateLastPerformed: null,

            trackByPrimary: null,
            trackByPrimaryEvery: null,
            primaryMeterType: null,
            primaryInterval: null,
            primaryAdvanceNotice: null,
            primaryNextDue: null,
            PrimaryNextDue: [],
            primaryLastPerformed: null,
            
            trackBySecondary: null,
            trackBySecondaryEvery: null,
            secondaryMeterType: null,
            secondaryInterval: null,
            secondaryAdvanceNotice: null,
            secondaryNextDue: null,
            SecondaryNextDue: [],
            secondaryLastPerformed: null
          },
        }
  }); 

  const { handleSubmit, formState: {isSubmitting} } = methods;

  const router = useRouter();
  const priorityOptions = enumToOptions(Priority);

  const handleSave = async (data: RepairTaskFormValues) => {
    console.log("Handle Save:", data);
    try {
      const response = await createRepairTask(data);
      console.log("Response from createRepairRequest:", response);
      if ('error' in response) {
        // Handle server error
        console.error("Server error:", response);
      } else {
        router.push(`/dashboard/equipment/${response.id}`); // Change to the desired path
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  const handleDelete = async () => {
    console.log("Handle Delete:", repairTask?.id);
    try {
      const response = await deleteRepairTask(repairTask?.id ?? '');
      console.log("Response from deleteRepairRequest:", response);
      if ('error' in response) {
        // Handle server error
        console.error("Server error:", response);
      } else {
        router.push(`/dashboard/equipment/${equipmentId}`); // Change to the desired path
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="w-1/2 bg-gray-50 p-4 md:p-6 rounded-md">
          {/* Equipment */}
          <AsyncSelectInput
            className="flex items-center mb-4"
            required={true}
            labelText="Equipment"
            labelClassName="flex mr-6 w-36 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'equipment' as const}
            loadOptionsFn={fetchEquipment}
            isDisabled={true}
            isClearable={false}
            placeholder="Select Equipment..."
            isEditMode={isEditMode}
          />
          {/* Repair */}
          <AsyncCreatableSelectInput
            className="flex items-center mb-4"
            required={true}
            labelText="Repair"
            labelClassName="flex mr-6 w-36 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'task' as const}
            placeholder="Select a task..."
            isEditMode={isEditMode}
            loadOptionsFn={fetchTasks}
          />
          {/* Due by */}
          <DateInput
            className="flex items-center mb-4"
            required={true}
            labelText="Due By"
            // meter="day"
            labelClassName="flex w-36 mr-6 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'taskTracking.dateNextDue' as const}
            isEditMode={isEditMode}
          />
          {/* Requestor */}
          <AsyncSelectInput
            className="flex items-center mb-4"
            labelText="Requestor"
            labelClassName="flex mr-6 w-36 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'employee' as const}
            placeholder="Select a requestor..."
            isEditMode={isEditMode}
            loadOptionsFn={fetchEmployees}
          />
          {/* Repair Type */}
          <AsyncCreatableSelectInput
            className="flex items-center mb-4"
            labelText="Repair type"
            labelClassName="flex mr-6 w-36 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'repairType' as const}
            isEditMode={isEditMode}
            loadOptionsFn={fetchRepairTypes}
          />
          {/* Priority */}
          <SelectInput
            className="flex items-center mb-4"
            labelText="Priority"
            labelClassName="flex mr-6 w-36 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'priority' as const}
            options={priorityOptions}
            placeholder="Select priority..."
            isEditMode={isEditMode}
            isClearable={false}
          />
          {/* Notes */}
          <TextAreaInput
            className="flex items-start mb-4"
            labelText="Notes"
            labelClassName="flex mr-6 w-36 sm:w-36 md:w-36 lg:w-36 xl:w-36 2xl:w-36"
            name={'notes' as const}
            isEditMode={isEditMode}
          />
        </div>

        <div className="flex w-1/2 justify-end gap-4 mt-4 mb-4">   
          {isEditMode ? (
            <>
              <Button type="button" 
                onClick={() => repairTask ? router.push(`/dashboard/equipment/${equipmentId}/repair/${repairTask.id}`) : router.push(`/dashboard/equipment/${equipmentId}?tab=Tasks`) } className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Spinner /> {/* Show a spinner */}
                    Saving...
                  </div>
                ) : (
                  repairTask ? "Update Repair Request" : "Create Repair Request"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" 
                onClick={() => router.push(`/dashboard/equipment/${equipmentId}?tab=Tasks`)} className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/equipment/${equipmentId}/repair/${repairTask?.id}/edit`)
                }
              >
                Edit Repair Request
              </Button>
              <Button
                type="button"
                onClick={() =>
                  handleDelete()
                }
              >
                Delete Repair Request
              </Button>
            </> 
          )}       
        </div>
      </form>

    </FormProvider>
  );
}
