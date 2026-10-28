import { StreamTheme , useCall } from "@stream-io/video-react-sdk"
import { useState } from "react"
import { CallLobby } from "./call-lobby"
import { CallActive } from "./call-active"
import { CallEnded } from "./call-ended"
import { toast } from "sonner"

interface Props {
    meetingName: string
}

export const CallUI = ({ meetingName }: Props) => {
    const call = useCall()
    const [show , setShow] = useState<"lobby" | "call" | "ended">("lobby")

    const handleJoin = async () => {
        if (!call) return

        try {
            await call.join()
            setShow("call")
        }
        catch{
            toast.error("加入会议失败，请稍后尝试")
        }
    }

    const handleLeave = async () => {
        if (!call) return 
        try{
            await call.leave()
            setShow("ended")
        }
        catch{
            toast.error("退出会议失败，请稍后再试")
        }
        
    }

    return (
        <StreamTheme className="h-screen">
            {show === "lobby" && <CallLobby onJoin={handleJoin}/>}
            {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName}/>}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
    )
}