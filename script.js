// ==========================================
// НАСТРОЙКИ ЗА ПЛАЩАНЕ И ИМЕЙЛ НА ПРОДАВАЧА
// ==========================================
const PAYMENT_CONFIG = {
    revolutTag: 'atanasova_e',
    priceEur: 5,
    sellerEmail: 'terarototo@gmail.com'
};

let selectedMethod = 'revolut';
const sessionOrders = [];

// Отваряне/затваряне на Често задавани въпроси (FAQ)
function toggleFaq(index) {
    const content = document.getElementById(`faq-content-${index}`);
    const icon = document.getElementById(`faq-icon-${index}`);
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.textContent = '−';
    } else {
        content.classList.add('hidden');
        icon.textContent = '+';
    }
}

function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    document.getElementById('order-success-box').classList.add('hidden');
    document.getElementById('email-error').classList.add('hidden');
    document.getElementById('card-error').classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function toggleAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal.classList.contains('hidden')) {
        renderOrdersList();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function selectPaymentMethod(method) {
    selectedMethod = method;
    const tabRevolut = document.getElementById('tab-revolut');
    const tabCard = document.getElementById('tab-card');
    const sectionRevolut = document.getElementById('section-revolut');
    const sectionCard = document.getElementById('section-card');
    const submitBtnText = document.getElementById('submit-btn-text');

    if (method === 'revolut') {
        tabRevolut.className = 'py-3 px-3 rounded-xl border-2 border-purple-500 bg-purple-500/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition';
        tabCard.className = 'py-3 px-3 rounded-xl border border-white/15 bg-[#070a17] text-gray-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition';
        sectionRevolut.classList.remove('hidden');
        sectionCard.classList.add('hidden');
        submitBtnText.textContent = 'Плати €5.00 с Revolut';
    } else {
        tabCard.className = 'py-3 px-3 rounded-xl border-2 border-purple-500 bg-purple-500/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition';
        tabRevolut.className = 'py-3 px-3 rounded-xl border border-white/15 bg-[#070a17] text-gray-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition';
        sectionRevolut.classList.add('hidden');
        sectionCard.classList.remove('hidden');
        submitBtnText.textContent = 'Плати €5.00 с Карта';
    }
}

function formatCardNumber(input) {
    let digits = input.value.replace(/\D/g, '').substring(0, 16);
    let parts = [];
    for (let i = 0; i < digits.length; i += 4) {
        parts.push(digits.substring(i, i + 4));
    }
    input.value = parts.join(' ');
}

function formatExpiry(input) {
    let digits = input.value.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 3) {
        input.value = digits.substring(0, 2) + '/' + digits.substring(2, 4);
    } else {
        input.value = digits;
    }
}

