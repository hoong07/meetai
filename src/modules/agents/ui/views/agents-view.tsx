"use client"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"

import { columns } from "../components/columns"
import { DataTable } from "../components/data-table"
import { EmptyState } from "@/components/empty-state"

export const AgentsView = () => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions())

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data} columns={columns} />
            {data.length === 0 && (
                <EmptyState 
                title="创建你的第一个Agent" 
                description="创建一个加入会议的Agent,每一个Agent回遵循您的指令并在通话中与参与者互动" />
            )}
        </div>
    )
}

export const AgentsViewLoading = () => {
    return (
        <LoadingState title="Loading Agents" 
        description="This may take a few seconds..."/>
    )
}

export const AgentsViewError = () => {
    return (
        <ErrorState 
        title="Faield to load Agents"
        description="Please try again later"
        />
    )
}