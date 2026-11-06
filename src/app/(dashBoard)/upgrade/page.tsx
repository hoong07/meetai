import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary , dehydrate, noop } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { UpgradeView , UpgradeViewLoading , UpgradeViewError } from "@/modules/premium/ui/views/upgrade-view";

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session) {
        redirect("/sign-in")
    }

    const queryClient = getQueryClient();
    void queryClient.query(
        trpc.premium.getCurrentSubscription.queryOptions()
    ).catch(noop)
    void queryClient.query(
        trpc.premium.getProducts.queryOptions()
    ).catch(noop)


    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<UpgradeViewLoading />}>
                <ErrorBoundary fallback={<UpgradeViewError />}>
                    <UpgradeView />
                </ErrorBoundary>
            </Suspense>

        </HydrationBoundary>
    )
}

export default Page