import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import InterviewClient from "./client";

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: { selectedDate?: string; selectedTime?: string };
}) {
  // Fetch user data on the server
  const user = await currentUser();

  if (!user) {
    // Handle unauthenticated users
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please sign in to schedule an interview</p>
          <a href="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Extract search parameters
  const selectedDate = searchParams.selectedDate;
  const selectedTime = searchParams.selectedTime;

  // Pass server-fetched user data and search params to client component
  return (
    <Suspense
      fallback={
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
      }
    >
      <InterviewClient
        user={{
          id: user.id,
          username: user.username || user.firstName || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
        }}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </Suspense>
  );
}
