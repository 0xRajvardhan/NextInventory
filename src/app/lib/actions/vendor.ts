'use server';
import prisma from '@/app/lib/prisma';
import { VendorFormSchema, VendorFormValues } from '../definitions';
type FieldError = { field: string; message: string };

type ActionResult =
  | { success: true; message: string; id?: string }
  | { success: false; errors: FieldError[] };

export async function createVendor(data: VendorFormValues): Promise<ActionResult> {

  const parsed = VendorFormSchema.safeParse(data); // ✅ works here

  if (!parsed.success) {
    const errors: FieldError[] = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({
        field,
        message: messages?.[0] || 'Invalid value',
      })
    );

    return { success: false, errors };
  }

  // ✅ use parsed.data here
  const vendor = await prisma.vendor.create({
    data: {
      name: parsed.data.name.toUpperCase(),
      contact: parsed.data.contact,
      // vendorType: parsed.data.vendorType?.value || 'Supplier',
      vendorType: 'Supplier',
      phone: '12345',
      // phone: parsed.data.phone,
      keywords: parsed.data.keywords,
      address: parsed.data.address,
    },
  });

  return {
    success: true,
    message: 'Vendor created',
    id: vendor.id,
  };
}
