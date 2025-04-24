import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import Receipts from '@/app/ui/tables/receipts-table'
import Issuances from '@/app/ui/tables/issuances-table'
import { notFound } from 'next/navigation';
import { fetchItemById } from '@/app/lib/data';
import { GeneralTabs, TabItem } from '@/app/ui/components/tabs';
import { BsFillBoxFill } from "react-icons/bs";
import { AiFillFileAdd } from "react-icons/ai";
import { BsFillFileEarmarkMinusFill } from "react-icons/bs";

export default async function Page({
  params,
  searchParams
}: {
  params: { id: string },
  searchParams?: {
    query?: string;
    page?: string;
    tab?: string;
  }
}) {
  const id = params.id;

  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const [ item ] = await Promise.all([
    fetchItemById(id),
  ]);

  if (!item) {
    notFound();
  }

  // Find the inventory that matches the provided inventoryId,
  // otherwise default to the first one in the list.
  const selectedInventory = id
    ? item.inventory.find(inv => inv.id === id)
    : item.inventory[0];

  if (!selectedInventory) {
    notFound();
  }

  const details = [
    { label: 'Unit Cost $', value: selectedInventory.unitCostDollar },
    { label: 'Unit Cost VES', value: selectedInventory.unitCostVES },
    { label: 'Location', value: selectedInventory.location },
    { label: 'Quantity On Hand', value: selectedInventory.quantity },
    { label: 'Reorder Point', value: selectedInventory.lowStockLevel },
    { label: 'Reorder Quantity', value: selectedInventory.reorderQuantity },
  ];
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Inventory', href: '/dashboard/inventory' },
          {
            label: item.partNumber,
            href: '/dashboard/inventory/create',
            active: true,
          },
        ]}
      />
      <div className="w-full">
        <div className="w-1/2 rounded-md bg-gray-50 p-6">
          <InformationRow label="Warehouse" value={selectedInventory.warehouse.label} />
          <InformationRow label="Name" value={item?.name} />
          <InformationRow label="Manufacturers" value={[...new Set(item?.vendors.map((manufacturer) => manufacturer.manufacturer?.label))].join(", ")} />
          <InformationRow label="Category" value={item?.category?.label} />
          <InformationRow label="Type" value={item?.unitType?.label} />
          <InformationRow label="Vendors" value={[...new Set(item?.vendors.map((vendor) => vendor.vendor?.label))].join(", ")} />
        </div>
      </div>
      <GeneralTabs>
        <TabItem title="Details" icon={<BsFillBoxFill className='w-5 h-5'/>}>
            <div className="w-1/2 rounded-md bg-gray-50 p-6 mt-6">
              {details.map((detail, index) => (
                <DetailRow key={index} label={detail.label} value={detail.value} />
              ))}
            </div>
        </TabItem>
        <TabItem title="Receipts" icon={<AiFillFileAdd className="w-5 h-5" />}>
          <Receipts 
            inventoryId={id}
            qtyOnHand={selectedInventory.quantity}
            query={query}
            currentPage={currentPage}
          />
        </TabItem>
        <TabItem title="Issuances" icon={<BsFillFileEarmarkMinusFill className="w-5 h-5" />}>
          <Issuances
            inventoryId={id}
            qtyOnHand={selectedInventory.quantity}
            query={query}
            currentPage={currentPage}
          />
        </TabItem>
      </GeneralTabs>
    </main>
  );
}

function InformationRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value.trim() === "") {
    return null;
  }

  return (
    <div className="mb-4 flex items-center">
      <div className="flex w-40 justify-end items-center mr-6">
        <label htmlFor={label.toLowerCase()} className="text-sm font-medium">
          {label}
        </label>
      </div>
      <div className="w-full">{value}</div>
    </div>
  );
}


function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex mb-4 items-center">
      <div className="flex w-60 items-center justify-end mr-6">
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div className="w-full">
        <p>{value}</p>
      </div>
    </div>
  );
}