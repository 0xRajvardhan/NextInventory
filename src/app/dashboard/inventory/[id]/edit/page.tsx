import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { notFound } from 'next/navigation';
import { fetchItemById } from '@/app/lib/data';
import InventoryForm from '@/app/ui/forms/inventory-form';


export default async function Page({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;

  const [ item ] = await Promise.all([
    fetchItemById(id),
  ]);

  if (!item) {
    notFound();
  }
  
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
            label: 'Edit',
            href: '#',
            active: true,
          }
        ]}
      />

      <InventoryForm
        item = {item}
        isEditMode = {true}
      />
    </main>
  );
}