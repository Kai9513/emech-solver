/* E-MECH Solver — drawings (SVG strings themed through CSS classes) */
"use strict";
(function () {
  var EM = window.EM, DEG = Math.PI / 180, esc = EM.esc;
  function svg(w, h, inner, label) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(label || "") + '">' + inner + "</svg>"; }
  function tx(s) { return esc(s).replace(/_\{([^}]+)\}/g, '<tspan baseline-shift="sub" font-size="75%">$1</tspan>').replace(/_([A-Za-z0-9φ]+)/g, '<tspan baseline-shift="sub" font-size="75%">$1</tspan>'); }
  var S = {};

  S.triangle = function (P, Qv, o) {
    o = o || {};
    if (!isFinite(P) || !isFinite(Qv)) return "";
    var Sm = Math.hypot(P, Qv), th = Math.atan2(Qv, P) / DEG;
    var W = 340, H = 210, ox = 36, oy = 170, sc = Math.min(250 / Math.abs(P || 1), 130 / Math.abs(Qv || 1));
    var x2 = ox + P * sc, y2 = oy - Qv * sc, lag = Qv >= 0;
    var f = function (v, u) { return EM.withUnit(v, u); };
    return svg(W, H,
      '<line class="acc" x1="' + ox + '" y1="' + oy + '" x2="' + x2 + '" y2="' + oy + '" stroke-width="2"/>' +
      '<line class="loss" x1="' + x2 + '" y1="' + oy + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="2"/>' +
      '<line class="st" x1="' + ox + '" y1="' + oy + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="2"/>' +
      '<path class="st" d="M ' + (ox + 32) + " " + oy + " A 32 32 0 0 " + (lag ? 0 : 1) + " " + (ox + 32 * Math.cos(th * DEG)) + " " + (oy - 32 * Math.sin(th * DEG)) + '"/>' +
      '<text x="' + (ox + 38) + '" y="' + (oy - (lag ? 7 : -15)) + '">θ = ' + EM.fmt(th, 4) + "°</text>" +
      '<text class="acct" x="' + (ox + x2) / 2 + '" y="' + (oy + 18) + '" text-anchor="middle">P = ' + esc(f(P / (o.k || 1), o.pu || "kW")) + "</text>" +
      '<text class="losst" x="' + (x2 + 6) + '" y="' + (oy + y2) / 2 + '">Q = ' + esc(f(Qv / (o.k || 1), o.qu || "kvar")) + "</text>" +
      '<text x="' + ((ox + x2) / 2 - 8) + '" y="' + ((oy + y2) / 2 - 8) + '" text-anchor="end">S = ' + esc(f(Sm / (o.k || 1), o.su || "kVA")) + "</text>" +
      (o.title ? '<text x="' + W / 2 + '" y="14" text-anchor="middle" font-weight="600">' + esc(o.title) + "</text>" : ""), "Power triangle");
  };

  S.flow = function (stages, losses, unit, k) {
    var bw = 96, gap = 52, W = stages.length * bw + (stages.length - 1) * gap + 16, H = 140, s = "";
    stages.forEach(function (g, i) {
      var x = 8 + i * (bw + gap);
      s += '<rect class="box" x="' + x + '" y="20" width="' + bw + '" height="40" rx="5"/><text x="' + (x + bw / 2) + '" y="36" text-anchor="middle" font-weight="600">' + tx(g.label) + '</text><text x="' + (x + bw / 2) + '" y="52" text-anchor="middle">' + esc(isFinite(g.v) ? EM.withUnit(g.v / k, unit) : "?") + "</text>";
      if (i < stages.length - 1) {
        var x1 = x + bw, x2 = x + bw + gap, xm = (x1 + x2) / 2, L = losses[i] || {};
        s += '<line class="st" x1="' + x1 + '" y1="40" x2="' + (x2 - 6) + '" y2="40" stroke-width="1.5"/><path class="dot" d="M ' + x2 + ' 40 l -7 -4 v 8 z"/>';
        s += '<line class="loss" x1="' + xm + '" y1="40" x2="' + xm + '" y2="88" stroke-width="1.5"/><path class="losst" d="M ' + xm + ' 94 l -4 -7 h 8 z"/>';
        s += '<text class="losst" x="' + xm + '" y="110" text-anchor="middle">' + esc(L.label || "") + '</text><text class="losst" x="' + xm + '" y="126" text-anchor="middle">' + esc(isFinite(L.v) ? EM.withUnit(L.v / k, unit) : "") + "</text>";
      }
    });
    return svg(W, H, s, "Power-flow diagram");
  };

  /* 3φ bank: prim/sec in delta | wye | open; null = blank template */
  S.bank = function (prim, sec, title, opt) {
    opt = opt || {};
    var W = 330, H = 232, top = { A1: 20, B1: 32, C1: 44, N1: 56 }, bot = { N2: 168, A2: 180, B2: 192, C2: 204 };
    var showN1 = prim === "wye" || prim == null, showN2 = sec === "wye" || sec == null, nU = (prim === "open" || sec === "open") ? 2 : 3;
    var xs = nU === 2 ? [W * .40, W * .66] : [W * .32, W * .57, W * .82], s = "";
    Object.keys(top).forEach(function (k) { if (k === "N1" && !showN1) return; s += '<line class="st" x1="28" y1="' + top[k] + '" x2="' + (W - 6) + '" y2="' + top[k] + '"/><text x="4" y="' + (top[k] + 4) + '" font-size="10">' + k + "</text>"; });
    Object.keys(bot).forEach(function (k) { if (k === "N2" && !showN2) return; s += '<line class="st" x1="28" y1="' + bot[k] + '" x2="' + (W - 6) + '" y2="' + bot[k] + '"/><text x="4" y="' + (bot[k] + 4) + '" font-size="10">' + k + "</text>"; });
    var yt = 96, yb = 128, w = 28;
    function coil(x0, y, up) { var d = "M " + x0 + " " + y; for (var k = 0; k < 4; k++) d += " a 3.5 3.5 0 0 " + (up ? 1 : 0) + " 7 0"; return '<path class="st" d="' + d + '"/>'; }
    function dot(x, y) { return '<circle class="dot" cx="' + x + '" cy="' + y + '" r="2.4"/>'; }
    function link(x, y, yb2) { return '<line class="conn" x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + yb2 + '"/>' + dot(x, yb2); }
    var L1 = ["A1", "B1", "C1"], L2 = ["A2", "B2", "C2"];
    xs.forEach(function (xc, i) {
      var x0 = xc - w / 2;
      s += coil(x0, yt, true) + coil(x0, yb, false) + '<line class="st" x1="' + x0 + '" y1="' + (yt + 12) + '" x2="' + (x0 + w) + '" y2="' + (yt + 12) + '"/><line class="st" x1="' + x0 + '" y1="' + (yt + 16) + '" x2="' + (x0 + w) + '" y2="' + (yt + 16) + '"/><text x="' + (x0 - 6) + '" y="' + (yt + 18) + '" text-anchor="end" font-size="10">T' + (i + 1) + "</text>";
      s += '<text x="' + (x0 - 3) + '" y="' + (yt - 2) + '" font-size="8" text-anchor="end">H1</text><text x="' + (x0 + w + 3) + '" y="' + (yt - 2) + '" font-size="8">H2</text><text x="' + (x0 - 3) + '" y="' + (yb + 8) + '" font-size="8" text-anchor="end">X1</text><text x="' + (x0 + w + 3) + '" y="' + (yb + 8) + '" font-size="8">X2</text>';
      if (prim === "delta") s += link(x0, yt, top[L1[i]]) + link(x0 + w, yt, top[L1[(i + 1) % 3]]);
      else if (prim === "wye") s += link(x0, yt, top[L1[i]]) + link(x0 + w, yt, top.N1);
      else if (prim === "open") s += link(x0, yt, top[L1[i]]) + link(x0 + w, yt, top[L1[i + 1]]);
      if (sec === "delta") s += link(x0, yb, bot[L2[i]]) + link(x0 + w, yb, bot[L2[(i + 1) % 3]]);
      else if (sec === "wye") s += link(x0, yb, bot[L2[i]]) + link(x0 + w, yb, bot.N2);
      else if (sec === "open") s += link(x0, yb, bot[L2[i]]) + link(x0 + w, yb, bot[L2[i + 1]]);
    });
    var nm = { delta: "Delta", wye: "Wye", open: "Open delta" };
    s += '<text x="' + W / 2 + '" y="226" text-anchor="middle" font-weight="600">' + esc(title || (prim ? nm[prim] + "–" + nm[sec] : "")) + "</text>";
    return svg(W, H, s, title || "Transformer bank");
  };

  S.sine = function (waves, f) {
    var mx = Math.max.apply(null, waves.map(function (w) { return Math.abs(w.peak); }).concat([1e-9]));
    var W = 420, H = 196, x0 = 58, y0 = 96, pw = 340, ph = 66, cls = ["acc", "loss", "st"], s = "";
    s += '<line class="st" x1="' + x0 + '" y1="' + y0 + '" x2="' + (x0 + pw + 8) + '" y2="' + y0 + '"/><line class="st" x1="' + x0 + '" y1="14" x2="' + x0 + '" y2="178"/><text x="' + (x0 + pw + 12) + '" y="' + (y0 + 4) + '">t</text>';
    waves.forEach(function (w, i) {
      var A = w.peak / mx * ph, p0 = (w.phase || 0) * DEG, d = "";
      for (var k = 0; k <= 200; k++) { var t = k / 200 * 2, x = x0 + pw * t / 2, y = y0 - A * Math.sin(2 * Math.PI * t + p0); d += (k ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1); }
      s += '<path class="' + cls[i] + '" d="' + d + '" stroke-width="1.8"/>';
      s += '<line class="' + cls[i] + '" x1="' + x0 + '" y1="' + (y0 - A) + '" x2="' + (x0 + pw) + '" y2="' + (y0 - A) + '" stroke-dasharray="3 3" stroke-width=".7"/>';
      s += '<text class="' + (i === 1 ? "losst" : "acct") + '" x="' + (x0 - 4) + '" y="' + (y0 - A + 4) + '" text-anchor="end" font-size="10.5">' + esc(EM.fmt(w.peak, 4)) + '</text>';
      s += '<text class="' + (i === 1 ? "losst" : "acct") + '" x="' + (x0 + pw * .56 + i * 70) + '" y="' + (y0 - A - 5) + '">' + tx(w.label || "") + "</text>";
    });
    if (f) s += '<line class="st" x1="' + x0 + '" y1="188" x2="' + (x0 + pw / 2) + '" y2="188"/><text x="' + (x0 + pw / 4) + '" y="184" text-anchor="middle" font-size="11">T = 1/f = ' + esc(EM.withUnit(1000 / f, "ms", 3)) + "</text>";
    return svg(W, H + 2, s, "Sine waves");
  };

  /* torque–speed curve; marks: [{x,y,label,key}] ; hl = key to highlight */
  S.curve = function (pts, o) {
    o = o || {};
    var W = 400, H = 240, x0 = 46, y0 = 200, pw = 336, ymax = Math.max(250, Math.max.apply(null, pts.map(function (p) { return p.y; }))) * 1.08;
    function X(v) { return x0 + pw * v / 100; } function Y(v) { return y0 - 170 * v / ymax; }
    var s = "";
    for (var g = 0; g <= ymax; g += 50) s += '<line x1="' + x0 + '" y1="' + Y(g) + '" x2="' + (x0 + pw) + '" y2="' + Y(g) + '" stroke="currentColor" stroke-opacity=".12"/><text x="' + (x0 - 5) + '" y="' + (Y(g) + 4) + '" text-anchor="end" font-size="10">' + g + "</text>";
    for (var h = 0; h <= 100; h += 20) s += '<text x="' + X(h) + '" y="' + (y0 + 14) + '" text-anchor="middle" font-size="10">' + h + "</text>";
    s += '<line class="st" x1="' + x0 + '" y1="' + y0 + '" x2="' + (x0 + pw) + '" y2="' + y0 + '"/><line class="st" x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="16"/>';
    s += '<text x="' + (x0 + pw / 2) + '" y="' + (y0 + 30) + '" text-anchor="middle" font-size="11">% of synchronous speed</text><text transform="translate(12 ' + (y0 + 16) / 2 + ') rotate(-90)" text-anchor="middle" font-size="11">% of rated torque</text>';
    s += '<line x1="' + x0 + '" y1="' + Y(100) + '" x2="' + (x0 + pw) + '" y2="' + Y(100) + '" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 3"/>';
    var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; }), n = xs.length, dx = [], m = [], t = [];
    for (var i = 0; i < n - 1; i++) { dx[i] = xs[i + 1] - xs[i]; m[i] = (ys[i + 1] - ys[i]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (dx[i - 1] + dx[i]) * 3 / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    var d = "M " + X(xs[0]) + " " + Y(ys[0]);
    for (i = 0; i < n - 1; i++) { var hh = dx[i]; d += " C " + X(xs[i] + hh / 3) + " " + Y(ys[i] + t[i] * hh / 3) + " " + X(xs[i + 1] - hh / 3) + " " + Y(ys[i + 1] - t[i + 1] * hh / 3) + " " + X(xs[i + 1]) + " " + Y(ys[i + 1]); }
    s += '<path class="acc" d="' + d + '" stroke-width="2.2"/>';
    (o.marks || []).forEach(function (p) {
      var on = o.hl && o.hl === p.key;
      if (on) s += '<circle class="hl" cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="16"/>';
      s += '<circle class="dot" cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="' + (on ? 4 : 2.8) + '"/>';
      if (p.label) s += '<text class="losst" x="' + (X(p.x) + (p.x > 75 ? -7 : 7)) + '" y="' + (Y(p.y) - 8) + '" text-anchor="' + (p.x > 75 ? "end" : "start") + '" font-size="11" font-weight="' + (on ? 700 : 400) + '">' + esc(p.label) + "</text>";
    });
    if (o.title) s += '<text x="' + W / 2 + '" y="12" text-anchor="middle" font-weight="600">' + esc(o.title) + "</text>";
    return svg(W, H, s, o.title || "Torque-speed curve");
  };
  S.CURVES = {
    generic: { pts: [{ x: 0, y: 160 }, { x: 12, y: 142 }, { x: 25, y: 135 }, { x: 45, y: 150 }, { x: 65, y: 190 }, { x: 80, y: 230 }, { x: 88, y: 205 }, { x: 93, y: 150 }, { x: 97, y: 100 }, { x: 100, y: 0 }],
      marks: [{ x: 0, y: 160, label: "Locked-rotor", key: "LR" }, { x: 25, y: 135, label: "Pull-up", key: "PU" }, { x: 80, y: 230, label: "Breakdown", key: "BD" }, { x: 97, y: 100, label: "Rated", key: "RT" }, { x: 100, y: 0, label: "No load", key: "NL" }] },
    A: { pts: [{ x: 0, y: 150 }, { x: 20, y: 140 }, { x: 40, y: 150 }, { x: 65, y: 200 }, { x: 82, y: 250 }, { x: 90, y: 215 }, { x: 95, y: 140 }, { x: 98, y: 100 }, { x: 100, y: 0 }], title: "Design A / B" },
    C: { pts: [{ x: 0, y: 240 }, { x: 20, y: 205 }, { x: 40, y: 195 }, { x: 60, y: 205 }, { x: 78, y: 215 }, { x: 88, y: 190 }, { x: 94, y: 140 }, { x: 97, y: 100 }, { x: 100, y: 0 }], title: "Design C" },
    D: { pts: [{ x: 0, y: 280 }, { x: 20, y: 268 }, { x: 40, y: 250 }, { x: 60, y: 222 }, { x: 75, y: 190 }, { x: 85, y: 155 }, { x: 92, y: 112 }, { x: 94, y: 100 }, { x: 97, y: 60 }, { x: 100, y: 0 }], title: "Design D" }
  };

  /* single-phase transformer configurations D, E, F */
  S.single = function (which) {
    var W = 150, H = 120, s = "";
    function coil(x0, y, n, r, up) { var d = "M " + x0 + " " + y; for (var k = 0; k < n; k++) d += " a " + r + " " + r + " 0 0 " + (up ? 1 : 0) + " " + (2 * r) + " 0"; return '<path class="st" d="' + d + '"/>'; }
    var yp = 34, ys = 74;
    s += '<line class="st" x1="18" y1="52" x2="132" y2="52"/><line class="st" x1="18" y1="56" x2="132" y2="56"/>';
    function lab(x, y, t) { s += '<text x="' + x + '" y="' + y + '" font-size="9" text-anchor="middle">' + t + "</text>"; }
    if (which === "F") { s += coil(22, yp, 4, 3.5, true) + coil(82, yp, 4, 3.5, true); lab(22, yp - 10, "H1"); lab(50, yp - 10, "H2"); lab(82, yp - 10, "H3"); lab(110, yp - 10, "H4"); }
    else { s += coil(25, yp, 12, 4.2, true); lab(25, yp - 12, "H1"); lab(125, yp - 12, "H2"); }
    if (which === "D") { s += coil(25, ys, 12, 4.2, false); [[25, "X1"], [75, "X2"], [125, "X3"]].forEach(function (p) { s += '<line class="st" x1="' + p[0] + '" y1="' + ys + '" x2="' + p[0] + '" y2="' + (ys + 14) + '"/>'; lab(p[0], ys + 24, p[1]); }); }
    else { s += coil(22, ys, 4, 3.5, false) + coil(82, ys, 4, 3.5, false); [[22, "X1"], [50, "X2"], [82, "X3"], [110, "X4"]].forEach(function (p) { s += '<line class="st" x1="' + p[0] + '" y1="' + ys + '" x2="' + p[0] + '" y2="' + (ys + 12) + '"/>'; lab(p[0], ys + 22, p[1]); }); }
    s += '<text x="' + W / 2 + '" y="116" text-anchor="middle" font-weight="700" font-size="12">' + which + "</text>";
    return svg(W, H, s, "Single-phase transformer " + which);
  };

  S.polarity = function (kind) {
    var W = 170, H = 120, s = '<rect class="box" x="40" y="22" width="90" height="76" rx="6"/>';
    s += '<text x="85" y="64" text-anchor="middle" font-size="11">' + (kind === "add" ? "Additive" : "Subtractive") + "</text>";
    s += '<circle class="dot" cx="52" cy="22" r="3"/><circle class="dot" cx="118" cy="22" r="3"/><text x="52" y="14" text-anchor="middle" font-size="10">H1</text><text x="118" y="14" text-anchor="middle" font-size="10">H2</text>';
    var x1 = kind === "add" ? 118 : 52, x2 = kind === "add" ? 52 : 118;
    s += '<circle class="dot" cx="' + x1 + '" cy="98" r="3"/><circle class="dot" cx="' + x2 + '" cy="98" r="3"/><text x="' + x1 + '" y="114" text-anchor="middle" font-size="10">X1</text><text x="' + x2 + '" y="114" text-anchor="middle" font-size="10">X2</text>';
    s += '<line class="conn" x1="52" y1="26" x2="' + x1 + '" y2="94" stroke-dasharray="3 3"/>';
    return svg(W, H, s, kind === "add" ? "Additive polarity" : "Subtractive polarity");
  };

  S.nameplate = function (rows, title) {
    var W = 320, rh = 22, H = rows.length * rh + 34, s = '<rect class="box" x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="4" stroke-width="2"/>';
    s += '<text x="' + W / 2 + '" y="22" text-anchor="middle" font-weight="700" font-size="11">' + esc(title) + "</text>";
    rows.forEach(function (r, i) {
      var y = 30 + i * rh;
      s += '<line class="st" x1="8" y1="' + y + '" x2="' + (W - 8) + '" y2="' + y + '" stroke-opacity=".4"/>';
      for (var c = 0; c < r.length; c++) s += '<text x="' + (14 + c * 76) + '" y="' + (y + 15) + '" font-size="10" font-weight="' + (c % 2 === 0 ? 700 : 400) + '">' + esc(r[c]) + "</text>";
    });
    return svg(W, H, s, title);
  };
  S.MOTOR_NP = [["HP", "50", "VOLTS", "460"], ["AMPS", "57", "HZ", "60"], ["RPM", "1770", "SF", "1.15"], ["DESIGN", "B", "CODE", "G"], ["CLASS", "F", "PF", "88 %"], ["NOM. EFF.", "93.6 %", "PHASE", "3"]];
  S.XFMR_NP = [["KVA", "500", "PHASE", "3"], ["HV", "4160Δ", "LV", "480Y/277"], ["HZ", "60", "%Z", "5.75"], ["TAPS", "±2×2.5 %", "CLASS", "OA"]];

  S.waveform = function () { return S.sine([{ peak: 1, label: "v(t) = V_m sin(ωt + φ)" }], 0); };
  EM.sketch = S;
})();
