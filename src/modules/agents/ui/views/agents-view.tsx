"use client"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"

import { columns } from "../components/columns"
import { DataTable } from "../components/data-table"
import { EmptyState } from "@/components/empty-state"
import { useAgentsFilters } from "../../hooks/use-agents-filters"
import { DataPagination } from "../components/data-pagination"
import { useRouter } from "next/navigation"

export const AgentsView = () => {
    const router = useRouter()
    const [filters , setFilters] = useAgentsFilters()

    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }))

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data.items}
             columns={columns} 
             onRowClick={(row) => router.push(`/agents/${row.id}`)}/>
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />
            {data.items.length === 0 && (
                <EmptyState 
                title="创建你的第一个Agent" 
                description="创建一个加入会议的Agent,每一个Agent回遵循您的指令并在通话中与参与者互动" />
            )}
        </div>
    )
}

export const AgentsViewLoading = () => {
    return (
        <LoadingState title="加载Agents中" 
        description="接下来可能需要一些时间，请耐心等待..."/>
    )
}

export const AgentsViewError = () => {
    return (
        <ErrorState 
        title="加载Agents失败"
        description="请稍后再次重试"
        />
    )
}