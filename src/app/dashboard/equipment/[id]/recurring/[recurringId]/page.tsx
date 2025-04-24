import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import RecurringTaskForm from '@/app/ui/forms/recurringTask-form';
import { notFound } from 'next/navigation';
import { fetchEquipmentById, fetchItems, fetchRecurringTaskById } from '@/app/lib/data';

export default async function Page({
  params
}: {
  params: { 
    id: string;
    recurringId: string;
  }
}) {
  const id = params.id;
  const recurringId = params.recurringId;

  const [ equipment, recurringTask ] = await Promise.all([
    fetchEquipmentById(id),
    fetchRecurringTaskById(recurringId)
  ]);

  if (!recurringTask) {
    notFound();
  }

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
            label: recurringTask.task?.label ?? "",
            href: `/dashboard/equipment/${id}/pm/create`,
            active: true,
          },
        ]}
      />
      <RecurringTaskForm 
        id = {id} 
        recurringTask={recurringTask}
        equipment={equipment} 
        isEditMode = {false}
      />
    </main>
  );
}