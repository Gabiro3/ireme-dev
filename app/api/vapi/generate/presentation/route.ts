import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  const {
    presentation_type,
    userid,
    audience_type,
    selectedDate,
    selectedTime,
  } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare thoughtful and constructive questions to help someone refine their presentation.
        
        The presentation type is: ${presentation_type}.
        The target audience is: ${audience_type}.
        The user is looking for a proofreading-style assistant to help improve clarity, flow, tone, and delivery.
        
        These questions should help the speaker think critically about their content, structure, and engagement with the audience.
        Please return only the questions, without any additional explanation or context.
        The questions are going to be read by a voice assistant, so avoid using "/", "*", or other special characters.
        
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
    
        Thank you! <3
      `,
    });

    const interview = {
      questions: JSON.parse(questions),
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      userId: userid,
      finalized: true,
      interview_type: presentation_type,
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}
