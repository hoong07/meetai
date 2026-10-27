"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon , XCircleIcon } from "lucide-react"
import { NewAgentsDialog } from "./new-agents-dialog"
import { useState } from "react"
import { AgentsSearchFilter } from "./agents-search-filter"
import { useAgentsFilters } from "../../hooks/use-agents-filters"
import { DEFAULT_PAGE } from "@/constants"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export const AgentsListHeader = () => {
    const [filter , setFilter] = useAgentsFilters()
    const [isDialogOpen , setIsDialogOpen] = useState(false)

    const isAnyFilterModified = !!filter.search
    const onClearFilters = () => {
        setFilter({
            search: "",
            page: DEFAULT_PAGE
        })
    }

    return (
        <>
        {/* 表 + 顶部header + 弹出对话框 */}
            <NewAgentsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
            <div className="flex flex-col px-4 py-4 md:px-8 gap-y-4">
                {/* Header */}
                <div className="flex justify-between items-center ">
                    <h5 className="font-medium text-xl">My Agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        New Agent
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <AgentsSearchFilter />
                        {isAnyFilterModified && (
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            >
                                <XCircleIcon />
                                清除
                            </Button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </>
    )
}