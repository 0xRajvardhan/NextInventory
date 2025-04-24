"use client";

import { SubmitHandler, useForm, FormProvider } from "react-hook-form";
import React, { Fragment } from "react";
import { MeterReading } from "@prisma/client/wasm";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEquipment } from "@/app/lib/actions";

import { Checkbox, Label } from "flowbite-react";
import { EquipmentFormValues, EquipmentFormSchema } from "@/app/lib/definitions";
import { GeneralTabs, TabItem } from '@/app/ui/components/tabs';
import { enumToOptions } from "@/app/lib/utils";

import NumericInput from "@/app/ui/components/RHF/numericInput";
import TextInput from "@/app/ui/components/RHF/textInput";
import SelectInput from "@/app/ui/components/RHF/selectInput";
import Search from "@/app/ui/search";
import TaskDropdown from "@/app/ui/components/taskDropdown";
import AsyncCreatableSelectInput from "../components/RHF/asyncCreatableSelectInput";

import { Divider } from "@nextui-org/react";
import { MdDashboard } from 'react-icons/md';
import { TaskDetails } from "@/app/lib/definitions";
import { HiAdjustments } from 'react-icons/hi';
import { fetchEquipmentType, fetchMake, fetchModel } from "@/app/lib/data";
import { Button } from "../components/button";

import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";



