"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { NewAgentsDialog } from "./new-agents-dialog"
import { useState } from "react"

export const AgentsListHeader = () => {
    const [isDialogOpen , setIsDialogOpen] = useState(false)

    return (
        <>
            <NewAgentsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
            <div className="flex flex-col px-4 py-4 md:px-8 gap-y-4">
                <div className="flex justify-between items-center ">
                    <h5 className="font-medium text-xl">My Agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        New Agent
                    </Button>
                </div>
            </div>
        </>
    )
}