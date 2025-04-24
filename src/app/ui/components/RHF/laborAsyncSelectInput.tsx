'use client'

import { CSSProperties } from 'react';
import {
  Controller,
  FieldValues,
  Path,
  useWatch,
  useFormContext,
  PathValue
} from 'react-hook-form';
import { OptionsOrGroups, OptionProps, GroupBase, components } from 'react-select';
import AsyncSelect from "react-select/async";
import { fetchEmployeesByLabor, fetchSelectItemswithReceipt } from "@/app/lib/data";

interface LaborOption {
  value: string;
  label: string;
  laborRate: number;
}

interface LaborAsyncSelectInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  arrayName: Path<TFieldValues>;
  setValueName: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  isEditMode?: boolean;
  isDisabled?: boolean;
}

const LaborAsyncSelectInput = <TFieldValues extends FieldValues>({
  name,
  arrayName,
  setValueName,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isEditMode = false,
  isDisabled = false,
}: LaborAsyncSelectInputProps<TFieldValues>) => {
  const { control, getValues, setValue } = useFormContext<TFieldValues>();

  const defaultValue = getValues(name);
  
  // Load options with filtering applied
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<LaborOption, GroupBase<LaborOption>>> => {
    try {
      const groupedItems = await fetchEmployeesByLabor(inputValue, "");

      return groupedItems
      
    } catch (error) {
      console.error("Error loading options:", error);
      return [];
    }
  };

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
      <div className="relative w-full">
        {isEditMode ? (
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full">
                <AsyncSelect
                  {...field} // React Hook Form field props
                  cacheOptions
                  placeholder={placeholder}
                  loadOptions={loadOptions}
                  isClearable={true}
                  isDisabled={isDisabled}
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption); // Updates the selected item
                    const laborField = `${name}.laborRate` as Path<TFieldValues>;

                    if (selectedOption) {
                      // Dynamically generate the unit cost field name based on the provided `name`
                      console.log(selectedOption.laborRate)
                  
                      // Set the value dynamically
                      setValue(setValueName, selectedOption.laborRate as PathValue<TFieldValues, Path<TFieldValues>>);
                    } else {
                      // Clear the unit cost field if the selected item is cleared
                      setValue(setValueName, 0 as PathValue<TFieldValues, typeof laborField>);
                    }
                  }}
                  
                  
                />
                {error && (
                  <span className="mt-2 text-sm text-red-600">
                    {error.message}
                  </span>
                )}
              </div>
            )}
          />
        ):(
          <div className="flex w-full">{defaultValue?.label} </div>
        )}

      </div>
    </div>
  );
};

export default LaborAsyncSelectInput;

