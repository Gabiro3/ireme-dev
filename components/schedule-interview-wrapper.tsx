"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleInterview } from "@/components/schedule-interview";

interface ScheduleInterviewWrapperProps {
  userId: string;
  userName: string;
  interviewTitle?: string;
  description?: string;
}

export function ScheduleInterviewWrapper({
  userId,
  userName,
  interviewTitle,
  description,
}: ScheduleInterviewWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract any existing search parameters
  const redirectUrl = searchParams.get("redirectUrl");

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleSuccess = (
    interviewType: string,
    selectedDate: Date,
    selectedTime: string
  ) => {
    const params = new URLSearchParams();
    params.set("selectedDate", selectedDate.toISOString());
    params.set("selectedTime", selectedTime);
    params.set("interviewType", interviewType);

    const targetUrl = redirectUrl || `/interview?${params.toString()}`;
    router.push(targetUrl);
  };

  return (
    <ScheduleInterview
      userId={userId}
      userName={userName}
      interviewTitle={interviewTitle}
      description={description}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}
