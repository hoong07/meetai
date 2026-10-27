"use client"

import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"

import { UpdateAgentsDialog } from "../components/update-agents-dialog"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { AgentIdViewHeader } from "../components/agent-id-view-header"
import { GeneratedRobotAvatar } from "@/components/generated-robot-avatar"
import { Badge } from "@/components/ui/badge"
import { VideoIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useConfirm } from "@/hooks/use-confirm"
import { useState } from "react"

interface Props {
    agentId: string
}

export const AgentIdView = ({ agentId }: Props) => {
    const trpc = useTRPC()
    const router = useRouter()
    const queryClient = useQueryClient()

    const [updateAgentDialogOpen , setUpdateAgentDialogOpen] = useState(false)

    const { data } = useSuspenseQuery(trpc.agents.getOne.queryOptions({id: agentId}))

    const removeAgent = useMutation(
        trpc.agents.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))
                router.push("/agents")
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    )

    const [RemoveConfirmation , confirmRemove] = useConfirm(
        "请确认",
        `接下来的操作将删除${data.mettingCount} 个相关的会议`
    )

    const handleRemoveAgent = async () => {
        if(removeAgent.isPending) return

        const ok = await confirmRemove()

        if (!ok) return

        try{
            await removeAgent.mutateAsync({ id: agentId})    
        }catch(error){
            console.log("删除失败",error)
        }
        
    }

    return (
        <>
            <RemoveConfirmation />
            <UpdateAgentsDialog
             open={updateAgentDialogOpen}
             onOpenChange={setUpdateAgentDialogOpen}
             initialValues={data}
             />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <AgentIdViewHeader
                agentId={agentId}
                agentName={data.name}
                onEdit={() => setUpdateAgentDialogOpen(true)}
                onRemove={handleRemoveAgent}
                />
                <div className="bg-white rounded-lg border">
                    <div className="px-4 py-5 gap-y-4 flex flex-col col-span-5">
                        <div className="flex items-center gap-x-3">
                            <Image src={GeneratedRobotAvatar(data.name)} alt="robot" height={40} width={40}/>
                            <h2 className="text-2xl font-medium">{data.name}</h2>
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <Badge
                                variant="outline"
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <VideoIcon className="text-blue-600"/>
                                {data.mettingCount} {data.mettingCount === 1 ? "meeting" : "meetings"}
                            </Badge>
                            <div className="flex flex-col gap-y-3">
                                <p className="text-lg font-medium">Instructions</p>
                                <p className="text-neutral-800">{data.instructions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export const AgentIdViewLoading = () => {
    return (
        <LoadingState title="Agent加载中" 
        description="可能需要花费几分钟..."/>
    )
}

export const AgentIdViewError = () => {
    return (
        <ErrorState 
        title="加载您的Agent失败"
        description="似乎发生错误了"
        />
    )
}