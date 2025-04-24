import EquipmentForm from "@/app/ui/forms/equipment-form";
import Breadcrumbs from "@/app/ui/components/breadcrumbs";

export default async function Page() {

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Equipment", href: "/dashboard/equipment" },
          {
            label: "Create Equipment",
            href: "/dashboard/equipment/create",
            active: true,
          },
        ]}
      />
      <EquipmentForm
        isEditMode={true}
      />
    </main>
  );
}
