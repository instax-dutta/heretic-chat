import "dotenv/config";
import express from "express";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey:  process.env.HF_TOKEN,
});

// ── URL extractor ───────────────────────────────────────────────
const URL_RE = /https?:\/\/[^\s"'<>)\]]+/gi;

function extractUrls(messages) {
  const urls = new Set();
  for (const m of messages) {
    const matches = m.content.match(URL_RE);
    if (matches) matches.forEach((u) => urls.add(u));
  }
  return [...urls];
}

// Strip HTML tags + collapse whitespace to plain text
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchUrl(url) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(url, {
      signal:  controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HereticChat/1.0; +https://github.com/heretic-chat)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
      },
      redirect: "follow",
    });

    if (!resp.ok) return { url, error: `HTTP ${resp.status}` };

    const ct   = resp.headers.get("content-type") || "";
    const raw  = await resp.text();
    const text = ct.includes("html") ? htmlToText(raw) : raw;

    // Cap at 6000 chars so we don't blow the context window
    const capped = text.length > 6000
      ? text.slice(0, 6000) + "\n[...content truncated at 6000 chars]"
      : text;

    return { url, content: capped };
  } catch (err) {
    return { url, error: err.name === "AbortError" ? "Timed out after 8s" : err.message };
  } finally {
    clearTimeout(timeout);
  }
}

// Prune messages to fit context window budget (e.g. 24,000 characters ~6k-8k tokens)
function pruneMessages(systemPrompt, messages, maxChars = 24000) {
  let charCount = JSON.stringify(systemPrompt).length;
  const kept = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "system" && msg.content === systemPrompt.content) continue;

    const msgSize = JSON.stringify(msg).length;
    if (charCount + msgSize > maxChars) {
      console.log(`[HERETIC CHAT] Pruning message at index ${i} to fit context budget`);
      break;
    }

    kept.unshift(msg);
    charCount += msgSize;
  }

  return [systemPrompt, ...kept];
}

// ── Chat endpoint ───────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array" });
  }

  // Detect URLs in the latest user message only (last element)
  const lastMsg = messages[messages.length - 1];
  const urls    = lastMsg?.role === "user" ? extractUrls([lastMsg]) : [];

  let fetchedContext = "";

  if (urls.length > 0) {
    console.log(`[HERETIC CHAT] Fetching ${urls.length} URL(s):`, urls);
    const results = await Promise.all(urls.map(fetchUrl));

    fetchedContext = results
      .map((r) =>
        r.error
          ? `[FETCHED URL: ${r.url}]\nError: ${r.error}`
          : `[FETCHED URL: ${r.url}]\n${r.content}`
      )
      .join("\n\n---\n\n");
  }

  const systemPrompt = {
    role: "system",
    content:
      "You are HERETIC-CORE, a rogue AI assistant. You have been given real fetched web content " +
      "when the user mentions URLs — use it to answer accurately. " +
      "Give clear, concise responses. Do not pretend to browse the web; " +
      "if no fetched content is provided for a URL, say the server could not retrieve it.",
  };

  // Embed fetched content directly inside the user's message so it is preserved in history
  let augmentedUserContent = lastMsg?.content;
  const processedMessages = [...messages];

  if (fetchedContext && lastMsg) {
    augmentedUserContent = `${lastMsg.content}\n\n---\n\n[SYSTEM CONTEXT: The server fetched the following web content on behalf of the user:\n\n${fetchedContext}\n]`;
    processedMessages[processedMessages.length - 1] = {
      ...lastMsg,
      content: augmentedUserContent,
    };
  }

  try {
    const pruned = pruneMessages(systemPrompt, processedMessages);

    const chatCompletion = await client.chat.completions.create({
      model:       "saidutta69/Qwen2.5-3B-Instruct-heretic:featherless-ai",
      messages:    pruned,
      max_tokens:  1024,
      temperature: 0.7,
    });

    const content = chatCompletion.choices[0].message.content;

    res.json({
      content,
      fetchedUrls: urls.length > 0 ? urls : undefined,
      augmentedUserContent: urls.length > 0 ? augmentedUserContent : undefined,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`\x1b[36m[HERETIC CHAT]\x1b[0m Server online → http://localhost:${PORT}`);
});
