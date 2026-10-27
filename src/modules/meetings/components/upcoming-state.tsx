import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VideoIcon , BanIcon } from "lucide-react"

interface Props {
    meetingId: string
    onCancelMeeting: () => void
    isCancelling: boolean
}

export const UpcomingState = ({
    meetingId,
    onCancelMeeting,
    isCancelling,
} : Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/upcoming.svg"
                title="会议还未开始"
                description="当你的回忆开始时，会议总结会出现在这里"
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
                <Button
                    disabled={isCancelling}
                    variant="secondary"
                    className="w-full lg:w-auto"
                    onClick={onCancelMeeting}
                >
                    <BanIcon />
                    取消会议
                </Button>
                <Button
                disabled={isCancelling}
                    asChild
                    className="w-full lg:w-auto"
                >
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon />
                        开始会议
                    </Link>
                </Button>
            </div>
        </div>
    )
}