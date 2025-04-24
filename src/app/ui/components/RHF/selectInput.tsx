"use client";

import React, { CSSProperties, useEffect } from "react";
import {
  Controller,
  FieldValues,
  Path,
  useFormContext
} from "react-hook-form";
import Select, { GroupBase, OptionsOrGroups } from "react-select";
import { useLocale, useTranslations } from "next-intl";


interface Option {
  value: string;
  label: string;
}

interface SelectInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  options: OptionsOrGroups<Option, GroupBase<Option>>; // Updated to use OptionsOrGroups type
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  isDisabled?: boolean;
  isClearable?: boolean;
  required?: boolean;
  isObject?: boolean;
  isEditMode: boolean;
}

const SelectInput = <TFieldValues extends FieldValues>({
  name,
  options,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  isClearable = true,
  isDisabled = false,
  required = false,
  isObject = true,
  isEditMode
}: SelectInputProps<TFieldValues>) => {

  const { control, getValues, setValue } = useFormContext();
  
  // Get default value from the control
  const defaultValue = getValues(name);

  const t = useTranslations('Vendor');  
  const locale = useLocale();


  useEffect(() => {
    // Make sure that the value you're setting matches the expected type for the field
    setValue(name, {
      ...defaultValue,
      label: t(`${name}.${defaultValue.value}`),
    });
  }, [locale, setValue, defaultValue, t, name]);
  
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
      <div className="flex w-full">
        {isEditMode ? (
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full">
                <Select
                  {...field} // RHF field props
                  inputId={name}
                  instanceId={name}
                  placeholder={placeholder}
                  isClearable={isClearable}
                  isDisabled={isDisabled}
                  menuPosition="fixed"
                  options={options}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      width: "100%",
                      fontSize: "14px",
                      color: "black",
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      width: "100%",
                      fontSize: "14px",
                      color: "black",
                    }),
                    option: (baseStyles) => ({
                      ...baseStyles,
                      width: "100%",
                      fontSize: "14px",
                      color: "black",
                    }),
                  }}
                />
                {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
              </div>
            )}
          />
        ):(
          <div className="flex w-full text-sm">{ t(`${name}.${defaultValue.value}`)}</div>
        )}
      </div>
    </div>
  );
};

export default SelectInput;
