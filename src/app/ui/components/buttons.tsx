import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  PlusCircleIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "./button";
// import { deleteInvoice } from '@/app/lib/actions';
import { getTranslations } from "next-intl/server";

////////////////////////////////////// TASKS //////////////////////////////////////


////////////////////////////////////// EQUIPMENT //////////////////////////////////////

export function CreateEquipment() {
  return (
    <Link
      href="/dashboard/equipment/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Equipment</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

////////////////////////////////////// INVENTORY //////////////////////////////////////

////////////////////////////////////// PURCHASE ORDERS //////////////////////////////////////

////////////////////////////////////// WORK ORDERS //////////////////////////////////////

////////////////////////////////////// EMPLOYEES //////////////////////////////////////

////////////////////////////////////// VENDORS //////////////////////////////////////

export async function CreateVendor() {
  const t = await getTranslations("Vendor");
  return (
    <Link
      href="/dashboard/vendors/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">{t('createVendor')}</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateWarehouse({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PlusCircleIcon className="w-5" />
    </Link>
  );
}

export function CreateRepairRequest({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/equipment/${id}/repair`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="hidden md:block">Create Repair Request</span>{" "}
    </Link>
  );
}





export function CreateProduct() {
  return (
    <Link
      href="/dashboard/inventory/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Product</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreatePurchaseOrder() {
  return (
    <Link
      href="/dashboard/purchaseorders/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Purchase Order</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateWorkOrder() {
  return (
    <Link
      href="/dashboard/workorders/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Work Order</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateEmployee() {
  return (
    <Link
      href="/dashboard/employees/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Employee</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}



export function EditVendor({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/vendors/${id}/edit`}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Edit Vendor</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function ViewProduct({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/inventory/${id}/view`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <ViewfinderCircleIcon className="w-5" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/inventory/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  //   const deleteInvoiceWithId = deleteInvoice.bind(null, id);
  return (
    // <form action={deleteInvoiceWithId}>
    <form>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function ViewVendor({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/vendors/${id}/view`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <ViewfinderCircleIcon className="w-5" />
    </Link>
  );
}

export function UpdateVendor({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/vendors/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteVendor({ id }: { id: string }) {
  //   const deleteInvoiceWithId = deleteInvoice.bind(null, id);
  return (
    // <form action={deleteInvoiceWithId}>
    <form>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
