"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(selectedDate)
  );
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([]);

  // Generate calendar days for the current month
  useEffect(() => {
    const days: Array<Date | null> = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay();

    // Fill in the days from the previous month
    for (let i = 0; i < dayOfWeek; i++) {
      days.push(null);
    }

    // Fill in the days of the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    setCalendarDays(days);
  }, [currentMonth]);

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Format the month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Check if a date is the currently selected date
  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if a date is within the allowed range
  const isDateInRange = (date: Date) => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return false;
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;

    return true;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!date || !isDateInRange(date)) return;
    onDateSelect(date);
  };

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-gray-300" />
        </button>
        <h2 className="text-sm font-medium text-gray-200">
          {formatMonthYear(currentMonth)}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-gray-300" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            onClick={() => date && handleDateClick(date)}
            disabled={!date || !isDateInRange(date)}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm",
              !date && "cursor-default",
              date && isDateInRange(date) && "hover:bg-blue-600 cursor-pointer",
              date && isSelectedDate(date) && "bg-blue-600 text-white",
              date &&
                !isDateInRange(date) &&
                "text-gray-600 cursor-not-allowed",
              date &&
                !isSelectedDate(date) &&
                isDateInRange(date) &&
                "text-gray-200"
            )}
            aria-label={date ? date.toLocaleDateString() : "Empty day"}
            aria-selected={date ? isSelectedDate(date) : undefined}
          >
            {date ? date.getDate() : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
