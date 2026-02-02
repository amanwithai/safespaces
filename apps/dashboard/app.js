const serverInput = document.getElementById("serverUrl");
const refreshBtn = document.getElementById("refresh");
const totalAlerts = document.getElementById("totalAlerts");
const groomingCount = document.getElementById("groomingCount");
const scamCount = document.getElementById("scamCount");
const impersonationCount = document.getElementById("impersonationCount");
const alertsList = document.getElementById("alertsList");
const childFilter = document.getElementById("childFilter");
const parentIdInput = document.getElementById("parentId");
const planSelect = document.getElementById("plan");
const checkoutBtn = document.getElementById("checkout");
const checkoutStatus = document.getElementById("checkoutStatus");

const defaultServer = "https://safespaces-production.up.railway.app";
serverInput.value = localStorage.getItem("serverUrl") || defaultServer;

function getServerUrl() {
  const url = serverInput.value.trim() || defaultServer;
  localStorage.setItem("serverUrl", url);
  return url;
}

async function loadStats() {
  const res = await fetch(`${getServerUrl()}/api/stats`);
  const data = await res.json();
  totalAlerts.textContent = data.total || 0;
  groomingCount.textContent = data.byCategory?.grooming || 0;
  scamCount.textContent = data.byCategory?.scam || 0;
  impersonationCount.textContent = data.byCategory?.impersonation || 0;
}

function renderAlerts(alerts) {
  const filter = childFilter.value.trim();
  const filtered = filter
    ? alerts.filter((alert) => alert.childId === filter)
    : alerts;

  alertsList.innerHTML = "";
  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.textContent = "No alerts yet.";
    alertsList.appendChild(empty);
    return;
  }

  filtered.forEach((alert) => {
    const item = document.createElement("li");
    item.className = "alert-item";
    const hits = (alert.hits || []).map((hit) => hit.category).join(", ");
    const date = new Date(alert.ts).toLocaleString();
    item.innerHTML = `
      <div class="meta">${date} • ${alert.childId} • ${hits}</div>
      <div class="text">${alert.text}</div>
      <div class="meta">${alert.url}</div>
    `;
    alertsList.appendChild(item);
  });
}

async function loadAlerts() {
  const res = await fetch(`${getServerUrl()}/api/alerts?limit=50`);
  const data = await res.json();
  renderAlerts(data.alerts || []);
}

async function refreshAll() {
  await Promise.all([loadStats(), loadAlerts()]);
}

refreshBtn.addEventListener("click", refreshAll);
childFilter.addEventListener("input", loadAlerts);

checkoutBtn.addEventListener("click", async () => {
  checkoutStatus.textContent = "Creating checkout...";
  const payload = {
    parentId: parentIdInput.value.trim() || "parent_unknown",
    plan: planSelect.value
  };

  try {
    const res = await fetch(`${getServerUrl()}/api/subscribe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    checkoutStatus.textContent = `Checkout link: ${data.checkoutUrl}`;
  } catch (err) {
    checkoutStatus.textContent = "Checkout unavailable.";
  }
});

refreshAll();
