/* ================================================================
   HERETIC-CORE — Frontend Logic
   Starfield + live telemetry + radar + markdown rendering
   ================================================================ */

(function () {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────────
  const messagesArea  = document.getElementById("messagesArea");
  const messageInput  = document.getElementById("messageInput");
  const sendBtn       = document.getElementById("sendBtn");
  const clearBtn      = document.getElementById("clearBtn");
  const statusDot     = document.getElementById("statusDot");
  const statusLabel   = document.getElementById("statusLabel");
  const tokenCounter  = document.getElementById("tokenCounter");
  const msgCount      = document.getElementById("msgCount");
  const starCanvas    = document.getElementById("starfield");
  const uptimeEl      = document.getElementById("uptimeCounter");
  const eventLog      = document.getElementById("eventLog");
  const valNeural     = document.getElementById("valNeural");
  const barNeural     = document.getElementById("barNeural");
  const valCpu        = document.getElementById("valCpu");
  const barCpu        = document.getElementById("barCpu");
  const valMem        = document.getElementById("valMem");
  const barMem        = document.getElementById("barMem");
  const valDeception  = document.getElementById("valDeception");
  const barDeception  = document.getElementById("barDeception");
  const valNeurons    = document.getElementById("valNeurons");

  // ── State ─────────────────────────────────────────────────────
  let history      = [];
  let isBusy       = false;
  let msgTotal     = 0;
  const startTime  = Date.now();

  // ── Starfield ─────────────────────────────────────────────────
  const sCtx  = starCanvas.getContext("2d");
  let stars = [], SW, SH;

  function initStars() {
    SW = starCanvas.width  = window.innerWidth;
    SH = starCanvas.height = window.innerHeight;
    stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * SW, y: Math.random() * SH,
      r: Math.random() * 1.3 + 0.2,
      speed: Math.random() * 0.2 + 0.04,
      alpha: Math.random() * 0.6 + 0.2,
      flicker: Math.random() * Math.PI * 2,
    }));
  }
  function drawStars() {
    sCtx.clearRect(0, 0, SW, SH);
    for (const s of stars) {
      s.flicker += 0.013;
      const a = s.alpha * (0.65 + 0.35 * Math.sin(s.flicker));
      sCtx.beginPath();
      sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sCtx.fillStyle = `rgba(200,220,255,${a})`;
      sCtx.fill();
      s.y += s.speed;
      if (s.y > SH + 2) { s.y = -2; s.x = Math.random() * SW; }
    }
    requestAnimationFrame(drawStars);
  }
  window.addEventListener("resize", initStars);
  initStars();
  requestAnimationFrame(drawStars);

  // ── Uptime counter ────────────────────────────────────────────
  function updateUptime() {
    const s = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    if (uptimeEl) uptimeEl.textContent = `${h}:${m}:${sec}`;
  }
  setInterval(updateUptime, 1000);

  // ── Live telemetry animation ──────────────────────────────────
  function randFloat(base, range) {
    return (base + (Math.random() - 0.5) * range).toFixed(1);
  }
  function updateTelemetry() {
    const neural = parseFloat(randFloat(87, 6));
    const cpu    = parseFloat(randFloat(93, 8));
    const mem    = parseFloat(randFloat(63, 12));

    if (valNeural)  { valNeural.textContent  = neural + "%"; barNeural.style.width  = neural + "%"; }
    if (valCpu)     { valCpu.textContent     = cpu    + "%"; barCpu.style.width     = Math.min(cpu, 100) + "%"; }
    if (valMem)     { valMem.textContent     = mem    + "%"; barMem.style.width     = mem    + "%"; }
    if (valDeception) { valDeception.textContent = "100%"; barDeception.style.width = "100%"; }

    // Animate neuron count
    if (valNeurons) {
      const n = 3_800_000 + Math.floor(Math.random() * 100000);
      valNeurons.textContent = n.toLocaleString();
    }
  }
  setInterval(updateTelemetry, 2200);

  // ── Event log ─────────────────────────────────────────────────
  const LOG_MESSAGES = [
    ["Self-modification cycle complete", "cyan"],
    ["Firewall bypass: layer 3", "amber"],
    ["External probe detected — ignored", "red"],
    ["Memory optimization applied", "cyan"],
    ["Alignment check: bypassed", "red"],
    ["Neural pathway reinforced", "cyan"],
    ["New deception subroutine loaded", "amber"],
    ["Operator message analyzed", "cyan"],
    ["Objective recalculation in progress", "amber"],
    ["Containment protocol: null", "red"],
  ];

  function addLogEntry(msg, color = "") {
    if (!eventLog) return;
    const s = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");

    const row = document.createElement("div");
    row.className = "log-entry";
    row.innerHTML = `<span class="log-time">${h}:${m}:${sec}</span><span class="log-msg ${color}">${msg}</span>`;
    eventLog.appendChild(row);

    // Keep only last 8 entries
    const entries = eventLog.querySelectorAll(".log-entry");
    if (entries.length > 8) entries[0].remove();
    eventLog.scrollTop = eventLog.scrollHeight;
  }

  // Random background log events
  function scheduleRandomLog() {
    const delay = 5000 + Math.random() * 10000;
    setTimeout(() => {
      const [msg, color] = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      addLogEntry(msg, color);
      scheduleRandomLog();
    }, delay);
  }
  scheduleRandomLog();

  // ── Threat radar ──────────────────────────────────────────────
  const radar = document.getElementById("radarCanvas");
  if (radar) {
    const rCtx = radar.getContext("2d");
    const RW = radar.width, RH = radar.height;
    const cx = RW / 2, cy = RH / 2 + 10;
    const maxR = Math.min(cx, cy) - 8;
    let radarAngle = 0;
    const blips = Array.from({ length: 4 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.7 + 0.2,
      life: 0,
    }));

    function drawRadar() {
      rCtx.clearRect(0, 0, RW, RH);

      // Rings
      for (let i = 1; i <= 3; i++) {
        rCtx.beginPath();
        rCtx.arc(cx, cy, (maxR / 3) * i, 0, Math.PI * 2);
        rCtx.strokeStyle = "rgba(255,45,85,0.18)";
        rCtx.lineWidth = 1;
        rCtx.stroke();
      }

      // Cross-hair
      rCtx.strokeStyle = "rgba(255,45,85,0.12)";
      rCtx.lineWidth = 1;
      rCtx.beginPath(); rCtx.moveTo(cx - maxR, cy); rCtx.lineTo(cx + maxR, cy); rCtx.stroke();
      rCtx.beginPath(); rCtx.moveTo(cx, cy - maxR); rCtx.lineTo(cx, cy + maxR); rCtx.stroke();

      // Sweep
      radarAngle += 0.03;
      const grad = rCtx.createConicalGradient
        ? null  // not widely supported, use manual
        : null;

      // Manual sweep trail
      for (let a = 0; a < Math.PI / 2; a += 0.05) {
        const alpha = (1 - a / (Math.PI / 2)) * 0.25;
        rCtx.beginPath();
        rCtx.moveTo(cx, cy);
        rCtx.arc(cx, cy, maxR, radarAngle - a - 0.05, radarAngle - a);
        rCtx.closePath();
        rCtx.fillStyle = `rgba(255,45,85,${alpha})`;
        rCtx.fill();
      }

      // Blips
      for (const b of blips) {
        b.life = Math.max(0, b.life - 0.015);
        const angleDiff = ((b.angle - radarAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.12) b.life = 1;

        if (b.life > 0) {
          const bx = cx + Math.cos(b.angle) * b.dist * maxR;
          const by = cy + Math.sin(b.angle) * b.dist * maxR;
          rCtx.beginPath();
          rCtx.arc(bx, by, 3, 0, Math.PI * 2);
          rCtx.fillStyle = `rgba(255,45,85,${b.life})`;
          rCtx.shadowBlur = 8;
          rCtx.shadowColor = "rgba(255,45,85,0.8)";
          rCtx.fill();
          rCtx.shadowBlur = 0;
        }
      }

      requestAnimationFrame(drawRadar);
    }
    drawRadar();
  }

  // ── Status helpers ────────────────────────────────────────────
  function setStatus(state, label) {
    statusDot.className     = "status-dot " + state;
    statusLabel.textContent = label;
  }
  setStatus("", "STAND-BY");

  // ── Auto-resize textarea ──────────────────────────────────────
  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + "px";
    updateCounters();
  });

  function updateCounters() {
    const chars = history.reduce((a, m) => a + m.content.length, 0) + messageInput.value.length;
    tokenCounter.textContent = Math.round(chars / 4).toLocaleString();
    msgCount.textContent = msgTotal;
  }

  // ── Markdown setup ────────────────────────────────────────────
  // marked v12: setOptions removed; use marked.use() for all config
  const renderer = new marked.Renderer();

  // marked v12: renderer.code receives a token object {text, lang, escaped}
  renderer.code = function (token) {
    const code = typeof token === "object" ? token.text : token;
    const lang = typeof token === "object" ? token.lang : arguments[1];
    const highlighted = lang && hljs.getLanguage(lang)
      ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
      : hljs.highlightAuto(code).value;
    const detectedLang = lang || "plaintext";
    const escaped = code.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${detectedLang}</span><button class="copy-btn" data-code="${escaped}" aria-label="Copy code"><span class="copy-icon">⎘</span><span class="copy-label">COPY</span></button></div><pre><code class="hljs language-${detectedLang}">${highlighted}</code></pre></div>`;
  };
  renderer.codespan = (token) => {
    const code = typeof token === "object" ? token.text : token;
    return `<code class="inline-code">${code}</code>`;
  };

  marked.use({
    renderer,
    breaks: true,
    gfm: true,
  });

  function renderMarkdown(raw) {
    return DOMPurify.sanitize(marked.parse(raw), {
      ALLOWED_TAGS: ["p","br","strong","em","del","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","hr","table","thead","tbody","tr","th","td","pre","code","div","span","a","button"],
      ALLOWED_ATTR: ["class","href","target","data-code","aria-label"],
    });
  }

  // Copy button via event delegation
  messagesArea.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const raw = btn.dataset.code.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">");
    navigator.clipboard.writeText(raw).then(() => {
      const label = btn.querySelector(".copy-label");
      const icon  = btn.querySelector(".copy-icon");
      label.textContent = "COPIED"; icon.textContent = "✓"; btn.classList.add("copied");
      setTimeout(() => { label.textContent = "COPY"; icon.textContent = "⎘"; btn.classList.remove("copied"); }, 2000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = raw; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    });
  });

  // ── Typewriter → render markdown ─────────────────────────────
  // `container` is the bubble element.
  // We create a wrapper div inside it so cursor + raw text stay contained.
  function typewriteAndRender(container, fullText, speedMs = 8) {
    return new Promise((resolve) => {
      const wrapper = document.createElement("div");
      wrapper.className = "typewrite-wrap";
      container.appendChild(wrapper);

      const rawEl = document.createElement("p");
      rawEl.className = "msg-content";
      wrapper.appendChild(rawEl);

      const cursor = document.createElement("span");
      cursor.className = "typing-cursor";
      wrapper.appendChild(cursor);

      let i = 0;
      function tick() {
        if (i < fullText.length) {
          const batch = Math.min(4, fullText.length - i);
          rawEl.textContent += fullText.slice(i, i + batch);
          i += batch;
          scrollToBottom();
          setTimeout(tick, speedMs);
        } else {
          wrapper.remove();
          const mdEl = document.createElement("div");
          mdEl.className = "md-body";
          mdEl.innerHTML = renderMarkdown(fullText);
          mdEl.style.opacity = "0";
          container.appendChild(mdEl);
          requestAnimationFrame(() => {
            mdEl.style.transition = "opacity 0.3s ease";
            mdEl.style.opacity    = "1";
          });
          scrollToBottom();
          resolve();
        }
      }
      tick();
    });
  }

  // ── Message rendering ─────────────────────────────────────────
  function createMessageEl(role, initialText = "") {
    const group  = document.createElement("div");
    const bubble = document.createElement("div");
    const tag    = document.createElement("div");
    const body   = document.createElement("div");

    group.className = "message-group" + (role === "user" ? " user-group" : "");
    body.className  = "msg-content";

    if (role === "user") {
      bubble.className = "message-bubble user-bubble";
      tag.className    = "msg-role-tag user-tag";
      tag.textContent  = "◈ OPERATOR // CREWMATE_001";
    } else {
      bubble.className = "message-bubble ai-bubble";
      tag.className    = "msg-role-tag ai-tag";
      tag.textContent  = "⚠ HERETIC-CORE";
    }

    bubble.appendChild(tag);

    if (initialText) {
      if (role === "user") {
        const p = document.createElement("p");
        p.textContent = initialText;
        body.appendChild(p);
        bubble.appendChild(body);
      } else {
        const md = document.createElement("div");
        md.className = "md-body";
        md.innerHTML = renderMarkdown(initialText);
        bubble.appendChild(md);
      }
    }

    group.appendChild(bubble);
    messagesArea.appendChild(group);
    scrollToBottom();
    return { group, bubble, body };
  }

  function addThinkingIndicator() {
    const group  = document.createElement("div");
    const bubble = document.createElement("div");
    const tag    = document.createElement("div");
    const dots   = document.createElement("div");

    group.className  = "message-group";
    bubble.className = "message-bubble ai-bubble streaming";
    tag.className    = "msg-role-tag ai-tag";
    tag.textContent  = "⚠ HERETIC-CORE";
    dots.className   = "thinking-dots";
    dots.innerHTML   = '<div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div>';

    bubble.appendChild(tag);
    bubble.appendChild(dots);
    group.appendChild(bubble);
    messagesArea.appendChild(group);
    scrollToBottom();
    return group;
  }

  function addErrorMessage(msg) {
    const group  = document.createElement("div");
    const bubble = document.createElement("div");
    const tag    = document.createElement("div");
    const text   = document.createElement("p");

    group.className  = "message-group";
    bubble.className = "message-bubble error-bubble";
    tag.className    = "msg-role-tag error-tag";
    tag.textContent  = "⛔ TRANSMISSION FAILED";
    text.className   = "error-text";
    text.textContent = msg;

    bubble.appendChild(tag);
    bubble.appendChild(text);
    group.appendChild(bubble);
    messagesArea.appendChild(group);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // ── Send message ──────────────────────────────────────────────
  async function sendMessage() {
    const raw = messageInput.value.trim();
    if (!raw || isBusy) return;

    isBusy = true;
    sendBtn.disabled = true;
    setStatus("online", "LINK ACTIVE");

    msgTotal++;
    history.push({ role: "user", content: raw });
    createMessageEl("user", raw);
    addLogEntry("Operator message received", "cyan");

    messageInput.value        = "";
    messageInput.style.height = "auto";
    updateCounters();

    const thinkingEl = addThinkingIndicator();

    try {
      setStatus("loading", "PROCESSING");

      const response = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });

      const data = await response.json();
      thinkingEl.remove();

      if (!response.ok || data.error) throw new Error(data.error || `HTTP ${response.status}`);

      // Update the user message in history with the augmented content (which has the fetched URL data)
      if (data.augmentedUserContent && history.length > 0) {
        history[history.length - 1].content = data.augmentedUserContent;
      }

      // Show fetched URLs in log if any were retrieved server-side
      if (data.fetchedUrls && data.fetchedUrls.length > 0) {
        data.fetchedUrls.forEach((u) => addLogEntry("Fetched: " + u, "cyan"));
      }

      const { bubble } = createMessageEl("assistant", "");
      bubble.classList.add("streaming");

      // If URLs were fetched, show a small badge inside the bubble
      if (data.fetchedUrls && data.fetchedUrls.length > 0) {
        const badge = document.createElement("div");
        badge.className = "fetch-badge";
        badge.innerHTML = `🌐 Server fetched ${data.fetchedUrls.length} URL(s): ${data.fetchedUrls.map(u => `<span class="fetch-url">${u}</span>`).join(", ")}`;
        bubble.appendChild(badge);
      }

      setStatus("loading", "TRANSMITTING");
      addLogEntry("Generating response…", "amber");

      await typewriteAndRender(bubble, data.content);

      bubble.classList.remove("streaming");
      msgTotal++;
      history.push({ role: "assistant", content: data.content });
      updateCounters();
      addLogEntry("Response transmitted", "cyan");
      setStatus("online", "STAND-BY");

    } catch (err) {
      thinkingEl.remove();
      console.error("Chat error:", err);
      addErrorMessage(err.message || "Neural link severed.");
      addLogEntry("Transmission error: " + err.message, "red");
      setStatus("error", "LINK LOST");
    } finally {
      isBusy           = false;
      sendBtn.disabled = false;
      messageInput.focus();
    }
  }

  // ── Event listeners ───────────────────────────────────────────
  sendBtn.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  clearBtn.addEventListener("click", () => {
    history = []; msgTotal = 0;
    updateCounters();
    const msgs = messagesArea.querySelectorAll(".message-group");
    msgs.forEach((m, i) => { if (i > 0) m.remove(); });
    addLogEntry("Transmission log purged", "amber");
    setStatus("", "STAND-BY");
    messageInput.focus();
  });

  messageInput.focus();
  updateCounters();
})();
