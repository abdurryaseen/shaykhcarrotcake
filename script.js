// ---- Edit these to match the business ----
const CONFIG = {
  prices: {
    slice: 10,
    cupcake: 5,
    dozen: 50,
    whole: 75,
  },
  maxQty: { slice: 12, cupcake: 24, dozen: 10, whole: 5 },
  phone: "",                    // e.g. "3135551234" (used for "Text my order")
  email: "",                    // e.g. "orders@example.com"
  // Metro Detroit ZIP prefixes we serve. Tighten or add exact ZIPs as needed.
  zipPrefixes: ["480", "481", "482", "483"],
};

const INGREDIENTS = [
  { e: "🥕", name: "Organic carrots", text: "Freshly grated by hand for every batch. They're the heart of the cake." },
  { e: "🌾", name: "Organic flour", text: "Soft, simple flour that gives the cake its tender crumb." },
  { e: "🥚", name: "Organic eggs", text: "They hold everything together and keep each slice moist." },
  { e: "🍯", name: "Organic sugar", text: "Just enough sweetness to let the spices shine." },
  { e: "🫚", name: "Organic oil", text: "The secret to a cake that stays moist for days." },
  { e: "🍂", name: "Warm spices", text: "Cinnamon and friends, measured by hand for that cozy flavor." },
  { e: "🧀", name: "Organic cream cheese", text: "Whipped into a rich, tangy frosting." },
  { e: "🧈", name: "Organic butter", text: "Makes the frosting smooth and silky." },
];

const LAYERS = {
  frosting: "Rich cream cheese frosting made with organic cream cheese and butter, whipped by hand.",
  cake: "Moist, spiced carrot cake made with freshly grated organic carrots and simple organic ingredients.",
  base: "Homemade in small batches, never mass-produced. Every slice gets the same care.",
};

const $ = (s) => document.querySelector(s);
const money = (n) => (n == null ? "$—" : "$" + n.toFixed(2));

$("#year").textContent = new Date().getFullYear();
document.querySelectorAll("[data-price]").forEach((el) => (el.textContent = money(CONFIG.prices[el.dataset.price])));

// Hero video: hide fallback once it plays, keep fallback if the file is missing
const heroVideo = $(".hero-video");
heroVideo.addEventListener("error", () => heroVideo.remove(), true);
heroVideo.querySelector("source").addEventListener("error", () => heroVideo.remove());

// Hide broken images gracefully (before media is added)
document.querySelectorAll("img").forEach((img) =>
  img.addEventListener("error", () => (img.style.visibility = "hidden"))
);

// Cake layers
document.querySelectorAll(".layer").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".layer").forEach((b) => b.classList.toggle("active", b === btn));
    $("#layerInfo").textContent = LAYERS[btn.dataset.layer];
  })
);

// Ingredient chips
const chips = $("#chips");
const detail = $("#chipDetail");
INGREDIENTS.forEach((ing, i) => {
  const b = document.createElement("button");
  b.className = "chip" + (i === 0 ? " active" : "");
  b.textContent = `${ing.e} ${ing.name}`;
  b.addEventListener("click", () => {
    chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    detail.innerHTML = `<span class="chip-emoji">${ing.e}</span><div><h3>${ing.name}</h3><p>${ing.text}</p></div>`;
    detail.classList.remove("pop"); void detail.offsetWidth; detail.classList.add("pop");
  });
  chips.appendChild(b);
});

// Order builder
let qty = 1;
let item = "slice";
const ITEM = {
  slice: { label: "Slices", one: "slice", many: "slices", emoji: "🍰" },
  cupcake: { label: "Cupcakes", one: "carrot cupcake", many: "carrot cupcakes", emoji: "🧁" },
  dozen: { label: "Dozens", one: "dozen carrot cupcakes", many: "dozen carrot cupcakes", emoji: "📦" },
  whole: { label: "Whole cakes", one: "whole carrot cake", many: "whole carrot cakes", emoji: "🎂" },
};
document.querySelectorAll(".toggle button").forEach((b) =>
  b.addEventListener("click", () => {
    item = b.dataset.item;
    document.querySelectorAll(".toggle button").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-checked", x === b);
    });
    qty = 1;
    renderOrder();
  })
);
function renderOrder() {
  const it = ITEM[item];
  const price = CONFIG.prices[item];
  $("#qtyLabel").textContent = it.label;
  $("#qty").textContent = qty;
  $("#total").textContent = price == null ? "$—" : money(qty * price);
  $("#stack").innerHTML = `<span>${it.emoji}</span>`.repeat(qty);
  const name = $("#name").value.trim();
  const msg =
    `Hi Shaykh Carrot Cake! I'd like to order ${qty} ${qty > 1 ? it.many : it.one}` +
    (price != null ? ` ($${qty * price})` : "") +
    ` for ${$("#method").value.toLowerCase()}.` +
    ($("#zip").value ? ` My ZIP is ${$("#zip").value}.` : "") +
    (name ? ` - ${name}` : "");
  $("#sendText").href = CONFIG.phone ? `sms:${CONFIG.phone}?&body=${encodeURIComponent(msg)}` : "#order";
  $("#sendEmail").href = CONFIG.email
    ? `mailto:${CONFIG.email}?subject=${encodeURIComponent("Carrot cake order")}&body=${encodeURIComponent(msg)}`
    : "#order";
}
$("#minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); renderOrder(); });
$("#plus").addEventListener("click", () => { qty = Math.min(CONFIG.maxQty[item], qty + 1); renderOrder(); });
["#name", "#method", "#zip"].forEach((s) => $(s).addEventListener("input", renderOrder));
["#sendText", "#sendEmail"].forEach((s) =>
  $(s).addEventListener("click", (e) => {
    if ($(s).getAttribute("href") === "#order") {
      e.preventDefault();
      alert("Online ordering details are coming soon. Please check back shortly!");
    }
  })
);
renderOrder();

// ZIP checker
$("#zipForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const zip = $("#zip").value.trim();
  const out = $("#zipResult");
  if (!/^\d{5}$/.test(zip)) {
    out.className = "zip-result no";
    out.textContent = "Please enter a 5-digit ZIP code.";
  } else if (CONFIG.zipPrefixes.some((p) => zip.startsWith(p))) {
    out.className = "zip-result ok";
    out.textContent = "🎉 Good news, you're in our Detroit-area service zone!";
  } else {
    out.className = "zip-result no";
    out.textContent = "Sorry, we only serve the Detroit, Michigan area for now. We hope to grow soon!";
  }
  renderOrder();
});

// Lightbox
const lb = $("#lightbox");
const lbBody = $("#lbBody");
function closeLb() { lb.hidden = true; lbBody.innerHTML = ""; }
document.querySelectorAll(".g-item").forEach((item) =>
  item.addEventListener("click", () => {
    const { type, src, poster } = item.dataset;
    lbBody.innerHTML = type === "video"
      ? `<video src="${src}" poster="${poster || ""}" controls autoplay playsinline></video>`
      : `<img src="${src}" alt=""/>`;
    lb.hidden = false;
  })
);
$("#lbClose").addEventListener("click", closeLb);
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
