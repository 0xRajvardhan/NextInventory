import Pagination from '@/app/ui/components/pagination';
import Search from '@/app/ui/search';
import { fetchFilteredReceipts, fetchFilteredReceiptsPages } from '@/app/lib/data';
import ClickableTableRow from '../components/reusableTabComponent';
import { formatCurrency } from '@/app/lib/utils';

export default async function ReceiptsTable({
  inventoryId,
  qtyOnHand,
  query,
  currentPage
}: {
  inventoryId: string;
  qtyOnHand: number;
  query: string;
  currentPage: number;
}) {

  const receipts = await fetchFilteredReceipts(inventoryId, query, currentPage);
  const totalPages = await fetchFilteredReceiptsPages(inventoryId, query);
  
  return (
    <div className="w-full">
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-4">
        <div
          className={`flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600`}
        >
          <span className="hidden md:block">Quantity On Hand: {qtyOnHand}</span>
        </div>
        <Search placeholder="Search sales order..." />
        <InventoryButton
          label='New Receipt'
          href={`/dashboard/inventory/${inventoryId}/receipt/create`}
        />
      </div>
       {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
        <div className="mt-6 shadow-mdflow-root">
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Received
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Remaining
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Unit Cost
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3">
                    PO
                  </th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => {
                  return (
                    <ClickableTableRow
                      key={receipt.id}
                      // className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      // onClick={() => redirectToReceipt(receipt.id)}
                      href={`/dashboard/inventory/${inventoryId}/receipt/${receipt.id}`}
                    >
                      <td className="px-6 py-4">{receipt.date?.toDateString()}</td>
                      <td className="px-6 py-4">{receipt.description}</td>
                      <td className="px-6 py-4">{receipt.qtyReceived}</td>
                      <td className="px-6 py-4">{receipt.qtyRemaining}</td>
                      <td className="px-6 py-4">
                        {receipt.unitCostDollar !== null
                          ? formatCurrency(receipt.unitCostDollar, 'USD')
                          : null}
                      </td>
                      <td className="px-6 py-4">{receipt.vendor?.name}</td>
                      <td className="px-6 py-4">{receipt.purchaseOrder?.poNumber}</td>
    
                    </ClickableTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}

import { FC } from "react";
import Link from "next/link"; // For Next.js routing

interface InventoryButtonProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
  className?: string;
}

const InventoryButton: FC<InventoryButtonProps> = ({ label, href, icon, className }) => {
  return (
    <Link href={href}>
      <button
        className={`flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 ${className}`}
        style={{ backgroundImage: "none" }} // Remove background arrow
      >
        <span className="hidden md:block">{label}</span>
        {icon && <span className="h-5 md:ml-4">{icon}</span>}
      </button>
    </Link>
  );
};