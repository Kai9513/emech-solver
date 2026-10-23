/* E-MECH Solver — full write-ups in answer-key order, plus the judgment calls that aren't a single formula */
"use strict";
(function () {
  var EM = window.EM, Q = EM.Q, esc = EM.esc;
  function has(ids, list) { return list.every(function (x) { return ids.indexOf(x) >= 0; }); }
  function any(ids, list) { return list.some(function (x) { return ids.indexOf(x) >= 0; }); }
  var bankCtx = /^(DD|YY|DY|YD)$/;

  var T = [
    { id: "bankload", name: "Transformer bank loading", sub: "1φ + 3φ loads on three single-phase units (email calc)", ctx: { phase: 3, xf: "YY" },
      about: "Each transformer carries one third of each load. Add real and reactive power separately, then find the magnitude and angle.",
      fields: [["P_1", "kW"], ["pf_1"], ["P_3", "kW"], ["pf_3"], ["V_LP", "V"], ["V_phS", "V"]],
      sections: [["Power triangle — single-phase load", ["th_1", "Q_1", "S_1"]], ["Power triangle — three-phase load", ["th_3", "Q_3", "S_3"]], ["Loading on each transformer", ["P_T", "Q_T", "S_T", "th_T", "pf_T"]], ["Turns ratio", ["V_phP", "a"]], ["Currents in each transformer", ["I_ST", "I_PT"]]],
      answers: ["S_T", "th_T", "a", "I_ST", "I_PT"], decideIds: ["S_T"],
      sketch: function (k, sc) { var o = { k: 1000, pu: "kW", qu: "kvar", su: "kVA" }, s = ""; if (k.Q_1) s += EM.sketch.triangle(k.P_1.v, k.Q_1.v, Object.assign({ title: "Single-phase load" }, o)); if (k.Q_3) s += EM.sketch.triangle(k.P_3.v, k.Q_3.v, Object.assign({ title: "Three-phase load" }, o)); if (k.Q_T) s += EM.sketch.triangle(k.P_T.v, k.Q_T.v, Object.assign({ title: "Each transformer" }, o)); return s; },
      match: function (ids) { return has(ids, ["P_1", "P_3"]); } },
    { id: "motoreff", name: "Induction motor efficiency", sub: "Power flow: input → air gap → converted → output (email calc)", ctx: { phase: 3, xf: "none" },
      about: "Walk the power down the power-flow chain, subtracting each loss in order, then find efficiency, slip and shaft torque.",
      fields: [["V_L", "V"], ["I_L", "A"], ["pf"], ["P_SCL", "kW"], ["P_core", "kW"], ["P_RCL", "kW", 1], ["P_FW", "kW"], ["P_stray", "kW", 1], ["nr", "rpm"], ["f", "Hz"], ["poles", "", 1]],
      sections: [["Input power", ["P_in"]], ["Air-gap power", ["P_AG"]], ["Power converted", ["P_RCL", "P_conv"]], ["Output power", ["P_out", "hp"]], ["Efficiency", ["eta"]], ["Slip", ["ns", "poles", "s"]], ["Shaft load torque", ["tau"]]],
      answers: ["P_in", "P_AG", "P_conv", "P_out", "hp", "eta", "s", "tau"],
      sketch: function (k) { if (!k.P_out) return ""; var L = function (a, b) { return (k[a] ? k[a].v : 0) + (k[b] ? k[b].v : 0); }; return EM.sketch.flow([{ label: "P_in", v: k.P_in.v }, { label: "P_AG", v: k.P_AG.v }, { label: "P_conv", v: k.P_conv.v }, { label: "P_out", v: k.P_out.v }], [{ label: "SCL + core", v: L("P_SCL", "P_core") }, { label: "RCL", v: k.P_RCL ? k.P_RCL.v : NaN }, { label: "F&W + stray", v: L("P_FW", "P_stray") }], "kW", 1000); },
      match: function (ids) { return any(ids, ["P_SCL", "P_core", "P_RCL", "P_FW"]) && any(ids, ["V_L", "P_in", "I_L"]); } },
    { id: "nameplate", name: "Motor nameplate", sub: "Poles, slip, torque, locked-rotor current range, SF, efficiency", ctx: { phase: 3, xf: "none" },
      about: "Pull each value off the nameplate, then work through what it tells you.",
      fields: [["hp", "hp"], ["V_L", "V"], ["I_L", "A", 1], ["nr", "rpm"], ["f", "Hz"], ["code", "", 1], ["SF", "", 1], ["pf", "", 1], ["eta_np", "%", 1]],
      sections: [["Poles and slip", ["ns", "poles", "s"]], ["Rated shaft torque", ["tau"]], ["Locked-rotor current range (code letter)", ["kvahp_min", "S_LRmin", "I_LRmin", "kvahp_max", "S_LRmax", "I_LRmax"]], ["Maximum continuous load", ["hp_SF"]], ["Input power and efficiency", ["P_in", "P_out", "eta"]]],
      answers: ["poles", "s", "tau", "I_LRmin", "I_LRmax", "hp_SF", "P_in", "eta"], decideIds: ["eta"],
      match: function (ids) { return any(ids, ["code", "SF", "eta_np"]); } },
    { id: "bankvi", name: "3φ transformer bank (Δ–Y, Y–Δ …)", sub: "Line vs winding voltage and current on both sides", ctx: { phase: 3, xf: "DY" }, ctxChoice: ["DD", "YY", "DY", "YD"],
      about: "Label line and winding (phase) quantities on each side. Δ: V_L = V_φ, I_L = √3·I_φ. Y: V_L = √3·V_φ, I_L = I_φ. The turns ratio is per transformer (winding to winding).",
      fields: [["V_LP", "V"], ["V_phP", "V", 1], ["V_phS", "V", 1], ["a", "", 1], ["S_bank", "kVA", 1], ["I_LS", "A", 1]],
      sections: [["Winding voltages and turns ratio", ["V_phP", "a", "V_phS"]], ["Secondary line voltage", ["V_LS"]], ["Primary currents", ["I_LP", "I_phP"]], ["Secondary currents", ["I_LS", "I_phS"]], ["Apparent power", ["S_bank"]]],
      answers: ["a", "V_LS", "I_LP", "I_phP", "I_LS", "I_phS"],
      sketch: function (k, sc, ctx) { var m = { D: "delta", Y: "wye" }; return EM.sketch.bank(m[ctx.xf[0]], m[ctx.xf[1]]); },
      match: function (ids, ctx) { return bankCtx.test(ctx.xf) && any(ids, ["V_LP", "V_LS", "S_bank", "I_LS"]); } },
    { id: "opendelta", name: "Open delta", sub: "One unit removed — capacity and load to shed", ctx: { phase: 3, xf: "OO" },
      about: "Two transformers in V-V carry 1/√3 (57.7 %) of the full three-unit bank, which is √3 × one unit.",
      fields: [["S_unit", "kVA"], ["V_LS", "V", 1], ["I_LS", "A", 1], ["S_bank", "kVA", 1]],
      sections: [["Full bank rating", ["S_full"]], ["Open-delta capacity", ["S_open"]], ["Actual load", ["S_bank", "pctOpen"]], ["Load that must be removed", ["S_shed"]]],
      answers: ["S_open", "S_bank", "S_shed"], decideIds: ["S_shed"],
      sketch: function () { return EM.sketch.bank("open", "open"); },
      match: function (ids) { return any(ids, ["S_unit", "S_open"]); } },
    { id: "auto", name: "Autotransformer", sub: "% tap: output voltage, load current, line current", ctx: { phase: 3, xf: "none" },
      about: "Voltage scales directly with the tap; line current scales the other way (I_H = I_X × tap).",
      fields: [["V_H", "V"], ["tap", "%"], ["R_L", "Ω", 1], ["I_LRf", "A", 1]],
      sections: [["Output voltage", ["V_X"]], ["Load current", ["I_X"]], ["Line current", ["I_H"]], ["Power delivered", ["P_X"]]],
      answers: ["V_X", "I_X", "I_H"], match: function (ids) { return any(ids, ["tap"]); } },
    { id: "ttr", name: "Turns-ratio test", sub: "Two-voltmeter test: accept or reject, which winding", ctx: { phase: 1, xf: "none" },
      about: "Compare the measured ratio with the nameplate ratio. More than 0.5 % off means shorted turns.",
      fields: [["V_Hr", "V"], ["V_Xr", "V"], ["V_Hm", "V"], ["V_Xm", "V"]],
      sections: [["Nameplate ratio", ["NVR"]], ["Test ratio", ["TVR"]], ["Percent difference", ["ttr"]]],
      answers: ["NVR", "TVR", "ttr"], decideIds: ["ttr"], match: function (ids) { return any(ids, ["V_Hm", "V_Xm"]); } },
    { id: "start", name: "Will it start? (off-standard V or f)", sub: "Locked-rotor torque at the new voltage/frequency vs the load", ctx: { phase: 3, xf: "none" },
      about: "Locked-rotor torque varies with (V/f)² and locked-rotor current with V/f.",
      fields: [["hp", "hp"], ["nr", "rpm"], ["LRpct", "%"], ["V_1", "V"], ["V_2", "V"], ["f_1", "Hz", 1], ["f_2", "Hz", 1], ["tau_load", "lb-ft", 1], ["I_LR1", "A", 1]],
      sections: [["Rated torque", ["tau"]], ["Locked-rotor torque at rated voltage", ["tau_LR1"]], ["Voltage / frequency factor", ["kVf"]], ["Locked-rotor torque at the applied voltage", ["tau_LR2", "I_LR2"]], ["Compare with the load", ["tau_margin"]]],
      answers: ["tau", "tau_LR1", "tau_LR2"], decideIds: ["tau_margin"], match: function (ids) { return any(ids, ["V_2", "f_2"]) && any(ids, ["LRpct", "tau_LR1", "I_LR1"]); } },
    { id: "vub", name: "Voltage unbalance", sub: "%VUB, current unbalance, derate?", ctx: { phase: 3, xf: "none" },
      about: "%VUB = largest deviation from the average ÷ average × 100. Current unbalance is about 6–10 times larger.",
      fields: [["V_ab", "V"], ["V_bc", "V"], ["V_ca", "V"]],
      sections: [["Average voltage", ["V_avg3"]], ["Largest deviation", ["dV"]], ["Percent unbalance", ["VUB"]], ["Expected current unbalance", ["CUB_lo", "CUB_hi"]]],
      answers: ["V_avg3", "VUB"], decideIds: ["VUB"], match: function (ids) { return has(ids, ["V_ab", "V_bc", "V_ca"]); } },
    { id: "twospeed", name: "Two-speed motor / consequent poles", sub: "Poles at each speed and whether it's consequent-pole", ctx: { phase: 3, xf: "none" },
      about: "Find the poles for each rated speed. Exactly 2:1 means a consequent-pole connection is possible.",
      fields: [["nr1", "rpm"], ["nr2", "rpm"], ["f", "Hz"]],
      sections: [["High speed", ["ns1", "poles1"]], ["Low speed", ["ns2", "poles2"]], ["Pole ratio", ["pratio"]]],
      answers: ["poles1", "poles2", "pratio"], decideIds: ["pratio"], match: function (ids) { return has(ids, ["nr1", "nr2"]); } },
    { id: "pfcorr", name: "Power-factor correction", sub: "Capacitor kvar and line current before / after (Test 1)", ctx: { phase: 3, xf: "none" },
      about: "Capacitors cancel reactive power; real power stays the same. Q_C = P(tan θ₁ − tan θ₂).",
      fields: [["V_L", "V"], ["P", "kW"], ["pf"], ["pf2"]],
      sections: [["Before correction", ["th", "Qr", "S", "I_L"]], ["After correction", ["th2", "Q2", "S2", "IL2"]], ["Capacitor bank", ["Qc"]]],
      answers: ["Qc", "I_L", "IL2"],
      sketch: function (k) { var o = { k: 1000 }, s = ""; if (k.Qr) s += EM.sketch.triangle(k.P.v, k.Qr.v, Object.assign({ title: "Before" }, o)); if (k.Q2) s += EM.sketch.triangle(k.P.v, k.Q2.v, Object.assign({ title: "After" }, o)); return s; },
      match: function (ids) { return any(ids, ["pf2", "Qc"]); } },
    { id: "curve", name: "Torque-speed curve values", sub: "Turn % read off the graph into lb-ft", ctx: { phase: 3, xf: "none" },
      about: "Rated torque from 5252·hp/n_r, then each point = its % × rated torque.",
      fields: [["hp", "hp"], ["nr", "rpm"], ["LRpct", "%"], ["PUpct", "%", 1], ["BDpct", "%", 1]],
      sections: [["Rated torque", ["tau"]], ["Locked-rotor torque", ["tau_LR1"]], ["Pull-up torque", ["tau_PU"]], ["Breakdown torque", ["tau_BD"]]],
      answers: ["tau", "tau_LR1", "tau_PU", "tau_BD"],
      sketch: function (k) { var c = EM.sketch.CURVES.generic, lr = k.LRpct ? k.LRpct.v : 160, pu = k.PUpct ? k.PUpct.v : lr * 0.85, bd = k.BDpct ? k.BDpct.v : 230;
        var pts = [{ x: 0, y: lr }, { x: 25, y: Math.min(pu, lr) }, { x: 55, y: (Math.min(pu, lr) + bd) / 2 }, { x: 80, y: bd }, { x: 90, y: (bd + 100) / 2 }, { x: 96, y: 100 }, { x: 100, y: 0 }];
        return EM.sketch.curve(pts, { marks: [{ x: 0, y: lr, label: "LR " + lr + "%" }, { x: 25, y: Math.min(pu, lr), label: "PU " + EM.fmt(pu, 3) + "%" }, { x: 80, y: bd, label: "BD " + bd + "%" }, { x: 96, y: 100, label: "Rated 100%" }] }); },
      match: function (ids) { return any(ids, ["PUpct", "BDpct"]); } }
  ];
  EM.TEMPLATES = T;

  /* judgment calls */
  var SIZES = [10, 15, 25, 37.5, 50, 75, 100, 167, 250, 333, 500, 750, 1000, 1500, 2000, 2500];
  EM.decide = function (id, k, sc) {
    var v = k[id] && k[id].v;
    if (v == null) return "";
    if (id === "S_T") { var kva = v / 1000, pick = SIZES.filter(function (s) { return s >= kva - 1e-9; })[0]; return pick ? "Next standard single-phase size: <b>" + pick + " kVA</b> per transformer (" + EM.fmt(kva, 4) + " kVA needed)." : ""; }
    if (id === "ttr") {
      var ok = v <= 0.5, w = (k.TVR && k.NVR) ? (k.TVR.v > k.NVR.v ? "secondary (low-side)" : "primary (high-side)") : "";
      return ok ? "<b>Acceptable</b> — within the 0.5 % limit." : "<b>Not acceptable</b> — more than 0.5 % off." + (w ? " Test ratio is " + (k.TVR.v > k.NVR.v ? "higher" : "lower") + " than nameplate, so the shorted turns are most likely in the <b>" + w + "</b> winding." : "");
    }
    if (id === "tau_margin") return v >= 0 ? "<b>Will start</b> — starting torque exceeds what the load needs by " + esc(EM.valueText("tau", v, sc)) + "." : "<b>Will NOT start</b> — " + esc(EM.valueText("tau", -v, sc)) + " short of what the load needs.";
    if (id === "tau_LR2" && k.tau_load) return EM.decide("tau_margin", { tau_margin: { v: k.tau_LR2.v - k.tau_load.v } }, sc);
    if (id === "VUB") return v <= 1 ? "<b>No derating needed</b> (1 % or less)." : v <= 5 ? "<b>Derate the motor</b> (above 1 %). Current unbalance ≈ " + EM.fmt(6 * v, 3) + "–" + EM.fmt(10 * v, 3) + " %." : "<b>Do not operate</b> — over 5 % unbalance is not recommended.";
    if (id === "S_shed") return v > 0 ? "<b>Overloaded.</b> Remove at least " + esc(EM.valueText("S_shed", v, sc)) + " of load." : "<b>Not overloaded</b> — the open-delta bank can carry this load.";
    if (id === "pctOpen") return v > 100 ? "<b>Overloaded</b> (" + EM.fmt(v, 4) + " % of capacity)." : "Within capacity.";
    if (id === "pratio") return Math.abs(v - 2) < 1e-9 ? "Exactly <b>2:1</b> — a <b>consequent-pole</b> connection is possible (same-polarity poles create opposite consequent poles between them, doubling the pole count)." : "<b>Not 2:1</b> — this needs separate windings, not consequent poles.";
    if (id === "eta" && k.eta_np) { var d = v - k.eta_np.v; return "Nameplate says " + EM.fmt(k.eta_np.v, 4) + " %; calculated " + EM.fmt(v, 4) + " % (" + (Math.abs(d) <= 5 ? "close — consistent" : "more than 5 points off — check the values") + ")."; }
    if (id === "I_LRmin" && k.I_LRmax) return "Expected locked-rotor current: <b>" + esc(EM.valueText("I_LRmin", v, sc)) + " to " + esc(EM.valueText("I_LRmax", k.I_LRmax.v, sc)) + "</b>.";
    if (id === "I_LRmax" && k.I_LRmin) return EM.decide("I_LRmin", k, sc);
    if (id === "a" && isFinite(v)) return v > 1 ? "a &gt; 1 → <b>step-down</b>." : v < 1 ? "a &lt; 1 → <b>step-up</b>." : "";
    return "";
  };

  /* ---------- Full view ---------- */
  var root = document.getElementById("view-full");
  var F = EM.store.get("emech_full", { tid: null, vals: {}, units: {}, ctx: null });
  function saveF() { EM.store.set("emech_full", F); }
  function unitOpts(id) {
    var q = Q[id];
    if (q.opts.str) return null;
    if (q.opts.frac) return [["", 1], ["%", 0.01]];
    return (EM.DIMS[q.dim] || EM.DIMS.none).ladder;
  }
  function render() {
    var t = T.filter(function (x) { return x.id === F.tid; })[0];
    if (!t) {
      root.innerHTML = '<div class="card"><h2>Full solution</h2><p class="hint">Pick the problem type to get the whole thing written out like the answer key. Not sure what type it is? Use <b>Quick</b> — it suggests the full solution when your values match one.</p><div class="list">' +
        T.map(function (x) { return '<button type="button" data-t="' + x.id + '"><b>' + esc(x.name) + "</b><span>" + esc(x.sub) + "</span></button>"; }).join("") + "</div></div>";
      return;
    }
    var ctx = F.ctx || t.ctx;
    var h = '<div class="grid2"><div style="display:flex;flex-direction:column;gap:12px;min-width:0"><section class="card"><button class="btn small ghost backlink" type="button" data-back="1">← All problem types</button><h2>' + esc(t.name) + "</h2><p class=\"hint\">" + esc(t.about) + "</p>";
    if (t.ctxChoice) h += '<label class="hint" for="f-ctx">Connection <select id="f-ctx">' + t.ctxChoice.map(function (c) { var n = EM.XF.filter(function (x) { return x[0] === c; })[0]; return '<option value="' + c + '"' + (ctx.xf === c ? " selected" : "") + ">" + n[1] + "</option>"; }).join("") + "</select></label>";
    h += '<form id="f-form" class="form" autocomplete="off">';
    t.fields.forEach(function (fd) {
      var id = fd[0], q = Q[id], uo = unitOpts(id), cur = F.units[id] || fd[1] || (uo ? uo[0][0] : "");
      var val = F.vals[id] != null ? F.vals[id] : "";
      h += '<div class="field"><label for="f-' + id + '">' + esc(q.name) + ' <span class="sym">' + EM.symH(id) + "</span>" + (fd[2] ? " <i>(if given)</i>" : "") + '</label><div class="inp"><input type="text" inputmode="' + (q.opts.str ? "text" : "decimal") + '" id="f-' + id + '" data-f="' + id + '" value="' + esc(val) + '">' +
        (uo && uo.length > 1 ? '<select data-u="' + id + '" aria-label="Unit for ' + esc(q.name) + '">' + uo.map(function (u) { return "<option" + (u[0] === cur ? " selected" : "") + ">" + esc(u[0]) + "</option>"; }).join("") + "</select>" : (uo && uo[0][0] ? "<span style=\"align-self:center\">" + esc(uo[0][0]) + "</span>" : "")) + "</div></div>";
    });
    h += '</form><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn primary" type="button" data-solve="1">Solve</button><button class="btn" type="button" data-toquick="1">Send to Quick</button><button class="btn ghost" type="button" data-clearf="1">Clear</button></div></section></div><div class="board" id="f-board"></div></div>';
    root.innerHTML = h;
    solve();
  }
  function readGivens(t) {
    var g = {};
    t.fields.forEach(function (fd) {
      var id = fd[0], q = Q[id], raw = F.vals[id];
      if (raw == null || String(raw).trim() === "") return;
      if (q.opts.str) { g[id] = { v: String(raw).trim().toUpperCase() }; return; }
      var n = parseFloat(String(raw).replace(/,/g, "")); if (!isFinite(n)) return;
      var uo = unitOpts(id), u = F.units[id] || fd[1] || uo[0][0], f = 1;
      uo.forEach(function (x) { if (x[0] === u) f = x[1]; });
      if (q.opts.frac && u === "" && n > 1) f = 0.01;
      g[id] = { v: n * f };
    });
    return g;
  }
  function solve() {
    var t = T.filter(function (x) { return x.id === F.tid; })[0]; if (!t) return;
    var board = document.getElementById("f-board"), ctx = F.ctx || t.ctx, g = readGivens(t);
    if (!Object.keys(g).length) { board.innerHTML = '<div class="sheet"><h3>' + esc(t.name) + '</h3><p class="hint">Fill in the values the question gives, then press Solve.</p></div>'; return; }
    var extra = {}; if (t.id === "motoreff" && !g.P_stray) extra.P_stray = EM.ASSUMABLE.P_stray;
    if (!g.f && /motoreff|nameplate|twospeed/.test(t.id)) extra.f = EM.ASSUMABLE.f;
    var known = EM.closure(g, ctx, extra), sc = EM.scaleFor(known), shown = {}, h = '<div class="sheet"><h3 style="font-size:22px">' + esc(t.name) + "</h3><p>" + esc(t.about) + "</p>";
    h += '<div><div class="grp">Given</div><div class="uses">' + Object.keys(g).map(function (id) { return "<span>" + esc(Q[id].name) + ": " + EM.symH(id) + " = " + esc(EM.valueText(id, g[id].v, sc)) + "</span>"; }).join("") + "</div></div>";
    Object.keys(extra).forEach(function (id) { if (known[id]) h += EM.flagHTML("warn", "Assumed", esc(extra[id].why)); });
    h += EM.conflictHTML(EM.conflicts(g, ctx));
    t.sections.forEach(function (sec) {
      var body = "", missingIds = [];
      sec[1].forEach(function (id) {
        if (!known[id]) { missingIds.push(id); return; }
        if (known[id].given) return;
        EM.chain(known, id).forEach(function (r) { if (shown[r.id]) return; shown[r.id] = 1; body += EM.stepHTML(r, known, sc); });
        if (t.decideIds && t.decideIds.indexOf(id) >= 0) { var d = EM.decide(id, known, sc); if (d) body += '<p class="note" style="color:var(--ink);font-size:15px">' + d + "</p>"; }
      });
      if (!body && missingIds.length === sec[1].length) {
        var need = {}; missingIds.forEach(function (id) { var r = EM.solve(g, ctx, id); if (!r.ok) r.missing.slice(0, 1).forEach(function (m) { m.need.forEach(function (n) { need[n] = 1; }); }); });
        var nl = Object.keys(need); if (!nl.length) return;
        body = '<p class="hint">Needs ' + nl.map(function (n) { return esc(Q[n].name) + " " + EM.symH(n); }).join(", ") + ".</p>";
      }
      if (body) h += '<div class="grp" style="margin-top:6px">' + esc(sec[0]) + "</div>" + body;
    });
    if (t.sketch) { var sk = ""; try { sk = t.sketch(known, sc, ctx); } catch (e) { sk = ""; } if (sk) h += '<div class="sk">' + sk + "</div>"; }
    var ans = t.answers.filter(function (id) { return known[id]; });
    if (ans.length) {
      h += '<div class="ans"><h3>Answers</h3><ul>' + ans.map(function (id) { return '<li><span class="lb">' + EM.md(Q[id].name) + "</span>" + EM.symH(id) + " = " + esc(EM.valueText(id, known[id].v, sc, true)) + "</li>"; }).join("");
      (t.decideIds || []).forEach(function (id) { var d = EM.decide(id, known, sc); if (d) h += '<li style="font-family:var(--sans);font-size:15px">' + d + "</li>"; });
      h += "</ul></div>";
    }
    board.innerHTML = h + "</div>";
  }
  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-t],[data-back],[data-solve],[data-toquick],[data-clearf]"); if (!b) return;
    if (b.dataset.t) { F.tid = b.dataset.t; F.ctx = null; saveF(); render(); return; }
    if (b.dataset.back) { F.tid = null; saveF(); render(); return; }
    if (b.dataset.clearf) { F.vals = {}; saveF(); render(); return; }
    var t = T.filter(function (x) { return x.id === F.tid; })[0];
    if (b.dataset.solve) { solve(); var bd = document.getElementById("f-board"); if (window.innerWidth < 860 && bd.scrollIntoView) bd.scrollIntoView({ behavior: "smooth" }); return; }
    if (b.dataset.toquick) { var g = readGivens(t); EM.loadIntoQuick(Object.keys(g).map(function (id) { return { id: id, v: g[id].v }; }), F.ctx || t.ctx, t.answers[0]); }
  });
  root.addEventListener("input", function (e) { var id = e.target.dataset.f; if (id) { F.vals[id] = e.target.value; saveF(); } });
  root.addEventListener("change", function (e) {
    var u = e.target.dataset.u; if (u) { F.units[u] = e.target.value; saveF(); solve(); return; }
    if (e.target.id === "f-ctx") { var t = T.filter(function (x) { return x.id === F.tid; })[0]; F.ctx = Object.assign({}, t.ctx, { xf: e.target.value }); saveF(); solve(); var bd = document.getElementById("f-board"); }
  });
  root.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.dataset && e.target.dataset.f) { e.preventDefault(); solve(); } });

  /* open from Quick with its values */
  EM.openTemplate = function (tid, knowns, ctx) {
    var t = T.filter(function (x) { return x.id === tid; })[0]; if (!t) return;
    F.tid = tid; F.vals = {}; F.units = {};
    F.ctx = t.ctxChoice && bankCtx.test(ctx.xf) ? Object.assign({}, t.ctx, { xf: ctx.xf }) : null;
    knowns.forEach(function (k) {
      var fd = t.fields.filter(function (f) { return f[0] === k.id; })[0]; if (!fd) return;
      var q = Q[k.id];
      if (q.opts.str) { F.vals[k.id] = k.v; return; }
      if (q.opts.frac) { F.vals[k.id] = +k.v.toPrecision(10); F.units[k.id] = ""; return; }
      var uo = unitOpts(k.id), u = fd[1] || uo[0][0], f = 1; uo.forEach(function (x) { if (x[0] === u) f = x[1]; });
      F.vals[k.id] = +(k.v / f).toPrecision(10); F.units[k.id] = u;
    });
    saveF(); EM.showTab("full");
  };
  EM.views.full = { render: render };
})();
