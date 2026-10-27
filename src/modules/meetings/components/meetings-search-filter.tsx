import { useMeetingsFilters } from "../hooks/use-meetings-filters"

import { Input } from "@/components/ui/input"

import { SearchIcon } from "lucide-react"

export const MeetingsSearchFilter = () => {
    const [filter , setFilter] = useMeetingsFilters()

    return (
        <div className="relative w-50">
            <Input 
            placeholder="通过会议名字筛选"
            className="h-9 bg-white pl-7"
            value={filter.search}
            onChange={(e) => setFilter({search: e.target.value , page: 1})}
            />
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
    )
}