'use client'

import POButton from "@/app/ui/components/poButton";
import ItemsTable from "../tables/items-table";
import { StatusType } from "@prisma/client";
import { formatLabel } from "@/app/lib/utils";
import { Item } from "@/app/lib/zod";
import { PurchaseOrderFormSchema, PurchaseOrderFormValues } from "@/app/lib/definitions";
import { useForm, FormProvider } from "react-hook-form";
import ActionButtons from "../components/RHF/purchaseOrderActionsButtons";
import { zodResolver } from "@hookform/resolvers/zod";

export default function PurchaseOrderItemsForm({
  purchaseOrder,
}: {
  purchaseOrder: PurchaseOrderFormValues;
}) {

  const methods = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(PurchaseOrderFormSchema),
    defaultValues: purchaseOrder
  }); 

  return (
    <FormProvider {...methods}>
      <div className="flex justify-between items-center text-sm">
        <div className="flex flex-col gap-2">
          <div className="flex">
            <p className="w-32 font-medium">Date Opened:</p>
            <p>{purchaseOrder.dateOpened.toDateString()}</p>
          </div>
          {purchaseOrder.dateRequired && (
            <div className="flex">
              <p className="w-32 font-medium">Date Required:</p>
              <p>{purchaseOrder.dateRequired.toDateString()}</p>
            </div>
          )}
          {purchaseOrder.vendor && (
            <div className="flex">
              <p className="w-32 font-medium">Vendor:</p>
              <p>{purchaseOrder.vendor?.label}</p>
            </div>
          )}

        </div>
        <ActionButtons
          id={purchaseOrder.id}
        />
        <div className="flex gap-4">
          <POButton/>
        </div>
      </div>
      <ItemsTable
        purchaseOrder={purchaseOrder}
      />
      <div className="flex flex-col gap-2 text-sm mt-4">
        <div className="flex">
          <p className="w-32 font-medium">Ship To:</p>
          <p>{purchaseOrder.warehouse?.label}</p>
        </div>
        {purchaseOrder.buyer && (
          <div className="flex">
            <p className="w-32 font-medium">Buyer:</p>
            <p>{purchaseOrder.buyer?.label}</p>
          </div>
        )}
        {purchaseOrder.shipVia && (
          <div className="flex">
            <p className="w-32 font-medium">Ship Via:</p>
            <p>{formatLabel(purchaseOrder.shipVia.label as StatusType)}</p>
          </div>
        )}
        {purchaseOrder.workOrder && (
          <div className="flex">
            <p className="w-32 font-medium">Work Order:</p>
            <p>{purchaseOrder.workOrder}</p>
          </div>
        )}
        {purchaseOrder.notes && (
          <div className="flex">
            <p className="w-32 font-medium">Notes:</p>
            <p>{purchaseOrder.notes}</p>
          </div>
        )}
      </div>
    </FormProvider>
  );
}
