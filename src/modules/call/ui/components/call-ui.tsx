"use client"

import { useState } from "react"
import {
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRTCClient,
} from "agora-rtc-react"

import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { CallLobby } from "./call-lobby"
import { CallActive } from "./call-active"
import { CallEnded } from "./call-ended"

interface Props {
    meetingId: string
    meetingName: string
    agentName: string
    credentials: { appId: string; channel: string; uid: number; token: string }
}

export const CallUI = ({ meetingId, meetingName, agentName, credentials }: Props) => {
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby")

    const trpc = useTRPC()
    const { mutateAsync: startMeeting } = useMutation(
        trpc.meetings.start.mutationOptions(),
    )

    const client = useRTCClient()

    // 只有在 "call" 阶段才真正 join 频道
    useJoin(
        {
            appid: credentials.appId,
            channel: credentials.channel,
            token: credentials.token,
            uid: credentials.uid,
        },
        show === "call",
    )

    // lobby 阶段就创建本地音视频轨用于预览
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(true)
    const { localCameraTrack } = useLocalCameraTrack(true)

    // 只在通话阶段发布本地轨
    usePublish([localMicrophoneTrack, localCameraTrack], show === "call")

    const handleJoin = async () => {
        try {
            // 先启动 AI 老师（服务端标记 active + 拉起 agent），再加入
            await startMeeting({ meetingId })
            setShow("call")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "加入会议失败，请稍后尝试")
        }
    }

    const handleLeave = async () => {
        try {
            await client.leave()
        } catch {
            // 忽略：可能尚未真正加入
        }
        setShow("ended")
    }

    if (show === "ended") {
        return <CallEnded />
    }

    if (show === "lobby") {
        return <CallLobby localCameraTrack={localCameraTrack} onJoin={handleJoin} />
    }

    return (
        <CallActive
            meetingName={meetingName}
            agentName={agentName}
            localCameraTrack={localCameraTrack}
            onLeave={handleLeave}
        />
    )
}
