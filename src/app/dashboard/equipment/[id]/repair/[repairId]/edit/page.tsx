import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import RepairForm from '@/app/ui/forms/repair-form';
import { notFound } from 'next/navigation';
import { fetchEquipment, fetchEquipmentById, fetchMetersByEquipmentId, fetchRepairTaskById } from '@/app/lib/data';

export default async function Page({
  params
}: {
  params: { 
    id: string,
    repairId: string 
  }
}) {
  const equipmentId = params.id;
  const repairId = params.repairId;

  const [
    repairTask
  ] = await Promise.all([
    fetchRepairTaskById(repairId)
  ]);

  if (!repairTask) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Equipment', href: '/dashboard/equipment' },
          {
            label: repairTask.equipment.label,
            href: `/dashboard/equipment/${repairTask.equipment.value}`,
            active: true,
          },
          {
            label: repairTask.task.label,
            href:  `/dashboard/equipment/${repairTask.equipment.value}/${repairTask.id}`,
            active: true,
          },
        ]}
      />
      <RepairForm 
        equipmentId={equipmentId}
        repairTask={repairTask}
        isEditMode={true}
      />
    </main>
  );
}