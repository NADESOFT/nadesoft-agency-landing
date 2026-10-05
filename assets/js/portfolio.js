// Renders the portfolio from data/portfolio.json.
// index.html calls Portfolio.renderSection(); project.html calls Portfolio.renderProject().
// To change content, edit data/portfolio.json, not this file.

(function () {
  const DATA_URL = "data/portfolio.json";

  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

  const STATUS_TONES = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    sky: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  };
  const STATUS_DOTS = { emerald: "bg-emerald-400", amber: "bg-amber-400", sky: "bg-sky-400" };

  async function load() {
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("Could not load " + DATA_URL);
    return res.json();
  }

  function icons() {
    try {
      lucide.createIcons();
    } catch (err) {
      console.warn("Lucide icons failed to load:", err);
    }
  }

  // ---------- shared building blocks ----------

  function storeMark(store, size = "w-5 h-5") {
    switch (store) {
      case "google-play":
        return `<svg viewBox="0 0 24 24" class="${size} shrink-0" aria-hidden="true">
          <path d="M3.6 2.2 13.3 12l-9.7 9.8c-.4-.2-.6-.6-.6-1.1V3.3c0-.5.2-.9.6-1.1z" fill="#00d7fe"/>
          <path d="m16.6 15.3-3.3-3.3 3.3-3.3 3.8 2.2c1 .6 1 1.6 0 2.2z" fill="#ffce00"/>
          <path d="M16.6 15.3 13.3 12l-9.7 9.8c.4.2.9.2 1.4-.1z" fill="#ff3a44"/>
          <path d="M16.6 8.7 5 2.3c-.5-.3-1-.3-1.4-.1l9.7 9.8z" fill="#00f076"/>
        </svg>`;
      case "microsoft-store":
        return `<svg viewBox="0 0 24 24" class="${size} shrink-0" aria-hidden="true">
          <rect x="2" y="2" width="9.5" height="9.5" fill="#f25022"/><rect x="12.5" y="2" width="9.5" height="9.5" fill="#7fba00"/>
          <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00a4ef"/><rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#ffb900"/>
        </svg>`;
      case "chrome-web-store":
        return `<span class="chrome-mark inline-block ${size} shrink-0" aria-hidden="true"></span>`;
      case "vscode-marketplace":
        return `<span class="inline-flex items-center justify-center ${size} shrink-0 rounded bg-[#007acc]" aria-hidden="true"><i data-lucide="code" class="w-3/4 h-3/4 text-white"></i></span>`;
      default:
        return `<i data-lucide="external-link" class="${size} shrink-0"></i>`;
    }
  }

  function storeBadge(data, link, big = false) {
    const meta = data.stores[link.store] || { label: link.label || "Open", short: link.label || "Open" };
    if (big) {
      return `<a href="${esc(link.url)}" target="_blank" rel="noopener"
        class="store-badge inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-white">
        ${storeMark(link.store, "w-7 h-7")}
        <span class="flex flex-col leading-tight text-left">
          <span class="text-[10px] uppercase tracking-[0.14em] text-slate-400">${link.store === "chrome-web-store" || link.store === "vscode-marketplace" ? "Available in the" : "Get it on"}</span>
          <span class="text-[16px] font-bold">${esc(meta.label)}</span>
        </span>
      </a>`;
    }
    return `<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400" title="${esc(meta.label)}">${storeMark(link.store, "w-3.5 h-3.5")}<span class="hidden sm:inline">${esc(meta.short)}</span></span>`;
  }

  function statusBadge(data, p) {
    const s = data.statuses[p.status] || { label: p.status, tone: "sky" };
    const tone = STATUS_TONES[s.tone] || STATUS_TONES.sky;
    const dot = STATUS_DOTS[s.tone] || STATUS_DOTS.sky;
    const ping =
      p.status === "live"
        ? `<span class="absolute inline-flex h-full w-full rounded-full ${dot} opacity-60 animate-ping"></span>`
        : "";
    return `<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}">
      <span class="relative flex h-1.5 w-1.5">${ping}<span class="relative inline-flex h-1.5 w-1.5 rounded-full ${dot}"></span></span>${esc(s.label)}</span>`;
  }

  function appIcon(p, size = "w-14 h-14", radius = "rounded-2xl") {
    if (p.icon) {
      return `<img src="${esc(p.icon)}" alt="${esc(p.shortName || p.name)} icon" loading="lazy" class="p-icon ${size} ${radius} object-cover bg-slate-900 shrink-0" />`;
    }
    return `<span class="p-icon ${size} ${radius} shrink-0 flex items-center justify-center accent-bg-soft border"
      style="background:linear-gradient(140deg,color-mix(in srgb,var(--accent) 45%,#0f172a),#0f172a)">
      <i data-lucide="${esc(p.fallbackIcon || "box")}" class="w-1/2 h-1/2 text-white"></i></span>`;
  }

  function chips(list, max) {
    const shown = max ? list.slice(0, max) : list;
    const extra = max && list.length > max ? `<span class="rounded-md border border-slate-800 px-2 py-0.5 text-[11px] text-slate-500">+${list.length - max}</span>` : "";
    return (
      shown
        .map((t) => `<span class="p-chip rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-slate-300">${esc(t)}</span>`)
        .join("") + extra
    );
  }

  const detailUrl = (p) => `project.html?id=${encodeURIComponent(p.id)}`;
  const coverOf = (p) => p.cover || (p.orientation === "landscape" ? p.screenshots[0] : "") || "";

  function countUp(root) {
    const els = root.querySelectorAll("[data-count]");
    const run = (el) => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const dur = 1100;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) return els.forEach((el) => (el.textContent = el.dataset.count));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    });
    els.forEach((el) => io.observe(el));
  }

  // ---------- index.html: portfolio section ----------

  function spotlightCard(data, p) {
    const cover = coverOf(p);
    const type = data.types[p.type] || {};
    return `<a href="${detailUrl(p)}" class="p-card group rounded-3xl overflow-hidden flex flex-col" style="--accent:${esc(p.accent)}">
      <div class="p-cover relative aspect-[2/1] overflow-hidden bg-slate-900">
        ${cover ? `<img src="${esc(cover)}" alt="${esc(p.name)} artwork" loading="lazy" class="w-full h-full object-cover" />` : ""}
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div class="absolute top-4 left-4 flex gap-2">${statusBadge(data, p)}
          <span class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-slate-200"><i data-lucide="${esc(type.icon || "box")}" class="w-3 h-3"></i>${esc(type.singular || p.type)}</span>
        </div>
      </div>
      <div class="relative -mt-10 px-6 pb-6 flex flex-col flex-1">
        <div class="flex items-end justify-between gap-4">
          ${appIcon(p, "w-16 h-16", "rounded-2xl")}
          <i data-lucide="arrow-up-right" class="p-arrow w-5 h-5 text-slate-500 mb-1"></i>
        </div>
        <h3 class="mt-4 text-xl font-bold text-white">${esc(p.name)}</h3>
        <p class="mt-1 text-xs font-semibold uppercase tracking-wider accent-text">${esc(p.category)}</p>
        <p class="mt-3 text-sm text-slate-400 leading-relaxed clamp-2">${esc(p.tagline)}</p>
        ${
          p.stats && p.stats.length
            ? `<div class="mt-5 grid grid-cols-${Math.min(p.stats.length, 4)} gap-2">${p.stats
                .slice(0, 4)
                .map(
                  (s) => `<div class="rounded-lg border border-slate-800/70 bg-slate-900/50 px-2 py-2 text-center">
                <div class="text-sm font-bold text-white">${esc(s.value)}</div><div class="text-[10px] text-slate-500">${esc(s.label)}</div></div>`,
                )
                .join("")}</div>`
            : ""
        }
        <div class="mt-5 flex flex-wrap gap-1.5">${chips(p.tech, 5)}</div>
        <div class="mt-auto pt-5 flex items-center gap-4">${p.links.map((l) => storeBadge(data, l)).join("")}</div>
      </div>
    </a>`;
  }

  function gridCard(data, p) {
    const shots = p.screenshots || [];
    let peek = "";
    if (shots.length && p.orientation === "portrait") {
      const [a, b, c] = [shots[1] || shots[0], shots[0], shots[2] || shots[0]];
      const img = (s, cls) =>
        `<img src="${esc(s)}" alt="" loading="lazy" class="${cls} w-auto rounded-xl border border-white/10 shadow-xl shadow-black/50" />`;
      peek = `<div class="p-peek relative mt-5 -mb-10 h-40">
        <span class="absolute left-1/2 top-7 -translate-x-[108%] -rotate-6">${img(a, "h-48")}</span>
        <span class="absolute left-1/2 top-7 translate-x-[8%] rotate-6">${img(c, "h-48")}</span>
        <span class="absolute left-1/2 top-0 -translate-x-1/2 z-10">${img(b, "h-52")}</span>
      </div>`;
    } else if (shots.length) {
      peek = `<div class="p-peek mt-5 -mb-10 h-36 overflow-hidden">
        <img src="${esc(shots[0])}" alt="" loading="lazy" class="w-full rounded-xl border border-white/5 shadow-lg shadow-black/40" /></div>`;
    }
    return `<a href="${detailUrl(p)}" data-type="${esc(p.type)}" class="p-card p-grid-enter group rounded-2xl overflow-hidden flex flex-col" style="--accent:${esc(p.accent)}">
      <div class="relative p-6 pb-0 flex flex-col">
        <div class="flex items-start justify-between gap-3">
          ${appIcon(p)}
          ${statusBadge(data, p)}
        </div>
        <h3 class="mt-4 text-[17px] font-bold text-white leading-snug">${esc(p.shortName || p.name)}</h3>
        <p class="mt-0.5 text-[11px] font-semibold uppercase tracking-wider accent-text">${esc(p.category)}</p>
        <p class="mt-2.5 text-sm text-slate-400 leading-relaxed clamp-2">${esc(p.tagline)}</p>
        ${peek}
      </div>
      <div class="relative z-20 mt-auto border-t border-slate-800/70 bg-slate-950/80 backdrop-blur px-6 py-4">
        <div class="flex flex-wrap gap-1.5">${chips(p.tech, 3)}</div>
        <div class="mt-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">${
            p.links.length
              ? p.links.map((l) => storeBadge(data, l)).join("")
              : `<span class="text-[11px] text-slate-500">${esc(p.platforms.join(" · "))}</span>`
          }</div>
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 shrink-0">Details<i data-lucide="arrow-up-right" class="p-arrow w-3.5 h-3.5"></i></span>
        </div>
      </div>
    </a>`;
  }

  async function renderSection() {
    const root = document.getElementById("portfolio-app");
    if (!root) return;
    let data;
    try {
      data = await load();
    } catch (err) {
      console.error(err);
      root.innerHTML = `<p class="text-center text-slate-500 text-sm">Portfolio couldn't load. Serve the site over http (see README) rather than opening the file directly.</p>`;
      return;
    }
    const all = data.projects;
    const live = all.filter((p) => p.status === "live");
    const storesUsed = new Set(all.flatMap((p) => p.links.map((l) => l.store)));
    const platforms = new Set(all.flatMap((p) => p.platforms));
    const countBy = (t) => all.filter((p) => p.type === t).length;

    const statTiles = [
      { n: all.length, label: "Products Built", icon: "boxes" },
      { n: live.length, label: "Live in Stores", icon: "rocket" },
      { n: storesUsed.size, label: "Storefronts", icon: "store" },
      { n: platforms.size, label: "Platforms", icon: "monitor-smartphone" },
    ];

    const tabs = [{ key: "all", label: "All", n: all.length }].concat(
      Object.entries(data.types)
        .map(([key, t]) => ({ key, label: t.label, n: countBy(key), icon: t.icon }))
        .filter((t) => t.n),
    );

    root.innerHTML = `
      <div class="reveal in-view grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        ${statTiles
          .map(
            (s) => `<div class="glass-card rounded-2xl px-5 py-5 flex items-center gap-4">
            <span class="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0"><i data-lucide="${s.icon}" class="w-5 h-5 text-indigo-400"></i></span>
            <span class="flex flex-col"><span class="text-2xl md:text-3xl font-extrabold text-white tabular-nums" data-count="${s.n}">${s.n}</span><span class="text-xs text-slate-400">${s.label}</span></span>
          </div>`,
          )
          .join("")}
      </div>

      <div class="reveal in-view mt-6 flex flex-wrap items-center justify-center gap-3">
        ${[...storesUsed]
          .map((k) => {
            const s = data.stores[k];
            if (!s) return "";
            const n = all.filter((p) => p.links.some((l) => l.store === k)).length;
            return `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="store-badge inline-flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/60 pl-3 pr-4 py-2 text-sm text-slate-300">
              ${storeMark(k, "w-4 h-4")}<span class="font-semibold text-white">${esc(s.label)}</span><span class="text-slate-500">${n}</span></a>`;
          })
          .join("")}
      </div>

      <div class="mt-16">
        <div class="flex items-center gap-3 mb-6"><i data-lucide="sparkles" class="w-4 h-4 text-indigo-400"></i>
          <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Spotlight</h3>
          <span class="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent"></span></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${all.filter((p) => p.featured).map((p) => spotlightCard(data, p)).join("")}
        </div>
      </div>

      <div class="mt-20">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
          <div class="flex items-center gap-3"><i data-lucide="layout-grid" class="w-4 h-4 text-indigo-400"></i>
            <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-slate-300 whitespace-nowrap">Everything we've built</h3></div>
          <div role="tablist" aria-label="Filter projects" class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:ml-auto">
            ${tabs
              .map(
                (t, i) => `<button role="tab" data-filter="${t.key}" aria-selected="${i === 0}" class="p-tab shrink-0 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white">
                ${t.icon ? `<i data-lucide="${t.icon}" class="w-3.5 h-3.5"></i>` : ""}${esc(t.label)}<span class="text-xs text-slate-500">${t.n}</span></button>`,
              )
              .join("")}
          </div>
        </div>
        <div id="portfolio-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"></div>
      </div>`;

    const grid = root.querySelector("#portfolio-grid");
    const show = (filter) => {
      const list = filter === "all" ? all : all.filter((p) => p.type === filter);
      grid.innerHTML = list.map((p) => gridCard(data, p)).join("");
      grid.querySelectorAll(".p-grid-enter").forEach((el, i) => (el.style.animationDelay = Math.min(i * 40, 400) + "ms"));
      icons();
    };
    root.querySelectorAll("[data-filter]").forEach((btn) =>
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        show(btn.dataset.filter);
      }),
    );
    show("all");
    countUp(root);
    icons();
  }

  // ---------- project.html: details page ----------

  function heroVisual(p) {
    const shots = p.screenshots || [];
    if (p.orientation === "portrait" && shots.length >= 3) {
      return `<div class="fan relative flex justify-center items-end h-[460px] sm:h-[540px]">
        <div class="phone absolute w-[46%] max-w-[230px] bottom-6" style="transform:translateX(-62%) rotate(-7deg)"><img src="${esc(shots[1])}" alt="" /></div>
        <div class="phone absolute w-[46%] max-w-[230px] bottom-6" style="transform:translateX(62%) rotate(7deg)"><img src="${esc(shots[2])}" alt="" /></div>
        <div class="phone relative z-10 w-[52%] max-w-[260px]"><img src="${esc(shots[0])}" alt="${esc(p.name)} screenshot" /></div>
      </div>`;
    }
    const img = coverOf(p) || shots[0];
    if (!img) {
      return `<div class="browser aspect-[16/10] flex items-center justify-center" style="background:radial-gradient(circle at 30% 20%,color-mix(in srgb,var(--accent) 35%,transparent),#0f172a 70%)">
        ${appIcon(p, "w-28 h-28", "rounded-3xl")}</div>`;
    }
    // browser chrome only makes sense for extensions / web apps
    const chrome =
      p.type === "extension" || p.type === "saas"
        ? `<div class="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800"><span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span><span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span><span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span></div>`
        : "";
    return `<div class="browser">${chrome}<img src="${esc(img)}" alt="${esc(p.name)} artwork" class="w-full block" /></div>`;
  }

  async function renderProject() {
    const root = document.getElementById("project-app");
    const id = new URLSearchParams(location.search).get("id");
    let data;
    try {
      data = await load();
    } catch (err) {
      console.error(err);
      root.innerHTML = notFound("The portfolio data couldn't load. Serve the site over http rather than opening the file directly.");
      icons();
      return;
    }
    const idx = data.projects.findIndex((x) => x.id === id);
    if (idx < 0) {
      root.innerHTML = notFound("We couldn't find that project.");
      icons();
      return;
    }
    const p = data.projects[idx];
    const type = data.types[p.type] || {};
    const status = data.statuses[p.status] || { label: p.status };
    const cover = coverOf(p);
    const shots = p.screenshots || [];
    const prev = data.projects[(idx - 1 + data.projects.length) % data.projects.length];
    const next = data.projects[(idx + 1) % data.projects.length];
    const related = data.projects.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 3);

    document.title = `${p.name} | Nadesoft Portfolio`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", p.summary);
    document.documentElement.style.setProperty("--accent", p.accent);

    const shotW = p.orientation === "portrait" ? "w-[200px] sm:w-[230px]" : "w-[320px] sm:w-[520px]";

    root.innerHTML = `
    <section class="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden" style="--accent:${esc(p.accent)}">
      <div class="hero-backdrop">${cover || shots[0] ? `<img src="${esc(cover || shots[0])}" alt="" />` : ""}</div>
      <div class="absolute inset-0 bg-grid pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-6 lg:px-8">
        <nav class="reveal in-view flex items-center gap-2 text-xs text-slate-400 mb-10" aria-label="Breadcrumb">
          <a href="index.html#portfolio" class="hover:text-white transition-colors">Portfolio</a><i data-lucide="chevron-right" class="w-3 h-3"></i>
          <span>${esc(type.label || p.type)}</span><i data-lucide="chevron-right" class="w-3 h-3"></i>
          <span class="text-slate-200">${esc(p.shortName || p.name)}</span>
        </nav>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div class="reveal in-view">
            <div class="flex items-center gap-5">
              ${appIcon(p, "w-20 h-20 md:w-24 md:h-24", "rounded-[1.6rem]")}
              <div class="flex flex-col gap-2">
                <div class="flex flex-wrap gap-2">${statusBadge(data, p)}
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300"><i data-lucide="${esc(type.icon || "box")}" class="w-3 h-3"></i>${esc(type.singular || p.type)}</span>
                </div>
                <span class="text-xs font-semibold uppercase tracking-[0.16em] accent-text">${esc(p.category)}</span>
              </div>
            </div>
            <h1 class="mt-8 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">${esc(p.name)}</h1>
            <p class="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">${esc(p.tagline)}</p>
            <p class="mt-4 text-sm text-slate-400 leading-relaxed max-w-xl">${esc(p.summary)}</p>
            <div class="mt-8 flex flex-wrap gap-3">
              ${
                p.links.length
                  ? p.links.map((l) => storeBadge(data, l, true)).join("")
                  : `<span class="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3.5 text-sm font-semibold text-slate-300"><i data-lucide="hourglass" class="w-4 h-4 accent-text"></i>${p.status === "coming-soon" ? "Launching soon" : "Currently in development"}</span>`
              }
            </div>
            <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              ${p.platforms.map((pl) => `<span class="inline-flex items-center gap-1.5"><i data-lucide="${platformIcon(pl)}" class="w-3.5 h-3.5"></i>${esc(pl)}</span>`).join("")}
            </div>
          </div>
          <div class="reveal in-view" style="animation-delay:.1s">${heroVisual(p)}</div>
        </div>
      </div>
    </section>

    ${
      p.stats && p.stats.length
        ? `<section class="relative border-y border-slate-800/60 bg-slate-950/60" style="--accent:${esc(p.accent)}">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-${Math.min(p.stats.length, 4)} gap-6">
          ${p.stats
            .map(
              (s) => `<div class="text-center md:text-left"><div class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">${esc(s.value)}</div>
            <div class="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">${esc(s.label)}</div></div>`,
            )
            .join("")}
        </div></section>`
        : ""
    }

    ${
      shots.length
        ? `<section class="relative py-20" style="--accent:${esc(p.accent)}">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="flex items-end justify-between gap-4 mb-8">
            <div><span class="text-xs font-bold uppercase tracking-[0.2em] accent-text">Gallery</span>
              <h2 class="mt-2 text-2xl md:text-3xl font-extrabold text-white tracking-tight">Screenshots</h2></div>
            <div class="flex gap-2">
              <button data-scroll="-1" aria-label="Scroll screenshots left" class="w-10 h-10 rounded-full border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center justify-center"><i data-lucide="arrow-left" class="w-4 h-4"></i></button>
              <button data-scroll="1" aria-label="Scroll screenshots right" class="w-10 h-10 rounded-full border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center justify-center"><i data-lucide="arrow-right" class="w-4 h-4"></i></button>
            </div>
          </div>
          <div id="gallery" class="gallery flex gap-5 overflow-x-auto pb-6">
            ${shots
              .map(
                (s, i) => `<button data-shot="${i}" class="shrink-0 ${shotW} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl" aria-label="Open screenshot ${i + 1}">
              <img src="${esc(s)}" alt="${esc(p.shortName || p.name)} screenshot ${i + 1}" loading="lazy" class="w-full rounded-2xl border border-slate-800" /></button>`,
              )
              .join("")}
          </div>
        </div></section>`
        : ""
    }

    <section class="relative ${shots.length ? "pb-24" : "py-20"}" style="--accent:${esc(p.accent)}">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <span class="text-xs font-bold uppercase tracking-[0.2em] accent-text">Overview</span>
          <h2 class="mt-2 text-2xl md:text-3xl font-extrabold text-white tracking-tight">About the project</h2>
          <div class="mt-6 space-y-4 text-slate-300 leading-relaxed">${p.description.map((d) => `<p>${esc(d)}</p>`).join("")}</div>

          <h2 class="mt-16 text-2xl md:text-3xl font-extrabold text-white tracking-tight">Key features</h2>
          <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${p.highlights
              .map(
                (h) => `<div class="p-card rounded-2xl p-6" style="--accent:${esc(p.accent)}">
              <span class="w-11 h-11 rounded-xl border accent-bg-soft flex items-center justify-center"><i data-lucide="${esc(h.icon || "check")}" class="w-5 h-5 accent-text"></i></span>
              <h3 class="mt-4 font-bold text-white">${esc(h.title)}</h3>
              <p class="mt-2 text-sm text-slate-400 leading-relaxed">${esc(h.text)}</p></div>`,
              )
              .join("")}
          </div>
        </div>

        <aside class="space-y-6 lg:sticky lg:top-28 self-start">
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Project facts</h3>
            <dl class="mt-5 space-y-4 text-sm">
              ${fact("Type", type.singular || p.type)}
              ${fact("Category", p.category)}
              ${fact("Platforms", p.platforms.join(", "))}
              ${fact("Status", status.label)}
              ${p.links.length ? fact("Available on", p.links.map((l) => (data.stores[l.store] || {}).label || "Link").join(", ")) : ""}
            </dl>
          </div>
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><i data-lucide="cpu" class="w-3.5 h-3.5"></i>Tech stack</h3>
            <div class="mt-4 flex flex-wrap gap-2">${p.tech.map((t) => `<span class="p-chip rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200">${esc(t)}</span>`).join("")}</div>
          </div>
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i>Skills applied</h3>
            <ul class="mt-4 space-y-2.5">${p.skills.map((s) => `<li class="flex items-start gap-2.5 text-sm text-slate-300"><i data-lucide="check" class="w-4 h-4 mt-0.5 shrink-0 accent-text"></i>${esc(s)}</li>`).join("")}</ul>
          </div>
          <div class="rounded-2xl p-6 border accent-bg-soft">
            <h3 class="font-bold text-white">Want something like this?</h3>
            <p class="mt-2 text-sm text-slate-300">We design, build, ship and maintain products like ${esc(p.shortName || p.name)} for founders and teams.</p>
            <a href="index.html#contact" class="accent-btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold">Book a technical call<i data-lucide="arrow-up-right" class="w-4 h-4"></i></a>
          </div>
        </aside>
      </div>
    </section>

    ${
      related.length
        ? `<section class="relative py-20 border-t border-slate-800/60">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="flex items-end justify-between gap-4 mb-8">
            <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">More ${esc((type.label || "projects").toLowerCase())}</h2>
            <a href="index.html#portfolio" class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">View all<i data-lucide="arrow-right" class="w-4 h-4"></i></a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${related.map((r) => gridCard(data, r)).join("")}</div>
        </div></section>`
        : ""
    }

    <section class="border-t border-slate-800/60">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 divide-x divide-slate-800/60">
        ${navLink(prev, "Previous", "arrow-left", false)}
        ${navLink(next, "Next", "arrow-right", true)}
      </div>
    </section>

    <div id="lightbox" hidden class="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Screenshot viewer">
      <button data-lb="close" aria-label="Close" class="absolute top-4 right-4 w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center"><i data-lucide="x" class="w-5 h-5"></i></button>
      <button data-lb="-1" aria-label="Previous screenshot" class="absolute left-2 sm:left-6 w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
      <img id="lightbox-img" src="" alt="" class="max-h-[88vh] max-w-[92vw] rounded-2xl shadow-2xl" />
      <button data-lb="1" aria-label="Next screenshot" class="absolute right-2 sm:right-6 w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
      <span id="lightbox-count" class="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-slate-400"></span>
    </div>`;

    wireGallery(p);
    icons();
  }

  function fact(label, value) {
    return `<div class="flex justify-between gap-4"><dt class="text-slate-500">${esc(label)}</dt><dd class="text-right font-medium text-slate-200">${esc(value)}</dd></div>`;
  }

  function platformIcon(pl) {
    const k = pl.toLowerCase();
    if (k.includes("android") || k.includes("ios")) return "smartphone";
    if (k.includes("windows")) return "monitor";
    if (k.includes("chrome")) return "globe";
    if (k.includes("vs code")) return "code";
    return "globe";
  }

  function navLink(p, label, icon, right) {
    return `<a href="${detailUrl(p)}" class="group flex items-center gap-4 py-8 ${right ? "justify-end text-right pl-6" : "pr-6"}" style="--accent:${esc(p.accent)}">
      ${right ? "" : `<i data-lucide="${icon}" class="w-5 h-5 text-slate-500 group-hover:-translate-x-1 transition-transform"></i>`}
      <div class="min-w-0"><div class="text-[11px] uppercase tracking-[0.2em] text-slate-500">${label}</div>
        <div class="mt-1 font-bold text-white truncate group-hover:text-indigo-300 transition-colors">${esc(p.shortName || p.name)}</div></div>
      ${appIcon(p, "w-11 h-11 hidden sm:block", "rounded-xl")}
      ${right ? `<i data-lucide="${icon}" class="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform"></i>` : ""}
    </a>`;
  }

  function notFound(msg) {
    return `<section class="min-h-[70vh] flex items-center justify-center px-6 pt-32 pb-20 text-center">
      <div><i data-lucide="search-x" class="w-10 h-10 text-indigo-400 mx-auto"></i>
        <h1 class="mt-6 text-3xl font-extrabold text-white">${esc(msg)}</h1>
        <a href="index.html#portfolio" class="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back to portfolio</a></div>
    </section>`;
  }

  function wireGallery(p) {
    const shots = p.screenshots || [];
    const gallery = document.getElementById("gallery");
    if (!gallery) return;
    document.querySelectorAll("[data-scroll]").forEach((b) =>
      b.addEventListener("click", () => gallery.scrollBy({ left: Number(b.dataset.scroll) * gallery.clientWidth * 0.8, behavior: "smooth" })),
    );
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const count = document.getElementById("lightbox-count");
    let cur = 0;
    const open = (i) => {
      cur = (i + shots.length) % shots.length;
      img.src = shots[cur];
      img.alt = `${p.shortName || p.name} screenshot ${cur + 1}`;
      count.textContent = `${cur + 1} / ${shots.length}`;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = "";
    };
    gallery.querySelectorAll("[data-shot]").forEach((b) => b.addEventListener("click", () => open(Number(b.dataset.shot))));
    lb.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lb]");
      if (btn) return btn.dataset.lb === "close" ? close() : open(cur + Number(btn.dataset.lb));
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") open(cur + 1);
      if (e.key === "ArrowLeft") open(cur - 1);
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) open(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  window.Portfolio = { renderSection, renderProject };
})();
