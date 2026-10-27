import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VideoIcon } from "lucide-react"

interface Props {
    meetingId: string
}

export const ActiveState = ({
    meetingId,
} : Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/upcoming.svg"
                title="会议正在进行"
                description="会议将在所有参与者离开后结束"
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
                <Button
                    asChild
                    className="w-full lg:w-auto"
                >
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon />
                        加入会议
                    </Link>
                </Button>
            </div>
        </div>
    )
}