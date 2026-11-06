import { db } from "@/db";
import { eq , count } from "drizzle-orm";
import { agents , meetings } from "@/db/schema";

import { listProducts , getProducts } from "@polar-sh/sdk/2026-10/services/products";
import { polarClient } from "@/lib/polar";
import { getStateExternalCustomers } from "@polar-sh/sdk/2026-10/services/customers";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/trpc/init";

export const premiumRouter = createTRPCRouter({
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
        const customerState = await getStateExternalCustomers(polarClient)(ctx.auth.user.id);
        const subscription = customerState.active_subscriptions[0];
        if (!subscription) {
            return null
        }

        const product = await getProducts(polarClient)(subscription.product_id);

        return product
    }),
    getProducts: protectedProcedure.query(async () => {
        const products = await listProducts(polarClient)({
            is_archived: false,
            is_recurring: true,
            sorting: ["price_amount"],
        })
        return products.items;
    }),
    getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
        const customerState = await getStateExternalCustomers(polarClient)(ctx.auth.user.id);

        const subscript = customerState.active_subscriptions[0];

        if (subscript) {
            return null
        }
        const [ userMeetings ] = await db
            .select({
                count: count(meetings.id)
            })
            .from(meetings)
            .where(eq(meetings.userId, ctx.auth.user.id));

        const [ userAgents ] = await db
            .select({
                count: count(agents.id)
            })
            .from(agents)
            .where(eq(agents.userId, ctx.auth.user.id));

        return {
            meetingCount: userMeetings.count,
            agentCount: userAgents.count,
        }
    })
})