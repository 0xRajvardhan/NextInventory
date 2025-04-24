import Image from "next/image";
import { fetchFilteredEquipmet } from "@/app/lib/data";
import Dropdown from "@/app/ui/components/flowbiteDropdown";

export default async function EquipmentTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const equipment = await fetchFilteredEquipmet(query, currentPage);

  return (
    <div className="mt-6 shadow-mdflow-root">
      <div className="relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Equipment
              </th>
              <th scope="col" className="px-6 py-3">
                Keywords
              </th>
              <th scope="col" className="px-6 py-3">
                Meters
              </th>
              <th scope="col" className="px-6 py-3">
                Tasks
              </th>
              <th scope="col" className="px-6 py-3">
                Inspections
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              equipment.map((equipment) => (
                <tr
                  key={equipment.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div>
                      <div>
                        {equipment.unitNumber} {equipment.description}
                      </div>
                      <div className="text-xs text-blue-700">
                        {`${equipment.make?.name} ${equipment.model?.name}`}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">{equipment.keywords}</td>
                  <td className="px-6 py-4">
                    {`${equipment.primaryMeterReading || ""} ${equipment.primaryMeter || ""}`}
                    <br />
                    {`${equipment.secondaryMeterReading || ""} ${equipment.secondaryMeter || ""}`}
                  </td>
                  <td className="px-6 py-4">Tasks</td>
                  <td className="px-6 py-4">Inspection</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end ">
                      <Dropdown id={equipment.id} />
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
