import Pagination from '@/app/ui/components/pagination';
import Search from '@/app/ui/search';
import { fetchFilteredIssuances, fetchFilteredIssuancesPages } from '@/app/lib/data';
import ClickableTableRow from '../components/reusableTabComponent';
import { formatCurrency } from '@/app/lib/utils';

export default async function IssuancesTable({
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
  
  const issuances = await fetchFilteredIssuances(inventoryId, query, currentPage)
  const totalPages = await fetchFilteredIssuancesPages(inventoryId, query);
  
  return (
    <div className="w-full">
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-4">
        <div
          className={`flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600`}
        >
          <span className="hidden md:block">Quantity On Hand: {qtyOnHand}</span>
        </div>
        <Search placeholder="Search issuances..." />
        <InventoryButton
          label='New Issuance'
          href={`/dashboard/inventory/${inventoryId}/issuance/create`}
        />
        {/* <CreateWorkOrder /> */}
      </div>
       {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
       {/* <ItemIssuancesTable inventoryId={inventoryId} query={query} currentPage={currentPage} /> */}
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
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Unit Cost $
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Unit Cost VES
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Equipment
                  </th>
                  <th scope="col" className="px-6 py-3">
                    WO
                  </th>
                </tr>
              </thead>
              <tbody>
                {issuances.map((issuance) => {
                  return (
                    <ClickableTableRow
                      key={issuance.id}
                      href={`/dashboard/inventory/${inventoryId}/issuance/${issuance.id}`}
                    >
                      <td className="px-6 py-4">{issuance.date.toDateString()}</td>
                      <td className="px-6 py-4">{issuance.description}</td>
                      <td className="px-6 py-4">{issuance.qtyIssued}</td>
                      <td className="px-6 py-4">{formatCurrency(issuance.receipt.unitCostDollar,'USD')}</td>
                      <td className="px-6 py-4">{formatCurrency(issuance.receipt.unitCostVES,'VES')}</td>
                      <td className="px-6 py-4">{issuance.equipment?.unitNumber}</td>
                      <td className="px-6 py-4">{issuance.WorkOrderTask?.workOrder.woNumber}</td>
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