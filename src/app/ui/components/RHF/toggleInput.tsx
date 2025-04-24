import { CSSProperties } from 'react';
import { Control, Controller, FieldValues, Path, FieldErrors, useFormContext } from 'react-hook-form';
import { ToggleSwitch } from "flowbite-react";

interface ToggleInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  labelText?: string; // Optional label text
  className?: string; // Optional class name for the wrapper div
  labelClassName?: string; // Optional class name for the label
  style?: CSSProperties; // Optional style object for the wrapper div
  labelStyle?: CSSProperties; // Optional style object for the label
  required?: boolean; // Indicates if the input is required
}

const ToggleInput = <TFieldValues extends FieldValues>({
  name,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
}: ToggleInputProps<TFieldValues>) => {
  const {control} = useFormContext();
  return (
    <div className={className} style={style}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ToggleSwitch
            id={name}
            color="blue"
            onChange={(checked) => field.onChange(checked)} // Update the value directly
            checked={field.value}
          />
        )}
      />
      <div className={labelClassName}>
        {required && <p className="text-red-500"><span>*</span></p>}
        {labelText && (
          <label htmlFor={name}  style={labelStyle}>
            {labelText}
          </label>
        )}
      </div>
    </div>
  );
};

export default ToggleInput;