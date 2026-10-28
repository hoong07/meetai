import { auth } from "@/lib/auth"
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { CallView } from "@/modules/call/ui/views/call-view"

interface Props {
    params: Promise<{
        meetingId: string
    }>
}

const Page = async ({ params }: Props) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if(!session) {
        redirect("/sign-in")
    }

    const { meetingId } = await params

    const queryClient = getQueryClient()
    void queryClient.query(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    ).catch(noop)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CallView meetingId={meetingId} />
        </HydrationBoundary>
    )
}

export default Page