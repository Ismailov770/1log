import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.resolve(process.cwd(), "backend", "data");

const json = (res, statusCode, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Telegram-Init-Data,X-User-Key",
    "Access-Control-Max-Age": "86400",
  });
  res.end(payload);
};

const readBody = async (req, maxBytes = 10_000_000) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Body too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
};

const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);

const getUserKey = (req, url) => {
  const byQuery = url.searchParams.get("key");
  if (byQuery) return hashKey(byQuery);

  const byHeader = req.headers["x-user-key"];
  if (byHeader) return hashKey(byHeader);

  const initData = req.headers["x-telegram-init-data"];
  if (initData) return hashKey(initData);

  return "anon";
};

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const statePath = (key) => path.join(DATA_DIR, `state-${key}.json`);

const readRecord = async (file) => {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.state && typeof parsed.state === "object") return parsed;
    return { state: {} };
  } catch {
    return { state: {} };
  }
};

const writeRecord = async (file, state, reason = "") => {
  const payload = { state: state && typeof state === "object" ? state : {}, reason: reason || "", updatedAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
  return payload;
};

const getBodyState = (rawBody) => {
  try {
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    const state = parsed && typeof parsed === "object" && parsed.state && typeof parsed.state === "object" ? parsed.state : null;
    const reason = parsed && typeof parsed === "object" ? String(parsed.reason || "") : "";
    return { state, reason };
  } catch {
    return { state: null, reason: "" };
  }
};

const ensureShape = (s) => {
  const state = s && typeof s === "object" ? { ...s } : {};
  if (!state.stats || typeof state.stats !== "object") state.stats = { sentOk: 0, sentFail: 0 };
  if (!Array.isArray(state.accounts)) state.accounts = [];
  if (!Array.isArray(state.groups)) state.groups = [];
  if (!Array.isArray(state.messageImages)) state.messageImages = [];
  if (!state.interval || typeof state.interval !== "object") state.interval = { freqHours: null, durationDays: null };
  if (!state.schedule || typeof state.schedule !== "object") state.schedule = { startAt: null, endAt: null };
  if (typeof state.dispatchStatus !== "string") state.dispatchStatus = "idle";
  if (typeof state.message !== "string") state.message = "";
  if (typeof state.lang !== "string") state.lang = "ru";
  if (typeof state.version !== "number") state.version = 2;
  return state;
};

const bumpStats = (state) => {
  if (state.dispatchStatus !== "running") return state;
  const bumpOk = Math.floor(Math.random() * 30) + 1;
  const bumpFail = Math.random() < 0.2 ? 1 : 0;
  return { ...state, stats: { sentOk: (state.stats?.sentOk || 0) + bumpOk, sentFail: (state.stats?.sentFail || 0) + bumpFail } };
};

const refreshGroups = (state) => {
  const groups = Array.isArray(state.groups) ? state.groups : [];
  const nextGroups = groups.map((g) => {
    const ok = Math.random() > 0.18;
    const groupsCount = Number(g.groupsCount || 0) + (Math.random() > 0.7 ? Math.floor(Math.random() * 6) : 0);
    return { ...g, ok, groupsCount };
  });
  if (!nextGroups.some((g) => g.selected) && nextGroups[0]) {
    nextGroups[0] = { ...nextGroups[0], selected: true, ok: true };
  }
  return { ...state, groups: nextGroups };
};

const launchDispatch = (state) => {
  const durationDays = Number(state.interval?.durationDays || 0);
  const startAt = new Date().toISOString();
  const end = new Date();
  end.setDate(end.getDate() + (durationDays > 0 ? durationDays : 1));
  return { ...state, dispatchStatus: "running", schedule: { startAt, endAt: end.toISOString() } };
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") return json(res, 204, {});
    if (url.pathname === "/healthz") return json(res, 200, { ok: true });

    if (url.pathname === "/miniapp/state") {
      await ensureDataDir();
      const key = getUserKey(req, url);
      const file = statePath(key);

      if (req.method === "GET") {
        return json(res, 200, await readRecord(file));
      }

      if (req.method === "POST") {
        const raw = await readBody(req);
        const { state, reason } = getBodyState(raw);
        const nextState = ensureShape(state);
        const payload = await writeRecord(file, nextState, reason);
        return json(res, 200, payload);
      }

      return json(res, 405, { error: "Method not allowed" });
    }

    if (url.pathname === "/miniapp/stats/refresh") {
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
      await ensureDataDir();
      const key = getUserKey(req, url);
      const file = statePath(key);
      const raw = await readBody(req);
      const { state: incomingState, reason } = getBodyState(raw);
      const base = ensureShape(incomingState || (await readRecord(file)).state);
      const next = bumpStats(base);
      const payload = await writeRecord(file, next, reason || "refresh-stats");
      return json(res, 200, payload);
    }

    if (url.pathname === "/miniapp/groups/refresh") {
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
      await ensureDataDir();
      const key = getUserKey(req, url);
      const file = statePath(key);
      const raw = await readBody(req);
      const { state: incomingState, reason } = getBodyState(raw);
      const base = ensureShape(incomingState || (await readRecord(file)).state);
      const next = refreshGroups(base);
      const payload = await writeRecord(file, next, reason || "refresh-groups");
      return json(res, 200, payload);
    }

    if (url.pathname === "/miniapp/dispatch/launch") {
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
      await ensureDataDir();
      const key = getUserKey(req, url);
      const file = statePath(key);
      const raw = await readBody(req);
      const { state: incomingState, reason } = getBodyState(raw);
      const base = ensureShape(incomingState || (await readRecord(file)).state);
      const next = launchDispatch(base);
      const payload = await writeRecord(file, next, reason || "dispatch-launch");
      return json(res, 200, payload);
    }

    if (url.pathname === "/miniapp/dispatch/stop") {
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
      await ensureDataDir();
      const key = getUserKey(req, url);
      const file = statePath(key);
      const raw = await readBody(req);
      const { state: incomingState, reason } = getBodyState(raw);
      const base = ensureShape(incomingState || (await readRecord(file)).state);
      const next = { ...base, dispatchStatus: "stopped" };
      const payload = await writeRecord(file, next, reason || "dispatch-stop");
      return json(res, 200, payload);
    }

    return json(res, 404, { error: "Not found" });
  } catch (err) {
    return json(res, 500, { error: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

