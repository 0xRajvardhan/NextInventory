'use client'

import React, {useState} from 'react';
import NumericInput from './RHF/numericInput';
import { FieldValues, useFormContext } from 'react-hook-form';
import { updateReceived, updatePOStatus } from '@/app/lib/actions';
import { toast } from 'react-toastify';
import { formatLabel } from '@/app/lib/utils';
import { PurchaseOrderItemsFormValues } from '@/app/lib/definitions';

interface DropdownPopupProps {
  index: number; // Add index
  isEditMode: boolean;
}

// Define the type for a receipt
interface Receipt {
  qtyReceived: number;
  qtyOrdered: number;
}


// Helper to determine PO status
const determinePOStatus = (receipts: Receipt[]): 'Received' | 'Received_Partial' | 'Ordered' => {
  const allItemsReceived = receipts.every(receipt => {
    return receipt.qtyReceived === receipt.qtyOrdered;
  });

  const noItemsReceived = receipts.every(receipt => receipt.qtyReceived === 0);

  const anyItemPartiallyReceived = receipts.some(
    receipt => receipt.qtyReceived > 0 && receipt.qtyReceived < receipt.qtyOrdered
  );

  // Handle all cases
  if (allItemsReceived) return 'Received';
  if (anyItemPartiallyReceived || !noItemsReceived) return 'Received_Partial';
  return 'Ordered';
};

// Toast wrapper for backend updates
const performUpdateWithToast = async (operation: Promise<any>, pending: string, success: string, error: string) => {
  return toast.promise(operation, { pending, success, error }, { position: 'top-right', autoClose: 2000 });
};


const DropdownPopup = ({
  index,
  isEditMode,
}: DropdownPopupProps) => {

  const [showPopup, setShowPopup] = useState<number | null>(null);

  const { control, getValues, setError, reset, resetField, watch } = useFormContext<PurchaseOrderItemsFormValues>()

  const purchaseOrderId = getValues('id');
  const receiptId = getValues(`receipts.${index}.id`);

  let qtyOrdered = getValues(`receipts.${index}.qtyOrdered`);
  let qtyReceived = getValues(`receipts.${index}.qtyReceived`);

  const handleMarkReceived = async (index: number) => {
    try {
      const qtyOrdered = getValues(`receipts.${index}.qtyOrdered`);
      const qtyReceived = getValues(`receipts.${index}.qtyReceived`);

      if (qtyReceived > qtyOrdered) {
        setError(`receipts.${index}.qtyReceived`, {
          type: 'server',
          message: 'Received quantity cannot be greater than quantity ordered',
        });
        return;
      }
  
      // First promise: Update Received
      await toast.promise(
        updateReceived(purchaseOrderId, receiptId, qtyReceived),
        {
          pending: 'Updating received quantity...',
          success: 'Received quantity updated successfully!',
          error: 'Failed to update received quantity.',
        },
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      // Determine PO Status based on all items' received quantities
      const poStatus = determinePOStatus(getValues('receipts'));
  
      await toast.promise(
        updatePOStatus(purchaseOrderId, poStatus),
        {
          pending: 'Updating PO status...',
          success: `PO status updated to ${formatLabel(poStatus)}!`,
          error: 'Failed to update PO status.',
        },
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
  
      // Update the UI if both operations are successful
      const currentValues = getValues();
  
      reset({
        ...currentValues,
        poStatus,
        receipts: currentValues.receipts.map(
          (
            field: { qtyReceived: number; qtyOrdered: number; id: string },
            idx: number
          ) => (idx === index ? { ...field, qtyReceived } : field)
        ),
      });
  
      setShowPopup(null);
    } catch (error) {
      // Handle any errors
      toast.error('An error occurred. Please try again.', {
        position: "top-center",
        autoClose: 3000,
      });
      console.error(error);
    }
  };

  const handleMarkUnreceived = async () => {
        try {
          // Assuming you have an `updateReceived` function to update the qtyReceived in the backend
          await updateReceived(purchaseOrderId, receiptId, 0);
    
          const currentValues = getValues();
    
                // Reset the form with updated values
          reset({
            ...currentValues,
            receipts: currentValues.receipts.map(
              (field, idx) => {
                // Ensure qtyReceived is always a number (not null)
                return idx === index ? { ...field, qtyReceived: 0 } : field;
              }
            ),
          });
    
          // Determine PO Status based on all items' received quantities
          const poStatus = determinePOStatus(getValues('receipts'));

          // Reset the form with updated values
          reset({
            ...currentValues,
            poStatus: poStatus,
            receipts: currentValues.receipts.map(
              (field, idx) => {
                // Ensure qtyReceived is always a number (not null)
                return idx === index ? { ...field, qtyReceived: 0 } : field;
              }
            ),
          });
    
        } catch (error) {
          console.error('Error updating received status', error);
          // You might want to show a toast or alert if the operation fails
        }
  };
  

  const handleCancel = () => {
    resetField(`receipts.${index}.qtyReceived`);
    setShowPopup(null);
  };

  return (
    <>
      { qtyOrdered === qtyReceived ? (
        <button
          type="button"
          onClick={handleMarkUnreceived}                                  
          className="mr-auto pl-2 pt-2 text-sm font-medium text-blue-500"
        >
          Mark Unreceived
        </button>
      ):(
        <>
          <button
            type="button"
            onClick={() => setShowPopup(index)}                                  
            className="mr-auto pl-2 pt-2 text-sm font-medium text-blue-500"
          >
            Mark Received
          </button>   
          {showPopup === index && (
            <div className="absolute mt-2 w-64 bg-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-4">
                <div className="flex">
                  <p className="w-24 font-medium">Ordered:</p>
                  <p>{qtyOrdered}</p>
                </div>
                <NumericInput
                  className="flex items-center mt-4"
                  labelText="Received:"
                  labelClassName="w-24 mr-6"
                  name={`receipts.${index}.qtyReceived`}
                  isEditMode={isEditMode}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkReceived(index)}  // Wrap the async function call
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DropdownPopup;
