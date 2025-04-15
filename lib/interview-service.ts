import { db } from "@/firebase/client";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface InterviewSlot {
  date: Date;
  time: string;
  available: boolean;
}

export interface ScheduleInterviewData {
  userId: string;
  userName: string;
  interviewTitle: string;
  description: string;
  date: Date;
  time: string;
  duration: number;
  platform: string;
}

// Available time slots (24-hour format)
export const AVAILABLE_TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00"];

// Check if a specific date and time slot is available
export async function checkSlotAvailability(
  date: Date,
  time: string
): Promise<boolean> {
  try {
    // Format date to remove time component for query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const interviewsRef = collection(db, "interviews");
    const q = query(
      interviewsRef,
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<=", Timestamp.fromDate(endOfDay)),
      where("time", "==", time)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // If empty, the slot is available
  } catch (error) {
    console.error("Error checking slot availability:", error);
    throw new Error("Failed to check slot availability");
  }
}

// Get all available slots for a specific date
export async function getAvailableSlotsForDate(
  date: Date
): Promise<InterviewSlot[]> {
  try {
    const slots: InterviewSlot[] = [];

    // Check each time slot
    for (const time of AVAILABLE_TIMES) {
      const isAvailable = await checkSlotAvailability(date, time);
      slots.push({
        date: new Date(date),
        time,
        available: isAvailable,
      });
    }

    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    throw new Error("Failed to get available slots");
  }
}

// Schedule an interview
export async function scheduleInterview(
  data: ScheduleInterviewData
): Promise<string> {
  try {
    // Check if the slot is available
    const isAvailable = await checkSlotAvailability(data.date, data.time);

    if (!isAvailable) {
      throw new Error("This time slot is no longer available");
    }

    // Add the interview to Firestore
    const docRef = await addDoc(collection(db, "scheduled_interviews"), {
      userId: data.userId,
      userName: data.userName,
      interviewTitle: data.interviewTitle,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      time: data.time,
      duration: data.duration,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error scheduling interview:", error);
    throw error;
  }
}
