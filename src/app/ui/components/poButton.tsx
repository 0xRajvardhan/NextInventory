'use client';

import React from 'react';
import { Button } from '@/app/ui/components/button';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useFormContext } from "react-hook-form";
import { StatusType } from '@prisma/client';
import { updatePOStatus, closePurchaseOrder } from '@/app/lib/actions';

const App = () => {
  const { control, watch, getValues, setValue, reset } = useFormContext();

  // Watch the current `poStatus` value from the form state
  const purchaseOrderId = control._defaultValues['id'];
  const activeButton = watch('poStatus') as StatusType;

  const handleSave = async (buttonName: StatusType) => {
    try {

      // Perform the API call (mocked here for simplicity)
      const response = await updatePOStatus(purchaseOrderId, buttonName);
      
      // const response = { success: false }; // Simulate success for now
      if (response.success) {
        // Update the form state directly
        setValue('poStatus', buttonName);
        toast.success('Purchase order status updated successfully!');
      } else {
        toast.error('There was an error updating the purchase order status.');
      }
    } catch (error) {
      toast.error('There was an error updating the purchase order status.');
    }
  };

  const hanldeClose = async () => {
    try {
      console.log('here')
      const receipts = getValues('receipts');
      const currentValues = getValues();
      console.log(receipts);

      const response = await closePurchaseOrder(receipts);

      if (response.success) {
        updatePOStatus(purchaseOrderId, 'Close');

        // Reset form and set the updated values
        reset({
          ...currentValues,
          // You can reset the form and set specific fields like `poStatus` and `receipts`
          poStatus: 'Close',
          receipts: receipts.map((receipt: any) => ({
            ...receipt,
            qtyReceived: receipt.qtyOrdered, // Update qtyReceived to qtyOrdered
          })),
        });
        toast.success('Purchase order status updated successfully!');
      } else {
        toast.error('There was an error updating the purchase order status.');
      }
    } catch (error) {
      toast.error('There was an error updating the purchase order status.');
    }
  };

  // Disable buttons if status is Received or Received_Partial
  const isStatusDisabled = activeButton === 'Received' || activeButton === 'Received_Partial' || activeButton === 'Close';

  return (
    <div className="flex gap-4">
      <Button
        type="button"
        onClick={() => handleSave('Requisition')}
        className={clsx({
          'bg-blue-500': activeButton === 'Requisition',
          'bg-gray-200': activeButton !== 'Requisition',
          'cursor-not-allowed': isStatusDisabled,  // Disable the button when status is Received or Received_Partial
          'hover:bg-blue-500': !isStatusDisabled, 
        })}
        disabled={isStatusDisabled}
      >
        Requisition
      </Button>
      <Button
        type="button"
        onClick={() => handleSave('Ordered')}
        className={clsx({
          'bg-orange-500 text-white': activeButton === 'Ordered',
          'bg-gray-300': activeButton !== 'Ordered',
          'cursor-not-allowed': isStatusDisabled,  // Disable the button when status is Received or Received_Partial
          'hover:bg-blue-500': isStatusDisabled, 
        })}
        disabled={isStatusDisabled}
      >
          Ordered
      </Button>
      {(activeButton === 'Received_Partial' || activeButton === 'Received') && (
        <Button
          type="button"
          className={clsx(
            'text-white', // Ensure text is readable
            {
              'bg-red-500': activeButton === 'Received_Partial', // Red for Partially Received
              'bg-green-500': activeButton === 'Received', // Green for Received
            }
          )}
        >
          {activeButton === 'Received_Partial' ? 'Received - Partial' : 'Received'}
        </Button>
      )}
      <Button
        type="button"
        onClick={hanldeClose}
        className={clsx({
          'bg-blue-500': activeButton === 'Close',
          'bg-gray-300': activeButton !== 'Close',
        })}
        // disabled={isStatusDisabled}
      >
        Close
      </Button>
    </div>
  );
};

export default App;
