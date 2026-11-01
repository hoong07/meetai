# 智谱 GLM-Realtime 最小可跑 demo

零依赖的 Node.js 脚本，把本地 WAV 实时流式发给智谱 GLM-Realtime，再把模型返回的语音存成 WAV。

## 前置条件

- Node.js >= 22（脚本用 Node 内置的全局 `WebSocket`，已在 Node 24 上验证可自定义 header）。
- 一个智谱 API Key（bigmodel.cn 开放平台，需开通 GLM-Realtime / 实时音视频通话）。

## 快速开始

```bash
# 1. 生成一段测试语音（macOS 自带 say，普通话 Ting-Ting）
say -v Ting-Ting --data-format=LEI16@16000 --file-format=WAVE \
    -o input.wav "你好，请问今天天气怎么样？"

# 2. 跑 demo
export ZHIPU_API_KEY=你的智谱APIKey
node glm-realtime-demo.mjs --input input.wav --output output.wav
```

成功后会在当前目录生成 `output.wav`（24kHz 单声道 16bit），同时打印模型的语音转写（参考）和 token 用量。

```bash
# 播放（macOS）
afplay output.wav
```

## 参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `--input` | `input.wav` | 输入音频，16000/24000 Hz、单声道、16bit PCM WAV |
| `--output` | `output.wav` | 输出音频 |
| `--api-key` | — | 智谱 Key（也可用环境变量 `ZHIPU_API_KEY` / `GLM_API_KEY` / `ZAI_API_KEY`） |
| `--model` | `glm-realtime` | 可选 `glm-realtime-flash` / `glm-realtime-air` |
| `--voice` | `tongtong` | 音色，如 `female-tianmei`、`male-qn-daxuesheng`、`male-qn-jingying` |
| `--instructions` | 内置教学老师提示词 | 系统提示词 |
| `--mode` | `client-vad` | `client-vad`（整段提交）或 `server-vad`（服务端自动判定/打断） |
| `--verbose` | — | 打印所有事件 |
| `--help` | — | 帮助 |

## 关键协议点（对接后续 bridge 用）

- 连接：`wss://open.bigmodel.cn/api/paas/v4/realtime`
- 鉴权：握手 header `Authorization: Bearer <Key>`
- 输入音频：`input_audio_buffer.append`（base64，100ms/帧，10 帧/秒）
- 输出音频：`response.audio.delta`（base64，**24kHz 单声道 16bit PCM**）
- VAD：
  - `client_vad`：`append` → `input_audio_buffer.commit` → `response.create`
  - `server_vad`：`turn_detection: { type: "server_vad", create_response: true, interrupt_response: true }`，用户开口自动打断
- 结束：`response.done`（含 `usage`），另注意处理 `error` / `heartbeat`

## 注意

- 浏览器无法在 WebSocket 握手加 header，所以 GLM-Realtime 必须在 Node/服务端连。
- 输入只支持 16k 或 24k 单声道 16bit PCM；脚本已内置校验。
- 输出固定 24kHz 单声道 16bit，脚本直接按此写 WAV。
