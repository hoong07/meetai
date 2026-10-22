import { z } from "zod"
import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
// import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsInsertSchema } from "../../schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratedRobotAvatar } from "@/components/generated-robot-avatar";
import { toast } from "sonner";

interface AgentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValue?: AgentGetOne;
}

export const AgentForm = ({
    onSuccess,
    onCancel,
    initialValue,
} :AgentFormProps) => {
    const trpc = useTRPC()
    // const router = useRouter()
    const queryClient = useQueryClient()

    const createAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions()
                );

                if (initialValue?.id) {
                    await queryClient.invalidateQueries(
                        trpc.agents.getOne.queryOptions({id: initialValue.id})
                    )
                }
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error.message)

            // TODO : check if error code is "FORBIDDEN" , redirect to "/upgrade"
            }
        })
    )

    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValue?.name ?? "" ,
            instructions: initialValue?.instructions ?? "",
        }
    })

    const isEdit = !!initialValue?.id //判定表单是编辑 or create
    const isPending = createAgent.isPending

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if(isEdit) {
            console.log("update")
        } else {
            createAgent.mutate(values)
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <img src={GeneratedRobotAvatar(form.watch("name") || "robot")}
                 alt="avatar" 
                className="size-9 mr-3 rounded-full"/>
                <FormField 
                 name="name"
                 control={form.control}
                 render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input 
                                placeholder="e.g. 数学专家"
                                {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                            )} />
                    <FormField 
                    name="instructions"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="e.g. 这是一个数学专家，能够帮助我很好地完成数学相关的研究和计算"
                                {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                            )} />
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
    )
}