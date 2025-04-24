import { fetchFilteredVendors } from "@/app/lib/data";
import Dropdown from "@/app/ui/components/flowbiteDropdown";
import { getTranslations } from "next-intl/server";
import { formatPhone } from "@/app/lib/utils";

export default async function VendorsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  const t = await getTranslations('Vendor')
  const vendors = await fetchFilteredVendors(query, currentPage)

  return (
    <div className="mt-6 shadow-mdflow-root">
      <div className="relative shadow-md sm:rounded-lg">
        <table  className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                {t('name')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('contact')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('vendorTypeTitle')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('phone')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('keywords')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('address')}
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 uppercase font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {vendor.name}
                  </th>
                  <td className="px-6 py-4">{vendor.contact}</td>
                  <td className="px-6 py-4">{t(`vendorType.${vendor.vendorType}`)}</td>
                  <td className="px-6 py-4"> {formatPhone(vendor.phone)}</td>
                  <td className="px-6 py-4">{vendor.keywords}</td>
                  <td className="px-6 py-4">{vendor.address}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex relative overflow-visible justify-end">
                      <Dropdown id={vendor.id} />
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
