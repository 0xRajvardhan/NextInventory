import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { notFound } from 'next/navigation';
import { fetchItemById, fetchReceiptById } from '@/app/lib/data';
import ReceiptsForm from '@/app/ui/forms/receipts-form';

export default async function Page({
  params
}: {
  params: { 
    id: string,
    receiptId: string 
  }
}) {
  const inventoryId = params.id;
  const receiptId = params.receiptId;

  const [ receipt ] = await Promise.all([
    fetchReceiptById(receiptId),
  ]);

  if (!receipt) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Inventory', href: '/dashboard/inventory' },
          {
            label: `${receipt.item.label} (${receipt.date?.toDateString()})`,
            href: '/dashboard/inventory/create',
            active: true,
          },
        ]}
      />
      <ReceiptsForm
        inventoryId = {inventoryId}
        receipt = {receipt}
        isEditMode = {false}
      />
    </main>
  );
}