import { CSSProperties, ReactNode } from 'react';
import { Controller, FieldValues, Path, useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from "flowbite-react";

interface CheckboxInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  children?: ReactNode; // Add children prop
  isEditMode: boolean;
}

const CheckboxInput = <TFieldValues extends FieldValues>({
  name,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  children,
  isEditMode = false,
}: CheckboxInputProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>();

  // Watch the current value of the checkbox
  const trackBy = useWatch({
    name: name,
    control,
  });

  return (
    <div className={className} style={style}>
      { isEditMode ? (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <div className="flex items-center">
              <Checkbox
                className="mr-2"
                id={name}
                checked={value}
                onChange={(e) => onChange(e.target.checked)} // Properly handle onChange
              />
              <label htmlFor={name} className={labelClassName} style={labelStyle}>
                Track by {labelText}
              </label>
              {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
            </div>
          )}
        />
      ):(  
        <p className='text-sm font-medium uppercase'>Track by {labelText}</p>  
      )}
      {/* Render children if trackByDate is true */}
      {trackBy && <div>{children}</div>}
    </div>
  );
};

export default CheckboxInput;
