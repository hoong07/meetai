import { AgentIdView, 
        AgentIdViewError,
        AgentIdViewLoading } from "@/modules/agents/ui/components/agent-id-view"
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"



interface Props {
    params: Promise<{ agentId: string}>
}

const Page = async ({ params }: Props) => {
    const { agentId } = await params
    // 数据预读取 fix: 忘记catch吞掉错误了
    const queryClient = getQueryClient()
    void queryClient.query(
        trpc.agents.getOne.queryOptions({ id: agentId })
    ).catch(noop)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<AgentIdViewLoading />}>
                <ErrorBoundary fallback={<AgentIdViewError />}>
                    <AgentIdView agentId={agentId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page