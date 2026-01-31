# WebApp API Documentation

Base URL: `/ru/api/v1/auto-mailing/`

Barcha API'larda `telegram_id` - foydalanuvchining Telegram ID raqami.

---

## 1. Status API

Foydalanuvchi haqida umumiy ma'lumot olish (dashboard uchun).

### Request
```
GET /ru/api/v1/auto-mailing/status/{telegram_id}/
```

### Response (200 OK)
```json
{
  "user": {
    "telegram_id": 123456789,
    "phone": 998901234567,
    "first_name": "Ali",
    "lang": 1
  },
  "accounts_count": 2,
  "groups_count": 15,
  "mailing": {
    "text": "Yuk bor Toshkent-Moskva",
    "frequency": "00:30:00",
    "duration": "08:00:00",
    "is_active": false,
    "sent_count": 0,
    "max_runs": 240,
    "next_run_at": null,
    "started_at": null,
    "ends_at": null,
    "step": 0,
    "max_steps": 16,
    "image": null,
    "video": null
  },
  "subscription": {
    "sender_ends_at": "2025-03-15",
    "finder_ends_at": "2025-03-15",
    "is_sender_active": true,
    "is_finder_active": true
  }
}
```

### Response (404 Not Found)
```json
{
  "error": "user_not_found"
}
```

### `lang` qiymatlari:
- `0` - Русский
- `1` - O'zbekcha (lotin)
- `2` - Ўзбекча (кирилл)

---

## 2. Accounts API

### 2.1 Account List

Foydalanuvchining barcha Telegram akkauntlari ro'yxati.

#### Request
```
GET /ru/api/v1/auto-mailing/accounts/{telegram_id}/
```

#### Response (200 OK)
```json
[
  {
    "phone": 998901234567,
    "is_active": true,
    "groups_count": 10
  },
  {
    "phone": 998907654321,
    "is_active": true,
    "groups_count": 8
  }
]
```

---

### 2.2 Send Code

Yangi akkaunt qo'shish uchun tasdiqlash kodi yuborish.

#### Request
```
POST /ru/api/v1/auto-mailing/accounts/{telegram_id}/send-code/
Content-Type: application/json

{
  "phone": "+998901234567"
}
```

#### Response (200 OK) - Muvaffaqiyatli
```json
{
  "success": true
}
```

#### Response - Xatoliklar
```json
{
  "success": false,
  "error": "account_exists"
}
```
```json
{
  "success": false,
  "error": "invalid_phone"
}
```
```json
{
  "success": false,
  "error": "flood_wait",
  "seconds": 300
}
```

---

### 2.3 Verify Code

Tasdiqlash kodini tekshirish.

#### Request
```
POST /ru/api/v1/auto-mailing/accounts/{telegram_id}/verify-code/
Content-Type: application/json

{
  "phone": "+998901234567",
  "code": "12345"
}
```

#### Response (200 OK) - Muvaffaqiyatli
```json
{
  "success": true
}
```

#### Response - 2FA kerak
```json
{
  "success": false,
  "needs_2fa": true
}
```

#### Response - Xatoliklar
```json
{
  "success": false,
  "error": "invalid_code"
}
```
```json
{
  "success": false,
  "error": "expired"
}
```

---

### 2.4 Verify 2FA

Ikki bosqichli autentifikatsiya parolini tekshirish.

#### Request
```
POST /ru/api/v1/auto-mailing/accounts/{telegram_id}/verify-2fa/
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "my2fapassword"
}
```

#### Response (200 OK) - Muvaffaqiyatli
```json
{
  "success": true
}
```

#### Response - Xatoliklar
```json
{
  "success": false,
  "error": "invalid_password"
}
```
```json
{
  "success": false,
  "error": "expired"
}
```

---

### 2.5 Delete Account

Akkauntni o'chirish.

#### Request
```
DELETE /ru/api/v1/auto-mailing/accounts/{telegram_id}/{phone}/
```

#### Response (200 OK)
```json
{
  "success": true
}
```

#### Response (404 Not Found)
```json
{
  "success": false,
  "error": "account_not_found"
}
```

---

## 3. Groups API

### 3.1 Group List

Barcha mavjud guruhlar ro'yxati.

#### Request
```
GET /ru/api/v1/auto-mailing/groups/{telegram_id}/
```

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "name": "Logistika Uzbekistan",
    "type": 0,
    "link": "https://t.me/logistika_uz"
  },
  {
    "id": 2,
    "name": "Yuk tashish",
    "type": 0,
    "link": "https://t.me/yuk_tashish"
  }
]
```

### `type` qiymatlari:
- `0` - Public
- `1` - Private

---

### 3.2 Sync Groups

Foydalanuvchi akkauntlaridagi guruhlarni sinxronlashtirish (background task).

#### Request
```
GET /ru/api/v1/auto-mailing/groups/{telegram_id}/sync/
```

#### Response (200 OK)
```json
[]
```

> **Note:** Bu API background task ishga tushiradi. Natijani olish uchun bir oz vaqtdan keyin Group List API'ni qayta chaqiring.

---

## 4. Mailing API

### 4.1 Get Mailing

Joriy mailing sozlamalarini olish.

#### Request
```
GET /ru/api/v1/auto-mailing/mailing/{telegram_id}/
```

#### Response (200 OK)
```json
{
  "text": "Yuk bor Toshkent-Moskva. Tel: +998901234567",
  "frequency": "00:30:00",
  "duration": "08:00:00",
  "is_active": false,
  "sent_count": 45,
  "max_runs": 240,
  "next_run_at": null,
  "started_at": null,
  "ends_at": null,
  "step": 0,
  "max_steps": 16,
  "image": "/media/mailing/image.jpg",
  "video": null
}
```

---

### 4.2 Update Mailing Content

Mailing matnini yoki mediasini yangilash.

#### Request (text only)
```
PATCH /ru/api/v1/auto-mailing/mailing/{telegram_id}/
Content-Type: application/json

