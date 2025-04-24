import EmployeesForm from "@/app/ui/forms/employees-form";
import Breadcrumbs from "@/app/ui/components/breadcrumbs";

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Employees", href: "/dashboard/employees" },
          {
            label: "Create Employee",
            href: "/dashboard/employees/create",
            active: true,
          },
        ]}
      />
      <EmployeesForm 
        isEditMode = {true}
      />
    </main>
  );
}
