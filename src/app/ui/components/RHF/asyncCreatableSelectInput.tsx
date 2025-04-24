'use client';

import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import { Controller, useFormContext, useWatch, Path, FieldValues } from "react-hook-form";
import { OptionsOrGroups, GroupBase } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface AsyncCreatableSelectInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  isClearable?: boolean;
  isDisabled?: boolean;
  required?: boolean;
  isEditMode: boolean;
  loadOptionsFn: (inputValue: string) => Promise<Option[]>;
}

const AsyncCreatableSelectInput = <TFieldValues extends FieldValues>({
  name,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  isClearable = true,
  isDisabled = false,
  required = false,
  isEditMode,
  loadOptionsFn,
}: AsyncCreatableSelectInputProps<TFieldValues>) => {
  const { control, getValues, setValue } = useFormContext<TFieldValues>();
  const defaultValue = getValues(name);

  // Load options function
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<Option, GroupBase<Option>>> => {
    return await loadOptionsFn(inputValue);
  };

  // Handle creation of a new option
  const handleCreateOption = (inputValue: string) => {
    const newOption: Option = { value: inputValue, label: inputValue };
    setValue(name, newOption as TFieldValues[Path<TFieldValues>]); // Ensure correct type is used
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
      {isEditMode ? (
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col text-sm w-full">
                <AsyncCreatableSelect
                  {...field}
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  isClearable={isClearable}
                  isDisabled={isDisabled}
                  placeholder={placeholder}
                  onCreateOption={handleCreateOption} // Handle new option creation
                />
                {error && (
                  <span className="mt-2 text-sm text-red-600">
                    {error.message}
                  </span>
                )}
              </div>
            )}
          />
        ) : (
          <div className="flex w-full">{defaultValue?.label}</div>
      )}
    </div>
  );
};

export default AsyncCreatableSelectInput;
