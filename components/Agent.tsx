"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface Message {
  type: string;
  transcriptType: string;
  role: "user" | "system" | "assistant";
  transcript: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId?: string;
  feedbackId?: string;
  profileImage?: string;
  type: "generate" | "interview";
  questions?: string[];
  interviewTitle?: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  profileImage,
  type,
  questions,
  interviewTitle = "What interview do you want to",
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [avatarPulse, setAvatarPulse] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setIsListening(true);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsListening(false);
      setIsSpeaking(false);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);

        // If user is speaking, AI is listening
        if (message.role === "user") {
          setIsListening(true);
          setIsSpeaking(false);
        }
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
      setIsListening(false);
      setAvatarPulse(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
      setIsListening(true);
      setAvatarPulse(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-3xl mx-auto h-full">
      {/* Interview Title */}
      <div className="w-full text-center mb-8 mt-6">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-300">
          {interviewTitle}{" "}
          <span className="inline-block bg-blue-100 text-blue-600 px-3 py-2 rounded-lg mt-2">
            {interviewTitle ? "prepare for?" : "Take the interview?"}
          </span>
        </h1>
      </div>

      {/* AI Avatar */}
      <div className="relative mb-12">
        <div
          className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-b from-blue-300 to-blue-400 flex items-center justify-center",
            avatarPulse && "animate-pulse"
          )}
        >
          {/* Optional: Add a face or icon inside the avatar */}
        </div>

        {/* Animated rings when speaking */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-pulse"></div>
          </>
        )}
      </div>

      {/* Microphone Status Indicator */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-gray-100 rounded-full mb-2">
          {isListening ? (
            <Mic className="h-6 w-6 text-blue-500" />
          ) : (
            <MicOff className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <p className="text-gray-500 text-sm">
          {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Idle"}
        </p>
      </div>

      {/* Last Message Transcript */}
      {lastMessage && (
        <div className="w-full max-w-lg bg-white rounded-lg p-4 mb-8 shadow-sm">
          <p className="text-gray-700 text-center animate-fadeIn">
            {lastMessage}
          </p>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full flex justify-center mb-8">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            className={cn(
              "relative py-3 px-8 rounded-full text-white font-medium transition-all",
              callStatus === CallStatus.CONNECTING
                ? "bg-yellow-500 animate-pulse"
                : "bg-green-500 hover:bg-green-600"
            )}
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            {callStatus === CallStatus.INACTIVE ||
            callStatus === CallStatus.FINISHED
              ? "Start Interview"
              : "Connecting..."}
          </button>
        ) : (
          <button
            className="py-3 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
            onClick={handleDisconnect}
          >
            End Interview
          </button>
        )}
      </div>

      {/* User Info - Optional */}
      {userName && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Interviewing: <span className="font-medium">{userName}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Agent;
