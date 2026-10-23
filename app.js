/* Builds the journal page from window.JOURNAL (journal.js). No build step, no libraries. */
(function () {
  "use strict";
  var J = window.JOURNAL;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  /* ── small helpers ── */
  function rng(seed) { // mulberry32: stable "random" per entry so torn edges don't change between visits
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function tornEdge(seed) {
    var r = rng(seed), pts = [], i, n = 22, j = 1.1;
    for (i = 0; i <= n; i++) pts.push((i / n * 100).toFixed(2) + "% " + (r() * j).toFixed(2) + "%");
    for (i = 1; i <= n; i++) pts.push((100 - r() * j).toFixed(2) + "% " + (i / n * 100).toFixed(2) + "%");
    for (i = n - 1; i >= 0; i--) pts.push((i / n * 100).toFixed(2) + "% " + (100 - r() * j).toFixed(2) + "%");
    for (i = n - 1; i >= 1; i--) pts.push((r() * j).toFixed(2) + "% " + (i / n * 100).toFixed(2) + "%");
    return "polygon(" + pts.join(",") + ")";
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function placeName(id) { return (J.places[id] && J.places[id].name) || ""; }
  function meta(entry) {
    var bits = [];
    if (entry.date) bits.push('<span class="date">' + entry.date + "</span>");
    if (entry.place) bits.push('<span class="place">' + placeName(entry.place) + "</span>");
    return '<div class="meta">' + bits.join("") + "</div>";
  }

  /* ── hero ── */
  $("#hero-kicker").textContent = J.year;
  $("#hero-title").textContent = J.title;
  $("#hero-sub").textContent = J.subtitle;
  $("#hero-book").textContent = J.book;

  /* ── flatten entries + route ── */
  var entries = [], route = [], entryRoute = [];
  J.acts.forEach(function (act) {
    act.entries.forEach(function (e) {
      e._act = act;
      entries.push(e);
      if (e.place && J.places[e.place]) {
        if (!route.length || route[route.length - 1].place !== e.place) route.push({ place: e.place, entry: entries.length - 1 });
      }
      entryRoute.push(route.length - 1);
    });
  });

  /* ── chart ── */
  function smoothPath(points) {
    if (!points.length) return "";
    if (points.length === 1) return "M" + points[0].x + " " + points[0].y;
    var d = "M" + points[0].x + " " + points[0].y;
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i - 1] || points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C" + c1x.toFixed(1) + " " + c1y.toFixed(1) + "," + c2x.toFixed(1) + " " + c2y.toFixed(1) + "," + p2.x + " " + p2.y;
    }
    return d;
  }
  function routePoints(upTo) {
    return route.slice(0, upTo + 1).map(function (r) { return J.places[r.place]; });
  }
  var islandPlaces = ["charwall", "kaliphex-isle", "delaro", "shuushar-isle"];
  function islandBlob(p, seed) {
    var r = rng(seed), d = "", n = 9, i;
    for (i = 0; i <= n; i++) {
      var a = i / n * Math.PI * 2, rad = 20 + r() * 12;
      var x = (p.x + Math.cos(a) * rad * 1.4).toFixed(1), y = (p.y + 6 + Math.sin(a) * rad * .8).toFixed(1);
      d += (i ? " L" : "M") + x + " " + y;
    }
    return d + " Z";
  }
  function chartSVG(kind) {
    var ns = "http://www.w3.org/2000/svg";
    var parts = [];
    parts.push('<svg class="chart-svg" viewBox="0 0 1000 700" role="img" aria-label="Rough chart of the bois\' route through the Black Loch">');
    // the river from Wave Echo
    parts.push('<path d="M110 70 C140 120,120 150,175 175 S210 230,250 270" fill="none" stroke="rgba(60,40,15,.5)" stroke-width="10" stroke-linecap="round" opacity=".35"/>');
    // the loch
    parts.push('<path class="loch" d="M250 270 C330 190,520 120,640 105 C770 92,915 190,945 330 C975 460,905 525,760 565 C640 600,520 645,380 655 C250 665,85 690,62 600 C45 520,140 470,200 420 C250 378,200 320,250 270 Z"/>');
    parts.push('<text class="loch-label" x="430" y="400">THE BLACK LOCH</text>');
    islandPlaces.forEach(function (id, i) {
      if (J.places[id]) parts.push('<path d="' + islandBlob(J.places[id], 50 + i) + '" fill="rgba(70,48,18,.35)" stroke="rgba(60,40,15,.6)" stroke-width="1.5"/>');
    });
    // compass
    parts.push('<g class="compass" transform="translate(905 620)"><circle r="34" fill="none" stroke="rgba(60,40,15,.5)"/><path d="M0 -44 L7 0 L0 44 L-7 0 Z" fill="rgba(60,40,15,.55)"/><path d="M-44 0 L0 -6 L44 0 L0 6 Z" fill="rgba(60,40,15,.3)"/><text y="-50" text-anchor="middle">N</text></g>');
    // route
    parts.push('<path class="route-ghost" d="' + smoothPath(routePoints(route.length - 1)) + '"/>');
    parts.push('<path class="route" data-route d="' + smoothPath(routePoints(kind === "big" ? route.length - 1 : 0)) + '"/>');
    // nodes (each place once, in first-visit order)
    var seen = {};
    route.forEach(function (r) {
      if (seen[r.place]) return; seen[r.place] = 1;
      var p = J.places[r.place], left = p.x > 700;
      parts.push('<g class="node' + (kind === "big" ? " visited" : "") + '" data-place="' + r.place + '" tabindex="0" role="link" aria-label="' + p.name + '">' +
        '<circle class="ring" cx="' + p.x + '" cy="' + p.y + '" r="9"/>' +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="9"/>' +
        '<text x="' + (p.x + (left ? -16 : 16)) + '" y="' + (p.y + 6) + '" text-anchor="' + (left ? "end" : "start") + '">' + p.name + "</text></g>");
    });
    parts.push("</svg>");
    var wrap = document.createElement("div");
    wrap.innerHTML = parts.join("");
    return wrap.firstChild;
  }
  function goToPlace(id) {
    for (var i = 0; i < entries.length; i++) if (entries[i].place === id) {
      var target = document.getElementById("entry-" + i);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return;
    }
  }
  function wireNodes(svg) {
    svg.querySelectorAll(".node").forEach(function (n) {
      n.addEventListener("click", function () { goToPlace(n.getAttribute("data-place")); });
      n.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); goToPlace(n.getAttribute("data-place")); } });
    });
  }
  var bigSvg = chartSVG("big"); $("#big-chart").appendChild(bigSvg); wireNodes(bigSvg);
  var miniSvg = chartSVG("mini"); $("#mini-chart-svg").appendChild(miniSvg); wireNodes(miniSvg);

  /* ── timeline ── */
  var tl = $("#timeline"), sideCount = 0, sceneCount = 0;
  entries.forEach(function (e, i) {
    if (i === 0 || entries[i - 1]._act !== e._act) {
      var a = e._act;
      var head = el("section", "act reveal",
        '<div class="numeral">' + a.numeral + "</div><h2>" + a.title + "</h2>" + (a.subtitle ? "<p>" + a.subtitle + "</p>" : ""));
      tl.appendChild(head);
    }
    var node, tilt = ((rng(i * 7 + 3)() - .5) * 1.4).toFixed(2) + "deg";
    if (e.type === "scene") {
      var flip = sceneCount++ % 2 === 1;
      node = el("article", "entry scene reveal" + (flip ? " flip" : ""));
      var frame = e.img
        ? '<div class="frame" tabindex="0" role="button" aria-label="View painting: ' + e.title + '"><img loading="lazy" src="' + e.img + '" alt="' + (e.alt || e.title) + '"></div>'
        : '<div class="frame pending"><div class="canvas"><div><b>The painter is still at work</b>This scene has not yet been painted.</div></div></div>';
      node.innerHTML = frame +
        '<div class="caption parch-wrap"><div class="parchment">' + meta(e) + "<h3>" + e.title + "</h3><p>" + e.text + "</p></div></div>";
    } else if (e.type === "here") {
      node = el("article", "entry here reveal",
        '<div class="parch-wrap"><div class="parchment"><div class="stamp">WE ARE HERE</div>' + meta(e) + "<h3>" + e.title + "</h3><p>" + e.text + "</p></div></div>");
    } else {
      var side = sideCount++ % 2 === 0 ? "left" : "right";
      node = el("article", "entry side " + side + " " + e.type + " reveal");
      if (e.type === "letter") {
        node.innerHTML = '<div class="parch-wrap"><div class="seal" aria-hidden="true">✶</div><div class="parchment">' + meta(e) + "<h3>" + e.title + "</h3>" +
          '<div class="addr">From ' + e.from + "<br>To " + e.to + "</div>" +
          (e.quotes || []).map(function (q) { return "<blockquote>" + q + "</blockquote>"; }).join("") +
          (e.text ? "<p>" + e.text + "</p>" : "") + "</div></div>";
      } else if (e.type === "sending") {
        node.innerHTML = '<div class="ether">' + meta(e) + "<h3>" + e.title + "</h3>" +
          (e.messages || []).map(function (m) { return '<div class="msg"><span class="who">' + m.from + "</span><p>" + m.text + "</p></div>"; }).join("") + "</div>";
      } else {
        node.innerHTML = '<div class="parch-wrap"><div class="parchment">' + meta(e) + "<h3>" + e.title + "</h3><p>" + e.text + "</p></div></div>";
      }
    }
    node.id = "entry-" + i;
    node.setAttribute("data-index", i);
    if (e.type !== "scene") node.style.setProperty("--tilt", tilt);
    node.querySelectorAll(".parchment").forEach(function (p) { p.style.clipPath = tornEdge(i * 13 + 1); });
    tl.appendChild(node);
  });
  var wet = el("p", "ink-wet reveal", "— the rest of this page is blank —");
  tl.appendChild(wet);

  /* ── ledger ── */
  var grid = $("#ledger-grid");
  J.ledger.forEach(function (card, i) {
    var c = el("div", "ledger-card parch-wrap reveal",
      '<div class="parchment"><h3><span class="icon" aria-hidden="true">' + card.icon + "</span>" + card.title + "</h3><ul>" +
      card.items.map(function (it) { return "<li>" + it + "</li>"; }).join("") + "</ul></div>");
    c.style.setProperty("--tilt", ((rng(i + 99)() - .5) * 1.6).toFixed(2) + "deg");
    c.querySelector(".parchment").style.clipPath = tornEdge(500 + i * 17);
    grid.appendChild(c);
  });

  /* ── reveal on scroll ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add("visible"); ro.unobserve(it.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (r) { ro.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("visible"); });
  }

  /* ── mini chart follows the reader ── */
  var mini = $("#mini-chart"), miniPlace = $("#mini-place"), miniRoute = miniSvg.querySelector("[data-route]");
  function setActive(i) {
    var e = entries[i]; if (!e) return;
    var ri = Math.max(0, entryRoute[i]);
    miniRoute.setAttribute("d", smoothPath(routePoints(ri)));
    var visited = {};
    route.slice(0, ri + 1).forEach(function (r) { visited[r.place] = 1; });
    miniSvg.querySelectorAll(".node").forEach(function (n) {
      var id = n.getAttribute("data-place");
      n.classList.toggle("visited", !!visited[id]);
      n.classList.toggle("active", id === e.place);
    });
    miniPlace.textContent = placeName(e.place) || "The Black Loch";
  }
  setActive(0);
  if ("IntersectionObserver" in window) {
    var ao = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) setActive(+it.target.getAttribute("data-index")); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".entry").forEach(function (n) { ao.observe(n); });
    var so = new IntersectionObserver(function (items) {
      items.forEach(function (it) { mini.classList.toggle("hidden", !it.isIntersecting); });
    }, { rootMargin: "-30% 0px -30% 0px" });
    so.observe(tl);
  }
  var toggle = $("#mini-toggle");
  function setCollapsed(c) {
    mini.classList.toggle("collapsed", c);
    toggle.textContent = c ? "show" : "hide";
    toggle.setAttribute("aria-expanded", String(!c));
    try { localStorage.setItem("bois-mini-collapsed", c ? "1" : "0"); } catch (err) { /* storage unavailable */ }
  }
  var startCollapsed = window.innerWidth < 600;
  try { var saved = localStorage.getItem("bois-mini-collapsed"); if (saved !== null) startCollapsed = saved === "1"; } catch (err) { /* ignore */ }
  setCollapsed(startCollapsed);
  toggle.addEventListener("click", function () { setCollapsed(!mini.classList.contains("collapsed")); });

  /* ── lightbox ── */
  var lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $("p", lb), lastFocus = null;
  function openLb(img, title) {
    lastFocus = document.activeElement;
    lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = title;
    lb.hidden = false; $(".close", lb).focus();
  }
  function closeLb() { lb.hidden = true; lbImg.src = ""; if (lastFocus) lastFocus.focus(); }
  document.querySelectorAll(".frame:not(.pending)").forEach(function (f) {
    var title = f.closest(".entry").querySelector("h3").textContent;
    var img = f.querySelector("img");
    f.addEventListener("click", function () { openLb(img, title); });
    f.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openLb(img, title); } });
  });
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !lb.hidden) closeLb(); });

  /* ── drifting motes ── */
  if (!reduceMotion) {
    var motes = $(".motes"), r = rng(42);
    for (var m = 0; m < 18; m++) {
      var d = el("span", "mote"), size = 2 + r() * 4;
      d.style.left = (r() * 100).toFixed(1) + "%";
      d.style.width = d.style.height = size.toFixed(1) + "px";
      d.style.animationDuration = (16 + r() * 22).toFixed(1) + "s";
      d.style.animationDelay = (-r() * 30).toFixed(1) + "s";
      d.style.setProperty("--drift", ((r() - .5) * 160).toFixed(0) + "px");
      if (r() > .6) { d.style.background = "rgba(190,150,255,.8)"; d.style.boxShadow = "0 0 10px 3px rgba(150,110,240,.45)"; }
      motes.appendChild(d);
    }
  }
})();
