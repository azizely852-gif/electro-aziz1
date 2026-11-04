/**
 * Electro Aziz - Standalone Desktop JavaScript
 * Pure Vanilla JS - No Build Steps or NPM required
 */

const WHATSAPP_PHONE = '+212666451752';
const WHATSAPP_NUMBER_CLEAN = '212666451752';

const PLANS_DATA = [
  { id: '1m', name: { fr: 'Formule 1 Mois', ar: 'باقة 1 شهر', en: '1-Month Plan' }, mad: 90, eur: 10, usd: 11 },
  { id: '3m', name: { fr: 'Formule 3 Mois', ar: 'باقة 3 أشهر', en: '3-Month Plan' }, mad: 220, eur: 24, usd: 26 },
  { id: '6m', name: { fr: 'Formule 6 Mois', ar: 'باقة 6 أشهر', en: '6-Month Plan' }, mad: 340, eur: 36, usd: 39 },
  { id: '12m', name: { fr: 'Formule Annuelle (1 An)', ar: 'الباقة السنوية (الأفضل)', en: '12-Month Plan' }, mad: 450, eur: 48, usd: 52, featured: true },
  { id: '12m-multi', name: { fr: 'VIP Multi-Écrans (2 Appareils)', ar: 'VIP لشاشتين (سنة)', en: 'VIP Multi-Screen (2 Devices)' }, mad: 750, eur: 79, usd: 85 }
];

let currentLang = localStorage.getItem('electro_aziz_lang') || 'fr';
let currentCurrency = 'MAD';
let isMuted = false;

// Audio Chime using Web Audio API
function playChime() {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch(e) {}
}

// Activity Status based on Local Time
function updateActivityStatus() {
  const hour = new Date().getHours();
  const isActive = hour >= 9 && hour < 24;
  const dots = document.querySelectorAll('.pulse-dot');
  const label = document.getElementById('activity-status-text');
  
  dots.forEach(dot => {
    if (isActive) {
      dot.classList.remove('orange');
    } else {
      dot.classList.add('orange');
    }
  });

  if (label) {
    if (isActive) {
      label.textContent = currentLang === 'ar' ? 'عزيز متصل الآن (رد فوري)' : (currentLang === 'en' ? 'Aziz is online (Instant reply)' : 'Aziz disponible en direct');
    } else {
      label.textContent = currentLang === 'ar' ? 'عزيز في فترة راحة ليلية' : (currentLang === 'en' ? 'Aziz is on night standby' : 'Aziz en veille de nuit');
    }
  }
}

// Format MAC Address
function setupMacFormatter() {
  const macInput = document.getElementById('ibo-mac-input');
  if (!macInput) return;
  
  macInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    if (val.length > 12) val = val.slice(0, 12);
    const parts = val.match(/.{1,2}/g);
    e.target.value = parts ? parts.join(':') : val;
  });
}

