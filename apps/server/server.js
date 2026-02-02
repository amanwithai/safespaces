import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8787;
const DATA_PATH = path.join(__dirname, "data", "db.json");

await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });

const adapter = new JSONFile(DATA_PATH);
const db = new Low(adapter, {
  alerts: [],
  parents: [],
  children: [],
  subscriptions: []
});

await db.read();
if (!db.data) db.data = { alerts: [], parents: [], children: [], subscriptions: [] };
await db.write();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.post("/api/parents/register", async (req, res) => {
  const name = (req.body?.name || "Parent").slice(0, 80);
  const parentId = `parent_${nanoid(8)}`;
  db.data.parents.push({ id: parentId, name, createdAt: Date.now() });
  await db.write();
  res.json({ parentId });
});

app.post("/api/events", async (req, res) => {
  const payload = req.body || {};
  let safeUrl = "";
  try {
    const parsed = new URL(payload.url || "");
    safeUrl = `${parsed.origin}${parsed.pathname}`;
  } catch {
    safeUrl = "";
  }
  const alert = {
    id: `alert_${nanoid(10)}`,
    childId: payload.childId || "child-1",
    url: safeUrl,
    text: (payload.text || "").slice(0, 300),
    hits: payload.hits || [],
    ts: payload.ts || Date.now()
  };

  db.data.alerts.unshift(alert);
  db.data.alerts = db.data.alerts.slice(0, 500);
  await db.write();

  res.json({ ok: true });
});

app.get("/api/alerts", (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  res.json({ alerts: db.data.alerts.slice(0, limit) });
});

app.get("/api/stats", (_req, res) => {
  const total = db.data.alerts.length;
  const byCategory = db.data.alerts.reduce((acc, alert) => {
    for (const hit of alert.hits || []) {
      acc[hit.category] = (acc[hit.category] || 0) + 1;
    }
    return acc;
  }, {});

  res.json({ total, byCategory });
});

app.post("/api/subscribe/checkout", async (req, res) => {
  const parentId = req.body?.parentId || "parent_unknown";
  const plan = req.body?.plan || "standard";

  const checkoutUrl = process.env.STRIPE_SECRET
    ? "https://checkout.stripe.com/mock-session"
    : "https://example.com/checkout";

  db.data.subscriptions.push({
    id: `sub_${nanoid(8)}`,
    parentId,
    plan,
    status: "pending",
    checkoutUrl,
    createdAt: Date.now()
  });
  await db.write();

  res.json({ checkoutUrl });
});

app.listen(PORT, () => {
  console.log(`SafeSpaces server running on http://localhost:${PORT}`);
});
