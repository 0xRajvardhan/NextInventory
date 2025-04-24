import Dropdown from "@/app/ui/components/flowbiteDropdown";
import { fetchFilteredWorkOrders } from "@/app/lib/data";

export default async function WorkOrdersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  const workOrders = await fetchFilteredWorkOrders(query, currentPage);
  return (
    <div className="mt-6 shadow-mdflow-root">
      <div className="relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Number
              </th>
              <th scope="col" className="px-6 py-3">
                Equipment
              </th>
              <th scope="col" className="px-6 py-3">
                Assignees
              </th>
              <th scope="col" className="px-6 py-3">
                Scheduled
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Progress
              </th>
              <th scope="col" className="relative py-3 pl-6 pr-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              workOrders.map((workOrder) => (
                <tr
                  key={workOrder.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {workOrder.woNumber}
                  </th>
                  <td className="px-6 py-4">{workOrder.equipment.unitNumber}</td>
                  <td className="px-6 py-4">{workOrder.employee?.firstName} {workOrder.employee?.lastName}</td>
                  <td className="px-6 py-4">
                    {new Date(workOrder.scheduled).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{workOrder.woStatus}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 flex justify-end">
                    <Dropdown id={workOrder.id} />
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
