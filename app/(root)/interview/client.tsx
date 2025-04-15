"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Agent from "@/components/Agent";

interface InterviewClientProps {
  user: {
    id: string;
    username: string;
    email: string;
  };
  selectedDate?: string;
  selectedTime?: string;
}

export default function InterviewClient({
  user,
  selectedDate,
  selectedTime,
}: InterviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use search params from props or from the URL
  const date = selectedDate || searchParams.get("selectedDate") || "";
  const time = selectedTime || searchParams.get("selectedTime") || "";
  const interviewType = searchParams.get("interviewType") || "";

  // Handle successful completion
  const handleSuccess = (interviewId: string) => {
    // Construct URL with search parameters
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (interviewType) params.set("type", interviewType);
    params.set("interviewId", interviewId);

    // Redirect to feedback page with parameters
    router.push(`/interview?${params.toString()}`);
  };

  return (
    <Agent
      userName={user.username}
      userId={user.id}
      selectedTime={time}
      interviewType={interviewType}
      selectedDate={date}
      type="generate"
      onSuccess={handleSuccess}
    />
  );
}
