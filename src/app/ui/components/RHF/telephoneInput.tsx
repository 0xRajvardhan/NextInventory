'use client'

import { CSSProperties } from 'react';
import { Control, Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useTranslations } from 'next-intl';

interface TelephoneInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  labelText?: string; // Optional label text
  className?: string; // Optional class name for the wrapper div
  labelClassName?: string; // Optional class name for the label
  style?: CSSProperties; // Optional style object for the wrapper div
  labelStyle?: CSSProperties; // Optional style object for the label
  required?: boolean; // Indicates if the input is required
  isEditMode: boolean;
}

const TelephoneInput = <TFieldValues extends FieldValues>({
  name,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isEditMode
}: TelephoneInputProps<TFieldValues>) => {
  const { control } = useFormContext()
  const defaultValue = control._defaultValues[name]
  const t = useTranslations('Vendor');

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
            rules={{ 
              // Explicitly set the required message using the translation
              required: required ? t('validation.phoneRequired') : false 
            }} 
            render={({ field, fieldState: {error} }) => (
              <div className="flex flex-col w-full" > 
                <div className={`flex w-full ${error ? 'border-red-500' : 'border-gray-200'} rounded-md border`}>
                  <PhoneInput
                    {...field}
                    id={name}
                    numberInputProps={{
                      className: "flex w-full cursor-pointer text-sm outline-2 placeholder:text-gray-500 border-none", 
                    }}  
                    international
                    defaultCountry="US"
                    placeholder={t("placeholderPhone")}
                  />
                </div>
                {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
              </div>
            )}
          />
        ):(
          <PhoneInput
            numberInputProps={{
              className:
                "flex w-full peer bg-gray-50 rounded-md border-none py-2 text-sm outline-2 placeholder:text-gray-500",
            }}
            disabled
            value={defaultValue}
            onChange={() => {}}
            international
            defaultCountry="US"
          />
        )}
      </div>
    </div>
  );
};

export default TelephoneInput;