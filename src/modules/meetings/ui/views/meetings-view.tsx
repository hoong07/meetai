"use client"

import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"

export const MeetingsView = () => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}))

    return (
        <div>
            {JSON.stringify(data)}
        </div>
    )
}

export const MeetingsViewLoading = () => {
    return (
        <LoadingState title="加载会议中" 
        description="接下来可能需要一些时间，请耐心等待..."/>
    )
}

export const MeetingsViewError = () => {
    return (
        <ErrorState 
        title="加载会议失败"
        description="请一会后再次重试"
        />
    )
}