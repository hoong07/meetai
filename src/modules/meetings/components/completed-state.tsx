import { MeetingGetOne } from "../types"

import Link from "next/link"
import { generateAvatarUri } from "@/lib/avatar"
import Image from "next/image"

import { 
    BookOpenTextIcon,
    SparklesIcon,
    FileTextIcon,
    ClockFadingIcon,
 } from "lucide-react"
 import { Badge } from "@/components/ui/badge"
import { ScrollArea , ScrollBar } from "@/components/ui/scroll-area"
import { Tabs , TabsContent , TabsList , TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { formatDuration } from "@/lib/utils"
import Markdown from "react-markdown"

interface Props {
    data: MeetingGetOne
}

export const CompletedState = ({ data }: Props) => {
    return (
        <div className="flex flex-col gap-y-4">
            <Tabs defaultValue="summary">
                <div className="bg-white rounded-lg border px-3">
                    <ScrollArea>
                        <TabsList className="p-0 bg-background justify-start rounded-none h-13">
                            <TabsTrigger
                             value="summary"
                             className="text-muted-foreground rounded-none bg-background data-[state=actice]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                             >
                                <BookOpenTextIcon />
                                会议总结
                            </TabsTrigger>
                            <TabsTrigger
                             value="transcript"
                             className="text-muted-foreground rounded-none bg-background data-[state=actice]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                             >
                                <FileTextIcon />
                                会议记录
                            </TabsTrigger>
                        </TabsList>
                        <ScrollBar />
                    </ScrollArea>
                </div>
                <TabsContent value="summary">
                    <div className="bg-white rounded-lg border">
                        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                            <h2 className="text-2xl font-medium capitalize">{data.name}</h2>
                            <div className="flex gap-x-2 items-center">
                                <Link
                                    href={`/agents/${data.agent.id}`}
                                    className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                                >
                                    <Image src={generateAvatarUri({
                                        seed: data.agent.name ,
                                        variant: "botttsNeutralStyle"})}
                                        height={20}
                                        width={20}
                                        alt="robot"
                                        className="rounded-full"
                                        />
                                    {data.agent.name}
                                </Link>{" "}
                                <p>{data.startedAt ? format(data.startedAt, "PPP") : ""}</p>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <SparklesIcon className="size-4" />
                                <p>总结摘要</p>
                            </div>
                            <Badge
                                variant="outline"
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <ClockFadingIcon className="text-blue-700"/>
                                {data.duration ? formatDuration(data.duration) : "无持续时间"}
                            </Badge>
                            <div>
                                <Markdown
                                    components={{
                                        h1: (props) => (
                                            <h1 className="text-2xl font-medium mb-6" {...props}></h1>
                                        ),
                                        h2: (props) => (
                                            <h1 className="text-xl font-medium mb-6" {...props}></h1>
                                        ),
                                        h3: (props) => (
                                            <h1 className="text-lg font-medium mb-6" {...props}></h1>
                                        ),
                                        h4: (props) => (
                                            <h1 className="text-base font-medium mb-6" {...props}></h1>
                                        ),
                                        p: (props) => (
                                            <p className="mb-6 leading-relaxed" {...props}></p>
                                        ),
                                        ul: (props) => (
                                            <ul className="list-disc list-inside mb-6" {...props}></ul>
                                        ),
                                        ol: (props) => (
                                            <ol className="list-disc list-inside mb-6" {...props}></ol>
                                        ),
                                        li: (props) => <li className="mb-1" {...props}></li>,
                                        strong: (props) => (
                                            <strong className="font-semibold" {...props}/>
                                        ),
                                        code: (props) => (
                                            <code
                                                className="bg-gray-100 px-1 py-0.5 rounded"
                                                {...props}
                                            />
                                        ),
                                        blockquote: (props) => (
                                            <blockquote 
                                                className="border-l-4 pl-4 italic my-4"
                                                {...props}
                                            />
                                        )
                                    }}
                                >
                                    {data.summary}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}