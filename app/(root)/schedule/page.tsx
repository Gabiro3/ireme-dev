import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { ScheduleInterviewWrapper } from "@/components/schedule-interview-wrapper";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  // Get authenticated user ID from Clerk
  const user = await currentUser();

  if (!user?.id) {
    // Redirect unauthenticated users to sign in
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <ScheduleInterviewWrapper
        userId={user.id}
        userName={user.username || "User"}
      />
    </div>
  );
}
