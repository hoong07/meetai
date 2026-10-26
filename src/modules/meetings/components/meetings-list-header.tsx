"use client"
import { DEFAULT_PAGE } from "@/constants"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { PlusIcon , XCircleIcon } from "lucide-react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { NewMeetingsDialog } from "./new-meetings-dialog"
import { MeetingsSearchFilter } from "./meetings-search-filter"
import { StatusFilter } from "./status-filter"
import { AgentIdFilter } from "./agent-id-filter"
import { useMeetingsFilters } from "../hooks/use-meetings-filters"

export const MeetingsListHeader = () => {
    const [filters , setFilters] = useMeetingsFilters()
    const [isOpenDialog , setIsopenDialog] = useState(false)

    const isAnyFilterModified = !!filters.agentId || !!filters.status || !!filters.search
    const onClearFilters = () => {
        setFilters({
            status: null,
            agentId: "",
            search: "",
            page: DEFAULT_PAGE,
        })
    }

    return (
        <>
        {/* 表 + 顶部header + 弹出对话框 */}
            <NewMeetingsDialog open={isOpenDialog} onOpenChange={setIsopenDialog}/>
            <div className="flex flex-col px-4 py-4 md:px-8 gap-y-4">
                {/* Header */}
                <div className="flex justify-between items-center ">
                    <h5 className="font-medium text-xl">My Meetings</h5>
                    <Button onClick={() => {setIsopenDialog(true)}}>
                        <PlusIcon />
                        New Meeting
                    </Button>
                </div>
                <ScrollArea type="always">
                    <div className="flex w-max items-center gap-x-2 p-1">
                        <MeetingsSearchFilter />
                        <StatusFilter />
                        <AgentIdFilter />
                        {isAnyFilterModified && (
                            <Button
                                variant="outline"
                                onClick={onClearFilters}
                            >
                                <XCircleIcon className="size-4"/>
                                清除
                            </Button>
                        )}
                    </div>
                    <ScrollBar orientation={"horizontal"}/>
                </ScrollArea>
            </div>
        </>
    )
}