export default function EquipmentForm({
  equipment,
  tasks,
  isEditMode = false
}: {
  equipment?: EquipmentFormValues;
  tasks?: TaskDetails;
  isEditMode?: boolean;
}) {

  const methods = useForm<EquipmentFormValues>({
    resolver: zodResolver(EquipmentFormSchema),
    defaultValues: equipment
      ? equipment
      : {
          unitNumber: "",
          description: "",
          equipmentType: null,
          make: null,
          model: null,
          year: 0,
          keywords: "",
          serial: "",
          tag: "",
          meterTracking: false,
          primaryMeter: {value: 'None', label: 'None'},
          primaryMeterReading: 0,
          secondaryMeter: {value: 'None', label: 'None'},
          secondaryMeterReading: 0,
        },
    shouldUnregister: true,
  });

  const router = useRouter();

  const { watch, handleSubmit, formState: { isSubmitting }, register } = methods;
  
  const checkbox = watch("meterTracking");

  const onSubmit: SubmitHandler<EquipmentFormValues> = async (data) => {
    console.log(data);
    await createEquipment(data);
  };

  return (
    <>
      {isEditMode ? (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
              <div className="mb-4 grid grid-cols-4 gap-4">
                <TextInput
                  required={true}
                  labelText="Unit #"
                  labelClassName="flex text-sm font-medium mb-2 mr-6"
                  name="unitNumber"
                  placeholder="Enter unit #.."
                  isEditMode={isEditMode}
                />
                <TextInput
                  className="col-span-3"
                  labelText="Description"
                  labelClassName="flex text-sm font-medium mb-2 mr-6"
                  name="description"
                  placeholder="Enter description..."
                  isEditMode={isEditMode}
                />
              </div>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <AsyncCreatableSelectInput
                  className="col-span-2"
                  labelText="Type"
                  labelClassName="flex text-sm font-medium mb-2"
                  name="equipmentType"
                  placeholder="Select a type..."
                  loadOptionsFn={fetchEquipmentType}
                  isEditMode={isEditMode}
                />
              </div>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <AsyncCreatableSelectInput
                  labelText="Make"
                  labelClassName="flex text-sm font-medium mb-2"
                  name="make"
                  placeholder="Select make..."
                  loadOptionsFn={fetchMake}
                  isEditMode={isEditMode}
                />
                <AsyncCreatableSelectInput
                  className="col-span-2"
                  labelText="Model"
                  labelClassName="flex text-sm font-medium mb-2"
                  name="model"
                  placeholder="Select model..."
                  loadOptionsFn={fetchModel}
                  isEditMode={isEditMode}
                />
                <NumericInput
                  className="col-span-1"
                  labelText="Year"
                  labelClassName="flex text-sm font-medium mb-2"
                  name="year"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <TextInput
                  className="col-span-4"
                  labelText="Keywords"
                  labelClassName="flex text-sm font-medium mb-2 mr-6"
                  name="keywords"
                  placeholder="Enter keywords..."
                  isEditMode={isEditMode}
                />
              </div>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <TextInput
                  className="col-span-2"
                  labelText="Serial #"
                  labelClassName="flex text-sm font-medium mb-2 mr-6"
                  name="serial"
                  placeholder="Enter serial #..."
                  isEditMode={isEditMode}
                />
                <TextInput
                  className="col-span-2"
                  labelText="Tag #"
                  labelClassName="flex text-sm font-medium mb-2 mr-6"
                  name="tag"
                  placeholder="Enter tag #..."
                  isEditMode={isEditMode}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="meterTracking" {...register("meterTracking")} />
                <Label htmlFor="meterTracking" className="flex">
                  Equipment has a meter (e.g. miles, kilometers, or hours)
                </Label>
              </div>
              {checkbox && (
                <Fragment>
                  <div className="mt-4 mb-4 grid grid-cols-4 gap-4">
                    <SelectInput
                      className="col-span-1"
                      options={enumToOptions(MeterReading)}
                      labelText="Primary Meter"
                      labelClassName="flex text-sm font-medium mb-2 mr-6"
                      name="primaryMeter"
                      isEditMode={isEditMode}
                    />
                    <NumericInput
                      className="col-span-2"
                      labelText="Current Reading"
                      labelClassName="flex text-sm font-medium mb-2"
                      name="primaryMeterReading"
                      isEditMode={isEditMode}
                    />
                  </div>
                  <div className="mb-4 grid grid-cols-4 gap-4">
                    <SelectInput
                      className="col-span-1"
                      options={enumToOptions(MeterReading)}
                      labelText="Secondary Meter"
                      labelClassName="flex text-sm font-medium mb-2 mr-6"
                      name="secondaryMeter"
                      isEditMode={isEditMode}
                    />
                    <NumericInput
                      className="col-span-2"
                      labelText="Current Reading"
                      labelClassName="flex text-sm font-medium mb-2"
                      name="secondaryMeterReading"
                      isEditMode={isEditMode}
                    />
                  </div>
                </Fragment>
              )}
            </div>
            <div className="flex justify-end gap-4 mb-4 mt-4">
              {isEditMode ? (
                <>
                  <Button type="button" 
                    onClick={() => equipment ? router.push(`/dashboard/equipment/${equipment.id}`) : router.push(`/dashboard/equipment`) } className="bg-red-500 text-white hover:bg-red-600">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Spinner /> {/* Show a spinner */}
                        Saving...
                      </div>
                    ) : (
                      equipment ? "Update Equipment" : "Create Equipment"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" 
                    onClick={() => router.push(`/dashboard/equipment`)} className="bg-red-500 text-white hover:bg-red-600">
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/equipment/${equipment?.id}/edit`)
                    }
                  >
                    Edit Equipment
                  </Button>
                </> 
              )}  
            </div>
          </form>
        </FormProvider>
      ) : equipment ? (
        <Fragment>
          <Divider className="border border-solid border-1 mb-4" />
          <div className="w-full">
            <p className="capitalize">{equipment.description.toLowerCase()}</p>
            <div className="flex items-center mb-4">
              <p>
                {equipment.primaryMeter?.value} {equipment.primaryMeterReading}
              </p>
              <p>&nbsp;</p>
              <p>
                {equipment.secondaryMeter?.value} {equipment.secondaryMeterReading}
              </p>
            </div>
          </div>
          <Divider className="border border-solid border-1" />
        </Fragment>
      ) : null}
    </>
  );
}
