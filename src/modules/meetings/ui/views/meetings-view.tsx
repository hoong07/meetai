"use client"

import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { DataTable } from "@/components/data-table"
import { columns } from "../../components/columns"
import { EmptyState } from "@/components/empty-state"

export const MeetingsView = () => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}))

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data.items} columns={columns} />
            {data.items.length === 0 && (
                <EmptyState 
                title="创建你的第一个Meeting" 
                description="创建一个会议,每一个Agent会遵循您的指令并在通话中与参与者互动" />
            )}
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