// ==========================================
// CONFIGURATION & GLOBALS
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweRv4ZQG0q8p88wLsSt2CntDBs0BFLRQUvmQfixuC2OM_RwqB-AWr2EEw1j7fR6aER/exec";
const IMGBB_API_KEY = "d6c99723d410aaeee4d5ac016fc0a3d3";
let PRIMARY_WA_NUMBER = "919297562362";

let currentUser = JSON.parse(localStorage.getItem("bpf_user")) || null;
let isAdmin = localStorage.getItem("bpf_admin") === "true";
let adminSecureToken = localStorage.getItem("bpf_admin_token") || null;

let selectedServiceIndexForZoom = 0;
let currentLang = localStorage.getItem("bpf_lang") || "en";
let top5Reviews = [];
let deferredInstallPrompt = null;
let configuredApkUrl = "";
let pendingCheckoutData = null;
let appliedCoupon = { code: "", discount: 0 };
let rescheduleTarget = { bookingId: "", localIdx: -1 };

function escQuote(str) {
  return String(str || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ==========================================
// DEFAULT SERVICES, PACKAGES & BRIDAL DATA
// ==========================================
const defaultServicesData = [
  { id: "Bridal Makeover", mrp: 6500, price: 4999, brand: "MAC & Kryolan", name: { en: "HD Bridal Makeover (MAC & Kryolan)", hi: "एचडी ब्राइडल मेकओवर (MAC & Kryolan)" }, duration: { en: "3-4 Hours", hi: "3-4 घंटे" }, desc: { en: "Dedicated bridal makeup, hair styling, and saree/lehenga draping with 16-hour smudge-proof finish.", hi: "दुल्हन के खास दिन के लिए समर्पित ब्राइडल मेकअप और हेयर स्टाइलिंग।" }, benefits: { en: ["CTM Skin Prep & Primer", "Waterproof HD / Airbrush Base", "Custom Eye Glitter & Mink Lashes", "Royal Hair Styling & Draping"], hi: ["सीटीएम स्किन प्रेप और प्राइमर", "वाटरप्रूफ एचडी बेस", "कस्टम आई मेकअप और लैशेज", "रॉयल हेयर स्टाइलिंग और ड्रेपिंग"] }, img: "assets/service1.jpg" },
  { id: "Advanced Facial", mrp: 1200, price: 799, brand: "O3+ & Lotus", name: { en: "Advanced Glowing Facial (O3+ & Lotus)", hi: "एडवांस ग्लोइंग फेशियल (O3+ & Lotus)" }, duration: { en: "60 Mins", hi: "60 मिनट" }, desc: { en: "6-step deep pore cleansing, botanical scrub, herbal steam, lymphatic massage and vitamin-C gold mask.", hi: "6-स्टेप डीप क्लींजिंग, हर्बल स्टीम और विटामिन-सी गोल्ड मास्क फेशियल।" }, benefits: { en: ["Deep Pore Cleansing Milk", "Botanical Exfoliation Scrub", "Warm Herbal Steam & Extraction", "Vitamin-C Gold Radiance Mask"], hi: ["डीप पोर क्लींजिंग", "स्क्रब और ब्लैकहेड रिमूवल", "आरामदायक फेस मसाज", "विटामिन-C गोल्ड मास्क"] }, img: "assets/service2.jpg" },
  { id: "Hair Spa", mrp: 999, price: 699, brand: "L'Oreal Professionnel", name: { en: "L'Oreal Deep Nourishment Hair Spa", hi: "लोरियल डीप नरिशमेंट हेयर स्पा" }, duration: { en: "45 Mins", hi: "45 मिनट" }, desc: { en: "Scalp massage, L'Oreal spa cream application, ozone steam therapy and blow-dry finish.", hi: "स्कैल्प मसाज, लोरियल स्पा क्रीम और ओजोन स्टीम थेरेपी हेयर केयर।" }, benefits: { en: ["Scalp Analysis & Oil Massage", "L'Oreal Spa Cream Root-to-Tip", "Intensive Ozone Steam Therapy", "Silky Blow-Dry Finish"], hi: ["स्कैल्प मसाज और वॉश", "लोरियल स्पा क्रीम ट्रीटमेंट", "ओजोन स्टीम थेरेपी", "सिल्की ब्लो-ड्राई फिनिश"] }, img: "assets/service3.jpg" },
  { id: "Party Makeup", mrp: 2000, price: 1499, brand: "Huda Beauty", name: { en: "Party & Reception Makeup (Huda Beauty)", hi: "पार्टी और रिसेप्शन मेकअप (Huda Beauty)" }, duration: { en: "90 Mins", hi: "90 मिनट" }, desc: { en: "Flawless liquid foundation, custom eye shadow matching your outfit and hairstyling.", hi: "पार्टियों और खास मौकों के लिए फ्लॉलेस मेकअप और हेयर स्टाइलिंग।" }, benefits: { en: ["Instant Glow Skin Prep", "Flawless HD Foundation Base", "Outfit-Matched Eye Styling", "Blow-Dry Curls or Bun Styling"], hi: ["इंस्टेंट ग्लो प्राइमर", "फ्लॉलेस फाउंडेशन बेस", "आकर्षक आई मेकअप", "हेयर स्टाइलिंग शामिल"] }, img: "assets/service4.jpg" },
  { id: "Mani Pedi", mrp: 800, price: 549, brand: "OPI & Aroma Magic", name: { en: "Spa Manicure & Pedicure (OPI)", hi: "स्पा मैनिक्योर और पेडिक्योर (OPI)" }, duration: { en: "60 Mins", hi: "60 मिनट" }, desc: { en: "Warm sea-salt soak, cuticle care, dead skin scrub, cooling mask and OPI nail paint.", hi: "हाथ, पैर और नाखूनों की कंप्लीट स्पा क्लीनिंग और नेल पॉलिश।" }, benefits: { en: ["Warm Sea-Salt Soak", "Cuticle Care & Nail Shaping", "Tan Removal Exfoliating Scrub", "OPI Nail Paint Application"], hi: ["सी-सॉल्ट डिप सोक", "क्यूटिकल केयर और नेल शेपिंग", "टैन रिमूवल स्क्रब", "नेल पेंट फिनिश"] }, img: "assets/service5.jpg" },
  { id: "Threading Waxing", mrp: 450, price: 299, brand: "Rica & Aloe Vera", name: { en: "Painless Rica Waxing & Threading", hi: "दर्द रहित रिका वैक्सिंग और थ्रेडिंग" }, duration: { en: "30 Mins", hi: "30 मिनट" }, desc: { en: "Pre-wax protection, gentle Rica/chocolate peel-off wax and soothing aloe vera massage.", hi: "प्री-वैक्स केयर, रिका वैक्सिंग और एलोवेरा सूदिंग जेल मसाज।" }, benefits: { en: ["Pre-Wax Skin Protection", "Gentle Rica / Chocolate Wax", "Virtually Painless Removal", "Soothing Aloe Vera Gel Massage"], hi: ["प्री-वैक्स पाउडर प्रोटेक्शन", "रिका और चॉकलेट वैक्स", "दर्द रहित तकनीक", "एलोवेरा जेल मसाज"] }, img: "assets/service6.jpg" },
  { id: "Essential Festive Combo", mrp: 2200, price: 1499, brand: "O3+ & Huda", name: { en: "🌸 Essential Festive Glow Combo", hi: "🌸 फेस्टिव ग्लो कॉम्बो पैकेज" }, duration: { en: "2 Hours", hi: "2 घंटे" }, desc: { en: "Includes O3+ Botanical Facial, Party Hair Styling, Threading & Express De-Tan Clean-up.", hi: "O3+ फेशियल, पार्टी हेयर स्टाइलिंग, थ्रेडिंग और डी-टैन क्लीनअप कॉम्बो।" }, benefits: { en: ["Advanced O3+ Botanical Facial", "Party Hair Styling (Curls/Sleek)", "Threading & Upper-Lip Shaping", "Express Face De-Tan Clean-up"], hi: ["O3+ फेशियल", "पार्टी हेयर स्टाइलिंग", "थ्रेडिंग और अपर-लिप", "फेस डी-टैन क्लीनअप"] }, img: "assets/service4.jpg" },
  { id: "Royal Pre-Bridal Package", mrp: 5800, price: 3999, brand: "O3+, Rica & L'Oreal", name: { en: "👑 Royal Pre-Bridal Glow Package", hi: "👑 रॉयल प्री-ब्राइडल ग्लो कॉम्बो पैकेज" }, duration: { en: "3.5 Hours", hi: "3.5 घंटे" }, desc: { en: "Includes O3+ Diamond Facial, Full Body Rica Waxing, L'Oreal Hair Spa, Spa Mani-Pedi & Full Face De-Tan.", hi: "O3+ डायमंड फेशियल, फुल बॉडी रिका वैक्सिंग, लोरियल हेयर स्पा, मैनी-पेडी और डी-टैन कॉम्बो।" }, benefits: { en: ["O3+ Diamond / Whitening Facial", "Full Body Painless Rica Waxing", "L'Oreal Deep Nourishment Hair Spa", "Luxury OPI Spa Manicure & Pedicure", "Full Face De-Tan & Herbal Bleach"], hi: ["O3+ डायमंड फेशियल", "फुल बॉडी रिका वैक्सिंग", "लोरियल हेयर स्पा", "लक्ज़री मैनिक्योर और पेडिक्योर", "फुल फेस डी-टैन और ब्लीच"] }, img: "assets/service1.jpg" },
  { id: "Ultimate Wedding Day Glam", mrp: 9500, price: 6999, brand: "MAC & Kryolan Pro", name: { en: "✨ Ultimate Wedding Day Glam Combo", hi: "✨ अल्टीमेट वेडिंग डे ग्लैम कॉम्बो" }, duration: { en: "4.5 Hours", hi: "4.5 घंटे" }, desc: { en: "HD/Airbrush Bridal Makeover + Royal Hairstyle + Double Dupatta Draping + Mink Eyelashes & Touch-up Kit.", hi: "एचडी/एयरब्रश ब्राइडल मेकओवर + रॉयल हेयरस्टाइल + डबल दुपट्टा ड्रेपिंग + आईलैशेज किट।" }, benefits: { en: ["HD / Airbrush Bridal Makeover (MAC & Kryolan)", "Royal Bridal Hairstyle & Floral Setting", "Saree & Double Dupatta Lehenga Draping", "Complimentary Mink Eyelashes & Lens Fitting", "Free Nail Paint & Bridal Touch-up Kit"], hi: ["एचडी/एयरब्रश ब्राइडल मेकअप", "रॉयल ब्राइडल हेयरस्टाइल", "साड़ी और डबल दुपट्टा ड्रेपिंग", "प्रीमियम आईलैशेज और लेंस फिटिंग", "फ्री नेल पेंट और टच-अप किट"] }, img: "assets/service1.jpg" }
];

const bridalStyles = [
  { num: 1, title: "1. Traditional Bridal Makeup", desc: "Classic Indian bridal look with bold eyes, red lipstick and traditional styling.", price: 4999, img: "bridal/bridal1.jpg" },
  { num: 2, title: "2. HD Bridal Makeup", desc: "Smooth, flawless finish designed to look beautiful in high-definition photography.", price: 5499, img: "bridal/bridal2.jpg" },
  { num: 3, title: "3. Airbrush Bridal Makeup", desc: "Lightweight, fine-mist foundation for an even and long-lasting finish.", price: 6499, img: "bridal/bridal3.jpg" },
  { num: 4, title: "4. Natural Bridal Makeup", desc: "Soft, fresh and minimal makeup.", price: 3999, img: "bridal/bridal4.jpg" },
  { num: 5, title: "5. Dewy Bridal Makeup", desc: "Glowing, hydrated and radiant skin finish.", price: 4999, img: "bridal/bridal5.jpg" },
  { num: 6, title: "6. Matte Bridal Makeup", desc: "Shine-free, velvety and elegant finish.", price: 4999, img: "bridal/bridal6.jpg" },
  { num: 7, title: "7. Glamorous Bridal Makeup", desc: "Dramatic eyes, contouring and glamorous finish.", price: 5499, img: "bridal/bridal7.jpg" },
  { num: 8, title: "8. Celebrity Bridal Makeup", desc: "Modern, luxurious and celebrity-inspired styling.", price: 5999, img: "bridal/bridal8.jpg" },
  { num: 9, title: "9. Minimal Bridal Makeup", desc: "Very light makeup with subtle enhancement.", price: 3999, img: "bridal/bridal9.jpg" },
  { num: 10, title: "10. Soft Glam Bridal Makeup", desc: "Balanced look with soft eyes and glowing skin.", price: 4999, img: "bridal/bridal10.jpg" },
  { num: 11, title: "11. Bengali Bridal Makeup", desc: "Traditional red-white styling with distinctive bridal decoration.", price: 5499, img: "bridal/bridal11.jpg" },
  { num: 12, title: "12. South Indian Bridal Makeup", desc: "Gold-toned eyes, traditional elegance and defined features.", price: 5499, img: "bridal/bridal12.jpg" },
  { num: 13, title: "13. Nikah Bridal Makeup", desc: "Elegant eyes, soft complexion and sophisticated styling.", price: 4999, img: "bridal/bridal13.jpg" },
  { num: 14, title: "14. Pastel Bridal Makeup", desc: "Pink, peach and pastel shades for a soft romantic look.", price: 4999, img: "bridal/bridal14.jpg" },
  { num: 15, title: "15. Smokey Eye Bridal Makeup", desc: "Dark, blended eye makeup with a dramatic finish.", price: 5499, img: "bridal/bridal15.jpg" }
];

let servicesData = JSON.parse(localStorage.getItem("bpf_pricelist_v1")) || JSON.parse(JSON.stringify(defaultServicesData));
let cart = JSON.parse(localStorage.getItem("bpf_cart_v1")) || [];
let myLocalOrders = JSON.parse(localStorage.getItem("bpf_my_orders_v1")) || [];
let savedSocialSettings = JSON.parse(localStorage.getItem("bpf_social_v1")) || {};

const translations = {
  en: {
    navHome: "Home", navGallery: "Gallery", navContact: "Contact", contactUs: "Contact Us", contactText: "Visit or contact us for your beauty service and appointment.", address: "Address", phone: "Phone", serviceType: "Service", serviceTypeText: "Ladies Beauty Parlour",
    navTitle: "Beauty Plus Forever", tagline: "A special ladies beauty parlour", navServices: "Price List", navBook: "Book & Track", navReviews: "Reviews", navLogin: "Login", navLogout: "Logout",
    heroBadge: "WELCOME TO", heroTitle: "Beauty Plus Forever", heroSub: "A special ladies beauty parlour",
    btnViewServices: "✨ Price List & Cart", btnCall: "📞 Call Now", btnWhatsApp: "💬 WhatsApp",
    secServicesTitle: "Our Premium Services & Price List", secServicesSub: "Add multiple services to your cart, check live total amount, and proceed to instant QR booking.",
    secGalleryTitle: "Our Parlour Gallery", secBookTitle: "Cart Checkout, Book & Track", secBookSub: "Review your selected services, apply festive coupons, scan QR to pay, download your PDF receipt, or reschedule existing bookings.",
    trackTitle: "Track, Reschedule, Download PDF or Cancel Booking", trackPlaceholder: "Enter Booking ID (e.g., BPF...)", trackBtn: "Track Status",
    formNewBooking: "Customer & Appointment Details", labelName: "Your Name", labelEmail: "Email Address", labelGender: "Gender", optFemale: "Female", optMale: "Male", optOther: "Other", labelPhone: "Mobile Number", labelDate: "Appointment Date", labelTime: "Appointment Time",
    zoomBenefitsTitle: "Key Benefits", btnBookZoom: "⚡ Book & Pay Now",
    secReviewTitle: "Customer Experiences", secReviewSub: "Recent feedback from our lovely clients.", formReviewTitle: "Share Your Experience", labelFeedback: "Your Feedback", labelPhoto: "Upload Service Photo", btnPostReview: "Post Review",
    tabLogin: "Login", tabSignup: "Sign Up", labelUsername: "Username or Login ID", labelPassword: "Password", btnSignIn: "Sign In", labelFullName: "Full Name", labelAge: "Age", labelAddress: "Address", labelChooseUser: "Choose Username", labelChoosePass: "Choose Password", btnCreateAcc: "Create Account"
  },
  hi: {
    navHome: "होम", navGallery: "गैलरी", navContact: "संपर्क", contactUs: "संपर्क करें", contactText: "ब्यूटी सेवा और अपॉइंटमेंट के लिए हमसे संपर्क करें।", address: "पता", phone: "फोन", serviceType: "सेवा", serviceTypeText: "लेडीज़ ब्यूटी पार्लर",
    navTitle: "ब्यूटी प्लस फॉरएवर", tagline: "एक विशेष लेडीज ब्यूटी पार्लर", navServices: "रेट लिस्ट", navBook: "बुक और ट्रैक", navReviews: "समीक्षा", navLogin: "लॉगिन", navLogout: "लॉग आउट",
    heroBadge: "आपका स्वागत है", heroTitle: "ब्यूटी प्लस फॉरएवर", heroSub: "एक विशेष लेडीज ब्यूटी पार्लर",
    btnViewServices: "✨ सेवाएं और रेट लिस्ट", btnCall: "📞 कॉल करें", btnWhatsApp: "💬 वॉट्सऐप",
    secServicesTitle: "हमारी प्रीमियम सेवाएं और प्राइस लिस्ट", secServicesSub: "अपनी पसंद की सेवाएं कार्ट में जोड़ें, कुल राशि देखें और QR कोड से पेमेंट कर तुरंत बुक करें।",
    secGalleryTitle: "हमारी गैलरी", secBookTitle: "कार्ट चेकआउट, बुक और ट्रैक करें", secBookSub: "चुनी गई सेवाएं देखें, कूपन कोड लगाएं, QR से पेमेंट करें, PDF रसीद डाउनलोड करें या री-शेड्यूल करें।",
    trackTitle: "बुकिंग ट्रैक, री-शेड्यूल, PDF डाउनलोड या कैंसिल करें", trackPlaceholder: "बुकिंग आईडी दर्ज करें (जैसे, BPF...)", trackBtn: "स्टेटस चेक करें",
    formNewBooking: "ग्राहक और अपॉइंटमेंट विवरण", labelName: "आपका नाम", labelEmail: "ईमेल एड्रेस", labelGender: "लिंग", optFemale: "महिला", optMale: "पुरुष", optOther: "अन्य", labelPhone: "मोबाइल नंबर", labelDate: "तारीख", labelTime: "समय",
    zoomBenefitsTitle: "प्रमुख लाभ", btnBookZoom: "⚡ अभी बुक और पे करें",
    secReviewTitle: "ग्राहक के अनुभव", secReviewSub: "हमारे प्यारे ग्राहकों की हालिया प्रतिक्रिया।", formReviewTitle: "अपना अनुभव साझा करें", labelFeedback: "आपकी प्रतिक्रिया", labelPhoto: "सेवा की फोटो अपलोड करें", btnPostReview: "समीक्षा पोस्ट करें",
    tabLogin: "लॉगिन", tabSignup: "साइन अप", labelUsername: "यूजरनेम या लॉगिन आईडी", labelPassword: "पासवर्ड", btnSignIn: "साइन इन करें", labelFullName: "पूरा नाम", labelAge: "उम्र", labelAddress: "पता", labelChooseUser: "यूजरनेम चुनें", labelChoosePass: "पासवर्ड चुनें", btnCreateAcc: "अकाउंट बनाएं"
  }
};

// ==========================================
// QUIZ ADVISOR & QR FALLBACK
// ==========================================
const quizRecommendations = [
  { brand: "O3+ & LOTUS PROFESSIONAL", serviceId: "Advanced Facial", title: "Advanced Glowing Facial", desc: "6-step deep pore cleansing, herbal steam & vitamin-C gold mask for instant tan removal and glow." },
  { brand: "MAC & KRYOLAN CERTIFIED", serviceId: "Bridal Makeover", title: "HD Bridal Makeover Package", desc: "16-hour waterproof HD base, custom eye glitter, mink lashes, royal hair styling & draping." },
  { brand: "L'OREAL PROFESSIONNEL", serviceId: "Hair Spa", title: "Deep Nourishment Hair Spa", desc: "Scalp analysis, L'Oreal spa cream root-to-tip & intensive ozone steam therapy for silky hair." },
  { brand: "HUDA BEAUTY & O3+", serviceId: "Party Makeup", title: "Party & Reception Makeup", desc: "Camera-ready flawless base, trendy eye makeup & blow-dry curls or bun styling." }
];

function selectQuizOption(idx, btnEl) {
  document.querySelectorAll(".quiz-chip").forEach(el => el.classList.remove("selected"));
  if(btnEl) btnEl.classList.add("selected");
  const rec = quizRecommendations[idx];
  if(!rec) return;
  const matchedSvc = servicesData.find(s => s.id === rec.serviceId) || servicesData[idx] || servicesData[0];
  const priceTxt = matchedSvc ? ` (₹${matchedSvc.price})` : "";

  document.getElementById("quizRecBrand").textContent = "✨ TRUSTED BRAND: " + rec.brand;
  document.getElementById("quizRecTitle").textContent = rec.title + priceTxt;
  document.getElementById("quizRecDesc").textContent = rec.desc;
  const addBtn = document.getElementById("quizAddBtn");
  if(addBtn) {
    addBtn.onclick = function() {
      addServiceByIdToCart(matchedSvc.id, matchedSvc.name.en, matchedSvc.price, matchedSvc.mrp, true);
    };
  }
  const card = document.getElementById("quizResultCard");
  if(card) card.style.display = "flex";
}

const paymentQrPaths = ["assets/paymentqr.jpg", "assets/paymentqr.png", "assets/paymentqr.jpeg", "assets/paymentqr.webp", "assets/paymentqr"];
let qrPathAttemptIndex = 0;
function handlePaymentQrFallback(imgEl) {
  qrPathAttemptIndex++;
  if (qrPathAttemptIndex < paymentQrPaths.length) imgEl.src = paymentQrPaths[qrPathAttemptIndex];
}

// ==========================================
// PWA INSTALL & TAB ROUTING
// ==========================================
(function setupPWA() {
  try {
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8d3d68"/><stop offset="100%" stop-color="#b85b87"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(#g)"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-size="280" fill="#ffffff" font-family="sans-serif">✦</text></svg>`;
    const iconUrl = "data:image/svg+xml;utf8," + encodeURIComponent(iconSvg);
    const manifestObj = {
      name: "Beauty Plus Forever", short_name: "BeautyPlus", description: "A Special Ladies Beauty Parlour in Raxaul",
      start_url: window.location.href.split('#')[0], display: "standalone", background_color: "#fffafb", theme_color: "#8d3d68",
      icons: [{ src: iconUrl, sizes: "192x192", type: "image/svg+xml" }, { src: iconUrl, sizes: "512x512", type: "image/svg+xml" }]
    };
    const manifestBlob = new Blob([JSON.stringify(manifestObj)], { type: "application/json" });
    const manifestLink = document.getElementById("pwaManifestLink");
    if (manifestLink) manifestLink.href = URL.createObjectURL(manifestBlob);
  } catch (err) {}
})();

window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstallPrompt = e; });

