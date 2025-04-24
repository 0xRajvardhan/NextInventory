import { MeterReading, StatusType } from "@prisma/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PurchaseOrderFormValues, PurchaseOrderItemsFormValues} from "@/app/lib/definitions";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export function formatPhone(phone: string, country: CountryCode = 'US'): string {
  const parsed = parsePhoneNumberFromString(phone, country);

  if (parsed) {
    return parsed.formatInternational(); // e.g., +1 720 267 6767
  }

  return phone; // fallback if not valid
}

export function formatCurrency(
  value: number,
  currency: 'USD' | 'VES'
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'VES',
    minimumFractionDigits: 2, // Ensures two decimal places
    maximumFractionDigits: 2, // Ensures two decimal places
  });

  return formatter.format(value);
}

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US"
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const capitalizeEveryFirstLetter = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const calculateLineTotal = (item: any) => {
  return (item.unitCostDollar || 0) * (item.qtyOrdered || 0);
};

export const calculateSubtotal = (
  formValues: PurchaseOrderItemsFormValues["receipts"] | undefined
) => {
  return (
    formValues?.reduce(
      (acc, current) => acc + calculateLineTotal(current),
      0
    ) || 0
  );
};

export function formatLabel(label: string): string {
  return label.replace(/_/g, ' '); // Replaces all underscores with spaces
}

// Function to generate the array of { value, label } objects
export function enumToOptions<T extends object>(enumObj: T): { value: string; label: string }[] {
  return Object.values(enumObj).map((value) => ({
    value: value as string,
    label: formatLabel(value) as string,
  }));
}

export function getNextDueDateFromArray(dueByDates: Date[], currentDate: Date): Date {
  // Sort the dates in ascending order and return the first upcoming date
  const sortedDates = dueByDates.sort((a, b) => a.getTime() - b.getTime());
  for (const date of sortedDates) {
    if (date > currentDate) {
      return date;
    }
  }
  // If all dates are in the past, return the latest date
  return sortedDates[sortedDates.length - 1];
};

export function getNextDueValueFromArray(dueValues: number[], currentValue: number): number {
  // Sort the values in ascending order and return the first upcoming value
  const sortedValues = dueValues.sort((a, b) => a - b);
  for (const value of sortedValues) {
    if (value > currentValue) {
      return value;
    }
  }
  // If all values are in the past, return the latest value
  return sortedValues[sortedValues.length - 1];
};

export function calculateDaysUntilDue({
  dueByDates = [], // Array of specific due dates
  nextDueDate, // Single specific due date
  lastPerformedDate,
  advanceNotice,
  taskType
}: {
  dueByDates?: Date[]; // Array of specific due dates
  nextDueDate?: Date | null; // Single specific due date
  lastPerformedDate?: Date | null; // Optional for cases with a recurring interval
  advanceNotice: number;
  taskType: "Repair" | "Recurring";
}): { message: string; color: string } {

  let selectedDueDate: Date | undefined;

  if (taskType === "Repair") {
    selectedDueDate = nextDueDate || dueByDates[0]; // Use single due date if available, otherwise take the first from the array
  } else {
    if (!lastPerformedDate) {
      throw new Error("lastPerformedDate must be provided for Recurring tasks.");
    }

    if (nextDueDate) {
      selectedDueDate = nextDueDate; // Use nextDueDate if provided
    } else if (dueByDates.length > 0) {
      selectedDueDate = getNextDueDateFromArray(dueByDates, lastPerformedDate);
    } else {
      throw new Error("Either nextDueDate or dueByDates must be provided.");
    }
  }

  if (!selectedDueDate) {
    throw new Error("A valid due date could not be determined.");
  }

  const dateToday = new Date();
  dateToday.setHours(0, 0, 0, 0); // Reset time to midnight

  // Calculate the difference in time
  const timeDiff = selectedDueDate.getTime() - dateToday.getTime();
  const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let message: string;
  let color: string;

  if (daysUntilDue > advanceNotice) {
    message = `in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`;
    color = "text-green-500";
  } else if (daysUntilDue > 0 && daysUntilDue <= advanceNotice) {
    message = `in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`;
    color = "text-yellow-500";
  } else if (daysUntilDue === 0) {
    message = "today";
    color = "text-red-500";
  } else {
    message = `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? "s" : ""} ago`;
    color = "text-red-500";
  }

  return { message, color };
}

