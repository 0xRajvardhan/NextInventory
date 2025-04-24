'use client'
import React, { CSSProperties, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  defaultValue: string;
  options: Option[];
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  onChange?: (newValue: string | null) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({
  defaultValue,
  options,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  onChange,
}) => {

  console.log(options);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.target.value;
      if (onChange) {
        onChange(selectedValue !== '' ? selectedValue : null);
      }
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('page', '1');
      if (selectedValue) {
        newSearchParams.set('warehouse', selectedValue);
      } else {
        newSearchParams.delete('warehouse');
      }
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    [onChange, router, pathname]
  );
  return (
    <div className={className} style={style}>
      <div className={labelClassName}>
        {required && <p className="text-red-500"><span>*</span></p>}
        {labelText && (
          <label style={labelStyle}>
            {labelText}
          </label>
        )}
      </div>
      <div className="relative w-full">
        <select
          className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
          onChange={handleChange}
        >
          <option value="">{defaultValue}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectInput;
