import VendorsForm from '@/app/ui/forms/vendors-form';
import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('Vendor');
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: t('vendors'), href: '/dashboard/vendors' },
          {
            label: t('createVendor'),
            href: '/dashboard/vendors/create',
            active: true,
          },
        ]}
      />
       <VendorsForm
        isEditMode = {true}
       /> 
    </main>
  );
}