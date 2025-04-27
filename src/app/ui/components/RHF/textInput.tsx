"use client";

import { CSSProperties } from "react";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

interface TextInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  isEditMode: boolean;
}

const TextInput = <TFieldValues extends FieldValues>({
  name,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required,
  isEditMode,
}: TextInputProps<TFieldValues>) => {
  const { control, getValues } = useFormContext();
  const defaultValue = getValues(name);

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
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="flex flex-col w-full">
               <input
               id={name}
               onChange={(e) => field.onChange(e.target.value)}
               value={field.value ?? ""}
               placeholder={placeholder}
               className={`w-full rounded-md border py-2 pr-2 pl-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:border-blue-900`}
             />
              {error && (
                <span className="mt-2 text-sm text-red-600">
                  {error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default TextInput;
