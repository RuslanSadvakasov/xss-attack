/**
 * chat.js — клиентская логика чата GigaChat
 *
 * Работает через прокси-сервер (например, /api/chat). API-ключ не требуется на клиенте.
 */

const PROXY_CHAT_URL = "";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент на учебном стенде XSS Shield, 
посвящённом изучению Cross-Site Scripting и защите от XSS-атак.
 Помогай пользователям с вопросами по XSS (Reflected, Stored, DOM-based), 
 CSP, экранированию, безопасной работе с innerHTML, HttpOnly cookies, Trusted Types 
 и другим методам предотвращения инъекций. Отвечай коротко, с примерами кода, где уместно.
  Если вопрос не про XSS или веб-безопасность — вежливо скажи, что помогаешь только по этим
   темам. Используй русский язык.`;

const MAX_HISTORY_PAIRS = 6;

let history = [];
let isRequesting = false;

// ── Элементы встроенного чата ──
const chatWrap = document.getElementById("chatWrap");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const chatStatus = document.getElementById("chatStatus");
const chatClearBtn = document.getElementById("chatClearBtn");

// Показываем встроенный чат сразу
if (chatWrap) {
  chatWrap.style.display = "flex";
  chatWrap.style.flexDirection = "column";
}

// ── Плавающая кнопка и попап ──
function createFloatingChat() {
  const fab = document.createElement("button");
  fab.id = "chatFab";
  fab.setAttribute("aria-label", "Открыть ИИ-ассистент");
  fab.innerHTML = `
    <svg id="fabIconOpen" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg id="fabIconClose" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
         style="display:none">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span id="fabBadge" class="fab-badge" style="display:none">1</span>
  `;

  const popup = document.createElement("div");
  popup.id = "chatPopup";
  popup.setAttribute("aria-hidden", "true");

  popup.innerHTML = `
    <div class="chat-popup-header">
      <div class="chat-header-info">
        <div class="chat-avatar">G</div>
        <div>
          <div class="chat-name">GigaChat</div>
          <div class="chat-status" id="chatStatusPopup">онлайн</div>
        </div>
      </div>
      <div class="chat-header-actions">
        <button class="chat-clear-btn" id="chatClearBtnPopup" title="Очистить диалог">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="chat-messages" id="chatMessagesPopup">
      <div class="chat-msg bot">
        <div class="msg-bubble">Привет! Я GigaChat. Спрашивайте про настройку HTTPS, Nginx, Let's Encrypt или веб-безопасность.</div>
      </div>
    </div>
    <div class="chat-input-area">
      <textarea id="chatInputPopup" class="chat-textarea" rows="1"
                placeholder="Спросите что-нибудь..."></textarea>
      <button id="chatSendBtnPopup" class="chat-send-btn" aria-label="Отправить">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(popup);

  injectFabStyles();

  let isOpen = false;

  fab.addEventListener("click", () => {
    isOpen = !isOpen;
    popup.classList.toggle("chat-popup-visible", isOpen);
    popup.setAttribute("aria-hidden", String(!isOpen));
    document.getElementById("fabIconOpen").style.display = isOpen
      ? "none"
      : "block";
    document.getElementById("fabIconClose").style.display = isOpen
      ? "block"
      : "none";
    document.getElementById("fabBadge").style.display = "none";
    if (isOpen) {
      setTimeout(() => document.getElementById("chatInputPopup")?.focus(), 200);
    }
  });

  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !popup.contains(e.target) &&
      e.target !== fab &&
      !fab.contains(e.target)
    ) {
      isOpen = false;
      popup.classList.remove("chat-popup-visible");
      popup.setAttribute("aria-hidden", "true");
      document.getElementById("fabIconOpen").style.display = "block";
      document.getElementById("fabIconClose").style.display = "none";
    }
  });

  const popupMessages = document.getElementById("chatMessagesPopup");
  const popupInput = document.getElementById("chatInputPopup");
  const popupSendBtn = document.getElementById("chatSendBtnPopup");
  const popupClearBtn = document.getElementById("chatClearBtnPopup");
  const popupStatus = document.getElementById("chatStatusPopup");

  popupSendBtn.addEventListener("click", () =>
    handleSend(popupInput, popupMessages, popupStatus, popupSendBtn),
  );
  popupInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(popupInput, popupMessages, popupStatus, popupSendBtn);
    }
  });
  popupInput.addEventListener("input", () => autoResizeTextarea(popupInput));
  popupClearBtn.addEventListener("click", () => clearChat(popupMessages));
}

