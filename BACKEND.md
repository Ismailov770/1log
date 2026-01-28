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
- test uchun Telegram ID: `index.html?backend=http://localhost:8787&telegramId=123456789`

## 1log.uz Swagger ulash (adapter)
`backend/server.mjs` ni 1log.uz API’ga adapter qilib ishlatsa bo‘ladi (frontend o‘zgarmaydi, baribir `/miniapp/*` ga uradi).

PowerShell misol:

```powershell
$env:UPSTREAM_BASE_URL="https://1log.uz"
$env:UPSTREAM_API_ROOT="/ru/api/v1"
$env:UPSTREAM_GROUP_TYPE="1"
$env:UPSTREAM_USE_AUTO_MAILING="1"    # 0 qilsangiz eski /user/* ishlaydi
$env:UPSTREAM_BASIC="LOGIN:PASSWORD"  # faqat kerak bo‘lsa (auth shart bo‘lmasa umuman qo‘ymang)
node backend/server.mjs
```

Adapter ishlatadigan swagger endpointlar:
- Asosiy (yangi): `/ru/api/v1/auto-mailing/*` (telegram_id bilan)
- `GET /ru/api/v1/user/finder/{telegram_id}/`
- `GET /ru/api/v1/user/accounts/{user_id}/`
- `GET/PATCH /ru/api/v1/user/mailing/{user_id}/`
- `GET /ru/api/v1/bot-groups/{type}/`
- `GET /ru/api/v1/user/start-mailing/{user_id}/`
- `GET /ru/api/v1/user/stop-mailing/{user_id}/`
- `GET /ru/api/v1/user/statistics/`

Eslatma (bizning miniapp uchun):
- `Auth` majburiy bo‘lmasa: `UPSTREAM_BASIC*`ni bo‘sh qoldiring, backend hech narsa yubormaydi.
- `Failed status` bizga kerak emas: front sent_fail ko‘rsatmaydi (kerak bo‘lsa keyin qo‘shamiz).
- `Select group` ham frontdan emas: guruhlarni backend o‘zi tanlaydi/beradi, front faqat ro‘yxatni ko‘rsatadi.

## Backend eslatma
Prod’da `initData`ni tekshirib, userga bog‘lab qo‘ying.
