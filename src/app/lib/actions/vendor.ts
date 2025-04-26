"use server";
import prisma from "@/app/lib/prisma";
import { VendorFormSchema, VendorFormValues } from "../definitions";
type FieldError = { field: string; message: string };

type ActionResult =
  | { success: true; message: string; id?: string }
  | { success: false; errors: FieldError[] };

export async function createVendor(
  data: VendorFormValues
): Promise<ActionResult> {
  const parsed = VendorFormSchema.safeParse(data);

  if (!parsed.success) {
    const errors: FieldError[] = Object.entries(
      parsed.error.flatten().fieldErrors
    ).map(([field, messages]) => ({
      field,
      message: messages?.[0] || "Invalid value",
    }));

    return { success: false, errors };
  }

  // Check if vendor with the same name already exists
  const existingVendor = await prisma.vendor.findUnique({
    where: {
      name: parsed.data.name.toUpperCase(),
    },
  });

  if (existingVendor) {
    return {
      success: false,
      errors: [
        { field: "name", message: "A vendor with this name already exists" },
      ],
    };
  }

  try {
    const vendor = await prisma.vendor.create({
      data: {
        name: parsed.data.name.toUpperCase(),
        contact: parsed.data.contact,
        // vendorType: typeof parsed.data.vendorType === 'object' ? parsed.data.vendorType.value : parsed.data.vendorType,
        vendorType: parsed.data.vendorType && typeof parsed.data.vendorType === 'object' ? parsed.data.vendorType.value : parsed.data.vendorType ?? "Supplier",      
        phone: parsed.data.phone,
        keywords: parsed.data.keywords,
        address: parsed.data.address,
      },
    });

    return {
      success: true,
      message: "Vendor created successfully",
      id: vendor.id,
    };
  } catch (error) {
    console.error("Error creating vendor:", error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Failed to create vendor. Please try again.",
        },
      ],
    };
  }
}

export async function updateVendor(
  data: VendorFormValues
): Promise<ActionResult> {
  const parsed = VendorFormSchema.safeParse(data);

  if (!parsed.success) {
    const errors: FieldError[] = Object.entries(
      parsed.error.flatten().fieldErrors
    ).map(([field, messages]) => ({
      field,
      message: messages?.[0] || "Invalid value",
    }));

    return { success: false, errors };
  }

  // Check if vendor with the same name already exists, excluding the current vendor
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      name: parsed.data.name.toUpperCase(),
      NOT: {
        id: parsed.data.id
      }
    },
  });

  if (existingVendor) {
    return {
      success: false,
      errors: [
        { field: "name", message: "A vendor with this name already exists" },
      ],
    };
  }

  try {
    const vendor = await prisma.vendor.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        name: parsed.data.name.toUpperCase(),
        contact: parsed.data.contact,
        vendorType: parsed.data.vendorType && typeof parsed.data.vendorType === 'object' ? parsed.data.vendorType.value : parsed.data.vendorType ?? "Supplier",
        phone: parsed.data.phone,
        keywords: parsed.data.keywords,
        address: parsed.data.address,
      },
    });

    return {
      success: true,
      message: "Vendor updated successfully",
      id: vendor.id,
    };
  } catch (error) {
    console.error("Error updating vendor:", error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Failed to update vendor. Please try again.",
        },
      ],
    };
  }
}
