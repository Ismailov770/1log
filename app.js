(() => {
  // Lokal holat (state) shu kalit orqali localStorage'da turadi.
  // Bekend yo'q bo'lsa ham ilova ishlashi uchun hamma narsa shu yerda saqlanadi.
  const STORAGE_KEY = "oneLogState:v1";
  const STATE_VERSION = 2;

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const I18N = {
    ru: {
      langLabel: "RU",
      topSupport: "Поддержка",
      topLang: "Язык",
      topMenu: "Меню",
      navDashboard: "Главная",
      navAccounts: "Аккаунты",
      navMessage: "Сообщение",
      navGroups: "Группы",
      navInterval: "Интервал",
      menuTitle: "Меню",
      menuLogout: "Выйти из аккаунта",
      logoutTitle: "Выйти?",
      logoutText: "Все локальные настройки будут сброшены на устройстве.",
      cancel: "Отмена",
      save: "Сохранить",
      confirm: "Подтвердить",
      back: "Назад",
      langPickerTitle: "Выбор языка",
      langUz: "Oʻzbek (Lotin)",
      langUzCyrl: "Ўзбекча (Кирилл)",
      langRu: "Русский",
      toastLangChanged: "Язык изменён",
      toastSupportSoon: "Поддержка: скоро",
      toastLoggedOut: "Вы вышли из аккаунта",
      toastCopied: "Скопировано",
      toastCopyFail: "Не удалось скопировать",
      toastSaved: "Сохранено",
      toastUpdated: "Обновлено",
      toastStatsUpdated: "Статистика обновлена",
      toastNoActiveDispatch: "Нет активной рассылки",
      toastStopped: "Остановлено",
      toastDispatchStarted: "Настройка завершена. Рассылка запущена.",
      toastNeedText: "Введите текст",
      toastNeedInterval: "Сначала настройте интервал",
      toastNeedAccount: "Добавьте аккаунт",
      toastNeedMessage: "Добавьте сообщение",
      toastNeedGroups: "Выберите группы",
      addAccountTitle: "Добавить аккаунт",
      addAccountPhoneHint: "Введите номер Узбекистана: 999065281 или 998999065281 (код +998 добавится автоматически).",
      addAccountPhoneLabel: "Телефон",
      addAccountGetCode: "Получить код",
      addAccountCodeTitle: "Подтверждение",
      addAccountCodeHint: (phone) => `Введите код, который пришёл на ${phone}.`,
      addAccountCodeLabel: "Код",
      addAccountNeed2fa: "Запросили пароль 2FA (если включено)",
      addAccount2faTitle: "2FA пароль",
      addAccount2faLabel: "2FA пароль",
      addAccount2faHint: "Укажите пароль двухэтапной аутентификации (2FA), если он включён.",
      toastPhoneInvalid: "Введите корректный телефон",
      toastCodeSent: (phone) => `Код отправлен на ${phone}`,
      toastEnterCode: "Введите код",
      toastEnter2fa: "Введите 2FA пароль",
      toastAccountAdded: "Аккаунт добавлен",
      accountNamePrefix: "Аккаунт",

      dashTitle: "Дашборд",
      dashSub: "Обзор активности рассылок",
      dashCreate: "Создать авто-рассылку",
      dashStop: "СТОП",
      dashStart: "СТАРТ",
      dashRefresh: "Обновить статистику",
      dashLabelSent: "Отправлено сообщений",
      dashLabelAccounts: "Активные аккаунты",
      dashLabelGroups: "Группы",
      dashLabelInterval: "Интервал",
      dashLabelStart: "Начало рассылки",
      dashLabelEnd: "Конец рассылки",
      dashStatusIdle: "● Не запущена",
      dashStatusRunning: "● Идёт рассылка",
      dashStatusStopped: "● Остановлена",

      accountsTitle: "Аккаунты",
      accountsSub: "Управление аккаунтами",
      accountsEmpty: "Добавляйте аккаунты чтобы бот мог отправлять сообщения от вашего имени.",
      accountsAdd: "Добавить аккаунт",
      accountsNext: "Дальше →",
      statusNotAdded: "× Не добавлен",
      statusAdded: "✓ Добавлен",

      messageTitle: "Сообщение",
      messageSub: "Создание шаблона сообщение",
      messagePlaceholder: "Введите текст вашего сообщения...",
      messageMarkdown: "Поддержка Markdown",
      messageSave: "Сохранить",
      messagePreviewTitle: "Рассылаемое сообщение",
      messageEdit: "Редактировать сообщение",
      messageNext: "Дальше →",

      groupsTitle: "Группы",
      groupsSub: "Добавьте чаты для рассылки",
      groupsRefresh: "Обновить",
      groupsNext: "Дальше →",

      intervalTitle: "Интервал",
      intervalSub: "Настройте периодичности",
      intervalFreqTitle: "Частота отправки сообщений:",
      intervalFreqSub: "• как часто отправлять сообщения.",
      intervalFreqNone: "# Не выбран",
      intervalFreqValue: (h) => `# Каждый ${h} час`,
      intervalEvery1h: "Каждый 1 час",
      intervalEvery3h: "Каждые 3 часа",
      intervalFreqCustom: "Свой вариант (в часах)",
      intervalDurTitle: "Продолжительность рассылки:",
      intervalDurSub: "• в течение какого времени отправлять сообщения.",
      intervalDurNone: "# Не указан",
      intervalDurValue: (d) => `# ${d} день`,
      intervalDur1d: "1 день",
      intervalDur3d: "3 дня",
      intervalDurCustom: "Свой вариант (в днях)",
      intervalLaunch: "Запустить рассылку",
      intervalStatusNone: "× Не настроен",
      intervalStatusOk: "✓ Настроен",

      tagActive: "Активен",
      tagPaused: "На паузе",
      tagLoginError: "Ошибка входа",

      unitGroups: "групп",
      folderChats: "Папка с чатами",
    },
    uz: {
      langLabel: "UZ",
      topSupport: "Yordam",
      topLang: "Til",
      topMenu: "Menyu",
      navDashboard: "Bosh sahifa",
      navAccounts: "Akkauntlar",
      navMessage: "Xabar",
      navGroups: "Guruhlar",
      navInterval: "Interval",
      menuTitle: "Menyu",
      menuLogout: "Akkauntdan chiqish",
      logoutTitle: "Chiqasizmi?",
      logoutText: "Qurilmadagi barcha lokal sozlamalar o‘chiriladi.",
      cancel: "Bekor qilish",
      save: "Saqlash",
      confirm: "Tasdiqlash",
      back: "Orqaga",
      langPickerTitle: "Tilni tanlang",
      langUz: "O‘zbek (Lotin)",
      langUzCyrl: "Ўзбекча (Кирилл)",
      langRu: "Русский",
      toastLangChanged: "Til o‘zgartirildi",
      toastSupportSoon: "Yordam: tez kunda",
      toastLoggedOut: "Akkauntdan chiqdingiz",
      toastCopied: "Nusxalandi",
      toastCopyFail: "Nusxalab bo‘lmadi",
      toastSaved: "Saqlandi",
      toastUpdated: "Yangilandi",
      toastStatsUpdated: "Statistika yangilandi",
      toastNoActiveDispatch: "Faol jo'natma yo‘q",
      toastStopped: "To‘xtatildi",
      toastDispatchStarted: "Sozlamalar yakunlandi. Jo'natma boshlandi.",
      toastNeedText: "Matn kiriting",
      toastNeedInterval: "Avval intervalni sozlang",
      toastNeedAccount: "Avval akkaunt qo‘shing",
      toastNeedMessage: "Avval xabar qo‘shing",
      toastNeedGroups: "Guruhlarni tanlang",
      addAccountTitle: "Akkaunt qo‘shish",
      addAccountPhoneHint: "Oʻzbekiston raqamini kiriting: 999065281 yoki 998999065281 (+998 avtomatik qoʻshiladi).",
      addAccountPhoneLabel: "Telefon",
      addAccountGetCode: "Kod olish",
      addAccountCodeTitle: "Tasdiqlash",
      addAccountCodeHint: (phone) => `Kod kiriting: ${phone}`,
      addAccountCodeLabel: "Kod",
      addAccountNeed2fa: "2FA parol so‘ralsa (yoqilgan bo‘lsa)",
      addAccount2faTitle: "2FA parol",
      addAccount2faLabel: "2FA parol",
      addAccount2faHint: "Agar 2FA yoqilgan bo‘lsa, parolni kiriting.",
      toastPhoneInvalid: "Telefon raqamini to‘g‘ri kiriting",
      toastCodeSent: (phone) => `Kod yuborildi: ${phone}`,
      toastEnterCode: "Kod kiriting",
      toastEnter2fa: "2FA parolni kiriting",
      toastAccountAdded: "Akkaunt qo‘shildi",
      accountNamePrefix: "Akkaunt",

      dashTitle: "Boshqaruv",
      dashSub: "Jo'natmalar faolligi",
      dashCreate: "Avto-jo'natma yaratish",
      dashStop: "TO'XTATISH",
      dashStart: "BOSHLASH",
      dashRefresh: "Statistikani yangilash",
      dashLabelSent: "Yuborilgan xabarlar",
      dashLabelAccounts: "Faol akkauntlar",
      dashLabelGroups: "Guruhlar",
      dashLabelInterval: "Interval",
      dashLabelStart: "Boshlanish vaqti",
      dashLabelEnd: "Tugash vaqti",
      dashStatusIdle: "● Ishga tushmagan",
      dashStatusRunning: "● Jo'natma ketmoqda",
      dashStatusStopped: "● To'xtatilgan",

      accountsTitle: "Akkauntlar",
      accountsSub: "Akkauntlarni boshqarish",
      accountsEmpty: "Bot sizning nomingizdan xabar yuborishi uchun akkaunt qo‘shing.",
      accountsAdd: "Akkaunt qo‘shish",
      accountsNext: "Keyingi →",
      statusNotAdded: "× Qo‘shilmagan",
      statusAdded: "✓ Qo‘shilgan",

      messageTitle: "Xabar",
      messageSub: "Xabar shablonini yaratish",
      messagePlaceholder: "Xabar matnini kiriting...",
      messageMarkdown: "Markdown qo‘llab-quvvatlanadi",
      messageSave: "Saqlash",
      messagePreviewTitle: "Yuboriladigan xabar",
      messageEdit: "Xabarni tahrirlash",
      messageNext: "Keyingi →",

      groupsTitle: "Guruhlar",
      groupsSub: "Jo'natma uchun chatlarni qo‘shing",
      groupsRefresh: "Yangilash",
      groupsNext: "Keyingi →",

      intervalTitle: "Interval",
      intervalSub: "Davriylikni sozlang",
      intervalFreqTitle: "Xabar yuborish tezligi:",
      intervalFreqSub: "• qanchalik tez yuborilsin.",
      intervalFreqNone: "# Tanlanmagan",
      intervalFreqValue: (h) => `# Har ${h} soatda`,
      intervalEvery1h: "Har 1 soatda",
      intervalEvery3h: "Har 3 soatda",
      intervalFreqCustom: "O'zim kiritaman (soat)",
      intervalDurTitle: "Jo'natma davomiyligi:",
      intervalDurSub: "• qancha vaqt davomida yuborilsin.",
      intervalDurNone: "# Ko‘rsatilmagan",
      intervalDurValue: (d) => `# ${d} kun`,
      intervalDur1d: "1 kun",
      intervalDur3d: "3 kun",
      intervalDurCustom: "O'zim kiritaman (kun)",
      intervalLaunch: "Jo'natmani ishga tushirish",
      intervalStatusNone: "× Sozlanmagan",
      intervalStatusOk: "✓ Sozlangan",

      tagActive: "Faol",
      tagPaused: "Pauza",
      tagLoginError: "Kirish xatosi",

      unitGroups: "guruh",
      folderChats: "Chatlar papkasi",
    },
    uz_cyrl: {
      langLabel: "ЎZ",
      topSupport: "Ёрдам",
      topLang: "Тил",
      topMenu: "Меню",
      navDashboard: "Бош саҳифа",
      navAccounts: "Аккаунтлар",
      navMessage: "Хабар",
      navGroups: "Гуруҳлар",
      navInterval: "Интервал",
      menuTitle: "Меню",
      menuLogout: "Аккаунтдан чиқиш",
      logoutTitle: "Чиқасизми?",
      logoutText: "Қурилмадаги барча локал созламалар ўчирилади.",
      cancel: "Бекор қилиш",
      save: "Сақлаш",
      confirm: "Тасдиқлаш",
      back: "Орқага",
      langPickerTitle: "Тилни танланг",
      langUz: "O‘zbek (Lotin)",
      langUzCyrl: "Ўзбекча (Кирилл)",
      langRu: "Русский",
      toastLangChanged: "Тил ўзгартирилди",
      toastSupportSoon: "Ёрдам: тез кунда",
      toastLoggedOut: "Аккаунтдан чиқдингиз",
      toastCopied: "Нусхаланди",
      toastCopyFail: "Нусхалаб бўлмади",
      toastSaved: "Сақланди",
      toastUpdated: "Янгиланди",
      toastStatsUpdated: "Статистика янгиланди",
      toastNoActiveDispatch: "Фаол жўнатма йўқ",
      toastStopped: "Тўхтатилди",
      toastDispatchStarted: "Созламалар якунланди. Жўнатма бошланди.",
      toastNeedText: "Матн киритинг",
      toastNeedInterval: "Аввал интервални созланг",
      toastNeedAccount: "Аввал аккаунт қўшинг",
      toastNeedMessage: "Аввал хабар қўшинг",
      toastNeedGroups: "Гуруҳларни танланг",
      addAccountTitle: "Аккаунт қўшиш",
      addAccountPhoneHint: "Ўзбекистон рақамини киритинг: 999065281 ёки 998999065281 (+998 автоматик қўшилади).",
      addAccountPhoneLabel: "Телефон",
      addAccountGetCode: "Код олиш",
      addAccountCodeTitle: "Тасдиқлаш",
      addAccountCodeHint: (phone) => `Код киритинг: ${phone}`,
      addAccountCodeLabel: "Код",
      addAccountNeed2fa: "2FA парол сўралса (ёқилган бўлса)",
      addAccount2faTitle: "2FA парол",
      addAccount2faLabel: "2FA парол",
      addAccount2faHint: "Агар 2FA ёқилган бўлса, паролни киритинг.",
      toastPhoneInvalid: "Телефон рақамини тўғри киритинг",
      toastCodeSent: (phone) => `Код юборилди: ${phone}`,
      toastEnterCode: "Код киритинг",
      toastEnter2fa: "2FA паролни киритинг",
      toastAccountAdded: "Аккаунт қўшилди",
      accountNamePrefix: "Аккаунт",

      dashTitle: "Бошқарув",
      dashSub: "Жўнатмалар фаоллиги",
      dashCreate: "Авто-жўнатма яратиш",
      dashStop: "ТО‘ХТАТИШ",
      dashStart: "БОШЛАШ",
      dashRefresh: "Статистикани янгилаш",
      dashLabelSent: "Юборилган хабарлар",
      dashLabelAccounts: "Фаол аккаунтлар",
      dashLabelGroups: "Гуруҳлар",
      dashLabelInterval: "Интервал",
      dashLabelStart: "Бошланиш вақти",
      dashLabelEnd: "Тугаш вақти",
      dashStatusIdle: "● Ишга тушмаган",
      dashStatusRunning: "● Жўнатма кетмоқда",
      dashStatusStopped: "● Тўхтатилган",

      accountsTitle: "Аккаунтлар",
      accountsSub: "Аккаунтларни бошқариш",
      accountsEmpty: "Бот сизнинг номингиздан хабар юбориши учун аккаунт қўшинг.",
      accountsAdd: "Аккаунт қўшиш",
      accountsNext: "Кейинги →",
      statusNotAdded: "× Қўшилмаган",
      statusAdded: "✓ Қўшилган",

      messageTitle: "Хабар",
      messageSub: "Хабар шаблонини яратиш",
      messagePlaceholder: "Хабар матнини киритинг...",
      messageMarkdown: "Markdown қўллаб-қувватланади",
      messageSave: "Сақлаш",
      messagePreviewTitle: "Юбориладиган хабар",
      messageEdit: "Хабарни таҳрирлаш",
      messageNext: "Кейинги →",

      groupsTitle: "Гуруҳлар",
      groupsSub: "Жўнатма учун чатларни қўшинг",
      groupsRefresh: "Янгилаш",
      groupsNext: "Кейинги →",

      intervalTitle: "Интервал",
      intervalSub: "Даврийликни созланг",
      intervalFreqTitle: "Хабар юбориш тезлиги:",
      intervalFreqSub: "• қанчалик тез юборилсин.",
      intervalFreqNone: "# Танланмаган",
      intervalFreqValue: (h) => `# Ҳар ${h} соатда`,
      intervalEvery1h: "Ҳар 1 соатда",
      intervalEvery3h: "Ҳар 3 соатда",
      intervalFreqCustom: "Ўзим киритаман (соат)",
      intervalDurTitle: "Жўнатма давомийлиги:",
      intervalDurSub: "• қанча вақт давомида юборилсин.",
      intervalDurNone: "# Кўрсатилмаган",
      intervalDurValue: (d) => `# ${d} кун`,
      intervalDur1d: "1 кун",
      intervalDur3d: "3 кун",
      intervalDurCustom: "Ўзим киритаман (кун)",
      intervalLaunch: "Жўнатмани ишга тушириш",
      intervalStatusNone: "× Созланмаган",
      intervalStatusOk: "✓ Созланган",

      tagActive: "Фаол",
      tagPaused: "Пауза",
      tagLoginError: "Кириш хатоси",

      unitGroups: "гуруҳ",
      folderChats: "Чатлар папкаси",
    },
  };

  const tr = (key, ...args) => {
    const lang = state?.lang && I18N[state.lang] ? state.lang : "ru";
    const value = I18N[lang]?.[key] ?? I18N.ru[key];
    if (typeof value === "function") return value(...args);
    return value ?? key;
  };

  const applyTopNavI18n = () => {
    const langSpan = qs(".topbar__lang span");
    if (langSpan) langSpan.textContent = tr("langLabel");
    const langBtn = qs('[data-action="lang"]');
    if (langBtn) langBtn.setAttribute("aria-label", tr("topLang"));
    const supportBtn = qs('[data-action="support"]');
    if (supportBtn) supportBtn.setAttribute("aria-label", tr("topSupport"));
    const menuBtn = qs('[data-action="menu"]');
    if (menuBtn) menuBtn.setAttribute("aria-label", tr("topMenu"));

    const setNavLabel = (route, label) => {
      const btn = qs(`.bottom-nav [data-nav="${route}"]`);
      if (!btn) return;
      btn.setAttribute("aria-label", label);
      const span = qs(".nav-item__label", btn);
      if (span) span.textContent = label;
    };
    setNavLabel("dashboard", tr("navDashboard"));
    setNavLabel("accounts", tr("navAccounts"));
    setNavLabel("message", tr("navMessage"));
    setNavLabel("groups", tr("navGroups"));
    setNavLabel("interval", tr("navInterval"));
  };

  const applyScreensI18n = () => {
    const setText = (sel, text) => {
      const el = typeof sel === "string" ? qs(sel) : sel;
      if (el) el.textContent = text;
    };
    const setBtn = (sel, text) => {
      const btn = typeof sel === "string" ? qs(sel) : sel;
      if (!btn) return;
      Array.from(btn.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) n.remove();
      });
      btn.append(document.createTextNode(` ${text}`));
    };

    setText("#screen-dashboard .title h1", tr("dashTitle"));
    setText("#screen-dashboard .title__sub", tr("dashSub"));
    const statLabels = qsa("#screen-dashboard .stat-card__label");
    if (statLabels[0]) statLabels[0].textContent = tr("dashLabelSent");
    if (statLabels[1]) statLabels[1].textContent = tr("dashLabelAccounts");
    if (statLabels[2]) statLabels[2].textContent = tr("dashLabelGroups");
    if (statLabels[3]) statLabels[3].textContent = tr("dashLabelInterval");
    if (statLabels[4]) statLabels[4].textContent = tr("dashLabelStart");
    if (statLabels[5]) statLabels[5].textContent = tr("dashLabelEnd");
    setBtn('#screen-dashboard [data-action="create-flow"]', tr("dashCreate"));
    setBtn("#btn-stop", tr("dashStop"));
    setBtn("#btn-start", tr("dashStart"));
    setBtn('#screen-dashboard [data-action="refresh-stats"]', tr("dashRefresh"));

    setText("#screen-accounts .title h1", tr("accountsTitle"));
    setText("#screen-accounts .title__sub", tr("accountsSub"));
    setText("#accounts-empty .empty__text", tr("accountsEmpty"));
    qsa('#screen-accounts [data-action="add-account"]').forEach((b) => setBtn(b, tr("accountsAdd")));
    setBtn("#accounts-next", tr("accountsNext"));

    setText("#screen-message .title h1", tr("messageTitle"));
    setText("#screen-message .title__sub", tr("messageSub"));
    const textarea = qs("#message-text");
    if (textarea) textarea.placeholder = tr("messagePlaceholder");
    setText("#message-editor .editor__hint", tr("messageMarkdown"));
    setText("#message-preview .preview__title", tr("messagePreviewTitle"));
    setBtn('#screen-message [data-action="edit-message"]', tr("messageEdit"));
    setBtn("#message-next", tr("messageNext"));

    setText("#screen-groups .title h1", tr("groupsTitle"));
    setText("#screen-groups .title__sub", tr("groupsSub"));
    setBtn('#screen-groups [data-action="refresh-groups"]', tr("groupsRefresh"));
    setBtn("#groups-next", tr("groupsNext"));

    setText("#screen-interval .title h1", tr("intervalTitle"));
    setText("#screen-interval .title__sub", tr("intervalSub"));
    const settingTitles = qsa("#screen-interval .setting-card__title");
    const settingSubs = qsa("#screen-interval .setting-card__sub");
    if (settingTitles[0]) settingTitles[0].textContent = tr("intervalFreqTitle");
    if (settingSubs[0]) settingSubs[0].textContent = tr("intervalFreqSub");
    if (settingTitles[1]) settingTitles[1].textContent = tr("intervalDurTitle");
    if (settingSubs[1]) settingSubs[1].textContent = tr("intervalDurSub");
    setText('#screen-interval [data-freq="1h"]', tr("intervalEvery1h"));
    setText('#screen-interval [data-freq="3h"]', tr("intervalEvery3h"));
    setText('#screen-interval .chip--wide[data-action="freq-custom"]', tr("intervalFreqCustom"));
    setText('#screen-interval [data-duration="1d"]', tr("intervalDur1d"));
    setText('#screen-interval [data-duration="3d"]', tr("intervalDur3d"));
    setText('#screen-interval .chip--wide[data-action="duration-custom"]', tr("intervalDurCustom"));
    setBtn("#btn-launch", tr("intervalLaunch"));
  };

  const clampInt = (value, min, max) => {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(min, Math.min(max, parsed));
  };

  const formatDateTime = (date) => {
    if (!date) return "Не начато";
    try {
      const d = new Date(date);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} / ${pad(d.getHours())}:${pad(
        d.getMinutes(),
      )}`;
    } catch {
      return "Не начато";
    }
  };

  const nowIso = () => new Date().toISOString();

  // Ilovaning asosiy holati (bitta joyda saqlaymiz).
  const defaultState = () => ({
    version: STATE_VERSION,
    route: "dashboard",
    lang: "ru",
    dispatchStatus: "idle", // idle | running | stopped
    stats: {
      sentOk: 0,
      sentFail: 0,
    },
    accounts: [],
    message: "",
    groups: [
      { id: "1log_1", title: "1LOG_1", folderLabel: "Папка с чатами", groupsCount: 67, selected: false, ok: true },
      { id: "1log_2", title: "1LOG_2", folderLabel: "Папка с чатами", groupsCount: 93, selected: false, ok: true },
      { id: "1log_3", title: "1LOG_3", folderLabel: "Папка с чатами", groupsCount: 96, selected: false, ok: true },
      { id: "1log_4", title: "1LOG_4", folderLabel: "Папка с чатами", groupsCount: 100, selected: false, ok: true },
    ],
    groupsImported: false,
    interval: {
      freqHours: null,
      durationDays: null,
    },
    schedule: {
      startAt: null,
      endAt: null,
    },
  });

  // Eski state formatlari bo'lsa, shu yerda "migratsiya" qilamiz.
  const migrateState = (raw) => {
    const base = defaultState();
    const merged = { ...base, ...(raw && typeof raw === "object" ? raw : {}) };
    if (!merged.version || merged.version !== STATE_VERSION) {
      merged.version = STATE_VERSION;
    }
    return merged;
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return migrateState(parsed);
    } catch {
      return defaultState();
    }
  };

  // Har safar state o'zgarsa shu funksiya orqali saqlab qo'yamiz.
  // Bekend ulanganida shu joydan sync (push) qilish ham qulay.
  const saveState = (_reason = "") => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    scheduleSync(_reason);
  };

  // --- Bekendga ulash uchun "skeleton" ---
  // Sozlash:
  // - `index.html` ichida `window.__APP_CONFIG__ = { backendEnabled: true, backendBaseUrl: "https://api.example.com" }`
  // - yoki localStorage: `localStorage.setItem("1log_backend", JSON.stringify({ backendEnabled: true, backendBaseUrl: "..." }))`
  const BACKEND = {
    enabled: false,
    baseUrl: "",
  };
  const BACKEND_STORAGE_KEY = "1log_backend";
  const loadBackendConfig = () => {
    const fromWindow =
      typeof window !== "undefined" && window && typeof window.__APP_CONFIG__ === "object" && window.__APP_CONFIG__
        ? window.__APP_CONFIG__
        : {};

    let fromStorage = {};
    try {
      const raw = localStorage.getItem(BACKEND_STORAGE_KEY);
      if (raw) fromStorage = JSON.parse(raw);
    } catch {
      // ignore
    }

    const params =
      typeof window !== "undefined" && window && typeof window.location?.search === "string"
        ? new URLSearchParams(window.location.search)
        : null;
    const fromQuery = params && params.get("backend") ? { backendEnabled: true, backendBaseUrl: params.get("backend") } : {};

    const cfg = { ...fromStorage, ...fromWindow, ...fromQuery };
    const baseUrl = String(cfg.backendBaseUrl || cfg.baseUrl || "").trim().replace(/\/+$/, "");
    const enabled = Boolean(cfg.backendEnabled ?? cfg.enabled);
    BACKEND.baseUrl = baseUrl;
    BACKEND.enabled = Boolean(enabled && baseUrl);
  };
  loadBackendConfig();

  let syncTimer = null;
  const scheduleSync = (reason = "") => {
    if (!BACKEND.enabled || !BACKEND.baseUrl) return;
    if (reason === "pull") return; // serverdan olgandan keyin qayta push qilmaymiz
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      backendPushState(reason).catch(() => {});
    }, 500);
  };

  // Bekend so'rovlarida Telegram Mini App `initData`ni yuborish odatda yetarli bo'ladi.
  // Backend tomonda initData verifikatsiya qilinadi va user bilan bog'lanadi.
  const backendRequest = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    if (tg && typeof tg.initData === "string" && tg.initData) {
      headers.set("X-Telegram-Init-Data", tg.initData);
    }
    const res = await fetch(`${BACKEND.baseUrl}${path}`, { ...options, headers });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return res.json();
  };

  // Bekenddan state olish (ixtiyoriy).
  const backendPullState = async () => {
    if (!BACKEND.enabled || !BACKEND.baseUrl) return;
    const remote = await backendRequest("/miniapp/state", { method: "GET" });
    const remoteState = remote && typeof remote === "object" && "state" in remote ? remote.state : remote;
    state = migrateState(remoteState);
    saveState("pull");
    render();
  };

  // Bekendga state yuborish (ixtiyoriy).
  const backendPushState = async (_reason = "") => {
    if (!BACKEND.enabled || !BACKEND.baseUrl) return;
    await backendRequest("/miniapp/state", { method: "POST", body: JSON.stringify({ state, reason: _reason }) });
  };

  const toastEl = () => qs("#toast");
  let toastTimer = null;
  const toast = (text) => {
    const el = toastEl();
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 1600);
  };

  const modal = {
    el: () => qs("#modal"),
    title: () => qs("#modal-title"),
    body: () => qs("#modal-body"),
    footer: () => qs("#modal-footer"),
    open({ title, body, footer }) {
      this.title().textContent = title || "Настройка";
      this.body().replaceChildren(body);
      this.footer().replaceChildren(...footer);
      this.el().hidden = false;
    },
    close() {
      this.el().hidden = true;
      this.body().replaceChildren();
      this.footer().replaceChildren();
    },
  };

  const tg = (() => {
    const w = window;
    if (w.Telegram && w.Telegram.WebApp) return w.Telegram.WebApp;
    return null;
  })();

  const haptic = (type = "impact", style = "light") => {
    if (!tg || !tg.HapticFeedback) return;
    try {
      if (type === "impact") tg.HapticFeedback.impactOccurred(style);
      if (type === "selection") tg.HapticFeedback.selectionChanged();
      if (type === "notification") tg.HapticFeedback.notificationOccurred(style);
    } catch {
      // ignore
    }
  };

  const setRoute = (route) => {
    state.route = route;
    saveState();
    render();
  };

  const continueSetupFlow = () => {
    if (!state.accounts.length) return setRoute("accounts");
    if (!state.message || !state.message.trim()) return setRoute("message");
    if (!state.groups.some((g) => g.selected)) return setRoute("groups");
    return setRoute("interval");
  };

  const setActiveNav = () => {
    qsa("[data-nav]").forEach((btn) => {
      const target = btn.getAttribute("data-nav");
      btn.classList.toggle("is-active", target === state.route && btn.classList.contains("nav-item"));
    });
    qsa(".nav-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-nav") === state.route);
    });
  };

  const showScreen = () => {
    qsa("[data-screen]").forEach((screen) => {
      const screenId = screen.id.replace("screen-", "");
      screen.hidden = screenId !== state.route;
    });
  };

  const updateTopBarBack = () => {
    if (!tg || !tg.BackButton) return;
    const canGoBack = state.route !== "dashboard";
    try {
      if (canGoBack) tg.BackButton.show();
      else tg.BackButton.hide();
    } catch {
      // ignore
    }
  };

  const renderDashboard = () => {
    const accountsActive = state.accounts.filter((a) => a.status === "active").length;
    const groupsSelected = state.groups.filter((g) => g.selected).length;
    const units = (() => {
      if (state.lang === "uz") return { h: "soat", d: "kun" };
      if (state.lang === "uz_cyrl") return { h: "соат", d: "кун" };
      return { h: "час", d: "день" };
    })();
    const intervalLabel =
      state.interval.freqHours && state.interval.durationDays
        ? `${state.interval.freqHours} ${units.h} / ${state.interval.durationDays} ${units.d}`
        : `0 ${units.h} / 0 ${units.d}`;

    qs("#stat-sent-ok").textContent = String(state.stats.sentOk);
    qs("#stat-sent-fail").textContent = String(state.stats.sentFail);
    qs("#stat-accounts").textContent = String(accountsActive);
    qs("#stat-groups").textContent = String(groupsSelected);
    qs("#stat-interval").textContent = intervalLabel;
    qs("#stat-start").textContent = formatDateTime(state.schedule.startAt);
    qs("#stat-end").textContent = formatDateTime(state.schedule.endAt);

    const status = qs("#dashboard-status");
    status.classList.remove("status-pill--run", "status-pill--bad");
    if (state.dispatchStatus === "running") {
      status.textContent = tr("dashStatusRunning");
      status.classList.add("status-pill--run");
    } else if (state.dispatchStatus === "stopped") {
      status.textContent = tr("dashStatusStopped");
      status.classList.add("status-pill--bad");
    } else {
      status.textContent = tr("dashStatusIdle");
    }

    const btnStart = qs("#btn-start");
    const btnStop = qs("#btn-stop");
    const btnRefresh = qs('#screen-dashboard [data-action="refresh-stats"]');
    const btnCreate = qs('#screen-dashboard [data-action="create-flow"]');
    const actionsStack = qs("#dashboard-actions");

    const hasLaunched = Boolean(state.schedule.startAt) || state.dispatchStatus !== "idle";

    if (btnCreate) btnCreate.hidden = hasLaunched;
    if (actionsStack) actionsStack.hidden = !hasLaunched;

    if (!hasLaunched) {
      btnStart.hidden = true;
      btnStop.hidden = true;
      if (btnRefresh) btnRefresh.hidden = true;
      return;
    }

    if (btnRefresh) btnRefresh.hidden = false;
    btnStart.hidden = state.dispatchStatus === "running";
    btnStop.hidden = state.dispatchStatus !== "running";
  };

  const accountInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const letters = [parts[0]?.[0], parts[1]?.[0]].filter(Boolean).join("");
    return letters ? letters.toUpperCase() : "А";
  };

  const statusTag = (status) => {
    if (status === "active") return { text: tr("tagActive"), cls: "tag tag--ok" };
    if (status === "paused") return { text: tr("tagPaused"), cls: "tag tag--pause" };
    return { text: tr("tagLoginError"), cls: "tag tag--bad" };
  };

  const renderAccounts = () => {
    const empty = qs("#accounts-empty");
    const list = qs("#accounts-list");
    const actions = qs("#accounts-actions");
    const status = qs("#accounts-status");

    if (!state.accounts.length) {
      empty.hidden = false;
      list.hidden = true;
      actions.hidden = true;
      status.textContent = tr("statusNotAdded");
      status.classList.add("status-pill--muted");
      status.classList.remove("status-pill--ok");
      return;
    }

    empty.hidden = true;
    list.hidden = false;
    actions.hidden = false;

    status.textContent = tr("statusAdded");
    status.classList.remove("status-pill--muted");
    status.classList.add("status-pill--ok");

    list.replaceChildren(
      ...state.accounts.map((acc) => {
        const el = document.createElement("div");
        el.className = "item-card item-card--account";
        el.dataset.accountId = acc.id;

        const tag = statusTag(acc.status);

        el.innerHTML = `
          <div class="item-card__left">
            <div class="avatar">${accountInitials(acc.name)}</div>
            <div class="account-card__main">
              <div class="account-card__top">
                <div class="account-card__name">${escapeHtml(acc.name)}</div>
                <span class="badge">${acc.groupsCount} ${escapeHtml(tr("unitGroups"))}</span>
              </div>
              <div class="account-card__meta">+${escapeHtml(acc.phone)}</div>
              <div class="account-card__status"><span class="${tag.cls}">${tag.text}</span></div>
            </div>
          </div>
          <div class="item-card__actions">
            <button class="action action--primary" type="button" data-action="toggle-account" data-account-id="${acc.id}" aria-label="Пауза/Старт">
              ${
                acc.status === "active"
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`
              }
            </button>
            <button class="action action--danger" type="button" data-action="delete-account" data-account-id="${acc.id}" aria-label="Удалить">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `;
        return el;
      }),
    );
  };

  const renderMessage = () => {
    const editor = qs("#message-editor");
    const preview = qs("#message-preview");
    const status = qs("#message-status");
    const bubble = qs("#message-preview .bubble");
    const toggle = qs("#message-preview-toggle");

    const has = Boolean(state.message && state.message.trim().length);
    if (has && messageMode !== "edit") {
      editor.hidden = true;
      preview.hidden = false;
      status.textContent = tr("statusAdded");
      status.classList.remove("status-pill--muted");
      status.classList.add("status-pill--ok");
      qs("#message-preview-text").textContent = state.message;

      const text = String(state.message || "");
      const lines = text.split(/\r?\n/).length;
      const isLong = text.length > 260 || lines > 10;
      if (bubble) {
        bubble.classList.toggle("is-collapsible", isLong);
        bubble.classList.toggle("is-expanded", isLong && messagePreviewExpanded);
      }
      if (toggle) {
        toggle.hidden = !isLong;
        toggle.setAttribute("aria-expanded", isLong && messagePreviewExpanded ? "true" : "false");
      }
    } else {
      editor.hidden = false;
      preview.hidden = true;
      messagePreviewExpanded = false;
      if (bubble) bubble.classList.remove("is-collapsible", "is-expanded");
      if (toggle) {
        toggle.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
      if (has) {
        status.textContent = tr("statusAdded");
        status.classList.remove("status-pill--muted");
        status.classList.add("status-pill--ok");
      } else {
        status.textContent = tr("statusNotAdded");
        status.classList.add("status-pill--muted");
        status.classList.remove("status-pill--ok");
      }
      const textarea = qs("#message-text");
      if (textarea.value !== state.message) textarea.value = state.message || "";
      qs("#message-count").textContent = String((textarea.value || "").length);
    }
  };

  const groupMark = (g) => {
    if (!g.selected) return "";
    return g.ok ? `<span class="tag tag--ok">✓</span>` : `<span class="tag tag--bad">✕</span>`;
  };

  const renderGroups = () => {
    const list = qs("#groups-list");
    const next = qs("#groups-next");
    const status = qs("#groups-status");
    const importBox = qs("#groups-import");
    const refreshBtn = qs('#screen-groups [data-action="refresh-groups"]');
    const selected = state.groups.filter((g) => g.selected);

    const shouldShowImport = Boolean(state.message && state.message.trim()) && !state.groupsImported;
    if (importBox) importBox.hidden = !shouldShowImport;
    if (shouldShowImport) {
      if (list) list.hidden = true;
      if (refreshBtn) refreshBtn.hidden = true;
      if (next) next.hidden = true;
      status.textContent = tr("statusNotAdded");
      status.classList.add("status-pill--muted");
      status.classList.remove("status-pill--ok");
      return;
    }

    if (list) list.hidden = false;
    if (refreshBtn) refreshBtn.hidden = false;

    list.replaceChildren(
      ...state.groups.map((g) => {
        const el = document.createElement("div");
        el.className = "item-card item-card--group";
        el.dataset.groupId = g.id;
        el.innerHTML = `
          <div class="item-card__left">
            <div class="avatar">
              <svg class="icon icon--sm"><use href="#i-users"></use></svg>
            </div>
            <div class="item-card__main">
              <div class="item-card__title">${escapeHtml(g.title)} ${groupMark(g)}</div>
              <div class="item-card__meta">
                <span>📁 ${escapeHtml(tr("folderChats"))} | ${g.groupsCount} ${escapeHtml(tr("unitGroups"))}</span>
              </div>
            </div>
          </div>
          <div class="item-card__actions">
            <button class="action" type="button" data-action="copy-group" data-group-id="${g.id}" aria-label="Копировать">
              <svg class="icon icon--sm"><use href="#i-copy"></use></svg>
            </button>
          </div>
        `;
        el.style.cursor = "pointer";
        return el;
      }),
    );

    if (selected.length) {
      status.textContent = tr("statusAdded");
      status.classList.remove("status-pill--muted");
      status.classList.add("status-pill--ok");
      next.hidden = false;
    } else {
      status.textContent = tr("statusNotAdded");
      status.classList.add("status-pill--muted");
      status.classList.remove("status-pill--ok");
      next.hidden = true;
    }
  };

  const renderInterval = () => {
    const freqValue = qs("#freq-value");
    const durationValue = qs("#duration-value");
    const status = qs("#interval-status");
    const launch = qs("#btn-launch");

    qsa("[data-freq]").forEach((btn) => {
      const hours = btn.getAttribute("data-freq") === "1h" ? 1 : btn.getAttribute("data-freq") === "3h" ? 3 : null;
      btn.classList.toggle("is-active", hours === state.interval.freqHours);
    });
    qsa("[data-duration]").forEach((btn) => {
      const days = btn.getAttribute("data-duration") === "1d" ? 1 : btn.getAttribute("data-duration") === "3d" ? 3 : null;
      btn.classList.toggle("is-active", days === state.interval.durationDays);
    });

    freqValue.textContent = state.interval.freqHours ? tr("intervalFreqValue", state.interval.freqHours) : tr("intervalFreqNone");
    durationValue.textContent = state.interval.durationDays ? tr("intervalDurValue", state.interval.durationDays) : tr("intervalDurNone");

    const configured = Boolean(state.interval.freqHours && state.interval.durationDays);
    launch.hidden = !configured;
    launch.disabled = !configured;
    if (configured) {
      status.textContent = tr("intervalStatusOk");
      status.classList.remove("status-pill--muted");
      status.classList.add("status-pill--ok");
    } else {
      status.textContent = tr("intervalStatusNone");
      status.classList.add("status-pill--muted");
      status.classList.remove("status-pill--ok");
    }
  };

  const render = () => {
    setActiveNav();
    showScreen();
    applyTopNavI18n();
    applyScreensI18n();
    updateTopBarBack();
    renderDashboard();
    renderAccounts();
    renderMessage();
    renderGroups();
    renderInterval();
  };

  const escapeHtml = (value) => {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const openAddAccount = () => {
    // Real backend bo'lsa: bu flow (telefon -> kod -> 2FA) serverga ketadi va server akkauntni ulab beradi.
    // Hozircha demo: tekshiruvlardan o'tsa, akkauntni localStorage'ga qo'shib qo'yamiz.
    const normalizePhone = (raw) => {
      const digits = String(raw || "").replace(/\D+/g, "");
      if (!digits) return null;
      if (digits.length === 9) return `998${digits}`;
      if (digits.length === 12 && digits.startsWith("998")) return digits;
      return null;
    };

    const formatUzLocal = (nineDigits) => {
      const d = String(nineDigits || "").replace(/\D+/g, "").slice(0, 9);
      const p1 = d.slice(0, 2);
      const p2 = d.slice(2, 5);
      const p3 = d.slice(5, 7);
      const p4 = d.slice(7, 9);
      return [p1, p2, p3, p4].filter(Boolean).join(" ");
    };

    const formatPhone = (digits) => {
      const d = String(digits || "");
      if (d.startsWith("998") && d.length === 12) {
        const cc = d.slice(0, 3);
        const a = d.slice(3, 5);
        const b = d.slice(5, 8);
        const c = d.slice(8, 10);
        const e = d.slice(10, 12);
        return `+${cc} (${a}) ${b}-${c}-${e}`;
      }
      return `+${d}`;
    };

    const session = {
      phone: "",
      code: "",
      password: "",
      need2fa: false,
    };

    const finish = () => {
      const digits = normalizePhone(session.phone);
      if (!digits) {
        toast(tr("toastPhoneInvalid"));
        haptic("notification", "error");
        return;
      }
      state.accounts.unshift({
        id: cryptoId(),
        name: `${tr("accountNamePrefix")} ${formatPhone(digits)}`,
        phone: digits,
        status: "active",
        groupsCount: 67,
      });
      saveState();
      modal.close();
      toast("Аккаунт добавлен");
      haptic("notification", "success");
      render();
    };

    const renderStep = (step) => {
      const body = document.createElement("div");

      if (step === "phone") {
        const phone = document.createElement("input");
        phone.type = "tel";
        phone.placeholder = "99 906 52 81";
        phone.inputMode = "numeric";
        phone.autocomplete = "tel-national";

        const phonePrefix = document.createElement("span");
        phonePrefix.className = "phone-prefix";
        phonePrefix.textContent = "+998";

        const phoneBox = document.createElement("div");
        phoneBox.className = "phone-input";
        phoneBox.append(phonePrefix, phone);

        const setPhoneDigits = (rawValue) => {
          let digits = String(rawValue || "").replace(/\D+/g, "");
          if (digits.startsWith("998")) digits = digits.slice(3);
          digits = digits.slice(0, 9);
          session.phone = digits;
          phone.value = formatUzLocal(digits);
        };

        setPhoneDigits(session.phone);
        phone.addEventListener("input", () => setPhoneDigits(phone.value));

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = tr("addAccountPhoneHint");

        body.append(hint, field(tr("addAccountPhoneLabel"), phoneBox));

        const cancel = button(tr("cancel"), "btn btn-secondary", () => modal.close());
        const next = button(tr("addAccountGetCode"), "btn btn-primary", () => {
          const digits = normalizePhone(session.phone);
          if (!digits) {
            toast(tr("toastPhoneInvalid"));
            haptic("notification", "error");
            return;
          }
          session.phone = digits;
          session.code = "";
          session.password = "";
          session.need2fa = false;
          toast(tr("toastCodeSent", formatPhone(digits)));
          haptic("notification", "success");
          renderStep("code");
        });

        modal.open({ title: tr("addAccountTitle"), body, footer: [cancel, next] });
        setTimeout(() => phone.focus(), 0);
        return;
      }

      if (step === "code") {
        const code = document.createElement("input");
        code.type = "text";
        code.placeholder = "12345";
        code.inputMode = "numeric";
        code.maxLength = 8;
        code.value = session.code;

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = tr("addAccountCodeHint", formatPhone(session.phone));

        const need2fa = document.createElement("input");
        need2fa.type = "checkbox";
        need2fa.checked = session.need2fa;

        const need2faLabel = document.createElement("label");
        need2faLabel.style.display = "flex";
        need2faLabel.style.alignItems = "center";
        need2faLabel.style.gap = "10px";
        need2faLabel.style.marginTop = "10px";
        need2faLabel.style.fontWeight = "900";
        need2faLabel.style.color = "#374151";
        need2faLabel.append(need2fa, document.createTextNode(tr("addAccountNeed2fa")));

        body.append(hint, field(tr("addAccountCodeLabel"), code), need2faLabel);

        const back = button(tr("back"), "btn btn-secondary", () => renderStep("phone"));
        const next = button(tr("confirm"), "btn btn-primary", () => {
          const v = String(code.value || "").trim();
          if (v.length < 4) {
            toast(tr("toastEnterCode"));
            haptic("notification", "error");
            return;
          }
          session.code = v;
          session.need2fa = Boolean(need2fa.checked);
          if (session.need2fa) {
            renderStep("password");
            return;
          }
          finish();
        });

        modal.open({ title: tr("addAccountCodeTitle"), body, footer: [back, next] });
        setTimeout(() => code.focus(), 0);
        return;
      }

      if (step === "password") {
        const pass = document.createElement("input");
        pass.type = "password";
        pass.placeholder = tr("addAccount2faLabel");
        pass.autocomplete = "current-password";
        pass.value = session.password;

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = tr("addAccount2faHint");

        body.append(hint, field(tr("addAccount2faLabel"), pass));

        const back = button(tr("back"), "btn btn-secondary", () => renderStep("code"));
        const done = button(tr("confirm"), "btn btn-primary", () => {
          const v = String(pass.value || "");
          if (!v.trim()) {
            toast(tr("toastEnter2fa"));
            haptic("notification", "error");
            return;
          }
          session.password = v;
          finish();
        });

        modal.open({ title: tr("addAccount2faTitle"), body, footer: [back, done] });
        setTimeout(() => pass.focus(), 0);
        return;
      }
    };

    renderStep("phone");
  };

  const openCustomNumber = ({ title, label, placeholder, min, max, initial, onSave }) => {
    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.placeholder = placeholder;
    if (initial) input.value = String(initial);

    const body = document.createElement("div");
    body.append(field(label, input));

    const cancel = button(tr("cancel"), "btn btn-secondary", () => modal.close());
    const save = button(tr("save"), "btn btn-primary", () => {
      const value = clampInt(input.value, min, max);
      if (!value) {
        toast(`Введите число ${min}-${max}`);
        haptic("notification", "error");
        return;
      }
      onSave(value);
      saveState();
      modal.close();
      toast(tr("toastSaved"));
      haptic("notification", "success");
      render();
    });

    modal.open({ title, body, footer: [cancel, save] });
    setTimeout(() => input.focus(), 0);
  };

  const field = (labelText, inputEl) => {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.textContent = labelText;
    wrap.append(label, inputEl);
    return wrap;
  };

  const button = (text, cls, onClick) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = cls;
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
  };

  const cryptoId = () => {
    try {
      return crypto.randomUUID();
    } catch {
      return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    }
  };

  const launchDispatch = () => {
    // Real backend bo'lsa: shu joyda /dispatch/start kabi endpoint chaqiriladi.
    if (!state.interval.freqHours || !state.interval.durationDays) {
      toast(tr("toastNeedInterval"));
      haptic("notification", "error");
      return;
    }
    if (!state.accounts.length) {
      toast(tr("toastNeedAccount"));
      haptic("notification", "error");
      setRoute("accounts");
      return;
    }
    if (!state.message || !state.message.trim()) {
      toast(tr("toastNeedMessage"));
      haptic("notification", "error");
      setRoute("message");
      return;
    }
    if (!state.groups.some((g) => g.selected)) {
      toast(tr("toastNeedGroups"));
      haptic("notification", "error");
      setRoute("groups");
      return;
    }
    state.dispatchStatus = "running";
    state.schedule.startAt = nowIso();
    const end = new Date();
    end.setDate(end.getDate() + state.interval.durationDays);
    state.schedule.endAt = end.toISOString();
    saveState();
    toast(tr("toastDispatchStarted"));
    haptic("notification", "success");
    setRoute("dashboard");
  };

  const stopDispatch = () => {
    state.dispatchStatus = "stopped";
    saveState();
    toast(tr("toastStopped"));
    haptic("notification", "warning");
    render();
  };

  const startFromDashboard = () => {
    if (!state.interval.freqHours || !state.interval.durationDays) {
      toast(tr("toastNeedInterval"));
      setRoute("interval");
      return;
    }
    launchDispatch();
  };

  const refreshStats = () => {
    // Real backend bo'lsa: statistika serverdan olinadi (/stats).
    if (state.dispatchStatus === "running") {
      const bumpOk = Math.floor(Math.random() * 30) + 1;
      const bumpFail = Math.random() < 0.2 ? 1 : 0;
      state.stats.sentOk += bumpOk;
      state.stats.sentFail += bumpFail;
      saveState();
      toast(tr("toastStatsUpdated"));
      haptic("impact", "light");
      renderDashboard();
      return;
    }
    toast(tr("toastNoActiveDispatch"));
    haptic("impact", "light");
  };

  const toggleAccount = (id) => {
    const acc = state.accounts.find((a) => a.id === id);
    if (!acc) return;
    if (acc.status === "active") acc.status = "paused";
    else if (acc.status === "paused") acc.status = "active";
    saveState();
    haptic("selection");
    renderAccounts();
    renderDashboard();
  };

  const deleteAccount = (id) => {
    state.accounts = state.accounts.filter((a) => a.id !== id);
    saveState();
    toast("Удалено");
    haptic("impact", "light");
    render();
  };

  const toggleGroup = (id) => {
    const g = state.groups.find((x) => x.id === id);
    if (!g) return;
    g.selected = !g.selected;
    saveState();
    haptic("selection");
    renderGroups();
    renderDashboard();
  };

  const refreshGroups = () => {
    // Real backend bo'lsa: guruhlar ro'yxati serverdan keladi (/groups) va shu yerda state'ga yoziladi.
    if (!state.groupsImported && state.message && state.message.trim()) state.groupsImported = true;
    state.groups = state.groups.map((g) => {
      const ok = Math.random() > 0.18;
      const groupsCount = g.groupsCount + (Math.random() > 0.7 ? Math.floor(Math.random() * 6) : 0);
      return { ...g, ok, groupsCount };
    });
    if (!state.groups.some((g) => g.selected) && state.groups[0]) {
      state.groups[0].selected = true;
      state.groups[0].ok = true;
    }
    saveState();
    toast(tr("toastUpdated"));
    haptic("impact", "light");
    renderGroups();
    renderDashboard();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(tr("toastCopied"));
      haptic("notification", "success");
    } catch {
      toast(tr("toastCopyFail"));
      haptic("notification", "error");
    }
  };

  const openLanguagePicker = () => {
    const body = document.createElement("div");

    const mkOption = (code, label) => {
      const row = document.createElement("label");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.gap = "12px";
      row.style.padding = "10px 6px";
      row.style.fontWeight = "900";
      row.style.color = "#111827";

      const left = document.createElement("div");
      left.textContent = label;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "lang";
      input.value = code;
      input.checked = state.lang === code;

      row.append(left, input);
      return row;
    };

    body.append(mkOption("uz", tr("langUz")), mkOption("uz_cyrl", tr("langUzCyrl")), mkOption("ru", tr("langRu")));

    const cancel = button(tr("cancel"), "btn btn-secondary", () => modal.close());
    const save = button(tr("save"), "btn btn-primary", () => {
      const selected = qs('input[name="lang"]:checked', body);
      const code = selected?.value;
      if (!code || !I18N[code]) return;
      state.lang = code;
      saveState();
      modal.close();
      toast(tr("toastLangChanged"));
      haptic("notification", "success");
      render();
    });

    modal.open({ title: tr("langPickerTitle"), body, footer: [cancel, save] });
  };

  const logoutReset = () => {
    // "Akkauntdan chiqish" — lokal state'ni tozalab, hammasini noldan boshlaymiz.
    const keepLang = state.lang && I18N[state.lang] ? state.lang : "ru";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    state = defaultState();
    state.lang = keepLang;
    saveState("logout");
    modal.close();
    toast(tr("toastLoggedOut"));
    haptic("notification", "success");
    render();
  };

  const openMenu = () => {
    const body = document.createElement("div");
    const logoutBtn = button(tr("menuLogout"), "btn btn-danger btn-full", () => {
      const text = document.createElement("p");
      text.className = "hint";
      text.textContent = tr("logoutText");
      const cancel = button(tr("cancel"), "btn btn-secondary", () => modal.close());
      const ok = button(tr("confirm"), "btn btn-primary", () => logoutReset());
      modal.open({ title: tr("logoutTitle"), body: text, footer: [cancel, ok] });
    });
    body.append(logoutBtn);
    const close = button(tr("cancel"), "btn btn-secondary btn-full", () => modal.close());
    modal.open({ title: tr("menuTitle"), body, footer: [close] });
  };

  let messageMode = "auto"; // auto | edit
  let messagePreviewExpanded = false;
  let state = loadState();

  const initTelegram = () => {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      if (typeof tg.setHeaderColor === "function") tg.setHeaderColor("#05238B");
      if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor("#F2F3F5");
      if (tg.BackButton) {
        tg.BackButton.onClick(() => {
          if (state.route === "dashboard") return;
          setRoute("dashboard");
        });
      }
    } catch {
      // ignore
    }
  };

  const initEvents = () => {
    document.addEventListener("click", (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      const nav = target.closest("[data-nav]");
      if (nav) {
        const route = nav.getAttribute("data-nav");
        if (route) {
          haptic("selection");
          setRoute(route);
        }
        return;
      }

      const act = target.closest("[data-action]");
      if (act) {
        const action = act.getAttribute("data-action");
        if (!action) return;

        if (action === "support") return toast(tr("toastSupportSoon"));
        if (action === "lang") return openLanguagePicker();
        if (action === "menu") return openMenu();
        if (action === "modal-close") return modal.close();
        if (action === "create-flow") {
          haptic("selection");
          return continueSetupFlow();
        }
        if (action === "toggle-preview") {
          const bubble = act.closest(".bubble");
          if (!bubble || !bubble.classList.contains("is-collapsible")) return;
          messagePreviewExpanded = !messagePreviewExpanded;
          bubble.classList.toggle("is-expanded", messagePreviewExpanded);
          act.setAttribute("aria-expanded", messagePreviewExpanded ? "true" : "false");
          return;
        }

        if (action === "add-account") return openAddAccount();
        if (action === "accounts-next") return setRoute("message");
        if (action === "message-next") {
          const text = (qs("#message-text") && !qs("#message-editor").hidden ? qs("#message-text").value : state.message) || "";
          if (!String(text).trim()) {
            toast(tr("toastNeedText"));
            haptic("notification", "error");
            return;
          }
          state.message = String(text);
          messageMode = "auto";
          messagePreviewExpanded = false;
          saveState();
          return setRoute("groups");
        }
        if (action === "groups-next") return setRoute("interval");

        if (action === "edit-message") {
          haptic("selection");
          messageMode = "edit";
          messagePreviewExpanded = false;
          qs("#message-text").value = state.message || "";
          renderMessage();
          return;
        }

        if (action === "copy-message") return copyText(state.message || "");
        if (action === "copy-group") {
          const id = act.getAttribute("data-group-id");
          const g = state.groups.find((x) => x.id === id);
          if (g) {
            copyText(`${g.title}`);
            if (!g.selected) {
              g.selected = true;
              g.ok = true;
              saveState();
              renderGroups();
              renderDashboard();
            }
          }
          return;
        }
        if (action === "groups-import-link") {
          const url = act.getAttribute("data-link");
          if (!url) return;

          copyText(url);

          state.groupsImported = true;
          if (!state.groups.some((g) => g.selected) && state.groups[0]) {
            state.groups[0].selected = true;
            state.groups[0].ok = true;
          }
          saveState();
          renderGroups();
          renderDashboard();
          return;
        }
        if (action === "toggle-account") return toggleAccount(act.getAttribute("data-account-id"));
        if (action === "delete-account") return deleteAccount(act.getAttribute("data-account-id"));
        if (action === "refresh-groups") return refreshGroups();
        if (action === "refresh-stats") return refreshStats();
        if (action === "stop") return stopDispatch();
        if (action === "start") return startFromDashboard();
        if (action === "launch") return launchDispatch();

        if (action === "freq-custom") {
          return openCustomNumber({
            title: "Частота (в часах)",
            label: "Каждые N часов",
            placeholder: "Например: 2",
            min: 1,
            max: 24,
            initial: state.interval.freqHours,
            onSave: (v) => (state.interval.freqHours = v),
          });
        }
        if (action === "duration-custom") {
          return openCustomNumber({
            title: "Продолжительность (в днях)",
            label: "Сколько дней",
            placeholder: "Например: 7",
            min: 1,
            max: 30,
            initial: state.interval.durationDays,
            onSave: (v) => (state.interval.durationDays = v),
          });
        }

        return;
      }

      const groupItem = target.closest("[data-group-id]");
      if (groupItem) {
        const gid = groupItem.getAttribute("data-group-id");
        if (gid) toggleGroup(gid);
        return;
      }
    });

    document.addEventListener("input", (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      if (target.id === "message-text") {
        const text = target.value || "";
        qs("#message-count").textContent = String(text.length);
      }
    });

    document.addEventListener("click", (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;

      const freq = t.closest("[data-freq]");
      if (freq) {
        const v = freq.getAttribute("data-freq");
        state.interval.freqHours = v === "1h" ? 1 : v === "3h" ? 3 : null;
        saveState();
        haptic("selection");
        renderInterval();
        renderDashboard();
      }

      const duration = t.closest("[data-duration]");
      if (duration) {
        const v = duration.getAttribute("data-duration");
        state.interval.durationDays = v === "1d" ? 1 : v === "3d" ? 3 : null;
        saveState();
        haptic("selection");
        renderInterval();
        renderDashboard();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.el().hidden) modal.close();
    });
  };

  initTelegram();
  initEvents();
  render();

  // Backend yoqilgan bo'lsa, shu yerda serverdan state'ni olib kelib "local"ga yozib qo'ysak bo'ladi.
  // Hozircha BACKEND.enabled = false, shuning uchun bu chaqiriq hech narsa qilmaydi.
  backendPullState().catch(() => {});
})();
