# Backend ulash (tayyor)

Frontend `app.js` ichida backend uchun tayyor "skeleton" bor (state pull/push).

## Frontend sozlash
`index.html` ichida:

```js
window.__APP_CONFIG__ = {
  backendEnabled: true,
  backendBaseUrl: "https://YOUR-API-DOMAIN",
};
```

Yoki vaqtincha query orqali:

`?backend=https://YOUR-API-DOMAIN`

## Kerakli endpointlar
Frontend quyidagilarni chaqiradi:

- `GET /miniapp/state` -> `state` JSON (yoki `{ state: <state> }`)
- `POST /miniapp/state` -> body: `{ state, reason }`

Headerlar:

- `Content-Type: application/json`
- `X-Telegram-Init-Data: <tg.initData>` (agar Telegram MiniApp ichida ochilgan bo'lsa)

## Example backend (local)
Repo ichida `backend/server.mjs` bor.

Ishga tushirish:

```bash
node backend/server.mjs
```

Keyin frontendni shunday oching:

- `index.html?backend=http://localhost:8787`

## Backend eslatma
Real prod backenda `initData` ni tekshirish (verify) va user bilan bog'lash tavsiya qilinadi.
