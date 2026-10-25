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

  /* ── flatten entries ── */
  var entries = [];
  J.acts.forEach(function (act) {
    act.entries.forEach(function (e) { e._act = act; entries.push(e); });
  });

  /* ── route: the red line, leg by leg (see `route` in journal.js) ── */
  var M = J.map, P = J.places, R = J.route || [];
  var START = R.length ? firstPlace() : null;
  function firstPlace() { for (var i = 0; i < entries.length; i++) if (entries[i].place) return entries[i].place; return null; }
  var legOf = {};                       // place id -> index of the leg that arrives there
  R.forEach(function (leg, i) { if (!(leg.to in legOf)) legOf[leg.to] = i; });
  var stops = [START].concat(R.map(function (l) { return l.to; }));   // numbered stops, in order
  var entryLeg = entries.map(function (e) { return e.place in legOf ? legOf[e.place] : -1; });
  function pt(id) { return P[id]; }
  function legPoints(i) {
    var from = i === 0 ? pt(START) : pt(R[i - 1].to);
    return [from].concat(R[i].via.map(function (v) { return { x: v[0], y: v[1] }; }), [pt(R[i].to)]);
  }
  function routeUpTo(n) {               // all points from the start through leg n
    var pts = [pt(START)];
    for (var i = 0; i <= n && i < R.length; i++) pts = pts.concat(legPoints(i).slice(1));
    return pts;
  }

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
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function firstEntryAt(id) { for (var i = 0; i < entries.length; i++) if (entries[i].place === id) return i; return -1; }

  /* One SVG builder for every view of the chart. kind: "big" | "mini" | "full" */
  function mapSVG(kind) {
    var w = M.width, h = M.height, parts = [];
    parts.push('<svg class="map-svg map-' + kind + '" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="Chart of the Black Loch with the bois\' route">');
    parts.push('<image href="' + M.image + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/>');
    (M.labels || []).forEach(function (l) {
      parts.push('<text class="map-label ' + (l.cls || "") + '" x="' + l.x + '" y="' + l.y + '" font-size="' + (l.size || 12) + '">' + esc(l.text) + "</text>");
    });
    if (kind !== "mini") parts.push('<path class="route-shadow" d="' + smoothPath(routeUpTo(R.length - 1)) + '"/>');
    parts.push('<path class="route" data-route d="' + smoothPath(kind === "mini" ? [pt(START)] : routeUpTo(R.length - 1)) + '"/>');
    stops.forEach(function (id, n) {
      var p = pt(id); if (!p) return;
      parts.push('<g class="stop' + (kind === "mini" ? "" : " visited") + '" data-place="' + id + '" tabindex="' + (kind === "mini" ? -1 : 0) + '" role="link" aria-label="' + (n + 1) + ". " + esc(p.name) + '">' +
        "<title>" + (n + 1) + ". " + esc(p.name) + "</title>" +
        '<circle class="ring" cx="' + p.x + '" cy="' + p.y + '" r="10"/>' +
        '<circle class="dot" cx="' + p.x + '" cy="' + p.y + '" r="10"/>' +
        '<text class="num" x="' + p.x + '" y="' + (p.y + 4) + '">' + (n + 1) + "</text></g>");
    });
    parts.push("</svg>");
    var wrap = document.createElement("div");
    wrap.innerHTML = parts.join("");
    return wrap.firstChild;
  }
  function goToPlace(id) {
    var i = firstEntryAt(id), target = document.getElementById("entry-" + i);
    closeFullMap();
    if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }
  function wireStops(svg) {
    svg.querySelectorAll(".stop").forEach(function (n) {
      n.addEventListener("click", function () { goToPlace(n.getAttribute("data-place")); });
      n.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); goToPlace(n.getAttribute("data-place")); } });
    });
  }

  // the big chart + its numbered legend
  var bigSvg = mapSVG("big"); $("#big-chart").appendChild(bigSvg); wireStops(bigSvg);
  var legend = $("#chart-legend");
  stops.forEach(function (id, n) {
    var i = firstEntryAt(id), li = el("li", null,
      '<button type="button"><span class="n">' + (n + 1) + '</span><span class="nm">' + esc(P[id].name) + "</span>" +
      (i >= 0 && entries[i].title !== P[id].name ? '<span class="ev">' + entries[i].title + "</span>" : "") + "</button>");
    li.querySelector("button").addEventListener("click", function () { goToPlace(id); });
    legend.appendChild(li);
  });
  $("#chart-credit").textContent = M.credit || "";

  // full-screen chart (pannable on small screens)
  var fullMap = $("#full-map"), fullHost = $("#full-map-svg"), lastMapFocus = null;
  var fullSvg = mapSVG("full"); fullHost.appendChild(fullSvg); wireStops(fullSvg);
  function openFullMap() { lastMapFocus = document.activeElement; fullMap.hidden = false; document.body.style.overflow = "hidden"; $(".close", fullMap).focus(); }
  function closeFullMap() { if (fullMap.hidden) return; fullMap.hidden = true; document.body.style.overflow = ""; if (lastMapFocus) lastMapFocus.focus(); }
  $("#open-full-map").addEventListener("click", openFullMap);
  $(".close", fullMap).addEventListener("click", closeFullMap);
  fullMap.addEventListener("click", function (ev) { if (ev.target === fullMap) closeFullMap(); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeFullMap(); });

  // the mini chart that follows the reader
  var miniSvg = mapSVG("mini"); $("#mini-chart-svg").appendChild(miniSvg); wireStops(miniSvg);

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

  /* ── dossier: the web around Suvresk ── */
  if (J.dossier) {
    $("#dossier-title").textContent = J.dossier.title;
    $("#dossier-sub").textContent = J.dossier.subtitle;
    var dgrid = $("#dossier-grid"), names = {};
    J.dossier.cards.forEach(function (c) { names[c.id] = c.name; });
    J.dossier.cards.forEach(function (c, i) {
      var card = el("article", "dossier-card parch-wrap reveal",
        '<span class="pin" aria-hidden="true"></span><div class="parchment">' +
        "<h3>" + c.name + "</h3>" +
        '<p class="role">' + c.role + "</p>" +
        "<p>" + c.text + "</p>" +
        (c.ties && c.ties.length ? '<div class="ties"><span class="lbl">Tied to</span>' +
          c.ties.map(function (t) { return '<a href="#dossier-' + t + '" data-tie="' + t + '">' + (names[t] || t) + "</a>"; }).join("") + "</div>" : "") +
        (c.source ? '<p class="source">Learned from: ' + c.source + "</p>" : "") +
        "</div>");
      card.id = "dossier-" + c.id;
      card.style.setProperty("--tilt", ((rng(i + 300)() - .5) * 1.8).toFixed(2) + "deg");
      card.querySelector(".parchment").style.clipPath = tornEdge(700 + i * 11);
      dgrid.appendChild(card);
    });
    dgrid.addEventListener("click", function (ev) {
      var a = ev.target.closest("a[data-tie]"); if (!a) return;
      ev.preventDefault();
      var t = document.getElementById("dossier-" + a.getAttribute("data-tie"));
      if (!t) return;
      t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    });
  }

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

  /* ── mini chart follows the reader: draws the route so far and glides to the current stop ── */
  var mini = $("#mini-chart"), miniPlace = $("#mini-place"), miniRoute = miniSvg.querySelector("[data-route]");
  var VIEW_W = 380, VIEW_H = 270, view = null, viewAnim = null;
  function targetView(p) {
    var x = Math.min(Math.max(p.x - VIEW_W / 2, 0), M.width - VIEW_W);
    var y = Math.min(Math.max(p.y - VIEW_H / 2, 0), M.height - VIEW_H);
    return [x, y, VIEW_W, VIEW_H];
  }
  function setView(v) { view = v; miniSvg.setAttribute("viewBox", v.map(function (n) { return n.toFixed(1); }).join(" ")); }
  function glideTo(v) {
    if (!view || reduceMotion) { setView(v); return; }
    var from = view.slice(), t0 = null;
    if (viewAnim) cancelAnimationFrame(viewAnim);
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 700), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setView(from.map(function (a, j) { return a + (v[j] - a) * e; }));
      if (k < 1) viewAnim = requestAnimationFrame(step);
    }
    viewAnim = requestAnimationFrame(step);
  }
  function setActive(i) {
    var e = entries[i]; if (!e || !e.place || !pt(e.place)) return;
    var leg = entryLeg[i];
    miniRoute.setAttribute("d", smoothPath(leg < 0 ? [pt(START)] : routeUpTo(leg)));
    var reached = {}; reached[START] = 1;
    for (var k = 0; k <= leg; k++) reached[R[k].to] = 1;
    miniSvg.querySelectorAll(".stop").forEach(function (n) {
      var id = n.getAttribute("data-place");
      n.classList.toggle("visited", !!reached[id]);
      n.classList.toggle("future", !reached[id]);
      n.classList.toggle("active", id === e.place);
    });
    miniPlace.textContent = placeName(e.place) || "The Black Loch";
    glideTo(targetView(pt(e.place)));
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
