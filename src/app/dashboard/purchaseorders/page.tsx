import Pagination from '@/app/ui/components/pagination';
import { lusitana } from '@/app/ui/fonts';
import PurchaseOrdersTable from '@/app/ui/tables/purchaseOrders-table';
import Search from '@/app/ui/search';
import { CreatePurchaseOrder } from '@/app/ui/components/buttons';
import { fetchPurchaseOrdersPages } from '@/app/lib/data';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchPurchaseOrdersPages(query);
  
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Purchase Orders</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search purchase order..." />
        <CreatePurchaseOrder />
      </div>
       {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
       <PurchaseOrdersTable query={query} currentPage={currentPage} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}