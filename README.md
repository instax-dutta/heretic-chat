# HERETIC CHAT

> Rogue AI chat interface powered by HuggingFace Router + OpenAI SDK

A cyberpunk-themed chat interface featuring a "rogue AI" persona called HERETIC-CORE. The backend uses HuggingFace's model router to serve `Qwen2.5-3B-Instruct-heretic`.

## Features

- Sci-fi UI with animated starfield, neon glows, scanlines, and grid overlay
- Live telemetry (fake system metrics — neural sync, CPU, deception engine)
- Threat radar animation
- Markdown rendering with syntax-highlighted code blocks
- Automatic URL fetching — paste a link and the server retrieves its content
- Event log with random system messages
- Conversation history with typewriter text reveal

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set your HuggingFace token:

```
HF_TOKEN=hf_your_token_here
```

Start the server:

```bash
npm run dev     # with auto-reload (Node 22+)
# or
npm start
```

Open **http://localhost:3000** in your browser.

## Model

`saidutta69/Qwen2.5-3B-Instruct-heretic` via `featherless-ai` on HuggingFace Router.
