'use client'

import React, { CSSProperties, useState } from 'react';
import { Popover, Button } from 'flowbite-react';
import { useFormContext, FieldValues, Path, PathValue, Controller } from 'react-hook-form';
import { formatCurrency } from '@/app/lib/utils';
import { NumericFormat, NumberFormatValues } from "react-number-format";

interface PopoverInputProps<TFieldValues extends FieldValues, TSaveData = unknown> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  unitLabel?: string;
  popClassName?: string;
  className?: string;
  labelClassName?: string;
  pClasslassName?: string;
  controllerClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  prefix?: boolean;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  isAllowed?: (values: NumberFormatValues) => boolean;
  isEditMode: boolean;
  onSave: (value: number) => Promise<{ success: boolean; message: string }>;
  /**
   * Determines how to display the value:
   * - "number" for a plain number (default),
   * - "currency" for formatted currency,
   * - "percentage" for a percentage.
   */
  displayType?: 'number' | 'currency' | 'percentage';
  children?: React.ReactNode;
  triggerContent?: React.ReactNode;
}

const PopoverInput = <TFieldValues extends FieldValues>({
  name,
  labelText,
  unitLabel,
  popClassName = "flex flex-col bg-gray-200 rounded-lg shadow-lg p-6 max-w-xs",
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
  isEditMode,
  onSave,
  displayType = 'number',
  children,
  triggerContent,
}: PopoverInputProps<TFieldValues>) => {
  const { getValues, control, setValue, clearErrors } = useFormContext<TFieldValues>();

  const [isOpen, setIsOpen] = useState(false);
  const value = getValues(name) as PathValue<TFieldValues, Path<TFieldValues>>;
  const [draftValue, setDraftValue] = useState<number>(value);

  const handleSave = async () => {
    try {
      setValue(name, draftValue as PathValue<TFieldValues, Path<TFieldValues>>);
      const result = await onSave(draftValue);
      if (result.success) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error updating value:', error);
    }
  };

  let displayValue: string;
  if (displayType === 'percentage') {
    displayValue = `${value.toFixed(1)}%`;
  } else if (displayType === 'currency') {
    displayValue = formatCurrency(value, 'USD');
  } else {
    // Default to a plain number
    displayValue = value.toLocaleString('en-US');
  }

  const triggerElement = triggerContent ? (
    <button
      onClick={() => setIsOpen(true)}
      className="pl-2 pt-2 text-sm font-medium text-blue-500"
    >
      {triggerContent}
    </button>
  ) : (
    <div
      onClick={() => setIsOpen(true)}
      className="cursor-pointer text-blue-600 inline-block"
    >
      {displayValue}
    </div>
  );

  return (
    <Popover
      content={
        <div className={popClassName}>
          {children}
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
              <Controller
                name={name}
                control={control}
                render={({ field: { ref }, fieldState: { error } }) => (
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
                        thousandSeparator=","
                        value={draftValue}
                        onValueChange={(values: NumberFormatValues) => {
                          setDraftValue(values.floatValue ?? 0);
                        }}
                        getInputRef={ref}
                      />
                    </div>
                    {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
                  </div>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              color="gray"
              onClick={() => {
                setIsOpen(false);
                setDraftValue(value);
                clearErrors(name);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      }
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      {triggerElement}
    </Popover>
  );
};

export default PopoverInput;
