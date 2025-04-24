'use client'

import { WorkOrderFormValues } from "@/app/lib/definitions";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { Fragment, useState } from "react";
import { useFormContext } from "react-hook-form";
import NumericInput from "../components/RHF/numericInput";
import { CalendarIcon, WrenchIcon } from '@heroicons/react/20/solid';
import { formatCurrency } from "@/app/lib/utils";
import WorkOrderAsyncSelectInput from "../components/RHF/workOrderAsyncSelectInput";
import { createIssuance, updateIssuance, deleteIssuance, upsertMeter, upsertIssuance, upsertLabor, deleteLabor, upsertComplete, createRepairTask, createWorkOrderTask } from "@/app/lib/actions";
import PopoverInput from "../components/RHF/popOver";
import { useWatch } from "react-hook-form";
import { upsertTax } from "@/app/lib/actions";
import WorkOrderButton from "../components/woButton";
import { Dropdown } from "flowbite-react";
import { Cog8ToothIcon, PencilSquareIcon, TrashIcon, CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import LaborAsyncSelectInput from "../components/RHF/laborAsyncSelectInput";
import  ProgressBar  from "../components/RHF/progressBar";
import WorkOrderPartsAsyncSelectInput from "../components/RHF/workOrderPartsAsyncSelectInput";
import { deleteWorkOrderTask } from "../../lib/actions";
import { toast, Bounce, ToastContainer } from "react-toastify";

export default function WorkOrderItemsForm({
  workOrder,
}: {
  workOrder: WorkOrderFormValues;
}) {

  // console.log("WorkOrderItemsForm", workOrder);
  const methods = useForm<WorkOrderFormValues>({
    defaultValues: workOrder
  });

  const { fields, append: appendTask, remove: removeTask } = useFieldArray({
    control: methods.control,
    name: "tasks",
    keyName: "_id",
  });

  const [activeTaskIndex, setActiveTaskIndex] = useState<number | null>(null);

  // Generic tax update handler
  const updateMeter = async (meter: number, field: "primaryMeterReading" | "secondaryMeterReading") => {

    const workOrderId = methods.getValues('id'); 
    return await upsertMeter(workOrderId, meter, field);
  };

  const woStatus = methods.watch('woStatus');

  const [addIndex, setAddIndex] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  const handleAdd = () => {
    if (!addIndex) {
      appendTask({
        id: "",
        task: null,
        parts: [],
        labor: [],
        completed: false,
      });
      setAddIndex(true);
      setEditIndex(fields.length);
    }
  };

  const handleRemoveTask = async (index: number) => {
    const tasks = methods.getValues('tasks');
  
    // Check if there's only one task left
    if (tasks.length <= 1) {
      // Optionally, provide user feedback here
      console.log("At least one task is required.");
      return; // Prevent deletion
    }
  
    const taskToRemove = tasks[index];
  
    if (taskToRemove) {
      // If the task has an ID, call the API to delete it
      const response = await deleteWorkOrderTask(taskToRemove);
      if (response.success) {
        toast.success("Task removed successfully");
        removeTask(index);
        setAddIndex(false);
      } else {
        throw new Error("Failed to delete task");
      }
    } else {
      removeTask(index);
      setAddIndex(false);
    }
  };
  

  const handleAddTask = async (index: number) => {
    const task = methods.getValues(`tasks.${index}.task`);
  
    const response = await createRepairTask({
      id: '',
      notes: null,
      taskType: {
        value: 'Repair',
        label: 'Repair',
      },
      priority: {
        value: 'Normal',
        label: 'Normal',
      },
      equipment: {
        value: methods.getValues('equipment.value'),
        label: methods.getValues('equipment.label'),
      },
      task: task?.task ?? null,
      taskTracking: task?.taskTracking ?? null,
      employee: null,
      repairType: null,
    });
  
    // Type guard: check if 'error' exists in response
    if ('error' in response) {
      // handle the error
      console.log("Error creating task:", response.error);
    } else {

      removeTask(index);
      setEditIndex(null);
      setAddIndex(false);
      // success case
      const workOrderTask = await createWorkOrderTask({
        id: '',
        workOrderId: methods.getValues('id'),
        repairTaskId: response.id,
        recurringTaskId: null,
        completed: false,
      });

      if (!workOrderTask) {
        throw new Error("No data returned from transaction");
      }

      console.log("Task created successfully:", workOrderTask);

      appendTask({
        id: workOrderTask.id,
        task: {
          taskType: 'Repair',
          priority: workOrderTask.repairTask?.priority,
          taskTracking: null,
          task: {
            value: workOrderTask.repairTask?.task.id ?? '',
            label: workOrderTask.repairTask?.task.description ?? '',
          },
        },
        parts: [],
        labor: [],
        completed: false,
      })
    }
  };
  
  return (
    <FormProvider {...methods}>
      <ToastContainer
        position="top-left"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="flex justify-between items-center text-sm">
        <div className="flex flex-col gap-2">
        {workOrder.equipment && (
            <div className="flex">
              <p className="w-32 font-medium">Equipment:</p>
              <p>{workOrder.equipment.label} - {workOrder.equipment.description} </p>
            </div>
          )}
          {workOrder.employee && (
            <div className="flex">
              <p className="w-32 font-medium">Employee:</p>
              <p>{workOrder.employee?.label}</p>
            </div>
          )}
          {workOrder.scheduled && (
            <div className="flex">
              <p className="w-32 font-medium">Date Required:</p>
              <p>{workOrder.scheduled.toDateString()}</p>
            </div>
          )}
          {workOrder.due && (
            <div className="flex">
              <p className="w-32 font-medium">Due:</p>
              <p>{workOrder.due.toDateString()}</p>
            </div>
          )} 
          {workOrder.dateStarted && (
            <div className="flex">
              <p className="w-32 font-medium">Started:</p>
              <p>{workOrder.dateStarted.toDateString()}</p>
            </div>
          )} 
          {workOrder.equipment?.primaryMeter && (
            <div className="flex">
              <p className="w-32 font-medium">{workOrder.equipment?.primaryMeter}</p> 
              <PopoverInput
                name={`primaryMeterReading` as const}
                labelText={workOrder.equipment?.primaryMeter.toString()}
                onSave={(meter) => updateMeter(meter, 'primaryMeterReading')}
                isEditMode={true}
              />
            </div> 
          )}
          {workOrder.equipment?.secondaryMeter && (
            <div className="flex">
              <p className="w-32 font-medium">{workOrder.equipment?.secondaryMeter}</p> 
              <PopoverInput
                name={`secondaryMeterReading` as const}
                labelText={workOrder.equipment?.secondaryMeter.toString()}
                onSave={(meter) => updateMeter(meter, 'secondaryMeterReading')}
                isEditMode={true}
              />
            </div> 
          )}
        </div>  
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <WorkOrderButton/>
            <ProgressBar 
              name={`tasks` as const}
              labelText="Progress" 
              unitLabel="%" 
              isEditMode={true}
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="mt-6 shadow-md flow-root">
          <div className="relative shadow-md sm:rounded-lg">
          <table className="relative w-full table-fixed text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">TASK</th>
                  <th scope="col" className="px-6 py-3">PARTS</th>
                  <th scope="col" className="px-6 py-3">LABOR</th>
                  <th scope="col" className="px-6 py-3">TOTAL</th>
                  <th scope="col" className="px-6 py-3 w-5"></th>

                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center items-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => {

                    const completed = methods.watch(`tasks.${index}.completed`) || false;

                    // Use methods.watch so that each time the parts for a given task change,
                    // the total is recalculated.
                    const parts = methods.watch(`tasks.${index}.parts`) || [];
                    const partsTotalCost = parts.reduce((sum: number, part: any) => {
                      const cost = Number(part.item?.unitCostDollar) || 0;
                      const quantity = Number(part.qtyIssued) || 0;
                      return sum + cost * quantity;
                    }, 0);

                    const labor = methods.watch(`tasks.${index}.labor`) || [];
                    const laborTotalCost = labor.reduce((sum: number, labor: any) => {
                      const hours = Number(labor.hours) || 0;
                      const laborRate = Number(labor.laborRate) || 0;
                      return sum + hours * laborRate;
                    }, 0);

                    const totalTaskCost = partsTotalCost + laborTotalCost;

                    return (
                      <Fragment key={field.id}>

                        { editIndex === index ? (
                          <tr className="px-6">
                            <td colSpan={4} className="px-6 py-4">
                              <>  
                                <WorkOrderAsyncSelectInput 
                                  equipmentId={methods.getValues('equipment.value')}
                                  className="w-full mb-4"
                                  labelText="New Task"
                                  labelClassName="flex text-sm font-medium mb-4"
                                  name={`tasks.${index}` as const}
                                  // arrayName={`tasks` as const}
                                  isEditMode={true}
                                />
                                <div className="flex gap-4 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddTask(index)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded"
                                  >
                                    Save Task
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTask(index)}
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                  >
                                    Remove Task
                                  </button>
                                </div>
                              </>
                            </td>
                          </tr>                            
                        ): (
                          <>
                            <tr className="px-6">
                              <td className="px-6 py-4">
                                {field.task?.taskType === 'Recurring' ? (
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      {completed ? (
                                        <CheckIcon className="h-5 w-5 text-gray-500 mr-2" />
                                      ): (
                                        <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                                      )}
                                      {field.task?.task.label}
                                    </div>
                                  </div>
                                ):(
                                  <div className="flex flex-col">
                                  <div className="flex items-center">
                                    {completed ? (
                                      <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                                    ): (
                                      <WrenchIcon className="h-5 w-5 text-gray-500 mr-2" />
                                    )}
                                    {field.task?.task.label}
                                  </div>
                                </div>
                                )}
                              </td>
                              <td className="px-6 py-4 truncate">
                                {formatCurrency(partsTotalCost, 'USD')}
                              </td>
                              <td className="px-6 py-4 truncate">
                                {formatCurrency(laborTotalCost, 'USD')}
                              </td>
                              <td className="px-6 py-4 truncate">
                                {formatCurrency(totalTaskCost, 'USD')}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTask(index)}
                                  className="text-sm font-medium text-red-500"
                                >
                                  <TrashIcon className="w-5" />
                                </button>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={4}>
                                <TaskField
                                  key={field.id}
                                  index={index}
                                  activeTaskIndex={activeTaskIndex}
                                  setActiveTaskIndex={setActiveTaskIndex}
                                />
                              </td>
                            </tr>
                          </>
                        )}
 
                      </Fragment>                    
                    );
                  })
                )}

              </tbody>
            </table>
            { woStatus == 'Open' && (
                <div className="flex w-full rounded-md bg-gray-50 p-4 text-blue-500 text-sm font-medium">
                  <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={handleAdd}
                  >
                    <PlusIcon className="w-5" />
                    <p>ADD TASK</p>
                  </button>
                </div>
              )
            }
          </div>
        </div>
        <div className="absolute right-0">
          <Total />
        </div>
      </div>
    </FormProvider>
  );
}


