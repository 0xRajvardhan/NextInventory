import Pagination from '@/app/ui/components/pagination';
import { lusitana } from '@/app/ui/fonts';
import VendorsTable from '@/app/ui/tables/vendors-table';
import Search from '@/app/ui/search';
import { CreateVendor } from '@/app/ui/components/buttons';
import { fetchVendorPages } from '@/app/lib/data';
import { getTranslations } from 'next-intl/server';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {

  const { query = '', page = '1' } = await searchParams || {};

  // const query = searchParams?.query || '';
  const currentPage = Number(page) || 1;
  const totalPages = await fetchVendorPages(query);
  const t = await getTranslations('Vendor')
  
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>{t('vendors')}</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder={t('placeholderVendor')} />
        <CreateVendor />
      </div>
       {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
       <VendorsTable query={query} currentPage={currentPage} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}