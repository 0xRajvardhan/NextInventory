import React, { CSSProperties } from 'react';
import { Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  labelText?: string; // Optional label text
  className?: string; // Optional class name for the wrapper div
  labelClassName?: string; // Optional class name for the label
  style?: CSSProperties; // Optional style object for the wrapper div
  labelStyle?: CSSProperties; // Optional style object for the label
  required?: boolean; // Indicates if the input is required
  isEditMode: boolean; // New prop to decide between Controller and p tag
}

const DateInput = <TFieldValues extends FieldValues>({
  name,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isEditMode, // Default to using the Controller
}: DateInputProps<TFieldValues>) => {

  const { control, getValues }= useFormContext();

  // Get the current value from the form's default values or state
  const defaultValue = getValues(name);

  return (
    <div className={className} style={style}>
      <div className={labelClassName}>
        {required && <p className="text-red-500"><span>*</span></p>}
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
            render={({ field, fieldState: { error} }) => (
              <div className='flex flex-col'>
                <DatePicker
                  id={name}
                  className="flex w-full cursor-pointer rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
                  onChange={(date) => field.onChange(date)}
                  selected={field.value}
                />
                {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
              </div>
            )}
          />
        ) : (
          <p className="w-full text-sm">{defaultValue ? new  Date(defaultValue).toLocaleDateString('en-US') : 'No date selected'}</p>
        )}
      </div>
    </div>
  );
};

export default DateInput;
