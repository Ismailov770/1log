# Backend ulash (tayyor)

Frontend `app.js` ichida backend ulash tayyor (state pull/push).

## Frontend sozlash
`index.html` ichida:

```js
window.__APP_CONFIG__ = {
  backendEnabled: true,
  backendBaseUrl: "https://YOUR-API-DOMAIN",
  backendUserKey: "demo-user", // Telegram bo'lmasa ham user ajratish uchun (ixtiyoriy)
};
```

Yoki tezkor query:

`?backend=https://YOUR-API-DOMAIN&userKey=demo-user`

## Kerakli endpointlar
Frontend quyidagilarni chaqiradi:

- `GET /miniapp/state` -> `state` JSON (yoki `{ state: <state> }`)
- `POST /miniapp/state` -> body: `{ state, reason }`

Qo'shimcha (demo) endpointlar:

- `POST /miniapp/stats/refresh` -> body: `{ state, reason }` (statistikani yangilaydi)
- `POST /miniapp/groups/refresh` -> body: `{ state, reason }` (guruhlar ro'yxatini yangilaydi)
- `POST /miniapp/dispatch/launch` -> body: `{ state, reason }` (jo'natmani boshlaydi)
- `POST /miniapp/dispatch/stop` -> body: `{ state, reason }` (jo'natmani to'xtatadi)

Headerlar:

- `Content-Type: application/json`
- `X-Telegram-Init-Data: <tg.initData>` (agar Telegram MiniApp ichida ochilgan bo'lsa)
- `X-User-Key: <any>` (Telegram bo'lmasa test uchun, `backendUserKey` orqali yuboriladi)

Eslatma:
- Frontend backendga faqat kerakli state'ni yuboradi (`route` ketmaydi).

## State tarkibi (sahifalar bo‘yicha)
- Dashboard: `dispatchStatus`, `stats`, `schedule`
- Accounts: `accounts`
- Message: `message`, `messageImages`
- Groups: `groups`
- Interval: `interval`

## Example backend (local)
Repo ichida `backend/server.mjs` bor.

Ishga tushirish:

```bash
node backend/server.mjs
```

Keyin frontendni shunday oching:

- `index.html?backend=http://localhost:8787`

## Backend eslatma
Prod’da `initData`ni tekshirib, userga bog‘lab qo‘ying.