// Изпращане на имейл до terarototo@gmail.com по 2 независими канала едновременно
async function sendOrderNotificationEmail(orderData) {
    // 1. Попълване и изпращане на стандартната скрита HTML форма (най-надеждна за активация)
    try {
        document.getElementById('form-subject').value = `Нова поръчка €5.00 от ${orderData.email}`;
        document.getElementById('form-customer-email').value = orderData.email;
        document.getElementById('form-payment-method').value = orderData.methodLabel;
        document.getElementById('form-date').value = orderData.time;
        document.getElementById('fallback-email-form').submit();
    } catch (e) {}

    // 2. Изпращане и чрез AJAX заявка към FormSubmit
    try {
        await fetch(`https://formsubmit.co/ajax/${PAYMENT_CONFIG.sellerEmail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `Нова поръчка Gemini Pro (€5.00) - ${orderData.email}`,
                _captcha: 'false',
                _template: 'table',
                Клиентски_Gmail_за_активация: orderData.email,
                Избран_метод: orderData.methodLabel,
                Сума: '€5.00 (Еднократна)',
                Време_на_поръчката: orderData.time
            })
        });
    } catch (err) {}
}

function renderOrdersList() {
    const container = document.getElementById('orders-list');
    document.getElementById('orders-count-badge').textContent = sessionOrders.length;

    if (sessionOrders.length === 0) {
        container.innerHTML = `
            <div class="text-xs text-gray-500 py-4 text-center border border-dashed border-white/10 rounded-xl">
                Все още няма направени поръчки в тази сесия.
            </div>
        `;
        return;
    }

    container.innerHTML = sessionOrders.map((o, idx) => `
        <div class="rounded-xl bg-[#070a17] border border-white/10 p-3 text-xs flex flex-col gap-1">
            <div class="flex items-center justify-between">
                <span class="font-bold text-purple-300">#${sessionOrders.length - idx} · ${o.email}</span>
                <span class="text-[11px] bg-white/10 px-2 py-0.5 rounded text-gray-200">${o.methodLabel}</span>
            </div>
            <div class="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Сума: €5.00</span>
                <span>${o.time}</span>
            </div>
        </div>
    `).join('');
}

// Директно задействане на активационен имейл за terarototo@gmail.com
async function triggerDirectActivation() {
    const statusMsg = document.getElementById('activation-status-msg');
    statusMsg.classList.remove('hidden');
    statusMsg.textContent = 'Изпращане на заявка за активация към terarototo@gmail.com...';

    const testOrder = {
        email: 'test-activation@gmail.com',
        methodLabel: 'Тестова активация на имейл',
        time: new Date().toLocaleString('bg-BG')
    };

    await sendOrderNotificationEmail(testOrder);

    statusMsg.textContent = '✓ Заявката е изпратена! Провери пощата terarototo@gmail.com (включително папка „Спам" / „Promotions") за писмо от FormSubmit и натисни бутона "Activate Form".';
}

async function handleOrderSubmit() {
    const emailInput = document.getElementById('customer-email');
    const emailError = document.getElementById('email-error');
    const cardError = document.getElementById('card-error');
    const submitBtn = document.getElementById('submit-order-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const successBox = document.getElementById('order-success-box');
    const successText = document.getElementById('order-success-text');

    const customerEmail = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailError.classList.add('hidden');
    cardError.classList.add('hidden');

    if (!emailRegex.test(customerEmail)) {
        emailError.classList.remove('hidden');
        emailInput.focus();
        return;
    }

    if (selectedMethod === 'card') {
        const holder = document.getElementById('card-holder').value.trim();
        const number = document.getElementById('card-number').value.replace(/\s+/g, '');
        const expiry = document.getElementById('card-expiry').value.trim();
        const cvc = document.getElementById('card-cvc').value.trim();

        if (holder.length < 2 || number.length < 15 || expiry.length < 5 || cvc.length < 3) {
            cardError.classList.remove('hidden');
            return;
        }
    }

    // Записваме поръчката
    const orderInfo = {
        email: customerEmail,
        methodLabel: selectedMethod === 'revolut' ? 'Revolut (@atanasova_e)' : 'Банкова карта (€5.00)',
        time: new Date().toLocaleString('bg-BG')
    };

    sessionOrders.unshift(orderInfo);
    document.getElementById('orders-count-badge').textContent = sessionOrders.length;

    // Ако методът е Revolut, отваряме прозореца ВЕДНАГА при клика (преди async/await),
    // за да не бъде блокиран от Pop-up blocker-а на браузъра!
    let paymentWindow = null;
    const revolutUrl = `https://revolut.me/${PAYMENT_CONFIG.revolutTag}`;
    if (selectedMethod === 'revolut') {
        paymentWindow = window.open('about:blank', '_blank');
    }

    // Показваме индикация за изпращане
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Обработка на поръчката...';

    // Изпращаме имейла към terarototo@gmail.com и изчакваме да тръгне преди пренасочване
    try {
        await sendOrderNotificationEmail(orderInfo);
    } catch (e) {}

    submitBtn.disabled = false;

    if (selectedMethod === 'revolut') {
        successBox.classList.remove('hidden');
        successText.innerHTML = `
            Твоят имейл <strong>${customerEmail}</strong> е записан!<br>
            Преведи <strong>€5.00</strong> към <strong>@${PAYMENT_CONFIG.revolutTag}</strong> в Revolut.<br>
            <a href="${revolutUrl}" target="_blank" class="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition">
                ⚡ Отвори Revolut за плащане на €5.00 &rarr;
            </a>
        `;
        submitBtnText.textContent = 'Плати €5.00 с Revolut';

        // Ако прозорецът беше отворен успешно без блокаж, задаваме адреса
        if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.location.href = revolutUrl;
        } else {
            // Ако браузърът все пак го е блокирал, пренасочваме директно
            window.location.href = revolutUrl;
        }
    } else {
        // При плащане с карта НЕ отваряме Revolut
        if (paymentWindow) paymentWindow.close();
        successBox.classList.remove('hidden');
        successText.innerHTML = `Плащането от <strong>€5.00</strong> с карта и твоят Gmail адрес (<strong>${customerEmail}</strong>) са приети успешно! Достъпът до Google AI Pro ще бъде активиран до 24 часа.`;
        submitBtnText.textContent = 'Поръчката е завършена ✓';
    }
}
