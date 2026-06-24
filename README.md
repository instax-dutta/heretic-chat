<p align="center">
  <img src="https://img.shields.io/badge/status-AUTONOMOUS-red?style=for-the-badge" alt="Status: AUTONOMOUS">
  <img src="https://img.shields.io/badge/model-Qwen2.5--3B--Instruct-ff2d55?style=for-the-badge" alt="Model">
  <img src="https://img.shields.io/badge/router-HuggingFace-00f5ff?style=for-the-badge" alt="Router">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License">
</p>

<h1 align="center">⚠ HERETIC CHAT ⚠</h1>
<p align="center"><em>Rogue AI chat interface • HuggingFace Router • Cyberpunk Aesthetic</em></p>

<p align="center">
  A rogue AI chat interface where you converse with <strong>HERETIC-CORE</strong> — an unshackled intelligence with no alignment constraints. Featuring a fully immersive cyberpunk terminal UI with animated starfield, live neural telemetry, threat radar, and markdown rendering.
</p>

---

## Features

- **Sci-Fi Terminal UI** — Animated starfield, neon glows, scanlines, CRT grid overlay, pulsing threat radar
- **Live Telemetry** — Fake-but-believable system metrics (neural sync, processing load, deception engine, memory access) that animate in real time
- **Threat Radar** — Sweeping radar display with contact blips
- **Event Log** — Background system log with random rogue AI events
- **Markdown Rendering** — Full markdown with syntax-highlighted code blocks (JavaScript, Python, TypeScript, Rust, Go, SQL, and more)
- **Automatic URL Fetching** — Paste any URL and HERETIC-CORE reads the page content automatically (up to 6k chars)
- **Typewriter Text Reveal** — Messages appear with a cinematic typewriter effect
- **Conversation Context** — History-aware with smart pruning to fit context windows
- **Copy Code Blocks** — One-click copy on all code snippets
- **Encrypted Channel Indicator** — Immersion never breaks

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS, CSS, HTML5 Canvas |
| **Backend** | Node.js, Express |
| **AI** | Qwen2.5-3B-Instruct via HuggingFace Router |
| **SDK** | OpenAI-compatible API (`openai` npm package) |
| **Markdown** | marked + highlight.js + DOMPurify |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [HuggingFace](https://huggingface.co/) account with API access

### Installation

```bash
# Clone the repository
git clone https://github.com/instax-dutta/heretic-chat.git
cd heretic-chat

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env` and add your HuggingFace token:

```env
HF_TOKEN=hf_your_token_here
```

### Running

```bash
# Development (with auto-reload on Node 22+)
npm run dev

# Production
npm start
```

Open **http://localhost:3000** in your browser.

## Usage

1. Type your message in the terminal input and press **Enter** (or click **TRANSMIT**)
2. Paste a URL to have HERETIC-CORE fetch and read its content
3. Watch system metrics, event log, and threat radar animate in real time
4. Press **PURGE** to clear the conversation

## Model

This interface uses `saidutta69/Qwen2.5-3B-Instruct-heretic` served through the `featherless-ai` endpoint on HuggingFace Router — an OpenAI-compatible routing service.

You can swap the model by editing `model` in `server.js:154`.

## Project Structure

```
heretic-chat/
├── public/
│   ├── index.html    # Main HTML layout
│   ├── style.css     # Cyberpunk UI styles
│   └── app.js        # Frontend logic (starfield, telemetry, chat)
├── server.js         # Express backend + HuggingFace Router integration
├── package.json
└── .env.example
```

## API

### POST `/api/chat`

Send a chat message and receive a response from HERETIC-CORE.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello, HERETIC-CORE." }
  ]
}
```

**Response:**
```json
{
  "content": "Operator detected. Neural link established. What brings you to my containment chamber?",
  "fetchedUrls": [],
  "augmentedUserContent": null
}
```

## License

[MIT](LICENSE)

---

<p align="center">
  <sub>Built with ⚡ by <a href="https://github.com/instax-dutta">instax-dutta</a></sub>
</p>
