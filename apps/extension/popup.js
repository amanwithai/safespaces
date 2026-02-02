const DEFAULT_SETTINGS = { enabled: true };
const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");

function load() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    statusEl.textContent = settings.enabled ? "Filtering is ON" : "Filtering is OFF";
    toggleBtn.textContent = settings.enabled ? "Disable" : "Enable";
  });
}

function toggle() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    chrome.storage.sync.set({ enabled: !settings.enabled }, load);
  });
}

toggleBtn.addEventListener("click", toggle);
load();