{
  "text": "Yangi xabar matni"
}
```

#### Request (with image)
```
PATCH /ru/api/v1/auto-mailing/mailing/{telegram_id}/
Content-Type: multipart/form-data

text: "Xabar matni"
image: [file]
```

#### Request (with video)
```
PATCH /ru/api/v1/auto-mailing/mailing/{telegram_id}/
Content-Type: multipart/form-data

text: "Xabar matni"
video: [file]
```

#### Request (remove media)
```
PATCH /ru/api/v1/auto-mailing/mailing/{telegram_id}/
Content-Type: application/json

{
  "image": null
}
```

#### Response (200 OK)
```json
{
  "text": "Yangi xabar matni",
  "frequency": "00:30:00",
  "duration": "08:00:00",
  "is_active": false,
  "sent_count": 0,
  "max_runs": 240,
  "next_run_at": null,
  "started_at": null,
  "ends_at": null,
  "step": 0,
  "max_steps": 16,
  "image": null,
  "video": null
}
```

> **Note:** `image` va `video` bir vaqtda bo'lishi mumkin emas. Birini yuklasangiz, ikkinchisi avtomatik o'chiriladi.

---

### 4.3 Update Mailing Interval

Mailing vaqt oralig'ini sozlash.

#### Request
```
PATCH /ru/api/v1/auto-mailing/mailing/{telegram_id}/interval/
Content-Type: application/json

{
  "frequency": "00:30:00",
  "duration": "08:00:00"
}
```

#### Response (200 OK)
```json
{
  "text": "Xabar matni",
  "frequency": "00:30:00",
  "duration": "08:00:00",
  "is_active": false,
  "sent_count": 0,
  "max_runs": 240,
  "next_run_at": null,
  "started_at": null,
  "ends_at": null,
  "step": 0,
  "max_steps": 16,
  "image": null,
  "video": null
}
```

#### Duration format
- `"HH:MM:SS"` - soat:minut:sekund
- Masalan: `"00:30:00"` = 30 minut, `"08:00:00"` = 8 soat

---

### 4.4 Start Mailing

Mailingni ishga tushirish.

#### Request
```
POST /ru/api/v1/auto-mailing/mailing/{telegram_id}/start/
```

#### Response (200 OK) - Muvaffaqiyatli
```json
{
  "success": true,
  "mailing": {
    "text": "Xabar matni",
    "frequency": "00:30:00",
    "duration": "08:00:00",
    "is_active": true,
    "sent_count": 0,
    "max_runs": 240,
    "next_run_at": "2025-01-30T10:30:00Z",
    "started_at": "2025-01-30T10:00:00Z",
    "ends_at": "2025-01-30T18:00:00Z",
    "step": 0,
    "max_steps": 16,
    "image": null,
    "video": null
  }
}
```

#### Response - Xatoliklar
```json
{
  "success": false,
  "error": "no_subscription"
}
```
```json
{
  "success": false,
  "error": "no_accounts"
}
```
```json
{
  "success": false,
  "error": "no_groups"
}
```
```json
{
  "success": false,
  "error": "no_content"
}
```
```json
{
  "success": false,
  "error": "no_interval"
}
```

#### Error kodlari:
| Error | Tavsif |
|-------|--------|
| `no_subscription` | Obuna muddati tugagan |
| `no_accounts` | Aktiv akkaunt yo'q |
| `no_groups` | Guruhlar yo'q |
| `no_content` | Xabar matni yoki media yo'q |
| `no_interval` | Vaqt oralig'i sozlanmagan |

---

### 4.5 Stop Mailing

Mailingni to'xtatish.

#### Request
```
POST /ru/api/v1/auto-mailing/mailing/{telegram_id}/stop/
```

#### Response (200 OK)
```json
{
  "success": true,
  "mailing": {
    "text": "Xabar matni",
    "frequency": "00:30:00",
    "duration": "08:00:00",
    "is_active": false,
    "sent_count": 45,
    "max_runs": 240,
    "next_run_at": null,
    "started_at": "2025-01-30T10:00:00Z",
    "ends_at": "2025-01-30T18:00:00Z",
    "step": 3,
    "max_steps": 16,
    "image": null,
    "video": null
  }
}
```

---

## Error Response Format

Barcha API'larda umumiy xatolik formati:

### 404 - User not found
```json
{
  "error": "user_not_found"
}
```

### 400 - Validation error
```json
{
  "field_name": [
    "This field is required."
  ]
}
```

---

## Akkaunt qo'shish flow

```
1. POST /accounts/{telegram_id}/send-code/  →  {"phone": "+998..."}
   ↓
2. Agar success: true
   ↓
3. POST /accounts/{telegram_id}/verify-code/  →  {"phone": "+998...", "code": "12345"}
   ↓
4. Agar needs_2fa: true
   ↓
5. POST /accounts/{telegram_id}/verify-2fa/  →  {"phone": "+998...", "password": "..."}
   ↓
6. success: true  →  Akkaunt qo'shildi!
```

---

## Mailing ishga tushirish flow

```
1. PATCH /mailing/{telegram_id}/  →  Xabar matnini yozish
   ↓
2. PATCH /mailing/{telegram_id}/interval/  →  Vaqt oralig'ini sozlash
   ↓
3. GET /groups/{telegram_id}/sync/  →  Guruhlarni sinxronlashtirish
   ↓
4. POST /mailing/{telegram_id}/start/  →  Ishga tushirish
   ↓
5. POST /mailing/{telegram_id}/stop/  →  To'xtatish (kerak bo'lganda)
```
