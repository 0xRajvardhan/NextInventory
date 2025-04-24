"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { createItem, deleteVendor } from "@/app/lib/actions";
import { InventoryFormSchema, InventoryFormValues, Option } from "@/app/lib/definitions";
import { TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/button';
import NumericInput from '../components/RHF/numericInput';
import TextInput from '../components/RHF/textInput';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

import AsyncSelectFilterInput from '../components/RHF/asyncSelectFilterInput';
import AsyncCreatableSelectInput from '../components/RHF/asyncCreatableSelectInput';
import AsyncSelectInput from '../components/RHF/asyncSelectInput';
import { fetchCategories, fetchManufacturers, fetchUnitType, fetchVendors, fetchWarehouses } from '@/app/lib/data';
import { PlusIcon } from "@heroicons/react/24/outline";

type InventoryFormProps = {
  item?: InventoryFormValues;
  isEditMode?:  boolean;
};

// Define form default values
const defaultValues: InventoryFormValues = {
  id: "",
  partNumber: "",
  name: "",
  description: "",
  category: null,
  unitType: null,
  inventory: [
    {
      id: "",
      warehouse: null,
      quantity: 0,
      reorderQuantity: 0,
      lowStockLevel: 0,
      unitCostDollar: 0,
      unitCostVES: 0,
      location: "",
    },
  ],
  vendors: [
    {
      id: "",
      vendor: null,
      manufacturer: null,
      vendorPartNumber: "",
      barcode: ""
    },
  ],
};

const InventoryForm = ({
  item,
  isEditMode = false,
}: InventoryFormProps) => {

  const methods = useForm<InventoryFormValues>({
    resolver: zodResolver(InventoryFormSchema),
    defaultValues: item ? item : defaultValues,
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting },
  } = methods;

  const router = useRouter();

  const onSubmit: SubmitHandler<InventoryFormValues> = async (data) => {
    try {
      console.log(data)
      const response = await createItem(data);
      if (response?.error) {
        console.error("Server error:", response.error);
      } else {
        router.push(`/dashboard/inventory`);
      }
      
      if (response?.error) {
        setError("partNumber", {
          type: "server",
          message: response.error.message,
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Render a section of inputs
  const renderTextInputs = (fields: Array<{ name: keyof InventoryFormValues; className?: string; required?: boolean; label: string; labelClassName: string; placeholder?: string }>) =>
    fields.map(({ name, className, label, required, labelClassName, placeholder }) => (
      <TextInput
        key={name}
        required={required}
        className={className}
        labelText={label}
        labelClassName={labelClassName}
        name={name}
        placeholder={placeholder || ""}
        isEditMode={isEditMode}
      />
    )
  );

  // Warehouses logic with useFieldArray
  const { fields: inventoryFields, append: appendInventory, remove: removeInventory } = useFieldArray({
    control,
    name: 'inventory',
    keyName: '_id'
  });

  console.log(inventoryFields);

  const { fields: vendorFields, append: appendVendor, remove: removeVendor } = useFieldArray({
    control,
    name: 'vendors',
    keyName: '_id'
  });

  const addWarehouse = () => {
    appendInventory({
      id: "",
      warehouse: null,
      quantity: 0,
      reorderQuantity: 0,
      lowStockLevel: 0,
      unitCostDollar: 0,
      unitCostVES: 0,
      location: '',
    });
  };


  const addVendor = () => {
    appendVendor({
      id: "",
      vendor: null,
      manufacturer: null,
      vendorPartNumber: "",
      barcode: ""
    });
  };

  const handleRemoveVendor = async (id: string, index: number) => {
    // Check if the ID is an empty string
    if (!id) {
      console.log("ID is empty, removing vendor from the form without calling deleteVendor.");
      removeVendor(index);  // Directly remove from the form state
      return;
    }
  
    // Confirm before removing
    const confirmDelete = window.confirm("Are you sure you want to remove this vendor?");
    if (!confirmDelete) return;
  
    const vendor = vendorFields[index]; // Ensure vendorFields is defined in scope
    console.log("Removing vendor:", id, vendor);
  
    try {
      // Call the deleteVendor function (assumed to handle API logic)
      const response = await deleteVendor(id);
  
      // Handle API response
      if (response?.success) {
        console.log("Vendor removed successfully:", response);
  
        // Remove the vendor locally using `removeVendor` or `remove` from useFieldArray
        removeVendor(index); // Ensure this function updates the local state/form
      } else if (response?.error) {
        console.error("Error from server:", response.error);
  
        // // Optionally handle error in form state (e.g., React Hook Form)
        // setError("vendorId", {
        //   type: "server",
        //   message: response.error.message || "Failed to delete vendor.",
        // });
      }
    } catch (error) {
      console.error("Error during removal:", error);
  
      // // Optional: Set an error message in form state or UI
      // setError("vendorId", {
      //   type: "server",
      //   message: "An unexpected error occurred. Please try again.",
      // });
    }
  };
  

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          {/* General Info Section */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            {renderTextInputs([
              { name: "partNumber", label: "Part Number", required: true, labelClassName: "flex w-full text-sm font-medium mb-2", placeholder: "Enter part number..." },
              { name: "name", className: "col-span-1", label: "Name", labelClassName: "flex text-sm font-medium mb-2", placeholder: "Enter name..." },
              { name: "description", className: "col-span-1", label: "Description", labelClassName: "flex text-sm font-medium mb-2", placeholder: "Enter description..." },
            ])}

            <AsyncSelectInput
              className="col-span-1"
              labelText="Category"
              labelClassName="flex text-sm font-medium mb-2"
              name="category"
              loadOptionsFn={fetchCategories}
              placeholder={defaultValues.category?.label}
              isEditMode={isEditMode}
            />

            <AsyncCreatableSelectInput
              labelText="Unit Type"
              labelClassName="flex text-sm font-medium mb-2"
              name="unitType"
              loadOptionsFn={fetchUnitType}
              isEditMode={isEditMode}
            />
          </div>
        </div>

        {/* Warehouses Section */}
        <div className="rounded-md text-blue-500 bg-gray-50 mb-4 mt-4 md:p-3">
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={addWarehouse}
            >
              <PlusIcon className="w-5" />
              <p>Warehouses</p>
            </button>         
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Dynamically render select elements for warehouses */}
          {inventoryFields.map((field, index) => (
            <div key={field.id} className="w-[calc(33.33%-16px)] relative rounded-md bg-gray-50 md:p-6">
              {index !== 0 && (
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-md"
                  onClick={() => removeInventory(index)}
                >
                  <TrashIcon className="w-5" />
                </button>
              )}
              
              <AsyncSelectFilterInput
                className="mb-4 text-sm"
                required
                labelText="Warehouse"
                labelClassName="flex text-sm font-medium mb-2"
                name={`inventory.${index}.warehouse`}
                arrayName={'inventory'}
                getOptionValue={(item) => item?.warehouse?.value}
                loadOptionsFn={fetchWarehouses}
                placeholder={"Enter item location..."}
                isEditMode={field.id ? false : isEditMode}
                />

              {/* Quantity */}
              <NumericInput
                className="w-1/2 pr-2 text-sm"
                labelText="Quantity"
                labelClassName="flex font-medium mb-2"
                name={`inventory.${index}.quantity`}
                isEditMode={field.id ? false : isEditMode}
              />

              <div className="flex mb-4 mt-4 gap-4">
                {/* Unit Cost Dollar */}
                <NumericInput
                  required
                  labelText="Unit Cost Dollar"
                  unitLabel='$'
                  pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                  controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                  labelClassName="flex text-sm font-medium mb-2"
                  name={`inventory.${index}.unitCostDollar`}
                  isEditMode={isEditMode}
                />
                {/* Unit Cost VES */}
                <NumericInput
                  required
                  labelText="Unit Cost VES"
                  unitLabel='Bs.'
                  pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
                  controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                  labelClassName="flex text-sm font-medium mb-2"
                  name={`inventory.${index}.unitCostVES`}
                  isEditMode={isEditMode}
                />
              </div>

              {/* Location */}
              <TextInput
                className="col-span-1"
                labelText="Location"
                labelClassName="flex text-sm font-medium mb-2"
                name={`inventory.${index}.location`}
                placeholder="Enter item location..."
                isEditMode={isEditMode}
              />

              <div className="flex mb-4 mt-4 gap-4">
                {/* Low Level Stock */}
                <NumericInput
                  labelText="Low Level Stock"
                  labelClassName="flex text-sm font-medium mb-2"
                  name={`inventory.${index}.lowStockLevel`}
                  isEditMode={isEditMode}
                />

                {/* Reorder Quantity */}
                <NumericInput
                  labelText="Reorder Quantity"
                  labelClassName="flex text-sm font-medium mb-2"
                  name={`inventory.${index}.reorderQuantity`}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Vendors Section */}
        <div className="flex mb-4 mt-4 w-full rounded-md bg-gray-50 p-4 text-blue-500">
          <button
            type="button"
            className="flex items-center gap-2"
            onClick={addVendor}
          >
            <PlusIcon className="w-5" />
            <p>Vendors</p>
          </button>
        </div>

        <div className="flex flex-wrap gap-6">
          {vendorFields.map((field, index) => (
            <div key={field.id} className="w-[calc(33.33%-16px)] relative rounded-md bg-gray-50 md:p-6 col-span-1">
              {index !== 0 && (
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-md"
                  // onClick={() => removeVendor(index)}
                  onClick={() => handleRemoveVendor(field.id, index)}
                >
                  <TrashIcon className="w-5" />
                </button>
              )}
              <AsyncSelectFilterInput
                className="mb-4 text-sm"
                required
                labelText="Supplier"
                labelClassName="flex text-sm font-medium mb-2"
                name={`vendors.${index}.vendor`}
                arrayName={'vendors'}
                getOptionValue={(vendor) => vendor?.vendor?.value}
                loadOptionsFn={fetchVendors}
                placeholder={"Select a supplier..."}
                isEditMode={isEditMode}
              />
              <AsyncCreatableSelectInput
                className="mb-4 text-sm"
                labelText = "Manufacturer"
                labelClassName = "flex text-sm font-medium mb-2"
                name = {`vendors.${index}.manufacturer`}
                loadOptionsFn={fetchManufacturers}
                placeholder="Enter manufacturer..."
                isEditMode={isEditMode}
              />
              <TextInput
                className = "mb-4"
                labelText="Vendor Part #"
                labelClassName = "flex text-sm font-medium mb-2"
                name = {`vendors.${index}.vendorPartNumber` as const}
                placeholder="Enter vendor part #..."
                isEditMode={isEditMode}
              />
              <TextInput
                className = "col-span-1"
                labelText="Barcode"
                labelClassName = "flex text-sm font-medium mb-2"
                name = {`vendors.${index}.barcode` as const}
                placeholder="Enter barcode..."
                isEditMode={isEditMode}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mb-4 mt-4">          
          <Button type="button" 
            onClick={() => item ? router.push(`/dashboard/inventory/${item.id}`) : router.push(`/dashboard/inventory`) } className="bg-red-500 text-white hover:bg-red-600">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner /> {/* Show a spinner */}
                Saving...
              </div>
            ) : (
              item ? "Update Item" : "Create Item"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default InventoryForm;
