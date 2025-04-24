import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import EmployeesForm from '@/app/ui/forms/employees-form';
import { fetchEmployeeById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;
  
  const [ employee ] = await Promise.all([
    fetchEmployeeById(id),

  ]);

  if (!employee) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Employees', href: '/dashboard/employees' },
          {
            label: `${employee.firstName} ${employee.lastName}`,
            href: `/dashboard/vendors/${employee.id}`
          },
          {
            label: 'Edit',
            href: `/dashboard/vendors/${employee.id}/edit`,
            active: true,
          },
        ]}
      />
      <EmployeesForm
        employee = {employee}
        isEditMode = {true}
      />
    </main>
  );
}