import { CSSProperties, useEffect } from 'react';
import { Control, Controller, FieldValues, Path,FieldErrors, useFormContext } from 'react-hook-form';
import { NumericFormat, NumberFormatValues } from "react-number-format";
import { Progress } from 'flowbite-react';

interface ProgressBarProps<TFieldValues extends FieldValues> {
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

const ProgressBar = <TFieldValues extends FieldValues>({
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
}: ProgressBarProps<TFieldValues>) => {
   // Use useFormContext to watch the specified field array.
  // This assumes that the field is an array of objects with a boolean `completed` property.
  const { watch } = useFormContext();
  const items = watch(name) as Array<{ completed?: boolean }> || [];

  // Calculate total number of items and how many are completed.
  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;

  // Calculate progress percentage.
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;


  return (
    <div className="flex flex-col gap-2">
      <div className="text-base text-sm font-medium dark:text-white">{labelText}</div>
      <Progress progress={progress} size="md" color="green" />
    </div>
  );
};

export default ProgressBar;