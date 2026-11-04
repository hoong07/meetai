import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

export type MeetingGetMany = inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"]

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"]

export enum MeetingStatus {
    Upcoming = "upcoming",
    Active = "active",
    Completed = "completed",
    Processing = "processing",
    Cancelled = "cancelled",
}

export type AgoraTranscriptItem = {
    content: string
    role: string
    speech_end_ms: number
    speech_start_ms: number
    turn_id: number
}

export type AgoraPayload = {
      channel?: string;
      status?: string;
      agent_id?: string;
      contents?: AgoraTranscriptItem[];
    };