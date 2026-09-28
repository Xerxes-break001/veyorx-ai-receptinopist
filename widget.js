
/*!
 * AI Receptionist chat widget (frontend only, demo mode)
 * Embed: <script src="widget.js" data-site="acme" data-name="Acme Studio" data-color="#0f766e"></script>
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var cfg = {
    site: script.getAttribute("data-site") || "demo",
    name: script.getAttribute("data-name") || "Our Assistant",
    color: script.getAttribute("data-color") || "#0f766e",
    api: script.getAttribute("data-api") || "", // empty = demo mode; backend URL goes here later
    greeting:
      script.getAttribute("data-greeting") ||
      "Hi! I can help get you connected with the team. Mind if I ask a few quick questions?"
  };

  // The six things we collect, in order (used by demo mode and the summary card).
  var STEPS = [
    { key: "name", label: "Name", ask: "Great! First, what's your name?" },
    { key: "business", label: "Business", ask: "Nice to meet you, {name}. What's your business called?" },
    { key: "service", label: "Service needed", ask: "What service are you looking for?" },
    { key: "budget", label: "Budget", ask: "Roughly what budget do you have in mind?" },
    { key: "goal", label: "Goal", ask: "What's the main goal you want to achieve?" },
    { key: "timeline", label: "Timeline", ask: "Last one: when would you like to get started?" }
  ];

  var state = { step: -1, answers: {}, busy: false, open: false };

  /* ---------- Reply logic: the ONLY part that changes when the backend is added ---------- */
  function getReply(userText) {
    // TODO (step 2): if (cfg.api) { return fetch(cfg.api, ...) }
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (state.step >= 0) state.answers[STEPS[state.step].key] = userText;
        state.step++;
        if (state.step < STEPS.length) {
          resolve({ text: STEPS[state.step].ask.replace("{name}", state.answers.name || "there") });
        } else {
          resolve({
            text: "Thanks, " + state.answers.name + "! I've passed this to the team and they'll be in touch soon.",
            summary: state.answers
          });
        }
      }, 600);
    });
  }

  /* ---------- UI (inside a Shadow DOM so host-site CSS can't break it) ---------- */
  var host = document.createElement("div");
  host.id = "ai-receptionist-" + cfg.site;
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML =
    "<style>" +
    ":host{all:initial}" +
    "*{box-sizing:border-box}" +
    ".w{--c:" + cfg.color + ";--bg:#fff;--fg:#1c1f23;--muted:#eef0f2;--line:#dfe3e7;" +
    "font:15px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--fg)}" +
    "@media(prefers-color-scheme:dark){.w{--bg:#1a1d21;--fg:#eceef0;--muted:#2a2e33;--line:#363b41}}" +
    ".fab{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));" +
    "width:56px;height:56px;border-radius:50%;border:0;background:var(--c);color:#fff;cursor:pointer;" +
    "box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:2147483646}" +
    ".fab svg{width:26px;height:26px}" +
    ".panel{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(84px,calc(env(safe-area-inset-bottom) + 76px));" +
    "width:370px;height:min(560px,calc(100dvh - 110px));background:var(--bg);border:1px solid var(--line);" +
    "border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;z-index:2147483647}" +
    ".open .panel{display:flex}" +
    "header{background:var(--c);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}" +
    "header b{font-size:16px;font-weight:600}" +
    "header button{background:none;border:0;color:#fff;font-size:26px;line-height:1;cursor:pointer;padding:0 4px}" +
    ".msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}" +
    ".m{max-width:85%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}" +
    ".bot{background:var(--muted);align-self:flex-start;border-bottom-left-radius:4px}" +
    ".me{background:var(--c);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}" +
    ".sum{align-self:stretch;border:1px solid var(--line);border-radius:10px;padding:10px 12px;font-size:14px}" +
    ".sum h4{margin:0 0 6px;font-size:14px}" +
    ".sum div{display:flex;gap:8px;padding:2px 0}.sum span{min-width:96px;opacity:.65}" +
    ".dots{display:flex;gap:4px;padding:12px}" +
    ".dots i{width:6px;height:6px;border-radius:50%;background:#8a9099;animation:b 1s infinite}" +
    ".dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}" +
    "@keyframes b{0%,60%,100%{opacity:.3}30%{opacity:1}}" +
    "form{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line);" +
    "padding-bottom:max(10px,env(safe-area-inset-bottom))}" +
    "input{flex:1;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--line);" +
    "border-radius:10px;background:var(--bg);color:var(--fg)}" +
    "form button{font:inherit;font-weight:600;border:0;border-radius:10px;padding:0 16px;background:var(--c);color:#fff;cursor:pointer}" +
    "button:disabled,input:disabled{opacity:.5;cursor:default}" +
    "button:focus-visible,input:focus-visible{outline:3px solid #f5a623;outline-offset:2px}" +
    ".note{font-size:11px;opacity:.6;text-align:center;padding:0 12px 8px}" +
    "@media(max-width:480px){.panel{inset:0;width:100%;height:100dvh;border-radius:0;border:0}" +
    ".open .fab{display:none}}" +
    "@media(prefers-reduced-motion:reduce){.dots i{animation:none}}" +
    "</style>" +
    '<div class="w">' +
    '<button class="fab" aria-label="Open chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z"/></svg></button>' +
    '<section class="panel" role="dialog" aria-label="Chat with ' + cfg.name + '">' +
    "<header><b></b><button class=\"x\" aria-label=\"Close chat\">&times;</button></header>" +
    '<div class="msgs" aria-live="polite"></div>' +
    '<div class="note">Your answers are shared with this business so they can follow up.</div>' +
    '<form><input type="text" placeholder="Type your message…" aria-label="Your message" autocomplete="off" maxlength="500">' +
    "<button type=\"submit\">Send</button></form>" +
    "</section></div>";

  var $ = function (s) { return root.querySelector(s); };
  var wrap = $(".w"), msgs = $(".msgs"), input = $("input"), send = $("form button");
  $("header b").textContent = cfg.name;

  function add(text, who) {
    var d = document.createElement("div");
    d.className = "m " + who;
    d.textContent = text; // textContent, never innerHTML: prevents injection
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addSummary(a) {
    var box = document.createElement("div");
    box.className = "sum";
    var h = document.createElement("h4");
    h.textContent = "What I've noted";
    box.appendChild(h);
    STEPS.forEach(function (s) {
      var row = document.createElement("div");
      var k = document.createElement("span");
      k.textContent = s.label;
      var v = document.createElement("div");
      v.textContent = a[s.key] || "-";
      row.appendChild(k);
      row.appendChild(v);
      box.appendChild(row);
    });
    msgs.appendChild(box);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setBusy(b) {
    state.busy = b;
    input.disabled = b;
    send.disabled = b;
    var d = msgs.querySelector(".dots");
    if (b && !d) {
      d = document.createElement("div");
      d.className = "m bot dots";
      d.innerHTML = "<i></i><i></i><i></i>";
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    } else if (!b && d) d.remove();
    if (!b && state.open) input.focus();
  }

  function toggle(open) {
    state.open = open;
    wrap.classList.toggle("open", open);
    if (open) {
      if (!msgs.children.length) add(cfg.greeting, "bot");
      input.focus();
    } else {
      $(".fab").focus();
    }
  }

  $(".fab").addEventListener("click", function () { toggle(true); });
  $(".x").addEventListener("click", function () { toggle(false); });
  root.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || state.busy) return;
    input.value = "";
    add(text, "me");
    setBusy(true);
    getReply(text)
      .then(function (r) {
        setBusy(false);
        add(r.text, "bot");
        if (r.summary) addSummary(r.summary);
      })
      .catch(function () {
        setBusy(false);
        add("Sorry, something went wrong. Please try again.", "bot");
      });
  });
})();
