"use client"

import { useEffect, useMemo, useState } from "react"
import { LoaderIcon } from "lucide-react"
import AgoraRTC from "agora-rtc-react"
import { AgoraRTCProvider } from "agora-rtc-react"

import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { CallUI } from "./call-ui"

interface Props {
    meetingId: string
    meetingName: string
    agentName: string
    userId: string
    userName: string
    userImage: string
}

type Credentials = {
    appId: string
    channel: string
    uid: number
    token: string
}

export const CallConnect = ({ meetingId, meetingName, agentName }: Props) => {
    const trpc = useTRPC()
    const { mutateAsync: fetchCredentials } = useMutation(
        trpc.meetings.generateToken.mutationOptions(),
    )

    const [credentials, setCredentials] = useState<Credentials>()

    useEffect(() => {
        let cancelled = false
        fetchCredentials({ meetingId }).then((c) => {
            if (!cancelled) setCredentials(c)
        })
        return () => {
            cancelled = true
        }
    }, [meetingId, fetchCredentials])

    const client = useMemo(() => {
        const c = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
        // 强制走云代理 TCP/TLS 443，绕过被防火墙拦掉的 4710 端口
        c.startProxyServer(5)
        return c
    }, [])

    if (!credentials) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="size-6 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <AgoraRTCProvider client={client}>
            <CallUI
                meetingId={meetingId}
                meetingName={meetingName}
                agentName={agentName}
                credentials={credentials}
            />
        </AgoraRTCProvider>
    )
}
