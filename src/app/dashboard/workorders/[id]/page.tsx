import WorkOrdersItemsForm from "@/app/ui/forms/workOrdersItems-form";
import Breadcrumbs from "@/app/ui/components/breadcrumbs";
import {
  fetchWorkOrderById,
} from "@/app/lib/data";


export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const [ workOrder] =
      await Promise.all([
        fetchWorkOrderById(id),
      ]);

    if (!workOrder) {
      // Handle the case where purchase order is not found
      return (
        <main>
          <Breadcrumbs
            breadcrumbs={[
              { label: "Work Orders", href: "/dashboard/workorders" },
              {
                label: "Not Found",
                href: "/dashboard/workorders",
                active: true,
              },
            ]}
          />
          <p>Work order not found.</p>
        </main>
      );
    }

    return (
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: "Work Orders", href: "/dashboard/workorders" },
            {
              label: workOrder.woNumber.toString() || "",
              href: "/dashboard/purchaseorders/create",
              active: true,
            },
          ]}
        />
        <WorkOrdersItemsForm
          workOrder={workOrder}
        />
      </main>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: "Work Orders", href: "/dashboard/workorders" },
            { label: "Error", href: "/dashboard/workorders", active: true },
          ]}
        />
        <p>Error loading work order.</p>
      </main>
    );
  }
}
