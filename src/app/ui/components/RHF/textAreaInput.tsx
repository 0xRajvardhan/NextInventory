import { CSSProperties } from 'react';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

interface TextAreaInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  rows?: number;
  required?: boolean;
  isEditMode?: boolean;
}

const TextAreaInput = <TFieldValues extends FieldValues>({
  name,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  rows = 3,
  required,
  isEditMode
}: TextAreaInputProps<TFieldValues>) => {
  const { control, getValues }= useFormContext();

  // Get the current value from the form's default values or state
  const defaultValue = getValues(name) ? getValues(name) : '';

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
      {isEditMode ? (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: {error} }) => (
            <div className="flex flex-col w-full">        
              <textarea
                {...field}
                id={name}
                name={name}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm outline-2 placeholder:text-gray-500"
                rows={rows}
              />
              {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
            </div>
          )}
        />
      ) : (
        <p className="flex w-full">{defaultValue}</p>
      )}
    </div>
  );
};

export default TextAreaInput;
