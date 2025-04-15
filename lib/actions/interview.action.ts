"use server";

import { db } from "@/firebase/admin";
import type {
  Interview,
  GetLatestInterviewsParams,
  InterviewSlot,
} from "@/types/firebase";
import {
  Timestamp,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";

/**
 * Get an interview by its ID
 * @param id The interview ID
 * @returns The interview data or null if not found
 */
export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    // Input validation
    if (!id) throw new Error("Interview ID is required");

    const interviewRef = db.collection("interviews").doc(id);
    const interview = await interviewRef.get();

    if (!interview.exists) {
      return null;
    }

    // Convert Firestore Timestamp to ISO string for consistent data format
    const data = interview.data();
    return {
      id: interview.id,
      ...data,
      createdAt:
        data?.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data?.createdAt,
      updatedAt:
        data?.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data?.updatedAt,
    } as Interview;
  } catch (error) {
    console.error("Error getting interview by ID:", error);
    throw new Error(`Failed to get interview: ${error}`);
  }
}

/**
 * Get interviews by user ID
 * @param userId The user ID
 * @returns Array of interviews or null if none found
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    // Input validation
    if (!userId) throw new Error("User ID is required");

    const interviewsQuery = db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    const interviews = await interviewsQuery.get();

    if (interviews.empty) {
      return [];
    }

    // Map and format the interview data
    return interviews.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      } as Interview;
    });
  } catch (error) {
    console.error("Error getting interviews by user ID:", error);
    throw new Error(`Failed to get interviews: ${error}`);
  }
}

/**
 * Get latest interviews with pagination and filtering
 * @param params Parameters for filtering and limiting results
 * @returns Array of interviews or null if none found
 */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  try {
    const { userId, limit = 20 } = params;

    // Input validation
    if (!userId) throw new Error("User ID is required");
    if (limit <= 0 || limit > 100)
      throw new Error("Limit must be between 1 and 100");

    const query: Query = db
      .collection("interviews")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .orderBy("userId") // Required for inequality filter
      .orderBy("createdAt", "desc")
      .limit(limit);

    const interviews = await query.get();

    if (interviews.empty) {
      return [];
    }

    // Map and format the interview data
    return interviews.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      } as Interview;
    });
  } catch (error) {
    console.error("Error getting latest interviews:", error);
    throw new Error(`Failed to get latest interviews: ${error}`);
  }
}

/**
 * Create a new interview
 * @param interviewData The interview data to create
 * @returns The created interview ID and success status
 */
export async function createInterview(
  interviewData: Omit<Interview, "id" | "createdAt">
): Promise<{ success: boolean; interviewId?: string }> {
  try {
    // Input validation
    if (!interviewData.userId) throw new Error("User ID is required");
    if (!interviewData.userName) throw new Error("User name is required");
    if (!interviewData.title) throw new Error("Interview title is required");

    const now = Timestamp.now();

    const interviewRef = db.collection("scheduled_interviews").doc();
    await interviewRef.set({
      ...interviewData,
      createdAt: now,
      updatedAt: now,
      finalized: interviewData.finalized ?? false,
    });

    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false };
  }
}

/**
 * Update an existing interview
 * @param id The interview ID to update
 * @param interviewData The interview data to update
 * @returns Success status
 */
export async function updateInterview(
  id: string,
  interviewData: Partial<Omit<Interview, "id" | "createdAt" | "userId">>
): Promise<{ success: boolean }> {
  try {
    // Input validation
    if (!id) throw new Error("Interview ID is required");

    const interviewRef = db.collection("interviews").doc(id);
    const interview = await interviewRef.get();

    if (!interview.exists) {
      throw new Error("Interview not found");
    }

    await interviewRef.update({
      ...interviewData,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating interview:", error);
    return { success: false };
  }
}

/**
 * Available time slots for interviews (24-hour format)
 */
const AVAILABLE_TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00"];

/**
 * Check if a specific date and time slot is available
 * @param date The date to check
 * @param time The time slot to check (in 24-hour format)
 * @returns Boolean indicating if the slot is available
 */
export async function checkSlotAvailability(
  date: Date,
  time: string
): Promise<boolean> {
  try {
    // Input validation
    if (!date) throw new Error("Date is required");
    if (!time) throw new Error("Time is required");
    if (!AVAILABLE_TIMES.includes(time)) throw new Error("Invalid time slot");

    // Format date to remove time component for query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Use Admin SDK for querying
    const interviewsQuery = db
      .collection("interviews")
      .where("date", ">=", Timestamp.fromDate(startOfDay))
      .where("date", "<=", Timestamp.fromDate(endOfDay))
      .where("time", "==", time);

    const querySnapshot = await interviewsQuery.get();

    // If empty, the slot is available
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking slot availability:", error);
    throw new Error(`Failed to check slot availability: ${error}`);
  }
}

/**
 * Get all available slots for a specific date
 * @param date The date to check for available slots
 * @returns Array of interview slots with availability status
 */
export async function getAvailableSlotsForDate(
  date: Date
): Promise<InterviewSlot[]> {
  try {
    // Input validation
    if (!date) throw new Error("Date is required");

    const slots: InterviewSlot[] = [];

    // Check each time slot
    for (const time of AVAILABLE_TIMES) {
      try {
        const isAvailable = await checkSlotAvailability(date, time);
        slots.push({
          date: new Date(date),
          time,
          available: isAvailable,
        });
      } catch (error) {
        console.error(`Error checking availability for time ${time}:`, error);
        // Add the slot as unavailable if there's an error checking it
        slots.push({
          date: new Date(date),
          time,
          available: false,
        });
      }
    }

    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    throw new Error(`Failed to get available slots: ${error}`);
  }
}

/**
 * Schedule an interview at a specific date and time
 * @param interviewData The interview data including date and time
 * @returns Success status and interview ID
 */
export async function scheduleInterview(
  interviewData: Omit<Interview, "id" | "createdAt"> & {
    date: Date;
    time: string;
  }
): Promise<{ success: boolean; interviewId?: string; error?: string }> {
  try {
    // Input validation
    if (!interviewData.userId) throw new Error("User ID is required");
    if (!interviewData.userName) throw new Error("User name is required");
    if (!interviewData.title) throw new Error("Interview title is required");
    if (!interviewData.date) throw new Error("Date is required");
    if (!interviewData.time) throw new Error("Time is required");
    if (!AVAILABLE_TIMES.includes(interviewData.time))
      throw new Error("Invalid time slot");

    // Check if the slot is available
    const isAvailable = await checkSlotAvailability(
      interviewData.date,
      interviewData.time
    );

    if (!isAvailable) {
      return {
        success: false,
        error: "This time slot is no longer available",
      };
    }

    const now = Timestamp.now();
    const { date, time, ...restData } = interviewData;

    const interviewRef = db.collection("interviews").doc();
    await interviewRef.set({
      ...restData,
      date: Timestamp.fromDate(date),
      time,
      createdAt: now,
      updatedAt: now,
      finalized: interviewData.finalized ?? true,
    });

    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return {
      success: false,
      error: `Failed to schedule interview: ${error}`,
    };
  }
}
