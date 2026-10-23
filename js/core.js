/* E-MECH Solver — core: expression engine, units, number formatting.  No dependencies, works offline. */
"use strict";
var EM = window.EM = window.EM || {};
EM.views = EM.views || {};
EM.store = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------- expression engine (degrees for trig) ---------- */
(function () {
  var DEG = Math.PI / 180;
  var FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log10: Math.log10,
    sin: function (x) { return Math.sin(x * DEG); }, cos: function (x) { return Math.cos(x * DEG); }, tan: function (x) { return Math.tan(x * DEG); },
    asin: function (x) { return Math.asin(x) / DEG; }, acos: function (x) { return Math.acos(x) / DEG; }, atan: function (x) { return Math.atan(x) / DEG; },
    atan2: function (y, x) { return Math.atan2(y, x) / DEG; },
    min: Math.min, max: Math.max, floor: Math.floor, ceil: Math.ceil, round: Math.round
  };
  var CONSTS = { pi: Math.PI };
  function tokenize(src) {
    var s = String(src), out = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      var rest = s.slice(i);
      if ((m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest))) { out.push({ t: "num", v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest))) { out.push({ t: "id", v: m[0] }); i += m[0].length; continue; }
      if ((m = /^(<=|>=|==|[+\-*/^(),<>])/.exec(rest))) { out.push({ t: "op", v: m[0] }); i += m[0].length; continue; }
      throw new Error("Unexpected '" + c + "' in " + src);
    }
    return out;
  }
  function parse(src) {
    var tk = tokenize(src), p = 0;
    function isOp(v) { return tk[p] && tk[p].t === "op" && tk[p].v === v; }
    function eat(v) { if (!isOp(v)) throw new Error("Expected " + v + " in " + src); p++; }
    function add() { var l = mul(); while (isOp("+") || isOp("-")) { var o = tk[p++].v; l = { k: "bin", o: o, l: l, r: mul() }; } return l; }
    function mul() { var l = un(); while (isOp("*") || isOp("/")) { var o = tk[p++].v; l = { k: "bin", o: o, l: l, r: un() }; } return l; }
    function un() { if (isOp("-")) { p++; return { k: "neg", a: un() }; } return pw(); }
    function pw() { var b = prim(); if (isOp("^")) { p++; return { k: "bin", o: "^", l: b, r: un() }; } return b; }
    function prim() {
      var t = tk[p];
      if (!t) throw new Error("Ended early: " + src);
      if (t.t === "num") { p++; return { k: "num", v: t.v }; }
      if (t.t === "id") {
        p++;
        if (isOp("(")) { p++; var args = []; if (!isOp(")")) { args.push(add()); while (isOp(",")) { p++; args.push(add()); } } eat(")"); return { k: "fn", n: t.v, args: args }; }
        return { k: "var", n: t.v };
      }
      if (isOp("(")) { p++; var e = add(); eat(")"); return { k: "par", a: e }; }
      throw new Error("Unexpected " + t.v + " in " + src);
    }
    var e = add(); if (p < tk.length) throw new Error("Unexpected " + tk[p].v + " in " + src); return e;
  }
  function evalAst(n, get) {
    switch (n.k) {
      case "num": return n.v;
      case "par": return evalAst(n.a, get);
      case "neg": return -evalAst(n.a, get);
      case "var": if (n.n in CONSTS) return CONSTS[n.n]; return get(n.n);
      case "fn": var f = FUNCS[n.n]; if (!f) throw new Error("Unknown function " + n.n); return f.apply(null, n.args.map(function (a) { return evalAst(a, get); }));
      case "bin":
        var a = evalAst(n.l, get), b = evalAst(n.r, get);
        switch (n.o) { case "+": return a + b; case "-": return a - b; case "*": return a * b; case "/": return a / b; case "^": return Math.pow(a, b); }
    }
    throw new Error("Bad expression");
  }
  function vars(n, acc) {
    acc = acc || [];
    if (!n) return acc;
    if (n.k === "var" && !(n.n in CONSTS) && acc.indexOf(n.n) < 0) acc.push(n.n);
    if (n.a) vars(n.a, acc);
    if (n.l) vars(n.l, acc);
    if (n.r) vars(n.r, acc);
    if (n.args) n.args.forEach(function (x) { vars(x, acc); });
    return acc;
  }
  /* print an expression; leaf(name, parentOp) supplies how a variable is shown */
  var PREC = { "+": 4, "-": 4, "*": 5, "/": 5, "^": 7 };
  function print(n, leaf, parentPrec, pop) {
    parentPrec = parentPrec || 0;
    switch (n.k) {
      case "num": return EM.fmt(n.v, 6);
      case "par": return "(" + print(n.a, leaf, 0) + ")";
      case "neg": return "−" + print(n.a, leaf, 6, "neg");
      case "var": return n.n === "pi" ? "π" : leaf(n.n, pop);
      case "fn":
        var a = n.args.map(function (x) { return print(x, leaf, 0); });
        if (n.n === "sqrt") { var inner = n.args[0]; return (inner.k === "num" || (inner.k === "var" && !/[ (]/.test(a[0]))) ? "√" + a[0] : "√(" + a[0] + ")"; }
        if (n.n === "abs") return "|" + a[0] + "|";
        if (/^a(sin|cos|tan)$/.test(n.n)) return n.n.slice(1) + "⁻¹(" + a[0] + ")";
        if (n.n === "atan2") return "tan⁻¹(" + a[0] + " / " + a[1] + ")";
        return n.n + "(" + a.join(", ") + ")";
      case "bin":
        var p = PREC[n.o];
        var L = print(n.l, leaf, p, n.o), R = print(n.r, leaf, p + (n.o === "-" || n.o === "/" ? 0.5 : 0), n.o);
        var s;
        if (n.o === "*") s = (/^[(√]/.test(R) ? L + R : L + "·" + R);
        else if (n.o === "^") return L + "<sup>" + R + "</sup>";
        else s = L + " " + (n.o === "-" ? "−" : n.o) + " " + R;
        return p < parentPrec ? "(" + s + ")" : s;
    }
    return "?";
  }
  EM.parse = parse; EM.evalAst = evalAst; EM.vars = vars; EM.print = print;
})();

