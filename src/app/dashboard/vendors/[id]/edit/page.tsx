import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import VendorsForm from '@/app/ui/forms/vendors-form';
import { fetchVendorById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function Page({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;
  const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(user);
  
    if (!user) {
      return redirect("/login");
    }

  const [ vendor ] = await Promise.all([
    fetchVendorById(id),

  ]);

  if (!vendor) {
    notFound();
  }
  
  const t = await getTranslations('Vendor')

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: t('vendors'), href: '/dashboard/vendors' },
          {
            label: vendor.name,
            href: `/dashboard/vendors/${vendor.id}`,
          },
          {
            label: t('editVendor'),
            href: `/dashboard/vendors/${vendor.id}/edit`,
            active: true,
          },
        ]}
      />
      <VendorsForm
        vendor = {vendor}
        isEditMode = {true}
      />
    </main>
  );
}