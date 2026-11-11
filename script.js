// ==========================================
// Конфигурация на плащанията
// ==========================================
const REVOLUT_LINK = "https://revolut.me/atanasova_e/eur5"; // Revolut профил с предварително заредени €5
const CARD_PAYMENT_LINK = "https://checkout.revolut.com/pay/cba30cdb-8a40-463f-8b35-16d5652b9775"; // Revolut Pro за €5
const SELLER_EMAIL = "terarototo@gmail.com";
const FORMSUBMIT_TOKEN = "11807e56c9da653e6637553a4bb4bc8d";

const mail = (subject, body) =>
  "mailto:" + SELLER_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

// Динамично обновяване на резервните имейл линкове
function updateGmailLinks(customerEmail) {
  const email = (customerEmail || "").trim();
  const subject = email ? "Google AI Pro поръчка (" + email + ")" : "Google AI Pro поръчка";
  const body = email
    ? "Здравейте!\n\nПлатих €5.00 за Google AI Pro (Gemini).\nМоят Gmail адрес за активиране на поканата е: " + email + "\n\nПоздрави!"
    : "Здравейте!\n\nПлатих за Google AI Pro. Моят Gmail адрес за активиране е: ";

  document.querySelectorAll(".js-gmail").forEach(function (a) {
    a.href = mail(subject, body);
  });
}

// Изпращане на данните за поръчката към продавача във фонов режим (без забавяне за клиента)
function sendOrderNotification(customerEmail, paymentMethod) {
  const payload = JSON.stringify({
    email: customerEmail,
    "Метод_на_плащане": paymentMethod,
    "Сума": "€5.00",
    "Услуга": "Google AI Pro (Gemini) до 18 месеца",
    "Дата": new Date().toLocaleString("bg-BG"),
    "Сайт": window.location.hostname || "deyan.app",
    _subject: "Нова поръчка за Google AI Pro (€5) от " + customerEmail + " [" + paymentMethod + "]"
  });

  const url = "https://formsubmit.co/ajax/" + FORMSUBMIT_TOKEN;

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: payload,
      keepalive: true
    }).catch(function (err) {
      console.warn("Notice err:", err);
    });
  }
}

// Елементи на страницата и модалния прозорец
const modal = document.getElementById("pay-modal");
const pageEmail = document.getElementById("page-email");
const modalEmail = document.getElementById("modal-email");
const emailError = document.getElementById("email-error");
const payRevolutBtn = document.getElementById("pay-revolut");
const payCardBtn = document.getElementById("pay-card");
let lastFocus = null;

// Задаване на href атрибутите
if (payRevolutBtn) {
  payRevolutBtn.href = REVOLUT_LINK;
  payRevolutBtn.target = "_blank";
  payRevolutBtn.rel = "noopener";
}

if (payCardBtn) {
  if (CARD_PAYMENT_LINK) {
    payCardBtn.href = CARD_PAYMENT_LINK;
    payCardBtn.target = "_blank";
    payCardBtn.rel = "noopener";
  } else {
    payCardBtn.href = mail("Плащане с карта – Google AI Pro", "Здравейте! Искам да платя с карта за Google AI Pro.");
  }
}

// Синхронизация между полетата за имейл
function syncEmailInput(val) {
  if (pageEmail && pageEmail.value !== val) pageEmail.value = val;
  if (modalEmail && modalEmail.value !== val) modalEmail.value = val;
  if (emailError) emailError.classList.add("hidden");
  if (modalEmail) modalEmail.classList.remove("has-error");
  if (pageEmail) pageEmail.classList.remove("has-error");
  updateGmailLinks(val);
}

if (pageEmail) {
  pageEmail.addEventListener("input", function (e) {
    syncEmailInput(e.target.value);
  });
}

if (modalEmail) {
  modalEmail.addEventListener("input", function (e) {
    syncEmailInput(e.target.value);
  });
  modalEmail.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (payRevolutBtn) payRevolutBtn.focus();
    }
  });
}

function openModal(e) {
  if (e) e.preventDefault();
  lastFocus = document.activeElement;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";

  // Автоматично попълване от полето на страницата или localStorage
  const currentVal = (modalEmail ? modalEmail.value : "").trim();
  if (!currentVal) {
    const pageVal = (pageEmail ? pageEmail.value : "").trim();
    let saved = "";
    try { saved = localStorage.getItem("customer_gmail") || ""; } catch (_) {}

    if (pageVal) {
      syncEmailInput(pageVal);
    } else if (saved) {
      syncEmailInput(saved);
    }
  }

  // Фокусиране в полето за имейл най-отгоре
  if (modalEmail) {
    setTimeout(function () {
      modalEmail.focus();
      if (modalEmail.value) modalEmail.select();
    }, 50);
  }
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
  if (emailError) emailError.classList.add("hidden");
  if (modalEmail) modalEmail.classList.remove("has-error");
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll(".js-buy").forEach(function (btn) {
  btn.addEventListener("click", openModal);
});

const closeBtn = document.getElementById("pay-close");
if (closeBtn) closeBtn.addEventListener("click", closeModal);
if (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) closeModal();
});

// Проверка на имейла преди стартиране на плащането
function handlePaymentClick(e, method) {
  const email = (modalEmail ? modalEmail.value : (pageEmail ? pageEmail.value : "")).trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    e.preventDefault();
    if (emailError) emailError.classList.remove("hidden");
    if (modalEmail) {
      modalEmail.classList.add("has-error");
      modalEmail.focus();
    }
    return false;
  }

  if (emailError) emailError.classList.add("hidden");
  if (modalEmail) modalEmail.classList.remove("has-error");

  try { localStorage.setItem("customer_gmail", email); } catch (_) {}
  updateGmailLinks(email);

  // Изпращане на данните към продавача
  sendOrderNotification(email, method);

  // Връзката продължава стандартно към target="_blank", без блокиране от браузъра
  return true;
}

if (payRevolutBtn) {
  payRevolutBtn.addEventListener("click", function (e) {
    handlePaymentClick(e, "Revolut");
  });
}

if (payCardBtn) {
  payCardBtn.addEventListener("click", function (e) {
    handlePaymentClick(e, "Card");
  });
}

// Задържане на таб-навигацията вътре в прозореца
if (modal) {
  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    const f = modal.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])");
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Първоначална инициализация на резервните имейл линкове
updateGmailLinks("");
