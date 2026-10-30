import "server-only";

// agora-token 是 CommonJS 包，Node/Next 的 ESM 无法静态解析它的命名导出
// （会报 "Named export 'RtcRole' not found"），所以用 require 拿，再补回类型。
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { RtcTokenBuilder, RtcRole } = require("agora-token") as typeof import("agora-token");

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID!;
const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET!;

const CONVOAI_BASE = "https://api.agora.io/cn/api/conversational-ai-agent/v2";

export type JoinCredentials = {
  appId: string;
  channel: string;
  uid: number;
  token: string;
};

// 把字符串 userId 稳定映射成正整数 uid（Agora ConvoAI 的 remote_rtc_uids 要求整数 UID）
export function stringToUid(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return (h % 2147483647) + 1; // 1 .. 2^31-1，避开 0（0 表示自动分配）
}

// 用户加入 RTC 频道所需的凭据（uid 用整数，客户端入会和 agent 的 remote_rtc_uids 保持一致）
export function getJoinCredentials(channel: string, userId: string): JoinCredentials {
  const uid = stringToUid(userId);
  return {
    appId: APP_ID,
    channel,
    uid,
    token: RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      uid,
      RtcRole.PUBLISHER,
      3600,
      3600,
    ),
  };
}

// ConvoAI REST 接口用 Basic 鉴权（客户 ID / 客户密钥）
function basicAuth(): string {
  return "Basic " + Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_SECRET}`).toString("base64");
}

// 根据 vendor 构建 TTS 配置
function buildTtsConfig(): { vendor: string; params: Record<string, unknown> } {
  const vendor = process.env.AGORA_TTS_VENDOR ?? "bytedance";

  if (vendor === "minimax") {
    return {
      vendor,
      params: {
        key: process.env.AGORA_TTS_KEY ?? "",
        model: process.env.AGORA_TTS_MODEL ?? "speech-01-turbo",
        voice_setting: {
          voice_id: process.env.AGORA_TTS_VOICE_ID ?? "female-shaonv",
          speed: 1,
        },
        audio_setting: { sample_rate: 16000 },
      },
    };
  }

  // 默认 bytedance（火山引擎/豆包）
  return {
    vendor: "bytedance",
    params: {
      app_id: process.env.AGORA_TTS_APP_ID ?? "",
      token: process.env.AGORA_TTS_TOKEN ?? "",
      cluster: process.env.AGORA_TTS_CLUSTER ?? "volcano_tts",
      voice_type: process.env.AGORA_TTS_VOICE_TYPE ?? "BV700_streaming",
      speed_ratio: 1,
      volume_ratio: 1,
      pitch_ratio: 0,
    },
  };
}

// 启动对话式 AI 智能体（AI 老师）加入频道，返回 agent_id
export async function startAgent(opts: {
  channel: string;
  agentName: string;
  instructions: string;
  remoteUids: number[];
}): Promise<string> {
  // agent 自己的 RTC token：uid 0 = 由声网自动分配
  const agentToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    opts.channel,
    0,
    RtcRole.PUBLISHER,
    3600,
    3600,
  );

  const body = {
    name: `${opts.agentName}-${opts.channel}-${Date.now()}`,
    properties: {
      channel: opts.channel,
      token: agentToken,
      agent_rtc_uid: "0",
      remote_rtc_uids: opts.remoteUids.map(String),
      asr: { language: "zh-CN" },
      llm: {
        url:
          process.env.AGORA_LLM_URL ??
          "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        api_key: process.env.AGORA_LLM_API_KEY ?? process.env.ZHIPU_API_KEY ?? "",
        system_messages: [{ role: "system", content: opts.instructions }],
        greeting_message: "你好，我是你的 AI 智能助手，我们开始吧。",
        failure_message: "抱歉，我刚刚没有听清，可以再说一遍吗？",
        max_history: 20,
        params: { model: process.env.AGORA_LLM_MODEL ?? "glm-4-flash" },
      },
      tts: buildTtsConfig(),
    },
  };

  const res = await fetch(`${CONVOAI_BASE}/projects/${APP_ID}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuth(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Agora startAgent 失败 (${res.status}): ${text}`);
    console.error("[agora startAgent]", err.message);
    throw err;
  }

  const json = (await res.json()) as { agent_id: string; status?: string; create_ts?: number };
  console.log("[agora startAgent] agent created:", JSON.stringify(json));
  return json.agent_id;
}

// 停止智能体
export async function stopAgent(agentId: string): Promise<void> {
  await fetch(`${CONVOAI_BASE}/projects/${APP_ID}/agents/${agentId}/leave`, {
    method: "POST",
    headers: { Authorization: basicAuth() },
  });
}

// 用 OpenAI 兼容的国内 LLM（默认智谱）总结转写文本
export async function summarizeTranscript(transcript: string): Promise<string> {
  const url =
    process.env.AGORA_LLM_URL ??
    "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  const key = process.env.AGORA_LLM_API_KEY ?? process.env.ZHIPU_API_KEY ?? "";
  const model = process.env.AGORA_LLM_MODEL ?? "glm-4-flash";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "你是一名会议纪要助手。请用简洁的中文总结下面的对话，提炼要点、结论和待办事项。",
        },
        { role: "user", content: transcript },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`summarizeTranscript 失败 (${res.status}): ${await res.text()}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "";
}
