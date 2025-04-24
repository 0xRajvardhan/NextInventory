'use client';

import { CSSProperties } from 'react';
import {
  Controller,
  FieldValues,
  Path,
  useFormContext
} from 'react-hook-form';
import { OptionsOrGroups, GroupBase, components } from 'react-select';
import AsyncSelect from 'react-select/async';
import { fetchWorkOrderTasksByEquipmentId2 } from '@/app/lib/data';
import { WorkOrderFormValues } from '@/app/lib/definitions';
interface TaskOption {
  id: string;
  taskType: string;
  task: {
    value: string | null;
    label: string | null;
  };
  parts: any[];
  labor: any[];
  completed: boolean;
}

import { OptionProps } from 'react-select';

// Now properly type the props
const TaskOptionComponent = (props: OptionProps<WorkOrderFormValues['tasks'][number], false>) => {
  return (
    <components.Option {...props}>
      <div>{props.data.task?.task?.label}</div>
    </components.Option>
  );
};

interface WorkOrderAsyncSelectInputProps<TFieldValues extends FieldValues> {
  equipmentId: string;
  name: Path<TFieldValues>;
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
  equipmentId,
  name,
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
  const { control, getValues } = useFormContext<TFieldValues>();

  const defaultValue = getValues(name);

  // Load options with grouping
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<WorkOrderFormValues['tasks'][number], GroupBase<WorkOrderFormValues['tasks'][number]>>> => {
    try {

      console.log("equipmentId", equipmentId);
      console.log("inputValue", inputValue);
      const groupedTasks = await fetchWorkOrderTasksByEquipmentId2(inputValue, equipmentId);
      
      console.log('Grouped tasks:', groupedTasks);
      // Filter out options where label is null
      const filteredGroups = groupedTasks.map(group => ({
        ...group,
        options: group.options.filter(option => option.task?.task?.label != null),
      }));
  
      return filteredGroups;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  };
  


  return (
    <div className={className} style={style}>
      <div className={labelClassName}>
        {required && <p className="text-red-500">*</p>}
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
                  {...field} // spread the field to wire up onBlur, name, ref, etc.
                  value={!field.value || !field.value.task?.task?.label ? null : field.value}
                  cacheOptions
                  placeholder={placeholder}
                  components={{ Option: TaskOptionComponent }}
                  loadOptions={loadOptions}
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption);
                    console.log('Selected option:', selectedOption);
                  }}
                  getOptionLabel={(option) => option?.task?.task?.label ?? ''}
                  getOptionValue={(option) => option.id}
                  isClearable={true}
                  isDisabled={isDisabled}
                />
                {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
              </div>
            )}
          />
        ) : (
          <div className="flex w-full">{defaultValue?.task?.label}</div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderAsyncSelectInput;
