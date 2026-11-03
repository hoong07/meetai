import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { db } from "@/db";
import { meetings } from "@/db/schema";
import { summarizeTranscript } from "@/lib/agora";

// 声网对话式 AI 引擎 Webhook 事件编号
const EVENT_AGENT_JOINED = 101;
const EVENT_AGENT_LEFT = 102;
const EVENT_AGENT_HISTORY = 103;
const EVENT_AGENT_ERROR = 110;

// 校验声网回调签名（HMAC-SHA256）。未配置 secret 时跳过，便于本地联调。
function verifySignature(rawBody: string, signatureV2: string | null): boolean {
  const secret = process.env.AGORA_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signatureV2) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signatureV2;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureV2 = req.headers.get("Agora-Signature-V2");

  if (!verifySignature(rawBody, signatureV2)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let msg: {
    eventType?: number;
    payload?: {
      channel?: string;
      status?: string;
      agent_id?: string;
      contents?: { 
          role?: string;
          content?: string;
          speech_end_ms?: number;
          speech_start_ms?: number;
          turn_id: number;
         }[];
    };
  };
  try {
    console.log(rawBody)
    msg = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = msg.eventType;
  const payload = msg.payload ?? {};
  const meetingId = payload.channel;

  // 健康检查 / 未知事件：没有 eventType 或没有 channel 时直接返回 200，避免声网反复重试
  if (!eventType || !meetingId) {
    return NextResponse.json({ status: "ok" });
  }

  //console.log("[agora webhook] eventType =", eventType, ", channel =", meetingId, ", payload =", JSON.stringify(payload));

  switch (eventType) {
    case EVENT_AGENT_JOINED: {
      // agent 已入会；会议在 start 时已经标记为 active，这里无需处理
      break;
    }

    case EVENT_AGENT_LEFT: {
      // agent 离开（用户离开 / 空闲超时 / 出错），标记会议结束
      await db
        .update(meetings)
        .set({ status: "processing", endedAt: new Date() })
        .where(eq(meetings.id, meetingId));
      break;
    }

    case EVENT_AGENT_HISTORY: {
      // agent 停止后回传的对话记录，从这里拿转写文本做总结
      const contents = payload.contents ?? [];
      const transcript = contents
        .filter((c) => c.content)
        // .map((c) => `${c.role === "user" ? "学生" : "AI老师"}: ${c.content}`)
        // .join("\n");
      const transcriptForSummary = contents.filter((c) => c.content).join("\n")
      const transcriptData = JSON.stringify(payload)

      if (!transcript) break;

      try {
        const summary = await summarizeTranscript(transcriptForSummary);
        await db
          .update(meetings)
          .set({ summary , transcriptUrl: transcriptData , status: "completed" })
          .where(eq(meetings.id, meetingId));
      } catch (err) {
        console.error("总结转写失败:", err);
        // 总结失败也把转写文本落库
        await db
          .update(meetings)
          .set({ transcriptUrl: transcriptData , status: "completed" })
          .where(eq(meetings.id, meetingId));
      }
      break;
    }

    case EVENT_AGENT_ERROR: {
      console.error("Agora agent error:", JSON.stringify(msg));
      break;
    }

    default: {
      // 104 token 过期 / 111 指标 / 112 轮次数据等，暂不处理
      break;
    }
  }

  return NextResponse.json({ status: "ok" });
}