// WhatsApp Link Generator
function openWhatsApp(msg) {
  playChime();
  const url = `https://wa.me/${WHATSAPP_NUMBER_CLEAN}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Copy to Clipboard with Toast
window.copyPhone = function(e) {
  if (e) e.stopPropagation();
  playChime();
  navigator.clipboard.writeText(WHATSAPP_PHONE).then(() => {
    showToast(currentLang === 'ar' ? 'تم نسخ الرقم بنجاح!' : 'Numéro copié !');
  }).catch(() => {
    showToast(WHATSAPP_PHONE);
  });
};

function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Language Switcher
window.changeLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem('electro_aziz_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  document.querySelectorAll('.btn-toggle[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  document.querySelectorAll('[data-i18n-fr]').forEach(el => {
    const text = el.getAttribute(`data-i18n-${lang}`);
    if (text) el.textContent = text;
  });

  updateActivityStatus();
  renderPricing();
};

// Currency Switcher
window.changeCurrency = function(curr) {
  currentCurrency = curr;
  document.querySelectorAll('.btn-toggle[data-curr]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-curr') === curr);
  });
  renderPricing();
};

// Render Pricing Table
function renderPricing() {
  const container = document.getElementById('pricing-cards-container');
  if (!container) return;
  
  const symbol = currentCurrency === 'MAD' ? (currentLang === 'ar' ? 'درهم' : 'DH') : (currentCurrency === 'EUR' ? '€' : '$');

  container.innerHTML = PLANS_DATA.map(p => {
    let price = currentCurrency === 'MAD' ? p.mad : (currentCurrency === 'EUR' ? p.eur : p.usd);
    return `
      <div class="pricing-card ${p.featured ? 'featured' : ''}">
        ${p.featured ? `<div class="card-badge">${currentLang === 'ar' ? 'العرض الأفضل' : 'Le Plus Choisi'}</div>` : ''}
        <h3 class="plan-name">${p.name[currentLang] || p.name.fr}</h3>
        <div class="price-box">
          <span class="price-amount">${price}</span>
          <span class="price-currency">${symbol}</span>
        </div>
        <ul class="features-list">
          <li><span class="check-icon">✓</span> +18 000 Chaînes 4K / FHD</li>
          <li><span class="check-icon">✓</span> +60 000 Films & Séries VOD</li>
          <li><span class="check-icon">✓</span> Anti-Freeze 99.9% Uptime</li>
          <li><span class="check-icon">✓</span> Activation WhatsApp &lt; 5 min</li>
        </ul>
        <button onclick="orderPlan('${p.name[currentLang]}', '${price} ${symbol}')" class="btn-primary" style="width:100%; justify-content:center;">
          ${currentLang === 'ar' ? 'اطلب الآن عبر واتساب' : 'Commander via WhatsApp'}
        </button>
      </div>
    `;
  }).join('');
}

window.orderPlan = function(name, price) {
  const msg = currentLang === 'ar' 
    ? `السلام عليكم عزيز، أود طلب اشتراك: ${name} (${price}). يرجى تزويدي بطريقة الدفع.`
    : `Bonjour Aziz, je souhaite commander la formule : ${name} (${price}). Merci de me donner les détails de paiement.`;
  openWhatsApp(msg);
};

// IBO Player Direct Activation
window.submitIboActivation = function(e) {
  e.preventDefault();
  const mac = document.getElementById('ibo-mac-input').value;
  const key = document.getElementById('ibo-key-input').value;
  const pack = document.getElementById('ibo-package-select').value;
  
  const msg = currentLang === 'ar'
    ? `السلام عليكم عزيز، أرغب في تفعيل تطبيق IBO Player:\n- الباقة: ${pack}\n- عنوان الماك MAC: ${mac || 'غير محدد'}\n- مفتاح الجهاز Key: ${key || 'غير محدد'}`
    : `Bonjour Aziz, je souhaite activer IBO Player :\n- Formule : ${pack}\n- Adresse MAC : ${mac || 'Non renseignée'}\n- Device Key : ${key || 'Non renseignée'}`;
  
  openWhatsApp(msg);
};

// 24H Trial Form
window.submitTrial = function(e) {
  e.preventDefault();
  const name = document.getElementById('trial-name').value;
  const device = document.getElementById('trial-device').value;
  const app = document.getElementById('trial-app').value;
  
  const msg = currentLang === 'ar'
    ? `طلب تجربة مجانية 24H:\n- الاسم: ${name}\n- الجهاز: ${device}\n- التطبيق: ${app}`
    : `Demande de test gratuit 24H :\n- Nom : ${name}\n- Appareil : ${device}\n- Application : ${app}`;
  
  openWhatsApp(msg);
};

// FAQ Accordion
window.toggleFaq = function(header) {
  const item = header.parentElement;
  item.classList.toggle('active');
};

// Speed Test Simulation
window.runSpeedTest = function() {
  const btn = document.getElementById('btn-speed-test');
  const speedEl = document.getElementById('speed-display');
  const pingEl = document.getElementById('ping-display');
  if (btn) btn.disabled = true;
  
  let count = 0;
  const intv = setInterval(() => {
    count++;
    if (speedEl) speedEl.textContent = Math.floor(Math.random() * 40 + 20);
    if (pingEl) pingEl.textContent = Math.floor(Math.random() * 15 + 10);
    if (count >= 10) {
      clearInterval(intv);
      if (btn) btn.disabled = false;
      showToast(currentLang === 'ar' ? 'اكتمل الفحص: سرعتك تدعم جودة 4K' : 'Test terminé : Votre ligne supporte la 4K !');
    }
  }, 150);
};

// Search Channels
window.filterChannels = function(e) {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.bouquet-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
};

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  setupMacFormatter();
  window.changeLanguage(currentLang);
  setInterval(updateActivityStatus, 60000);
});
