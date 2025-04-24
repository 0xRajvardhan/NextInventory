import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import RecurringTaskForm from '@/app/ui/forms/recurringTask-form';
import { notFound } from 'next/navigation';
import { fetchEquipmentById, fetchItems } from '@/app/lib/data';

export default async function Page({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;

  const [ equipment ] = await Promise.all([
    fetchEquipmentById(id),
  ]);

  if (!equipment) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Equipment', href: '/dashboard/equipment' },
          {
            label: equipment.unitNumber,
            href: `/dashboard/equipment/${id}`,
            active: false,
          },
          {
            label: "New PM Task",
            href: `/dashboard/equipment/${id}/pm/create`,
            active: true,
          },
        ]}
      />
      <RecurringTaskForm 
        id = {id} 
        equipment={equipment} 
        isEditMode = {true}
      />
    </main>
  );
}