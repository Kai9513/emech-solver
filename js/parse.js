/* E-MECH Solver — reads short entries like "V 460", "pf 86%", "SCL 2.8 kW", "120∠30", "Z 8+j6", "code G". */
"use strict";
(function () {
  var EM = window.EM, Q = EM.Q;
  var NUM = "[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][-+]?\\d+)?";

  function norm(s) {
    return String(s || "").toLowerCase().replace(/θ/g, "theta").replace(/φ/g, "ph").replace(/η/g, "eta").replace(/τ/g, "tau").replace(/ω/g, "w").replace(/Φ/g, "phi")
      .replace(/[\s_.{}:=]/g, "").replace(/-/g, "");
  }
  EM.norm = norm;
  var ALIAS = {};
  Object.keys(Q).forEach(function (id) {
    var q = Q[id];
    [id, q.sym].concat(q.aliases).forEach(function (a) { var n = norm(a); if (!n) return; (ALIAS[n] = ALIAS[n] || []); if (ALIAS[n].indexOf(id) < 0) ALIAS[n].push(id); });
  });

  /* generic words that depend on the context */
  function genericVoltage(ctx) {
    if (ctx.xf === "single") return { ask: true, list: ["V_P", "V_S"] };
    if (/^(DD|YY|DY|YD|OO)$/.test(ctx.xf)) return { ask: true, list: ["V_LP", "V_phP", "V_LS", "V_phS"] };
    if (ctx.phase === 1) return { list: ["V", "Vrms", "Vm"], note: "" };
    return { list: ["V_L", "V_ph", "Vrms", "Vm", "V"], note: "assumed line voltage (3φ convention)" };
  }
  function genericCurrent(ctx) {
    if (ctx.xf === "single") return { ask: true, list: ["I_P", "I_S"] };
    if (/^(DD|YY|DY|YD|OO)$/.test(ctx.xf)) return { ask: true, list: ["I_LP", "I_phP", "I_LS", "I_phS"] };
    if (ctx.phase === 1) return { list: ["I", "Irms", "Im"] };
    return { list: ["I_L", "I_ph", "Irms", "Im", "I"], note: "assumed line current (3φ convention)" };
  }
  var BY_DIM = {
    voltage: genericVoltage, current: genericCurrent,
    power: function (ctx) { return { list: ["P", "P_in", "P_out", "P_1", "P_3"] }; },
    apparent: function (ctx) { return { list: /^(DD|YY|DY|YD|OO)$/.test(ctx.xf) ? ["S_bank", "S_unit", "S"] : ["S", "S_X", "S_unit"] }; },
    reactive: function () { return { list: ["Qr", "Qc"] }; },
    freq: function () { return { list: ["f", "fr"] }; }, speed: function () { return { list: ["nr", "ns"] }; },
    hp: function () { return { list: ["hp"] }; }, torque: function () { return { list: ["tau", "tau_load", "tau_LR1"] }; },
    resistance: function (ctx) { return { list: ctx.xf === "single" ? ["R_L", "R"] : ["R", "R_L", "Z", "XL", "XC"] }; },
    inductance: function () { return { list: ["L"] }; }, capacitance: function () { return { list: ["C"] }; },
    angfreq: function () { return { list: ["w"] }; }, time: function () { return { list: ["T", "dt"] }; },
    flux: function () { return { list: ["dPhi", "Phi1", "Phi2"] }; }, angle: function () { return { list: ["ang", "th", "phi"] }; },
    kvahp: function () { return { list: ["kvahp_min", "kvahp_max"] }; },
    percent: function () { return { list: ["eta", "tap", "LRpct", "THD", "pf"] }; }
  };
  var GENERIC_V = ["v", "volt", "volts", "voltage"], GENERIC_I = ["i", "amp", "amps", "current", "ampere", "amperes"];

  /* candidates for a label (exact symbol first, then aliases, then by context) */
  function resolve(label, dim, ctx) {
    var raw = String(label || "").trim();
    var n = norm(raw);
    if (!n) {
      if (!dim) return { list: [] };
      var g = (BY_DIM[dim] || function () { return { list: [] }; })(ctx);
      return { list: g.list.slice(), ask: g.ask, note: g.note };
    }
    if (GENERIC_V.indexOf(n) >= 0) return genericVoltage(ctx);
    if (GENERIC_I.indexOf(n) >= 0) return genericCurrent(ctx);
    var out = [];
    // case-sensitive exact id/symbol: "S" = apparent power, "s" = slip, "T" = period, "P" = real power
    Object.keys(Q).forEach(function (id) { var s = Q[id].sym.replace(/[_{}]/g, ""); if (raw === id || raw === s || raw.replace(/_/g, "") === id.replace(/_/g, "")) out.push(id); });
    if (raw === "S") out = ["S"]; else if (raw === "s") out = ["s"]; else if (raw === "P") out = ["P"]; else if (raw === "p") out = ["P"];
    (ALIAS[n] || []).forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); });
    if (!out.length) {
      // prefix match on aliases and names
      Object.keys(ALIAS).forEach(function (a) { if (a.indexOf(n) === 0 && n.length >= 2) ALIAS[a].forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); }); });
      Object.keys(Q).forEach(function (id) { if (norm(Q[id].name).indexOf(n) >= 0 && n.length >= 3 && out.indexOf(id) < 0) out.push(id); });
    }
    if (dim) {
      var same = out.filter(function (id) { return Q[id].dim === dim || (dim === "percent" && Q[id].opts.frac); });
      if (same.length) out = same.concat(out.filter(function (id) { return same.indexOf(id) < 0; }));
    }
    // in transformer modes, a plain "VP"/"VS" means the bank's primary/secondary quantities
    if (/^(DD|YY|DY|YD|OO)$/.test(ctx.xf)) {
      var map = { V_P: "V_LP", V_S: "V_LS", I_P: "I_LP", I_S: "I_LS" };
      out = out.map(function (id) { return map[id] || id; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    }
    return { list: out };
  }
  EM.resolve = resolve;

  /* suggestions while typing: label part only */
  EM.suggest = function (text, ctx) {
    var m = String(text || "").match(new RegExp("^\\s*([^\\d+\\-.∠@]*)"));
    var label = m ? m[1].trim() : "";
    if (!label) return [];
    var r = resolve(label, null, ctx).list;
    var n = norm(label);
    if (r.length < 8) Object.keys(Q).forEach(function (id) { if (r.length >= 8) return; var q = Q[id]; if (r.indexOf(id) < 0 && (norm(q.name).indexOf(n) >= 0 || q.aliases.some(function (a) { return norm(a).indexOf(n) === 0; }))) r.push(id); });
    return r.slice(0, 8);
  };

  function splitUnit(after) {
    after = String(after || "").trim();
    if (!after) return { unit: null, rest: "" };
    var toks = after.split(/\s+/);
    // try longest unit at the start: "kVA/hp", "lb-ft", "rad/s", "kW"
    for (var len = Math.min(2, toks.length); len >= 1; len--) {
      var cand = toks.slice(0, len).join(len === 2 ? "-" : "");
      var u = EM.unit(cand);
      if (u) return { unit: u, unitText: toks.slice(0, len).join(" "), rest: toks.slice(len).join(" ") };
    }
    var u1 = EM.unit(toks[0]);
    if (u1) return { unit: u1, unitText: toks[0], rest: toks.slice(1).join(" ") };
    return { unit: null, rest: after };
  }

  /* parse one entry → {items:[{id,v,assumedUnit?}], ask?:[ids], note?, error?} */
  EM.parseEntry = function (text, ctx) {
    var t = String(text || "").trim();
    if (!t) return { error: "Type something like  V 460  or  pf 86%." };
    t = t.replace(/×/g, "x");
    var m;
    // code letter
    if ((m = /^(?:nema\s*)?(?:code|kva\s*code|code\s*letter)\s*:?\s*([A-HJ-NP-V])\b/i.exec(t))) return { items: [{ id: "code", v: m[1].toUpperCase() }] };
    // polar  e.g.  "V 120∠30", "35∠20", "I 12@-36.9"
    var polar = new RegExp("^(.*?)(" + NUM + ")\\s*(?:∠|@|<|/_)\\s*(" + NUM + ")\\s*°?\\s*([A-Za-zΩ]*)\\s*$").exec(t);
    if (polar) {
      var lab = polar[1].trim(), mag = parseFloat(polar[2]), ang = parseFloat(polar[3]), un = EM.unit(polar[4]);
      var nl = norm(lab);
      if (/^(v|voltage)$/.test(nl) || (un && un.dim === "voltage")) return { items: [{ id: "V", v: mag * (un ? un.factor : 1) }, { id: "thV", v: ang }], note: "voltage phasor" };
      if (/^(i|current)$/.test(nl) || (un && un.dim === "current")) return { items: [{ id: "I", v: mag * (un ? un.factor : 1) }, { id: "thI", v: ang }], note: "current phasor" };
      if (/^(z|impedance)$/.test(nl) || (un && un.dim === "resistance")) return { items: [{ id: "Z", v: mag * (un ? un.factor : 1) }, { id: "thZ", v: ang }], note: "impedance phasor" };
      return { items: [{ id: "M", v: mag }, { id: "ang", v: ang }], note: "phasor in polar form" };
    }
    // rectangular  e.g.  "Z 8+j6", "8 + j6 Ω", "3-j4"
    var rect = new RegExp("^(.*?)(" + NUM + ")\\s*([+-])\\s*j\\s*(" + NUM.replace("[-+]?", "") + ")\\s*([A-Za-zΩ]*)\\s*$").exec(t) ||
      new RegExp("^(.*?)(" + NUM + ")\\s*([+-])\\s*(" + NUM.replace("[-+]?", "") + ")\\s*j\\s*([A-Za-zΩ]*)\\s*$").exec(t);
    if (rect) {
      var lab2 = norm(rect[1]), re = parseFloat(rect[2]), im = parseFloat(rect[4]) * (rect[3] === "-" ? -1 : 1), un2 = EM.unit(rect[5]);
      if (/^(z|impedance)$/.test(lab2) || (un2 && un2.dim === "resistance")) return { items: [{ id: "R", v: re }, { id: "X", v: im }], note: "impedance R + jX" };
      return { items: [{ id: "re", v: re }, { id: "imag", v: im }], note: "phasor in rectangular form" };
    }
    // ordinary:  label number [prefix][unit] [label]   — label = leading words that don't start with a number
    var toks = t.replace(/[=:]/g, " ").split(/\s+/).filter(Boolean), li = 0;
    while (li < toks.length && !new RegExp("^" + NUM).test(toks[li])) li++;
    if (li >= toks.length) return { error: "I couldn't find a number in that." };
    var label = toks.slice(0, li).join(" ");
    var nm = new RegExp("^(" + NUM + ")(.*)$").exec(toks[li]);
    var num = parseFloat(nm[1]), glued = nm[2], prefix = null;
    var after = (glued ? glued + " " : "") + toks.slice(li + 1).join(" ");
    after = after.trim();
    // a lone SI prefix right after the number ("2.8k", "50m", "100u")
    var pm = /^([kKMmuµn])(?:\s+|$)(.*)$/.exec(after);
    if (pm && !EM.unit(pm[1])) { prefix = pm[1]; after = pm[2]; }
    var su = splitUnit(after);
    if (!label && su.rest) label = su.rest;
    var unit = su.unit, dim = unit ? unit.dim : null;
    var r = resolve(label, dim, ctx);
    if (!r.list.length) return { error: label ? "I don't know \"" + label + "\". Pick from the suggestions." : "Add a name or a unit, like  460 V  or  V 460." };
    var id = r.list[0], q = Q[id], v = num, assumedUnit = null, factor = prefix ? ({ k: 1e3, K: 1e3, M: 1e6, m: 1e-3, u: 1e-6, "µ": 1e-6, n: 1e-9 })[prefix] : 1;
    if (q.opts.str) return { error: "That one needs a letter, like  code G." };
    if (unit) {
      if (unit.dim === "percent" && q.opts.frac) v = num / 100;
      else if (unit.dim === q.dim) v = num * factor * unit.factor;
      else if (unit.dim === "percent" && q.dim === "percent") v = num;
      else return { error: Q[id].name + " is measured in " + EM.DIMS[q.dim].ladder.map(function (l) { return l[0]; }).join(" / ") + ", not " + su.unitText + "." };
    } else {
      v = num * factor;
      if (q.opts.frac && num > 1) { v = num / 100; assumedUnit = "read " + num + " as " + num + " %"; }
      else if (/^(power|apparent|reactive)$/.test(q.dim) && !prefix) { assumedUnit = "no unit typed — read as " + EM.DIMS[q.dim].base; }
      else if (q.dim === "inductance" && !prefix && num >= 1) { v = num * 1e-3; assumedUnit = "no unit given — read as mH"; }
      else if (q.dim === "capacitance" && !prefix && num >= 1) { v = num * 1e-6; assumedUnit = "no unit given — read as µF"; }
      else if (q.dim === "flux" && !prefix) { assumedUnit = null; }
    }
    return { items: [{ id: id, v: v, assumedUnit: assumedUnit }], alternatives: r.list.slice(1, 8), ask: r.ask ? r.list : null, note: r.note || null, raw: t };
  };
})();
