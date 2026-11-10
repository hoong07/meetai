import { useRouter } from "next/navigation"
import { SetStateAction , Dispatch, useState, } from "react"
import Image from "next/image"

import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { generateAvatarUri } from "@/lib/avatar"

import { CommandResponsiveDialog 
    , CommandInput ,
     CommandList ,
      CommandItem,
      CommandGroup,
      CommandEmpty,
    } from "@/components/ui/command"

interface Props {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}


export const DashboardCommand = ( { open , setOpen }: Props) => {
    const router = useRouter()
    const [ search , setSearch ] = useState("")

    const trpc = useTRPC()
    const meetings = useQuery(
        trpc.meetings.getMany.queryOptions({
            search,
            pageSize: 10,
        })
    )
    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            search,
            pageSize: 100,
        })
    )

    return (
        <CommandResponsiveDialog
            shouldFilter={false}
            open={open}
            onOpenChange={setOpen}>
            <CommandInput 
                value={search}
                onValueChange={(value) => setSearch(value)}
                placeholder="Find a meeting or agent"/>
            <CommandList>
                <CommandGroup heading="Meetings">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            找不到相关会议
                        </span>
                    </CommandEmpty>
                    {meetings.data?.items.map(( meeting ) => (
                        <CommandItem
                            onSelect={() => {
                                router.push(`/meetings/${meeting.id}`)
                                setOpen(false)
                                setSearch("")
                            }}
                            key={meeting.id}
                        >
                            {meeting.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Agents">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            找不到相关Agent
                        </span>
                    </CommandEmpty>
                    {agents.data?.items.map(( agent ) => (
                        <CommandItem
                            onSelect={() => {
                                router.push(`/agents/${agent.id}`)
                                setOpen(false)
                                setSearch("")
                            }}
                            key={agent.id}
                        >
                            <Image
                                width={20}
                                height={20}
                                src={generateAvatarUri({seed: agent.name , variant: "botttsNeutralStyle"})}
                                alt="robot"
                                className="rounded-full"
                                />
                            {agent.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    )

}