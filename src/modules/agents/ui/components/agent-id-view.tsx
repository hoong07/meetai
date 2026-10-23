"use client"

import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { AgentIdViewHeader } from "./agent-id-view-header"
import { GeneratedRobotAvatar } from "@/components/generated-robot-avatar"
import { Badge } from "@/components/ui/badge"
import { VideoIcon } from "lucide-react"

interface Props {
    agentId: string
}

export const AgentIdView = ({ agentId }: Props) => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.agents.getOne.queryOptions({id: agentId}))

    return (
        <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <AgentIdViewHeader
            agentId={agentId}
            agentName={data.name}
            onEdit={()=>{}}
            onRemove={()=>{}}
            />
            <div className="bg-white rounded-lg border">
                <div className="px-4 py-5 gap-y-4 flex flex-col col-span-5">
                    <div className="flex items-center gap-x-3">
                        <img src={GeneratedRobotAvatar(data.name)} alt="robot" className="size-10"/>
                        <h2 className="text-2xl font-medium">{data.name}</h2>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Badge
                            variant="outline"
                            className="flex items-center gao-x-2 [&>svg]:size-4"
                        >
                            <VideoIcon className="text-blue-600"/>
                            {data.mettingCount} {data.mettingCount === 1 ? "metting" : "mettings"}
                        </Badge>
                        <div className="flex flex-col gap-y-3">
                            <p className="text0lg font-medium">Instructions</p>
                            <p className="text-neutral-800">{data.instructions}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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