"use client";

import React, { CSSProperties } from "react";
import { ArrayPath, useFieldArray, FieldErrors, FieldValues, Path, useFormContext } from "react-hook-form";
import { XCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import DateInput from "./dateInput";
interface NestedDateInputProps<TFieldValues extends FieldValues> {
  name: ArrayPath<TFieldValues>;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  isEditMode: boolean;
}

const NestedDateInput = <TFieldValues extends FieldValues>({
  name,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isEditMode,
}: NestedDateInputProps<TFieldValues>) => {
  const { control } = useFormContext();

  const { fields, remove, append} = useFieldArray({
    control,
    name, // Directly pass the name as ArrayPath<TFieldValues>
  });

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
            <DateInput
              name={`${name}.${index}.dateNextDue` as Path<TFieldValues>}
              isEditMode={isEditMode}
            />
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
              onClick={() =>
                append({ 
                  id: "",
                  dateNextDue: new Date()
                } as any) // ✅ Append an object with a `dateNextDue` field
              }
            >
              <PlusIcon className="w-6 h-6 text-blue-600 cursor-pointer" />
              <p className="ml-2 text-sm text-blue-600">Add Date</p>
            </div>
          </div>
        }
      </div>
    </div>
  );
};


export default NestedDateInput;
