import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { notFound } from 'next/navigation';
import { fetchItemById } from '@/app/lib/data';
import ReceiptsForm from '@/app/ui/forms/receipts-form';
import { fetchVendors } from '@/app/lib/data';

export default async function Page({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;
  
  const [ item ] = await Promise.all([
    fetchItemById(id),
  ])

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Inventory', href: '/dashboard/inventory' },
          {
            label: item.partNumber,
            href: `/dashboard/inventory/${id}`,
            active: false,
          },
          {
            label: 'New Receipt',
            href: `/dashboard/inventory/${id}/receipt/create`,
            active: true,
          },
        ]}
      />
      <ReceiptsForm
        inventoryId={id}
        itemId= {item.id}
        warehouseId={item.inventory[0].warehouse.value}
        isEditMode = {true}
      />

    </main>
  );
}