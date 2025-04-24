import Pagination from "@/app/ui/components/pagination";
import { lusitana } from "@/app/ui/fonts";
import InventoryTable from "@/app/ui/tables/inventory-table";
import Search from "@/app/ui/search";
import { CreateProduct } from "@/app/ui/components/buttons";
import { fetchInventoryPages, fetchWarehouses } from "@/app/lib/data";
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import WarehouseSelect from "@/app/ui/components/selectWarehouse";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    warehouse?: string;
  };
}) {

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const warehouse =  searchParams?.warehouse || "";
  const totalPages = await fetchInventoryPages(query, warehouse);
  const  warehouses  = await fetchWarehouses("");

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Inventory</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <WarehouseSelect
          defaultValue="All warehouses"
          className="w-50"
          options={warehouses}
        />
        <Search placeholder="Search product..." />
        <CreateProduct />
      </div>
      {/* <Suspense key={query + currentPage} fallback={<Loading />}> */}
        <InventoryTable query={query} currentPage={currentPage} warehouse={warehouse} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
