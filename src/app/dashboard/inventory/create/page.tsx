import Breadcrumbs from "@/app/ui/components/breadcrumbs";
import InventoryForm from "@/app/ui/forms/inventory-form";

export default async function Page() {

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Inventory", href: "/dashboard/inventory" },
          {
            label: "Create Product",
            href: "/dashboard/inventory/create",
            active: true,
          },
        ]}
      />
      <InventoryForm
        isEditMode ={true}
      />
    </main>
  );
}