function installApp() {
  if (deferredInstallPrompt) { deferredInstallPrompt.prompt(); deferredInstallPrompt.userChoice.then(() => { deferredInstallPrompt = null; }); return; }
  if (configuredApkUrl && configuredApkUrl.trim() !== "") { window.open(configuredApkUrl, "_blank"); return; }
  alert(currentLang === "hi" ? "होम स्क्रीन पर ऐप जोड़ने के लिए: ब्राउज़र मेनू (⋮) से 'Install App' या 'Add to Home screen' चुनें।" : "To install: Tap browser (⋮) menu and select 'Install App' or 'Add to Home screen'.");
}

function switchTab(tabId) {
  const targetSection = document.getElementById(tabId);
  if(!targetSection) {
    window.location.href = "index.html#" + tabId;
    return;
  }
  document.querySelectorAll('.main-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
  document.querySelectorAll('.mob-nav-item').forEach(item => item.classList.remove('active'));

  targetSection.classList.add('active');
  const activeLink = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
  if(activeLink) activeLink.classList.add('active');
  const mobItem = document.getElementById("mobNav_" + tabId);
  if(mobItem) mobItem.classList.add('active');
  window.scrollTo(0, 0);
}

function handleCrossPageHashRouting() {
  const hash = window.location.hash.replace("#", "").trim();
  if (['booking', 'services', 'reviews', 'contact', 'gallerySection', 'homeSection'].includes(hash)) {
    if(document.getElementById(hash)) switchTab(hash);
  }
}
window.addEventListener("hashchange", handleCrossPageHashRouting);

// ==========================================
// SERVER SYNC & GLOBAL SETTINGS
// ==========================================
function apiCall(payload) {
  const formBody = Object.keys(payload).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])).join('&');
  return fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formBody }).then(r => r.json());
}

