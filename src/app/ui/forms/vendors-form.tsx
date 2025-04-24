"use client";

import { Button } from "../components/button";
import React from "react";
import "react-phone-number-input/style.css";

import SelectInput from "../components/RHF/selectInput";
import TextInput from "../components/RHF/textInput";
import TelephoneInput from "../components/RHF/telephoneInput";

import { useForm, FormProvider } from "react-hook-form"; // Import the useForm hook
import { zodResolver } from "@hookform/resolvers/zod";
import { VendorType } from "@prisma/client";
// import { createVendor } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { VendorFormSchema, VendorFormValues } from "@/app/lib/definitions";
import { enumToOptions } from "@/app/lib/utils";
import { useTranslations } from "next-intl";
import { createVendor } from "@/app/lib/actions/vendor"; // Adjust the import path as necessary

export default function VendorsForm({ 
  vendor,
  isEditMode = false
}: { 
  vendor?: VendorFormValues,
  isEditMode?: boolean;
}) {

  const t = useTranslations("Vendor");

  const defaultValues: VendorFormValues = {
    id: "",
    name: "",
    contact: "",
    vendorType: {
      value: 'Supplier', 
      label: t('vendorType.Supplier') as VendorType,
    },
    phone: "",
    keywords: "",
    address: "",
  }

  const methods = useForm<VendorFormValues>({
    // resolver: zodResolver(VendorFormSchema),
    defaultValues: vendor
      ? {
          ...vendor,
          vendorType: vendor.vendorType
          ? {
              value: vendor.vendorType.value,
              label: t(`vendorType.${vendor.vendorType.value}`) as VendorType,
            }
          : null,
        }
      : defaultValues,
  });
  

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const router = useRouter();

  const handleSave = async (data: VendorFormValues) => {
    try {
      
      // const parsedData = VendorFormSchema.safeParse(data); // Parse and validate the data

      // if (!parsedData.success) {
      //   const fieldErrors = parsedData.error.flatten().fieldErrors;  
      //   Object.entries(fieldErrors).forEach(([field, messages]) => {
      //     if (messages?.length) {
      //       setError(field as keyof VendorFormValues, {
      //         type: 'manual',
      //         message: messages[0],
      //       });
      //     }
      //   });
  
      //   return; // Don't proceed to server if client validation fails
      // }

      const response = await createVendor(data); // Call the server action
  
      // Check if the response contains errors
      if (!response?.success) {
        console.log("Server returned errors:", response);
        
        // Iterate over the errors and pass them to react-hook-form
        response.errors.forEach((error: { field: string; message: string }) => {
          if (error.field && error.message) {
            // Use the field as the key for the error
            setError(error.field as keyof VendorFormValues, {
              type: "manual",
              message: error.message,
            });
          }
        });
      } else {
        console.log(response);
        // router.push(`/dashboard/vendors/${response?.id}`); // Redirect after successful creation/update
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };
  

  return (
    <FormProvider {...methods}>
    <form onSubmit={handleSubmit(handleSave)}>
      <div className="w-full">
        <div className="grid text-sm grid-cols-1 w-full xl:w-1/3 rounded-md bg-gray-50 p-6">
          <TextInput
            className="flex mb-4 items-center"
            required
            labelText={t("name")}
            labelClassName="flex w-36 text-right justify-end items-center text-sm font-medium mr-6"
            name="name"
            placeholder={t("placeholderName")}
            isEditMode={isEditMode}
          />
          <TextInput
            className="flex mb-4 items-center"
            labelText={t("contact")}
            labelClassName="flex w-36 justify-end items-center text-sm font-medium mr-6"
            name="contact"
            placeholder={t("placeholderContact")}
            isEditMode={isEditMode}
          />
          <SelectInput
            className="flex mb-4 items-center"
            required
            placeholder="Choose a vendor type..."
            labelText= {t("vendorTypeTitle")}
            labelClassName="flex w-36 text-right justify-end items-center text-sm font-medium mr-6"
            name="vendorType"
            options={enumToOptions(VendorType).map(option => ({
              value: option.value,
              label: t(`vendorType.${option.value}`)
            }))}
            isEditMode={isEditMode}
            isClearable={false}
          />
          <TelephoneInput
            className="flex mb-4 items-center"
            labelText={t("phone")}
            labelClassName="flex !w-36 justify-end items-center text-sm font-medium mr-6"
            name="phone"
            isEditMode={isEditMode}
          />
          <TextInput
            className="flex mb-4 items-center"
            labelText={t("keywords")}
            labelClassName="flex w-36 text-right justify-end items-center text-sm font-medium mr-6"
            name="keywords"
            placeholder={t("placeholderKeywords")}
            isEditMode={isEditMode}
          />
          <TextInput
            className="flex mb-4 items-center"
            labelText={t("address")}
            labelClassName="flex w-36 justify-end items-center text-sm font-medium mr-6"
            name="address"
            placeholder={t("placeholderAddress")}
            isEditMode={isEditMode}
          />
        </div>
      </div>
      <div className="flex w-1/3 justify-end gap-4 mt-4 mb-4">   
        {isEditMode ? (
          <>
            <Button type="button" 
              onClick={() => vendor ? router.push(`/dashboard/vendors/${vendor.id}`) : router.push(`/dashboard/vendors`) } className="bg-red-500 text-white hover:bg-red-600">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner /> {/* Show a spinner */}
                  Saving...
                </div>
              ) : (
                vendor ? t('updateVendor') : t('createVendor')
              )}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" 
              onClick={() => router.push(`/dashboard/vendors`)} className="bg-red-500 text-white hover:bg-red-600">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() =>
                router.push(`/dashboard/vendors/${vendor?.id}/edit`)
              }
            >
              {t('editVendor')}
            </Button>
          </> 
        )}       
      </div>
    </form>
    </FormProvider>
  );  
}
