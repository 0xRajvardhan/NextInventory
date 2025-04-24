'use client'
import React, { CSSProperties } from 'react';
import { RecurringTaskFormValues } from '@/app/lib/definitions';
import { calculateDaysUntilDue, calculateMeterUntilDue } from "@/app/lib/utils";

interface TaskDueInfoProps {
  task: RecurringTaskFormValues['taskTracking'];
  equipment: {
    primaryMeterReading: number | null;
    secondaryMeterReading: number | null;
  };
  className?: string;
  style?: CSSProperties;
}

export const TaskDueComponent = ({
  task,
  equipment = { primaryMeterReading: 0, secondaryMeterReading: 0 },
  className,
  style,
}: TaskDueInfoProps) => {
  if (!task) return null; // Ensure task is not null

  let results: { message: string; color: string }[] = [];

  // Condition 1: Repair Task
  if (task.repairTaskId) {
    results.push(
      calculateDaysUntilDue({
        nextDueDate: task.dateNextDue,
        lastPerformedDate: task.dateLastPerformed,
        advanceNotice: 0,
        taskType: "Repair",
      })
    );
  }

  // Condition 2: Tracking by Date
  if (task.trackByDate) {
    results.push(
      calculateDaysUntilDue({
        ...(task.trackByDateEvery
          ? { nextDueDate: task.dateNextDue }
          : { dueByDates: task.DateNextDue?.map(d => new Date(d.dateNextDue)) ?? [] }),
        lastPerformedDate: task.dateLastPerformed,
        advanceNotice: task.dateAdvanceNotice ?? 0,
        taskType: "Recurring",
      })
    );
  }

  // Condition 3: Tracking by Primary Meter
  if (task.trackByPrimary) {
    results.push(
      calculateMeterUntilDue({
        currentValue: equipment.primaryMeterReading ?? 0,
        lastPerformedValue: task.primaryLastPerformed,
        ...(task.trackByPrimaryEvery
          ? { nextDueValue: task.primaryNextDue }
          : { nextDueValues: task.PrimaryNextDue.map(meter => meter.primaryNextDue) }),
        advanceNotice: task.primaryAdvanceNotice ?? 0,
        unit: task.primaryMeterType ?? "None",
      })
    );
  }

  // Condition 4: Tracking by Secondary Meter
  if (task.trackBySecondary) {
    results.push(
      calculateMeterUntilDue({
        currentValue: equipment.secondaryMeterReading ?? 0,
        lastPerformedValue: task.secondaryLastPerformed,
        ...(task.trackBySecondaryEvery
          ? { nextDueValue: task.secondaryNextDue }
          : { nextDueValues: task.SecondaryNextDue.map(meter => meter.secondaryNextDue) }),
        advanceNotice: task.secondaryAdvanceNotice ?? 0,
        unit: task.secondaryMeterType ?? "None",
      })
    );
  }

  return (
    <div className={className} style={style}>
      <span className="font-medium">
        due{" "}
        {results.map((result, index) => (
          <span key={index} className={result.color}>
            {result.message} {index < results.length - 1 && "/ "}
          </span>
        ))}
      </span>
    </div>
  );
};
