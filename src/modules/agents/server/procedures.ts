import { db } from "@/db";
import { z } from "zod";
import { createTRPCRouter } from "@/trpc/init";
import { agents } from "@/db/schema";
import { protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import { count, desc, and, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
// import { TRPCError } from "@trpc/server";

export const agentRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const [exsitingAgent] = await db
        .select({
          // TODO 渲染后台实际数据
          ...getTableColumns(agents),
          mettingCount: sql<number>`5`,
        })
        .from(agents)
        .where(eq(agents.id, input.id));
      // throw new TRPCError({code: "BAD_REQUEST"})
      return exsitingAgent;
    }),
  getMany: protectedProcedure
    .input(
      z.prefault(
            z.object({
            page: z.number().default(DEFAULT_PAGE),
            pageSize: z
            .number()
            .int()
            .min(MIN_PAGE_SIZE)
            .max(MAX_PAGE_SIZE)
            .default(DEFAULT_PAGE_SIZE),
            search: z.string().nullish(), //用于翻页查找
      }),{}
      )//处理空参数
    )
    .query(async ({ ctx, input }) => {
        const { search , page , pageSize } = input
      const data = await db
        .select({
          ...getTableColumns(agents),
          mettingCount: sql<number>`6`,
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(agents.createdAt) , desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        
        const [total] = await db
            .select({count : count()})
            .from(agents)
            .where(
                and(
                    eq(agents.userId, ctx.auth.user.id),
                    search ? ilike(agents.name, `%${search}%`) : undefined,
                )
            )
        const totalPages = Math.ceil(total.count / pageSize)

      // throw new TRPCError({code: "BAD_REQUEST"})
      return {
            items: data,
            total: total.count,
            totalPages,
        };
    }),
  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdAgent;
    }),
});
