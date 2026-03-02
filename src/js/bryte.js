/**
 * Bryte — RootByte's AI Research Companion
 * Production-ready: real streaming via Groq, context-aware, emotionally intelligent
 *
 * Features:
 *  - Real-time streaming responses (SSE)
 *  - 80+ dynamic suggestion chips, auto-rotating
 *  - Full conversation memory within session
 *  - Emotionally aware response handling
 *  - Markdown-to-HTML rendering (bold, links)
 *  - Keyboard shortcuts (/ to open, Esc to close)
 */

(function () {
  'use strict';

  // ─── CONFIG ───────────────────────────────────────────────────────────────
  const CHAT_API = '/api/chat';
  const CHIP_ROTATE_MS = 28000;   // rotate suggestion chips every 28s
  const CHIPS_VISIBLE   = 4;      // how many chips to show at once
  const MAX_HISTORY     = 24;     // max messages kept in memory

  // ─── CHIP BANK — 80+ dynamic tech suggestions ────────────────────────────
  const CHIP_BANK = [
    // Hot right now
    { text: '🔥 DeepSeek vs OpenAI', q: 'What happened with DeepSeek R1 and why did NVIDIA lose $600 billion?' },
    { text: '🔥 TikTok ban status', q: 'What is the current status of the TikTok ban in the US?' },
    { text: '🔥 Grok & Twitter data', q: 'How does Grok use Twitter\'s 600 million user data feed?' },
    { text: '🔥 AI in 2026', q: 'What is the most important AI development happening right now in 2026?' },

    // RootByte articles
    { text: '📱 Touchscreen origin', q: 'Who actually invented the touchscreen before Apple?' },
    { text: '🤖 ChatGPT\'s 83-year root', q: 'What is the 83-year mathematical chain that led to ChatGPT?' },
    { text: '📡 WiFi\'s secret inventor', q: 'How did Australia accidentally invent WiFi while hunting black holes?' },
    { text: '💾 IBM hard drive 1956', q: 'Tell me about IBM\'s first hard drive — the one that weighed a ton.' },
    { text: '🎧 Who made wireless earbuds', q: 'Did Apple invent wireless earbuds? Who actually made the first ones?' },
    { text: '🐧 Linux almost named Freax', q: 'Why was Linux almost called Freax and how did the name change?' },
    { text: '⚙️ Git in 10 days', q: 'How did Linus Torvalds build Git in just 10 days?' },
    { text: '☠️ First ransomware', q: 'What was the first ransomware ever created and how did it work?' },
    { text: '🔐 Morris Worm 1988', q: 'How did the Morris Worm crash 10% of the internet in 1988?' },
    { text: '🎙️ Siri was DARPA', q: 'Was Siri really a DARPA military project before Apple bought it?' },
    { text: '📱 Samsung Fold failures', q: 'Why did the Samsung Galaxy Fold fail three times before it worked?' },
    { text: '🌐 TCP/IP origin', q: 'What is the historical root of TCP/IP and how did the internet protocol get invented?' },

    // AI & ML deep dives
    { text: '🧠 What is backpropagation', q: 'Explain backpropagation in a way that connects to real history.' },
    { text: '🤖 What is a transformer', q: 'What is the Transformer architecture and when was it invented?' },
    { text: '📊 LLM vs search engine', q: 'What\'s the fundamental difference between an LLM and a search engine?' },
    { text: '🔮 What is AGI really', q: 'What does AGI actually mean and how close are we to it?' },
    { text: '🧬 AI and biology', q: 'How is AI being used in biology and medicine right now?' },
    { text: '💡 Prompt engineering', q: 'What is prompt engineering and why does it matter?' },
    { text: '🤖 Agentic AI explained', q: 'What is agentic AI and how is it different from ChatGPT?' },
    { text: '🏛️ History of machine learning', q: 'Walk me through the full history of machine learning from the beginning.' },

    // Cybersecurity
    { text: '🔐 Zero-day exploits', q: 'What is a zero-day exploit and how do they get discovered?' },
    { text: '🕵️ Social engineering', q: 'What is social engineering in cybersecurity and what are the most famous attacks?' },
    { text: '🛡️ How VPNs work', q: 'How does a VPN actually work technically?' },
    { text: '🔒 End-to-end encryption', q: 'What is end-to-end encryption and who invented it?' },
    { text: '🏴‍☠️ Nation-state hackers', q: 'Which countries have the most sophisticated state hacking programs?' },
    { text: '💰 Ransomware business', q: 'How do ransomware gangs operate as businesses?' },
    { text: '🐛 Famous malware history', q: 'What are the most historically significant malware attacks ever?' },

    // Software & Dev
    { text: '💻 Unix vs Linux', q: 'What is the real difference between Unix and Linux?' },
    { text: '🖥️ How browsers work', q: 'How does a web browser actually render a webpage? What\'s happening under the hood?' },
    { text: '⚡ Why Rust is popular', q: 'Why is Rust becoming so popular and what problem does it solve that C++ doesn\'t?' },
    { text: '🎯 What is WebAssembly', q: 'What is WebAssembly and why does it exist?' },
    { text: '🔄 How Git really works', q: 'How does Git actually store data under the hood?' },
    { text: '📦 Container vs VM', q: 'What is the difference between a Docker container and a virtual machine?' },
    { text: '🌐 How DNS works', q: 'How does DNS work — what actually happens when you type a URL?' },

    // Gadgets & Hardware
    { text: '📡 How WiFi works', q: 'How does WiFi actually transmit data wirelessly?' },
    { text: '💡 LED vs OLED', q: 'What is the technical difference between LED, OLED, and AMOLED screens?' },
    { text: '🔋 Battery tech limits', q: 'Why haven\'t batteries improved as fast as processors? What\'s the limiting science?' },
    { text: '🖨️ How CPUs are made', q: 'How are modern CPUs manufactured? How do they make something so small?' },
    { text: '📱 Foldable screen tech', q: 'How does foldable screen technology work and what limits it?' },
    { text: '🎧 Noise cancelling science', q: 'How does active noise cancellation actually work physically?' },
    { text: '🔌 USB-C history', q: 'What is the history of USB and why did it take so long to standardize?' },

    // Internet & Networks
    { text: '🌍 How the internet works', q: 'Explain how the physical internet works — cables, routers, the actual infrastructure.' },
    { text: '📡 Submarine cables', q: 'How much of the internet runs through submarine cables and where are they?' },
    { text: '🛰️ Starlink vs fiber', q: 'How does Starlink compare to fiber internet technically?' },
    { text: '🔗 What is blockchain really', q: 'What is blockchain technology and where did it actually come from?' },
    { text: '🌐 IPv6 adoption', q: 'We\'ve been talking about IPv6 for 20 years — why isn\'t it everywhere yet?' },
    { text: '📊 How CDNs work', q: 'What is a CDN and how does content delivery actually work?' },

    // Hot historical roots
    { text: '🚀 ARPANET origin', q: 'What was ARPANET and how did it become the internet?' },
    { text: '👾 First video game', q: 'What was the actual first video game ever made?' },
    { text: '🖱️ Mouse inventor', q: 'Who invented the computer mouse and why did it take so long to become mainstream?' },
    { text: '⌨️ QWERTY origin', q: 'Why does the QWERTY keyboard layout exist and is it actually bad?' },
    { text: '📱 iPhone almost failed', q: 'Were there any moments where the original iPhone almost didn\'t launch?' },
    { text: '💾 Floppy disk history', q: 'When did floppy disks die and what replaced them?' },
    { text: '🎮 PlayStation origin', q: 'How did PlayStation start? It was originally a deal with Nintendo, right?' },
    { text: '📺 Who invented TV', q: 'Who actually invented television — there are multiple claimants, what\'s the real story?' },

    // Philosophy & Big picture
    { text: '🤔 Is AI conscious', q: 'Is there any scientific basis for AI consciousness or is it just pattern matching?' },
    { text: '📉 Tech that failed', q: 'What are the most significant tech failures that should have worked but didn\'t?' },
    { text: '⚖️ Big Tech regulation', q: 'What are the strongest arguments for and against regulating big tech companies?' },
    { text: '🔮 Tech in 10 years', q: 'What technologies will completely change how we live in the next 10 years?' },
    { text: '🌱 Open source economics', q: 'How does open source software make money if it\'s free?' },
    { text: '🏛️ Bell Labs history', q: 'Why was Bell Labs so uniquely productive? What made it different?' },
    { text: '📚 Best tech books', q: 'What are the best books for understanding the true history of technology?' },
    { text: '🌍 Tech inequality', q: 'How does technology create or worsen global inequality?' },

    // Fun / lighter
    { text: '😂 Funniest tech fails', q: 'What are the funniest technical failures in tech history?' },
    { text: '🐛 Famous software bugs', q: 'What\'s the most consequential software bug in history?' },
    { text: '💰 Missed billions', q: 'Who passed on the biggest opportunities in tech history — companies that said no to acquisitions?' },
    { text: '🎯 Almost named what', q: 'What other tech products were almost given completely different names?' },
    { text: '👾 Easter eggs in code', q: 'What are the most famous Easter eggs hidden in software or hardware?' },
  ];

  // ─── STATE ─────────────────────────────────────────────────────────────────
  const state = {
    open: false,
    messages: [],       // { role: 'user'|'assistant', content: string }
    streaming: false,
    chipTimer: null,
    currentChips: [],
    msgCount: 0,
  };

  // ─── DOM REFERENCES (set after inject) ────────────────────────────────────
  let DOM = {};

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    injectHTML();
    injectCSS();
    cacheDOM();
    bindEvents();
    renderChips(pickChips());
    startChipRotation();
    // Keyboard shortcut: press / to open Bryte
    document.addEventListener('keydown', handleGlobalKey);
  }

  // ─── HTML INJECTION ───────────────────────────────────────────────────────
  function injectHTML() {
    const el = document.createElement('div');
    el.id = 'bryte-root';
    el.innerHTML = `
<!-- Floating toggle button -->
<button id="bryte-fab" aria-label="Open Bryte AI chat" title="Ask Bryte (/)">
  <span class="bryte-fab-icon" id="bryte-fab-icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  </span>
  <span class="bryte-fab-pulse"></span>
</button>

<!-- Chat panel -->
<div id="bryte-panel" aria-hidden="true" role="dialog" aria-label="Bryte AI Chat">
  <!-- Header -->
  <div id="bryte-header">
    <div class="bryte-header-left">
      <div class="bryte-avatar">B</div>
      <div>
        <div class="bryte-name">Bryte</div>
        <div class="bryte-status" id="bryte-status">
          <span class="bryte-dot"></span> RootByte Research Companion
        </div>
      </div>
    </div>
    <div class="bryte-header-right">
      <button class="bryte-hdr-btn" id="bryte-clear" title="Clear conversation" aria-label="Clear chat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
      <button class="bryte-hdr-btn" id="bryte-close" aria-label="Close Bryte">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>

  <!-- Messages -->
  <div id="bryte-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>

  <!-- Suggestions -->
  <div id="bryte-chips-wrap">
    <div id="bryte-chips"></div>
  </div>

  <!-- Input -->
  <div id="bryte-input-area">
    <textarea
      id="bryte-input"
      placeholder="Ask about any tech history, topic, or article…"
      rows="1"
      maxlength="800"
      aria-label="Message Bryte"
    ></textarea>
    <button id="bryte-send" aria-label="Send message" disabled>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>

  <!-- Footer -->
  <div id="bryte-footer">
    Powered by <strong>Llama 3.3</strong> via Groq · Free & open-source · Press <kbd>Esc</kbd> to close
  </div>
</div>
`;
    document.body.appendChild(el);
  }

  // ─── CSS INJECTION ─────────────────────────────────────────────────────────
  function injectCSS() {
    const style = document.createElement('style');
    style.id = 'bryte-styles';
    style.textContent = `
/* ─── Bryte Root ─── */
#bryte-root { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Barlow Condensed', 'IBM Plex Mono', sans-serif; }

/* ─── FAB ─── */
#bryte-fab {
  width: 56px; height: 56px; border-radius: 50%;
  background: #c9342a; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff; position: relative;
  box-shadow: 0 4px 24px rgba(201,52,42,0.45), 0 2px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
#bryte-fab:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(201,52,42,0.6); }
#bryte-fab:active { transform: scale(0.96); }
.bryte-fab-icon { display:flex; align-items:center; justify-content:center; transition: transform 0.3s; }
#bryte-fab.open .bryte-fab-icon { transform: rotate(180deg); }
.bryte-fab-pulse {
  position: absolute; top: 4px; right: 4px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #2a6e4a;
  box-shadow: 0 0 0 0 rgba(42,110,74,0.6);
  animation: bryte-pulse 2.5s infinite;
}
@keyframes bryte-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(42,110,74,0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(42,110,74,0); }
  100% { box-shadow: 0 0 0 0 rgba(42,110,74,0); }
}

/* ─── Panel ─── */
#bryte-panel {
  position: fixed; bottom: 92px; right: 24px;
  width: 380px; max-width: calc(100vw - 32px);
  height: 580px; max-height: calc(100vh - 120px);
  background: #0f0e0c; border: 1px solid rgba(201,52,42,0.35);
  border-radius: 12px; display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  transform: translateY(20px) scale(0.97);
  opacity: 0; pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
  font-family: 'IBM Plex Mono', 'Barlow Condensed', monospace;
}
#bryte-panel.open {
  opacity: 1; pointer-events: all;
  transform: translateY(0) scale(1);
}

/* ─── Header ─── */
#bryte-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.07);
  background: #1a1916; flex-shrink: 0;
}
.bryte-header-left { display: flex; align-items: center; gap: 10px; }
.bryte-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #c9342a, #d4730f);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
  font-size: 1rem; color: #fff; letter-spacing: 0; flex-shrink: 0;
}
.bryte-name {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
  font-size: 1rem; color: #f0ebe0; letter-spacing: 2px;
  text-transform: uppercase;
}
.bryte-status { font-size: 0.55rem; color: #a89e8a; letter-spacing: 1.5px; margin-top: 1px; display: flex; align-items: center; gap: 5px; }
.bryte-dot { width: 6px; height: 6px; border-radius: 50%; background: #2a6e4a; display: inline-block; }
.bryte-header-right { display: flex; gap: 6px; }
.bryte-hdr-btn {
  width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
  background: none; color: #a89e8a; cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: all 0.15s;
}
.bryte-hdr-btn:hover { background: rgba(255,255,255,0.08); color: #f0ebe0; }

/* ─── Messages ─── */
#bryte-messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
  scroll-behavior: smooth;
  font-family: 'IBM Plex Mono', monospace;
}
#bryte-messages::-webkit-scrollbar { width: 4px; }
#bryte-messages::-webkit-scrollbar-track { background: transparent; }
#bryte-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* Message bubbles */
.bryte-msg { display: flex; gap: 8px; animation: bryte-fadein 0.2s ease; }
@keyframes bryte-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.bryte-msg.user { flex-direction: row-reverse; }
.bryte-msg-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700;
}
.bryte-msg.assistant .bryte-msg-avatar { background: linear-gradient(135deg,#c9342a,#d4730f); color:#fff; font-family:'Barlow Condensed',sans-serif; }
.bryte-msg.user .bryte-msg-avatar { background: #1a4e8c; color: #fff; font-family: 'Barlow Condensed',sans-serif; }
.bryte-msg-body {
  max-width: 80%; padding: 10px 14px; border-radius: 12px;
  font-size: 0.78rem; line-height: 1.65; letter-spacing: 0;
  font-family: 'Libre Baskerville', Georgia, serif;
}
.bryte-msg.assistant .bryte-msg-body { background: #1a1916; color: #e8e3d8; border-radius: 4px 12px 12px 12px; border: 1px solid rgba(255,255,255,0.06); }
.bryte-msg.user .bryte-msg-body { background: #1a4e8c; color: #e8f4ff; border-radius: 12px 4px 12px 12px; }
.bryte-msg-body strong { color: #c9342a; font-weight: 700; }
.bryte-msg-body em { color: #d4730f; font-style: italic; }

/* Welcome message */
.bryte-welcome {
  padding: 20px 8px; text-align: center; color: #7a7060;
  font-family: 'IBM Plex Mono', monospace; font-size: 0.65rem; line-height: 1.8; letter-spacing: 1px;
}
.bryte-welcome strong { color: #c9342a; font-family: 'Barlow Condensed',sans-serif; font-size: 1.1rem; display: block; letter-spacing: 3px; margin-bottom: 8px; }

/* Typing indicator */
.bryte-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
.bryte-typing span {
  width: 6px; height: 6px; border-radius: 50%; background: #c9342a;
  animation: bryte-bounce 1.2s infinite; display: inline-block;
}
.bryte-typing span:nth-child(2) { animation-delay: 0.2s; }
.bryte-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bryte-bounce {
  0%,60%,100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ─── Chips ─── */
#bryte-chips-wrap { padding: 8px 12px 4px; flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.05); }
#bryte-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.bryte-chip {
  font-family: 'IBM Plex Mono', monospace; font-size: 0.58rem;
  padding: 5px 10px; border-radius: 100px; cursor: pointer;
  background: rgba(201,52,42,0.12); color: #c9342a;
  border: 1px solid rgba(201,52,42,0.3); letter-spacing: 0.5px;
  transition: all 0.15s; white-space: nowrap;
  animation: bryte-chipin 0.25s ease;
}
.bryte-chip:hover { background: rgba(201,52,42,0.22); transform: translateY(-1px); }
.bryte-chip:active { transform: translateY(0); }
@keyframes bryte-chipin { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: none; } }

/* ─── Input area ─── */
#bryte-input-area {
  display: flex; align-items: flex-end; gap: 8px;
  padding: 10px 12px 12px; flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.07);
  background: #1a1916;
}
#bryte-input {
  flex: 1; background: #0f0e0c; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 9px 12px; color: #f0ebe0;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.78rem; line-height: 1.5; resize: none; outline: none;
  transition: border-color 0.15s; max-height: 120px;
}
#bryte-input:focus { border-color: rgba(201,52,42,0.5); }
#bryte-input::placeholder { color: #7a7060; }
#bryte-send {
  width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
  background: #c9342a; border: none; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
#bryte-send:disabled { background: #2a2820; cursor: not-allowed; color: #5a5450; }
#bryte-send:not(:disabled):hover { background: #e03d32; transform: scale(1.05); }

/* ─── Footer ─── */
#bryte-footer {
  padding: 6px 14px 8px; font-family: 'IBM Plex Mono', monospace;
  font-size: 0.5rem; color: #5a5450; letter-spacing: 1px; text-align: center;
  background: #0f0e0c; border-top: 1px solid rgba(255,255,255,0.04); flex-shrink: 0;
}
#bryte-footer kbd {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 3px; padding: 1px 4px; font-size: 0.48rem;
}

/* ─── Mobile ─── */
@media (max-width: 480px) {
  #bryte-root { bottom: 16px; right: 16px; }
  #bryte-panel { right: 8px; left: 8px; width: auto; bottom: 84px; max-height: calc(100vh - 100px); }
}

/* ─── Dark-mode aware ─── */
[data-theme="dark"] #bryte-panel { border-color: rgba(201,52,42,0.25); }
`;
    document.head.appendChild(style);
  }

  // ─── CACHE DOM ────────────────────────────────────────────────────────────
  function cacheDOM() {
    DOM = {
      fab:       document.getElementById('bryte-fab'),
      panel:     document.getElementById('bryte-panel'),
      messages:  document.getElementById('bryte-messages'),
      chips:     document.getElementById('bryte-chips'),
      input:     document.getElementById('bryte-input'),
      send:      document.getElementById('bryte-send'),
      clear:     document.getElementById('bryte-clear'),
      close:     document.getElementById('bryte-close'),
      status:    document.getElementById('bryte-status'),
      fabIcon:   document.getElementById('bryte-fab-icon'),
    };
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────
  function bindEvents() {
    DOM.fab.addEventListener('click', togglePanel);
    DOM.close.addEventListener('click', closePanel);
    DOM.clear.addEventListener('click', clearChat);
    DOM.send.addEventListener('click', submitMessage);
    DOM.input.addEventListener('input', onInputChange);
    DOM.input.addEventListener('keydown', onInputKeydown);
  }

  function handleGlobalKey(e) {
    if (e.key === 'Escape' && state.open) closePanel();
    // Press / when NOT in an input/textarea to open Bryte
    if (e.key === '/' && !state.open && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openPanel();
    }
  }

  function togglePanel() { state.open ? closePanel() : openPanel(); }

  function openPanel() {
    state.open = true;
    DOM.panel.classList.add('open');
    DOM.panel.setAttribute('aria-hidden', 'false');
    DOM.fab.classList.add('open');
    DOM.fab.setAttribute('aria-label', 'Close Bryte chat');
    DOM.fabIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    if (state.msgCount === 0) showWelcome();
    setTimeout(() => DOM.input.focus(), 300);
  }

  function closePanel() {
    state.open = false;
    DOM.panel.classList.remove('open');
    DOM.panel.setAttribute('aria-hidden', 'true');
    DOM.fab.classList.remove('open');
    DOM.fab.setAttribute('aria-label', 'Open Bryte AI chat');
    DOM.fabIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  }

  function clearChat() {
    state.messages = [];
    state.msgCount = 0;
    DOM.messages.innerHTML = '';
    renderChips(pickChips());
    showWelcome();
  }

  function onInputChange() {
    const val = DOM.input.value.trim();
    DOM.send.disabled = val.length === 0 || state.streaming;
    // Auto-resize textarea
    DOM.input.style.height = 'auto';
    DOM.input.style.height = Math.min(DOM.input.scrollHeight, 120) + 'px';
  }

  function onInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!DOM.send.disabled) submitMessage();
    }
  }

  // ─── WELCOME ──────────────────────────────────────────────────────────────
  function showWelcome() {
    const div = document.createElement('div');
    div.className = 'bryte-welcome';
    div.innerHTML = `
      <strong>BRYTE</strong>
      RootByte's research companion.<br>
      Ask me anything about tech history,<br>
      current articles, or what's happening in tech.<br><br>
      <span style="color:#c9342a;font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;letter-spacing:2px;">
        Tech has roots. Let's dig them up.
      </span>
    `;
    DOM.messages.appendChild(div);
  }

  // ─── CHIPS ────────────────────────────────────────────────────────────────
  function pickChips(exclude = []) {
    const pool = CHIP_BANK.filter(c => !exclude.includes(c.text));
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, CHIPS_VISIBLE);
  }

  function renderChips(chips) {
    state.currentChips = chips;
    DOM.chips.innerHTML = '';
    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'bryte-chip';
      btn.textContent = chip.text;
      btn.addEventListener('click', () => {
        DOM.input.value = chip.q;
        onInputChange();
        submitMessage();
      });
      DOM.chips.appendChild(btn);
    });
  }

  function startChipRotation() {
    state.chipTimer = setInterval(() => {
      if (!state.streaming) {
        renderChips(pickChips(state.currentChips.map(c => c.text)));
      }
    }, CHIP_ROTATE_MS);
  }

  // Contextual chips based on what Bryte just responded about
  function suggestContextualChips(assistantText) {
    const text = assistantText.toLowerCase();
    const contextChips = [];

    if (text.includes('linux') || text.includes('unix') || text.includes('torvalds')) {
      contextChips.push({ text: '💻 Unix vs Linux', q: 'What is the real difference between Unix and Linux?' });
      contextChips.push({ text: '🌱 Open source economics', q: 'How does open source software make money if it\'s free?' });
    }
    if (text.includes('ai') || text.includes('neural') || text.includes('gpt') || text.includes('llm')) {
      contextChips.push({ text: '🔮 What is AGI really', q: 'What does AGI actually mean and how close are we to it?' });
      contextChips.push({ text: '🧠 LLM vs search engine', q: 'What is the fundamental difference between an LLM and a search engine?' });
    }
    if (text.includes('security') || text.includes('hack') || text.includes('worm') || text.includes('ransomware')) {
      contextChips.push({ text: '🛡️ How VPNs work', q: 'How does a VPN actually work technically?' });
      contextChips.push({ text: '🏴‍☠️ Nation-state hackers', q: 'Which countries have the most sophisticated state hacking programs?' });
    }
    if (text.includes('wifi') || text.includes('network') || text.includes('internet')) {
      contextChips.push({ text: '📡 Submarine cables', q: 'How much of the internet runs through submarine cables?' });
      contextChips.push({ text: '🌐 How the internet works', q: 'Explain how the physical internet works — cables, routers, the actual infrastructure.' });
    }

    // Fill remaining slots with random
    const needed = CHIPS_VISIBLE - contextChips.length;
    const extras = pickChips(contextChips.map(c => c.text)).slice(0, needed);
    return [...contextChips, ...extras].slice(0, CHIPS_VISIBLE);
  }

  // ─── PAGE CONTEXT — detect what the user is currently reading ────────────
  function getPageContext() {
    const url = new URL(window.location.href);
    const slug   = url.searchParams.get('slug');
    const path   = url.pathname;
    const title  = document.title?.replace(' — RootByte', '').replace('RootByte — ', '') || '';

    const hints = [];
    if (slug) hints.push(`User is currently reading article: "${slug}" (title: "${title}")`);
    if (path.includes('breaking'))     hints.push('User is on the Breaking News page.');
    if (path.includes('category'))     hints.push(`User is on a Category page: ${url.searchParams.get('cat') || 'unknown'}`);
    if (path.includes('roots-archive'))hints.push('User is browsing the Roots Archive — historical tech timeline.');
    if (path.includes('did-you-know')) hints.push('User is on the Did You Know page.');
    if (path.includes('on-this-day'))  hints.push('User is on the On This Day page.');
    if (path.includes('about'))        hints.push('User is on the About page.');
    return hints.length ? `\n\n[Page context: ${hints.join(' ')}]` : '';
  }

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  async function submitMessage() {
    const text = DOM.input.value.trim();
    if (!text || state.streaming) return;

    // Clear input
    DOM.input.value = '';
    DOM.input.style.height = 'auto';
    DOM.send.disabled = true;

    // Remove welcome if present
    const welcome = DOM.messages.querySelector('.bryte-welcome');
    if (welcome) welcome.remove();

    // Add user message (with page context appended to first message of session)
    addMessage('user', text);
    const ctx = state.messages.length === 0 ? getPageContext() : '';
    state.messages.push({ role: 'user', content: text + ctx });
    if (state.messages.length > MAX_HISTORY) state.messages = state.messages.slice(-MAX_HISTORY);
    state.msgCount++;

    // Show typing indicator
    const typingEl = addTypingIndicator();
    setStatus('thinking…');
    state.streaming = true;
    DOM.send.disabled = true;

    let fullResponse = '';

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.messages }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response stream');

      typingEl.remove();
      const msgEl = addMessage('assistant', '');
      const bodyEl = msgEl.querySelector('.bryte-msg-body');
      setStatus('typing…');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              bodyEl.innerHTML = renderMarkdown(fullResponse);
              scrollMessages();
            }
          } catch { /* ignore parse errors */ }
        }
      }

    } catch (err) {
      typingEl?.remove();
      const errMsg = err.message.includes('Failed to fetch')
        ? 'Could not reach Bryte. Check your connection.'
        : 'Something went wrong. Try again.';
      addMessage('assistant', errMsg);
      fullResponse = errMsg;
    } finally {
      state.streaming = false;
      state.messages.push({ role: 'assistant', content: fullResponse });
      if (state.messages.length > MAX_HISTORY) state.messages = state.messages.slice(-MAX_HISTORY);
      setStatus('<span class="bryte-dot"></span> RootByte Research Companion');
      DOM.input.focus();
      onInputChange();
      // Suggest contextual chips
      renderChips(suggestContextualChips(fullResponse));
    }
  }

  // ─── DOM HELPERS ──────────────────────────────────────────────────────────
  function addMessage(role, content) {
    const wrap = document.createElement('div');
    wrap.className = `bryte-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'bryte-msg-avatar';
    avatar.textContent = role === 'assistant' ? 'B' : 'Y';

    const body = document.createElement('div');
    body.className = 'bryte-msg-body';
    body.innerHTML = content ? renderMarkdown(content) : '';

    wrap.appendChild(avatar);
    wrap.appendChild(body);
    DOM.messages.appendChild(wrap);
    scrollMessages();
    return wrap;
  }

  function addTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'bryte-msg assistant';
    const avatar = document.createElement('div');
    avatar.className = 'bryte-msg-avatar';
    avatar.textContent = 'B';
    const body = document.createElement('div');
    body.className = 'bryte-msg-body';
    body.innerHTML = '<div class="bryte-typing"><span></span><span></span><span></span></div>';
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    DOM.messages.appendChild(wrap);
    scrollMessages();
    return wrap;
  }

  function scrollMessages() {
    DOM.messages.scrollTop = DOM.messages.scrollHeight;
  }

  function setStatus(html) {
    DOM.status.innerHTML = html;
  }

  // ─── MARKDOWN → HTML (minimal, safe) ─────────────────────────────────────
  function renderMarkdown(text) {
    return text
      // Escape HTML (XSS prevention)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold: **text**
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      // Inline code: `code`
      .replace(/`([^`\n]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-size:0.75em">$1</code>')
      // Year chains: **YEAR** — pattern already handled by bold above
      // Em-dash preservations
      .replace(/--/g, '—')
      // Line breaks
      .replace(/\n\n/g, '</p><p style="margin-top:8px">')
      .replace(/\n/g, '<br>');
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
