"use client";

import React, { useState } from "react";
import { useFieldArray, useWatch, useFormContext } from "react-hook-form";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteItem, updatePOStatus, upsertFreight, upsertReceipt, upsertTax, upsertTaxBy} from "@/app/lib/actions";
import NumericInput from "../components/RHF/numericInput";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PurchaseOrderFormValues } from "@/app/lib/definitions";
import SelectInput from "../components/RHF/selectInput";
import { calculateSubtotal } from "@/app/lib/utils";
import { TaxBy } from "@prisma/client";

import { FieldArrayProvider } from "../components/RHF/useArrayFormProvider";
import { useFieldArrayContext } from "../components/RHF/useArrayFormProvider";
import { formatCurrency } from "@/app/lib/utils";

import ItemsAsyncSelectInput from "../components/RHF/itemsAsyncSelectInput";
import PopoverInput from "../components/RHF/popOver";
import { determinePOStatus } from "@/app/lib/utils";


export default function ItemsTable({
  purchaseOrder,
}: {
  purchaseOrder: PurchaseOrderFormValues;
}) {

  const { control, watch, setValue, getValues, setError, resetField} = useFormContext<PurchaseOrderFormValues>();

  const {
    fields,
    append,
    remove,
    update,
  } = useFieldArray({
    control: control,
    name: "receipts",
    keyName: "_id"
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [addIndex, setAddIndex] = useState<boolean>(false);

  const poStatus = watch("poStatus"); 

  return (
    <div className="relative">
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
      <FieldArrayProvider  fields={fields} append={append} remove={remove} update={update}>
        <div className="mt-6 shadow-md flow-root">
          <div className="relative shadow-md sm:rounded-lg">
            <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Part Number
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Qty
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Rec&apos;d
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Each
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Ext
                  </th>
                  <th scope="col" className="justify-end px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center items-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => {
                    const qtyOrdered = getValues(`receipts.${index}.qtyOrdered`);
                    return (
                      <React.Fragment key={field.id}>                              
                        { editIndex === index ? (
                          <tr>
                            <td colSpan={5}>
                              <div className="flex w-full justify-center p-6 w-full">
                                <div className="flex flex-col w-full mr-4 text-sm font-medium">
                                  <ItemsAsyncSelectInput 
                                    className="w-full mb-4"
                                    labelText="Part"
                                    labelClassName="flex text-sm font-medium mb-4"
                                    name={`receipts.${index}.item` as const}
                                    warehouseId = {purchaseOrder.warehouse?.value ? purchaseOrder.warehouse.value : ''}
                                    arrayName={`receipts` as const}
                                    isEditMode={editIndex === index}
                                  />
                                  <div className="flex justify-start">
                                    <SaveButton
                                      index={index}
                                      setEditIndex={setEditIndex}
                                      setAddIndex={setAddIndex}
                                    />
                                    <CancelEditButton
                                      index={index}
                                      addIndex={addIndex}
                                      setAddIndex={setAddIndex}
                                      setEditIndex={setEditIndex}
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col w-1/4 mr-4">
                                  <NumericInput
                                    className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0 mb-4"
                                    labelClassName="mb-4"
                                    labelText="Qty"
                                    name={`receipts.${index}.qtyOrdered`}
                                    isEditMode={editIndex === index}
                                  />
                                  <NumericInput
                                    className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0"
                                    labelClassName="mb-4"
                                    labelText="Rec'd"
                                    name={`receipts.${index}.qtyReceived`}
                                    isEditMode={editIndex === index}
                                  />
                                </div>
                                <div className="flex flex-col w-1/4 h-full gap-4 mr-8">
                                  <div className="flex gap-4">
                                    <NumericInput
                                      className="border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0"
                                      labelClassName="mb-4"
                                      labelText="Each"
                                      name={`receipts.${index}.unitCostDollar` as const}
                                      isEditMode={true}
                                    />
                                    <div className="flex w-1/4 h-full">
                                      <LineTotal index={index}/>
                                    </div>
                                  </div>
                                  <SelectInput
                                    className="w-3/4 border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900 focus:ring-0"
                                    labelClassName="mb-4"
                                    name={`taxBy` as const}
                                    labelText="Taxes"
                                    isClearable={false}
                                    isObject={false}
                                    options={[
                                      { value: TaxBy.None, label: "None" },
                                      { value: TaxBy.One, label: "Tax 1" },
                                      { value: TaxBy.Two, label: "Tax 2" },
                                      { value: TaxBy.Both, label: "Both" },
                                    ]}
                                    isEditMode={true}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr className="relative items-center">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                {field.item?.label} {field.item?.name}
                                <div>
                                { poStatus !== 'Close' && (
                                  <div className="flex items-center">
                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => setEditIndex(index)}
                                        className="mr-auto pl-2 pt-2 text-sm font-medium text-blue-500"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                    <ReceivedButton index={index} />
                                    {/* <PopoverInput
                                      className="w-60 flex items-center space-x-4 border-0 bg-gray-200 text-sm text-gray-900 focus:ring-0"
                                      name={`receipts.${index}.qtyReceived` as const}
                                      labelText="Received:"
                                      onSave={() => handleQtyReceived(index)}
                                      triggerContent="Mark Received"
                                      isEditMode={true}
                                    >
                                      <div className="flex mb-4">
                                        <p className="w-24 font-medium">Ordered:</p>
                                        <p>{qtyOrdered}</p>
                                      </div>
                                    </PopoverInput> */}
                                  </div>
                                )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">{field.qtyOrdered}</td>
                            <td className="px-6 py-4">{field.qtyReceived}</td>
                            <td className="px-6 py-4">${field.unitCostDollar}</td>
                            <td className="px-6 py-4">

                              {field.qtyOrdered && field.unitCostDollar
                                ? formatCurrency(field.qtyOrdered * field.unitCostDollar, 'USD')
                                : '0.00'}
                            </td>
                            <td className="px-6 py-4">
                              <DeleteButton 
                                index={index} 
                                setAddIndex={setAddIndex} 
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>            
            <AddInventoryButton 
              purchaseOrder={purchaseOrder} 
              addIndex={addIndex} 
              setAddIndex={setAddIndex} 
              setEditIndex={setEditIndex}
            />
          </div>
        </div>
        <div className="absolute right-0">
          <Total />
        </div>
      </FieldArrayProvider>
    </div>
  );
}

const ReceivedButton = ({
  index,
}: {
  index: number;
}) => {
  const { getValues, setValue, resetField, setError } =
    useFormContext<PurchaseOrderFormValues>();
  const { update } = useFieldArrayContext<PurchaseOrderFormValues>();

  const purchaseOrderId = getValues("id");
  const receiptId = getValues(`receipts.${index}.id`);
  const qtyOrdered = getValues(`receipts.${index}.qtyOrdered`);
  const qtyReceived = getValues(`receipts.${index}.qtyReceived`);

  const markReceived = async (index: number): Promise<{ success: boolean; message: string }> => {
    const receipt = getValues(`receipts.${index}`);
    const receipts = getValues("receipts");
    const currentPoStatus = getValues("poStatus");
      
    // Validate quantity values.
    if (receipt.qtyReceived > receipt.qtyOrdered) {
      setError(`receipts.${index}.qtyReceived`, {
        message: 'Received quantity cannot be greater than ordered quantity',
      });
      return {
        success: false,
        message: 'Received quantity cannot be greater than ordered quantity',
      };
    }
  
    // Run both asynchronous operations concurrently.
    const [result, poStatus] = await Promise.all([
      upsertReceipt(receipt),
      updatePOStatus(purchaseOrderId, determinePOStatus(receipts, currentPoStatus)),
    ]);

    console.log("result", result);
  
    if (result.success && poStatus.success) {
      resetField(`receipts.${index}`, { defaultValue: result.data });
      update(index, result.data);
      // Set the purchase order status with the resolved value.
      resetField(`poStatus`, { defaultValue: poStatus.data });
      setValue('poStatus', poStatus.data);
    } else {
      console.error("Update failed", result.message);
    }
  
    return {
      success: true,
      message: 'Received quantity updated successfully',
    };
  };

  const markUnreceived = async (index: number): Promise<{ success: boolean; message: string }> => {

    setValue(`receipts.${index}.qtyReceived`, 0);
    const receipt = getValues(`receipts.${index}`);
    const receipts = getValues("receipts");
    const currentPoStatus = getValues("poStatus");
      
    // Validate quantity values.
    if (receipt.qtyReceived > receipt.qtyOrdered) {
      setError(`receipts.${index}.qtyReceived`, {
        message: 'Received quantity cannot be greater than ordered quantity',
      });
      return {
        success: false,
        message: 'Received quantity cannot be greater than ordered quantity',
      };
    }
  
    // Run both asynchronous operations concurrently.
    const [result, poStatus] = await Promise.all([
      upsertReceipt(receipt),
      updatePOStatus(purchaseOrderId, determinePOStatus(receipts, currentPoStatus)),
    ]);
  
    if (result.success && poStatus.success) {
      resetField(`receipts.${index}`, { defaultValue: result.data });
      update(index, result.data);
      // Set the purchase order status with the resolved value.
      resetField(`poStatus`, { defaultValue: poStatus.data });
      setValue('poStatus', poStatus.data);
    } else {
      console.error("Update failed", result.message);
    }
  
    return {
      success: true,
      message: 'Received quantity updated successfully',
    };
  };
  
  return (
    <div>
      { qtyOrdered === qtyReceived ? (
          <button
            type="button"
            onClick={() => markUnreceived(index)}                                  
            className="mr-auto pl-2 pt-2 text-sm font-medium text-blue-500"
          >
            Mark Unreceived
          </button>
        ):(
          <PopoverInput
            className="w-60 flex items-center space-x-4 border-0 bg-gray-200 text-sm text-gray-900 focus:ring-0"
            name={`receipts.${index}.qtyReceived` as const}
            labelText="Received:"
            onSave={() => markReceived(index)}
            triggerContent="Mark Received"
            isEditMode={true}
          >
            <div className="flex mb-4">
              <p className="w-24 font-medium">Ordered:</p>
              <p>{qtyOrdered}</p>
            </div>
          </PopoverInput> 
         )
      }
    </div>
    
  );
};

const SaveButton = ({
  index,
  setEditIndex,
  setAddIndex,
}: {
  index: number;
  setEditIndex: (index: number | null) => void;
  setAddIndex: (value: boolean) => void;
}) => {
  const { getValues, setValue, resetField } =
    useFormContext<PurchaseOrderFormValues>();
  const { update } = useFieldArrayContext<PurchaseOrderFormValues>();

  async function handleSave(index: number) {
    try {
      // Destructure current values from the form
      const {
        id,
        receipts,
        taxBy,
        poStatus,
        // add other fields if needed
      } = getValues();

      const receipt = receipts[index];

      // Run asynchronous updates concurrently
      const [updatedPoStatus, updatedTaxByResponse, updatedReceiptResponse] =
        await Promise.all([
          updatePOStatus(id, determinePOStatus(receipts, poStatus)),
          upsertTaxBy(id, taxBy.value as TaxBy),
          upsertReceipt(receipt),
        ]);

      // Ensure all operations succeeded
      if (
        updatedPoStatus?.success &&
        updatedTaxByResponse?.success &&
        updatedReceiptResponse?.success
      ) {
        toast.success("Item updated successfully");
        console.log(
          "Item successfully added/updated:",
          updatedReceiptResponse.message
        );

        resetField(`receipts.${index}`, { defaultValue: updatedReceiptResponse.data });
        resetField(`taxBy`, { defaultValue: updatedTaxByResponse.taxBy });
        resetField(`poStatus`, { defaultValue: updatedPoStatus.data });

        // Update the receipt in the field array and form state
        update(index, updatedReceiptResponse.data);
        setValue("taxBy", updatedTaxByResponse.taxBy);
        setValue("poStatus", updatedPoStatus.data);

        setEditIndex(null);
        setAddIndex(false);
      } else {
        console.error(
          "Operation failed:",
          updatedReceiptResponse?.message
        );
        alert("Failed to add/update item. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error occurred:", error);
      alert("An unexpected error occurred. Please contact support.");
    }
  }

  return (
    <button
      type="button"
      onClick={() => handleSave(index)}
      className="mr-4 text-sm font-medium text-blue-500"
    >
      Save
    </button>
  );
};

const DeleteButton = ({ 
  index,
  setAddIndex
}: { 
  index: number 
  setAddIndex: (value: boolean) => void;
}) => {
  const { getValues } = useFormContext<PurchaseOrderFormValues>();
  const { remove } = useFieldArrayContext<PurchaseOrderFormValues>();
  const handleDelete = async (index: number) => {
    
    const receiptId = getValues(`receipts.${index}.id`);

    try {
      await deleteItem(receiptId);
      remove(index);
      setAddIndex(false);
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={() => handleDelete(index)}
      className="text-sm font-medium text-red-500"
    >
      <TrashIcon className="w-5" />
    </button>
  )
};

const CancelEditButton = ({ 
  index,
  addIndex,
  setAddIndex,
  setEditIndex
}: { 
  index: number;
  addIndex: boolean;
  setAddIndex: (value: boolean) => void;
  setEditIndex: (index: number | null) => void;
}) => {
  const { resetField } = useFormContext<PurchaseOrderFormValues>();
  const { remove } = useFieldArrayContext<PurchaseOrderFormValues>();
  const handleCancelEdit = (index: number) => {
    setEditIndex(null);
    resetField(`receipts.${index}`);
    resetField(`taxBy`);
  };
  return(
    <button
    type="button"
    onClick={() => {
      if (addIndex) {
        remove(index);
        setAddIndex(false);
      } else {
        handleCancelEdit(index);
      }
    }}
    className="text-sm font-medium text-red-500"
  >
    Cancel
  </button>
  )
};

const AddInventoryButton = ({
  purchaseOrder,
  addIndex,
  setAddIndex,
  setEditIndex,
}: {
  purchaseOrder: PurchaseOrderFormValues;
  addIndex: boolean;
  setAddIndex: (value: boolean) => void;
  setEditIndex: (index: number) => void;
}) => {
  const { watch } = useFormContext();

  const poStatus = watch("poStatus");

  const { append, fields } = useFieldArrayContext<PurchaseOrderFormValues>();
  
  const handleAdd = () => {
    if (!addIndex) {
      append({
        id: "",
        date: new Date(),
        purchaseOrderId: purchaseOrder.id,
        qtyOrdered: 0,
        qtyReceived: 0,
        unitCostDollar: 0,
        unitCostVES: 0,
        description: '',
        invoice: purchaseOrder.invoice,
        tax1: purchaseOrder.tax1,
        tax2: purchaseOrder.tax2,
        vendor: purchaseOrder.vendor,
        item: null,
      });
      setAddIndex(true);
      setEditIndex(fields.length);
    }
  };

  if (poStatus !== 'Requisition') return null;

  return (
    <div className="flex w-full rounded-md bg-gray-50 p-4 text-blue-500 text-sm font-medium">
      <button
        type="button"
        className="flex items-center gap-2"
        onClick={handleAdd}
      >
        <PlusIcon className="w-5" />
        <p>ADD INVENTORY</p>
      </button>
    </div>
  );
};

const LineTotal = ({ index }: { index: number }) => {
  const {control } = useFormContext<PurchaseOrderFormValues>();
  const formValues = useWatch({
    name: "receipts", // Watch the 'itemsFields' array
    control,
  });

  if (index < 0 || index >= formValues.length) {
    return null; // Handle out-of-bound index gracefully
  }

  const lineTotal = (formValues[index].qtyOrdered || 0) * (formValues[index].unitCostDollar || 0);
  
  return (
    <div className="flex flex-col">
      <label htmlFor="lineTotal" className="text-sm mb-6">Total:</label>
      <p id="lineTotal" className="text-sm">{formatCurrency(lineTotal, 'USD')}</p>
    </div>
  );
};

const Total = () => {
  const { control, getValues } = useFormContext<PurchaseOrderFormValues>();
  const purchaseOrderId = getValues("id");

  // Watch form values
  const receipts = useWatch({ name: "receipts", control });
  const tax1 = useWatch({ name: "tax1", control }) || 0;
  const tax2 = useWatch({ name: "tax2", control }) || 0;
  const taxBy = getValues('taxBy');
  const freight = useWatch({ name: "freight", control }) || 0;

  const subtotal = calculateSubtotal(receipts);

  // Helper to calculate tax based on the taxBy field
  const calculateTax = () => {
    switch (taxBy.value) {
      case "None":
        return 0;
      case "One":
        return subtotal * (tax1 / 100);
      case "Two":
        return subtotal * (tax2 / 100);
      case "Both":
      default:
        return subtotal * ((tax1 + tax2) / 100);
    }
  };

  const taxAmount = calculateTax();
  const total = subtotal + taxAmount + freight;

  // Generic tax update handler
  const handleTaxUpdate = async (tax: number, field: "tax1" | "tax2") => {
    return await upsertTax({
      tax: tax,
      taxField: field,
      workOrderId: purchaseOrderId,
    });
  };

  // Generic tax update handler
  const handleFreightUpdate = async (freight: number) => {
    return await upsertFreight(purchaseOrderId, freight);
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
          {formatCurrency(subtotal, "USD")}
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
          {(taxBy.value === "One" || taxBy.value === "Both")
            ? formatCurrency(subtotal * (tax1 / 100), "USD")
            : formatCurrency(0, "USD")}
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
        <p
          id="tax-2"
          className="text-sm flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {(taxBy.value === "Two" || taxBy.value === "Both")
            ? formatCurrency(subtotal * (tax2 / 100), "USD")
            : formatCurrency(0, "USD")}
        </p>
      </div>

      {/* Freight */}
      <div className="flex items-center">
        <label htmlFor="freight" className="w-16 font-medium">
          Freight:
        </label>
        <div className="flex w-12" />
        <div className="flex w-full justify-end border-0 bg-white px-0 py-0 text-sm leading-5 text-gray-900">
          <PopoverInput
            name={`freight` as const}
            labelText="Freight"
            onSave={(freight) => handleFreightUpdate(freight)}
            isEditMode={true}
          />
        </div>
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
          {formatCurrency(total, "USD")}
        </p>
      </div>
    </div>
  );
};



