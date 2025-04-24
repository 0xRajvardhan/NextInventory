"use client";

import React, { Fragment } from "react";
import TextInput from "../components/RHF/textInput";
import TelephoneInput from "../components/RHF/telephoneInput";
import ToggleInput from "../components/RHF/toggleInput";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployee } from "@/app/lib/actions";
import { EmployeeStatus, AdminType } from "@prisma/client/wasm";
import { useRouter } from "next/navigation";
import { Button } from "../components/button";
import { Spinner } from "flowbite-react";
import SelectInput from "../components/RHF/selectInput";
import { enumToOptions } from "@/app/lib/utils";
import { EmployeeFormSchema, EmployeeFormValues } from "@/app/lib/definitions";
import NumericInput from "../components/RHF/numericInput";

const defaultValues: EmployeeFormValues = {
  id: "",
  firstName: "",
  lastName: "",
  phone: "",
  employeeStatus: {value: 'Active', label: 'Active'},
  laborRate: 0,
  loginAllowed: false,
  email: null,
  adminType: {value: 'Standard', label: 'Standard'},
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default function EmployeesForm({
  employee,
  isEditMode = false,
}: {
  employee?: EmployeeFormValues;
  isEditMode?: boolean;
}) {

  const methods = useForm<EmployeeFormValues>({
    resolver: zodResolver(EmployeeFormSchema),
    defaultValues: employee
      ? employee
      : defaultValues
  });

  const { 
    handleSubmit, 
    watch, 
    formState:{ isSubmitting} 
  } = methods;

  const router = useRouter();
  const loginAllowed = watch("loginAllowed");

  const handleSave = async (data: EmployeeFormValues) => {
    console.log(data)
    try {
      const response = await createEmployee(data);
      if (response?.error) {
        console.error("Server error:", response.error);
      } else {
        router.push(`/dashboard/employees/${response?.id}`);
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="rounded-md bg-gray-50 p-4 w-1/2 md:p-6">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <TextInput
              className="relative"
              required={true}
              labelText="First Name"
              labelClassName="flex text-sm font-medium mb-2 mr-6"
              name="firstName"
              placeholder="Enter a name..."
              isEditMode={isEditMode}
            />
            <TextInput
              className="relative"
              required={true}
              labelText="Last Name"
              labelClassName="flex text-sm font-medium mb-2 mr-6"
              name="lastName"
              placeholder="Enter a name..."
              isEditMode={isEditMode}
            />
          </div>
          <TelephoneInput
            className="flex items-center w-3/4 mb-4 pr-2"
            labelText="Phone"
            labelClassName="flex items-center text-sm font-medium mr-6"
            name="phone"
            isEditMode={isEditMode}
          />
          <SelectInput
            className="flex items-center w-1/2 mb-4 pr-2"
            required={true}
            labelText="Status"
            labelClassName="flex text-sm font-medium mr-6"
            name="employeeStatus"
            options={enumToOptions(EmployeeStatus)}
            isEditMode={isEditMode}
            isClearable={false}
          />
          <NumericInput
            className="flex mb-4 w-1/2 items-center"
            labelText="Unit Cost Dollar"
            labelClassName="flex w-60 items-center text-sm font-medium"
            pClasslassName="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none"
            controllerClassName="flex w-full rounded-md rounded-l-none border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            unitLabel="$"
            name="laborRate"
            prefix={true}
            decimalScale={2}
            isEditMode={isEditMode}
          />
          {isEditMode && (
            <ToggleInput
              className="flex items-center mb-4"
              labelText="Allow Login"
              labelClassName="flex text-sm font-medium ml-2"
              name="loginAllowed"
            />
          )}
          {loginAllowed && (
            <Fragment>
              <TextInput
                className="w-1/2 mb-4 pr-2"
                required={true}
                labelText="Email"
                labelClassName="flex text-sm font-medium mb-2 mr-6"
                name="email"
                placeholder="Enter email..."
                isEditMode={isEditMode}
              />
              <SelectInput
                className="w-1/2 mb-4 pr-2"
                labelText="Admin Type"
                labelClassName="text-sm font-medium mb-2 mr-6"
                name="adminType"
                options={enumToOptions(AdminType)}
                isEditMode={isEditMode}
              />
            </Fragment>
          )}
        </div>
        <div className="flex w-1/2 justify-end gap-4 mb-4 mt-4">          
          {isEditMode ? (
            <>
              <Button type="button" 
                onClick={() => employee ? router.push(`/dashboard/employees/${employee.id}`) : router.push(`/dashboard/employees`) } className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Spinner /> {/* Show a spinner */}
                    Saving...
                  </div>
                ) : (
                  employee ? "Update Employee" : "Create Employee"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" 
                onClick={() => router.push(`/dashboard/employees`)} className="bg-red-500 text-white hover:bg-red-600">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/employees/${employee?.id}/edit`)
                }
              >
                Edit Employee
              </Button>
            </>
          )}   
        </div>
      </form>
    </FormProvider>
  );
}
