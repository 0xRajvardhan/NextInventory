"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TrashIcon, PlusCircleIcon, PlusIcon, Cog8ToothIcon } from "@heroicons/react/24/outline";
import { Button } from "../components/button";


import {RecurringTaskFormValues } from "@/app/lib/definitions";

import FormPartsAsyncSelectInput from "../components/RHF/itemsAsyncSelectInput";

import NumericInput from "../components/RHF/numericInput";
import ItemsAsyncSelectInput from "../components/RHF/itemsAsyncSelectInput";

import MergedAsyncSelectInput from "../components/RHF/mergedComponent";
import { deleteTaskItem, upsertTaskItem } from "@/app/lib/actions";
import { Dropdown } from "flowbite-react";


export default function Parts({
  isEditMode,
}:
{
  isEditMode: boolean;
}) {

const { control, getValues, resetField } = useFormContext<RecurringTaskFormValues>();

const [editIndex, setEditIndex] = useState<number | null>(null);

  const recurringTaskId = getValues("id");


  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "taskItem",
    keyName: "_id"
  });

  const handleAdd = () => {
    append({
      id: '',
      recurringTaskId: recurringTaskId,
      item: {
        name: '',
        description: '',
        quantity: 0,
        value: '',
        label: '',
        unitCostDollar: 0
      },
      quantity: 0
    });
    setEditIndex(fields.length); // Auto-edit newly added row
  };

  const handleSave = async (index: number) => {
    const part = getValues(`taskItem.${index}`);

    console.log(part);

    // Send `filteredData` to the API instead of `data`
    const response = await upsertTaskItem(part); // await createWorkOrder(filteredData);

    console.log(response);

    if (response?.error) {
      // Handle server error
      console.error("Server error:", response.error);
    } else {

      if (part.id && part.id.trim() !== "") {
        // `part.id` is not null, undefined, or an empty string (including whitespace-only)
        update(index, response.data);
      } else {
        remove(index);
        append(response?.data); // Append the updated part to the
      }
      setEditIndex(null);
      console.log("Server response:", response);
    }
  };

  
  const handleCancel = (index: number) => {
    remove(index);
  };

  const handleDelete = async (index: number) => {
    const part = getValues(`taskItem.${index}`);
    if (part.id && part.id.trim() !== "") {
      // `part.id` is not null, undefined, or an empty string (including whitespace-only)
      const response = await deleteTaskItem(part);

      if (response?.error) {
        // Handle server error
        console.error("Server error:", response.error);
      } else {
        remove(index);
        console.log("Server response:", response);
      }
    } else {
      remove(index);
    }
  };

  return (
    <div className="w-full mt-4 shadow-mdflow-root">
      <div className="relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                <div className="flex gap-3 items-center">
                  {isEditMode ? (
                    <button 
                      type="button" 
                      onClick={handleAdd} 
                      className="text-blue-500"
                    >
                      <PlusIcon className="w-7 h-7" />
                    </button>
                  ) : null}
                  <span>Part Number</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 w-[200px]">
                Qty
              </th>
              <th scope="col" className="px-6 py-3  w-[200px]">
                Each
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (

              editIndex === index ? (
                <tr
                  key={field._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 align-top font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <MergedAsyncSelectInput 
                      className="flex w-full items-center"
                      name={`taskItem.${index}.item` as const}
                      setValueName={`taskItem.${index}.item.unitCostDollar` as const}
                      fetchType="receipt"
                      arrayName={`taskItem` as const}
                      isEditMode={true}
                    />
                    <div className="flex gap-4 mt-2">
                      {
                        // Show the save button only if the part has a name
                        field.item?.value ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSave(index)}
                              className="px-2 py-1 bg-blue-500 text-white rounded"
                            >
                              Save Part
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                resetField(`taskItem.${index}` as const);
                                setEditIndex(null);
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
                              onClick={() => handleSave(index)}
                              className="px-2 py-1 bg-blue-500 text-white rounded"
                            >
                              Save Part
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                              Remove
                            </button>
                          </>
                        )
                      }
                    </div>
                  </th>
                  <td className="px-6 py-4 align-top">
                    <NumericInput
                      className="flex items-start"
                      name={`taskItem.${index}.quantity` as const}
                      isEditMode={true}
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <NumericInput
                      className="flex items-start"
                      name={`taskItem.${index}.item.unitCostDollar` as const}
                      isEditMode={false}
                      prefix={true}
                      pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                      unitLabel="$"
                    />
                  </td>
                </tr>
              ) :(
              // Read-Only Mode - Display as Table Row
              <tr key={field._id} className="border-gray-200">
                <td className="px-6 py-4">{field.item?.label} - {field.item?.description}</td>
                <td className="px-6 py-4">{field.quantity}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 justify-start items-center">
                    <p className="flex text-gray-700 dark:text-gray-400">
                      {field.item?.unitCostDollar}
                    </p>
                    {
                      isEditMode ? (
                        <Dropdown
                          inline
                          label=''
                          renderTrigger={() => <Cog8ToothIcon className="flex mx-auto justify-end items-center overflow-visible h-6 w-6" />}
                          placement="bottom"
                        >
                          <Dropdown.Item
                            onClick={() => setEditIndex(index)}
                            icon={PlusCircleIcon}
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDelete(index)}
                          >
                            <TrashIcon className="text-red-500 w-5 h-5" /> {/* Red icon */}
                            <span className="ml-2">Delete</span> {/* Keep text normal */}
                          </Dropdown.Item>

                        </Dropdown>
                      ): null
                    }

                  </div>
                </td>
              </tr>
              )    
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
