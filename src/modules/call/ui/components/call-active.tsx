"use client"

import Image from "next/image"
import Link from "next/link"
import { PhoneOffIcon } from "lucide-react"
import { LocalUser, RemoteUser, useRemoteUsers } from "agora-rtc-react"
import type { ICameraVideoTrack } from "agora-rtc-react"

import { Button } from "@/components/ui/button"
import { generateAvatarUri } from "@/lib/avatar"

interface Props {
    meetingName: string
    agentName: string
    localCameraTrack: ICameraVideoTrack | null
    onLeave: () => void
}

export const CallActive = ({
    meetingName,
    agentName,
    localCameraTrack,
    onLeave,
}: Props) => {
    const remoteUsers = useRemoteUsers()
    const agentAvatar = generateAvatarUri({ seed: agentName, variant: "botttsNeutralStyle" })

    return (
        <div className="flex flex-col justify-between p-4 h-full text-white">
            <div className="bg-[#101213] rounded-full p-4 flex items-center gap-4">
                <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
                    <Image src="/logo.svg" width={22} height={22} alt="Logo"/>
                </Link>
                <h4 className="text-base">
                    {meetingName}
                </h4>
            </div>

            <div className="flex-1 py-4 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LocalUser videoTrack={localCameraTrack} cameraOn={true} micOn={true} />
                {remoteUsers.map((user) => (
                    <RemoteUser
                        key={String(user.uid)}
                        user={user}
                        cover={agentAvatar}
                        playVideo={Boolean(user.hasVideo)}
                    />
                ))}
            </div>

            <div className="bg-[#101213] rounded-full px-4 py-3 flex justify-center">
                <Button variant="destructive" onClick={onLeave}>
                    <PhoneOffIcon />
                    退出会议
                </Button>
            </div>
        </div>
    )
}
