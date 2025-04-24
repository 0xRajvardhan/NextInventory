'use client'

import { CSSProperties } from 'react';
import {
  Controller,
  FieldValues,
  Path,
  useWatch,
  useFormContext,
  PathValue
} from 'react-hook-form';
import { OptionsOrGroups, OptionProps, GroupBase, components } from 'react-select';
import AsyncSelect from "react-select/async";
import { fetchSelectItemswithReceipt } from "@/app/lib/data";

interface ItemOption {
  value: string;
  label: string;
  description: string;
  vendor: string | null;
  location: string;
  quantity: number;
  unitType: string;
  unitCostDollar: number;
  unitCostVES: number;
}

const itemOption: React.FC<OptionProps<ItemOption, false>> = (props) => {
  return (
    <components.Option {...props}>
      <div>{props.data.label}</div>
      <div className="flex justify-between">
        <p className="text-gray-500">{props.data.description}</p>
        <p className="text-gray-500">{props.data.quantity} avail</p>
      </div>
    </components.Option>
  );
};

interface WorkOrderAsyncSelectInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  arrayName: Path<TFieldValues>;
  setValueName: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  isEditMode?: boolean;
  isDisabled?: boolean;
}

const WorkOrderAsyncSelectInput = <TFieldValues extends FieldValues>({
  name,
  arrayName,
  setValueName,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isEditMode = false,
  isDisabled = false,
}: WorkOrderAsyncSelectInputProps<TFieldValues>) => {
  const { control, getValues, setValue } = useFormContext<TFieldValues>();

  const defaultValue = getValues(name);
  
  const formItems = useWatch({
    name: arrayName as Path<TFieldValues>,
    control,
  })  as { item: ItemOption }[];

  // Load options with filtering applied
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<ItemOption, GroupBase<ItemOption>>> => {
    try {
      const groupedItems = await fetchSelectItemswithReceipt(inputValue, "");
      
      // Filter out parts already in `formItems`
      const filteredGroupedItems = Object.entries(groupedItems).reduce(
        (result, [warehouse, items]) => {
          const filteredItems = items.filter(
            (item) =>
              !formItems.some(
                (formItem) =>
                  formItem.item?.value === item.value
              )
          );
      
          if (filteredItems.length > 0) {
            return { ...result, [warehouse]: filteredItems };
          }
      
          return result;
        },
        {} as Record<string, ItemOption[]>
      );
      
      // Convert filtered groups into react-select format
      return Object.keys(filteredGroupedItems).map((warehouse) => ({
        label: warehouse,
        options: filteredGroupedItems[warehouse],
      }));
    } catch (error) {
      console.error("Error loading options:", error);
      return [];
    }
  };

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
      <div className="relative w-full">
        {isEditMode ? (
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full">
                <AsyncSelect
                  {...field} // React Hook Form field props
                  cacheOptions
                  placeholder={placeholder}
                  components={{ Option: itemOption }}
                  loadOptions={loadOptions}
                  isClearable={true}
                  isDisabled={isDisabled}
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption); // Updates the selected item
                    const unitCostField = `${name}.unitCostDollar` as Path<TFieldValues>;

                    if (selectedOption) {
                      // Dynamically generate the unit cost field name based on the provided `name`
                  
                      // Set the value dynamically
                      setValue(unitCostField, selectedOption.unitCostDollar as PathValue<TFieldValues, Path<TFieldValues>>);
                    } else {
                      // Clear the unit cost field if the selected item is cleared
                      setValue(unitCostField, 0 as PathValue<TFieldValues, typeof unitCostField>);
                    }
                  }}
                  
                  
                />
                {error && (
                  <span className="mt-2 text-sm text-red-600">
                    {error.message}
                  </span>
                )}
              </div>
            )}
          />
        ):(
          <div className="flex w-full">{defaultValue?.label} </div>
        )}

      </div>
    </div>
  );
};

export default WorkOrderAsyncSelectInput;
