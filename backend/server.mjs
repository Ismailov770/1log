import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.resolve(process.cwd(), "backend", "data");

const UPSTREAM_BASE_URL = String(process.env.UPSTREAM_BASE_URL || "").trim().replace(/\/+$/, "");
const UPSTREAM_API_ROOT = String(process.env.UPSTREAM_API_ROOT || "/ru/api/v1").trim().replace(/\/+$/, "");
const UPSTREAM_GROUP_TYPE = String(process.env.UPSTREAM_GROUP_TYPE || "1").trim();
const UPSTREAM_BASIC = String(process.env.UPSTREAM_BASIC || "").trim(); // "user:pass"
const UPSTREAM_BASIC_B64 = String(process.env.UPSTREAM_BASIC_B64 || "").trim(); // "dXNlcjpwYXNz"
const UPSTREAM_ENABLED = Boolean(UPSTREAM_BASE_URL);

const json = (res, statusCode, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Telegram-Init-Data,X-Telegram-Id,X-User-Key",
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

const basicAuthHeader = () => {
  if (UPSTREAM_BASIC_B64) return `Basic ${UPSTREAM_BASIC_B64}`;
  if (!UPSTREAM_BASIC) return "";
  return `Basic ${Buffer.from(UPSTREAM_BASIC, "utf8").toString("base64")}`;
};

const upstreamRequest = async (apiPath, options = {}) => {
  if (!UPSTREAM_ENABLED) throw new Error("Upstream disabled");
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  const auth = basicAuthHeader();
  if (auth) headers.set("Authorization", auth);

  const url = `${UPSTREAM_BASE_URL}${apiPath}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
  return res.json();
};

const parseTelegramIdFromInitData = (initData) => {
  try {
    const params = new URLSearchParams(String(initData || ""));
    const rawUser = params.get("user");
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    const id = user && typeof user === "object" ? user.id : null;
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
};

const getTelegramId = (req, url) => {
  const q = url.searchParams.get("telegram_id") || url.searchParams.get("tgid");
  if (q) return String(q);

  const byHeader = req.headers["x-telegram-id"];
  if (byHeader) return String(byHeader);

  const initData = req.headers["x-telegram-init-data"];
  const id = parseTelegramIdFromInitData(initData);
  if (id) return id;

  return null;
};

const pickUserId = (data) => {
  const candidates = [
    data?.id,
    data?.user_id,
    data?.pk,
    data?.user?.id,
    data?.data?.id,
    data?.result?.id,
    data?.results?.[0]?.id,
  ];
  for (const c of candidates) {
    if (c === 0 || c === "0") continue;
    if (c !== null && c !== undefined && String(c).trim()) return String(c);
  }
  return null;
};

const resolveUserId = async (telegramId) => {
  if (!telegramId) return null;
  const data = await upstreamRequest(`${UPSTREAM_API_ROOT}/user/finder/${encodeURIComponent(telegramId)}/`, { method: "GET" });
  return pickUserId(data);
};

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

const toMiniappAccounts = (data) => {
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : Array.isArray(data?.accounts) ? data.accounts : [];
  return list.map((acc) => {
    const phoneDigits = String(acc?.phone ?? "").replace(/\D+/g, "");
    const id = String(acc?.id ?? phoneDigits ?? crypto.randomUUID());
    const isActive = Boolean(acc?.is_active ?? acc?.isActive ?? false);
    const groupsCount = Array.isArray(acc?.groups) ? acc.groups.length : Number(acc?.groupsCount || 0);
    return {
      id,
      name: `Akkaunt +${phoneDigits || id}`,
      phone: phoneDigits || String(acc?.phone ?? id),
      status: isActive ? "active" : "paused",
      groupsCount: Number.isFinite(groupsCount) ? groupsCount : 0,
    };
  });
};

const toMiniappGroups = (data, prevGroups = []) => {
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : Array.isArray(data?.groups) ? data.groups : [];
  const prevById = new Map((Array.isArray(prevGroups) ? prevGroups : []).map((g) => [String(g.id), g]));
  return list.map((g) => {
    const id = String(g?.telegram_id ?? g?.id ?? g?.username ?? crypto.randomUUID());
    const prev = prevById.get(id);
    return {
      id,
      title: String(g?.username ?? g?.title ?? id),
      folderLabel: String(g?.folderLabel ?? prev?.folderLabel ?? "Telegram"),
      groupsCount: Number(g?.groupsCount ?? prev?.groupsCount ?? 0),
      selected: Boolean(prev?.selected ?? false),
      ok: true,
    };
  });
};

const parseNumberFromString = (value) => {
  const m = String(value || "").match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

const applyMailingToState = (state, mailing) => {
  if (!mailing || typeof mailing !== "object") return state;
  const next = { ...state };
  if (typeof mailing.text === "string") next.message = mailing.text;

  const freqHours = parseNumberFromString(mailing.frequency);
  const durationDays = parseNumberFromString(mailing.duration);
  if (next.interval && typeof next.interval === "object") {
    if (freqHours) next.interval.freqHours = freqHours;
    if (durationDays) next.interval.durationDays = durationDays;
  }

  if (next.schedule && typeof next.schedule === "object") {
    if (mailing.started_at) next.schedule.startAt = String(mailing.started_at);
    if (mailing.ends_at) next.schedule.endAt = String(mailing.ends_at);
  }

  if (typeof mailing.is_active === "boolean") next.dispatchStatus = mailing.is_active ? "running" : "idle";
  return next;
};

const toMailingPatch = (state) => {
  const base = ensureShape(state);
  const now = new Date().toISOString();
  const started_at = base.schedule?.startAt || now;
  let ends_at = base.schedule?.endAt || null;

  if (!ends_at) {
    const days = Number(base.interval?.durationDays || 0);
    const end = new Date(started_at);
    end.setDate(end.getDate() + (days > 0 ? days : 1));
    ends_at = end.toISOString();
  }

  const freq = Number(base.interval?.freqHours || 0);
  const dur = Number(base.interval?.durationDays || 0);

  return {
    text: String(base.message || ""),
    frequency: freq ? `${freq}h` : "",
    duration: dur ? `${dur}d` : "",
    is_active: base.dispatchStatus === "running",
    started_at,
    ends_at,
  };
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
        const local = await readRecord(file);
        const baseState = ensureShape(local.state);

        if (!UPSTREAM_ENABLED) return json(res, 200, local);

        const telegramId = getTelegramId(req, url);
        if (!telegramId) return json(res, 200, local);

        try {
          const userId = await resolveUserId(telegramId);
          if (!userId) return json(res, 200, local);

          const [accountsRaw, mailingRaw, groupsRaw] = await Promise.all([
            upstreamRequest(`${UPSTREAM_API_ROOT}/user/accounts/${encodeURIComponent(userId)}/?page=1`, { method: "GET" }),
            upstreamRequest(`${UPSTREAM_API_ROOT}/user/mailing/${encodeURIComponent(userId)}/`, { method: "GET" }),
            upstreamRequest(`${UPSTREAM_API_ROOT}/bot-groups/${encodeURIComponent(UPSTREAM_GROUP_TYPE)}/`, { method: "GET" }),
          ]);

          let nextState = { ...baseState };
          nextState.accounts = toMiniappAccounts(accountsRaw);
          nextState = applyMailingToState(nextState, mailingRaw);
          nextState.groups = toMiniappGroups(groupsRaw, baseState.groups);

          const payload = await writeRecord(file, nextState, "pull-swagger");
          return json(res, 200, payload);
        } catch {
          return json(res, 200, local);
        }
      }

      if (req.method === "POST") {
        const raw = await readBody(req);
        const { state, reason } = getBodyState(raw);
        const nextState = ensureShape(state);

        if (UPSTREAM_ENABLED) {
          const telegramId = getTelegramId(req, url);
          if (telegramId) {
            resolveUserId(telegramId)
              .then((userId) => {
                if (!userId) return;
                const mailingPatch = toMailingPatch(nextState);
                return upstreamRequest(`${UPSTREAM_API_ROOT}/user/mailing/${encodeURIComponent(userId)}/`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ data: mailingPatch }),
                });
              })
              .catch(() => {});
          }
        }

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

      if (UPSTREAM_ENABLED) {
        const telegramId = getTelegramId(req, url);
        if (telegramId) {
          try {
            const userId = await resolveUserId(telegramId);
            if (userId) {
              const statsRaw = await upstreamRequest(`${UPSTREAM_API_ROOT}/user/statistics/`, { method: "GET" });
              const stats = Array.isArray(statsRaw) ? statsRaw.find((x) => String(x?.user || x?.user_id || x?.id) === String(userId)) : statsRaw;
              const sentOk = Number(stats?.sent_ok ?? stats?.sentOk ?? stats?.sent_count ?? stats?.sentCount ?? base.stats.sentOk ?? 0);
              const sentFail = Number(stats?.sent_fail ?? stats?.sentFail ?? stats?.failed_count ?? stats?.fail ?? base.stats.sentFail ?? 0);
              const next = { ...base, stats: { sentOk: Number.isFinite(sentOk) ? sentOk : 0, sentFail: Number.isFinite(sentFail) ? sentFail : 0 } };
              const payload = await writeRecord(file, next, reason || "refresh-stats-swagger");
              return json(res, 200, payload);
            }
          } catch {
            // fallback below
          }
        }
      }

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

      if (UPSTREAM_ENABLED) {
        const type = String(url.searchParams.get("type") || UPSTREAM_GROUP_TYPE);
        try {
          const groupsRaw = await upstreamRequest(`${UPSTREAM_API_ROOT}/bot-groups/${encodeURIComponent(type)}/`, { method: "GET" });
          const next = { ...base, groups: toMiniappGroups(groupsRaw, base.groups) };
          const payload = await writeRecord(file, next, reason || "refresh-groups-swagger");
          return json(res, 200, payload);
        } catch {
          // fallback below
        }
      }

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

      if (UPSTREAM_ENABLED) {
        const telegramId = getTelegramId(req, url);
        if (telegramId) {
          try {
            const userId = await resolveUserId(telegramId);
            if (userId) {
              await upstreamRequest(`${UPSTREAM_API_ROOT}/user/start-mailing/${encodeURIComponent(userId)}/`, { method: "GET" });
              const mailingRaw = await upstreamRequest(`${UPSTREAM_API_ROOT}/user/mailing/${encodeURIComponent(userId)}/`, { method: "GET" });
              const next = applyMailingToState(launchDispatch(base), mailingRaw);
              const payload = await writeRecord(file, next, reason || "dispatch-launch-swagger");
              return json(res, 200, payload);
            }
          } catch {
            // fallback below
          }
        }
      }

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

      if (UPSTREAM_ENABLED) {
        const telegramId = getTelegramId(req, url);
        if (telegramId) {
          try {
            const userId = await resolveUserId(telegramId);
            if (userId) {
              await upstreamRequest(`${UPSTREAM_API_ROOT}/user/stop-mailing/${encodeURIComponent(userId)}/`, { method: "GET" });
              const mailingRaw = await upstreamRequest(`${UPSTREAM_API_ROOT}/user/mailing/${encodeURIComponent(userId)}/`, { method: "GET" });
              const next = applyMailingToState({ ...base, dispatchStatus: "stopped" }, mailingRaw);
              const payload = await writeRecord(file, next, reason || "dispatch-stop-swagger");
              return json(res, 200, payload);
            }
          } catch {
            // fallback below
          }
        }
      }

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

