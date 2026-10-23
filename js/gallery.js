/* E-MECH Solver — "What am I looking at?" diagram gallery */
"use strict";
(function () {
  var EM = window.EM, Q = EM.Q, esc = EM.esc, SK = EM.sketch;
  var G = { card: null, tree: null, hl: "LR", vals: {} };

  function conn(p, s) { var m = { D: "delta", Y: "wye", O: "open" }; return SK.bank(m[p], m[s]); }
  var CARDS = [
    // 3φ connections
    { id: "DD", grp: "3φ transformer connections", name: "Delta–Delta (Δ–Δ)", draw: function () { return conn("D", "D"); },
      spot: ["No neutral line on either side (no N1, no N2).", "Each coil connects between two lines (H1 to one line, H2 to the next)."],
      means: ["Both sides: V_L = V_φ, I_L = √3·I_φ.", "No phase shift between primary and secondary.", "If one unit fails it can run as open delta at 57.7 % capacity.", "No neutral, so no 4-wire service."],
      act: { label: "Use Δ–Δ in Quick", ctx: { phase: 3, xf: "DD" } } },
    { id: "YY", grp: "3φ transformer connections", name: "Wye–Wye (Y–Y)", draw: function () { return conn("Y", "Y"); },
      spot: ["Neutral on both sides: N1 on top and N2 on the bottom.", "Every H2 tied to N1 and every X2 tied to N2."],
      means: ["Both sides: V_L = √3·V_φ, I_L = I_φ.", "No phase shift.", "Each transformer sees the line-to-neutral voltage (e.g. 7.2 kV and 120 V on a 12.47 kV / 208Y/120 bank)."],
      act: { label: "Use Y–Y in Quick", ctx: { phase: 3, xf: "YY" } } },
    { id: "DY", grp: "3φ transformer connections", name: "Delta–Wye (Δ–Y)", draw: function () { return conn("D", "Y"); },
      spot: ["No neutral on top (primary) — coils go line to line.", "Neutral N2 on the bottom with all X2 tied to it."],
      means: ["Primary (Δ): V_L = V_φ, I_L = √3·I_φ.", "Secondary (Y): V_L = √3·V_φ, I_L = I_φ.", "30° phase shift.", "Most common step-down for 4-wire service, e.g. 4160–480Y/277."],
      act: { label: "Use Δ–Y in Quick", ctx: { phase: 3, xf: "DY" } } },
    { id: "YD", grp: "3φ transformer connections", name: "Wye–Delta (Y–Δ)", draw: function () { return conn("Y", "D"); },
      spot: ["Neutral N1 on top with all H2 tied to it.", "No neutral on the bottom — secondary coils go line to line."],
      means: ["Primary (Y): V_L = √3·V_φ, I_L = I_φ.", "Secondary (Δ): V_L = V_φ, I_L = √3·I_φ.", "30° phase shift.", "Common step-up at generating stations."],
      act: { label: "Use Y–Δ in Quick", ctx: { phase: 3, xf: "YD" } } },
    { id: "OO", grp: "3φ transformer connections", name: "Open delta (V–V)", draw: function () { return conn("O", "O"); },
      spot: ["Only two transformers.", "T1 across A–B and T2 across B–C on both sides; no neutral."],
      means: ["Capacity = √3 × one unit = 57.7 % of the full Δ–Δ bank (not 2/3).", "Used when one unit fails or is out for maintenance, or for a small load now with a third unit later."],
      act: { label: "Use open delta in Quick", ctx: { phase: 3, xf: "OO" } } },
    // single phase
    { id: "D", grp: "Single-phase transformers", name: "D — one secondary, center-tapped", draw: function () { return SK.single("D"); },
      spot: ["Two H terminals (H1, H2).", "Three X terminals: X1, X2, X3 on one winding."],
      means: ["Dual-voltage secondary, e.g. 240/120 V: 120 V from X1–X2 and X2–X3, 240 V from X1–X3.", "X2 is the center tap and the grounded neutral on a pole transformer."],
      act: { label: "Use single transformer in Quick", ctx: { phase: 1, xf: "single" } } },
    { id: "E", grp: "Single-phase transformers", name: "E — two separate secondaries", draw: function () { return SK.single("E"); },
      spot: ["Two H terminals.", "Four X terminals: two separate windings X1–X2 and X3–X4."],
      means: ["Secondaries can be connected in series (higher voltage) or parallel (more current).", "Series: join X2 to X3 and use X1–X4."],
      act: { label: "Use single transformer in Quick", ctx: { phase: 1, xf: "single" } } },
    { id: "F", grp: "Single-phase transformers", name: "F — dual primary and dual secondary", draw: function () { return SK.single("F"); },
      spot: ["Four H terminals (two primary windings).", "Four X terminals (two secondary windings)."],
      means: ["Dual voltage on both sides (e.g. 240/480 primary, 120/240 secondary).", "Series for the higher voltage, parallel for the lower."],
      act: { label: "Use single transformer in Quick", ctx: { phase: 1, xf: "single" } } },
    { id: "pSub", grp: "Single-phase transformers", name: "Subtractive polarity", draw: function () { return SK.polarity("sub"); },
      spot: ["H1 and X1 are directly across from each other."],
      means: ["Standard polarity. A jumper between adjacent terminals reads V_H − V_X.", "Parallel transformers only with like-marked terminals tied (H1–H1, X1–X1) and equal ratios; wrong polarity is a short circuit."] },
    { id: "pAdd", grp: "Single-phase transformers", name: "Additive polarity", draw: function () { return SK.polarity("add"); },
      spot: ["H1 and X1 are diagonal from each other."],
      means: ["A jumper between adjacent terminals reads V_H + V_X."] },
    // curves
    { id: "curve", grp: "Motor torque-speed curves", name: "Torque-speed curve (read the points)", curve: "generic",
      draw: function () { var c = SK.CURVES.generic; return SK.curve(c.pts, { marks: c.marks, hl: G.hl }); },
      spot: ["x-axis: % of synchronous speed. y-axis: % of rated torque.", "Starts on the left axis, dips, rises to a hump, then drops to 0 at 100 % speed."],
      means: ["Locked-rotor: the height where the curve touches the left axis (0 % speed).", "Pull-up: the lowest dip between the left axis and the hump. No dip → pull-up = locked-rotor.", "Breakdown: the very top of the hump (usually 70–85 % speed).", "Rated: always 100 % — you never read it; it sits on the steep right side near 95–98 % speed.", "No load: where the curve hits 0 at 100 % speed."],
      inputs: [["LRpct", "Locked-rotor %", "LR"], ["PUpct", "Pull-up %", "PU"], ["BDpct", "Breakdown %", "BD"], ["hp", "Horsepower (from the question)"], ["nr", "Rated rpm (from the question)"]],
      act: { label: "Find the torques in Quick", target: "tau_BD" } },
    { id: "curveAB", grp: "Motor torque-speed curves", name: "Design A / B", draw: function () { var c = SK.CURVES.A; return SK.curve(c.pts, { title: c.title, marks: [{ x: 0, y: 150, label: "LR ~150%" }, { x: 82, y: 250, label: "BD ~200–250%" }] }); },
      spot: ["Normal starting torque (~150 %), clear dip and hump, rated at small slip."],
      means: ["B is the most common (fans, pumps, general use) with normal starting current.", "A is similar but higher starting current."] },
    { id: "curveC", grp: "Motor torque-speed curves", name: "Design C", draw: function () { var c = SK.CURVES.C; return SK.curve(c.pts, { title: c.title, marks: [{ x: 0, y: 240, label: "LR ~200–250%" }] }); },
      spot: ["High starting torque (~200–250 %), flatter curve, breakdown not much higher than starting."],
      means: ["Loaded starts: conveyors, compressors, crushers."] },
    { id: "curveD", grp: "Motor torque-speed curves", name: "Design D", curve: "D", draw: function () { var c = SK.CURVES.D; return SK.curve(c.pts, { title: c.title, marks: [{ x: 0, y: 280, label: "LR = BD (≥ 275%)" }, { x: 94, y: 100, label: "Rated (high slip)" }] }); },
      spot: ["Starts at its highest point and falls the whole way — no dip and no separate hump."],
      means: ["Locked-rotor = breakdown = pull-up: read the one number at the left axis.", "Very high starting torque (≥ 275 %), high slip (5–8 %+).", "High-inertia loads: punch presses with flywheels, hoists, cranes, elevators."],
      inputs: [["LRpct", "Locked-rotor % (left-axis value)", "LR"], ["hp", "Horsepower"], ["nr", "Rated rpm"]], designD: true,
      act: { label: "Find the torques in Quick", target: "tau_LR1" } },
    // nameplates
    { id: "npMotor", grp: "Nameplates", name: "Motor nameplate", draw: function () { return SK.nameplate(SK.MOTOR_NP, "3 PH INDUCTION MOTOR"); },
      spot: ["Says HP, RPM, SF, CODE, DESIGN."],
      means: ["HP / VOLTS / AMPS / RPM / HZ: the rated values.", "CODE letter: locked-rotor kVA per hp → starting current range.", "DESIGN letter: torque-speed curve shape (A–D).", "CLASS: insulation temperature class.", "SF: service factor (max continuous load = SF × hp)."],
      inputs: [["hp", "HP"], ["V_L", "VOLTS"], ["I_L", "AMPS"], ["nr", "RPM"], ["f", "HZ"], ["code", "CODE (letter)"], ["SF", "SF"], ["pf", "PF (decimal or %)"], ["eta_np", "NOM. EFF. %"]],
      act: { label: "Send to Quick", target: "I_LRmin" } },
    { id: "npXfmr", grp: "Nameplates", name: "Transformer nameplate", draw: function () { return SK.nameplate(SK.XFMR_NP, "3 PH TRANSFORMER"); },
      spot: ["Says KVA, HV, LV (or H and X voltages)."],
      means: ["A long dash (–) separates windings: 4160–480Y/277 = 4160 V delta primary, 480 V wye secondary.", "Y = wye with neutral; 480/√3 = 277 V line-to-neutral.", "A slash (/) between voltages = one winding, two voltages; × = series/parallel reconnectable.", "Δ symbol or no Y = delta."],
      inputs: [["S_bank", "KVA (load or rating)"], ["V_LP", "HV line voltage"], ["V_LS", "LV line voltage"]],
      act: { label: "Send to Quick (Δ–Y)", ctx: { phase: 3, xf: "DY" }, target: "I_LS" } },
    // others
    { id: "tri", grp: "Other pictures", name: "Power triangle", draw: function () { return SK.triangle(80000, 60000, { k: 1000 }); },
      spot: ["Right triangle: horizontal P, vertical Q, slanted S, angle θ at the origin."],
      means: ["S = √(P² + Q²), pf = cos θ = P/S.", "Q up = lagging (inductive); Q down = leading."],
      inputs: [["P", "P (kW)"], ["Qr", "Q (kvar)"], ["S", "S (kVA)"], ["pf", "pf"]], act: { label: "Send to Quick", target: "S" } },
    { id: "flow", grp: "Other pictures", name: "Power-flow diagram", draw: function () { return SK.flow([{ label: "P_in", v: 58.24 }, { label: "P_AG", v: 53.84 }, { label: "P_conv", v: 52.74 }, { label: "P_out", v: 51.44 }], [{ label: "SCL + core", v: 4.4 }, { label: "RCL", v: 1.1 }, { label: "F&W + stray", v: 1.3 }], "kW", 1); },
      spot: ["Boxes left to right with loss arrows dropping down between them."],
      means: ["P_in → (− stator copper, − core) → P_AG → (− rotor copper) → P_conv → (− friction & windage, − stray) → P_out.", "η = P_out / P_in."],
      inputs: [["P_in", "P_in (kW)"], ["P_SCL", "Stator copper (kW)"], ["P_core", "Core (kW)"], ["P_RCL", "Rotor copper (kW)"], ["P_FW", "F&W (kW)"], ["P_stray", "Stray (kW)"]], act: { label: "Send to Quick", target: "eta" } },
    { id: "sine", grp: "Other pictures", name: "Sine wave v(t)", draw: function () { return SK.sine([{ peak: 170, label: "v(t)" }], 60); },
      spot: ["x-axis is time; wave goes above and below zero."],
      means: ["The height of the top is the peak V_m; V_rms = V_m/√2.", "One full cycle is the period T; f = 1/T and ω = 2πf.", "Primary and secondary of a step-down transformer: same frequency, in phase, secondary shorter by the turns ratio."],
      inputs: [["Vm", "Peak (V)"], ["T", "Period (s)"], ["f", "Frequency (Hz)"], ["w", "ω (rad/s)"]], act: { label: "Send to Quick", target: "Vrms" } }
  ];
  var GROUPS = ["3φ transformer connections", "Single-phase transformers", "Motor torque-speed curves", "Nameplates", "Other pictures"];

  var TREE = {
    start: { q: "What does the picture mostly show?", o: [["A graph with a curve or wave", "graph"], ["A plate or table of words and numbers", "plate"], ["Lines labelled A, B, C with coils between them", "bank"], ["One transformer with H and X terminals", "single"], ["A right triangle", "#tri"], ["Boxes with arrows dropping down", "#flow"]] },
    graph: { q: "What is on the x-axis?", o: [["Time — the wave goes up and down", "#sine"], ["Speed (% of synchronous) with torque up the side", "curveshape"]] },
    curveshape: { q: "What shape is the curve?", o: [["Starts at its highest point and falls the whole way", "#curveD"], ["Dips, then rises to a big hump, then drops to zero", "#curve"]] },
    plate: { q: "Which words are on it?", o: [["HP, RPM, CODE, SF", "#npMotor"], ["KVA, HV, LV (or H / X voltages)", "#npXfmr"]] },
    bank: { q: "How many transformers (coil pairs)?", o: [["Two", "#OO"], ["Three", "n1"]], tip: "If the neutral lines aren't drawn, look at the coils: a coil wired between two lines is delta; coils with one end all tied together are wye." },
    n1: { q: "Is there a neutral line (N1) on the top / primary side?", o: [["Yes", "n2y"], ["No", "n2n"]] },
    n2y: { q: "Is there a neutral line (N2) on the bottom / secondary side?", o: [["Yes", "#YY"], ["No", "#YD"]] },
    n2n: { q: "Is there a neutral line (N2) on the bottom / secondary side?", o: [["Yes", "#DY"], ["No", "#DD"]] },
    single: { q: "What are you looking at?", o: [["How the terminals are arranged (polarity)", "pol"], ["How many terminals there are", "xcount"]] },
    pol: { q: "Where is X1 compared with H1?", o: [["Straight across", "#pSub"], ["Diagonal", "#pAdd"]] },
    xcount: { q: "How many X terminals?", o: [["Three (X1, X2, X3)", "#D"], ["Four (X1–X4)", "hcount"]] },
    hcount: { q: "How many H terminals?", o: [["Two (H1, H2)", "#E"], ["Four (H1–H4)", "#F"]] }
  };

  var root = document.getElementById("view-gallery");
  function md(s) { return esc(s).replace(/([A-Za-zτη])_([A-Za-z0-9φ]+)/g, "$1<sub>$2</sub>"); }
  function cardOf(id) { return CARDS.filter(function (c) { return c.id === id; })[0]; }
  function render() {
    var h = "";
    if (G.tree) {
      var n = TREE[G.tree];
      h = '<section class="card"><button class="btn small ghost backlink" type="button" data-home="1">← All diagrams</button><h2>Help me identify it</h2><div class="tree"><div class="q">' + esc(n.q) + '</div><div class="opts">' + n.o.map(function (o) { return '<button class="btn" type="button" data-go="' + o[1] + '">' + esc(o[0]) + "</button>"; }).join("") + "</div>" + (n.tip ? '<p class="hint">' + esc(n.tip) + "</p>" : "") + "</div></section>";
    } else if (G.card) {
      var c = cardOf(G.card);
      h = '<div class="grid2"><section class="card"><button class="btn small ghost backlink" type="button" data-home="1">← All diagrams</button><h2>' + esc(c.name) + '</h2><div class="sk" id="g-draw">' + c.draw() + "</div>" +
        '<div class="grp">How to spot it</div><ul>' + c.spot.map(function (s) { return "<li>" + md(s) + "</li>"; }).join("") + "</ul>" +
        '<div class="grp">What it tells you</div><ul>' + c.means.map(function (s) { return "<li>" + md(s) + "</li>"; }).join("") + "</ul></section>";
      h += '<section class="card"><h2>' + (c.inputs ? "Enter what you read" : "Use it") + "</h2>";
      if (c.inputs) {
        h += '<div class="form" style="grid-template-columns:1fr">' + c.inputs.map(function (inp) {
          var id = inp[0];
          return '<div class="field"><label for="g-' + id + '">' + esc(inp[1]) + ' <span class="sym">' + EM.symH(id) + "</span></label><div class=\"inp\"><input type=\"text\" inputmode=\"" + (Q[id].opts.str ? "text" : "decimal") + '" id="g-' + id + '" data-g="' + id + '"' + (inp[2] ? ' data-hl="' + inp[2] + '"' : "") + ' value="' + esc(G.vals[id] != null ? G.vals[id] : "") + '"></div></div>';
        }).join("") + "</div>";
        if (c.designD) h += '<p class="hint">Design D: pull-up and breakdown are set equal to the locked-rotor value automatically.</p>';
        if (c.curve === "generic") h += '<p class="hint">Tap a box above and the matching point lights up on the curve.</p>';
      }
      if (c.act) h += '<button class="btn primary" type="button" data-act="1">' + esc(c.act.label) + "</button>";
      else h += '<p class="hint">This one is for recognizing and explaining — there are no numbers to read from it.</p>';
      h += "</section></div>";
    } else {
      h = '<section class="card"><h2>What am I looking at?</h2><p class="hint">Match the picture in the question to one of these, or answer a few quick questions.</p><button class="btn primary" type="button" data-go="start" style="align-self:flex-start">Help me identify it</button></section>';
      GROUPS.forEach(function (gname) {
        h += '<div class="grp" style="margin:14px 0 6px">' + esc(gname) + '</div><div class="cards">' + CARDS.filter(function (c) { return c.grp === gname; }).map(function (c) { return '<button class="gcard" type="button" data-card="' + c.id + '"><span class="thumb sk">' + c.draw() + "</span><b>" + esc(c.name) + "</b></button>"; }).join("") + "</div>";
      });
    }
    root.innerHTML = h;
  }
  function readVals(c) {
    var items = [];
    (c.inputs || []).forEach(function (inp) {
      var id = inp[0], raw = G.vals[id]; if (raw == null || String(raw).trim() === "") return;
      var q = Q[id];
      if (q.opts.str) { items.push({ id: id, v: String(raw).trim().toUpperCase() }); return; }
      var r = EM.parseEntry(id + " " + raw, { phase: 3, xf: "none" });
      if (r.items && r.items[0] && r.items[0].id === id) items.push({ id: id, v: r.items[0].v });
      else { var n = parseFloat(raw); if (isFinite(n)) items.push({ id: id, v: q.opts.frac && n > 1 ? n / 100 : n }); }
    });
    if (c.designD) { var lr = items.filter(function (i) { return i.id === "LRpct"; })[0]; if (lr) { items.push({ id: "PUpct", v: lr.v, note: "Design D: pull-up = locked-rotor" }); items.push({ id: "BDpct", v: lr.v, note: "Design D: breakdown = locked-rotor" }); } }
    return items;
  }
  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-card],[data-home],[data-go],[data-act]"); if (!b) return;
    if (b.dataset.card) { G.card = b.dataset.card; G.tree = null; G.vals = {}; G.hl = "LR"; render(); window.scrollTo(0, 0); return; }
    if (b.dataset.home) { G.card = null; G.tree = null; render(); return; }
    if (b.dataset.go) { var t = b.dataset.go; if (t[0] === "#") { G.card = t.slice(1); G.tree = null; G.vals = {}; } else G.tree = t; render(); window.scrollTo(0, 0); return; }
    if (b.dataset.act) { var c = cardOf(G.card); EM.loadIntoQuick(readVals(c), c.act.ctx, c.act.target); }
  });
  root.addEventListener("input", function (e) { var id = e.target.dataset.g; if (id) G.vals[id] = e.target.value; });
  root.addEventListener("focusin", function (e) {
    var hl = e.target.dataset && e.target.dataset.hl; if (!hl) return;
    var c = cardOf(G.card); if (!c || c.curve !== "generic") return;
    G.hl = hl; var d = document.getElementById("g-draw"); if (d) d.innerHTML = c.draw();
  });
  EM.views.gallery = { render: render };
  EM.GALLERY = CARDS;
})();
