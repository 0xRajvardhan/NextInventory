import { get } from "http";
import { CSSProperties, Fragment, ReactNode } from "react";
import { Controller, FieldValues, Path, useFormContext, useWatch } from "react-hook-form";

interface SplitButtonProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  placeholder?: string;
  labelText?: string;
  className?: string;
  labelClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  required?: boolean;
  trackByDate?: boolean;
  isEditMode: boolean;
  children?: (trackBy: boolean) => ReactNode; // Function returning content based on trackBy
}

const SplitButton = <TFieldValues extends FieldValues>({
  name,
  placeholder,
  labelText,
  className,
  labelClassName,
  style,
  labelStyle,
  required,
  isEditMode = false,
  trackByDate = false,
  children,
}: SplitButtonProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>();

  const trackBy = useWatch({
    name,
    control,
  });

  return (
    <Fragment>
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
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="flex w-full">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-s-lg ${
                  value === true ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => {onChange(true)}} // Set value to true
                disabled={!isEditMode}
              >
                Every
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-e-lg ${
                  value === false ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => onChange(false)} // Set value to false
                disabled={!isEditMode}
              >
                {trackByDate ? "On" : "At"}
              </button>
              {error && <span className="mt-2 text-sm text-red-600">{error.message}</span>}
            </div>
          )}
        />
        {/* Pass trackBy to children function */}
      </div>
      {children && children(trackBy)}
    </Fragment>

  );
};

export default SplitButton;
