// Настройки: промени ги тук.
  const REVOLUT_LINK = "https://revolut.me/atanasova_e/eur5";
  const CARD_PAYMENT_LINK = "https://checkout.revolut.com/pay/cba30cdb-8a40-463f-8b35-16d5652b9775";
  const EMAIL = "terarototo@gmail.com";                        // тук идват известията за нови поръчки
  const ORDER_URL = "https://formsubmit.co/ajax/11807e56c9da653e6637553a4bb4bc8d";     // FormSubmit

  const $ = function (id) { return document.getElementById(id); };
  const mail = function (subject, body) {
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  };
  function setLink(el, url) {
    el.href = url;
    if (/^https?:/.test(url)) { el.target = "_blank"; el.rel = "noopener"; }
    else { el.removeAttribute("target"); el.removeAttribute("rel"); }
  }
  const store = {
    get: function () { try { return localStorage.getItem("order_email") || ""; } catch (e) { return ""; } },
    set: function (v) { try { localStorage.setItem("order_email", v); } catch (e) {} }
  };

  setLink($("pay-revolut"), REVOLUT_LINK || mail("Плащане с Revolut – Google AI Pro", "Здравей! Искам да платя с Revolut."));
  if (CARD_PAYMENT_LINK) {
    setLink($("pay-card"), CARD_PAYMENT_LINK);
  } else {
    setLink($("pay-card"), mail("Плащане с карта – Google AI Pro", "Здравей! Искам да платя с карта."));
    $("pay-card-sub").textContent = "Пишеш ни и получаваш линк за плащане";
  }

  const modal = $("pay-modal");
  const steps = ["step-email", "step-pay", "step-done"];
  let customerEmail = "", lastFocus = null;

  function showStep(name) {
    steps.forEach(function (id) { $(id).classList.toggle("hidden", id !== "step-" + name); });
  }
  function showModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function openModal(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    showModal();
    showStep("email");
    $("email-error").classList.add("hidden");
    $("order-email").value = store.get();
    $("order-email").focus();
  }
  function showDone(opened, link) {
    $("email-done").textContent = customerEmail || store.get() || "имейла от поръчката";
    $("done-opened").classList.toggle("hidden", !opened);
    $("pay-again").classList.toggle("hidden", !opened);
    if (opened && link) setLink($("pay-again"), link);
    showStep("done");
    $("done-close").focus();
  }

  // Известие за нова поръчка (имейл + начин на плащане). Не означава, че е платено.
  function sendOrder(method) {
    try {
      fetch(ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "Нова поръчка (очаква плащане): Google AI Pro",
          _captcha: "false",
          email: customerEmail,
          payment_method: method,
          product: "Google AI Pro (Gemini) до 18 месеца, €5.00",
          note: "Клиентът отвори платежната страница. Провери плащането в Revolut, преди да изпратиш достъпа."
        })
      }).catch(function () {});
    } catch (e) {}
  }

  // 1 → 2: имейлът е задължителен преди плащане
  $("step-email").addEventListener("submit", function (e) {
    e.preventDefault();
    const v = $("order-email").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      $("email-error").classList.remove("hidden");
      $("order-email").focus();
      return;
    }
    $("email-error").classList.add("hidden");
    customerEmail = v;
    store.set(v);
    $("email-show").textContent = v;
    showStep("pay");
    $("pay-revolut").focus();
  });
  $("email-change").addEventListener("click", function () { showStep("email"); $("order-email").focus(); });

  // 2 → 3: плащането се отваря в нов раздел, а тук остава „Благодарим“
  [["pay-revolut", "Revolut"], ["pay-card", "Карта"]].forEach(function (o) {
    $(o[0]).addEventListener("click", function () {
      const link = this.href;
      sendOrder(o[1]);
      setTimeout(function () { showDone(true, link); }, 200);
    });
  });

  document.querySelectorAll(".js-buy").forEach(function (a) { a.addEventListener("click", openModal); });
  $("pay-close").addEventListener("click", closeModal);
  $("done-close").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    const f = Array.prototype.filter.call(modal.querySelectorAll("a[href], button, input"), function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Връщане от плащане: https://deyan.app/?success=1 (само „Благодарим“, без линк за достъп)
  if (/[?&]success\b/.test(location.search) || location.hash === "#success") {
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
    customerEmail = store.get();
    showModal();
    showDone(false);
  }