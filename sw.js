const CACHE_NAME = "1log-pwa-v5";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./favicon.ico",
  "./road.png",
  "./manifest.webmanifest",
  "./assets/index-BjxYhzPR.js",
  "./assets/index-CHbOIPTW.css",
  "./assets/1L-Br7cta6P.webp",
  "./assets/card-bg-BnOoUkph.jpg",
  "./assets/site-bg-RmO23AzW.jpg",
  "./assets/icons/icon-180.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHtml = req.mode === "navigate" || accept.includes("text/html");
  const isJsCss = url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

  if (isHtml) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || caches.match("./index.html");
        }
      })(),
    );
    return;
  }

  // JS/CSS: telefonlarda eski cache qolib ketmasin deb network-first qilamiz.
  if (isJsCss) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req, { cache: "no-store" });
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached;
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        return cached;
      }
    })(),
  );
});
