import PurchaseOrdersForm from '@/app/ui/forms/purchaseOrders-form';
import Breadcrumbs from '@/app/ui/components/breadcrumbs';
import { fetchEmployees, fetchPurchaseOrderById, fetchTerms } from '@/app/lib/data';
import { fetchMappedItems, fetchWarehouses, fetchVendors } from '@/app/lib/data';
import PurchaseOrderItemsForm from '@/app/ui/forms/purchaseOrderItems-form';

export default async function Page({
    params
  }: {
    params: { id: string }
}) {

  const id = params.id;

  try {
    const [
      purchaseOrder
    ] = await Promise.all([
      fetchPurchaseOrderById(id),
    ]);

    if (!purchaseOrder) {
      // Handle the case where purchase order is not found
      return (
        <main>
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Purchase Orders', href: '/dashboard/purchaseorders' },
              { label: 'Not Found', href: '/dashboard/purchaseorders', active: true },
            ]}
          />
          <p>Purchase order not found.</p>
        </main>
      );
    }
    
    return (
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Purchase Orders', href: '/dashboard/purchaseorders' },
            {
              label: purchaseOrder?.poNumber.toString() || '',
              href: '/dashboard/purchaseorders/create',
              active: true,
            },
          ]}
        />
        {/* <PurchaseOrdersForm 
          purchaseOrder={purchaseOrder} 
          items={items}
          warehouses={warehouses} 
          vendors={vendors} 
          employees={employees} 
          terms={terms} 
        /> */}

        <PurchaseOrderItemsForm 
          purchaseOrder={purchaseOrder} 
        />

{/* <App/> */}
      </main>
    );

  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Purchase Orders', href: '/dashboard/purchaseorders' },
            { label: 'Error', href: '/dashboard/purchaseorders', active: true },
          ]}
        />
        <p>Error loading purchase order.</p>
      </main>
    );
  }
}
