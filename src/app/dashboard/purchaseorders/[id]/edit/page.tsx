import PurchaseOrdersForm from '@/app/ui/forms/purchaseOrders-form';
import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { fetchWarehouses, fetchVendors, fetchEmployees, fetchTerms, fetchPurchaseOrderById} from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({
    params
  }: {
    params: { id: string },
  }
) {

  const id = params.id;

  const [
    purchaseOrder,
    { warehouses },
    { vendors },
    { terms },
    { employees }
  ] = await Promise.all([
    fetchPurchaseOrderById(id),
    fetchWarehouses(),
    fetchVendors(),
    fetchTerms(),
    fetchEmployees(),
  ]);

  if (!purchaseOrder) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Purchase Orders', href: '/dashboard/purchaseorders' },
          {
            label: purchaseOrder.poNumber.toString(),
            href: `/dashboard/purchaseorders/${purchaseOrder.id}`
          },
          {
            label: 'Edit',
             href: `/dashboard/purchaseorders/${purchaseOrder.id}/edit`,
            active: true,
          },
        ]}
      />
       <PurchaseOrdersForm purchaseOrder={purchaseOrder} warehouses={warehouses} vendors ={vendors} employees={employees} terms = {terms} /> 
    </main>
  );
}