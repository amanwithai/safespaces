const DEFAULT_SETTINGS = {
  enabled: true,
  serverUrl: "https://safespaces-production.up.railway.app",
  childId: "child-1",
  safeReplace: "[safe]",
  alertThreshold: 1
};

const els = {
  enabled: document.getElementById("enabled"),
  serverUrl: document.getElementById("serverUrl"),
  childId: document.getElementById("childId"),
  safeReplace: document.getElementById("safeReplace"),
  alertThreshold: document.getElementById("alertThreshold"),
  save: document.getElementById("save"),
  status: document.getElementById("status")
};

function load() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    els.enabled.checked = settings.enabled;
    els.serverUrl.value = settings.serverUrl;
    els.childId.value = settings.childId;
    els.safeReplace.value = settings.safeReplace;
    els.alertThreshold.value = settings.alertThreshold;
  });
}

function save() {
  const next = {
    enabled: els.enabled.checked,
    serverUrl: els.serverUrl.value.trim() || DEFAULT_SETTINGS.serverUrl,
    childId: els.childId.value.trim() || DEFAULT_SETTINGS.childId,
    safeReplace: els.safeReplace.value.trim() || DEFAULT_SETTINGS.safeReplace,
    alertThreshold: Number(els.alertThreshold.value) || DEFAULT_SETTINGS.alertThreshold
  };

  chrome.storage.sync.set(next, () => {
    els.status.textContent = "Saved.";
    setTimeout(() => (els.status.textContent = ""), 1500);
  });
}

els.save.addEventListener("click", save);
load();
