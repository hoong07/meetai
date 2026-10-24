import { db } from "@/db";
import { z } from "zod";
import { createTRPCRouter } from "@/trpc/init";
import { meetings } from "@/db/schema";
import { protectedProcedure } from "@/trpc/init";
import { count, desc, and, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const meetingRouter = createTRPCRouter({
  
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input , ctx }) => {
      const [exsitingMeeting] = await db
        .select({
          ...getTableColumns(meetings),
        })
        .from(meetings)
        .where(and(
          eq(meetings.id, input.id),
          eq(meetings.userId, ctx.auth.user.id)
        ));
        
      if (!exsitingMeeting) {
        throw new TRPCError({code: "BAD_REQUEST" , message: "找不到该会议"})
      }

      return exsitingMeeting;
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

        // throw new TRPCError({code: "BAD_REQUEST"})

        const data = await db
        .select({
          ...getTableColumns(meetings),
          mettingCount: sql<number>`6`,
        })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(meetings.createdAt) , desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        
        const [total] = await db
            .select({count : count()})
            .from(meetings)
            .where(
                and(
                    eq(meetings.userId, ctx.auth.user.id),
                    search ? ilike(meetings.name, `%${search}%`) : undefined,
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

});
