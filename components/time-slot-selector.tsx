"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getAvailableSlotsForDate } from "@/lib/actions/interview.action";
import { InterviewSlot } from "@/types/firebase";

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  use24HourFormat: boolean;
}

export function TimeSlotSelector({
  selectedDate,
  selectedTime,
  onTimeSelect,
  use24HourFormat,
}: TimeSlotSelectorProps) {
  const [availableSlots, setAvailableSlots] = useState<InterviewSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available slots when the selected date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const slots = await getAvailableSlotsForDate(selectedDate);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError("Failed to load available time slots. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate]);

  // Format time based on 12/24 hour preference
  const formatTime = (time: string) => {
    if (use24HourFormat) return time;

    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Handle time slot selection
  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available) return;
    onTimeSelect(time);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-200">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
          })}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">24h</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm py-4 text-center">{error}</div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div className="absolute top-0 right-0 pointer-events-none h-8 w-full bg-gradient-to-b from-gray-900 to-transparent z-10"></div>

          {availableSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => handleTimeSelect(slot.time, slot.available)}
              disabled={!slot.available}
              className={cn(
                "w-full py-3 px-4 rounded-md text-left transition-colors",
                slot.available
                  ? "hover:bg-gray-700 cursor-pointer"
                  : "opacity-50 cursor-not-allowed",
                selectedTime === slot.time
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200"
              )}
              aria-selected={selectedTime === slot.time}
            >
              {formatTime(slot.time)}
            </button>
          ))}

          <div className="absolute bottom-0 right-0 pointer-events-none h-8 w-full bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
        </div>
      )}
    </div>
  );
}
