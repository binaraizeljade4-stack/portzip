"use strict";
const $ = (s) => document.querySelector(s);
const el = (tag, html, cls) => { const e = document.createElement(tag); e.innerHTML = html; if (cls) e.className = cls; return e; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* Profile text */
document.querySelectorAll("[data-p]").forEach((n) => { if (PROFILE[n.dataset.p]) n.textContent = PROFILE[n.dataset.p]; });
$("#interests").innerHTML = PROFILE.interests.map((i) => `<span>${esc(i)}</span>`).join("");
$("#facts").innerHTML = Object.entries(PROFILE.facts).map(([k, v]) => `<li><b>${esc(k)}</b>${esc(v)}</li>`).join("");
$("#roles").innerHTML = PROFILE.roles.map((r) => `<li>${esc(r)}</li>`).join("");
$("#links").innerHTML = PROFILE.links.map(([n, h, t]) => `<li><b>${esc(n)}:</b> <a href="${esc(h)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("");
const tl = (a) => a.map((x) => `<li><time>${esc(x.when)}</time><h3>${esc(x.title)}</h3><p>${esc(x.sub)}</p></li>`).join("");
$("#timeline").innerHTML = tl(TIMELINE);

/* Theme */
const root = document.documentElement, tbtn = $("#theme");
function setTheme(t) {
  root.dataset.theme = t; tbtn.textContent = t === "dark" ? "Light" : "Dark";
  tbtn.setAttribute("aria-label", "Switch to " + (t === "dark" ? "light" : "dark") + " mode");
  try { localStorage.setItem("theme", t); } catch (e) {}
}
let saved = "dark"; try { saved = localStorage.getItem("theme") || "dark"; } catch (e) {}
setTheme(saved);
tbtn.onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");

/* Mobile menu */
const menu = $("#menu"), burger = $("#burger");
burger.onclick = () => burger.setAttribute("aria-expanded", menu.classList.toggle("open"));
menu.onclick = (e) => { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } };

/* Skills with category filter */
const cats = ["All", ...new Set(SKILLS.map((s) => s.cat))];
function drawSkills(cat) {
  $("#skillFilters").innerHTML = cats.map((c) => `<button aria-pressed="${c === cat}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  const g = $("#skillGrid"); g.innerHTML = "";
  SKILLS.filter((s) => cat === "All" || s.cat === cat).forEach((s) => {
    g.append(el("div", `<div class="row"><b>${esc(s.n)}</b><small>${s.l}%</small></div><small>${esc(s.cat)}</small><div class="bar" role="progressbar" aria-valuenow="${s.l}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(s.n)} proficiency"><i style="width:0"></i></div>`, "card skill"));
  });
  requestAnimationFrame(() => requestAnimationFrame(() => g.querySelectorAll(".bar i").forEach((b, i) => (b.style.width = SKILLS.filter((s) => cat === "All" || s.cat === cat)[i].l + "%"))));
}
$("#skillFilters").onclick = (e) => { if (e.target.dataset.c) drawSkills(e.target.dataset.c); };
drawSkills("All");

/* Dialog helper */
const dlg = $("#dlg");
const openDlg = (html) => { $("#dlgBody").innerHTML = html; dlg.showModal(); };
$("#dlgX").onclick = () => dlg.close();
dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };

/* Projects (with filter) */
const link = (u, t) => (u ? `<a class="btn ghost" href="${esc(u)}" target="_blank" rel="noopener">${t}</a> ` : `<span class="note">${t}: add a link in data.js</span> `);
const ptypes = ["All", ...new Set(PROJECTS.map((p) => p.type).filter(Boolean))];
function drawProjects(t) {
  $("#projFilters").innerHTML = ptypes.map((c) => `<button aria-pressed="${c === t}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  $("#projectGrid").innerHTML = PROJECTS.map((p, i) => ({ p, i })).filter((x) => t === "All" || x.p.type === t).map(({ p, i }) =>
    `<article class="card"><div class="shot">${p.img ? `<img src="${esc(p.img)}" alt="Screenshot of ${esc(p.t)}">` : "Screenshot placeholder"}</div><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p><div class="tags">${p.tech.map((x) => `<span>${esc(x)}</span>`).join("")}</div><button class="btn" data-i="${i}">View Details</button></article>`).join("");
}
$("#projFilters").onclick = (e) => { if (e.target.dataset.c) drawProjects(e.target.dataset.c); };
$("#projectGrid").onclick = (e) => {
  const i = e.target.dataset.i; if (i === undefined) return; const p = PROJECTS[i];
  openDlg(`<h3 id="dlgTitle">${esc(p.t)}</h3><p>${esc(p.d)}</p>${p.img ? `<div class="shot"><img src="${esc(p.img)}" alt="Screenshot of ${esc(p.t)}"></div>` : ""}<h4>Objective</h4><p>${esc(p.obj)}</p><h4>Technologies</h4><div class="tags">${p.tech.map((t) => `<span>${esc(t)}</span>`).join("")}</div>${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}<p>${link(p.code, "Source code")}${link(p.demo, "Live demo")}</p>`);
};
drawProjects("All");

/* Case studies */
$("#caseList").innerHTML = CASES.map((c) => `<details class="card"><summary>${esc(c.t)}</summary><h4>Problem</h4><p>${esc(c.p)}</p><h4>Possible causes</h4><p>${esc(c.c)}</p><h4>Troubleshooting process</h4><p>${esc(c.s)}</p><h4>Solution</h4><p>${esc(c.f)}</p><h4>Lessons learned</h4><p>${esc(c.l)}</p></details>`).join("");

/* Subnet calculator */
const toInt = (s) => { const p = s.trim().split("."); if (p.length !== 4 || !p.every((x) => /^\d{1,3}$/.test(x) && +x <= 255)) return null; return p.reduce((a, x) => a * 256 + +x, 0); };
const toIp = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
$("#subnetForm").onsubmit = (e) => {
  e.preventDefault(); const err = $("#subErr"); err.textContent = "";
  const ip = toInt($("#ip").value), raw = $("#cidr").value.trim().replace(/^\//, "");
  if (ip === null) { err.textContent = "Enter a valid IPv4 address with four numbers from 0 to 255, such as 192.168.10.37."; return; }
  if (!/^\d{1,2}$/.test(raw) || +raw > 32) { err.textContent = "Enter a whole-number prefix from 0 to 32."; return; }
  const p = +raw, mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
  const net = (ip & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0, total = 2 ** (32 - p);
  const usable = p <= 30 ? total - 2 : p === 31 ? 2 : 1;
  const first = p <= 30 ? net + 1 : net, last = p <= 30 ? bc - 1 : bc;
  const rows = [["Network address", toIp(net)], ["Broadcast address", toIp(bc)], ["Subnet mask", toIp(mask)], ["First host", toIp(first)], ["Last host", toIp(last)], ["Usable hosts", usable.toLocaleString()], ["Total addresses", total.toLocaleString()]];
  $("#subOut").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
};

/* Contact form (opens email app; a real backend is needed to send directly) */
$("#contactForm").onsubmit = (e) => {
  e.preventDefault(); const err = $("#cErr"); err.className = "err";
  const v = (id) => $(id).value.trim(), n = v("#cn"), m = v("#ce"), s = v("#cs"), b = v("#cm");
  if (!n || !s || !b) { err.textContent = "Fill in your name, subject and message."; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) { err.textContent = "Enter a valid email address, such as name@example.com."; return; }
  err.className = "err ok"; err.textContent = "Opening your email app. Press send there to deliver the message.";
  location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b + "\n\nFrom: " + n + " (" + m + ")")}`;
};

/* Tool tabs */
document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => {
  document.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-pressed", x === b));
  $("#p-sub").hidden = b.dataset.tab !== "sub"; $("#p-stats").hidden = b.dataset.tab !== "stats";
}));

