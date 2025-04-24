import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { notFound } from 'next/navigation';
import { fetchIssuanceById, fetchItemById, fetchReceiptById } from '@/app/lib/data';
import IssuancesForm from '@/app/ui/forms/issuances-form';
import { fetchVendors } from '@/app/lib/data';

export default async function Page({
  params
}: {
  params: { id: string, issuanceId: string }
}) {
  const id = params.id;
  const issuanceId = params.issuanceId;
  
  const [ item, issuance] = await Promise.all([
    fetchItemById(id),
    fetchIssuanceById(issuanceId)
  ])

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Inventory', href: '/dashboard/inventory' },
          {
            label: `Issuance: ${item.partNumber} (02/12/2021)`,
            href: `/dashboard/inventory/${id}`,
            active: true,
          },
          // {
          //   label: 'New Issuance',
          //   href: `/dashboard/inventory/${id}/issuance/create`,
          //   active: true,
          // },
        ]}
      />
      <IssuancesForm
        inventoryId = {id}
        issuance={issuance}
        isEditMode = {false}
      />

    </main>
  );
}