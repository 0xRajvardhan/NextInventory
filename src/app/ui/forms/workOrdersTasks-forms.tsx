import React, { useState, useEffect } from "react";
import {
  useFieldArray,
  Controller,
  useFormContext
} from "react-hook-form";
import { XCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CalendarIcon, WrenchIcon } from "@heroicons/react/20/solid";
import { TaskDueComponent } from "../components/taskDueCalculation";
import { fetchMetersByEquipmentId, fetchWorkOrderTasksByEquipmentId } from "@/app/lib/data";
import WorkOrderAsyncSelectInput from "../components/RHF/workOrderAsyncSelectInput";
import { WorkOrderFormValues } from "@/app/lib/definitions";
import { Spinner } from "flowbite-react";
import { Priority } from "@prisma/client";

export default function WorkOrdersTasksForm({}) {
  const { control, watch, setValue, getValues, reset } = useFormContext<WorkOrderFormValues>();

  const selectedEquipment = watch("equipment");
  const [loading, setLoading] = useState(false);

  const { fields, append: appendTask, remove: removeTask } = useFieldArray({
    control,
    name: "tasks",
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    const fetchTasks = async () => {
      if (!selectedEquipment?.value) {
        reset({
          ...getValues(),
          tasks: [],
          primaryMeterReading: 0,
          secondaryMeterReading: 0,
        });
        setAddIndex(false);
        setValue("primaryMeterReading", 0);
        setValue("secondaryMeterReading", 0);
        setLoading(false);
        return;
      }
  
      setLoading(true); // 🔵 Start loading before fetch
  
      try {
        const [tasks, meters] = await Promise.all([
          fetchWorkOrderTasksByEquipmentId(selectedEquipment.value),
          fetchMetersByEquipmentId(selectedEquipment.value),
        ]);
  
        if (signal.aborted) return;
  
        if (tasks && meters) {
          const tasksWithChecked = tasks.map((task) => ({
            ...task,
            task: {
              ...task.task,
              checked: true,
            },
          }));
  
          if (!getValues("equipment")?.value) return;
  
          tasksWithChecked.forEach((task) => appendTask(task));
          setValue("primaryMeterReading", meters.primaryMeterReading);
          setValue("secondaryMeterReading", meters.secondaryMeterReading);
        } else {
          reset({
            ...getValues(),
            tasks: [],
            primaryMeterReading: 0,
            secondaryMeterReading: 0,
          });
          setAddIndex(false);
        }
      } catch (error) {
        if (signal.aborted) return;
        reset({
          ...getValues(),
          tasks: [],
          primaryMeterReading: 0,
          secondaryMeterReading: 0,
        });
        setAddIndex(false);
      } finally {
        setLoading(false); // 🟢 Stop loading in all cases
      }
    };
  
    fetchTasks();
  
    return () => {
      controller.abort();
    };
  }, [selectedEquipment, appendTask, reset, setValue, getValues]);
  
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

  const handleRemove = (index: number) => {
      removeTask(index);
      setEditIndex(null);
      setAddIndex(false);
  };
  
  return (
    <div className="mt-6 shadow-md flow-root">
      <div className="relative shadow-md sm:rounded-lg">
        <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6"></th>
              <th scope="col" className="px-6 py-3">Task</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Priority</th>
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center items-center">
                    <div className="flex justify-center items-center">
                      <Spinner />
                      <p className="ml-2">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">No data available</td>
                    </tr>
                  ) : (
                    fields.map((field, index) => {
                      const task = field.task;
                      const isRepair = task?.taskType === "Repair";
                      const isRecurring = task?.taskType === "Recurring";

                      return (
                        <React.Fragment key={field.id ?? index}>
                          {editIndex === index ? (
                            <tr>
                              <td className="px-6 py-4" colSpan={5}>
                                <div className="flex items-center gap-2">
                                  <WorkOrderAsyncSelectInput 
                                    equipmentId={getValues('equipment.value') ?? ""}
                                    className="w-full mb-4"
                                    labelClassName="flex text-sm font-medium mb-4"
                                    name={`tasks.${index}` as const}
                                    isEditMode={true}
                                  />
                                  <XCircleIcon
                                    className="ml-3 w-6 h-6 text-red-600 cursor-pointer"
                                    onClick={() => handleRemove(index)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td className="text-center align-middle">
                                <Controller
                                  control={control}
                                  name={`tasks.${index}.task.checked`}
                                  render={({ field: { value, onChange } }) => (
                                    <input
                                      type="checkbox"
                                      checked={value ?? true}
                                      onChange={(e) => onChange(e.target.checked)}
                                    />
                                  )}
                                />
                              </td>
                              <td className="px-6 py-4">{task?.task?.label}</td>
                              {isRepair ? (
                                <>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <WrenchIcon className="h-5 w-5 text-gray-500 mr-2" />
                                      {task.taskType}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <TaskDueComponent
                                      task={task.taskTracking}
                                      equipment={{
                                        primaryMeterReading: getValues("primaryMeterReading"),
                                        secondaryMeterReading: getValues("secondaryMeterReading"),
                                      }}
                                    />
                                  </td>
                                  <td className="px-6 py-4">{task.priority ?? "N/A"}</td>
                                </>
                              ) : isRecurring ? (
                                <>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                                      {task.taskType}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <TaskDueComponent
                                      task={task.taskTracking}
                                      equipment={{
                                        primaryMeterReading: getValues("primaryMeterReading"),
                                        secondaryMeterReading: getValues("secondaryMeterReading"),
                                      }}
                                    />
                                  </td>
                                </>
                              ) : null}
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </>
              )}
            </tbody>
        </table>
        <div className="flex w-full rounded-md bg-gray-50 p-4 text-blue-500 text-sm font-medium">
          <button type="button" className="flex items-center gap-2" onClick={handleAdd}>
            <PlusIcon className="w-5" />
            <p>ADD TASK</p>
          </button>
        </div>
      </div>
    </div>
  );
}
