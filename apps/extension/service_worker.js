const DEFAULT_SETTINGS = {
  enabled: true,
  serverUrl: "https://safespaces-production.up.railway.app",
  childId: "child-1"
};

let lastSent = 0;

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (value) => resolve({ ...DEFAULT_SETTINGS, ...value }));
  });
}

async function sendAlert(payload) {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const now = Date.now();
  if (now - lastSent < 1000) return;
  lastSent = now;

  try {
    await fetch(`${settings.serverUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        childId: settings.childId
      })
    });
  } catch (err) {
    // Ignore network errors to avoid blocking the child experience.
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "ALERT") {
    sendAlert(message.payload);
  }
});