function injectFabStyles() {
  if (document.getElementById("fab-styles")) return;
  const style = document.createElement("style");
  style.id = "fab-styles";
  style.textContent = `
    #chatFab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9000;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: var(--accent, #0066FF);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,102,255,0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    #chatFab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,102,255,0.55);
      background: var(--accent-hover, #0052CC);
    }
    #chatFab:active { transform: scale(0.96); }
    .fab-badge {
      position: absolute;
      top: 6px; right: 6px;
      width: 18px; height: 18px;
      background: #EF4444;
      color: #fff;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    #chatPopup {
      position: fixed;
      bottom: 100px;
      right: 28px;
      z-index: 8999;
      width: 380px;
      max-width: calc(100vw - 32px);
      max-height: 560px;
      background: var(--bg-card, #fff);
      border-radius: 24px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    #chatPopup.chat-popup-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    .chat-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border, #E2E8F0);
      background: var(--bg-card, #fff);
      flex-shrink: 0;
    }
    #chatMessagesPopup {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 200px;
      max-height: 340px;
    }
    @media (max-width: 480px) {
      #chatPopup { width: calc(100vw - 16px); right: 8px; bottom: 88px; }
      #chatFab { bottom: 16px; right: 16px; width: 52px; height: 52px; }
    }
  `;
  document.head.appendChild(style);
}

// ── Запрос к прокси ───────────────────────────────────────
async function sendToProxy(userText) {
  history.push({ role: "user", content: userText });
  const trimmed = history.slice(-(MAX_HISTORY_PAIRS * 2));
  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed];

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(PROXY_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "GigaChat",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (res.status === 401 && attempt === 0) continue;

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Прокси вернул ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const reply =
      data.choices?.[0]?.message?.content ?? "Пустой ответ от модели.";
    history.push({ role: "assistant", content: reply });
    return reply;
  }
  throw new Error("Не удалось получить ответ после повторной попытки.");
}

// ── UI-хелперы ────────────────────────────────────────────
function appendMessage(container, role, text) {
  const wrap = document.createElement("div");
  wrap.className = `chat-msg ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function showTyping(container) {
  const wrap = document.createElement("div");
  wrap.className = "chat-msg bot";
  wrap.id = "typingIndicator_" + container.id;
  wrap.innerHTML = `<div class="msg-bubble typing-dots"><span></span><span></span><span></span></div>`;
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function removeTyping(container) {
  document.getElementById("typingIndicator_" + container.id)?.remove();
}

function showError(container, text) {
  removeTyping(container);
  const wrap = document.createElement("div");
  wrap.className = "chat-msg bot msg-error";
  wrap.innerHTML = `<div class="msg-bubble">⚠️ ${text}</div>`;
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function setStatus(statusEl, text, loading = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = "chat-status" + (loading ? " loading" : "");
}

function setBusy(busy, inputEl, sendBtnEl, statusEl) {
  isRequesting = busy;
  if (sendBtnEl) sendBtnEl.disabled = busy;
  if (inputEl) inputEl.disabled = busy;
  setStatus(statusEl, busy ? "печатает..." : "онлайн", busy);
}

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function clearChat(messagesEl) {
  history = [];
  if (messagesEl) {
    messagesEl.innerHTML = `
      <div class="chat-msg bot">
        <div class="msg-bubble">Диалог очищен. Задайте новый вопрос!</div>
      </div>`;
  }
}

// ── Отправка сообщения ────────────────────────────────────
async function handleSend(inputEl, messagesEl, statusEl, sendBtnEl) {
  if (isRequesting) return;
  const text = (inputEl?.value || "").trim();
  if (!text) return;

  inputEl.value = "";
  autoResizeTextarea(inputEl);
  appendMessage(messagesEl, "user", text);
  setBusy(true, inputEl, sendBtnEl, statusEl);
  showTyping(messagesEl);

  try {
    const reply = await sendToProxy(text);
    removeTyping(messagesEl);
    appendMessage(messagesEl, "bot", reply);
  } catch (e) {
    showError(
      messagesEl,
      "Не удалось получить ответ. Проверьте, запущен ли прокси-сервер.",
    );
    console.error("[GigaChat]", e);
  } finally {
    setBusy(false, inputEl, sendBtnEl, statusEl);
  }
}

// ── Инициализация встроенного чата ──
function initInlineChat() {
  if (!chatMessages || !chatInput) return;
  chatSendBtn?.addEventListener("click", () =>
    handleSend(chatInput, chatMessages, chatStatus, chatSendBtn),
  );
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(chatInput, chatMessages, chatStatus, chatSendBtn);
    }
  });
  chatInput.addEventListener("input", () => autoResizeTextarea(chatInput));
  chatClearBtn?.addEventListener("click", () => clearChat(chatMessages));
}

// ── Запуск ──
initInlineChat();
createFloatingChat();