// Inner component to handle a single task and its nested parts field array.
const TaskField = ({ 
  index,
  activeTaskIndex,
  setActiveTaskIndex
}: { 
  index: number 
  activeTaskIndex: number | null;
  setActiveTaskIndex: (index: number | null) => void;

}) => {
  const { control, getValues, setValue, resetField } = useFormContext<WorkOrderFormValues>();
  // Nested field array for parts for the given task index.
  const { fields: partsFields, append: appendPart, remove: removePart, update: updatePart } = useFieldArray({
    control,
    name: `tasks.${index}.parts` as const,
    keyName: "_id",
  });

  const { fields: laborFields, append: appendLabor, remove: removeLabor, update: updateLabor } = useFieldArray({
    control,
    name: `tasks.${index}.labor` as const,
    keyName: "_id",
  });

  // State to track which part row is in edit mode
  const [activePartIndex, setActivePartIndex] = useState<{
    [taskIndex: number]: number | null;
  }>({});

  // State to track which part row is in edit mode
  const [activeLaborIndex, setActiveLaborIndex] = useState<{
    [taskIndex: number]: number | null;
  }>({});

  const handleAddPart = () => {
    // Remove only empty parts from the previous active task
    if (activeTaskIndex !== null && activeTaskIndex !== index) {
      clearEmptyPartsFromTask(activeTaskIndex);
    }
  
    // Ensure only one part is being added at a time
    const existingParts = getValues(`tasks.${index}.parts`) || [];
    const hasEmptyPart = existingParts.some(
      (part: any) => !((part.item?.value ?? "").trim())
    );
  
    if (!hasEmptyPart) {
      appendPart({
        id: "",
        date: new Date(),
        qtyIssued: 0,
        description: "",
        workOrderTaskId: getValues(`tasks.${index}.id`),
        equipment: {
          value: getValues("equipment.value"),
          label: getValues("equipment.label"),
        },
        receiptId: "",
        item: {
          value: "",
          label: "",
          quantity: 0,
          qtyRemaining: 0,
          location: "",
          unitCostDollar: 0,
          unitCostVES: 0,
          unitType: "",
          vendor: "",
          warehouse: "",
        },
      });
      setActiveTaskIndex(index);
      // Set the current part being edited
      setActivePartIndex((prev) => ({ ...prev, [index]: partsFields.length }));
    }
  };

  const handlRemovePart = async (partIndex: number) => {
    const item = getValues(`tasks.${index}.parts.${partIndex}`);
    const response = await deleteIssuance(item);

    if (response.success) {
      removePart(partIndex);
    } else {
      alert(response.message)      
      console.error("Update failed", response.message);
    }
  };

  const clearEmptyPartsFromTask = (taskIndex: number) => {
    const existingParts = getValues(`tasks.${taskIndex}.parts`) || [];
    const filteredParts = existingParts.filter((part: any) => {
      return ((part.item?.value ?? "").trim() !== "");
    });    

    setValue(`tasks.${taskIndex}.parts`, filteredParts); // Only keep parts with a name
  };

  const handleSavePart = async (partIndex: number) => {

    const part = getValues(`tasks.${index}.parts.${partIndex}`);
    console.log("Before Filtering:", part); // Debugging

    // Send `filteredData` to the API instead of `data`
    const response = await createIssuance(part); // await createWorkOrder(filteredData);

     // Ensure that result is defined.
     if (!response) {
      throw new Error("No data returned from transaction");
    }

    if (response?.error) {
      // Handle server error
      console.error("Server error:", response.error);
    } else {
      console.log("Server response:", response);
      
      // Remove the part from the form so it is no longer present
      removePart(partIndex);
      
      // Process the server's returned data
      appendPart(response.data);
          
      // Optionally, update your local state to hide the part field (if needed)
      // This will update the activePartIndex mapping for the current task.
      setActivePartIndex((prev) => ({ ...prev, [index]: null }));
    }
  };

  const handleUpdatePart = async (partIndex: number) => {
    const part = getValues(`tasks.${index}.parts.${partIndex}`);
    console.log("Before Filtering:", part); // Debugging
  
    // Call updateIssuance with the part data.
    const response = await upsertIssuance(part);
  
    if (!response) {
      throw new Error("No data returned from transaction");
    }
  
    if (response?.error) {
      console.error("Server error:", response.error);
    } else {
     
      // Check the action type to decide whether to append or update.
      if (response.action === "addition") {
          console.log("Adding part to the form:", response.data);
            // Update the current part with the first issuance record.
            resetField(`tasks.${index}.parts.${partIndex}`, { defaultValue: response.data[0] });
            updatePart(partIndex, response.data[0]);
          
            // If there are additional issuance records, append them.
            if (response.data.length > 1) {
              const additionalParts = response.data.slice(1);
              appendPart(additionalParts);
            }
      
      } else if (response.action === "subtraction") {
        resetField(`tasks.${index}.parts.${partIndex}`, { defaultValue: response.data });
        updatePart(partIndex, response.data);
      }
      
      setActivePartIndex((prev) => ({ ...prev, [index]: null }));
    }
  };

  const clearEmptyLaborFromTask = (taskIndex: number) => {
    const existingLabor = getValues(`tasks.${taskIndex}.labor`) || [];
    const filteredLabor = existingLabor.filter((part: any) => {
      return ((part.employee?.value ?? "").trim() !== "");
    });    

    setValue(`tasks.${taskIndex}.labor`, filteredLabor); // Only keep parts with a name
  };

  const handleAddLabor = () => {

    // Remove empty parts from previous active task if needed
    if (activeTaskIndex !== null && activeTaskIndex !== index) {
      clearEmptyLaborFromTask(activeTaskIndex);
    }

    // Ensure only one empty labor entry exists
    const existingLabor = getValues(`tasks.${index}.labor`) || [];
    const hasEmptyLabor = existingLabor.some(
      (labor: any) => !(labor.employee?.value || "").trim()
    );

    if (!hasEmptyLabor) {
      appendLabor({
        id: "",
        employee: {
          value: "",
          label: "",
          laborRate: 0,
        },
        date: new Date(),
        hours: 0,
        laborRate: 0,
        workOrderTaskId: getValues(`tasks.${index}.id`)
      });
      setActiveTaskIndex(index);
      setActiveLaborIndex((prev) => ({ ...prev, [index]: laborFields.length }));
    }
  };

  const handleSaveLabor = async (laborIndex: number) => {

    const labor = getValues(`tasks.${index}.labor.${laborIndex}`);
    console.log("Before Filtering:", labor); // Debugging

    // Send `filteredData` to the API instead of `data`
    const response = await upsertLabor(labor); // await createWorkOrder(filteredData);

     // Ensure that result is defined.
     if (!response) {
      throw new Error("No data returned from transaction");
    }

    if (response?.error) {
      // Handle server error
      console.error("Server error:", response.error);
    } else {      
      // Remove the part from the form so it is no longer present
      removeLabor(laborIndex);
      
      // Process the server's returned data
      appendLabor(response.data);
          
      // Optionally, update your local state to hide the part field (if needed)
      // This will update the activePartIndex mapping for the current task.
      setActiveLaborIndex((prev) => ({ ...prev, [index]: null }));
    }
  };

  const handlRemoveLabor = async (laborIndex: number) => {
    const labor = getValues(`tasks.${index}.labor.${laborIndex}`);
    const response = await deleteLabor(labor);

    if (response.success) {
      removeLabor(laborIndex);
    } else {
      alert(response.message)      
      console.error("Update failed", response.message);
    }
  };

  const handleMarkComplete = async (
    index: number, 
    completed: boolean
  ) => {
    const workOrdertaskId = getValues(`tasks.${index}.id`);
    // Call the API to mark the task as complete
    const response = await upsertComplete(workOrdertaskId, completed);
    if (response.success) {
      // Reset the field to the new completed value
      resetField(`tasks.${index}.completed`, { defaultValue: completed });
      setValue(`tasks.${index}.completed`, completed);
    } else {
      alert(response.message);
      console.error("Update failed", response.message);
    }
  };

  const taskStatus = getValues(`woStatus`);
  
  return (
    <div className="w-full px-6 py-2">
      { (taskStatus === 'Open' || taskStatus === 'In_Progress') && 
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddPart}
            className="text-blue-500 mb-4"
          >
            Add Parts
          </button>
          <button
            type="button"
            onClick={handleAddLabor}
            className="text-blue-500 mb-4"
          >
            Add Labor
          </button>
          { getValues(`tasks.${index}.completed`) ? (
            <button
              type="button"
              onClick={ () => handleMarkComplete(index, false)}
              className="text-blue-500 mb-4"
            >
              Mark Incomplete
            </button>
          ) : (
            <button
              type="button"
              onClick={ () => handleMarkComplete(index, true)}
              className="text-blue-500 mb-4"
            >
              Mark Complete
            </button>
          )}
        </div>
      }
      {/* Parts Table */}
      {partsFields.length > 0 && (
        <table className="w-full">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2">PART</th>
              <th className="px-4 py-2">VENDOR</th>
              <th className="px-4 py-2">BIN</th>
              <th className="px-4 py-2">QTY</th>
              <th className="px-4 py-2">COST</th>
              <th className="px-4 py-2">TOTAL</th>
              <th className="w-12 px-4 py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {partsFields.map((partField, partIndex) => (
              activePartIndex[index] === partIndex ? (
                // Editable Mode
                <tr key={partField.id}>
                  <td colSpan={5}>
                    <div className="flex mt-4 gap-4">
                      <WorkOrderPartsAsyncSelectInput 
                        className="w-full mb-4"
                        labelText="Part"
                        labelClassName="flex text-sm font-medium mb-4"
                        name={`tasks.${index}.parts.${partIndex}.item` as const}
                        arrayName={`tasks.${index}.parts` as const}
                        setValueName={`tasks.${index}.parts.${partIndex}.item.unitCostDollar` as const}
                        isEditMode={activePartIndex[index] === partIndex}
                        isDisabled={activePartIndex[index] === partIndex && !!partField.id}
                      />
                      <NumericInput
                        className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0 mb-4"
                        labelClassName="mb-4"              
                        pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                        controllerClassName="flex w-24 rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                        unitLabel="Qty"
                        labelText="Qty"
                        name={`tasks.${index}.parts.${partIndex}.qtyIssued` as const}
                        isEditMode={activePartIndex[index] === partIndex}
                      />
                      <NumericInput
                        className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0 mb-4"
                        labelClassName="mb-4"              
                        pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                        controllerClassName="flex w-24 rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                        unitLabel="$"
                        labelText="Cost"
                        name={`tasks.${index}.parts.${partIndex}.item.unitCostDollar` as const}
                        isEditMode={activePartIndex[index] === partIndex}
                      />
                      <div className="flex flex-col gap-4">
                          <label htmlFor="totalCost">Total</label>
                          <p className="flex items-center justify-center">
                            {
                              getValues(`tasks.${index}.parts.${partIndex}.item.unitCostDollar`) * getValues(`tasks.${index}.parts.${partIndex}.qtyIssued`)
                            }
                          </p>
                      </div>
                     
                    </div>
                    <div className="flex gap-4 mt-2">
                      {
                        // Show the save button only if the part has a name
                        partField.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdatePart(partIndex)}
                              className="px-2 py-1 bg-blue-500 text-white rounded"
                            >
                              Save Part
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                resetField(`tasks.${index}.parts.${partIndex}`);
                                setActivePartIndex((prev) => ({ ...prev, [index]: null }));
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                              Cancel
                            </button>
                          </>
                        ): (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSavePart(partIndex)}
                              className="px-2 py-1 bg-blue-500 text-white rounded"
                            >
                              Save Part
                            </button>
                            <button
                              type="button"
                              onClick={() => removePart(partIndex)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                              Remove
                            </button>
                          </>
                        )
                      }

                    </div>
                  </td>
                </tr>
              ) : (
                // Read-Only Mode - Display as Table Row
                <tr key={partField.id} className="border-gray-200">
                  <td className="px-4 py-2">{partField.item.label || "N/A"}</td>
                  <td className="px-4 py-2">{partField.item.vendor}</td>
                  <td className="px-4 py-2">{partField.item.location}</td>
                  <td className="px-4 py-2">{partField.qtyIssued}</td>
                  <td className="px-4 py-2">{formatCurrency(partField.item.unitCostDollar, 'USD')} {partField.item.unitType}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(((partField.qtyIssued ?? 0) * (partField.item.unitCostDollar ?? 0)), 'USD')}
                  </td>
                  <td className="px-4 py-2">
                    <Dropdown
                      inline
                      label=''
                      renderTrigger={() => <Cog8ToothIcon className="flex mx-auto justify-center items-center overflow-visible h-6 w-6" />}
                      placement="bottom"
                    >
                      <Dropdown.Item
                        onClick={() =>
                          setActivePartIndex((prev) => ({
                            ...prev,
                            [index]: partIndex,
                          }))
                        }
                        icon={PencilSquareIcon}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handlRemovePart(partIndex)} icon={TrashIcon}>
                        Delete
                      </Dropdown.Item>
                    </Dropdown>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}
      {/* Labor Table */}
      {laborFields.length > 0 && (
        <table className="w-full mt-4">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-2">TECHNICIAN</th>
              <th className="px-4 py-2">DATE</th>
              <th className="px-4 py-2">HOURS</th>
              <th className="px-4 py-2">RATE</th>
              <th className="px-4 py-2">TOTAL</th>
              <th className="w-12 px-4 py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {laborFields.map((laborField, laborIndex) =>
              activeLaborIndex[index] === laborIndex ? (
                // Editable Mode for Labor
                <tr key={laborField.id}>
                  <td colSpan={4}>
                    <div className="flex mt-4 gap-4">
                      <LaborAsyncSelectInput 
                        className="w-full mb-4"
                        labelText="Technician"
                        labelClassName="flex text-sm font-medium mb-4"
                        name={`tasks.${index}.labor.${laborIndex}.employee` as const}
                        arrayName={`tasks.${index}.labor` as const}
                        setValueName={`tasks.${index}.labor.${laborIndex}.laborRate` as const}
                        isEditMode={activeLaborIndex[index] === laborIndex}
                        isDisabled={activeLaborIndex[index] === laborIndex && !!laborField.id}
                      />
                      <NumericInput
                        className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0 mb-4"
                        labelClassName="mb-4"              
                        pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                        controllerClassName="flex w-24 rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                        unitLabel="Hrs"
                        labelText="Hours"
                        name={`tasks.${index}.labor.${laborIndex}.hours` as const}
                        isEditMode={activeLaborIndex[index] === laborIndex}
                      />
                      <NumericInput
                        className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0 mb-4"
                        labelClassName="mb-4"              
                        pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                        controllerClassName="flex w-24 rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                        unitLabel="$"
                        labelText="Rate"
                        name={`tasks.${index}.labor.${laborIndex}.laborRate` as const}
                        isEditMode={activeLaborIndex[index] === laborIndex}
                      />
                      <div className="flex flex-col gap-4">
                        <label>Total</label>
                        <p className="flex items-center justify-center">
                          {/* {getValues(`tasks.${index}.labor.${laborIndex}.hours`) *
                            getValues(`tasks.${index}.labor.${laborIndex}.rate`)} */}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      {laborField.id ? (
                        <>
                          <button
                            type="button"
                            // onClick={() => handleUpdateLabor(laborIndex)}
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                          >
                            Save Labor
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resetField(`tasks.${index}.labor.${laborIndex}`);
                              setActiveLaborIndex((prev) => ({ ...prev, [index]: null }));
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveLabor(laborIndex)}
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                          >
                            Save Labor
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLabor(laborIndex)}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Read-Only Mode for Labor
                <tr key={laborField.id} className="border-gray-200">
                  <td className="px-4 py-2">{laborField.employee?.label || "N/A"}</td>
                  <td className="px-4 py-2">
                    {/* {laborField.date ? new Date(laborField.date).toLocaleDateString() : "N/A"} */}
                  </td>
                  <td className="px-4 py-2">{laborField.hours}</td>
                  <td className="px-4 py-2">{formatCurrency(laborField.laborRate, 'USD')}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(
                      (laborField.hours ?? 0) * (laborField.laborRate ?? 0),
                      'USD'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Dropdown
                      inline
                      label=''
                      renderTrigger={() => (
                        <Cog8ToothIcon className="h-6 w-6 mx-auto" />
                      )}
                      placement="bottom"
                    >
                      <Dropdown.Item
                        onClick={() =>
                          setActiveLaborIndex((prev) => ({
                            ...prev,
                            [index]: laborIndex,
                          }))
                        }
                        icon={PencilSquareIcon}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handlRemoveLabor(laborIndex)} icon={TrashIcon}>
                        Delete
                      </Dropdown.Item>
                    </Dropdown>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Total = () => {
  const { control, getValues } = useFormContext<WorkOrderFormValues>();
  const workOrderId = getValues("id");

  // Watch the tasks array from the form
  const tasks = useWatch({ name: "tasks", control }) || [];
  const tax1 = useWatch({ name: "tax1", control }) || 0;
  const tax2 = useWatch({ name: "tax2", control }) || 0;

  // Calculate the grand total by iterating over each task's parts
  const grandTotal = tasks.reduce((total, task) => {
    const partsTotal = (task.parts || []).reduce((sum, part) => {
      const cost = Number(part.item?.unitCostDollar) || 0;
      const quantity = Number(part.qtyIssued) || 0;
      return sum + cost * quantity;
    }, 0);

    const laborTotal = (task.labor || []).reduce((sum, labor) => {
      const hours = Number(labor.hours) || 0;
      const laborRate = Number(labor.laborRate) || 0;
      return sum + hours * laborRate;
    }, 0);

    return total + partsTotal + laborTotal;
  }, 0);

  // Calculate tax amounts based on the grand total
  const tax1Amount = grandTotal * (tax1 / 100);
  const tax2Amount = grandTotal * (tax2 / 100);

  // Final total includes the grand total and both taxes
  const finalTotal = grandTotal + tax1Amount + tax2Amount;

  // Generic tax update handler
  const handleTaxUpdate = async (tax: number, field: "tax1" | "tax2") => {
    return await upsertTax({
      tax: tax,
      taxField: field,
      workOrderId: workOrderId,
    });
  };

  return (
    <div className="flex flex-col w-60 text-sm mt-4 mb-40 gap-2">
      {/* Subtotal */}
      <div className="flex w-full">
        <label htmlFor="subtotal" className="w-16 font-medium mr-12">
          Subtotal:
        </label>
        <p
          id="subtotal"
          className="text-sm flex-1 ml-auto text-right overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {formatCurrency(grandTotal, "USD")}
        </p>
      </div>

      {/* Tax 1 */}
      <div className="flex items-center">
        <label htmlFor="tax-1" className="w-16 font-medium">
          Tax 1:
        </label>
        <div className="flex w-12 justify-center border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900">
          <PopoverInput
            name={`tax1` as const}
            labelText="Tax 1"
            labelClassName="flex"
            displayType="percentage"
            onSave={(tax) => handleTaxUpdate(tax, "tax1")}
            isEditMode={true}
          />
        </div>
        <p className="text-sm flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap">
          {formatCurrency(tax1Amount, "USD")}
        </p>
      </div>

      {/* Tax 2 */}
      <div className="flex items-center">
        <label htmlFor="tax-2" className="w-16 font-medium">
          Tax 2:
        </label>
        <div className="flex w-12 justify-center border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900">
          <PopoverInput
            name={`tax2` as const}
            labelText="Tax 2"
            labelClassName="flex"
            displayType="percentage"            
            onSave={(tax) => handleTaxUpdate(tax, "tax2")}
            isEditMode={true}
          />
        </div>
        <p className="text-sm flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap">
          {formatCurrency(tax2Amount, "USD")}
        </p>
      </div>

      {/* Total */}
      <div className="flex">
        <label htmlFor="total" className="w-16 font-medium mr-12">
          Total:
        </label>
        <p
          id="total"
          className="text-sm ml-auto flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {formatCurrency(finalTotal, "USD")}
        </p>
      </div>
    </div>
  );
};

