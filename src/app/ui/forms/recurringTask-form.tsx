"use client";

import { Button } from "../components/button";
import { Controller, SubmitHandler, useForm, FormProvider } from "react-hook-form"; // Import the useForm hook
import React, { Fragment, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Option,
  RecurringTaskFormSchema,
  RecurringTaskFormValues,
} from "@/app/lib/definitions";
import PartsList from "@/app/ui/forms/parts-form";
import SelectInput from "../components/RHF/selectInput";
import { enumToOptions } from "@/app/lib/utils";
import { MeterReading, TaskStatus } from "@prisma/client";
import { createRecurringTask } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { EquipmentFormValues } from "@/app/lib/definitions";
import AsyncCreatableSelectInput from "../components/RHF/asyncCreatableSelectInput";
import { fetchTasks } from "@/app/lib/data";

import CheckboxInput from "../components/RHF/checkboxInput";
import SplitButton from "../components/RHF/splitButton";
import NumericInput from "../components/RHF/numericInput";
import DateInput from "../components/RHF/dateInput";
import NestedDateInput from "../components/RHF/nestedDateInput";
import NestedNumericInput from "../components/RHF/nestedNumericInput";

import { FieldValues, Path } from "react-hook-form";
import { Spinner } from "flowbite-react";

export default function RecurringTaskForm({
  recurringTask,
  id,
  equipment,
  isEditMode = false,
}: {
  recurringTask?: RecurringTaskFormValues
  id: string;
  equipment: EquipmentFormValues;
  isEditMode?: boolean;
}) {

  const methods = useForm<RecurringTaskFormValues>({
    resolver: zodResolver(RecurringTaskFormSchema),
    defaultValues: recurringTask 
    ? recurringTask
      : {
        id: "",          
        taskStatus: {value: "Active", label: "Active"},
        taskType: 'Recurring',
        task: null,
        equipmentId: id,
        maintenanceTemplateId: null,
        taskItem: [
          { 
            id: '',
            recurringTaskId: '',
            quantity: 0,
            item: {
              name: '',
              description: '',
              quantity: 0,
              value: '',
              label: '',
              unitCostDollar: 0
            },
          },
        ], // ✅ Wrap it in an array
        // WorkOrderTask: null,
        taskTracking: {
          id: "",
          recurringTaskId: "",
          repairTaskId: null,

          trackByDate: true,
          trackByDateEvery: true,
          dateInterval: 0,
          dateAdvanceNotice: 0,
          dateNextDue: null,
          DateNextDue: [
            {
              id: "",
              dateNextDue: new Date()
            }
          ],
          dateLastPerformed: new Date(),

          trackByPrimary: false,
          trackByPrimaryEvery: true,
          primaryMeterType: equipment?.primaryMeter?.value as MeterReading,
          primaryInterval: null,
          primaryAdvanceNotice: 0,
          primaryNextDue: null,
          PrimaryNextDue: [
            {
              id: "",
              primaryNextDue: 0
            }
          ],
          primaryLastPerformed: equipment.primaryMeterReading,
          
          trackBySecondary: false,
          trackBySecondaryEvery: true,
          secondaryMeterType: equipment?.secondaryMeter?.value as MeterReading,
          secondaryInterval: null,
          secondaryAdvanceNotice: 0,
          secondaryNextDue: null,
          SecondaryNextDue: [
            {
              id: "",
              secondaryNextDue: 0
            }
          ],
          secondaryLastPerformed: equipment.secondaryMeterReading
        },
      }
  });

  const router = useRouter();

  const handleSave = async (data: RecurringTaskFormValues) => {
    console.log("Handle Save:", data);

    try {
      const response = await createRecurringTask(data);
      console.log("Response from createRepairRequest:", response);
      if (response?.error) {
        // Handle server error
        console.error("Server error:", response.error);
      } else {
        if (response) {
          router.push(`/dashboard/equipment/${response.id}`); // Change to the desired path
        }
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  const taskStatusOptions = enumToOptions(TaskStatus);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSave)}>
        <div className="w-1/2 rounded-md bg-gray-50 p-4 md:p-6">
          <AsyncCreatableSelectInput
            className="flex w-2/3 items-center mb-4"
            required={true}
            labelText="Task"
            labelClassName="flex flex-shrink-0 w-12 items-center text-sm font-medium mr-6"
            name={`task`}
            placeholder="Select a task..."
            loadOptionsFn={fetchTasks}
            isEditMode={isEditMode}
          />
          <SelectInput
            className="flex w-2/3 items-center mb-4"
            required={true}
            options={taskStatusOptions}
            isClearable={false}
            labelText="Status"
            labelClassName="flex flex-shrink-0 w-12 items-center text-sm font-medium mr-6"
            name={`taskStatus`}
            isEditMode={isEditMode}
          />
          <TaskTrackingInput
            name={`taskTracking.trackByDate` as const}
            intervalName={`taskTracking.dateInterval` as const}
            advanceNoticeName={`taskTracking.dateAdvanceNotice` as const}
            nextPerformedName={`taskTracking.DateNextDue` as const}
            dateLastPerformed={`taskTracking.dateLastPerformed` as const}
            unitLabel="Days"
            isEditMode={isEditMode}
          />
          <TaskTrackingInput
            name={`taskTracking.trackByPrimary` as const}
            intervalName={`taskTracking.primaryInterval` as const}
            advanceNoticeName={`taskTracking.primaryAdvanceNotice` as const}
            nextPerformedName={`taskTracking.PrimaryNextDue` as const}
            lastPerformedName={`taskTracking.primaryLastPerformed` as const}
            unitLabel={equipment.primaryMeter?.label}
            isEditMode={isEditMode}
          />
          <TaskTrackingInput
            name={`taskTracking.trackBySecondary` as const}
            intervalName={`taskTracking.secondaryInterval` as const}
            advanceNoticeName={`taskTracking.secondaryAdvanceNotice` as const}
            nextPerformedName={`taskTracking.SecondaryNextDue` as const}
            lastPerformedName={`taskTracking.secondaryLastPerformed` as const}
            unitLabel={equipment.secondaryMeter?.label}
            isEditMode={isEditMode}
          />
        </div>
        <PartsList
          isEditMode={isEditMode}
        />
        <div className="flex justify-end gap-4 mb-4 mt-4">   
          {isEditMode ? (
            <>
              <Button type="button" 
                onClick={() => recurringTask ? router.push(`/dashboard/equipment/${equipment.id}/recurring/${recurringTask.id}`) : router.push(`/dashboard/equipment/${equipment.id}`) } className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button type="submit" disabled={methods.formState.isSubmitSuccessful}>
                {methods.formState.isSubmitSuccessful ? (
                  <div className="flex items-center gap-2">
                    <Spinner /> {/* Show a spinner */}
                    Saving...
                  </div>
                ) : (
                  recurringTask ? "Update Recurring Task" : "Create Recurring Task"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" 
                onClick={() => router.push(`/dashboard/equipment/${equipment.id}?tab=Tasks`)} className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/equipment/${equipment.id}/recurring/${recurringTask?.id}/edit`)
                }
              >
                Edit Recurring Task
              </Button>
            </> 
          )}       
        </div>
      </form>
    </FormProvider>

  );
}

const TaskTrackingInput = ({
  name,
  intervalName,
  advanceNoticeName,
  lastPerformedName,
  nextPerformedName,
  dateLastPerformed,
  unitLabel,
  isEditMode,
}: {
  name: Path<FieldValues>;
  intervalName: Path<FieldValues>;
  advanceNoticeName: Path<FieldValues>;
  lastPerformedName?: Path<FieldValues>; // Optional
  nextPerformedName?: Path<FieldValues>; // Optional
  dateLastPerformed?: Path<FieldValues>; // Optional
  unitLabel?: string;
  isEditMode: boolean;
}) => (
  <CheckboxInput 
    name={name} 
    labelText={unitLabel}
    isEditMode={isEditMode}
  >
    <div className="mb-4 text-sm">
      {/* SplitButton for trackBy */}
      <SplitButton
        className="flex w-1/2 items-center mt-4 mb-4"
        labelClassName="flex flex-shrink-0 w-36"
        name={`${name}Every` as const}
        labelText="Due"
        trackByDate={true}
        isEditMode={isEditMode}
      >
        {(trackBy) =>
          trackBy ? (
            <div className="flex w-1/2 items-center mb-4">
              <NumericInput
                className="flex items-center"
                controllerClassName="flex w-24 rounded-md rounded-r-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                labelClassName="flex flex-shrink-0 w-36"
                pClasslassName="w-24 px-3 py-2 bg-white-200 border border-white-200 text-sm text-gray-700 rounded-md rounded-r-none"
                name={intervalName}
                isEditMode={isEditMode}
                // suffix="$"
              />
              <span className="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-l-none">
                {unitLabel}
              </span>
            </div>
          ) : (
            <>
              {dateLastPerformed ? (
                <NestedDateInput 
                  className="pl-36"
                  name={nextPerformedName as Path<FieldValues>}
                  isEditMode={isEditMode}
                /> 
              ) : lastPerformedName ? (
                <NestedNumericInput 
                  className="pl-36"
                  controllerClassName="flex w-24 rounded-md rounded-r-none border border-gray-200 py-2 pl-3 pr-10 text-sm outline-2 placeholder:text-gray-500"
                  name={nextPerformedName as Path<FieldValues>}
                  meter={unitLabel}
                  isEditMode={isEditMode}
                />
              ) : null}
            
            </>
          )
        }
      </SplitButton>

      {/* Advance Notice Section */}
      <div className="flex w-1/2 items-center mb-4">
        <NumericInput
          className="flex items-center"
          controllerClassName="flex w-24 rounded-md rounded-r-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
          labelClassName="flex flex-shrink-0 w-36"
          pClasslassName="w-24 px-3 py-2 bg-white-200 border border-white-200 text-sm text-gray-700 rounded-md rounded-r-none"
          labelText="Advance Notice"
          name={advanceNoticeName}
          isEditMode={isEditMode}
        />
        <span className="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-l-none">
          {unitLabel}
        </span>
      </div>

      {/* Last Performed Section */}
      <div className="flex w-1/2 items-center">
        {dateLastPerformed ? (
          <DateInput
            className="flex text-sm items-center"
            labelClassName="flex flex-shrink-0 w-36"
            labelText="Last Performed"
            name={dateLastPerformed}
            isEditMode={isEditMode}
          />
        ) : lastPerformedName ? (
          <>
            <NumericInput
              className="flex items-center"
              controllerClassName="flex w-24 rounded-md rounded-r-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              labelClassName="flex flex-shrink-0 w-36"
              pClasslassName="w-24 px-3 py-2 bg-white-200 border border-white-200 text-sm text-gray-700 rounded-md rounded-r-none"
              labelText="Last Performed"
              name={lastPerformedName}
              isEditMode={isEditMode}
            />
            <span className="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-l-none">
              {unitLabel}
            </span>
          </>
        ) : null}
      </div>
    </div>
  </CheckboxInput>
);

