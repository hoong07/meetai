import { z } from "zod"
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { MeetingGetOne } from "../types";
import { meetingsInsertSchema } from "../schemas";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { NewAgentsDialog } from "@/modules/agents/ui/components/new-agents-dialog";
import { CommandSelect } from "@/components/command-select";
import { GeneratedRobotAvatar } from "@/components/generated-robot-avatar";
import Image from "next/image";

interface MeetingFormProps {
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues,
} :MeetingFormProps) => {
    const trpc = useTRPC()
    // const router = useRouter()
    const queryClient = useQueryClient()

    const [openNewAgentDialog , setOpenNewAgentDialog] = useState(false)
    const [ agentSearch , setAgentSearch] = useState("")

    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch,
        })
    )

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );

                // TODO: Invalidate free tier usage

                onSuccess?.(data.id)
            },
            onError: (error) => {
                toast.error(error.message)

            // TODO : check if error code is "FORBIDDEN" , redirect to "/upgrade"
            }
        })
    )
    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );

                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({id: initialValues.id})
                    )
                }
                onSuccess?.(data.id)
            },
            onError: (error) => {
                toast.error(error.message)

            // TODO : check if error code is "FORBIDDEN" , redirect to "/upgrade"
            }
        })
    )

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "" ,
            agentId: initialValues?.agentId ?? "",
        }
    })

    const isEdit = !!initialValues?.id //判定表单是编辑 or create
    const isPending = createMeeting.isPending || updateMeeting.isPending

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if(isEdit) {
            updateMeeting.mutate({...values , id: initialValues.id})
        } else {
            createMeeting.mutate(values)
        }
    }


    return (
        <>
            <NewAgentsDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField 
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input 
                                    placeholder="e.g. 数学问题咨询"
                                    {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                                )} 
                    />
                    <FormField 
                    name="agentId"
                    control={form.control}
                    render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent</FormLabel>
                                <FormControl>
                                    <CommandSelect 
                                        options={(agents.data?.items ?? []).map((agent) => ({
                                            id: agent.id,
                                            value: agent.id,
                                            children: (
                                                <div className="flex items-center gap-x-2">
                                                    <Image 
                                                    src={GeneratedRobotAvatar(agent.name)}
                                                    alt="robot"
                                                    width={24}
                                                    height={24} 
                                                    className="border"
                                                    /> 
                                                    <span>{agent.name}</span>
                                                </div>
                                            )
                                        }))}
                                        onSelect={field.onChange}
                                        onSearch={setAgentSearch}
                                        value={field.value}
                                        placeholder="选择会议成员Agent"
                                    />
                                </FormControl>
                                <FormDescription>
                                    未找到您想要的Agent?
                                    <button
                                        type="button"
                                        className="text-primary hover:underline ml-2"
                                        onClick={() => setOpenNewAgentDialog(true)}
                                    >
                                        创建您新的Agent
                                    </button>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                                )} 
                    />
                    

                    <div className="flex justify-between gap-x-4">
                        {onCancel && (
                        <Button
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => onCancel()}
                        type="button" >
                        取消
                        </Button>)}
                        <Button
                        disabled={isPending}
                        type="submit" >
                            {isEdit ? "更新" : "创建"}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}