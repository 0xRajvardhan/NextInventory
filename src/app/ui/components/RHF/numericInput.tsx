import { CSSProperties, useEffect } from 'react';
import { Control, Controller, FieldValues, Path,FieldErrors, useFormContext } from 'react-hook-form';
import { NumericFormat, NumberFormatValues } from "react-number-format";

interface NumericProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string; // Optional label text
  unitLabel?: string; // Optional unit label
  className?: string; // Optional class name for the wrapper div
  labelClassName?: string; // Optional class name for the label
  pClasslassName?: string; // Optional class name for the p tag
  controllerClassName?: string;
  style?: CSSProperties; // Optional style object for the wrapper div
  labelStyle?: CSSProperties; // Optional style object for the label
  required?: boolean; // Indicates if the input is required
  prefix?: boolean;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  isAllowed?: (values: NumberFormatValues) => boolean; // Function type for isAllowed
  isEditMode: boolean;
}

const NumericInput = <TFieldValues extends FieldValues>({
  name,
  labelText,
  unitLabel,
  className,
  labelClassName,
  pClasslassName,
  controllerClassName = "w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500",
  style,
  labelStyle,
  required = false,
  prefix,
  decimalScale,
  fixedDecimalScale,
  isAllowed,
  isEditMode
}: NumericProps<TFieldValues>) => {
  const { control, getValues, watch } = useFormContext();
  const defaultValue = getValues(name);

  const watchValue = watch(name);

  return (
    <div className={className} style={style}>
      <div className={labelClassName}>
        {required && <p className="text-red-500"><span>*</span></p>}
        {labelText && (
          <label htmlFor={name}  style={labelStyle}>
            {labelText}
          </label>
        )}
      </div>
      <div className="flex w-full">
        {isEditMode ? (
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
              <div className="flex flex-col">
                <div className='flex items-center'>   
                  {unitLabel && (
                    <span className={pClasslassName}>
                      {unitLabel}
                    </span>
                  )}               
                  <NumericFormat
                    id={name}
                    className={controllerClassName}
                    decimalScale={decimalScale}
                    fixedDecimalScale={fixedDecimalScale}
                    isAllowed={isAllowed}
                    allowNegative={false}
                    value={value}
                    thousandSeparator=","
                    onValueChange={({ value }) => {                
                      // If the value is an empty string, treat it as 0
                      const numericValue = value === "" ? 0 : parseFloat(value); // Convert empty string to 0, else parse as float
                      onChange(numericValue); // Update the form value with the numeric value
                    }}
                    getInputRef={ref}
                  />

                </div>
                {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
              </div>
            )}
          />
        ):(
          <>   
            { prefix ? (
              <div className='flex w-full text-sm'>   
                {unitLabel && (
                  <span className={pClasslassName}>
                    {unitLabel}
                  </span>
                )}
                <p className="w-24 px-3 py-2 border border-gray-200 text-sm text-gray-700 rounded-md rounded-l-none">{watchValue.toFixed(decimalScale)}</p>
              </div>
            ):(
              <div className='flex w-full text-sm'>   
                <p className="w-24 px-3 py-2 border border-gray-200 text-sm text-gray-700 rounded-md rounded-r-none">{watchValue.toFixed(decimalScale)}</p>    
                {unitLabel && (
                  <span>
                    {unitLabel}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NumericInput;