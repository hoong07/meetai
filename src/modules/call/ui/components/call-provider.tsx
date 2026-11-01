"use client"

import { LoaderIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { generateAvatarUri } from "@/lib/avatar"


import dynamic from "next/dynamic"

const DynamicCallConnect = dynamic(
    () => import("./call-connect").then((mod) => mod.CallConnect),
    { ssr: false }
)

interface Props {
    meetingId: string
    meetingName: string
    agentName: string

}
export const CallProvider = ({ meetingId , meetingName , agentName }: Props) => {
    const { data , isPending } = authClient.useSession()

    if (!data || isPending) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="size-6 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <DynamicCallConnect
            meetingId={meetingId}
            meetingName={meetingName}
            agentName={agentName}
            userId={data.user.id}
            userName={data.user.name}
            userImage={
                data.user.image ??
                generateAvatarUri({ seed: data.user.name , variant: "initialsStyle"})
            }
        />
    )
}