const DEFAULT_SETTINGS = {
  enabled: true,
  serverUrl: "https://safespaces-production.up.railway.app",
  childId: "child-1",
  safeReplace: "[safe]",
  alertThreshold: 1
};

const PATTERNS = [
  {
    category: "grooming",
    label: "move_to_private",
    regex: /(snap|snapchat|instagram|ig|discord|dm me|private chat|secret chat|whatsapp|telegram)/gi
  },
  {
    category: "grooming",
    label: "age_gap",
    regex: /(how old are you|age\?|im \d{2}|i'm \d{2}|im \d{2} years? old)/gi
  },
  {
    category: "grooming",
    label: "secrecy",
    regex: /(don'?t tell|our little secret|keep this between us)/gi
  },
  {
    category: "scam",
    label: "money_ask",
    regex: /(gift card|steam card|apple card|google play card|wire me|cashapp|venmo|zelle|crypto|bitcoin)/gi
  },
  {
    category: "scam",
    label: "urgent_action",
    regex: /(act now|urgent|verify your account|click this link|suspended account)/gi
  },
  {
    category: "impersonation",
    label: "authority_claim",
    regex: /(i am your teacher|i work for the school|i am police|i am the principal)/gi
  },
  {
    category: "impersonation",
    label: "relative_claim",
    regex: /(i am your mom|i am your dad|i'm your aunt|i'm your uncle)/gi
  }
];

let settings = { ...DEFAULT_SETTINGS };
const lastValues = new WeakMap();

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (value) => {
      settings = { ...DEFAULT_SETTINGS, ...value };
      resolve(settings);
    });
  });
}

function analyze(text) {
  let filtered = text;
  const hits = [];

  for (const pattern of PATTERNS) {
    if (pattern.regex.test(filtered)) {
      hits.push({ category: pattern.category, label: pattern.label });
      filtered = filtered.replace(pattern.regex, settings.safeReplace);
    }
  }

  return { filtered, hits };
}

function getText(el) {
  if (el.isContentEditable) return el.innerText;
  return el.value;
}

function setText(el, nextText) {
  if (el.isContentEditable) {
    el.innerText = nextText;
  } else {
    el.value = nextText;
  }
}

function handleElement(el) {
  const current = getText(el);
  const last = lastValues.get(el);
  if (last === current) return;

  const { filtered, hits } = analyze(current);
  if (filtered !== current) {
    setText(el, filtered);
  }

  lastValues.set(el, filtered);

  if (hits.length >= settings.alertThreshold) {
    const url = new URL(location.href);
    const safeUrl = `${url.origin}${url.pathname}`;
    chrome.runtime.sendMessage({
      type: "ALERT",
      payload: {
        childId: settings.childId,
        url: safeUrl,
        text: filtered.slice(0, 300),
        hits,
        ts: Date.now()
      }
    });
  }
}

function watchInputs() {
  const selector = "input[type='text'], input[type='search'], textarea, [contenteditable='true']";
  const throttle = new WeakMap();

  function onInput(e) {
    if (!settings.enabled) return;
    const el = e.target;
    if (!el || !el.matches(selector)) return;

    const lastTick = throttle.get(el) || 0;
    const now = Date.now();
    if (now - lastTick < 200) return;
    throttle.set(el, now);

    handleElement(el);
  }

  document.addEventListener("input", onInput, true);
}

function initialSweep() {
  const selector = "input[type='text'], input[type='search'], textarea, [contenteditable='true']";
  document.querySelectorAll(selector).forEach((el) => handleElement(el));
}

loadSettings().then(() => {
  watchInputs();
  initialSweep();
});

chrome.storage.onChanged.addListener((changes) => {
  settings = { ...settings };
  Object.keys(changes).forEach((key) => {
    settings[key] = changes[key].newValue;
  });
});
