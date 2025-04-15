"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Video, ChevronDown } from "lucide-react";
import { DatePicker } from "./ui/date-picker";
import { TimeSlotSelector } from "./time-slot-selector";
import { createInterview } from "@/lib/actions/interview.action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define interview types and their descriptions
const INTERVIEW_TYPES = {
  "Job Prep Interview":
    "For professionals seeking to refine their interview preparation skills before a job interview.",
  "Presentation Prep Interview":
    "For startup founders and other professionals preparing for a startup pitch deck, class presentation, or speech proofreading.",
};

type InterviewType = keyof typeof INTERVIEW_TYPES;

interface ScheduleInterviewProps {
  userId: string;
  userName: string;
  interviewTitle?: string;
  description?: string;
  platform?: string;
  duration?: number;
  onBack?: () => void;
  onSuccess?: (
    interviewType: string,
    selectedDate: Date,
    selectedTime: string
  ) => void;
}

export function ScheduleInterview({
  userId,
  userName,
  interviewTitle = "Quick Catch-Up",
  description = "Let's connect and discuss your project, ideas, or any challenges you're facing",
  platform = "Ireme AI",
  duration = 30,
  onBack,
  onSuccess,
}: ScheduleInterviewProps) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [use24HourFormat, setUse24HourFormat] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New state for interview type
  const [selectedInterviewType, setSelectedInterviewType] =
    useState<InterviewType>("Job Prep Interview");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Initialize the date to the next available day (not today)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setSelectedDate(tomorrow);
  }, []);

  // Toggle between 12h and 24h time format
  const toggleTimeFormat = () => {
    setUse24HourFormat(!use24HourFormat);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection when date changes
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Handle interview type selection
  const handleInterviewTypeSelect = (type: InterviewType) => {
    setSelectedInterviewType(type);
    setIsDropdownOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and time");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const interview = await createInterview({
        title: `${selectedInterviewType} for ${userName}`,
        userId: userId,
        userName: userName,
        description: INTERVIEW_TYPES[selectedInterviewType],
        finalized: false,
      });
      console.log(interview);

      toast.success("Interview Scheduled", {
        description: `Your ${selectedInterviewType.toLowerCase()} has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });

      if (onSuccess) {
        onSuccess(selectedInterviewType || "", selectedDate, selectedTime);
      } else {
        // Default behavior if no success handler is provided
        router.push(`/schedule`);
      }
    } catch (err: any) {
      console.error("Error scheduling interview:", err);
      setError(
        err.message || "Failed to schedule interview. Please try again."
      );

      toast.error("An Error Occurred", {
        description:
          err.message || "Failed to schedule interview. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 rounded-lg shadow-xl overflow-hidden max-w-4xl w-full mx-auto">
      <div className="relative">
        {/* "NEW" badge */}
        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold py-1 px-3 transform rotate-45 translate-x-8 translate-y-6">
          NEW!
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left panel - Interview details */}
        <div className="p-6 bg-gray-800 md:w-1/3">
          <button
            onClick={onBack}
            className="mb-6 text-gray-400 hover:text-white flex items-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>

          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-1">{userName}</p>
            <h2 className="text-xl font-semibold mb-2">{interviewTitle}</h2>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>

          <div className="flex items-center mb-4 text-gray-300">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{duration} Minutes</span>
          </div>

          <div className="flex items-center text-gray-300">
            <Video className="h-4 w-4 mr-2" />
            <span className="text-sm">{platform}</span>
          </div>
        </div>

        {/* Right panel - Date and time selection */}
        <div className="p-6 md:w-2/3 md:border-l border-gray-700">
          <h1 className="text-xl font-semibold mb-6 text-center">
            Select a Date & Time
          </h1>

          {/* Interview Type Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interview Type
            </label>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={toggleDropdown}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <span>{selectedInterviewType}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                  {Object.keys(INTERVIEW_TYPES).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                      onClick={() =>
                        handleInterviewTypeSelect(type as InterviewType)
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interview Type Description */}
            <div className="mt-2 text-sm text-gray-400 bg-gray-800/50 p-3 rounded-md">
              {INTERVIEW_TYPES[selectedInterviewType]}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date picker */}
            <div>
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>

            {/* Time slot selector */}
            <div className="relative">
              <div className="flex justify-end mb-2">
                <button
                  onClick={toggleTimeFormat}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-3 rounded-md transition-colors"
                  aria-label={
                    use24HourFormat
                      ? "Switch to 12-hour format"
                      : "Switch to 24-hour format"
                  }
                >
                  {use24HourFormat ? "12h" : "24h"}
                </button>
              </div>

              <TimeSlotSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
                use24HourFormat={use24HourFormat}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Scheduling...</span>
                </div>
              ) : (
                "Schedule Interview"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
