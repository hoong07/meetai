"use client"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

import { NewMeetingsDialog } from "./new-meetings-dialog"

export const MeetingsListHeader = () => {
    const [isOpenDialog , setIsopenDialog] = useState(false)

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
                <div className="flex items-center gap-x-2 p-1">
                    TODO : Filters
                </div>
            </div>
        </>
    )
}