import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { auth } from "@clerk/nextjs/server";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

// Radix UI
import * as AlertDialog from "@radix-ui/react-alert-dialog";

export default async function Home() {
  const { userId } = await auth();
  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(userId || ""),
    getLatestInterviews({ userId: userId || "" }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  const interviewLimitReached = userInterviews?.length! >= 2;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          {interviewLimitReached ? (
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <Button className="btn-primary max-sm:w-full">
                  Start an Interview
                </Button>
              </AlertDialog.Trigger>

              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
                <AlertDialog.Content className="fixed top-[50%] left-[50%] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg">
                  <AlertDialog.Title className="text-lg font-semibold mb-2 text-black">
                    Thanks for your enthusiasm!
                  </AlertDialog.Title>
                  <AlertDialog.Description className="mb-4 text-sm text-gray-600">
                    We’ve limited the number of interviews for free users to
                    just 2. If you'd like to do more, please subscribe or leave
                    us some feedback!
                  </AlertDialog.Description>

                  <div className="flex justify-end gap-3">
                    <Button asChild className="btn-primary">
                      <Link
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdFeUGJO-8XB-LgvnS4JqDrYq32MWdSPAJaBhjsn7rG4BmLEw/viewform"
                        target="_blank"
                      >
                        Subscribe
                      </Link>
                    </Button>
                    <Button asChild className="btn-seconday">
                      <Link
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfTkcH87w5UXrnWFVnl0zeghoage5hjp_Wgta7LrixlwPL2eg/viewform"
                        target="_blank"
                      >
                        Give Feedback
                      </Link>
                    </Button>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          ) : (
            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/schedule">Start an Interview</Link>
            </Button>
          )}
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={userId || ""}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>
    </>
  );
}
