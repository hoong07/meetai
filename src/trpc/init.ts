import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from '@/constants';
import { db } from '@/db';
import { agents, meetings } from '@/db/schema';
import { auth } from '@/lib/auth';
import { polarClient } from '@/lib/polar';
import { getStateExternalCustomers } from '@polar-sh/sdk/2026-10/services/customers/index';
import { initTRPC, TRPCError } from '@trpc/server';
import { count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // const user = await auth(opts.headers);
  void opts;
  return { userId: 'user_123' };
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    // transformer: superjson,
  });
 
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx , next}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" , message: "Unauthorized"})
  }
  return next({ ctx: {...ctx,auth: session}})
})

export const premiumProcedure = (entity: "agents" | "meetings") => 
    protectedProcedure.use(async ({ ctx , next}) => {
        const customerState = await getStateExternalCustomers(polarClient)(ctx.auth.user.id);

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

        const isPremium = customerState.active_subscriptions.length > 0;
        const isFreeAgentLimitReached = userAgents.count >= MAX_FREE_AGENTS;
        const isFreeMeetingLimitReached = userMeetings.count >= MAX_FREE_MEETINGS;

        const shouldThrowMeetingError = entity === "meetings" && isFreeMeetingLimitReached && !isPremium;
        const shouldThrowAgentError = entity === "agents" && isFreeAgentLimitReached && !isPremium;

        if (shouldThrowMeetingError || shouldThrowAgentError) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: `You have reached the limit of free ${entity}. Please upgrade to Pro to create more.`,
            });
        }

        return next({ ctx: {...ctx , customerState} });
    })