/* Quick stats tool */
const fmt = (n) => String(+n.toFixed(4));
$("#statsForm").onsubmit = (e) => {
  e.preventDefault(); const err = $("#stErr"); err.textContent = "";
  const parts = $("#nums").value.split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) { err.textContent = "Type or paste at least one number."; return; }
  const bad = parts.filter((x) => !isFinite(Number(x)));
  if (bad.length) { err.textContent = "These are not numbers: " + bad.slice(0, 5).join(", "); return; }
  const o = parts.map(Number), v = [...o].sort((a, b) => a - b), n = v.length, sum = v.reduce((a, x) => a + x, 0), mean = sum / n;
  const med = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
  const f = {}; v.forEach((x) => (f[x] = (f[x] || 0) + 1)); const mx = Math.max(...Object.values(f));
  const mode = mx > 1 ? Object.keys(f).filter((k) => f[k] === mx).join(", ") : "none";
  const sd = n > 1 ? Math.sqrt(v.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1)) : 0;
  const rows = [["Count", n], ["Sum", fmt(sum)], ["Mean", fmt(mean)], ["Median", fmt(med)], ["Mode", mode], ["Std. deviation (sample)", fmt(sd)], ["Min", fmt(v[0])], ["Max", fmt(v[n - 1])], ["Range", fmt(v[n - 1] - v[0])]];
  $("#stOut").innerHTML = rows.map(([k, x]) => `<dt>${k}</dt><dd>${x}</dd>`).join("");
  const top = Math.max(...o.slice(0, 20));
  $("#stBars").innerHTML = v[0] >= 0 && top > 0 ? o.slice(0, 20).map((x) => `<i style="height:${Math.max(2, (x / top) * 100)}%" title="${x}"></i>`).join("") : "";
};
$("#statsClear").onclick = () => { $("#nums").value = ""; $("#stErr").textContent = ""; $("#stBars").innerHTML = ""; $("#stOut").innerHTML = "<dt>Result</dt><dd>Enter some numbers.</dd>"; };

/* Counters and reveal-on-scroll */
$("#stats").innerHTML = [[PROJECTS.length, "Projects"], [SKILLS.length, "Skills"], [CASES.length, "Case studies"]].map(([n, l]) => `<div class="card stat"><b data-n="${n}">0</b><span>${l}</span></div>`).join("");
const io = new IntersectionObserver((es) => es.forEach((en) => {
  if (!en.isIntersecting) return; const t = en.target; t.classList.add("in");
  t.querySelectorAll("[data-n]").forEach((b) => { const to = +b.dataset.n; let k = 0; const step = () => { k++; b.textContent = Math.round((to * k) / 25); if (k < 25) requestAnimationFrame(step); }; step(); });
  io.unobserve(t);
}), { threshold: 0.12 });
document.querySelectorAll("main section, #stats").forEach((s) => { s.classList.add("reveal"); io.observe(s); });

/* Active nav link, progress bar, back to top, copy email */
const navLinks = [...document.querySelectorAll("nav a")];
const spy = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
addEventListener("scroll", () => {
  const m = document.documentElement.scrollHeight - innerHeight;
  $("#prog").style.width = (m > 0 ? (scrollY / m) * 100 : 0) + "%"; $("#top").classList.toggle("show", scrollY > 600);
}, { passive: true });
$("#top").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
$("#copyMail").onclick = async function () {
  try { await navigator.clipboard.writeText(PROFILE.email); this.textContent = "Copied!"; } catch (e) { this.textContent = PROFILE.email; }
  setTimeout(() => (this.textContent = "Copy email"), 2000);
};
