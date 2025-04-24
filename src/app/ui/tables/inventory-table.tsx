
import { fetchInventoryItems } from "@/app/lib/data";

import Dropdown from "@/app/ui/components/flowbiteDropdown";
import { Spinner } from "flowbite-react";
import {Dollar } from "flowbite-react-icons/outline"

export default async function InventoryTable({
  query,
  currentPage,
  warehouse
}: {
  query: string;
  currentPage: number;
  warehouse: string;
}) {

  const items = await fetchInventoryItems(query, currentPage, warehouse);

  return (
    <div className="mt-6 shadow-mdflow-root">
      <div className="relative  shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="w-40 px-6 py-3">
                Part Number
              </th>
              <th scope="col" className="w-60 px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Bin
              </th>
              <th scope="col" className="px-6 py-3">
                Manufacturer
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Quantity
              </th>
              <th scope="col" className="w-40 px-6 py-3">
                Unit Cost
              </th>
              <th scope="col" className="px-6 py-3">
                Vendors
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
          {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center items-center">
                  <div className="flex justify-center items-center">
                    <Spinner/>
                    <p className="ml-2">
                      Loading data...
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {item.partNumber}
                    </th>
                    <td className="px-6 py-4">{item?.name}</td>
                    <td className="px-6 py-4">{item.location}</td>
                    <td className="px-6 py-4">{[...new Set(item.vendors.map((manufacturer) => manufacturer.manufacturer?.name))].join(", ")}</td>
                    <td className="px-6 py-4">{item.category?.name}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4"> 
                      <div className="flex items-center space-x-1">
                        <Dollar className="h-3 w-3" /> 
                        {item.unitCostDollar}
                      </div>
                      <div className="flex items-center">
                        <span>Bs.F {item.unitCostVES}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{[...new Set(item.vendors.map((vendor) => vendor.vendor?.name))].join(", ")}</td>                  
                    <td className="px-6 py-4">                      
                      <Dropdown id={item.id} />
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
