/* E-MECH Solver — app shell and the Quick screen */
"use strict";
(function () {
  var EM = window.EM, Q = EM.Q, esc = EM.esc, $ = function (s, r) { return (r || document).querySelector(s); };
  var store = EM.store;
  var XF = [["none", "None"], ["single", "Single transformer"], ["DD", "Δ–Δ bank"], ["YY", "Y–Y bank"], ["DY", "Δ–Y bank"], ["YD", "Y–Δ bank"], ["OO", "Open-Δ bank"]];
  EM.XF = XF;
  var GROUP_NAMES = { motor: "Motor", power: "Power", "3ph": "Three-phase", ac: "AC waveform & phasors", circ: "Circuit", xf: "Transformer", bank: "Transformer bank", load2: "Bank loading", auto: "Autotransformer", ttr: "Turns-ratio test", harm: "Harmonics", mag: "Faraday", offstd: "Off-standard V / f", curve: "Torque curve", vub: "Voltage unbalance", twospeed: "Two-speed" };
  var GROUP_ORDER = ["motor", "curve", "offstd", "power", "3ph", "bank", "load2", "xf", "auto", "ttr", "harm", "vub", "twospeed", "ac", "circ", "mag"];

  var S = store.get("emech_quick", null) || { ctx: { phase: 3, xf: "none", load: "" }, knowns: [], target: null };
  if (!S.ctx) S.ctx = { phase: 3, xf: "none", load: "" };
  var ui = { ask: null, edit: null, err: "", sugg: [], suggOn: -1, findSugg: [] };
  function save() { store.set("emech_quick", S); }
  EM.quickState = S;

  /* ---------- shared rendering of worked steps ---------- */
  EM.givensOf = function (list) { var g = {}; list.forEach(function (k) { g[k.id] = { v: k.v }; }); return g; };
  EM.md = function (s) { return esc(s).replace(/([A-Za-zτηθφΦ'])_\{([^}]+)\}/g, "$1<sub>$2</sub>").replace(/([A-Za-zτηθφΦ'])_([A-Za-z0-9φ]+)/g, "$1<sub>$2</sub>"); };
  EM.nameHTML = function (id) { return EM.md(Q[id].name); };
  EM.symH = function (id) { return EM.symHTML(Q[id].sym); };
  EM.stepHTML = function (r, known, scale) {
    var f = r.f, q = Q[r.id];
    var rhs = EM.symLine(f).split(" = ").slice(1).join(" = ");
    var h = '<section class="step"><h3>Find the ' + EM.md(q.name.charAt(0).toLowerCase() + q.name.slice(1)) + "</h3>";
    h += '<div class="eq"><span class="l">' + EM.symH(r.id) + ' =</span><span class="r">' + rhs + "</span>";
    if (!f.fn || f.sub) h += '<span class="l">=</span><span class="r">' + EM.subLine(f, known, scale) + "</span>";
    h += '<span class="l">=</span><span class="r res">' + esc(EM.valueText(r.id, r.v, scale, true)) + "</span></div>";
    if (f.note) h += '<p class="note">' + EM.md(f.note) + "</p>";
    return h + "</section>";
  };
  EM.flagHTML = function (kind, title, text) { return '<div class="flag' + (kind === "bad" ? " bad" : "") + '"><b>' + esc(title) + "</b>" + text + "</div>"; };
  EM.conflictHTML = function (list) {
    var hard = list.filter(function (c) { return !c.soft; }), soft = list.filter(function (c) { return c.soft; });
    list = hard.slice(0, 2).concat(soft.slice(0, hard.length ? 0 : 1));
    return list.map(function (c) {
      var sc = EM.scaleFor(c.known), q = Q[c.id];
      var txt = EM.md(q.name) + (c.haveGiven ? " was entered as " + esc(EM.valueText(c.id, c.have, sc)) : " comes out to " + esc(EM.valueText(c.id, c.have, sc)) + " working from your other values") + ", but " + EM.symLine(c.f) + " gives " + esc(EM.valueText(c.id, c.calc, sc)) + ".";
      return c.soft ? EM.flagHTML("warn", "Check", txt + " Textbook problems sometimes list values that don't quite match; the solution uses the values as given.") : EM.flagHTML("bad", "Numbers disagree", txt + " One of your entries may be off, or the question's data is inconsistent.");
    }).join("");
  };

  /* ---------- tabs ---------- */
  var views = EM.views = EM.views || {};
  function showTab(name) {
    document.querySelectorAll(".tabs button").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.tab === name)); });
    document.querySelectorAll("main > section").forEach(function (s) { s.hidden = s.dataset.view !== name; });
    if (views[name] && views[name].render) views[name].render();
    store.set("emech_tab", name);
    window.scrollTo(0, 0);
  }
  EM.showTab = showTab;
  document.querySelectorAll(".tabs button").forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.tab); }); });

  /* ---------- Quick ---------- */
  var root = $("#view-quick");
  root.innerHTML =
    '<div class="grid2">' +
    '<div style="display:flex;flex-direction:column;gap:12px;min-width:0">' +
    '<section class="card"><h2>Setup</h2><div class="settings">' +
    '<div class="seg" role="group" aria-label="Phase"><button type="button" data-phase="3">3φ</button><button type="button" data-phase="1">1φ</button></div>' +
    '<label for="q-xf">Transformer <select id="q-xf">' + XF.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + "</option>"; }).join("") + "</select></label>" +
    '<label for="q-load">Load connection <select id="q-load"><option value="">—</option><option value="Y">Wye (Y)</option><option value="D">Delta (Δ)</option></select></label>' +
    '</div><div class="hint" id="q-ctxhint"></div></section>' +
    '<section class="card"><h2>What you know</h2>' +
    '<form class="entry" id="q-form" autocomplete="off"><input type="text" id="q-in" placeholder="e.g.  V 460   pf 86%   rpm 1755" aria-label="Add a known value" enterkeyhint="done" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="btn primary" type="submit">Add</button><div class="sugg" id="q-sugg" hidden></div></form>' +
    '<div class="hint" id="q-err"></div><div id="q-ask"></div><div class="chips" id="q-chips"></div>' +
    '<div class="row" style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn small ghost" id="q-clear" type="button">Clear all</button><button class="btn small ghost" id="q-example" type="button">Load an example</button></div></section>' +
    '<section class="card"><h2>What do you want to find?</h2>' +
    '<div class="entry"><input type="search" id="q-find" placeholder="Search, e.g. efficiency, slip, I_LR" aria-label="Search for a quantity to find" autocomplete="off"><div class="sugg" id="q-fsugg" hidden></div></div>' +
    '<div id="q-can"></div></section>' +
    "</div>" +
    '<div class="board" id="q-board" aria-live="polite"></div>' +
    "</div>";

  function ctxHint() {
    var t = [];
    if (S.ctx.xf === "single") t.push("Voltages and currents will ask primary or secondary.");
    else if (/^(DD|YY|DY|YD|OO)$/.test(S.ctx.xf)) t.push("Bank mode: voltages and currents ask primary/secondary and line/winding. Winding = phase.");
    else t.push(S.ctx.phase === 3 ? "3φ: a plain voltage or current is read as a line value." : "1φ: a plain voltage or current is the circuit value.");
    return t.join(" ");
  }
  function renderSetup() {
    root.querySelectorAll("[data-phase]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.phase) === S.ctx.phase)); });
    $("#q-xf").value = S.ctx.xf || "none";
    $("#q-load").value = S.ctx.load || "";
    $("#q-ctxhint").textContent = ctxHint();
  }
  root.querySelectorAll("[data-phase]").forEach(function (b) { b.addEventListener("click", function () { S.ctx.phase = Number(b.dataset.phase); save(); renderAll(); }); });
  $("#q-xf").addEventListener("change", function (e) { S.ctx.xf = e.target.value; if (/^(DD|YY|DY|YD|OO)$/.test(S.ctx.xf)) S.ctx.phase = 3; save(); renderAll(); });
  $("#q-load").addEventListener("change", function (e) { S.ctx.load = e.target.value; save(); renderAll(); });

  /* entry */
  var inp = $("#q-in"), sug = $("#q-sugg");
  function showSugg() {
    var list = EM.suggest(inp.value, S.ctx);
    ui.sugg = list;
    if (!list.length || !inp.value.trim() || /^[\s\d.+-]/.test(inp.value)) { sug.hidden = true; return; }
    sug.innerHTML = list.map(function (id, i) { return '<button type="button" data-id="' + id + '" class="' + (i === ui.suggOn ? "on" : "") + '"><span class="sym">' + EM.symH(id) + '</span><span class="nm">' + EM.md(Q[id].name) + "</span></button>"; }).join("");
    sug.hidden = false;
  }
  inp.addEventListener("input", function () { ui.suggOn = -1; ui.err = ""; $("#q-err").textContent = ""; showSugg(); });
  inp.addEventListener("keydown", function (e) {
    if (sug.hidden) return;
    if (e.key === "ArrowDown") { ui.suggOn = Math.min(ui.sugg.length - 1, ui.suggOn + 1); showSugg(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { ui.suggOn = Math.max(-1, ui.suggOn - 1); showSugg(); e.preventDefault(); }
    else if (e.key === "Escape") sug.hidden = true;
    else if ((e.key === "Tab" || e.key === "Enter") && ui.suggOn >= 0) { pickSugg(ui.sugg[ui.suggOn]); e.preventDefault(); }
  });
  function pickSugg(id) {
    var m = inp.value.match(/^\s*([^\d+\-.∠@]*)(.*)$/);
    inp.value = id + " " + (m ? m[2].trim() : "");
    sug.hidden = true; ui.suggOn = -1; inp.focus();
  }
  sug.addEventListener("mousedown", function (e) { e.preventDefault(); });
  sug.addEventListener("click", function (e) { var b = e.target.closest("button[data-id]"); if (b) pickSugg(b.dataset.id); });
  inp.addEventListener("blur", function () { setTimeout(function () { sug.hidden = true; }, 120); });
  $("#q-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var r = EM.parseEntry(inp.value, S.ctx);
    if (r.error) { $("#q-err").textContent = r.error; return; }
    sug.hidden = true;
    if (r.ask && r.ask.length > 1) { ui.ask = { items: r.items, choices: r.ask, raw: r.raw }; inp.value = ""; renderAsk(); return; }
    r.items.forEach(function (it) { addKnown(it.id, it.v, it.assumedUnit || (r.note && it === r.items[0] ? r.note : ""), r.alternatives || []); });
    inp.value = ""; renderAll();
  });
  function addKnown(id, v, note, alts) {
    var i = S.knowns.findIndex(function (k) { return k.id === id; });
    var rec = { id: id, v: v, note: note || "", alts: alts || [] };
    if (i >= 0) S.knowns[i] = rec; else S.knowns.push(rec);
    save();
  }
  EM.addKnown = addKnown;
  function renderAsk() {
    var box = $("#q-ask");
    if (!ui.ask) { box.innerHTML = ""; return; }
    var it = ui.ask.items[0], q = Q[it.id];
    box.innerHTML = '<div class="ask"><div><b>' + esc(EM.withUnit(EM.display(q.dim, it.v).v, EM.display(q.dim, it.v).u)) + "</b> — which one is it?</div><div class=\"opts\">" +
      ui.ask.choices.map(function (id) { return '<button class="btn small" type="button" data-pick="' + id + '"><span class="sym">' + EM.symH(id) + "</span> " + EM.md(Q[id].name) + "</button>"; }).join("") +
      '</div><button class="btn small ghost" type="button" data-pick="">Cancel</button></div>';
  }
  $("#q-ask").addEventListener("click", function (e) {
    var b = e.target.closest("[data-pick]"); if (!b) return;
    if (b.dataset.pick) { var it = ui.ask.items[0]; addKnown(b.dataset.pick, it.v, "", ui.ask.choices.filter(function (c) { return c !== b.dataset.pick; })); }
    ui.ask = null; renderAll(); inp.focus();
  });

  /* chips */
  function chipValue(k) { var sc = EM.scaleFor(EM.closure(EM.givensOf(S.knowns), S.ctx)); return EM.valueText(k.id, k.v, sc, true); }
  function renderChips() {
    var box = $("#q-chips");
    if (!S.knowns.length) { box.innerHTML = '<div class="empty">Nothing yet. Type what the question gives you, one value at a time.</div>'; return; }
    box.innerHTML = S.knowns.map(function (k, i) {
      var q = Q[k.id];
      if (ui.edit === i) return editHTML(k, i);
      return '<div class="chip" role="group"><button type="button" class="chip" style="border:0;padding:0;background:transparent" data-edit="' + i + '" aria-label="Edit ' + esc(q.name) + '"><span class="lab"><span class="nm">' + EM.md(q.name) + '</span><span class="val">' + EM.symH(k.id) + " = " + esc(chipValue(k)) + "</span>" + (k.note ? '<span class="tag">' + esc(k.note) + "</span>" : "") + '</span></button><button type="button" class="x" data-del="' + i + '" aria-label="Remove ' + esc(q.name) + '">×</button></div>';
    }).join("");
  }
  function editHTML(k, i) {
    var q = Q[k.id];
    var alts = (k.alts || []).filter(function (a) { return Q[a] && a !== k.id; });
    if (alts.length < 3) Object.keys(Q).forEach(function (id) { if (alts.length < 10 && id !== k.id && Q[id].dim === q.dim && alts.indexOf(id) < 0 && !Q[id].opts.str) alts.push(id); });
    var d = q.opts.str ? { v: k.v, u: "" } : q.opts.frac ? { v: k.v, u: "" } : EM.display(q.dim, k.v);
    return '<div class="edit"><div class="nm"><b>' + EM.md(q.name) + '</b> <span class="sym">' + EM.symH(k.id) + "</span></div>" +
      '<div style="display:flex;gap:6px;align-items:center"><input type="text" id="q-editv" value="' + esc(typeof d.v === "number" ? +d.v.toPrecision(10) : d.v) + '" aria-label="Value" style="flex:1"><span>' + esc(d.u) + "</span></div>" +
      '<div class="hint">Is this actually something else?</div><div class="findchips">' + alts.map(function (a) { return '<button type="button" data-swap="' + a + '"><span class="sym">' + EM.symH(a) + "</span>" + EM.md(Q[a].name) + "</button>"; }).join("") + "</div>" +
      '<div style="display:flex;gap:6px"><button class="btn small primary" type="button" data-save="' + i + '">Save</button><button class="btn small" type="button" data-cancel="1">Cancel</button><button class="btn small ghost" type="button" data-del="' + i + '">Remove</button></div></div>';
  }
  $("#q-chips").addEventListener("click", function (e) {
    var t = e.target.closest("[data-edit],[data-del],[data-save],[data-cancel],[data-swap]"); if (!t) return;
    if (t.dataset.edit != null) { ui.edit = Number(t.dataset.edit); renderChips(); var ev = $("#q-editv"); if (ev) ev.focus(); return; }
    if (t.dataset.del != null) { S.knowns.splice(Number(t.dataset.del), 1); ui.edit = null; save(); renderAll(); return; }
    if (t.dataset.cancel) { ui.edit = null; renderChips(); return; }
    var k = S.knowns[ui.edit]; if (!k) return;
    if (t.dataset.swap) { var old = k.id; k.id = t.dataset.swap; k.alts = [old].concat((k.alts || []).filter(function (a) { return a !== k.id; })); k.note = ""; save(); ui.edit = null; renderAll(); return; }
    if (t.dataset.save != null) {
      var q = Q[k.id], raw = $("#q-editv").value.trim();
      if (q.opts.str) k.v = raw.toUpperCase();
      else {
        var num = parseFloat(raw.replace(/,/g, ""));
        if (!isFinite(num)) { $("#q-err").textContent = "That value isn't a number."; return; }
        if (q.opts.frac) k.v = num > 1 ? num / 100 : num;
        else { var d = EM.display(q.dim, k.v), D = EM.DIMS[q.dim]; var f = 1; D.ladder.forEach(function (l) { if (l[0] === d.u) f = l[1]; }); k.v = num * f; }
      }
      k.note = ""; ui.edit = null; save(); renderAll();
    }
  });
  $("#q-clear").addEventListener("click", function () { S.knowns = []; S.target = null; ui.edit = null; ui.ask = null; save(); renderAll(); });
  $("#q-example").addEventListener("click", function () {
    S.ctx = { phase: 3, xf: "none", load: "" };
    S.knowns = [["V_L", 460], ["I_L", 85], ["pf", 0.86], ["P_SCL", 2800], ["P_core", 1600], ["P_RCL", 1100], ["P_FW", 900], ["P_stray", 400], ["nr", 1755], ["f", 60], ["poles", 4]].map(function (p) { return { id: p[0], v: p[1], note: "", alts: [] }; });
    S.target = "eta"; save(); renderAll();
  });

  /* find */
  var fin = $("#q-find"), fs = $("#q-fsugg");
  fin.addEventListener("input", function () {
    var t = fin.value.trim();
    if (!t) { fs.hidden = true; return; }
    var list = EM.suggest(t, S.ctx);
    if (!list.length) { fs.hidden = true; return; }
    fs.innerHTML = list.map(function (id) { return '<button type="button" data-t="' + id + '"><span class="sym">' + EM.symH(id) + '</span><span class="nm">' + EM.md(Q[id].name) + "</span></button>"; }).join("");
    fs.hidden = false;
  });
  fs.addEventListener("mousedown", function (e) { e.preventDefault(); });
  fs.addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (!b) return; S.target = b.dataset.t; fin.value = ""; fs.hidden = true; save(); renderAll(); scrollToBoard(); });
  fin.addEventListener("blur", function () { setTimeout(function () { fs.hidden = true; }, 120); });
  fin.addEventListener("keydown", function (e) { if (e.key === "Enter") { var b = fs.querySelector("[data-t]"); if (b) { b.click(); e.preventDefault(); } } });
  function scrollToBoard() { if (window.innerWidth < 860) { var b = $("#q-board"); if (b && b.scrollIntoView) b.scrollIntoView({ behavior: "smooth", block: "start" }); } }

  function renderCan() {
    var box = $("#q-can");
    var g = EM.givensOf(S.knowns);
    if (!S.knowns.length) { box.innerHTML = '<div class="hint">After you add values, everything you can find from them shows up here.</div>'; return; }
    var known = EM.closure(g, S.ctx);
    var derived = Object.keys(known).filter(function (id) { return !known[id].given; });
    /* also list what becomes findable with a standard assumption (shown as "Assumed" in the work) */
    var extra = {}, motorGiven = Object.keys(g).some(function (id) { return Q[id] && Q[id].group === "motor"; });
    Object.keys(EM.ASSUMABLE).forEach(function (id) { if (g[id]) return; if (id === "f" && !motorGiven) return; extra[id] = EM.ASSUMABLE[id]; });
    var harmGiven = ["I_1", "I_3", "I_5", "I_7", "I_9", "I_11"].some(function (id) { return g[id]; });
    var asmOK = function (id) { var gq = Q[id].group; return /^(motor|offstd|curve|twospeed)$/.test(gq) || (gq === "harm" && harmGiven); };
    var k2 = EM.closure(g, S.ctx, extra), asm = {};
    Object.keys(k2).forEach(function (id) { if (!k2[id].given && !known[id] && asmOK(id)) { if (derived.indexOf(id) < 0) { derived.push(id); asm[id] = 1; } } });
    if (!derived.length) { box.innerHTML = '<div class="hint">Nothing can be found from these values alone yet. Search above to see what else is needed.</div>'; return; }
    var by = {};
    derived.forEach(function (id) { var gq = Q[id].group; (by[gq] = by[gq] || []).push(id); });
    var h = '<div class="hint">You can find:</div>';
    GROUP_ORDER.concat(Object.keys(by).filter(function (k) { return GROUP_ORDER.indexOf(k) < 0; })).forEach(function (gq) {
      if (!by[gq]) return;
      h += '<div class="grp">' + esc(GROUP_NAMES[gq] || gq) + '</div><div class="findchips">' + by[gq].map(function (id) { return '<button type="button" data-t="' + id + '" class="' + (S.target === id ? "on" : "") + '" title="' + esc(Q[id].name) + (asm[id] ? " (uses a standard assumption)" : "") + '"><span class="sym">' + EM.symH(id) + "</span>" + EM.md(Q[id].name) + (asm[id] ? " *" : "") + "</button>"; }).join("") + "</div>";
    });
    if (Object.keys(asm).length) h += '<div class="hint">* uses a standard assumption (stray loss 0, missing harmonics 0, or 60 Hz) — it is flagged in the work.</div>';
    box.innerHTML = h;
  }
  $("#q-can").addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (!b) return; S.target = b.dataset.t; save(); renderAll(); scrollToBoard(); });

  /* result */
  function renderBoard() {
    var board = $("#q-board"), g = EM.givensOf(S.knowns), h = '<div class="sheet">';
    var conf = S.knowns.length ? EM.conflicts(g, S.ctx) : [];
    if (!S.target) {
      if (!S.knowns.length) {
        h += "<h3>How this works</h3><p class=\"hint\" style=\"font-size:15px\">1. Read the question and type each value it gives you: <b>V 460</b>, <b>pf 86%</b>, <b>SCL 2.8 kW</b>, <b>rpm 1755</b>. Each one turns into a labelled chip so you can see what it understood.<br>2. Tap what you want to find. You get every formula, the numbers plugged in, and the exact answer.<br>3. If a picture is involved, use <b>Diagrams</b> to identify it first.</p>";
      } else h += "<h3>Pick what you want to find</h3><p class=\"hint\">Tap anything under \"You can find\", or search for it.</p>" + EM.conflictHTML(conf);
      h += bridgeHTML() + "</div>"; board.innerHTML = h; return;
    }
    var q = Q[S.target], res = EM.solve(g, S.ctx, S.target);
    h += '<div><div class="grp">Finding</div><h3 style="font-size:22px">' + EM.md(q.name) + ' <span class="sym">' + EM.symH(S.target) + "</span></h3></div>";
    if (!res.ok) {
      h += '<p>Not enough information yet. To find <b>' + EM.md(q.name) + "</b> you need one of these:</p><ul>";
      res.missing.forEach(function (m) {
        var parts = m.need.map(function (id) { return EM.md(Q[id].name) + ' <span class="sym">' + EM.symH(id) + "</span>"; });
        m.ctxNeed.forEach(function (c) { parts.push("<i>" + esc(ctxText(c)) + "</i>"); });
        h += "<li>" + (parts.length ? parts.join(" + ") : "<i>check your setup</i>") + ' <span class="hint">(for ' + EM.symLine(m.f) + ")</span></li>";
      });
      h += "</ul>";
      if (res.known[S.target] === undefined && Q[S.target].group === "motor" && !g.f) h += '<p class="hint">Most motor problems are 60 Hz — add <b>f 60</b> if the question doesn\'t say otherwise.</p>';
      h += EM.conflictHTML(conf) + bridgeHTML() + "</div>"; board.innerHTML = h; return;
    }
    var known = res.known, sc = EM.scaleFor(known);
    var used = []; (function walk(id, seen) { if (seen[id]) return; seen[id] = 1; var r = known[id]; if (!r) return; if (r.given) { used.push(id); return; } r.deps.forEach(function (d) { walk(d, seen); }); })(S.target, {});
    h += '<div class="uses">' + used.map(function (id) { return "<span>" + EM.symH(id) + " = " + esc(EM.valueText(id, known[id].v, sc)) + "</span>"; }).join("") + "</div>";
    res.assumed.forEach(function (a) { h += EM.flagHTML("warn", "Assumed", esc(a.assumed)); });
    h += EM.conflictHTML(conf);
    if (known[S.target].given) h += "<p>You entered this value directly.</p>";
    res.steps.forEach(function (r) { h += EM.stepHTML(r, known, sc); });
    var dec = EM.decide ? EM.decide(S.target, known, sc) : "";
    h += '<div class="ans"><h3>Answer</h3><ul><li><span class="lb">' + EM.md(q.name) + "</span>" + EM.symH(S.target) + " = " + esc(EM.valueText(S.target, known[S.target].v, sc, true)) + "</li>" + (dec ? '<li style="font-family:var(--sans);font-size:15px">' + dec + "</li>" : "") + "</ul></div>";
    h += bridgeHTML() + "</div>";
    board.innerHTML = h;
  }
  function ctxText(c) {
    return ({ "3ph": "set Phase to 3φ", "1ph": "set Phase to 1φ", bank: "set Transformer to a 3φ bank", pY: "a bank with a wye primary", pD: "a bank with a delta primary", pO: "an open-delta bank", sY: "a bank with a wye secondary", sD: "a bank with a delta secondary", sO: "an open-delta bank", loadY: "set Load connection to Wye", loadD: "set Load connection to Delta" })[c] || c;
  }
  function bridgeHTML() {
    if (!EM.TEMPLATES || !S.knowns.length) return "";
    var ids = S.knowns.map(function (k) { return k.id; });
    var m = EM.TEMPLATES.filter(function (t) { return t.match && t.match(ids, S.ctx); });
    return m.slice(0, 2).map(function (t) { return '<div class="bridge"><p>This looks like <b>' + esc(t.name) + '</b>. See the whole problem written out like the answer key.</p><button class="btn primary small" type="button" data-bridge="' + t.id + '">Open full solution</button></div>'; }).join("");
  }
  $("#q-board").addEventListener("click", function (e) {
    var b = e.target.closest("[data-bridge]"); if (!b || !EM.openTemplate) return;
    EM.openTemplate(b.dataset.bridge, S.knowns, S.ctx);
  });

  function renderAll() { renderSetup(); renderAsk(); renderChips(); renderCan(); renderBoard(); }
  views.quick = { render: renderAll };
  EM.refreshQuick = renderAll;

  /* load from another tab into Quick */
  EM.loadIntoQuick = function (items, ctx, target) {
    if (ctx) Object.keys(ctx).forEach(function (k) { S.ctx[k] = ctx[k]; });
    if (items && items.length) { S.knowns = []; S.target = null; }
    (items || []).forEach(function (it) { addKnown(it.id, it.v, it.note || "", []); });
    if (target) S.target = target;
    save(); showTab("quick");
  };

  document.addEventListener("DOMContentLoaded", function () { });
  var start = store.get("emech_tab", "quick");
  showTab(views[start] ? start : "quick");

  if ("serviceWorker" in navigator && (location.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) { navigator.serviceWorker.register("sw.js").catch(function () { }); }
})();
