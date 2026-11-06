import {useState } from "react";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import Hightlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateAvatarUri } from "@/lib/avatar";

interface Props {
    meetingId: string
}

export const Transcript = ({ meetingId }: Props) => {
    const trpc = useTRPC()
    const { data } = useQuery(trpc.meetings.getTranscript.queryOptions({ id: meetingId }))

    const [searchQuery , setSearchQuery] = useState("")
    const filterData = (data ?? []).filter((item) => 
        (item.content ?? "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
    return (
        <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
            <p className="text-sm font-medium">Transcript</p>
            <div className="relative">
                <Input
                    className="pl-7 h-9 w-60"
                    placeholder="Search transcript..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
            <ScrollArea>
                <div className="flex flex-col gap-y-4">
                    {filterData.map((item) => {
                        return (
                            <div 
                                key={item.speech_start_ms} 
                                className="flex flex-col gap-y-2 hover:bg-muted p-4 rounded-md border"
                                >
                                    <div className="flex gap-x-2 items-center">
                                        <Image
                                            src={item.speaker.image ?? generateAvatarUri({ seed: item.speaker.name ?? "未知名字", variant: "initialsStyle" })}
                                            alt="speaker avatar"
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                        <p className="text-sm font-medium">{item.speaker.name}</p>
                                        <p className="text-sm text-blue-500 font-medium">
                                            {format(
                                                new Date(item.speech_start_ms), 
                                                "HH:mm:ss"
                                            )}
                                        </p>
                                    </div>
                                    <Hightlighter
                                        className="text-sm text-neutral-700"
                                        highlightClassName="bg-yellow-200"
                                        searchWords={[searchQuery]}
                                        autoEscape={true}
                                        textToHighlight={item.content}
                                    />
                            </div>
                            )
                        })
                    }     
                </div>
            </ScrollArea>
        </div>
    )
}