/* E-MECH Solver — engine: chains the relationships from what you know to what you want. */
"use strict";
(function () {
  var EM = window.EM, Q = EM.Q, FORMS = EM.FORMS;

  function tokens(ctx) {
    var t = {};
    t[ctx.phase === 1 ? "1ph" : "3ph"] = true;
    var xf = ctx.xf || "none";
    if (/^(DD|YY|DY|YD|OO)$/.test(xf)) { t.bank = true; t["p" + (xf[0] === "D" ? "D" : xf[0] === "Y" ? "Y" : "O")] = true; t["s" + (xf[1] === "D" ? "D" : xf[1] === "Y" ? "Y" : "O")] = true; }
    if (ctx.load === "Y") t.loadY = true;
    if (ctx.load === "D") t.loadD = true;
    return t;
  }
  EM.tokens = tokens;

  /* knowns: { id: {v: number|string} }  →  closure {id: rec} */
  function closure(givens, ctx, extra) {
    var tk = tokens(ctx || {}), known = {}, order = 0;
    Object.keys(givens).forEach(function (id) { known[id] = { id: id, v: givens[id].v, given: true, assumed: givens[id].assumed || null, order: order++ }; });
    if (extra) Object.keys(extra).forEach(function (id) { if (!known[id]) known[id] = { id: id, v: extra[id].v, given: true, assumed: extra[id].why, order: order++ }; });
    var forms = FORMS.filter(function (f) { return f.when.every(function (w) { return tk[w]; }); });
    for (var round = 0; round < 60; round++) {
      var best = {};
      forms.forEach(function (f) {
        if (known[f.out]) return;
        for (var i = 0; i < f.ins.length; i++) if (!known[f.ins[i]]) return;
        var v;
        try {
          if (f.fn) { var o = {}; f.ins.forEach(function (k) { o[k] = known[k].v; }); v = f.fn(o); }
          else v = EM.evalAst(f.ast, function (n) { var r = known[n]; if (!r || typeof r.v !== "number") throw new Error(n); return r.v; });
        } catch (e) { return; }
        if (typeof v !== "number" || !isFinite(v)) return;
        var b = best[f.out];
        if (!b || f.prio < b.f.prio) best[f.out] = { f: f, v: v };
      });
      var outs = Object.keys(best);
      if (!outs.length) break;
      outs.forEach(function (id) { known[id] = { id: id, v: best[id].v, f: best[id].f, deps: best[id].f.ins.slice(), round: round + 1, order: order++ }; });
    }
    return known;
  }
  EM.closure = closure;

  /* ordered steps that lead to a target */
  function chain(known, target) {
    var seen = {}, list = [];
    (function walk(id) {
      if (seen[id]) return; seen[id] = true;
      var r = known[id]; if (!r || r.given) return;
      r.deps.forEach(walk);
      list.push(r);
    })(target);
    list.sort(function (a, b) { return a.order - b.order; });
    return list;
  }
  EM.chain = chain;
  function usedGivens(known, target) {
    var seen = {}, out = [];
    (function walk(id) { if (seen[id]) return; seen[id] = true; var r = known[id]; if (!r) return; if (r.given) { out.push(r); return; } r.deps.forEach(walk); })(target);
    return out;
  }

  /* solve for one target, trying safe assumptions only if needed */
  EM.solve = function (givens, ctx, target) {
    var known = closure(givens, ctx);
    var assumed = [];
    if (!known[target]) {
      var extra = {};
      Object.keys(EM.ASSUMABLE).forEach(function (id) { if (!givens[id]) extra[id] = EM.ASSUMABLE[id]; });
      var k2 = closure(givens, ctx, extra);
      if (k2[target]) {
        known = k2;
        assumed = usedGivens(k2, target).filter(function (r) { return r.assumed; });
        // re-run with only the assumptions actually used, so nothing else changes
        var keep = {}; assumed.forEach(function (r) { keep[r.id] = EM.ASSUMABLE[r.id]; });
        known = closure(givens, ctx, keep);
      }
    }
    if (!known[target]) return { ok: false, known: known, missing: missing(known, ctx, target) };
    return { ok: true, known: known, steps: chain(known, target), assumed: assumed };
  };

  /* what would be needed to reach a target */
  function missing(known, ctx, target) {
    var tk = tokens(ctx), opts = [];
    FORMS.forEach(function (f) {
      if (f.out !== target) return;
      var blockedBy = f.when.filter(function (w) { return !tk[w]; });
      var need = f.ins.filter(function (i) { return !known[i]; });
      opts.push({ f: f, need: need, ctxNeed: blockedBy });
    });
    opts.sort(function (a, b) { return (a.need.length + a.ctxNeed.length * 2) - (b.need.length + b.ctxNeed.length * 2) || a.f.prio - b.f.prio; });
    var seen = {}, out = [];
    opts.forEach(function (o) { var key = o.need.join(",") + "|" + o.ctxNeed.join(","); if (seen[key]) return; seen[key] = true; if (out.length < 4) out.push(o); });
    return out;
  }
  EM.missing = missing;

  /* given numbers that disagree with each other */
  EM.conflicts = function (givens, ctx) {
    var extra = {}; ["P_stray", "I_3", "I_5", "I_7", "I_9", "I_11"].forEach(function (id) { if (!givens[id]) extra[id] = EM.ASSUMABLE[id]; });
    var known = closure(givens, ctx, extra);
    var tk = tokens(ctx), out = [], seen = {};
    FORMS.forEach(function (f) {
      if (!f.check || f.fn || f.prio > 5) return;
      if (!f.when.every(function (w) { return tk[w]; })) return;
      var r = known[f.out]; if (!r || typeof r.v !== "number" || (r.given && r.assumed)) return;
      if (!r.given && r.f === f) return;
      for (var i = 0; i < f.ins.length; i++) { var k = known[f.ins[i]]; if (!k || typeof k.v !== "number") return; if (dependsOn(known, f.ins[i], f.out)) return; }
      var v; try { v = EM.evalAst(f.ast, function (n) { return known[n].v; }); } catch (e) { return; }
      if (!isFinite(v)) return;
      var rel = Math.abs(v - r.v) / Math.max(Math.abs(r.v), Math.abs(v), 1e-12);
      if (rel > 0.015 && !seen[f.out]) { seen[f.out] = true; out.push({ f: f, id: f.out, have: r.v, haveGiven: !!r.given, calc: v, soft: f.soft, known: known }); }
    });
    return out;
  };
  function dependsOn(known, id, target) {
    var seen = {};
    return (function walk(x) { if (x === target) return true; if (seen[x]) return false; seen[x] = true; var r = known[x]; if (!r || r.given) return false; return r.deps.some(walk); })(id);
  }

  /* ---------- display helpers ---------- */
  EM.symHTML = function (sym) {
    var h = EM.esc(sym);
    h = h.replace(/_\{([^}]+)\}/g, "<sub>$1</sub>").replace(/_([A-Za-z0-9φ]+)/g, "<sub>$1</sub>");
    return h;
  };
  /* problem-wide display scale for power-type quantities */
  EM.scaleFor = function (known) {
    var mx = 0;
    Object.keys(known).forEach(function (id) { var q = Q[id]; if (q && /^(power|apparent|reactive)$/.test(q.dim) && typeof known[id].v === "number") mx = Math.max(mx, Math.abs(known[id].v)); });
    var p = mx >= 1e7 ? "M" : mx >= 1000 ? "k" : "";
    return { power: p + "W", apparent: p + "VA", reactive: p === "M" ? "Mvar" : p === "k" ? "kvar" : "var" };
  };
  EM.show = function (id, v, scale) {
    var q = Q[id];
    if (q.opts.str) return { txt: String(v), unit: "" };
    if (q.opts.frac) return { txt: EM.fmt(v, 4), unit: "", pct: EM.fmt(v * 100, 4) + " %" };
    var d = EM.display(q.dim, v, scale && scale[q.dim]);
    return { txt: EM.fmt(d.v, 4), unit: d.u, v: d.v };
  };
  EM.valueText = function (id, v, scale, withPct) {
    var s = EM.show(id, v, scale);
    var t = s.unit ? EM.withUnit(Number(s.v), s.unit) : s.txt;
    if (withPct && s.pct) t += " (" + s.pct + ")";
    return t;
  };
  EM.symLine = function (f) {
    if (f.fn) return EM.symHTML(Q[f.out].sym) + " = " + EM.esc(f.text);
    return EM.symHTML(Q[f.out].sym) + " = " + EM.print(f.ast, function (n) { return EM.symHTML(Q[n].sym); });
  };
  EM.subLine = function (f, known, scale) {
    if (f.sub) return EM.esc(f.sub(known)).replace(/_([A-Za-z0-9]+)/g, "<sub>$1</sub>");
    if (f.fn) return EM.esc(Q[f.out].name) + " for code " + EM.esc(String(known[f.ins[0]].v).toUpperCase());
    return EM.print(f.ast, function (n, pop) {
      var r = known[n]; var s = EM.show(n, r.v, scale);
      var t = s.unit ? EM.withUnit(Number(s.v), s.unit) : s.txt;
      var neg = typeof r.v === "number" && r.v < 0;
      var need = neg || ((pop === "*" || pop === "/" || pop === "^") && s.unit && s.unit !== "°") || (pop === "*" && !s.unit) || (pop === "neg");
      return need ? "(" + EM.esc(t) + ")" : EM.esc(t);
    });
  };
})();
