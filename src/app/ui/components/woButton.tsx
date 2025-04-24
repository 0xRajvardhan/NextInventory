'use client';

import React from 'react';
import { Button } from '@/app/ui/components/button';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useFormContext } from "react-hook-form";
import { StatusType, WorkOrderStatus } from '@prisma/client';
import { updatePOStatus, closePurchaseOrder, upsertWOStatus, closeWorkOrder } from '@/app/lib/actions';
import { WorkOrderFormValues } from '@/app/lib/definitions';
import { get } from 'http';

const WorkOrderButton = () => {
  const { control, watch, getValues, setValue, reset } = useFormContext<WorkOrderFormValues>();

  // Watch the current `poStatus` value from the form state
  const workOrderId = getValues('id');
  const activeButton = watch('woStatus') as WorkOrderStatus;
  const handleSave = async (buttonName: WorkOrderStatus) => {
    try {

      // Perform the API call (mocked here for simplicity)
      const response = await upsertWOStatus(workOrderId, buttonName);
      
      // const response = { success: false }; // Simulate success for now
      if (response.success) {
        // Update the form state directly
        setValue('woStatus', buttonName);
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

      const data = getValues();
      const response = await closeWorkOrder(data);

      if (response.success) {
        upsertWOStatus(data.id, 'Complete');

        toast.success('Purchase order status updated successfully!');
      } else {
        toast.error('There was an error updating the purchase order status.');
      }
    } catch (error) {
      toast.error('There was an error updating the purchase order status.');
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        type="button"
        onClick={() => handleSave('Open')}
        className={clsx({
          'bg-blue-500': activeButton === 'Open',
          'bg-gray-200': activeButton !== 'Open',
        })}
      >
        Open
      </Button>
      <Button
        type="button"
        onClick={() => handleSave('In_Progress')}
        className={clsx({
          'bg-orange-500 text-white': activeButton === 'In_Progress',
          'bg-gray-300': activeButton !== 'In_Progress',
        })}
      >
          In Progress
      </Button>
      <Button
        type="button"
        onClick={() => handleSave('On_Hold')}
        className={clsx({
          'bg-red-500 text-white': activeButton === 'On_Hold',
          'bg-gray-300': activeButton !== 'On_Hold',
        })}
      >
          On Hold
      </Button>
      <Button
        type="button"
        onClick={hanldeClose}
        className={clsx({
          'bg-green-500': activeButton === 'Complete',
          'bg-gray-300': activeButton !== 'Complete',
        })}
      >
        Complete
      </Button>
    </div>
  );
};

export default WorkOrderButton;
