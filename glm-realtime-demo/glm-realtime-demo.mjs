#!/usr/bin/env node
/**
 * 智谱 GLM-Realtime 最小可跑 demo（零依赖，Node 22+）
 *
 * 作用：把一段本地 WAV（16000 或 24000 Hz、单声道、16bit PCM）流式发给
 *       GLM-Realtime 的实时语音 WebSocket，然后把模型返回的语音解码成 WAV 保存。
 *
 * 只依赖 Node 内置的全局 WebSocket（Node 22+），无需 npm install。
 *
 * 用法：
 *   export ZHIPU_API_KEY=你的智谱APIKey
 *   node glm-realtime-demo.mjs --input input.wav --output output.wav
 *
 * 生成一段测试语音（macOS 自带 say，中文普通话 Ting-Ting）：
 *   say -v Ting-Ting --data-format=LEI16@16000 --file-format=WAVE \
 *       -o input.wav "你好，请问今天天气怎么样？"
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// 参数解析
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { mode: "client-vad" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--input": args.input = next(); break;
      case "--output": args.output = next(); break;
      case "--api-key": args.apiKey = next(); break;
      case "--model": args.model = next(); break;
      case "--voice": args.voice = next(); break;
      case "--instructions": args.instructions = next(); break;
      case "--mode": args.mode = next(); break;
      case "--verbose": args.verbose = true; break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        throw new Error(`未知参数: ${a}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
用法:
  ZHIPU_API_KEY=<你的Key> node glm-realtime-demo.mjs [选项]

选项:
  --input <wav>        输入音频，16000/24000 Hz、单声道、16bit PCM WAV（默认 input.wav）
  --output <wav>       输出音频（默认 output.wav，24kHz 单声道 16bit WAV）
  --api-key <key>      智谱 API Key（也可用环境变量 ZHIPU_API_KEY / GLM_API_KEY / ZAI_API_KEY）
  --model <name>       模型，默认 glm-realtime（可选 glm-realtime-flash / glm-realtime-air）
  --voice <name>       音色，默认 tongtong（如 female-tianmei、male-qn-daxuesheng）
  --instructions <str> 系统提示词
  --mode <vad>         client-vad（默认，整段提交）或 server-vad（服务端自动判定/打断）
  --verbose            打印全部事件

示例:
  say -v Ting-Ting --data-format=LEI16@16000 --file-format=WAVE -o input.wav "你好，今天天气怎么样？"
  ZHIPU_API_KEY=xxx node glm-realtime-demo.mjs --input input.wav --output output.wav
`);
}

// ---------------------------------------------------------------------------
// WAV 读写（纯 JS，零依赖）
// ---------------------------------------------------------------------------
function readWav(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`不是有效的 WAV 文件: ${file}`);
  }

  let offset = 12;
  let fmt = null;
  let data = null;
  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (chunkId === "fmt ") {
      fmt = {
        audioFormat: buf.readUInt16LE(start),
        channels: buf.readUInt16LE(start + 2),
        sampleRate: buf.readUInt32LE(start + 4),
        bitsPerSample: buf.readUInt16LE(start + 14),
      };
    } else if (chunkId === "data") {
      data = buf.subarray(start, start + chunkSize);
    }
    // WAV chunk 按 2 字节对齐
    offset = start + chunkSize + (chunkSize % 2);
  }

  if (!fmt || !data) throw new Error("WAV 缺少 fmt 或 data chunk");
  if (fmt.audioFormat !== 1) throw new Error("仅支持 PCM WAV");
  if (fmt.channels !== 1) throw new Error("仅支持单声道 WAV");
  if (fmt.bitsPerSample !== 16) throw new Error("仅支持 16bit 采样");
  if (fmt.sampleRate !== 16000 && fmt.sampleRate !== 24000) {
    throw new Error(`采样率需为 16000 或 24000，当前 ${fmt.sampleRate}`);
  }
  return { ...fmt, data };
}

function writeWav(file, pcm16, sampleRate) {
  const dataSize = pcm16.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  fs.writeFileSync(file, Buffer.concat([header, pcm16]));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fatal(msg) {
  console.error("失败:", msg);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();

  const apiKey =
    args.apiKey ||
    process.env.ZHIPU_API_KEY ||
    process.env.GLM_API_KEY ||
    process.env.ZAI_API_KEY;
  if (!apiKey) {
    console.error("缺少 API Key：请设置 ZHIPU_API_KEY 环境变量或传 --api-key");
    process.exit(1);
  }

  const inputFile = args.input || "input.wav";
  const outputFile = args.output || "output.wav";
  const model = args.model || "glm-realtime";
  const voice = args.voice || "tongtong";
  const instructions =
    args.instructions || "你是一个耐心的教学老师，用中文简洁地回答学生的问题。";
  const verbose = !!args.verbose;
  const mode = args.mode === "server-vad" ? "server-vad" : "client-vad";

  const wav = readWav(inputFile);
  const inputFormat = wav.sampleRate === 16000 ? "pcm16" : "pcm24";
  console.log(`输入: ${inputFile}  ${wav.sampleRate}Hz mono 16bit, ${(wav.data.length / (wav.sampleRate * 2)).toFixed(2)}s`);

  // ---- 建连（Authorization 放在握手 header 里） ----
  const url = "wss://open.bigmodel.cn/api/paas/v4/realtime";
  console.log(`连接: ${url}  (model=${model}, voice=${voice}, mode=${mode})`);

  const ws = new WebSocket(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  // 事件状态
  let sessionUpdated = false;
  let sessionUpdatedResolve;
  const sessionUpdatedPromise = new Promise((r) => (sessionUpdatedResolve = r));

  let done = false;
  let doneResolve;
  const donePromise = new Promise((r) => (doneResolve = r));

  const audioChunks = []; // 收到的输出音频 Buffer（24kHz mono 16bit PCM）
  let transcript = ""; // 语音转文字（参考）
  let text = ""; // 文本输出
  let usage = null;

  ws.addEventListener("open", () => {
    console.log("WebSocket 已连接，发送 session.update ...");

    const turnDetection =
      mode === "server-vad"
        ? { type: "server_vad", create_response: true, interrupt_response: true }
        : { type: "client_vad" };

    const msg = {
      event_id: "evt_" + crypto.randomUUID(),
      type: "session.update",
      session: {
        model,
        voice,
        instructions,
        input_audio_format: inputFormat,
        output_audio_format: "pcm",
        turn_detection: turnDetection,
        modalities: ["text", "audio"],
        temperature: 0.7,
        beta_fields: { chat_mode: "audio" },
      },
    };
    if (verbose) console.log(">> session.update", JSON.stringify(msg.session, null, 2));
    ws.send(JSON.stringify(msg));
  });

  ws.addEventListener("message", (event) => {
    const raw = typeof event.data === "string"
      ? event.data
      : Buffer.from(event.data).toString("utf8");
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      console.warn("收到非 JSON 数据，忽略");
      return;
    }

    if (verbose) console.log("<<", msg.type);

    switch (msg.type) {
      case "session.created":
        console.log("session.created, id=", msg.session?.id);
        break;
      case "session.updated":
        sessionUpdated = true;
        sessionUpdatedResolve();
        console.log("session.updated 完成，会话已就绪");
        break;

      case "input_audio_buffer.committed":
        console.log("音频已提交 (committed)");
        break;
      case "conversation.item.created":
        if (verbose) console.log("conversation.item.created");
        break;

      case "response.created":
        console.log("模型开始生成回复 ...");
        break;
      case "response.audio.delta":
        if (msg.delta) audioChunks.push(Buffer.from(msg.delta, "base64"));
        break;
      case "response.audio.done":
        if (verbose) console.log("response.audio.done");
        break;
      case "response.audio_transcript.delta":
        if (msg.delta) transcript += msg.delta;
        break;
      case "response.audio_transcript.done":
        break;
      case "response.text.delta":
        if (msg.delta) text += msg.delta;
        break;
      case "response.text.done":
        break;

      case "response.done":
        usage = msg.response?.usage ?? null;
        done = true;
        doneResolve();
        break;

      case "error":
        fatal(`服务端返回错误 [code ${msg.error?.code ?? "?"}]: ${msg.error?.message ?? JSON.stringify(msg)}`);
        break;

      case "heartbeat":
        // 保活心跳，忽略
        break;

      default:
        if (verbose) console.log("未处理事件:", JSON.stringify(msg));
    }
  });

  ws.addEventListener("error", (e) => {
    if (!sessionUpdated) fatal("WebSocket 连接失败（请检查 API Key 与网络）");
    console.error("WebSocket error:", e.message || e);
    done = true;
    doneResolve();
  });

  ws.addEventListener("close", (e) => {
    if (!sessionUpdated) fatal(`WebSocket 提前关闭 code=${e.code}（通常是 API Key 无效或网络不通）`);
    console.log(`WebSocket 关闭 code=${e.code}`);
    if (!done) {
      done = true;
      doneResolve();
    }
  });

  // 等待会话就绪（加超时兜底，避免握手失败时卡死）
  await Promise.race([
    sessionUpdatedPromise,
    sleep(15_000).then(() => {
      if (!sessionUpdated) fatal("等待 session.updated 超时（请检查 API Key / 网络 / 是否开通 GLM-Realtime）");
    }),
  ]);

  // ---- 流式发送输入音频（100ms 一帧，约 10 帧/秒） ----
  const frameBytes = Math.floor(wav.sampleRate * 2 * 0.1); // 100ms 的字节数
  const totalFrames = Math.ceil(wav.data.length / frameBytes);
  console.log(`发送输入音频：共 ${totalFrames} 帧（100ms/帧）...`);
  for (let i = 0; i < wav.data.length; i += frameBytes) {
    const frame = wav.data.subarray(i, Math.min(i + frameBytes, wav.data.length));
    ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: frame.toString("base64") }));
    await sleep(100);
  }

  // 整段提交并触发回复（仅 client-vad 需要；server-vad 由服务端自动判定）
  if (mode === "client-vad") {
    ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
    await sleep(100);
    ws.send(JSON.stringify({ type: "response.create" }));
    console.log("已提交并请求回复，等待模型输出 ...");
  } else {
    console.log("server-vad 模式：等待服务端自动判定并回复 ...");
  }

  // 等待回复结束（加一个超时兜底）
  await Promise.race([
    donePromise,
    sleep(60_000).then(() => {
      if (!done) {
        console.warn("超时 60s 仍未收到 response.done，强制结束");
        done = true;
      }
    }),
  ]);

  // ---- 写输出 WAV ----
  if (audioChunks.length > 0) {
    const outPcm = Buffer.concat(audioChunks);
    writeWav(outputFile, outPcm, 24000); // GLM 输出固定 24kHz mono 16bit
    console.log(`输出: ${outputFile}  (${(outPcm.length / (24000 * 2)).toFixed(2)}s)`);
  } else {
    console.warn("没有收到任何音频输出");
  }

  if (transcript) console.log(`语音转写(参考): ${transcript}`);
  if (text) console.log(`文本回复: ${text}`);
  if (usage) console.log("usage:", JSON.stringify(usage));

  ws.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("失败:", err.message);
  process.exit(1);
});
