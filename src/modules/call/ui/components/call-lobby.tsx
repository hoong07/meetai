"use client"

import { LogInIcon } from "lucide-react"
import { LocalUser } from "agora-rtc-react"
import type { ICameraVideoTrack } from "agora-rtc-react"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
    localCameraTrack: ICameraVideoTrack | null
    onJoin: () => void
}

export const CallLobby = ({ localCameraTrack, onJoin }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
            <div className="py-4 px-8 flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                    <div className="flex flex-col gap-y-2 text-center">
                        <h6 className="text-lg font-medium">准备好加入会议了吗？</h6>
                        <p className="text-sm">加入会议之前请设置好您的设备</p>
                    </div>

                    <div className="aspect-video w-72 overflow-hidden rounded-lg bg-black">
                        <LocalUser videoTrack={localCameraTrack} cameraOn={true} micOn={false} />
                    </div>

                    <div className="flex gap-x-2 justify-between w-full">
                        <Button asChild variant="ghost">
                            <Link href="/meetings">
                                取消
                            </Link>
                        </Button>
                        <Button onClick={onJoin}>
                            <LogInIcon />
                            加入会议
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
