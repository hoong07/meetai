"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"

import { toast } from "sonner"
import { MeetingIdViewHeader } from "../components/meeting-id-view-header"
import { UpdateMeetingsDialog } from "../components/update-meetings-dialog"

interface Props {
    meetingId: string
}
import { useConfirm } from "@/hooks/use-confirm"

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
                    queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))
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
            const ok = await confirmRemove()
    
            if (!ok) return
    
            try{
                await removeMeeting.mutateAsync({ id: meetingId})    
            }catch(error){
                console.log("删除失败",error)
            }
            
        }

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
            {JSON.stringify(data ,null ,2)}
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