function fetchGlobalData() {
  apiCall({ action: "init_data" }).then(d => {
    if(d.status === "success") {
      top5Reviews = d.reviews || [];
      renderReviews();
      applySettings(d.settings || {});
    }
    const loader = document.getElementById("syncLoader");
    if(loader) loader.style.display = "none";
  }).catch(() => {
    applySettings(savedSocialSettings);
    const loader = document.getElementById("syncLoader");
    if(loader) loader.style.display = "none";
  });
}

function setInputValueIfPresent(id, val) {
  const el = document.getElementById(id);
  if(el) el.value = val || "";
}

function applySettings(settings) {
  if(!settings) return;
  savedSocialSettings = settings;
  localStorage.setItem("bpf_social_v1", JSON.stringify(settings));

  setInputValueIfPresent("set_greetingMsg", settings.greetingMsg);
  setInputValueIfPresent("set_noticeTitle", settings.noticeTitle);
  setInputValueIfPresent("set_noticeMsg", settings.noticeMsg);
  setInputValueIfPresent("set_noticeImg", settings.noticeImg);
  setInputValueIfPresent("set_apkLink", settings.apkLink);
  setInputValueIfPresent("set_ytLinks", settings.ytLinks);
  setInputValueIfPresent("set_instaLink", settings.instaLink);
  setInputValueIfPresent("set_fbLink", settings.fbLink);
  setInputValueIfPresent("set_mapLink", settings.mapLink);
  setInputValueIfPresent("set_waNumber", settings.waNumber);

  if(settings.waNumber && settings.waNumber.trim() !== "") {
    PRIMARY_WA_NUMBER = settings.waNumber.trim().replace(/[^0-9]/g, "");
  }

  if(settings.priceListJson) {
    try {
      const parsedList = JSON.parse(settings.priceListJson);
      if(Array.isArray(parsedList) && parsedList.length > 0) {
        servicesData = parsedList;
        localStorage.setItem("bpf_pricelist_v1", JSON.stringify(servicesData));
        initServices();
        renderAdminPriceList();
        renderSubpageDynamicContent();
      }
    } catch(e) {}
  }

  configuredApkUrl = settings.apkLink || "";
  const apkBtn = document.getElementById("apkDownloadBtn");
  if(settings.apkLink && apkBtn) { apkBtn.href = settings.apkLink; apkBtn.style.display = "inline-flex"; }
  else if(apkBtn) { apkBtn.style.display = "none"; }

  renderVideoGallery(settings.ytLinks);
  renderGlobalGreetingBanner(settings.greetingMsg);
  renderDynamicSocialLinks(settings);

  const nModal = document.getElementById("noticeModal");
  if(!nModal) return;

  const hasImg = Boolean(settings.noticeImg && settings.noticeImg.trim() !== "");
  const hasText = Boolean((settings.noticeTitle && settings.noticeTitle.trim() !== "") || (settings.noticeMsg && settings.noticeMsg.trim() !== ""));
  const nCard = document.getElementById("noticeCardBox");
  const nTitle = document.getElementById("nTitle");
  const nMsg = document.getElementById("nMsg");
  const nImg = document.getElementById("nImg");
  const reopenBtn = document.getElementById("reopenOfferBtn");

  if(hasImg) {
    nCard.classList.remove("text-only-mode");
    nTitle.style.display = "none"; nMsg.style.display = "none";
    nImg.src = settings.noticeImg.trim(); nImg.style.display = "block";
    if(reopenBtn) reopenBtn.style.display = "inline-flex";
    if(window.location.hash !== "#booking" && !sessionStorage.getItem("bpf_offer_seen")) {
      nModal.classList.add("open");
      sessionStorage.setItem("bpf_offer_seen", "1");
    }
  } else if(hasText) {
    nCard.classList.add("text-only-mode");
    nImg.style.display = "none";
    nTitle.textContent = settings.noticeTitle || ""; nTitle.style.display = settings.noticeTitle ? "block" : "none";
    nMsg.textContent = settings.noticeMsg || ""; nMsg.style.display = settings.noticeMsg ? "block" : "none";
    if(reopenBtn) reopenBtn.style.display = "inline-flex";
    if(window.location.hash !== "#booking" && !sessionStorage.getItem("bpf_offer_seen")) {
      nModal.classList.add("open");
      sessionStorage.setItem("bpf_offer_seen", "1");
    }
  } else {
    if(reopenBtn) reopenBtn.style.display = "none";
    nModal.classList.remove("open");
  }
}

function renderGlobalGreetingBanner(customMsg) {
  const banner = document.getElementById("customerGreetingBanner");
  if(!banner || sessionStorage.getItem("bpf_greeting_closed") === "1") return;
  const defaultMsg = currentLang === "hi"
    ? "🌸 ब्यूटी प्लस फॉरएवर, रक्सौल में आपका स्वागत है! ✨ फेस्टिव ऑफर्स के लिए कूपन WELCOME10 का उपयोग करें।"
    : "🌸 Welcome to Beauty Plus Forever, Raxaul! ✨ Enjoy 10% OFF with promo code WELCOME10 on your booking.";
  const textToShow = (customMsg && customMsg.trim() !== "") ? customMsg.trim() : defaultMsg;
  banner.innerHTML = `<span>${textToShow}</span><button class="greeting-close" onclick="closeGreetingBanner()" title="Dismiss">×</button>`;
  banner.style.display = "flex";
}

function closeGreetingBanner() {
  const banner = document.getElementById("customerGreetingBanner");
  if(banner) banner.style.display = "none";
  sessionStorage.setItem("bpf_greeting_closed", "1");
}

function renderDynamicSocialLinks(settings) {
  const mapUrl = (settings && settings.mapLink && settings.mapLink.trim() !== "")
    ? settings.mapLink.trim()
    : "https://www.google.com/maps/search/?api=1&query=Beauty+Plus+Forever+Mahaveer+Chauk+Mai+Sthan+Road+Raxaul+Bihar+845305";
  const instaUrl = (settings && settings.instaLink && settings.instaLink.trim() !== "") ? settings.instaLink.trim() : "#";
  const fbUrl = (settings && settings.fbLink && settings.fbLink.trim() !== "") ? settings.fbLink.trim() : "#";
  const waNum = PRIMARY_WA_NUMBER || "919297562362";

  document.querySelectorAll(".dynamic-map-link").forEach(el => { el.href = mapUrl; });
  document.querySelectorAll(".dynamic-wa-link").forEach(el => { el.href = `https://api.whatsapp.com/send?phone=${waNum}&text=Hello%20Beauty%20Plus%20Forever!`; });

  const socialFooters = document.querySelectorAll(".dynamic-social-bar");
  socialFooters.forEach(box => {
    box.innerHTML = `
      <a href="https://api.whatsapp.com/send?phone=${waNum}&text=Hello%20Beauty%20Plus%20Forever!" target="_blank" class="social-pill">💬 WhatsApp</a>
      <a href="${mapUrl}" target="_blank" class="social-pill">📍 Google Map Directions</a>
      ${instaUrl !== "#" ? `<a href="${instaUrl}" target="_blank" class="social-pill">📸 Instagram</a>` : ``}
      ${fbUrl !== "#" ? `<a href="${fbUrl}" target="_blank" class="social-pill">👍 Facebook Page</a>` : ``}
    `;
  });
}

