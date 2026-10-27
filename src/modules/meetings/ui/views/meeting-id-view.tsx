"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"

import { toast } from "sonner"

import { useConfirm } from "@/hooks/use-confirm"
import { MeetingIdViewHeader } from "../../components/meeting-id-view-header"
import { UpdateMeetingsDialog } from "../../components/update-meetings-dialog"
import { UpcomingState } from "../../components/upcoming-state"
import { ActiveState } from "../../components/active-state"
import { CancelledState } from "../../components/cancelled-state"
import { ProcessingState } from "../../components/processing-state"

interface Props {
    meetingId: string
}
export const MeetingIdView = ({ meetingId }: Props) => {
    const router = useRouter()
    const [updateMeetingDialogOpen , setUpdateMeetingDialogOpen] = useState(false)

    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({
        id: meetingId,
    }))
    const queryClient = useQueryClient()


    const removeMeeting = useMutation(
            trpc.meetings.remove.mutationOptions({
                onSuccess: () => {
                    queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
                    router.push("/meetings")
                },
                onError: (error) => {
                    toast.error(error.message)
                }
            })
        )
    
        const [RemoveConfirmation , confirmRemove] = useConfirm(
            "请确认",
            "接下来的操作将删除该会议"
        )
    
        const handleRemoveMeeting = async () => {
            // fix 守卫
            if(removeMeeting.isPending) return

            const ok = await confirmRemove()
    
            if (!ok) return
    
            try{
                await removeMeeting.mutateAsync({ id: meetingId})    
            }catch(error){
                console.log("删除失败",error)
            }
        }

        const isCancelled = data.status === "cancelled"
        const isProcessing = data.status === "processing"
        const isCompleted = data.status === "completed"
        const isUpcoming = data.status === "upcoming"
        const isActive = data.status === "active"

    return (
        <div className="flex-1 flex flex-col px-4 py-4 gap-y-4 md:px-8">
            <RemoveConfirmation />
            <UpdateMeetingsDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <MeetingIdViewHeader
                meetingId={meetingId}
                meetingName={data.name}
                onRemove={handleRemoveMeeting}
                onEdit={() => setUpdateMeetingDialogOpen(true)}
             />
            {isCancelled && <CancelledState />}
            {isProcessing && <ProcessingState />}
            {isCompleted && <div>isCompleted</div>}
            {isUpcoming && <UpcomingState 
                meetingId={meetingId}
                onCancelMeeting={() => {}}
                isCancelling={removeMeeting.isPending}    
            />}
            {isActive && <ActiveState meetingId={meetingId} />}
        </div>
    )
}

export const MeetingIdViewLoading = () => {
    return (
        <LoadingState title="会议加载中" 
        description="可能需要花费几分钟..."/>
    )
}

export const MeetingIdViewError = () => {
    return (
        <ErrorState 
        title="加载您的会议失败"
        description="似乎发生错误了"
        />
    )
}