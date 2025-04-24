import PurchaseOrdersForm from '@/app/ui/forms/purchaseOrders-form';
import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { fetchWarehouses, fetchVendors, fetchEmployees, fetchTerms } from '@/app/lib/data';
 
export default async function Page() {

  const [
    { warehouses },
    { vendors },
    { terms },
    { employees }
  ] = await Promise.all([
    fetchWarehouses(),
    fetchVendors(),
    fetchTerms(),
    fetchEmployees(),
  ]);
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Purchase Orders', href: '/dashboard/purchaseorders' },
          {
            label: 'Create Purchase Order',
            href: '/dashboard/purchaseorders/create',
            active: true,
          },
        ]}
      />
       <PurchaseOrdersForm warehouses={warehouses} vendors ={vendors} employees={employees} terms = {terms} /> 
    </main>
  );
}