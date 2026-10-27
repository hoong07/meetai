import { db } from "@/db";
import { z } from "zod";
import { createTRPCRouter } from "@/trpc/init";
import { agents, meetings } from "@/db/schema";
import { protectedProcedure } from "@/trpc/init";
import { count, desc, and, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
import { MeetingStatus } from "../types";

export const meetingRouter = createTRPCRouter({
  remove: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation( async ({ctx , input}) => {
        const [ removedMeeting ] = await db
          .delete(meetings)
          .where(
            and(
              eq(meetings.id, input.id),
              eq(meetings.userId, ctx.auth.user.id)
            )
          ).returning()
  
          if (!removedMeeting) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "找不到该Meeting"
            })
          }
  
          return removedMeeting
      })
    ,
  update: protectedProcedure
      .input(meetingsUpdateSchema)
      .mutation( async ({ctx , input}) => {
        // 验证是否为本人创建
        const [ownedAgent] = await db
          .select({id: agents.id})
          .from(agents)
          .where(and(
            eq(agents.id, input.agentId),
            eq(agents.userId , ctx.auth.user.id)
          ))
        if (!ownedAgent) {
          throw new TRPCError({code: "NOT_FOUND" , message: "找不到该Agent"})
        }
        
        const [ updatedMeeting ] = await db
          .update(meetings)
          .set(input)
          .where(
            and(
              eq(meetings.id, input.id),
              eq(meetings.userId, ctx.auth.user.id)
            )
          ).returning()
  
          if (!updatedMeeting) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "找不到该Meeting"
            })
          }
  
          return updatedMeeting
      })
    ,
  create: protectedProcedure
      .input(meetingsInsertSchema)
      .mutation(async ({ input, ctx }) => {
        // 验证是否为本人创建
        const [ownedAgent] = await db
          .select({id: agents.id})
          .from(agents)
          .where(and(
            eq(agents.id, input.agentId),
            eq(agents.userId , ctx.auth.user.id)
          ))
        if (!ownedAgent) {
          throw new TRPCError({code: "NOT_FOUND" , message: "找不到该Agent"})
        }

        const [createdMeeting] = await db
          .insert(meetings)
          .values({
            ...input,
            userId: ctx.auth.user.id,
          })
          .returning();

          // TODO: Create Stream Call , upsert Stream Users
  
        return createdMeeting;
      }),
  
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
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId , agents.id))
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
            agentId: z.string().nullish(),
            status: z
              .enum([
                MeetingStatus.Upcoming,
                MeetingStatus.Active,
                MeetingStatus.Completed,
                MeetingStatus.Processing,
                MeetingStatus.Cancelled,
              ]).nullish()
      }),
      {})//处理空参数
    )
    .query(async ({ ctx, input }) => {
        const { search , page , pageSize , status , agentId } = input

        const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents , eq(meetings.agentId , agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status , status) : undefined,
            agentId ? eq(meetings.agentId , agentId) : undefined,
          ),
        )
        .orderBy(desc(meetings.createdAt) , desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        
        const [total] = await db
            .select({count : count()})
            .from(meetings)
            .innerJoin(agents , eq(meetings.agentId , agents.id))
            .where(
                and(
                    eq(meetings.userId, ctx.auth.user.id),
                    search ? ilike(meetings.name, `%${search}%`) : undefined,
                    status ? eq(meetings.status , status) : undefined,
                    agentId ? eq(meetings.agentId , agentId) : undefined,
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
