'use client';

import React from "react";
import AsyncSelect from "react-select/async";
import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { OptionsOrGroups, GroupBase } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface AsyncSelectInputProps<TFieldValues extends FieldValues> {
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

const AsyncSelectInput = <TFieldValues extends FieldValues>({
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
}: AsyncSelectInputProps<TFieldValues>) => {
  const { control, getValues } = useFormContext();
  const defaultValue = getValues(name);

  // If we're not in edit mode and there's no default value,
  // don't render anything.
  if (!isEditMode && !defaultValue) {
    return null;
  }

  // Load options function inside the component
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<Option, GroupBase<Option>>> => {
    const options = await loadOptionsFn(inputValue);
    return options;
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
        // In view mode, render default value if available.
        defaultValue && (
          <div className="flex w-full text-sm">{defaultValue.label}</div>
        )
      )}
    </div>
  );
};

export default AsyncSelectInput;
