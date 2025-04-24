import WorkOrdersForm from "@/app/ui/forms/workOrders-form";
import Breadcrumbs from "@/app/ui/components/breadcrumbs";

export default async function Page() {

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Work Orders", href: "/dashboard/workorders" },
          {
            label: "Create Work Order",
            href: "/dashboard/workorders/create",
            active: true,
          },
        ]}
      />
      <WorkOrdersForm
        isEditMode={true}
      />
    </main>
  );
}