export function calculateMeterUntilDue({
  nextDueValues = [],
  nextDueValue,
  currentValue,
  lastPerformedValue,
  advanceNotice,
  unit
}: {
  nextDueValues?: number[]; // Accepts array of due values
  nextDueValue?: number | null; // Single due value
  currentValue: number;
  lastPerformedValue: number | null;
  advanceNotice: number;
  unit: MeterReading;
}): { message: string; color: string } {
  
  let closestDueValue: number;

  if (nextDueValue !== null && nextDueValue !== undefined) {
    closestDueValue = nextDueValue; // Use the single due value if provided
  } else if (nextDueValues.length > 0) {
    closestDueValue = getNextDueValueFromArray(nextDueValues, lastPerformedValue ?? 0);
  } else {
    throw new Error("Either nextDueValue or nextDueValues must be provided.");
  }

  const valueUntilDue = closestDueValue - currentValue;

  // Determine whether to use singular or plural form of the unit
  const unitLabel = Math.abs(valueUntilDue) === 1 ? unit.slice(0, -1) : unit;

  if (valueUntilDue > advanceNotice) {
    return { message: `in ${valueUntilDue.toLocaleString("en-US")} ${unitLabel}`, color: 'text-green-500' };
  } else if (valueUntilDue > 0 && valueUntilDue <= advanceNotice) {
    return { message: `in ${valueUntilDue.toLocaleString("en-US")} ${unitLabel}`, color: 'text-yellow-500' };
  } else if (valueUntilDue === 0) {
    return { message: 'due now', color: 'text-red-500' };
  } else {
    return { message: `${Math.abs(valueUntilDue).toLocaleString("en-US")} ${unitLabel} ago`, color: 'text-red-500' };
  }
}

// Function to calculate next due as Date
export function calculateNextDueDate({
  lastPerformed,
  interval,
}:{
  lastPerformed: Date | null;
  interval: number | null;
}): Date[] {
  if (!lastPerformed || !interval) {
    return [];
  }

  return [
    new Date(
      new Date(lastPerformed).getTime() + interval * 24 * 60 * 60 * 1000
    ),
  ];
};

export function calculateNextDueTimestamp({
  lastPerformed,
  interval,
}: {
  lastPerformed: Date | null | undefined;
  interval: number | null | undefined;
}): Date | null {
  if (!lastPerformed || !interval) {
    return null;
  }

  return new Date(lastPerformed.getTime() + interval * 24 * 60 * 60 * 1000);
}

// Function to calculate next due as a number
export function calculateNextDueNumber({
  lastPerformed,
  interval,
}:{
  lastPerformed: number | null;
  interval: number | null;
}): number[] {

  // Ensure both lastPerformed and interval are non-null
  if (lastPerformed != null && interval != null) {
    return [lastPerformed + interval];
  }

  return [];
};

export function calculateNextDueNumber2({
  lastPerformed,
  interval,
}: {
  lastPerformed: number | null;
  interval: number | null;
}): number | null {
  // Ensure both lastPerformed and interval are non-null
  if (lastPerformed != null && interval != null) {
    return lastPerformed + interval;
  }

  return null; // Return null if values are missing
}

export function determinePOStatus(
  receipts: PurchaseOrderItemsFormValues['receipts'],
  previousStatus: StatusType
): StatusType {
  const allItemsReceived = receipts.every(receipt => receipt.qtyReceived === receipt.qtyOrdered);
  const noItemsReceived = receipts.every(receipt => receipt.qtyReceived === 0);

  if (noItemsReceived) {
    // If no items received, keep status as 'Ordered' if it was previously ordered.
    return previousStatus === 'Ordered' ? 'Ordered' : 'Requisition';
  }
  if (allItemsReceived) return 'Received';
  return 'Received_Partial';
}


