import { useAgentsFilters } from "../../hooks/use-agents-filters"

import { Input } from "@/components/ui/input"

import { SearchIcon } from "lucide-react"

export const AgentsSearchFilter = () => {
    const [filter , setFilter] = useAgentsFilters()

    return (
        <div className="relative w-50">
            <Input 
            placeholder="通过Agent名字筛选"
            className="h-9 bg-white w-50 pl-7"
            value={filter.search}
            onChange={(e) => setFilter({search: e.target.value})}
            />
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
    )
}