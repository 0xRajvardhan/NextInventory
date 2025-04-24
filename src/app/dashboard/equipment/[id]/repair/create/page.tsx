import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import Form from '@/app/ui/forms/repair-form';
import { notFound } from 'next/navigation';
import { fetchEquipmentById } from '@/app/lib/data';

export default async function Page({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;

  const [
    equipment
  ] = await Promise.all([
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
            href: `/dashboard/equipment/${equipment.id}`,
            active: false,
          },
          {
            label: "New Repair Request",
            href: `/dashboard/equipment/${equipment.id}/repair/create`,
            active: true,
          },
        ]}
      />
      <Form 
        equipmentId = {id}
        equipment={
          {
            value: equipment.id,
            label: equipment.unitNumber
          }
        } 
        isEditMode={true}
      />
    </main>
  );
}