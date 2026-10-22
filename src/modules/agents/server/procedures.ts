import { db } from "@/db";
import { z } from "zod"
import { createTRPCRouter , baseProcedure } from "@/trpc/init";
import { agents } from "@/db/schema";
import { protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import { eq } from "drizzle-orm";
// import { TRPCError } from "@trpc/server";

export const agentRouter = createTRPCRouter({

    getOne: baseProcedure.input(z.object({
        id: z.string()
    })).query(async ({ input }) => {
        const [exsitingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id , input.id));
        // throw new TRPCError({code: "BAD_REQUEST"})
        return exsitingAgent;
    }),
    getMany: protectedProcedure.query(async () => {
        const data = await db
            .select()
            .from(agents);
        // throw new TRPCError({code: "BAD_REQUEST"})
        return data;
    }),
    create: protectedProcedure
        .input(agentsInsertSchema)
        .mutation(async ({ input , ctx}) => {
            const [createdAgent] = await db
            .insert(agents)
            .values({
                ...input,
                userId: ctx.auth.user.id
            }).returning()

            return createdAgent
        })
})