/* ---------- numbers ---------- */
(function () {
  var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  EM.fmt = function (v, sig) {
    sig = sig || 4;
    if (typeof v !== "number") return String(v);
    if (!isFinite(v)) return String(v);
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1e7 || a < 1e-3) {
      var parts = v.toExponential(sig - 1).split("e");
      return parts[0] + "×10" + String(parseInt(parts[1], 10)).split("").map(function (c) { return SUP[c] || c; }).join("");
    }
    var d = Math.max(0, sig - 1 - Math.floor(Math.log10(a)));
    var s = v.toFixed(Math.min(d, 8));
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    var ip = s.split(".")[0], fp = s.split(".")[1];
    var neg = ip[0] === "-"; if (neg) ip = ip.slice(1);
    if (ip.length > 4) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "−" : "") + ip + (fp ? "." + fp : "");
  };
  EM.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
})();

/* ---------- units ----------
   Every quantity is stored in a base unit for its dimension. */
(function () {
  // dimension: base unit, display ladder (unit, factor-from-base)
  var DIMS = {
    voltage: { base: "V", ladder: [["V", 1], ["kV", 1e3]], up: 1e5 },
    current: { base: "A", ladder: [["mA", 1e-3], ["A", 1], ["kA", 1e3]], up: 1e5, down: 0.1 },
    power: { base: "W", ladder: [["W", 1], ["kW", 1e3], ["MW", 1e6]], power: true },
    apparent: { base: "VA", ladder: [["VA", 1], ["kVA", 1e3], ["MVA", 1e6]], power: true },
    reactive: { base: "var", ladder: [["var", 1], ["kvar", 1e3], ["Mvar", 1e6]], power: true },
    hp: { base: "hp", ladder: [["hp", 1]] },
    freq: { base: "Hz", ladder: [["Hz", 1], ["kHz", 1e3]], up: 1e5 },
    angfreq: { base: "rad/s", ladder: [["rad/s", 1]] },
    speed: { base: "rpm", ladder: [["rpm", 1]] },
    time: { base: "s", ladder: [["µs", 1e-6], ["ms", 1e-3], ["s", 1]], down: 1 },
    torque: { base: "lb-ft", ladder: [["lb-ft", 1]] },
    angle: { base: "°", ladder: [["°", 1]] },
    inductance: { base: "H", ladder: [["µH", 1e-6], ["mH", 1e-3], ["H", 1]], down: 1 },
    capacitance: { base: "F", ladder: [["pF", 1e-12], ["nF", 1e-9], ["µF", 1e-6], ["mF", 1e-3], ["F", 1]], down: 1 },
    resistance: { base: "Ω", ladder: [["Ω", 1], ["kΩ", 1e3], ["MΩ", 1e6]], up: 1e5 },
    flux: { base: "Wb", ladder: [["mWb", 1e-3], ["Wb", 1]], down: 0.1 },
    percent: { base: "%", ladder: [["%", 1]] },
    kvahp: { base: "VA/hp", ladder: [["kVA/hp", 1000]] },
    none: { base: "", ladder: [["", 1]] }
  };
  EM.DIMS = DIMS;
  var BASE = { V: "voltage", A: "current", W: "power", VA: "apparent", var: "reactive", VAR: "reactive", VAr: "reactive", hp: "hp", HP: "hp", Hz: "freq", "rad/s": "angfreq", rpm: "speed", RPM: "speed", s: "time", sec: "time", "lb-ft": "torque", "lbft": "torque", "ft-lb": "torque", "°": "angle", deg: "angle", H: "inductance", F: "capacitance", "Ω": "resistance", ohm: "resistance", ohms: "resistance", Wb: "flux", "%": "percent", "kVA/hp": "kvahp", turns: "none", poles: "none", pole: "none" };
  var PREF = { G: 1e9, M: 1e6, k: 1e3, K: 1e3, m: 1e-3, "µ": 1e-6, u: 1e-6, n: 1e-9, p: 1e-12 };
  /* returns {dim, factor} or null; "2.8k" style bare prefixes handled by caller */
  EM.unit = function (u) {
    if (!u) return null;
    u = u.replace(/^\s+|\s+$/g, "").replace(/ohms?$/i, "Ω").replace(/^deg(rees?)?$/i, "°").replace(/Nm|N·m/, "N·m");
    if (u === "N·m") return { dim: "torque", factor: 0.737562 };
    if (/^(lb[- ]?ft|ft[- ]?lb)s?$/i.test(u)) return { dim: "torque", factor: 1 };
    if (/^rpm$/i.test(u)) return { dim: "speed", factor: 1 };
    if (/^hp$/i.test(u)) return { dim: "hp", factor: 1 };
    if (/^kva\/hp$/i.test(u)) return { dim: "kvahp", factor: 1000 };
    if (/^hz$/i.test(u)) return { dim: "freq", factor: 1 };
    if (/^khz$/i.test(u)) return { dim: "freq", factor: 1e3 };
    if (/^rad\/s(ec)?$/i.test(u)) return { dim: "angfreq", factor: 1 };
    if (/^(kvar|kvars|kvar)$/i.test(u)) return { dim: "reactive", factor: 1e3 };
    if (/^mvar$/.test(u)) return { dim: "reactive", factor: 1e6 };
    if (/^vars?$/i.test(u)) return { dim: "reactive", factor: 1 };
    if (/^kva$/i.test(u)) return { dim: "apparent", factor: 1e3 };
    if (/^mva$/i.test(u)) return { dim: "apparent", factor: 1e6 };
    if (/^va$/i.test(u)) return { dim: "apparent", factor: 1 };
    if (/^kw$/i.test(u)) return { dim: "power", factor: 1e3 };
    if (/^MW$/.test(u)) return { dim: "power", factor: 1e6 };
    if (/^kv$/i.test(u)) return { dim: "voltage", factor: 1e3 };
    if (/^ma$/i.test(u)) return { dim: "current", factor: 1e-3 };
    if (u in BASE) return { dim: BASE[u], factor: 1 };
    var p = u[0], rest = u.slice(1);
    if (PREF[p] && rest in BASE) return { dim: BASE[rest], factor: PREF[p] };
    return null;
  };
  /* choose a display unit for a base value; scale (optional) forces a ladder rung for the problem */
  EM.display = function (dim, v, forced) {
    var D = DIMS[dim] || DIMS.none, L = D.ladder, i;
    if (forced) { for (i = 0; i < L.length; i++) if (L[i][0] === forced) return { u: forced, v: v / L[i][1] }; }
    var a = Math.abs(v), base = 0;
    for (i = 0; i < L.length; i++) if (L[i][1] === 1) base = i;
    var idx = base;
    if (a > 0) {
      if (D.power) { idx = 0; for (i = 0; i < L.length; i++) if (a >= L[i][1]) idx = i; }
      else {
        if (D.up && a >= D.up) { for (i = base; i < L.length; i++) if (a >= L[i][1]) idx = i; }
        if (D.down != null && a < D.down) { idx = 0; for (i = 0; i <= base; i++) if (a >= L[i][1]) idx = i; }
      }
    }
    return { u: L[idx][0], v: v / L[idx][1] };
  };
  EM.withUnit = function (v, u, sig) {
    var n = EM.fmt(v, sig || 4);
    if (!u) return n;
    if (u === "°") return n + "°";
    return n + " " + u;
  };
})();
