import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { notFound } from 'next/navigation';
import { fetchItemById, fetchReceiptById } from '@/app/lib/data';
import IssuancesForm from '@/app/ui/forms/issuances-form';
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
            label: 'New Issuance',
            href: `/dashboard/inventory/${id}/issuance/create`,
            active: true,
          },
        ]}
      />
      <IssuancesForm
        inventoryId = {id}
        isEditMode = {true}
      />

    </main>
  );
}