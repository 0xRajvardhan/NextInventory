import { fetchFilteredPurchaseOrders } from '@/app/lib/data';
import { formatDateToLocal } from '@/app/lib/utils';
import Dropdown from "@/app/ui/components/flowbiteDropdown";
import { PurchaseOrder, Warehouse, Vendor } from '@/app/lib/zod';

interface PO extends PurchaseOrder {
  vendor: Pick<Vendor, 'name'> | null;
  warehouse: Pick<Warehouse, 'name'>;
}

export default async function PurchaseOrdersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  const purchaseOrders = await fetchFilteredPurchaseOrders(query, currentPage)

  return (
    <div className="mt-6 shadow-mdflow-root">
      <div className="relative shadow-md sm:rounded-lg">
          <table  className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Created
                </th>
                <th scope="col" className="px-6 py-3">
                  Required
                </th>
                <th scope="col" className="px-6 py-3">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-3">
                  Vendor
                </th>
                <th scope="col" className="px-6 py-3">
                  Warehouse
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              purchaseOrders.map((purchaseOrder: PO) => (
                <tr
                  key={purchaseOrder.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {purchaseOrder.poNumber}
                  </th>
                  <td className="px-6 py-4">
                    {formatDateToLocal(new Date(purchaseOrder.dateOpened).toISOString())}
                  </td>
                  <td className="px-6 py-4">
                    {/* {formatDateToLocal(new Date(purchaseOrder.dateRequired?).toISOString())} */}
                  </td>
                  <td className="px-6 py-4">
                    {purchaseOrder.invoice}
                  </td>
                  <td className="px-6 py-4">
                    {purchaseOrder.vendor?.name}
                  </td>
                  <td className="px-6 py-4">
                    {purchaseOrder.warehouse.name}
                  </td>
                  <td className="px-6 py-4">
                    {purchaseOrder.poStatus}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex relative overflow-visible justify-end">
                      <Dropdown id={purchaseOrder.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
      </div>
    </div>
  );
}
