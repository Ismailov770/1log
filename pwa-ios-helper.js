// pwa-ios-helper.js
(() => {
  // --- Util va holat ---------------------------------------------
  const LS_DISMISS_KEY = "pwa_ios_helper_dismissed_v2";
  const ROOT_ID = "pwa-ios-helper-root";
  const isDismissed = () => localStorage.getItem(LS_DISMISS_KEY) === "1";
  const setDismissed = () => localStorage.setItem(LS_DISMISS_KEY, "1");

  const ua = navigator.userAgent || "";
  const isIOS = /iP(hone|od|ad)/i.test(ua);
  const isStandalone = Boolean(navigator.standalone);
  const isTelegram = /Telegram/i.test(ua) || (window.Telegram && window.Telegram.WebView);

  const isSafari = (() => {
    if (!isIOS) return false;
    const isWebkit = /AppleWebKit/i.test(ua);
    const vendor = navigator.vendor || "";
    const isCriOS = /CriOS/i.test(ua);
    const isFxiOS = /FxiOS/i.test(ua);
    return isWebkit && vendor.includes("Apple") && !isCriOS && !isFxiOS;
  })();

  const currentUrl = window.location.href.split("#")[0];

  // Bir marta dismiss qilingan yoki PWA o‘rnatilgan bo‘lsa, hech narsa qilmaymiz
  if (isStandalone || isDismissed()) return;

  // --- Style (isolated) -------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    #${ROOT_ID}{position:fixed;inset:0;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:none;align-items:center;justify-content:center;}
    #${ROOT_ID}.show{display:flex;}
    #${ROOT_ID} .pwa-ios-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);animation:pwa-ios-fade .25s ease;}
    #${ROOT_ID} .pwa-ios-modal{position:relative;width:min(420px,90vw);background:#f8f9fb;border-radius:18px;padding:20px 18px;box-shadow:0 18px 48px rgba(0,0,0,.25);animation:pwa-ios-pop .26s cubic-bezier(.2,.8,.3,1.2);}
    #${ROOT_ID} h3{margin:0 0 10px;font-size:20px;font-weight:700;color:#111;text-align:center;}
    #${ROOT_ID} p{margin:8px 0;color:#222;font-size:15px;line-height:1.45;text-align:center;}
    #${ROOT_ID} .steps{margin:12px 0 16px;padding:0;list-style:none;}
    #${ROOT_ID} .steps li{display:flex;align-items:center;gap:10px;margin:10px 0;}
    #${ROOT_ID} .step-num{width:26px;height:26px;border-radius:50%;background:#007aff;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;}
    #${ROOT_ID} .cta-btn,#${ROOT_ID} .secondary-btn{width:100%;border:0;border-radius:14px;padding:12px 14px;font-size:16px;font-weight:700;cursor:pointer;transition:transform .08s ease,box-shadow .12s ease;}
    #${ROOT_ID} .cta-btn{background:#007aff;color:#fff;box-shadow:0 10px 24px rgba(0,122,255,.25);}
    #${ROOT_ID} .cta-btn:active{transform:scale(.99);}
    #${ROOT_ID} .secondary-btn{margin-top:10px;background:#e6e7eb;color:#222;}
    @keyframes pwa-ios-fade{from{opacity:0;}to{opacity:1;}}
    @keyframes pwa-ios-pop{from{transform:translateY(12px) scale(.97);opacity:.6;}to{transform:translateY(0) scale(1);opacity:1;}}
    .tg-open-safari{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483001;display:flex;align-items:center;justify-content:center;background:#007aff;color:#fff;border-radius:14px;padding:12px 14px;font-size:15px;font-weight:700;box-shadow:0 10px 24px rgba(0,122,255,.25);}
  `;
  document.head.appendChild(style);

  // --- Telegram WebView holati ------------------------------------
  if (isTelegram) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tg-open-safari";
    btn.textContent = "Safari’da ochib o‘rnatish";
    btn.addEventListener("click", () => {
      try {
        if (window.Telegram && Telegram.WebApp && typeof Telegram.WebApp.openLink === "function") {
          Telegram.WebApp.openLink(currentUrl, { try_instant_view: false });
          return;
        }
      } catch {}
      window.open(currentUrl, "_blank", "noopener,noreferrer");
    });
    document.body.appendChild(btn);
    return; // Telegramda iOS modal ko‘rsatilmaydi
  }

  // --- iOS Safari modal -------------------------------------------
  if (!(isIOS && isSafari)) return;

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = `
    <div class="pwa-ios-backdrop"></div>
    <div class="pwa-ios-modal">
      <h3>Ilovani o‘rnatish</h3>
      <p>Uyingizga qo‘shish uchun ikki qadam:</p>
      <ul class="steps">
        <li><span class="step-num">1</span><span>Safari’dagi Share tugmasini (⬆️) bosing</span></li>
        <li><span class="step-num">2</span><span>“Add to Home Screen” ni tanlang</span></li>
      </ul>
      <button class="cta-btn" type="button">Ilovani o‘rnatish</button>
      <button class="secondary-btn" type="button">Keyinroq</button>
    </div>
  `;
  document.body.appendChild(root);

  const lockScroll = () => { document.body.style.overflow = "hidden"; };
  const unlockScroll = () => { document.body.style.overflow = ""; };

  const show = () => { lockScroll(); root.classList.add("show"); };
  const hide = () => { root.classList.remove("show"); unlockScroll(); setDismissed(); };

  root.querySelector(".cta-btn").addEventListener("click", () => {
    const card = root.querySelector(".pwa-ios-modal");
    card.style.transform = "scale(.99)";
    setTimeout(() => (card.style.transform = ""), 120);
  });
  root.querySelector(".secondary-btn").addEventListener("click", hide);
  root.querySelector(".pwa-ios-backdrop").addEventListener("click", hide);

  // Ko‘rsatish
  show();
})();
