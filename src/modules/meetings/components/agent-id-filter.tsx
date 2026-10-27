import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useMeetingsFilters } from "../hooks/use-meetings-filters";
import { useState } from "react";

import Image from "next/image";
import { GeneratedRobotAvatar } from "@/components/generated-robot-avatar";
import { CommandSelect } from "@/components/command-select";

export const AgentIdFilter = () => {
    const [filters , setFilters] = useMeetingsFilters()

    const trpc = useTRPC()

    const [agentSearch , setAgentSearch] = useState("")
    const { data } = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch,
        })
    )

    return (
        <CommandSelect
            className="h-9"
            placeholder="Agent"
            options={(data?.items ?? []).map(
                (agent) => ({
                    id: agent.id,
                    value: agent.id,
                    children: (
                        <div className="flex items-center gap-x-2">
                            <Image 
                                src={GeneratedRobotAvatar(agent.name)}
                                alt="robot"
                                height={16}
                                width={16}
                            /> 
                            {agent.name}
                        </div>
                    )
                })
            )}
            onSelect={(value) => setFilters({ agentId: value , page: 1}) }
            onSearch={setAgentSearch}
            value={filters.agentId ?? ""}
        />
    )
}