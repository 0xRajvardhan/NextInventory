"use client";

import { Button } from "../components/button";
import React from "react";
import "react-phone-number-input/style.css";
import { useEffect } from "react";
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
import { useLocale, useTranslations } from "next-intl";
import { createVendor, updateVendor } from "@/app/lib/actions/vendor"; // Adjust the import path as necessary
import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export default function VendorsForm({
  vendor,
  isEditMode = false,
}: {
  vendor?: VendorFormValues;
  isEditMode?: boolean;
}) {
  const [submitClicked, setSubmitClicked] = React.useState(false);

  const t = useTranslations("Vendor");

  const locale = useLocale();

  const options = enumToOptions(VendorType)
    .filter((option) => {
      if (locale === "en") {
        return ["Supplier", "Distributor", "Manufacturer"].includes(
          option.value
        );
      }
      if (locale === "es") {
        return ["Proveedor", "Distribuidor", "Fabricante"].includes(
          option.value
        );
      }
      return true;
    })
    .map((option) => ({
      value: option.value,
      label: t(`vendorType.${option.value}`),
    }));

  const allowedVendorTypes =
    locale === "es"
      ? ["Proveedor", "Distribuidor", "Fabricante"]
      : ["Supplier", "Distributor", "Manufacturer"];

  // Created a localized schema with translated messages
  const LocalizedVendorSchema = z.object({
    vendorType: z
      .object({
        value: z.enum(allowedVendorTypes as [string, ...string[]]),
        label: z.string(),
      })
      .nullable()
      .refine(
        (val) =>
          val !== null && val.value !== undefined && val.label !== undefined,
        { message: t("validation.vendorTypeRequired") }
      ),
    id: z.string().optional(),
    name: z.string().min(1, { message: t("validation.nameRequired") }),
    contact: z.string().optional(),
    phone: z
      .string()
      .min(1, { message: t("validation.phoneRequired") })
      .refine((value) => isValidPhoneNumber(value), {
        message: t("validation.phoneInvalid"),
      }),
    keywords: z.string().optional(),
    address: z.string().optional(),
  });

  const defaultValues: VendorFormValues = {
    id: "",
    name: "",
    contact: "",
    vendorType: {
      value: locale === "es" ? "Proveedor" : "Supplier",
      label: t(
        `vendorType.${locale === "es" ? "Proveedor" : "Supplier"}`
      ) as VendorType,
    },
    phone: "",
    keywords: "",
    address: "",
  };

  const methods = useForm<VendorFormValues>({
    resolver: zodResolver(LocalizedVendorSchema),
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
    trigger,
  } = methods;

  const router = useRouter();

  // useEffect to revalidate when language changes
  const firstRenderRef = React.useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (submitClicked) {
      trigger();
    }
  }, [submitClicked, trigger]);

  const handleSave = async (data: VendorFormValues) => {
    try {
      const response = isEditMode
        ? await updateVendor(data)
        : await createVendor(data);

      if (response?.success) {
        router.push("/dashboard/vendors");
      }

      if (!response?.success) {
        console.log("Server returned errors:", response);

        response.errors.forEach((error: { field: string; message: string }) => {
          if (error.field && error.message) {
            setError(error.field as keyof VendorFormValues, {
              type: "manual",
              message:
                error.field === "name" &&
                error.message.includes("already exists")
                  ? t("validation.vendorExists")
                  : error.message,
            });
          }
        });
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          setSubmitClicked(true);
          handleSubmit(handleSave)(e);
        }}
      >
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
              labelText={t("vendorTypeTitle")}
              labelClassName="flex w-36 text-right justify-end items-center text-sm font-medium mr-6"
              name="vendorType"
              options={options}
              isEditMode={isEditMode}
              isClearable={false}
            />
            <TelephoneInput
              className="flex mb-4 items-center"
              labelText={t("phone")}
              labelClassName="flex !w-36 justify-end items-center text-sm font-medium mr-6"
              name="phone"
              required
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
              <Button
                type="button"
                onClick={() =>
                  vendor
                    ? router.push(`/dashboard/vendors/${vendor.id}`)
                    : router.push(`/dashboard/vendors`)
                }
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Spinner /> {/* Show a spinner */}
                    Saving...
                  </div>
                ) : vendor ? (
                  t("updateVendor")
                ) : (
                  t("createVendor")
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => router.push(`/dashboard/vendors`)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </div>
                ) : (
                  t("createVendor")
                )}
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
