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

const readBody = async (req, maxBytes = 1_000_000) => {
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
        try {
          const raw = await fs.readFile(file, "utf8");
          return json(res, 200, JSON.parse(raw));
        } catch {
          return json(res, 200, { state: {} });
        }
      }

      if (req.method === "POST") {
        const raw = await readBody(req);
        const parsed = raw ? JSON.parse(raw) : {};
        const payload = {
          state: parsed && typeof parsed === "object" && parsed.state ? parsed.state : {},
          reason: parsed && typeof parsed === "object" ? parsed.reason || "" : "",
          updatedAt: new Date().toISOString(),
        };
        await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
        return json(res, 200, { ok: true });
      }

      return json(res, 405, { error: "Method not allowed" });
    }

    return json(res, 404, { error: "Not found" });
  } catch (err) {
    return json(res, 500, { error: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