function openNoticePopup() { const m = document.getElementById("noticeModal"); if(m) m.classList.add("open"); }
function closeNotice() { const m = document.getElementById("noticeModal"); if(m) m.classList.remove("open"); }
function openHowToModal() { const m = document.getElementById("howToModal"); if(m) m.classList.add("open"); }
function closeHowToModal() { const m = document.getElementById("howToModal"); if(m) m.classList.remove("open"); }

// ==========================================
// MULTI-VIDEO YOUTUBE & REELS GALLERY
// ==========================================
function extractYouTubeId(url) {
  if(!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
}

function renderVideoGallery(ytLinksRaw) {
  const container = document.getElementById("videoGalleryContainer");
  if(!container) return;

  let entries = [];
  if(ytLinksRaw && ytLinksRaw.trim() !== "") {
    entries = ytLinksRaw.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    entries = [
      "HD Bridal Makeover Showcase | https://www.youtube.com/watch?v=ScMzIvxBSi4",
      "O3+ Glowing Facial & Spa Tour | https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    ];
  }

  const cardsHtml = entries.map((entry, idx) => {
    let title = `Beauty Plus Forever — Makeover Reel #${idx + 1}`;
    let rawUrl = entry;
    if(entry.includes("|")) {
      const parts = entry.split("|");
      title = parts[0].trim();
      rawUrl = parts[1].trim();
    }
    const videoId = extractYouTubeId(rawUrl);
    if(!videoId) return "";
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return `
      <div class="video-card" onclick="openVideoLightbox('${videoId}')">
        <div class="video-thumb" style="background-image:url('${thumbUrl}');">
          <div class="play-btn-overlay">▶</div>
        </div>
        <div class="video-info">
          <h4>${title}</h4>
          <span style="font-size:12px;color:var(--muted);">Tap to play inside app</span>
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  container.innerHTML = cardsHtml || `<p style="color:var(--muted);text-align:center;">Add YouTube or Shorts links in Admin Panel to display videos here.</p>`;
}

function openVideoLightbox(videoId) {
  const modal = document.getElementById("videoLightboxModal");
  const iframe = document.getElementById("lightboxIframe");
  if(!modal || !iframe) return;
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.classList.add("open");
}

function closeVideoLightbox() {
  const modal = document.getElementById("videoLightboxModal");
  const iframe = document.getElementById("lightboxIframe");
  if(iframe) iframe.src = "";
  if(modal) modal.classList.remove("open");
}

// ==========================================
// ADMIN DASHBOARD & PRICE LIST UPDATER
// ==========================================
function renderAdminPriceList() {
  const tbody = document.getElementById("adminPriceListTable");
  if(!tbody) return;
  tbody.innerHTML = servicesData.map((s, idx) => `
    <tr>
      <td><img src="${s.img}" style="width:50px;height:50px;object-fit:cover;border-radius:10px;" onerror="this.style.display='none'"></td>
      <td>
        <input type="text" value="${s.name.en}" onchange="updateSvcField(${idx}, 'nameEn', this.value)" style="width:145px;padding:6px;margin-bottom:4px;border:1px solid #ccc;border-radius:8px;"><br>
        <input type="text" value="${s.name.hi}" onchange="updateSvcField(${idx}, 'nameHi', this.value)" style="width:145px;padding:6px;border:1px solid #ccc;border-radius:8px;">
      </td>
      <td><input type="number" value="${s.mrp || s.price}" onchange="updateSvcField(${idx}, 'mrp', this.value)" style="width:80px;padding:6px;border:1px solid #ccc;border-radius:8px;"></td>
      <td><input type="number" value="${s.price}" onchange="updateSvcField(${idx}, 'price', this.value)" style="width:80px;padding:6px;border:2px solid var(--primary);border-radius:8px;font-weight:bold;"></td>
      <td><input type="text" value="${s.duration.en}" onchange="updateSvcField(${idx}, 'duration', this.value)" style="width:90px;padding:6px;border:1px solid #ccc;border-radius:8px;"></td>
      <td><input type="text" value="${s.img}" onchange="updateSvcField(${idx}, 'img', this.value)" style="width:125px;padding:6px;border:1px solid #ccc;border-radius:8px;"></td>
      <td><button class="btn danger sm" onclick="deleteServiceAdmin(${idx})">🗑️ Remove</button></td>
    </tr>
  `).join('');
}

function updateSvcField(idx, field, val) {
  if(!servicesData[idx]) return;
  if(field === 'nameEn') { servicesData[idx].name.en = val; servicesData[idx].id = val; }
  if(field === 'nameHi') servicesData[idx].name.hi = val;
  if(field === 'mrp') servicesData[idx].mrp = Number(val) || 0;
  if(field === 'price') servicesData[idx].price = Number(val) || 0;
  if(field === 'duration') { servicesData[idx].duration.en = val; servicesData[idx].duration.hi = val; }
  if(field === 'img') servicesData[idx].img = val.trim();
  localStorage.setItem("bpf_pricelist_v1", JSON.stringify(servicesData));
  initServices();
  renderSubpageDynamicContent();
}

function addNewServiceAdmin() {
  const nameEn = (document.getElementById("newSvcNameEn")?.value || "").trim();
  const nameHi = (document.getElementById("newSvcNameHi")?.value || "").trim() || nameEn;
  const mrp = Number(document.getElementById("newSvcMrp")?.value) || 0;
  const price = Number(document.getElementById("newSvcPrice")?.value) || mrp;
  const dur = (document.getElementById("newSvcDuration")?.value || "").trim() || "45 Mins";
  const img = (document.getElementById("newSvcImg")?.value || "").trim() || "assets/service1.jpg";
  const desc = (document.getElementById("newSvcDesc")?.value || "").trim() || "Premium beauty service";

  if(!nameEn || !price) { alert("Please enter Service Name and Offer Price (₹)."); return; }
  const benefitsArr = desc.split(",").map(x => x.trim()).filter(Boolean);
  servicesData.push({
    id: nameEn, mrp: mrp || price, price: price, brand: "Certified Pro",
    name: { en: nameEn, hi: nameHi }, duration: { en: dur, hi: dur },
    desc: { en: desc, hi: desc }, benefits: { en: benefitsArr.length ? benefitsArr : [desc], hi: benefitsArr.length ? benefitsArr : [desc] }, img: img
  });
  localStorage.setItem("bpf_pricelist_v1", JSON.stringify(servicesData));
  setInputValueIfPresent("newSvcNameEn", "");
  setInputValueIfPresent("newSvcNameHi", "");
  setInputValueIfPresent("newSvcMrp", "");
  setInputValueIfPresent("newSvcPrice", "");
  setInputValueIfPresent("newSvcDuration", "");
  setInputValueIfPresent("newSvcDesc", "");
  renderAdminPriceList();
  initServices();
  alert("New service added! Click 'Save & Publish Price List' to sync live.");
}

function deleteServiceAdmin(idx) {
  if(!confirm("Remove this service from Price List?")) return;
  servicesData.splice(idx, 1);
  localStorage.setItem("bpf_pricelist_v1", JSON.stringify(servicesData));
  renderAdminPriceList();
  initServices();
}

function resetDefaultPriceList() {
  if(!confirm("Reset Price List back to default services?")) return;
  servicesData = JSON.parse(JSON.stringify(defaultServicesData));
  localStorage.setItem("bpf_pricelist_v1", JSON.stringify(servicesData));
  renderAdminPriceList();
  initServices();
}

function savePriceListToServer() {
  localStorage.setItem("bpf_pricelist_v1", JSON.stringify(servicesData));
  initServices();
  saveAdminSettings();
}

function saveAdminSettings() {
  const payload = {
    action: "save_settings",
    token: adminSecureToken,
    greetingMsg: document.getElementById("set_greetingMsg")?.value || "",
    noticeTitle: document.getElementById("set_noticeTitle")?.value || "",
    noticeMsg: document.getElementById("set_noticeMsg")?.value || "",
    noticeImg: (document.getElementById("set_noticeImg")?.value || "").trim(),
    apkLink: (document.getElementById("set_apkLink")?.value || "").trim(),
    ytLinks: document.getElementById("set_ytLinks")?.value || "",
    instaLink: (document.getElementById("set_instaLink")?.value || "").trim(),
    fbLink: (document.getElementById("set_fbLink")?.value || "").trim(),
    mapLink: (document.getElementById("set_mapLink")?.value || "").trim(),
    waNumber: (document.getElementById("set_waNumber")?.value || "").trim(),
    priceListJson: JSON.stringify(servicesData)
  };
  applySettings(payload);
  apiCall(payload).then(d => {
    if(d.status === "success") { alert("✅ All Settings, Price List & Social Links Saved Live!"); fetchGlobalData(); }
    else { alert("Saved Locally! Server message: " + d.message); }
  }).catch(() => alert("✅ Saved Locally!"));
}

// ==========================================
// CART & COUPON SYSTEM (GLOBAL ACROSS PAGES)
// ==========================================
function getCartItemQty(serviceId) {
  const found = cart.find(item => item.id === serviceId);
  return found ? found.qty : 0;
}

function addToCart(serviceIndex) {
  const s = servicesData[serviceIndex];
  if(!s) return;
  addServiceByIdToCart(s.id, s.name.en, s.price, s.mrp, false, s.name.hi);
}

function addServiceByIdToCart(id, nameEn, price, mrp, redirectToBooking, nameHi) {
  const matched = servicesData.find(s => s.id === id);
  const finalPrice = matched ? Number(matched.price) : Number(price);
  const finalMrp = matched ? Number(matched.mrp || matched.price) : Number(mrp || price);
  const finalNameEn = matched ? matched.name.en : nameEn;
  const finalNameHi = matched ? matched.name.hi : (nameHi || nameEn);

  const existing = cart.find(item => item.id === id);
  if(existing) {
    existing.qty += 1;
    existing.price = finalPrice;
  } else {
    cart.push({ id: id, nameEn: finalNameEn, nameHi: finalNameHi, price: finalPrice, mrp: finalMrp, qty: 1 });
  }
  saveAndRefreshCart();
  if(redirectToBooking) {
    if(document.getElementById("booking")) switchTab("booking");
    else window.location.href = "index.html#booking";
  }
}

function changeCartQty(serviceId, delta) {
  const idx = cart.findIndex(item => item.id === serviceId);
  if(idx === -1) return;
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx, 1);
  saveAndRefreshCart();
}

function removeFromCart(serviceId) {
  cart = cart.filter(item => item.id !== serviceId);
  saveAndRefreshCart();
}

function clearCart() {
  if(!confirm(currentLang === 'hi' ? "क्या आप कार्ट खाली करना चाहते हैं?" : "Clear all selected services from cart?")) return;
  cart = [];
  appliedCoupon = { code: "", discount: 0 };
  saveAndRefreshCart();
}

function quickAddFromDropdown() {
  const sel = document.getElementById("quickAddServiceSelect");
  if(!sel || sel.value === "") return;
  const idx = Number(sel.value);
  if(!isNaN(idx) && servicesData[idx]) addToCart(idx);
}

function applyCouponCode() {
  const raw = (document.getElementById("couponInput")?.value || "").trim().toUpperCase();
  const msgEl = document.getElementById("couponStatusMsg");
  if(!msgEl) return;
  let subtotal = 0;
  cart.forEach(i => subtotal += i.price * i.qty);

  if(subtotal === 0) {
    msgEl.style.color = "#e74c3c";
    msgEl.textContent = "Please add services to cart first!";
    return;
  }
  if(raw === "WELCOME10") {
    const disc = Math.round(subtotal * 0.10);
    appliedCoupon = { code: "WELCOME10", discount: disc };
    msgEl.style.color = "#27ae60";
    msgEl.textContent = `✅ Coupon WELCOME10 applied! You saved ₹${disc}.`;
  } else if(raw === "BRIDAL500") {
    if(subtotal < 3000) {
      msgEl.style.color = "#e74c3c";
      msgEl.textContent = "BRIDAL500 requires a minimum cart total of ₹3,000.";
      return;
    }
    appliedCoupon = { code: "BRIDAL500", discount: 500 };
    msgEl.style.color = "#27ae60";
    msgEl.textContent = `✅ Coupon BRIDAL500 applied! Flat ₹500 OFF.`;
  } else {
    appliedCoupon = { code: "", discount: 0 };
    msgEl.style.color = "#e74c3c";
    msgEl.textContent = "Invalid Coupon. Try WELCOME10 (10% Off) or BRIDAL500 (₹500 Off on ₹3000+).";
  }
  saveAndRefreshCart();
}

function getCartTotals() {
  let count = 0, subtotal = 0;
  cart.forEach(item => { count += item.qty; subtotal += item.price * item.qty; });
  let discount = appliedCoupon.discount || 0;
  if(appliedCoupon.code === "WELCOME10") discount = Math.round(subtotal * 0.10);
  if(appliedCoupon.code === "BRIDAL500" && subtotal < 3000) discount = 0;
  if(discount > subtotal) discount = 0;
  const total = Math.max(0, subtotal - discount);
  return { count, subtotal, discount, total };
}

function setTextIfPresent(id, txt) {
  const el = document.getElementById(id);
  if(el) el.textContent = txt;
}

function saveAndRefreshCart() {
  localStorage.setItem("bpf_cart_v1", JSON.stringify(cart));
  const { count, total } = getCartTotals();

  setTextIfPresent("navCartCount", count);
  setTextIfPresent("mobCartBadge", count);
  setTextIfPresent("floatCartCount", count);
  setTextIfPresent("floatCartTotal", total);
  setTextIfPresent("checkoutGrandTotal", total);
  setTextIfPresent("btnPayAmount", total);
  setTextIfPresent("modalCartTotal", total);

  const floatBar = document.getElementById("floatingCartBar");
  if(floatBar) {
    if(count > 0) floatBar.classList.add("active");
    else floatBar.classList.remove("active");
  }
  const clearBtn = document.getElementById("clearCartBtn");
  if(clearBtn) clearBtn.style.display = count > 0 ? "inline-flex" : "none";

  initServices();
  renderCheckoutCart();
  renderModalCart();
}

function renderCheckoutCart() {
  const box = document.getElementById("checkoutCartList");
  if(!box) return;
  if(cart.length === 0) {
    box.innerHTML = `<p style="color:var(--muted);text-align:center;margin:12px 0;">${currentLang === 'hi' ? "आपका कार्ट खाली है। ऊपर ड्रॉपडाउन से अपनी पसंद की सर्विस चुनें।" : "Your cart is empty. Select a service or package above."}</p>`;
    return;
  }
  box.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div>
        <strong style="font-size:15.5px;color:var(--ink);">${currentLang === 'hi' ? item.nameHi : item.nameEn}</strong>
        <div style="font-size:13px;color:var(--muted);">₹${item.price} × ${item.qty} = <b style="color:var(--primary);">₹${item.price * item.qty}</b></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="qty-box">
          <button type="button" class="qty-btn" onclick="changeCartQty('${escQuote(item.id)}', -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="changeCartQty('${escQuote(item.id)}', 1)">+</button>
        </div>
        <button type="button" class="btn danger sm" onclick="removeFromCart('${escQuote(item.id)}')">✕</button>
      </div>
    </div>
  `).join('');
}

function renderModalCart() {
  const box = document.getElementById("modalCartItemsList");
  if(!box) return;
  if(cart.length === 0) {
    box.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px 0;">No services in cart yet.</p>`;
    return;
  }
  box.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div>
        <strong>${currentLang === 'hi' ? item.nameHi : item.nameEn}</strong>
        <div style="font-size:13px;color:var(--muted);">₹${item.price} each</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="qty-box">
          <button type="button" class="qty-btn" onclick="changeCartQty('${escQuote(item.id)}', -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="changeCartQty('${escQuote(item.id)}', 1)">+</button>
        </div>
        <strong style="min-width:55px;text-align:right;color:var(--primary);">₹${item.price * item.qty}</strong>
        <button type="button" class="btn danger sm" onclick="removeFromCart('${escQuote(item.id)}')">✕</button>
      </div>
    </div>
  `).join('');
}

function openCartModal() { renderModalCart(); const m = document.getElementById("cartModal"); if(m) m.classList.add("open"); }
function closeCartModal() { const m = document.getElementById("cartModal"); if(m) m.classList.remove("open"); }
function proceedToCheckoutFromCart() { closeCartModal(); switchTab('booking'); }

// ==========================================
// SERVICES & SUBPAGES RENDERERS (DYNAMIC PRICE SYNC)
// ==========================================
function initServices() {
  const grid = document.getElementById("serviceGrid");
  const quickSelect = document.getElementById("quickAddServiceSelect");
  if(quickSelect) {
    quickSelect.innerHTML = `<option value="">-- ${currentLang === 'hi' ? 'यहाँ से सर्विस या पैकेज चुनें' : 'Select a Service or Package to Add'} --</option>` +
      servicesData.map((s, i) => `<option value="${i}">${s.name[currentLang] || s.name.en} — ₹${s.price}</option>`).join('');
  }
  if(!grid) return;

  grid.innerHTML = servicesData.map((s, i) => {
    const qtyInCart = getCartItemQty(s.id);
    const hasDiscount = s.mrp && Number(s.mrp) > Number(s.price);
    const actionHtml = qtyInCart > 0
      ? `<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
           <div class="qty-box">
             <button type="button" class="qty-btn" onclick="event.stopPropagation(); changeCartQty('${escQuote(s.id)}', -1)">−</button>
             <span class="qty-val">${qtyInCart}</span>
             <button type="button" class="qty-btn" onclick="event.stopPropagation(); changeCartQty('${escQuote(s.id)}', 1)">+</button>
           </div>
           <button type="button" class="btn primary sm" onclick="event.stopPropagation(); switchTab('booking');">Go to Cart ➔</button>
         </div>`
      : `<button type="button" class="btn primary sm" style="flex:1;" onclick="event.stopPropagation(); addToCart(${i})">🛒 Add to Cart</button>
         <button type="button" class="btn secondary sm" onclick="event.stopPropagation(); openZoom(${i})">Details</button>`;

    return `
      <div class="service-tile">
        <div>
          <img src="${s.img}" class="service-img" onclick="openZoom(${i})" onerror="this.style.display='none'">
          <div class="service-info">
            <h3 onclick="openZoom(${i})">${s.name[currentLang] || s.name.en}</h3>
            <div class="s-meta">
              <span>⏱ ${s.duration[currentLang] || s.duration.en}</span>
              <div>${hasDiscount ? `<span class="price-mrp">₹${s.mrp}</span>` : ``}<span class="price-tag">₹${s.price}</span></div>
            </div>
            <p style="font-size:13.5px;color:var(--muted);margin:0;">${(s.benefits[currentLang] || s.benefits.en)[0]}...</p>
          </div>
        </div>
        <div class="tile-actions">${actionHtml}</div>
      </div>`;
  }).join('');
}

function renderSubpageDynamicContent() {
  // 1. Bridal Page Grid
  const bridalGrid = document.getElementById("bridalGrid");
  if(bridalGrid) {
    bridalGrid.innerHTML = bridalStyles.map((b, idx) => `
      <div class="bridal-card" onclick="openBridalLightbox(${idx})">
        <div class="bridal-img-wrap">
          <img src="${b.img}" alt="${b.title}" onerror="this.closest('.bridal-card').style.display='none'">
          <span class="zoom-hint">🔍 Tap for Uncut Zoom</span>
        </div>
        <div class="bridal-card-body">
          <h3 class="bridal-card-title">${b.title}</h3>
          <p style="font-size:14px;color:var(--muted);margin:0 0 12px;flex:1;">${b.desc}</p>
          <button type="button" class="btn primary sm" style="width:100%;" onclick="event.stopPropagation(); bookBridalStyle(${idx})">
            🛒 Book This Look (₹${b.price})
          </button>
        </div>
      </div>
    `).join('');
  }

  // 2. Dynamic Price Sync for data-svc-id cards on services-detail, packages, before-after
  document.querySelectorAll("[data-svc-id]").forEach(card => {
    const svcId = card.getAttribute("data-svc-id");
    const matched = servicesData.find(s => s.id === svcId);
    if(matched) {
      const priceEl = card.querySelector(".dyn-price");
      const mrpEl = card.querySelector(".dyn-mrp");
      if(priceEl) priceEl.textContent = "₹" + matched.price;
      if(mrpEl) mrpEl.textContent = "₹" + (matched.mrp || matched.price);
    }
  });
}

function openBridalLightbox(idx) {
  const b = bridalStyles[idx];
  if(!b) return;
  document.getElementById("lightboxImg").src = b.img;
  document.getElementById("lightboxTitle").textContent = b.title;
  document.getElementById("lightboxDesc").textContent = b.desc;
  const btn = document.getElementById("lightboxBookBtn");
  if(btn) btn.onclick = function() { bookBridalStyle(idx); };
  document.getElementById("lightboxModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeBridalLightbox() {
  const m = document.getElementById("lightboxModal");
  if(m) m.classList.remove("open");
  document.body.style.overflow = "auto";
}

function bookBridalStyle(idx) {
  const b = bridalStyles[idx];
  if(!b) return;
  const cleanName = b.title.replace(/^\d+\.\s*/, "");
  addServiceByIdToCart(cleanName, cleanName, b.price, b.price + 1500, true, cleanName);
}

function openZoom(i) {
  const s = servicesData[i];
  if(!s) return;
  selectedServiceIndexForZoom = i;
  const zImg = document.getElementById("zImg");
  if(zImg) { zImg.style.display = "block"; zImg.src = s.img; }
  setTextIfPresent("zTitle", s.name[currentLang] || s.name.en);
  const pb = document.getElementById("zPriceBadge");
  if(pb) pb.innerHTML = (s.mrp && s.mrp > s.price ? `<span class="price-mrp">₹${s.mrp}</span>` : "") + `₹${s.price}`;
  setTextIfPresent("zDuration", s.duration[currentLang] || s.duration.en);
  setTextIfPresent("zDesc", s.desc[currentLang] || s.desc.en);
  const ben = document.getElementById("zBenefits");
  if(ben) ben.innerHTML = (s.benefits[currentLang] || s.benefits.en).map(b => `<li>${b}</li>`).join('');
  document.getElementById("zoomModal")?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeZoom() { document.getElementById("zoomModal")?.classList.remove("open"); document.body.style.overflow = "auto"; }
function addZoomServiceToCart(goToCheckout) { addToCart(selectedServiceIndexForZoom); closeZoom(); if(goToCheckout) switchTab('booking'); }

// ==========================================
// BOOKING CHECKOUT, QR PAYMENT, PDF & WHATSAPP SHARE
// ==========================================
const bookingFormEl = document.getElementById("bookingForm");
if(bookingFormEl) {
  bookingFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const botTrap = document.getElementById("botCheckField")?.value || "";
    if(botTrap !== "") { alert("Spam blocked."); return; }

    if(cart.length === 0) {
      alert(currentLang === 'hi' ? "कृपया पहले कम से कम एक सर्विस कार्ट में जोड़ें!" : "Please add at least one service to your cart before booking!");
      return;
    }

    const name = document.getElementById("bName").value.trim();
    const email = document.getElementById("bEmail").value.trim();
    const gender = document.getElementById("bGender").value;
    const countryCode = document.getElementById("bCountryCode")?.value || "+91";
    const phoneRaw = document.getElementById("bPhone").value.trim();
    const date = document.getElementById("bDate").value;
    const time = document.getElementById("bTime").value;
    const locationType = document.getElementById("bLocationType")?.value || "At Parlour (Raxaul Branch)";
    const notes = document.getElementById("bNotes")?.value.trim() || "";

    if(phoneRaw.length < 7 || /^(.)\1{7,}$/.test(phoneRaw)) {
      alert(currentLang === 'hi' ? "कृपया सही मोबाइल नंबर दर्ज करें।" : "Please enter a valid mobile number.");
      return;
    }

    const { subtotal, discount, total } = getCartTotals();
    pendingCheckoutData = {
      name, email, gender, phone: `${countryCode} ${phoneRaw}`, date, time, locationType, notes,
      items: JSON.parse(JSON.stringify(cart)),
      subtotalAmount: subtotal, discountAmount: discount, couponCode: appliedCoupon.code || "", totalAmount: total
    };

    setTextIfPresent("qrPayableAmount", total);
    qrPathAttemptIndex = 0;
    const qrImg = document.getElementById("paymentQrImg");
    if(qrImg) qrImg.src = paymentQrPaths[0];
    document.getElementById("paymentQrModal")?.classList.add("open");
  });
}

function toggleUtrField(val) {
  const box = document.getElementById("utrFieldBox");
  if(box) box.style.display = val === "Paid via QR Code" ? "flex" : "none";
}
function closePaymentModal() { document.getElementById("paymentQrModal")?.classList.remove("open"); }

function generateOrderID() {
  const d = new Date(); const pad = (n) => n.toString().padStart(2, '0');
  return `BPF${pad(d.getDate())}${pad(d.getMonth()+1)}${d.getFullYear()}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function finalizeBookingAndDownloadPdf() {
  if(!pendingCheckoutData) return;
  const payMode = document.getElementById("payModeSelect").value;
  const utr = document.getElementById("payUtrInput").value.trim();

  if(payMode === "Paid via QR Code" && !utr) {
    alert(currentLang === 'hi' ? "कृपया QR पेमेंट के बाद UTR / Transaction नंबर दर्ज करें, या 'Pay at Parlour' चुनें।" : "Please enter your UTR / Transaction Reference No., or select 'Pay at Parlour'.");
    return;
  }

  const btn = document.getElementById("finalConfirmPayBtn");
  if(btn) { btn.disabled = true; btn.textContent = "⏳ Saving Booking & Generating PDF..."; }

  const orderId = generateOrderID();
  const itemsSummaryText = pendingCheckoutData.items.map(i => `${i.nameEn} (x${i.qty} - Rs.${i.price * i.qty})`).join(", ");
  const couponText = pendingCheckoutData.discountAmount > 0 ? ` | Coupon ${pendingCheckoutData.couponCode}: -Rs.${pendingCheckoutData.discountAmount}` : ``;
  const paymentSummary = payMode === "Paid via QR Code" ? `Paid via QR (UTR: ${utr})` : `Pay at Parlour`;
  const combinedServiceRecord = `${itemsSummaryText}${couponText} | Loc: ${pendingCheckoutData.locationType} | Total: Rs.${pendingCheckoutData.totalAmount} | ${paymentSummary}${pendingCheckoutData.notes ? ' | Note: ' + pendingCheckoutData.notes : ''}`;

  const completeOrderObj = {
    bookingId: orderId,
    name: pendingCheckoutData.name,
    email: pendingCheckoutData.email,
    gender: pendingCheckoutData.gender,
    phone: pendingCheckoutData.phone,
    date: pendingCheckoutData.date,
    time: pendingCheckoutData.time,
    locationType: pendingCheckoutData.locationType,
    notes: pendingCheckoutData.notes,
    items: pendingCheckoutData.items,
    discountAmount: pendingCheckoutData.discountAmount || 0,
    couponCode: pendingCheckoutData.couponCode || "",
    totalAmount: pendingCheckoutData.totalAmount,
    paymentMode: payMode,
    utr: utr || "N/A",
    status: "Pending",
    createdAt: new Date().toLocaleString()
  };

  apiCall({
    action: "book", bookingId: orderId, name: completeOrderObj.name, email: completeOrderObj.email, gender: completeOrderObj.gender,
    phone: completeOrderObj.phone, service: combinedServiceRecord, date: completeOrderObj.date, time: completeOrderObj.time,
    totalAmount: completeOrderObj.totalAmount, paymentMode: completeOrderObj.paymentMode, utr: completeOrderObj.utr, cartJson: JSON.stringify(completeOrderObj.items)
  }).then(data => {
    if(data && data.bookingId) completeOrderObj.bookingId = data.bookingId;
    completeOrderPostProcess(completeOrderObj);
  }).catch(() => {
    completeOrderPostProcess(completeOrderObj);
  }).finally(() => {
    if(btn) { btn.disabled = false; btn.textContent = "✅ Confirm Payment & Auto-Download PDF Receipt"; }
  });
}

function completeOrderPostProcess(orderObj) {
  myLocalOrders.unshift(orderObj);
  localStorage.setItem("bpf_my_orders_v1", JSON.stringify(myLocalOrders));
  window.lastConfirmedOrder = orderObj;

  generateAndDownloadOrderPdf(orderObj);

  cart = [];
  appliedCoupon = { code: "", discount: 0 };
  saveAndRefreshCart();
  document.getElementById("bookingForm")?.reset();
  setInputValueIfPresent("payUtrInput", "");
  setInputValueIfPresent("couponInput", "");
  setTextIfPresent("couponStatusMsg", "");
  closePaymentModal();
  renderMyLocalOrders();
  updateUI();

  const waBox = document.getElementById("waInstantBanner");
  if(waBox) {
    waBox.style.display = "block";
    setTextIfPresent("confirmedIdSpan", orderObj.bookingId);
  }
}

function sendSummaryToWhatsApp(customOrder) {
  const ord = customOrder || window.lastConfirmedOrder || myLocalOrders[0];
  if(!ord) return;
  const itemsTxt = Array.isArray(ord.items)
    ? ord.items.map(i => `• ${i.nameEn} (x${i.qty}) - ₹${i.price * i.qty}`).join("\n")
    : `• ${ord.service || "Beauty Parlour Booking"}`;
  const msg = `✨ *BOOKING SUMMARY - BEAUTY PLUS FOREVER* ✨\n\n🆔 *Booking ID:* ${ord.bookingId}\n👤 *Name:* ${ord.name}\n📱 *Phone:* ${ord.phone}\n📍 *Service Location:* ${ord.locationType || 'At Parlour (Raxaul)'}\n📅 *Appointment:* ${ord.date} at ${ord.time}\n\n🛍️ *Selected Services:*\n${itemsTxt}\n\n💰 *Total Payable:* ₹${ord.totalAmount}\n💳 *Payment:* ${ord.paymentMode} (UTR: ${ord.utr || 'N/A'})`;
  window.open(`https://api.whatsapp.com/send?phone=${PRIMARY_WA_NUMBER}&text=${encodeURIComponent(msg)}`, '_blank');
}

// ==========================================
// PDF RECEIPT GENERATOR
// ==========================================
function generateAndDownloadOrderPdf(orderObj) {
  try {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("PDF generator loading, please click Download PDF Receipt again.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    doc.setFillColor(141, 61, 104);
    doc.rect(0, 0, 210, 38, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("BEAUTY PLUS FOREVER", 105, 16, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("A Special Ladies Beauty Parlour", 105, 23, { align: "center" });
    doc.setFontSize(9);
    doc.text("Mauje, Ward No. 13, Mahaveer Chauk, Mai Sthan Road, Raxaul, Bihar - 845305", 105, 29, { align: "center" });
    doc.text("Phone: +91 9798013636 | WhatsApp: +91 9297562362 | Email: beautyplusforeverrxl@gmail.com", 105, 34, { align: "center" });

    doc.setTextColor(41, 35, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("OFFICIAL BOOKING & PAYMENT RECEIPT", 15, 49);
    doc.setDrawColor(201, 154, 61);
    doc.setLineWidth(0.7);
    doc.line(15, 52, 195, 52);

    doc.setFontSize(10);
    doc.text(`Booking ID: ${orderObj.bookingId}`, 15, 61);
    doc.text(`Customer: ${orderObj.name} (${orderObj.gender || "Female"})`, 15, 68);
    doc.text(`Mobile: ${orderObj.phone}`, 15, 75);
    doc.text(`Location: ${orderObj.locationType || "At Parlour (Raxaul)"}`, 15, 82);

    doc.text(`Appointment Date: ${orderObj.date}`, 115, 61);
    doc.text(`Appointment Time: ${orderObj.time}`, 115, 68);
    doc.text(`Payment Mode: ${orderObj.paymentMode || "QR Code"}`, 115, 75);
    doc.text(`UTR / Ref: ${orderObj.utr || "N/A"} | Status: ${(orderObj.status || "CONFIRMED").toUpperCase()}`, 115, 82);

    let y = 94;
    doc.setFillColor(245, 230, 238);
    doc.rect(15, y, 180, 10, "F");
    doc.setTextColor(141, 61, 104);
    doc.setFont("helvetica", "bold");
    doc.text("S.No", 19, y + 7);
    doc.text("Service Description", 35, y + 7);
    doc.text("Qty", 125, y + 7);
    doc.text("Rate", 145, y + 7);
    doc.text("Amount", 170, y + 7);

    y += 16;
    doc.setTextColor(41, 35, 42);
    doc.setFont("helvetica", "normal");

    const itemsList = Array.isArray(orderObj.items) && orderObj.items.length > 0
      ? orderObj.items
      : [{ nameEn: orderObj.service || "Beauty Parlour Package", qty: 1, price: orderObj.totalAmount || 0 }];

    itemsList.forEach((item, idx) => {
      const lineTotal = Number(item.price) * Number(item.qty);
      doc.text(`${idx + 1}.`, 19, y);
      doc.text(`${String(item.nameEn || item.id).substring(0, 44)}`, 35, y);
      doc.text(`${item.qty}`, 127, y);
      doc.text(`Rs. ${item.price}`, 145, y);
      doc.text(`Rs. ${lineTotal}`, 170, y);
      doc.setDrawColor(235, 225, 230);
      doc.line(15, y + 3, 195, y + 3);
      y += 10;
    });

    if (orderObj.discountAmount && orderObj.discountAmount > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(39, 174, 96);
      doc.text(`Coupon Discount (${orderObj.couponCode}): -Rs. ${orderObj.discountAmount}`, 120, y);
      y += 8;
    }

    y += 4;
    doc.setFillColor(141, 61, 104);
    doc.rect(115, y, 80, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`GRAND TOTAL: Rs. ${orderObj.totalAmount || 0}/-`, 155, y + 8, { align: "center" });

    doc.setTextColor(120, 110, 118);
    doc.setFontSize(9);
    doc.text("Thank you for choosing Beauty Plus Forever! Show this receipt during your visit.", 105, 274, { align: "center" });
    doc.text("100% Authentic Products (O3+, MAC, Kryolan, L'Oreal Professionnel, Rica) • Raxaul, Bihar", 105, 280, { align: "center" });

    doc.save(`BeautyPlusForever_Receipt_${orderObj.bookingId}.pdf`);
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// ORDER TRACKING, RESCHEDULE MODAL & CANCELLATION
// ==========================================
function renderMyLocalOrders() {
  const container = document.getElementById("myOrdersHistoryBox");
  const list = document.getElementById("myOrdersList");
  if(!container || !list) return;

  if(!myLocalOrders || myLocalOrders.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  list.innerHTML = myLocalOrders.slice(0, 8).map((ord, idx) => {
    const isCancelled = ord.status === "Cancelled" || ord.status === "Rejected";
    const servicesText = Array.isArray(ord.items)
      ? ord.items.map(i => `${i.nameEn} ×${i.qty}`).join(", ")
      : (ord.service || "");

    return `
      <div style="border:2px solid var(--line);border-radius:16px;padding:15px;margin-bottom:12px;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <strong style="color:var(--primary);font-size:15.5px;">ID: ${ord.bookingId}</strong>
            <span style="margin-left:8px;padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:800;background:${isCancelled ? '#f8d7da' : '#d4edda'};color:${isCancelled ? '#721c24' : '#155724'};">
              ${ord.status || 'Confirmed'}
            </span>
          </div>
          <div style="font-weight:900;font-size:17px;color:var(--primary);">₹${ord.totalAmount || 0}</div>
        </div>
        <div style="font-size:13.5px;margin:6px 0;color:var(--ink);"><b>Services:</b> ${servicesText}</div>
        <div style="font-size:13px;color:var(--muted);">📅 ${ord.date} at ${ord.time} • 📍 ${ord.locationType || 'At Parlour'}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <button class="btn secondary sm" onclick="downloadLocalOrderPdf(${idx})">📄 PDF Receipt</button>
          <button class="btn success sm" onclick="sendSummaryToWhatsApp(myLocalOrders[${idx}])">📲 WhatsApp Share</button>
          ${!isCancelled ? `<button class="btn primary sm" onclick="openRescheduleModal('${ord.bookingId}', ${idx})">📅 Reschedule</button>` : ``}
          ${!isCancelled ? `<button class="btn danger sm" onclick="cancelCustomerOrder('${ord.bookingId}', ${idx})">❌ Cancel</button>` : ``}
        </div>
      </div>
    `;
  }).join('');
}

function downloadLocalOrderPdf(idx) {
  if(myLocalOrders[idx]) generateAndDownloadOrderPdf(myLocalOrders[idx]);
}

function openRescheduleModal(bookingId, localIdx) {
  rescheduleTarget = { bookingId, localIdx };
  setTextIfPresent("reschedBookingIdText", bookingId);
  const modal = document.getElementById("rescheduleModal");
  if(modal) modal.classList.add("open");
}

function closeRescheduleModal() {
  const modal = document.getElementById("rescheduleModal");
  if(modal) modal.classList.remove("open");
}

function submitReschedule() {
  const newDate = document.getElementById("reschedDateInput")?.value;
  const newTime = document.getElementById("reschedTimeInput")?.value;
  if(!newDate || !newTime) { alert("Please select both new Date and Time."); return; }

  const { bookingId, localIdx } = rescheduleTarget;
  if(localIdx !== undefined && localIdx >= 0 && myLocalOrders[localIdx]) {
    myLocalOrders[localIdx].date = newDate;
    myLocalOrders[localIdx].time = newTime;
    myLocalOrders[localIdx].status = "Rescheduled";
    localStorage.setItem("bpf_my_orders_v1", JSON.stringify(myLocalOrders));
    renderMyLocalOrders();
  }
  if(window.lastTrackedOrderObj && window.lastTrackedOrderObj.bookingId === bookingId) {
    window.lastTrackedOrderObj.date = newDate;
    window.lastTrackedOrderObj.time = newTime;
    window.lastTrackedOrderObj.status = "Rescheduled";
  }

  closeRescheduleModal();
  apiCall({
    action: "update_booking", bookingId: bookingId, newStatus: "Rescheduled", newDate: newDate, newTime: newTime, token: adminSecureToken || "customer_reschedule"
  }).then(() => {
    alert(`✅ Appointment (${bookingId}) successfully rescheduled to ${newDate} at ${newTime}!`);
  }).catch(() => {
    alert(`✅ Appointment (${bookingId}) rescheduled to ${newDate} at ${newTime}!`);
  });
}

function cancelCustomerOrder(bookingId, localIdx) {
  const reason = prompt(currentLang === "hi" ? `बुकिंग (${bookingId}) कैंसिल करने का कारण लिखें:` : `Enter reason for cancelling Booking (${bookingId}):`, "Schedule change");
  if(reason === null) return;

  if(localIdx !== undefined && localIdx >= 0 && myLocalOrders[localIdx]) {
    myLocalOrders[localIdx].status = "Cancelled";
    localStorage.setItem("bpf_my_orders_v1", JSON.stringify(myLocalOrders));
    renderMyLocalOrders();
  }
  apiCall({
    action: "update_booking", bookingId: bookingId, newStatus: "Cancelled", reason: reason, token: adminSecureToken || "customer_self_cancel"
  }).then(() => alert(`Booking ${bookingId} has been marked as Cancelled.`)).catch(() => alert(`Booking ${bookingId} marked as Cancelled.`));
}

function trackOrder() {
  const tid = (document.getElementById("trackId")?.value || "").trim().toUpperCase();
  const btn = document.getElementById("trackBtn");
  const res = document.getElementById("trackResult");
  if(!tid || !res) return alert("Enter Booking ID");
  if(btn) btn.disabled = true;
  res.style.display = "none"; res.className = "track-result";

  apiCall({ action: "track", bookingId: tid }).then(d => {
    res.style.display = "block";
    if(d.status === "success") {
      const localMatchIdx = myLocalOrders.findIndex(o => o.bookingId === d.bookingId);
      const localMatch = localMatchIdx >= 0 ? myLocalOrders[localMatchIdx] : null;
      const currentStatus = (localMatch && localMatch.status === "Cancelled") ? "Cancelled" : d.orderStatus;
      res.classList.add("status-" + currentStatus);

      const tempOrderForPdf = localMatch || {
        bookingId: d.bookingId, name: d.name || "Valued Client", phone: d.phone || "",
        service: d.service, date: d.date, time: d.time || "", totalAmount: d.totalAmount || "",
        paymentMode: d.paymentMode || "Recorded", utr: d.utr || "", status: currentStatus
      };
      window.lastTrackedOrderObj = tempOrderForPdf;

      res.innerHTML = `
        <strong>Booking ID: ${d.bookingId}</strong><br>
        <b>Details:</b> ${d.service}<br>
        <b>Appointment:</b> ${tempOrderForPdf.date} ${tempOrderForPdf.time}<br>
        <div style="font-size:18px;font-weight:900;margin:8px 0;">Status: ${currentStatus.toUpperCase()}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <button class="btn secondary sm" onclick="generateAndDownloadOrderPdf(window.lastTrackedOrderObj)">📄 Download PDF Receipt</button>
          <button class="btn success sm" onclick="sendSummaryToWhatsApp(window.lastTrackedOrderObj)">📲 WhatsApp Share</button>
          ${currentStatus !== 'Cancelled' && currentStatus !== 'Completed' && currentStatus !== 'Rejected'
            ? `<button class="btn primary sm" onclick="openRescheduleModal('${d.bookingId}', ${localMatchIdx})">📅 Reschedule</button>
               <button class="btn danger sm" onclick="cancelCustomerOrder('${d.bookingId}', ${localMatchIdx})">❌ Cancel</button>`
            : ``}
        </div>
      `;
    } else {
      res.style.background = "#fff"; res.style.border = "1px solid #ccc"; res.style.color = "red";
      res.innerHTML = `<strong>Error:</strong> ${d.message}`;
    }
  }).catch(() => {
    res.style.display = "block"; res.style.color = "red"; res.innerHTML = "Network Error.";
  }).finally(() => { if(btn) btn.disabled = false; });
}

// ==========================================
// REVIEWS, LANGUAGE & AUTHENTICATION
// ==========================================
const reviewFormEl = document.getElementById("reviewForm");
if(reviewFormEl) {
  reviewFormEl.addEventListener("submit", function(e) {
    e.preventDefault();
    const fileInput = document.getElementById("rPhoto")?.files[0];
    const text = document.getElementById("rText")?.value;
    if(fileInput && (currentUser || isAdmin)) {
      const btn = e.target.querySelector('button');
      if(btn) { btn.disabled = true; btn.textContent = "Uploading..."; }
      const fd = new FormData(); fd.append("image", fileInput);
      fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: fd })
        .then(r => r.json()).then(data => {
          if(data.success) {
            apiCall({ action: "post_review", name: isAdmin ? "Admin (Vishakha)" : currentUser.name, text: text, fileUrl: data.data.url }).then(() => {
              alert("Review posted!"); reviewFormEl.reset(); fetchGlobalData();
            });
          } else alert("Image upload error");
        }).finally(() => { if(btn) { btn.disabled = false; btn.textContent = "Post Review"; } });
    }
  });
}

function renderReviews() {
  const list = document.getElementById("reviewList");
  if(!list) return;
  if(!top5Reviews || top5Reviews.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);">${currentLang === 'hi' ? "अभी तक कोई समीक्षा नहीं।" : "No reviews yet."}</p>`;
    return;
  }
  list.innerHTML = top5Reviews.map(r => `
    <div class="review-card">
      <img src="${r.photo}" onerror="this.style.display='none'">
      <div class="review-meta"><b>${r.name}</b> • ${r.date}</div>
      <p style="margin:0;font-size:14.5px;">"${r.text}"</p>
    </div>
  `).join('');
}

function changeLang(lang) {
  currentLang = lang;
  localStorage.setItem("bpf_lang", lang);
  const switcher = document.getElementById("langSwitcher");
  if(switcher) switcher.value = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    if (translations[lang] && translations[lang][key]) el.placeholder = translations[lang][key];
  });
  initServices();
  renderReviews();
  renderCheckoutCart();
  renderModalCart();
  renderGlobalGreetingBanner(savedSocialSettings.greetingMsg);
}

function openAuthModal() { document.getElementById("authModal")?.classList.add("open"); }
function closeAuthModal() { document.getElementById("authModal")?.classList.remove("open"); }
function switchAuthModalTab(t) {
  setTextIfPresent("authError", ""); setTextIfPresent("authSuccess", "");
  const lf = document.getElementById("loginForm"); if(lf) lf.style.display = t==='login'?'block':'none';
  const sf = document.getElementById("signupForm"); if(sf) sf.style.display = t==='signup'?'block':'none';
  const tl = document.getElementById("tabLogin"); if(tl) tl.className = t==='login'?'tab-btn active':'tab-btn';
  const ts = document.getElementById("tabSignup"); if(ts) ts.className = t==='signup'?'tab-btn active':'tab-btn';
}

const signupFormEl = document.getElementById("signupForm");
if(signupFormEl) {
  signupFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("signupSubmitBtn"); if(btn) btn.disabled = true;
    apiCall({
      action: "signup", name: document.getElementById("regName").value.trim(), gender: document.getElementById("regGender").value,
      age: document.getElementById("regAge").value, mobile: document.getElementById("regMobile").value,
      address: document.getElementById("regAddress").value.trim(), username: document.getElementById("regUsername").value.trim(), password: document.getElementById("regPassword").value
    }).then(d => {
      if (d.status === "success") {
        setTextIfPresent("authSuccess", `Success! Login ID: ${d.loginId}`);
        localStorage.setItem("bpf_user", JSON.stringify(d.user)); currentUser = d.user; isAdmin = false;
        setTimeout(() => { closeAuthModal(); updateUI(); }, 1800);
      } else setTextIfPresent("authError", d.message);
    }).catch(() => setTextIfPresent("authError", "Network Error")).finally(() => { if(btn) btn.disabled = false; });
  });
}

const loginFormEl = document.getElementById("loginForm");
if(loginFormEl) {
  loginFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("loginUsername").value.trim();
    const p = document.getElementById("loginPassword").value.trim();
    const btn = document.getElementById("loginSubmitBtn"); if(btn) btn.disabled = true;
    apiCall({ action: "login", username: u, password: p }).then(d => {
      if (d.status === "success") {
        if(d.role === "admin") {
          localStorage.setItem("bpf_admin", "true"); localStorage.setItem("bpf_admin_token", d.token);
          isAdmin = true; currentUser = null; adminSecureToken = d.token;
        } else {
          localStorage.setItem("bpf_user", JSON.stringify(d.user)); currentUser = d.user; isAdmin = false;
        }
        closeAuthModal(); updateUI();
      } else setTextIfPresent("authError", d.message);
    }).catch(() => setTextIfPresent("authError", "Network Error")).finally(() => { if(btn) btn.disabled = false; });
  });
}

function logout() {
  localStorage.removeItem("bpf_admin");
  localStorage.removeItem("bpf_admin_token");
  localStorage.removeItem("bpf_user");
  isAdmin = false; currentUser = null; adminSecureToken = null;
  updateUI();
}

function updateUI() {
  const authBtn = document.getElementById("authBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userGreeting = document.getElementById("userGreeting");
  const adminBadge = document.getElementById("adminBadge");
  const adminDash = document.getElementById("adminDashboard");
  const revForm = document.getElementById("reviewFormArea");

  if (currentUser || isAdmin) {
    if(authBtn) authBtn.style.display = "none";
    if(logoutBtn) logoutBtn.style.display = "inline-flex";
    if(userGreeting) userGreeting.style.display = "inline-block";
    if(revForm) revForm.style.display = "block";
    if(isAdmin) {
      if(userGreeting) userGreeting.textContent = "Admin";
      if(adminBadge) adminBadge.style.display = "inline-block";
      if(adminDash) adminDash.style.display = "block";
      renderAdminPriceList();
    } else {
      if(userGreeting) userGreeting.textContent = "Hi, " + currentUser.name.split(' ')[0];
      if(adminBadge) adminBadge.style.display = "none";
      if(adminDash) adminDash.style.display = "none";
      setInputValueIfPresent("bName", currentUser.name);
      setInputValueIfPresent("bPhone", currentUser.mobile);
    }
  } else {
    if(authBtn) authBtn.style.display = "inline-flex";
    if(logoutBtn) logoutBtn.style.display = "none";
    if(userGreeting) userGreeting.style.display = "none";
    if(adminBadge) adminBadge.style.display = "none";
    if(adminDash) adminDash.style.display = "none";
    if(revForm) revForm.style.display = "none";
  }
}

function switchAdminTab(t, btnEl) {
  document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(t)?.classList.add('active');
  if(btnEl) btnEl.classList.add('active');
  if(t === 'adminPriceList') renderAdminPriceList();
}

function fetchAdminBookings() {
  const tb = document.getElementById("adminBookingsTable");
  if(!tb) return;
  tb.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Fetching live bookings...</td></tr>";
  apiCall({ action: "get_bookings", token: adminSecureToken }).then(d => {
    if(d.status === "success") {
      window.adminLoadedBookings = d.bookings || [];
      tb.innerHTML = window.adminLoadedBookings.map((b, i) => `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>${b.name}<br><small>${b.phone}</small></td>
          <td style="max-width:250px;">${b.service}</td>
          <td>${b.date}<br>${b.time}</td>
          <td>
            <select onchange="changeBookingStatus('${b.id}', this.value)" style="padding:6px;border-radius:8px;font-weight:bold;">
              <option value="Pending" ${b.status==='Pending'?'selected':''}>Pending</option>
              <option value="Confirmed" ${b.status==='Confirmed'?'selected':''}>Confirmed</option>
              <option value="Rescheduled" ${b.status==='Rescheduled'?'selected':''}>Rescheduled</option>
              <option value="Hold" ${b.status==='Hold'?'selected':''}>Hold</option>
              <option value="Completed" ${b.status==='Completed'?'selected':''}>Completed</option>
              <option value="Cancelled" ${b.status==='Cancelled'?'selected':''}>Cancelled</option>
            </select>
          </td>
          <td><button class="btn secondary sm" onclick="downloadAdminBookingPdf(${i})">📄 PDF</button></td>
        </tr>`).join('');
    } else {
      tb.innerHTML = `<tr><td colspan='6' style='color:red;text-align:center;'>${d.message}</td></tr>`;
    }
  });
}

function downloadAdminBookingPdf(idx) {
  const b = (window.adminLoadedBookings || [])[idx];
  if(!b) return;
  generateAndDownloadOrderPdf({
    bookingId: b.id, name: b.name, email: b.email, phone: b.phone,
    service: b.service, date: b.date, time: b.time,
    totalAmount: b.totalAmount || 0, paymentMode: b.paymentMode || "Recorded", utr: b.utr || "Verified", status: b.status
  });
}

function changeBookingStatus(id, newStatus) {
  apiCall({ action: "update_booking", bookingId: id, newStatus: newStatus, token: adminSecureToken }).then(d => {
    if(d.status === "success") alert("Status updated to " + newStatus);
    else alert("Error: " + d.message);
  });
}

// Gallery Slider Autoplay
setInterval(() => {
  const container = document.getElementById("sliderContainer");
  if(container && container.children[0] && container.children[0].children[0]) {
    const slideWidth = container.children[0].children[0].offsetWidth + 18;
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) container.scrollTo({ left: 0, behavior: 'smooth' });
    else container.scrollBy({ left: slideWidth, behavior: 'smooth' });
  }
}, 3200);

// FAQ Accordion Init
document.querySelectorAll(".faq-question").forEach(q => {
  q.addEventListener("click", () => q.parentElement.classList.toggle("active"));
});

// INITIALIZE PORTAL ON ANY PAGE
setTextIfPresent("year", new Date().getFullYear());
const tzoffset = (new Date()).getTimezoneOffset() * 60000;
const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
document.getElementById("bDate")?.setAttribute('min', localISOTime);
document.getElementById("reschedDateInput")?.setAttribute('min', localISOTime);

changeLang(currentLang);
saveAndRefreshCart();
renderSubpageDynamicContent();
renderMyLocalOrders();
applySettings(savedSocialSettings);
fetchGlobalData();
updateUI();
handleCrossPageHashRouting();
