import { RecurringTaskFormValues } from '@/app/lib/definitions';
import { calculateDaysUntilDue, calculateMeterUntilDue } from "@/app/lib/utils";

interface EquipmentReadings {
  primaryMeterReading: number | null;
  secondaryMeterReading: number | null;
}

export function isTaskDue(task: RecurringTaskFormValues['taskTracking'], equipment: EquipmentReadings = { primaryMeterReading: 0, secondaryMeterReading: 0 }): boolean {
  if (!task) return false;

  let isDue = false;

  // Condition 1: Repair Task
  if (task.repairTaskId) {
    const { color } = calculateDaysUntilDue({
      nextDueDate: task.dateNextDue,
      lastPerformedDate: task.dateLastPerformed,
      advanceNotice: 0,
      taskType: "Repair",
    });

    if (color !== "text-green-500") isDue = true;
  }

  // Condition 2: Tracking by Date
  if (task.trackByDate) {
    const { color } = calculateDaysUntilDue({
      ...(task.trackByDateEvery
        ? { nextDueDate: task.dateNextDue }
        : { dueByDates: task.DateNextDue?.map(d => new Date(d.dateNextDue)) ?? [] }),
      lastPerformedDate: task.dateLastPerformed,
      advanceNotice: task.dateAdvanceNotice ?? 0,
      taskType: "Recurring",
    });

    if (color !== "text-green-500") isDue = true;
  }

  // Condition 3: Tracking by Primary Meter
  if (task.trackByPrimary) {
    const { color } = calculateMeterUntilDue({
      currentValue: equipment.primaryMeterReading ?? 0,
      lastPerformedValue: task.primaryLastPerformed,
      ...(task.trackByPrimaryEvery
        ? { nextDueValue: task.primaryNextDue }
        : { nextDueValues: task.PrimaryNextDue.map(meter => meter.primaryNextDue) }),
      advanceNotice: task.primaryAdvanceNotice ?? 0,
      unit: task.primaryMeterType ?? "None",
    });

    if (color !== "text-green-500") isDue = true;
  }

  // Condition 4: Tracking by Secondary Meter
  if (task.trackBySecondary) {
    const { color } = calculateMeterUntilDue({
      currentValue: equipment.secondaryMeterReading ?? 0,
      lastPerformedValue: task.secondaryLastPerformed,
      ...(task.trackBySecondaryEvery
        ? { nextDueValue: task.secondaryNextDue }
        : { nextDueValues: task.SecondaryNextDue.map(meter => meter.secondaryNextDue) }),
      advanceNotice: task.secondaryAdvanceNotice ?? 0,
      unit: task.secondaryMeterType ?? "None",
    });

    if (color !== "text-green-500") isDue = true;
  }

  return isDue;
}
