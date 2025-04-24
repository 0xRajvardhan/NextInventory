"use client";

import React, { CSSProperties } from "react";
import { ArrayPath, Control, useFieldArray, FieldErrors, FieldValues, useFormContext, Path, FieldArray, Field } from "react-hook-form";
import { XCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import NumericInput from "./numericInput";
import { DateNextDue } from "@/app/lib/zod";

interface NestedNumericInputProps<TFieldValues extends FieldValues> {
  name: ArrayPath<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  controllerClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  errors?: FieldErrors<TFieldValues>;
  meter?: string;
  isEditMode: boolean;
}

const NestedNumericInput = <TFieldValues extends FieldValues>({
  name,
  placeholder,
  labelText,
  className,
  labelClassName,
  controllerClassName,
  style,
  labelStyle,
  required = false,
  errors,
  meter,
  isEditMode
}: NestedNumericInputProps<TFieldValues>) => {

  const { control } = useFormContext();
  const { fields, remove, append } = useFieldArray({
    control,
    name: name, // Directly pass the name as ArrayPath<TFieldValues>
  });

  const error = errors?.[name as keyof TFieldValues]?.message as string | undefined;

  const isPrimary = name.includes("Primary");

  return (
    <div className={className} style={style}>
      <div className={labelClassName}>
        {required && (
          <p className="text-red-500">
            <span>*</span>
          </p>
        )}
        {labelText && (
          <label htmlFor={name} style={labelStyle}>
            {labelText}
          </label>
        )}
      </div>
      <div>
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center mb-4">
            <NumericInput
              controllerClassName={controllerClassName}
              name={ isPrimary ? (`${name}.${index}.primaryNextDue` as Path<TFieldValues>) : (`${name}.${index}.secondaryNextDue` as Path<TFieldValues>) }
              pClasslassName="w-24 px-3 py-2 bg-white-200 border border-white-200 text-sm text-gray-700 rounded-md rounded-r-none"
              placeholder={placeholder}
              isEditMode={isEditMode}
            />
            <span className="px-3 py-2 bg-gray-200 border border-gray-200 text-sm text-gray-700 rounded-md rounded-l-none">
              {meter}
            </span>
            {index !== 0 && isEditMode && (
              <XCircleIcon
                className="ml-3 w-6 h-6 text-red-600 cursor-pointer"
                onClick={() => remove(index)}
              />
            )}
          </div>
        ))}
        {isEditMode && 
          <div className="flex items-center mb-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => append(
                  isPrimary ? {
                    id: "",
                    primaryNextDue: ""

                  } : {
                    id: "",
                    secondaryNextDue: ""
                  } as any
                ) 
              } // Append a new date field
            >
              <PlusIcon className="w-6 h-6 text-blue-600 cursor-pointer" />
              <p className="ml-2 text-sm text-blue-600">Add Meter</p>
            </div>
          </div>
        }

        {error && <span className="mt-2 text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
};

export default NestedNumericInput;
