/* E-MECH Solver — stored answers for word / concept questions */
"use strict";
(function () {
  var EM = window.EM, esc = EM.esc;
  var W = [
 {
  "q": "Explain how the secondary current of a transformer is determined. What role does the load impedance play in this process?",
  "a": [
   "The load sets the secondary current.",
   "The secondary voltage is fixed by the turns ratio (V_S = V_P/a), so I_S = V_S/Z_L.",
   "That current then forces the primary current, I_P = I_S/a, because V_P·I_P = V_S·I_S.",
   "Seen from the primary, the load looks like a reflected impedance a²·Z_L.",
   "With no load, I_S = 0 and the primary draws only magnetizing current; lower Z_L means more current on both sides."
  ],
  "tags": "transformer secondary current load impedance email q1"
 },
 {
  "q": "Compare and contrast a Y-connected three-phase transformer with a Delta-connected three-phase transformer. What are the key differences in voltage and current relationships?",
  "a": [
   "Wye: V_L = √3·V_φ, I_L = I_φ; has a neutral (two voltages, e.g. 208Y/120) and each winding sees only V_L/√3.",
   "Delta: V_L = V_φ, I_L = √3·I_φ; no neutral, windings see full line voltage, triplen currents circulate inside, can run open-delta if one unit fails.",
   "Power is S = √3·V_L·I_L either way.",
   "Y-Δ and Δ-Y banks shift line voltage 30°."
  ],
  "tags": "wye delta y comparison transformer email q2"
 },
 {
  "q": "An open-delta transformer connection uses only two transformers instead of three. Explain why this configuration is sometimes used and what trade-off is made compared to a full three-phase connection.",
  "a": [
   "Used in an emergency when one unit of a Δ-Δ bank fails (service continues), during maintenance, or for a small load now with a third unit added later.",
   "Trade-off: capacity is only 57.7 % (≈ 58 %) of the full three-transformer bank, and voltage balance is slightly worse."
  ],
  "tags": "open delta v-v two transformers email q3"
 },
 {
  "q": "Explain the purpose of an autotransformer and how it differs from a conventional two-winding transformer. What is the advantage of using an autotransformer in certain applications?",
  "a": [
   "One winding with a tap, shared by primary and secondary, so the circuits are electrically connected (no isolation).",
   "Part of the power passes directly by conduction.",
   "Advantages: smaller, cheaper, more efficient, best for small ratios — reduced-voltage motor starting (50/65/80 % taps), boosters, tap changers.",
   "Disadvantage: no isolation; if the common section opens, full primary voltage reaches the load."
  ],
  "tags": "autotransformer tap email q4"
 },
 {
  "q": "Describe the relationship between mechanical power and electrical power in a motor. How are these two forms of power related, and what factors affect the conversion between them?",
  "a": [
   "Electrical input P_in = √3·V·I·cos θ; mechanical output P_out = τ·ω (hp = τ·n/5252).",
   "They are linked by efficiency η = P_out/P_in.",
   "The difference is losses: stator copper, core (hysteresis and eddy), rotor copper, friction and windage, stray.",
   "Factors: load level (efficiency falls at light load), slip, power factor, voltage, temperature, motor size and design. 1 hp = 746 W."
  ],
  "tags": "mechanical electrical power efficiency losses email q5"
 },
 {
  "q": "Describe the rotating magnetic field in a three-phase induction motor. How is this field created, and why is it essential for motor operation? Use the following vocabulary in your response: windings, RMF, stator flux, induction, rotor flux, squirrel cage, torque.",
  "a": [
   "Three stator windings 120° apart in space carry three-phase currents 120° apart in time; their fluxes combine into a constant-magnitude RMF turning at n_s = 120f/P.",
   "The stator flux sweeps the squirrel-cage bars and, by induction, drives current in them; that current creates rotor flux, which interacts with the stator flux to produce torque in the direction of the RMF.",
   "Without the RMF there is no induced rotor current and no torque.",
   "Swapping two leads reverses it."
  ],
  "tags": "rotating magnetic field rmf stator rotor induction email q6 + past exam 2 q3"
 },
 {
  "q": "Define synchronous speed, rotor speed, and slip in an induction motor. Explain the relationship between these three quantities.",
  "a": [
   "Synchronous speed n_s = 120f/P is the speed of the RMF.",
   "Rotor speed n_r is the actual shaft speed, always below n_s.",
   "Slip s = (n_s − n_r)/n_s; n_r = n_s(1 − s); slip speed = n_s − n_r; rotor frequency f_r = s·f.",
   "Slip rises with load; typical full-load slip is a few percent."
  ],
  "tags": "synchronous speed slip rotor speed email q7"
 },
 {
  "q": "Explain why an induction motor cannot operate at synchronous speed under load. What would happen if the rotor speed equaled the synchronous speed?",
  "a": [
   "Torque comes from current induced in the rotor, which needs relative motion between the RMF and the bars.",
   "At n_r = n_s there is no relative motion → no induced voltage → no rotor current → zero torque, so friction and load slow it back down until the slip produces enough torque to match the load.",
   "Driven above n_s it becomes a generator."
  ],
  "tags": "synchronous speed torque zero email q8"
 },
 {
  "q": "Describe the typical shape of an induction motor's torque-speed curve. Identify and explain the significance of key points on this curve (starting torque, pull-up torque, breakdown torque, rated torque).",
  "a": [
   "Torque (% rated) vs speed (% n_s): starts high, dips, rises to a peak, then falls steeply to zero at n_s.",
   "Locked-rotor (starting): torque at zero speed, must exceed the load's starting torque.",
   "Pull-up: minimum during acceleration; load above it → motor hangs.",
   "Breakdown: maximum (≈200 %+, near 70–80 % n_s); load beyond it stalls the motor.",
   "Rated: torque at rated hp, V and f on the steep near-linear section at small slip."
  ],
  "tags": "torque speed curve breakdown pull-up locked rotor email q9"
 },
 {
  "q": "Explain the characteristics of NEMA Design D motors. What types of loads require the high starting torque of Design D motors? Draw a typical Design D torque-speed curve identifying the key points on the curve.",
  "a": [
   "Very high locked-rotor torque (≥ 275 %), low starting current, high slip (5–8 %, some sources 5–13 %), high-resistance rotor bars, lower efficiency.",
   "Loads: high-inertia — punch presses with flywheels, shears, hoists, cranes, elevators.",
   "Curve: highest at standstill (locked-rotor = maximum torque), falls continuously with no pull-up dip or separate peak, crosses rated torque at high slip, zero at n_s."
  ],
  "tags": "nema design d email q10"
 },
 {
  "q": "Explain triplen harmonics. What are their sources, and what effect do they have in a three-phase, four-wire distribution system with a delta–wye transformer? Use: neutral, delta primary, overheating, K-factor.",
  "a": [
   "Triplens are odd multiples of the 3rd harmonic (3rd, 9th, 15th).",
   "Sources: single-phase non-linear loads — computer power supplies, electronic ballasts, VFDs, UPSs, welders.",
   "In a 4-wire wye they add (not cancel) in the neutral, so neutral current can exceed phase current and overheat (no breaker in the neutral).",
   "They are reflected into the delta primary where they circulate and cause overheating, and they don't show on line ammeters.",
   "Fixes: oversized neutrals and K-factor-rated transformers."
  ],
  "tags": "triplen harmonics neutral k-factor your list #17"
 },
 {
  "q": "Sketch the primary and secondary voltage waveforms (v vs t) for a 240/120 V, 60 Hz step-down transformer with subtractive polarity. Label the peak values and the period.",
  "a": [
   "Both are sine waves at 60 Hz (period 16.7 ms), in phase with each other.",
   "Primary peak = 240√2 = 339 V; secondary peak = 120√2 = 170 V (half the height).",
   "Step-down → secondary smaller; step-up → secondary larger."
  ],
  "tags": "waveform sketch step down v-t your list #14"
 },
 {
  "q": "Explain the following nameplate items: Design letter (A–E), Code letter (A–V), Class letter (A, B, F, H) and Service factor (1.0, 1.15, 1.25, 1.50).",
  "a": [
   "Design letter: rotor construction → NEMA torque-speed characteristics.",
   "Code letter: locked-rotor kVA per hp (A→V increasing) → expected inrush.",
   "Class letter: insulation temperature class (max winding rise above 40 °C ambient).",
   "Service factor: multiplier giving permissible continuous overload at rated V and f; running at SF shortens life."
  ],
  "tags": "nameplate design code class service factor your list #2, #4; past exam 2 q5"
 },
 {
  "q": "Explain what 4160–480Y/277 V means on a transformer nameplate. Why are 277 V lighting loads connected line-to-neutral, and what happens to the neutral current when the loads are balanced and linear?",
  "a": [
   "4160 V delta primary; separate 480 V wye secondary with neutral; 480/√3 = 277 V line-to-neutral. 277 V loads connect line-to-neutral to get that voltage from a 480 V system.",
   "Balanced linear loads → phase currents cancel, neutral current ≈ 0 (non-linear loads add triplens instead)."
  ],
  "tags": "nameplate 4160 480y 277 neutral your list #13, #18"
 },
 {
  "q": "State Faraday's law and Lenz's law, and explain how they work together.",
  "a": [
   "**Faraday's law:** a changing magnetic flux through a coil induces a voltage, V = N·ΔΦ/Δt (more turns or faster change → more voltage).",
   "**Lenz's law:** the induced voltage drives a current whose magnetic field opposes the change in flux that caused it (the minus sign in V = −N·dΦ/dt).",
   "Together: Faraday gives how big the induced voltage is; Lenz gives its direction.",
   "This is how transformers and induction motors work: changing flux in the core or the air gap induces voltage in the other winding."
  ],
  "tags": "faraday lenz induced voltage flux"
 },
 {
  "q": "Why are transformer cores laminated?",
  "a": [
   "The changing flux induces small circulating currents (eddy currents) in the iron core, which waste power as heat.",
   "Thin, insulated laminations break up those current paths, so eddy-current loss drops.",
   "Silicon steel reduces hysteresis loss; laminations reduce eddy-current loss. Together they make up the core loss."
  ],
  "tags": "laminations eddy current core loss hysteresis"
 },
 {
  "q": "What are the rules for working with instrument transformers (CTs and PTs)?",
  "a": [
   "**Never open-circuit a CT secondary** while the primary carries current — it develops a dangerously high voltage and can magnetize the core. Short it before removing the meter.",
   "**Never short-circuit a PT secondary** — it will draw excessive current and burn out.",
   "Observe polarity markings so meters and relays read correctly; ground the secondaries."
  ],
  "tags": "ct pt instrument transformer current potential safety"
 },
 {
  "q": "Describe the three types of mechanical load.",
  "a": [
   "**Constant torque:** torque stays the same at any speed — conveyors, reciprocating compressors, hoists.",
   "**Variable torque:** torque rises with speed (roughly with speed²) — centrifugal fans and pumps.",
   "**Constant horsepower:** torque falls as speed rises — lathes, winders, machine tools."
  ],
  "tags": "mechanical load constant torque variable torque constant horsepower fans pumps conveyor"
 },
 {
  "q": "How does a wound-rotor induction motor control starting?",
  "a": [
   "The rotor has windings brought out through slip rings to external resistors.",
   "Adding resistance at start gives **higher starting torque and lower starting current**.",
   "It moves breakdown torque to a lower speed but does not raise its value.",
   "Resistance is cut out as the motor speeds up; it can also give limited speed control (with lower efficiency)."
  ],
  "tags": "wound rotor slip rings external resistance starting torque"
 },
 {
  "q": "Compare the NEMA design letters A, B, C and D.",
  "a": [
   "**A:** normal starting torque, high starting current, low slip.",
   "**B:** normal starting torque, normal starting current — the most common (fans, pumps, general purpose).",
   "**C:** high starting torque (~200–250 %) — loaded starts such as conveyors, compressors, crushers.",
   "**D:** very high starting torque (≥ 275 %), high slip — high-inertia loads such as punch presses, hoists, cranes."
  ],
  "tags": "nema design a b c d letter comparison"
 },
 {
  "q": "Explain how a consequent pole is formed in a multi-speed motor.",
  "a": [
   "Each phase winding is center-tapped so it can be reconnected.",
   "For low speed, the coils are connected so all the stator poles have the **same polarity**; opposite-polarity **consequent poles** form between them.",
   "That doubles the pole count, so n_s = 120f/P (the **synchronous speed** and **RMF** speed) halves — a **2:1 speed ratio**.",
   "Configurations: constant torque, variable torque, constant horsepower."
  ],
  "tags": "consequent pole two speed multi speed center tap"
 },
 {
  "q": "Explain subtractive and additive polarity. What happens if two transformers are paralleled with the wrong polarity?",
  "a": [
   "**Subtractive:** H1 and X1 directly across from each other; a jumper between adjacent terminals reads V_H − V_X (standard).",
   "**Additive:** H1 and X1 diagonal; the same test reads V_H + V_X.",
   "Wrong polarity in parallel puts the windings in series opposition — effectively a short circuit with huge circulating current.",
   "Always tie like-marked terminals (H1–H1, X1–X1) and use equal turns ratios."
  ],
  "tags": "polarity subtractive additive parallel transformers"
 },
 {
  "q": "Compare the single-phase transformer configurations D, E and F.",
  "a": [
   "**D:** one primary (H1–H2) and one center-tapped secondary (X1–X2–X3): dual voltage such as 240/120 V.",
   "**E:** one primary and two separate secondaries (X1–X2, X3–X4) that can go in series or parallel.",
   "**F:** two primaries (H1–H4) and two secondaries (X1–X4): dual voltage on both sides."
  ],
  "tags": "single phase d e f configuration center tap"
 },
 {
  "q": "What does a transformer turns-ratio test tell you?",
  "a": [
   "Compare the measured voltage ratio (TVR) to the nameplate ratio (NVR); acceptable if within 0.5 %.",
   "TVR higher than nameplate → shorted turns in the secondary (low-side) winding.",
   "TVR lower than nameplate → shorted turns in the primary (high-side) winding."
  ],
  "tags": "ttr turns ratio test shorted turns"
 },
 {
  "q": "Why does voltage unbalance matter for a motor?",
  "a": [
   "%VUB = largest deviation from the average ÷ average × 100.",
   "A small voltage unbalance causes a current unbalance about 6–10 times larger, which overheats the windings.",
   "Derate the motor above about 1 % unbalance; over 5 % is not recommended."
  ],
  "tags": "voltage unbalance derate current unbalance"
 },
 {
  "q": "Why do power factor and efficiency drop at light load?",
  "a": [
   "At light load the magnetizing (reactive) current stays about the same while the real power drops, so the power factor falls.",
   "Fixed losses (core, friction and windage) become a larger share of a small output, so efficiency falls.",
   "Motors are most efficient and have the best power factor near rated load."
  ],
  "tags": "power factor efficiency light load"
 }
];
  EM.WORDS = W;
  var root = document.getElementById("view-words"), qtext = "";
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/([A-Za-z])_([A-Za-z0-9φ]+)/g, "$1<sub>$2</sub>"); }
  function render() {
    var terms = qtext.toLowerCase().split(/\s+/).filter(Boolean);
    var list = W.map(function (w, i) {
      var q = (w.q + " " + w.tags).toLowerCase(), all = (q + " " + w.a.join(" ")).toLowerCase();
      if (!terms.every(function (t) { return all.indexOf(t) >= 0; })) return null;
      var sc = 0; terms.forEach(function (t) { if (w.tags.toLowerCase().indexOf(t) >= 0) sc += 3; if (w.q.toLowerCase().indexOf(t) >= 0) sc += 2; });
      if (terms.length && w.tags.toLowerCase().indexOf(terms.join(" ")) >= 0) sc += 5;
      return { w: w, sc: sc, i: i };
    }).filter(Boolean).sort(function (a, b) { return b.sc - a.sc || a.i - b.i; }).map(function (x) { return x.w; });
    root.innerHTML = '<section class="card"><h2>Word questions</h2><p class="hint">Stored answers in the answer-key style: define each term, give the relationship, explain the effect. If a question lists vocabulary, use every word.</p>' +
      '<input type="search" id="w-q" placeholder="Search, e.g. open delta, RMF, triplen" aria-label="Search word questions" value="' + esc(qtext) + '"></section>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">' + (list.length ? list.map(function (w, i) { return '<details class="qa"' + (terms.length && i === 0 ? " open" : "") + "><summary>" + md(w.q) + "</summary><ul>" + w.a.map(function (b) { return "<li>" + md(b) + "</li>"; }).join("") + "</ul></details>"; }).join("") : '<p class="hint">No stored answer matches. Try fewer words.</p>') + "</div>";
    var i = document.getElementById("w-q");
    i.addEventListener("input", function () { qtext = i.value; var pos = i.selectionStart; render(); var j = document.getElementById("w-q"); j.focus(); try { j.setSelectionRange(pos, pos); } catch (e) { } });
  }
  EM.views.words = { render: render };
})();
