'use client'

import { CSSProperties } from 'react';
import {
  Controller,
  FieldValues,
  Path,
  useWatch,
  useFormContext
} from 'react-hook-form';
import { OptionsOrGroups, OptionProps, GroupBase, components } from 'react-select';
import AsyncSelect from "react-select/async";
import { fetchItems, fetchSelectItems2 } from "@/app/lib/data";

interface ItemOption {
  value: string
  name: string | null
  label: string
  quantity: number
  description: string | null
  reorderQuantity: number
  warehouse: string
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

interface ItemsAsyncSelectInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  warehouseId: string;
  arrayName: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  isEditMode?: boolean;
}

const ItemsAsyncSelectInput = <TFieldValues extends FieldValues>({
  name,
  warehouseId, 
  arrayName,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isEditMode = false,
}: ItemsAsyncSelectInputProps<TFieldValues>) => {
  const { control, getValues } = useFormContext<TFieldValues>();

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
      const groupedItems = await fetchItems(inputValue, warehouseId);
      console.log('groupedItems', groupedItems);
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

export default ItemsAsyncSelectInput;

