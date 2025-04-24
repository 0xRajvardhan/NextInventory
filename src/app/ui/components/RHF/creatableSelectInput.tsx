import { CSSProperties } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext
} from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { GroupBase, OptionsOrGroups } from "react-select";
import { useState } from "react";
interface Option {
  value: string;
  label: string;
}

interface CreatableSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  options: OptionsOrGroups<Option, GroupBase<Option>>; // Updated to use OptionsOrGroups type
  placeholder?: string;
  labelText?: string; // Optional label text
  className?: string; // Optional class name for the wrapper div
  labelClassName?: string; // Optional class name for the label
  style?: CSSProperties; // Optional style object for the wrapper div
  labelStyle?: CSSProperties; // Optional style object for the label
  required?: boolean; // Indicates if the input is required
  onSelectChange?: (option: Option | null) => void; // Type for onSelectChange
  isObject?: boolean; // New prop to decide between object and string
  isEditMode: boolean; // New prop to decide between Controller and p tag
}

const CreatableSelectInput = <TFieldValues extends FieldValues>({
  name,
  options,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required = false,
  isObject = true, // Default to using object
  isEditMode, // Default to using the Controller
  onSelectChange
}: CreatableSelectProps<TFieldValues>) => {

  const { control } = useFormContext();

 // Get default value from the control
 const defaultValue = control._defaultValues[name];

 // Find option value, return null if not found
 const findOptionValue = (value: string | undefined) => {
   if (!value) return null;
   for (const optionOrGroup of options) {
     if ("options" in optionOrGroup) {
       // This is a group
       const foundOption = optionOrGroup.options.find(
         (option) => option.value === value
       );
       if (foundOption) return foundOption;
     } else {
       // This is a single option
       if (optionOrGroup.value === value) return optionOrGroup;
     }
   }
   return null;
 };

  const [value, setValue] = useState<Option | null>(findOptionValue(defaultValue));

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
            render={({ field: { onChange, ref }, fieldState: { error }}) => (
              <>
                <CreatableSelect
                  inputId={name} // Ensures it can be linked to a label via htmlFor
                  instanceId={name}
                  placeholder={placeholder}
                  isClearable={true}
                  menuPosition="fixed"
                  options={options}
                  defaultValue={defaultValue}
                  onChange={(selectedOption) => {
                    if (!selectedOption) {
                      // User cleared the field
                      setValue(null); // Set the form state to null
                      isObject ? onChange({value: "", label: ""}) : "";
                    } else {
                      isObject? onChange(selectedOption) : onChange(selectedOption.value); // Set the form state to the selected option
                      setValue(selectedOption);
                    }
                  }}
                  value={
                    isObject
                      ? (options as Option[]).find((option) => option.value === value?.value)
                      : value
                  }
                  ref={ref}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      fontSize: "14px", // Change the font size here
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      fontSize: "14px", // Change the font size here
                    }),
                    option: (baseStyles) => ({
                      ...baseStyles,
                      fontSize: "14px", // Change the font size here
                    }),
                  }}
                />
                { error && <span className="mt-2 text-sm text-red-600">{error.message}</span> }
              </>
            )}
          />
        ):(
          <p className="py-2 text-sm">{defaultValue || '-'}</p>
        )}
      </div>
    </div>
  );
};

export default CreatableSelectInput;
