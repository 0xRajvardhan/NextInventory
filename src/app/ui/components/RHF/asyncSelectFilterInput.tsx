'use client';

import React from "react";
import AsyncSelect from "react-select/async";
import { Controller, FieldValues, Path, useFormContext, useWatch } from "react-hook-form";
import { OptionsOrGroups, GroupBase } from "react-select";

interface Option {
  value: string;
  label: string;
}

type GetOptionValueType<T> = (Option: { [key: string]: { value: string } | null }) => string | undefined;

interface AsyncSelectInputProps<TFieldValues extends FieldValues, TKey extends string> {
  name: Path<TFieldValues>;
  arrayName: Path<TFieldValues>;
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
  getOptionValue?: GetOptionValueType<TKey>;
}

const AsyncSelectInput = <TFieldValues extends FieldValues, TKey extends string>({
  name,
  arrayName,
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
  getOptionValue
}: AsyncSelectInputProps<TFieldValues, TKey>) => {
  const { control, getValues } = useFormContext();
  const defaultValue = getValues(name);

  // Get the watched array from the parent field.
  const watchArray = useWatch({
    name: arrayName,
    control,
  });

  // Use a default fallback if getOptionValue is not provided
  const extractOptionValue = getOptionValue || ((Option: Option) => Option?.value);

  // Generate the key based on the warehouse/vendor value of the items in the array
  const Key = watchArray
    ?.map((Option: any) => extractOptionValue(Option))
    .join("-");

  // Load options function inside the component
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<Option, GroupBase<Option>>> => {
    const options = await loadOptionsFn(inputValue);

    return options.filter((option) =>
      !((watchArray ?? []).some((item) => extractOptionValue(item) === option.value))
    );
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
              <AsyncSelect
                {...field}
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                // Force re-render when watchArray changes:
                key={`async-select-${Key}`}
              />
              {error && (
                <span className="mt-2 text-sm text-red-600">{error.message}</span>
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

export default AsyncSelectInput;
