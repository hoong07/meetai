"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data-table-features"
import { AgentGetOne } from "../../types"
import { GeneratedRobotAvatar } from "@/components/generated-robot-avatar"

import { CornerDownRightIcon } from "lucide-react"
import { VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, AgentGetOne>()

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Agent Name",
    cell: ({ row }) => (
        <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2">
                <img src={GeneratedRobotAvatar(row.original.name)}
                 alt="robot"
                 className="size-6 rounded-full " />
                 <span className="font-semibold capitalize">
                    {row.original.name}
                 </span>
            </div>
            <div className="flex items-center gap-x-2">
                <CornerDownRightIcon className="size-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground max-w-50 truncate capitalize">
                    {row.original.instructions}
                </span>
            </div>
        </div>
    )
  }),
  columnHelper.accessor("mettingCount", {
    header: "Mettings",
    cell: () => (
        <Badge
        variant="outline"
        className="flex items-center gap-x-2 [&>svg]:size-4" >
            <VideoIcon className="text-blue-500"/>
            {/* {row.original.mettingCount} {row.original.mettingCount === 1 ? "metting" : "mettings"} */}
            5 mettings
        </Badge>
    )
  })
])