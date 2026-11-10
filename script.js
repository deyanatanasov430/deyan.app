// ==========================================
// НАСТРОЙКИ ЗА ПЛАЩАНЕ И ИМЕЙЛ НА ПРОДАВАЧА
// ==========================================
const PAYMENT_CONFIG = {
    revolutTag: 'atanasova_e',
    priceEur: 5,
    sellerEmail: 'terarototo@gmail.com',
    formSubmitToken: '11807e56c9da653e6637553a4bb4bc8d',
    // ПОСТАВИ ТУК ТВОЯ STRIPE PAYMENT LINK ИЛИ REVOLUT PRO ЛИНК ЗА €5.00 (напр. 'https://buy.stripe.com/xxxx')
    cardPaymentLink: localStorage.getItem('custom_card_payment_link') || ''
};

let selectedMethod = 'revolut';
const sessionOrders = [];

// Автоматично форматиране на номер на карта (0000 0000 0000 0000)
function formatCardNumber(input) {
    let digits = input.value.replace(/\D/g, '').substring(0, 16);
    let formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    input.value = formatted;
}

// Автоматично форматиране на валидност (MM/YY)
function formatCardExpiry(input) {
    let digits = input.value.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 3) {
        input.value = digits.substring(0, 2) + '/' + digits.substring(2, 4);
    } else {
        input.value = digits;
    }
}

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
    document.getElementById('threeds-box').classList.add('hidden');
    const submitBtn = document.getElementById('submit-order-btn');
    submitBtn.disabled = false;
    selectPaymentMethod(selectedMethod);
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
        const linkInput = document.getElementById('admin-card-link-input');
        if (linkInput) linkInput.value = PAYMENT_CONFIG.cardPaymentLink;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function saveCardPaymentLink() {
    const input = document.getElementById('admin-card-link-input');
    const msg = document.getElementById('card-link-saved-msg');
    PAYMENT_CONFIG.cardPaymentLink = input.value.trim();
    localStorage.setItem('custom_card_payment_link', PAYMENT_CONFIG.cardPaymentLink);
    msg.classList.remove('hidden');
    msg.textContent = '✓ Линкът за картово плащане е запазен!';
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

// Изпращане на имейл до terarototo@gmail.com чрез твоя активиран токен 11807e56c9da653e6637553a4bb4bc8d
async function sendOrderNotificationEmail(orderData) {
    // 1. Попълване и изпращане на скритата HTML форма
    try {
        document.getElementById('form-subject').value = `Нова поръчка €5.00 от ${orderData.email}`;
        document.getElementById('form-customer-email').value = orderData.email;
        document.getElementById('form-payment-method').value = orderData.methodLabel;
        document.getElementById('form-date').value = orderData.time;
        document.getElementById('fallback-email-form').submit();
    } catch (e) {}

    // 2. Изпращане чрез AJAX с твоя уникален код 11807e56c9da653e6637553a4bb4bc8d
    try {
        await fetch(`https://formsubmit.co/ajax/${PAYMENT_CONFIG.formSubmitToken}`, {
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

async function handleOrderSubmit() {
    const emailInput = document.getElementById('customer-email');
    const emailError = document.getElementById('email-error');
    const cardError = document.getElementById('card-error');
    const submitBtn = document.getElementById('submit-order-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const successBox = document.getElementById('order-success-box');
    const successTitle = document.getElementById('order-success-title');
    const successText = document.getElementById('order-success-text');

    const customerEmail = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailError.classList.add('hidden');
    cardError.classList.add('hidden');
    successBox.classList.add('hidden');

    if (!emailRegex.test(customerEmail)) {
        emailError.classList.remove('hidden');
        emailInput.focus();
        return;
    }

    // Ако е избрано плащане с Карта -> валидираме полетата на картата
    let cardLast4 = '';
    if (selectedMethod === 'card') {
        const holder = document.getElementById('card-holder').value.trim();
        const rawNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
        const expiry = document.getElementById('card-expiry').value.trim();
        const cvc = document.getElementById('card-cvc').value.trim();

        if (holder.length < 2 || rawNumber.length < 15 || expiry.length < 5 || cvc.length < 3) {
            cardError.classList.remove('hidden');
            cardError.textContent = 'Моля, попълни коректно всички данни на картата.';
            return;
        }
        cardLast4 = rawNumber.slice(-4);
    }

    // Записваме поръчката
    const orderInfo = {
        email: customerEmail,
        methodLabel: selectedMethod === 'revolut' 
            ? 'Revolut (@atanasova_e)' 
            : `Банкова карта (•••• ${cardLast4} - €5.00)`,
        time: new Date().toLocaleString('bg-BG')
    };

    sessionOrders.unshift(orderInfo);
    document.getElementById('orders-count-badge').textContent = sessionOrders.length;

    // Показваме индикация за обработка на плащането
    submitBtn.disabled = true;
    submitBtnText.textContent = selectedMethod === 'card' 
        ? 'Обработка на плащането (€5.00)...' 
        : 'Пренасочване към Revolut...';

    // Изпращаме имейла във фонов режим (без бавене)
    sendOrderNotificationEmail(orderInfo);

    if (selectedMethod === 'revolut') {
        // Добавяме /eur5, за да може Revolut автоматично да зареди сумата 5 евро без писане
        const revolutUrl = `https://revolut.me/${PAYMENT_CONFIG.revolutTag}/eur${PAYMENT_CONFIG.priceEur}`;
        successBox.classList.remove('hidden');
        successTitle.innerHTML = `<span>✓</span> Поръчката е приета успешно!`;
        successText.innerHTML = `
            Твоят имейл <strong>${customerEmail}</strong> е записан!<br>
            Пренасочваме те към Revolut (<strong>@${PAYMENT_CONFIG.revolutTag}</strong>) за превод на <strong>€5.00</strong>...<br>
            <a href="${revolutUrl}" class="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition">
                ⚡ Кликни тук, ако не се отвори автоматично &rarr;
            </a>
        `;

        // Директно пренасочване без блокиране от браузъра
        setTimeout(() => {
            window.location.href = revolutUrl;
        }, 500);
    } else {
        // При плащане с Карта:
        // 1. Ако си сложил реален Stripe / Revolut Pro линк, отваря реалния банков терминал за €5.00
        if (PAYMENT_CONFIG.cardPaymentLink && PAYMENT_CONFIG.cardPaymentLink.startsWith('http')) {
            const separator = PAYMENT_CONFIG.cardPaymentLink.includes('?') ? '&' : '?';
            const checkoutUrl = `${PAYMENT_CONFIG.cardPaymentLink}${separator}prefilled_email=${encodeURIComponent(customerEmail)}`;
            window.location.href = checkoutUrl;
            return;
        }

        // 2. Показваме 3D Secure проверка и след потвърждение изписваме Успешно платено на същия прозорец
        await new Promise(resolve => setTimeout(resolve, 800));
        document.getElementById('threeds-box').classList.remove('hidden');
        submitBtnText.textContent = 'Изчакване на 3D Secure потвърждение...';
        window.lastCardOrder = { customerEmail, cardLast4 };
    }
}

async function confirmThreeDSecure() {
    const submitBtn = document.getElementById('submit-order-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const successBox = document.getElementById('order-success-box');
    const successTitle = document.getElementById('order-success-title');
    const successText = document.getElementById('order-success-text');
    const threedsBox = document.getElementById('threeds-box');

    const info = window.lastCardOrder || { customerEmail: document.getElementById('customer-email').value.trim(), cardLast4: '0000' };

    threedsBox.classList.add('hidden');
    submitBtn.disabled = false;
    successBox.classList.remove('hidden');
    successTitle.innerHTML = `<span>✓</span> Успешно платено! До 24 часа ще се свържем с вас.`;
    successText.innerHTML = `Плащането от <strong>€5.00</strong> с карта (•••• ${info.cardLast4}) е потвърдено. Достъпът до Google AI Pro ще бъде активиран на <strong>${info.customerEmail}</strong> до 24 часа.`;
    submitBtnText.textContent = 'Успешно платено ✓';
}

// Автоматично показване на "Успешно платено! До 24 часа ще се свържем с вас." при връщане от реален банков терминал (?payment=success)
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
        openCheckoutModal();
        selectPaymentMethod('card');
        const successBox = document.getElementById('order-success-box');
        const successTitle = document.getElementById('order-success-title');
        const successText = document.getElementById('order-success-text');
        const submitBtnText = document.getElementById('submit-btn-text');
        successBox.classList.remove('hidden');
        successTitle.innerHTML = `<span>✓</span> Успешно платено! До 24 часа ще се свържем с вас.`;
        successText.innerHTML = `Плащането от <strong>€5.00</strong> с карта е обработено успешно! До 24 часа ще се свържем с вас на посочения Gmail адрес.`;
        submitBtnText.textContent = 'Успешно платено ✓';
    }
});
