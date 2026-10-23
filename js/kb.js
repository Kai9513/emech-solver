/* E-MECH Solver — knowledge base: every quantity and every relationship from the E-MECH playbook. */
"use strict";
(function () {
  var EM = window.EM;

  /* ---------- quantities ----------
     id: [symbol, name in words, dimension, group, aliases, opts]
     opts.frac  = stored as a fraction (pf, slip); a % input is divided by 100
     opts.str   = text value (code letter)                                      */
  var Q = {
    // AC waveforms and phasors
    Vm: ["V_m", "Peak voltage", "voltage", "ac", ["vm", "vpk", "vpeak", "vmax", "peak", "peakvoltage", "amplitude"]],
    Vrms: ["V_{rms}", "RMS voltage", "voltage", "ac", ["vrms", "rms", "rmsvoltage", "veff", "effective"]],
    Vavg: ["V_{avg}", "Average voltage (half cycle)", "voltage", "ac", ["vavg", "vave", "avg", "average", "averagevoltage", "vdc"]],
    Vpp: ["V_{pp}", "Peak-to-peak voltage", "voltage", "ac", ["vpp", "peaktopeak", "p-p"]],
    Im: ["I_m", "Peak current", "current", "ac", ["im", "ipk", "ipeak", "imax", "peakcurrent"]],
    Irms: ["I_{rms}", "RMS current", "current", "ac", ["irms", "rmscurrent"]],
    w: ["ω", "Angular frequency", "angfreq", "ac", ["w", "omega", "ω", "angularfrequency", "radpersec"]],
    f: ["f", "Frequency", "freq", "ac", ["f", "freq", "frequency", "hz", "linefrequency", "supplyfrequency"]],
    T: ["T", "Period", "time", "ac", ["t", "period"]],
    phi: ["φ", "Phase angle of the wave", "angle", "ac", ["phi", "phase", "phaseangle", "φ"]],
    M: ["M", "Phasor magnitude", "none", "ac", ["m", "mag", "magnitude", "polar"]],
    ang: ["θ_M", "Phasor angle", "angle", "ac", ["ang", "angle", "polarangle"]],
    re: ["Re", "Real part (rectangular)", "none", "ac", ["re", "real", "realpart"]],
    imag: ["Im_j", "Imaginary part (rectangular, j)", "none", "ac", ["imag", "j", "imaginary", "imagpart"]],
    // single-phase circuit
    V: ["V", "Voltage (single-phase / circuit)", "voltage", "circ", ["vsource", "sourcevoltage", "v1ph", "circuitvoltage"]],
    I: ["I", "Current (single-phase / circuit)", "current", "circ", ["icircuit", "i1ph", "circuitcurrent"]],
    R: ["R", "Resistance", "resistance", "circ", ["r", "res", "resistance"]],
    X: ["X", "Net reactance (X_L − X_C)", "resistance", "circ", ["x", "reactance", "netreactance"]],
    XL: ["X_L", "Inductive reactance", "resistance", "circ", ["xl", "inductivereactance"]],
    XC: ["X_C", "Capacitive reactance", "resistance", "circ", ["xc", "capacitivereactance"]],
    L: ["L", "Inductance", "inductance", "circ", ["l", "inductance", "inductor"]],
    C: ["C", "Capacitance", "capacitance", "circ", ["c", "capacitance", "capacitor", "cap"]],
    Z: ["Z", "Impedance magnitude", "resistance", "circ", ["z", "impedance", "zmag"]],
    thZ: ["θ_Z", "Impedance angle", "angle", "circ", ["thz", "thetaz", "zangle", "impedanceangle"]],
    thV: ["θ_V", "Voltage angle", "angle", "circ", ["thv", "thetav", "vangle", "voltageangle"]],
    thI: ["θ_I", "Current angle", "angle", "circ", ["thi", "thetai", "iangle", "currentangle"]],
    fr: ["f_r", "Resonant frequency", "freq", "circ", ["fr", "fres", "resonantfrequency", "resonance", "fo", "f0"]],
    Ir: ["I_{res}", "Current at resonance", "current", "circ", ["ir", "ires", "currentatresonance"]],
    Xr: ["X_{res}", "Reactance at resonance (X_L = X_C)", "resistance", "circ", ["xr", "xres"]],
    VCr: ["V_C", "Capacitor voltage at resonance", "voltage", "circ", ["vc", "vcap", "capacitorvoltage", "inductorvoltage"]],
    // power
    S: ["S", "Apparent power", "apparent", "power", ["s", "apparentpower", "kva", "va"]],
    P: ["P", "Real power", "power", "power", ["p", "realpower", "truepower", "kw", "watts"]],
    Qr: ["Q", "Reactive power", "reactive", "power", ["q", "reactivepower", "kvar", "var", "vars"]],
    pf: ["pf", "Power factor", "none", "power", ["pf", "powerfactor", "cos", "costheta"], { frac: true }],
    th: ["θ", "Power-factor angle", "angle", "power", ["theta", "θ", "th", "pfangle", "powerfactorangle"]],
    pf2: ["pf_2", "New (corrected) power factor", "none", "power", ["pf2", "newpf", "targetpf", "correctedpf", "desiredpf"], { frac: true }],
    th2: ["θ_2", "New power-factor angle", "angle", "power", ["theta2", "th2"]],
    Qc: ["Q_C", "Capacitor bank needed", "reactive", "power", ["qc", "capacitorkvar", "capkvar", "kvarneeded"]],
    Q2: ["Q_2", "New reactive power", "reactive", "power", ["q2", "newq"]],
    S2: ["S_2", "New apparent power", "apparent", "power", ["s2", "news"]],
    IL2: ["I_{L2}", "New line current (after correction)", "current", "power", ["il2", "newcurrent", "inew"]],
    // three-phase
    V_L: ["V_L", "Line voltage", "voltage", "3ph", ["vl", "vline", "linevoltage", "vll", "vt", "terminalvoltage"]],
    I_L: ["I_L", "Line current", "current", "3ph", ["il", "iline", "linecurrent", "ifl", "fla", "amps", "fullloadamps"]],
    V_ph: ["V_φ", "Phase voltage", "voltage", "3ph", ["vph", "vphase", "phasevoltage", "vln", "lineneutral", "vlinetoneutral"]],
    I_ph: ["I_φ", "Phase current", "current", "3ph", ["iph", "iphase", "phasecurrent", "windingcurrent"]],
    // single transformer
    a: ["a", "Turns ratio (N_P/N_S)", "none", "xf", ["a", "ratio", "turnsratio", "np/ns"]],
    N_P: ["N_P", "Primary turns", "none", "xf", ["np", "primaryturns", "n1"]],
    N_S: ["N_S", "Secondary turns", "none", "xf", ["ns_turns", "secondaryturns", "n2"]],
    V_P: ["V_P", "Primary voltage", "voltage", "xf", ["vp", "vpri", "primaryvoltage", "v1", "vh"]],
    V_S: ["V_S", "Secondary voltage", "voltage", "xf", ["vs", "vsec", "secondaryvoltage", "v2", "vx"]],
    I_P: ["I_P", "Primary current", "current", "xf", ["ip", "ipri", "primarycurrent", "i1"]],
    I_S: ["I_S", "Secondary current", "current", "xf", ["is", "isec", "secondarycurrent", "i2"]],
    R_L: ["R_L", "Load resistance", "resistance", "xf", ["rl", "rload", "loadresistance", "load", "zl", "zload"]],
    R_ref: ["R'_L", "Load seen from the primary (a²·R_L)", "resistance", "xf", ["rref", "reflected", "reflectedload", "zp"]],
    S_X: ["S_X", "Transformer apparent power", "apparent", "xf", ["sx", "sxfmr", "transformerkva", "rating", "kvarating"]],
    // three-phase bank
    V_LP: ["V_{L,P}", "Primary line voltage", "voltage", "bank", ["vlp", "primarylinevoltage", "vlinepri", "hvline"]],
    V_LS: ["V_{L,S}", "Secondary line voltage", "voltage", "bank", ["vls", "secondarylinevoltage", "vlinesec", "lvline", "loadvoltage"]],
    I_LP: ["I_{L,P}", "Primary line current", "current", "bank", ["ilp", "primarylinecurrent", "hvcurrent"]],
    I_LS: ["I_{L,S}", "Secondary line current", "current", "bank", ["ils", "secondarylinecurrent", "loadcurrent", "lvcurrent"]],
    V_phP: ["V_{φ,P}", "Primary winding (phase) voltage", "voltage", "bank", ["vphp", "primaryphasevoltage", "primarywindingvoltage"]],
    V_phS: ["V_{φ,S}", "Secondary winding (phase) voltage", "voltage", "bank", ["vphs", "secondaryphasevoltage", "secondarywindingvoltage"]],
    I_phP: ["I_{φ,P}", "Primary winding (phase) current", "current", "bank", ["iphp", "primaryphasecurrent", "primarywindingcurrent"]],
    I_phS: ["I_{φ,S}", "Secondary winding (phase) current", "current", "bank", ["iphs", "secondaryphasecurrent", "secondarywindingcurrent"]],
    S_bank: ["S_{load}", "Load apparent power on the bank", "apparent", "bank", ["sbank", "sload", "loadkva", "bankload"]],
    S_unit: ["S_{unit}", "Rating of each transformer", "apparent", "bank", ["sunit", "unitkva", "eachkva", "kvaeach", "eachtransformer"]],
    S_full: ["S_{Δ-Δ}", "Full three-transformer bank rating", "apparent", "bank", ["sfull", "bankrating", "fullbank"]],
    S_open: ["S_{open}", "Open-delta capacity", "apparent", "bank", ["sopen", "opendelta", "opendeltacapacity", "vv"]],
    S_shed: ["S_{shed}", "Load that must be removed", "apparent", "bank", ["sshed", "shed", "loadtoremove"]],
    pctOpen: ["%_{open}", "Load as % of open-delta capacity", "percent", "bank", ["pctopen", "overload"]],
    // bank loading (two loads)
    P_1: ["P_{1φ}", "Single-phase load (real power)", "power", "load2", ["p1", "p1ph", "p1phi", "singlephaseload"]],
    pf_1: ["pf_{1φ}", "Single-phase load power factor", "none", "load2", ["pf1", "pf1ph", "pf1phi"], { frac: true }],
    P_3: ["P_{3φ}", "Three-phase load (real power)", "power", "load2", ["p3", "p3ph", "p3phi", "threephaseload"]],
    pf_3: ["pf_{3φ}", "Three-phase load power factor", "none", "load2", ["pf3", "pf3ph", "pf3phi"], { frac: true }],
    th_1: ["θ_{1φ}", "Single-phase load angle", "angle", "load2", ["th1", "theta1"]],
    th_3: ["θ_{3φ}", "Three-phase load angle", "angle", "load2", ["th3", "theta3"]],
    Q_1: ["Q_{1φ}", "Single-phase load reactive power", "reactive", "load2", ["q1", "q1ph"]],
    Q_3: ["Q_{3φ}", "Three-phase load reactive power", "reactive", "load2", ["q3", "q3ph"]],
    S_1: ["S_{1φ}", "Single-phase load apparent power", "apparent", "load2", ["s1", "s1ph"]],
    S_3: ["S_{3φ}", "Three-phase load apparent power", "apparent", "load2", ["s3", "s3ph"]],
    P_T: ["P_T", "Real power per transformer", "power", "load2", ["pt", "pertransformerp"]],
    Q_T: ["Q_T", "Reactive power per transformer", "reactive", "load2", ["qt", "pertransformerq"]],
    S_T: ["S_T", "Loading per transformer (magnitude)", "apparent", "load2", ["st", "loading", "pertransformer", "kvaeachtransformer"]],
    th_T: ["θ_T", "Loading angle per transformer", "angle", "load2", ["tht", "loadingangle"]],
    pf_T: ["pf_T", "Power factor per transformer", "none", "load2", ["pft"], { frac: true }],
    I_ST: ["I_{S,T}", "Secondary current per transformer", "current", "load2", ["ist", "secondarycurrentpertransformer"]],
    I_PT: ["I_{P,T}", "Primary current per transformer", "current", "load2", ["ipt", "primarycurrentpertransformer"]],
    // autotransformer
    tap: ["tap", "Autotransformer tap", "percent", "auto", ["tap", "taps", "percenttap", "%tap"]],
    V_H: ["V_H", "Autotransformer input (line) voltage", "voltage", "auto", ["vh_auto", "vin", "inputvoltage"]],
    V_X: ["V_X", "Autotransformer output voltage", "voltage", "auto", ["vx_auto", "vout", "outputvoltage", "motorvoltage"]],
    I_H: ["I_H", "Autotransformer line (input) current", "current", "auto", ["ih", "linecurrentauto", "iin"]],
    I_X: ["I_X", "Autotransformer output (load) current", "current", "auto", ["ix", "iout", "motorcurrent"]],
    I_LRf: ["I_{LR,full}", "Locked-rotor current at full voltage", "current", "auto", ["ilrfull", "ilrf", "fullvoltagelrc"]],
    P_X: ["P_X", "Power delivered to the load", "power", "auto", ["px", "powerdelivered"]],
    // turns-ratio test
    V_Hr: ["V_{H,rated}", "Nameplate high-side voltage", "voltage", "ttr", ["vhr", "vhrated", "nameplatehigh"]],
    V_Xr: ["V_{X,rated}", "Nameplate low-side voltage", "voltage", "ttr", ["vxr", "vxrated", "nameplatelow"]],
    V_Hm: ["V_{H,meas}", "Measured high-side voltage", "voltage", "ttr", ["vhm", "vhmeas", "measuredhigh"]],
    V_Xm: ["V_{X,meas}", "Measured low-side voltage", "voltage", "ttr", ["vxm", "vxmeas", "measuredlow"]],
    NVR: ["NVR", "Nameplate voltage ratio", "none", "ttr", ["nvr", "nameplateratio"]],
    TVR: ["TVR", "Test (measured) voltage ratio", "none", "ttr", ["tvr", "testratio", "measuredratio"]],
    ttr: ["% diff", "Ratio difference (limit 0.5 %)", "percent", "ttr", ["ttr", "pctdiff", "ratiodifference", "difference"]],
    // harmonics
    I_1: ["I_1", "Fundamental current", "current", "harm", ["i_1", "ifund", "fundamental", "i1h"]],
    I_3: ["I_3", "3rd harmonic current", "current", "harm", ["i3", "i_3", "third", "3rd"]],
    I_5: ["I_5", "5th harmonic current", "current", "harm", ["i5", "i_5", "fifth", "5th"]],
    I_7: ["I_7", "7th harmonic current", "current", "harm", ["i7", "i_7", "7th"]],
    I_9: ["I_9", "9th harmonic current", "current", "harm", ["i9", "i_9", "ninth", "9th"]],
    I_11: ["I_{11}", "11th harmonic current", "current", "harm", ["i11", "i_11", "11th"]],
    THD: ["%THD", "Total harmonic distortion", "percent", "harm", ["thd", "%thd", "distortion"]],
    I_N: ["I_N", "Neutral current (triplens)", "current", "harm", ["in", "ineutral", "neutralcurrent", "neutral"]],
    // magnetics
    Nt: ["N", "Number of turns (coil)", "none", "mag", ["turns", "coilturns", "nturns"]],
    Phi1: ["Φ_1", "Initial flux", "flux", "mag", ["phi1", "flux1", "initialflux"]],
    Phi2: ["Φ_2", "Final flux", "flux", "mag", ["phi2", "flux2", "finalflux"]],
    dPhi: ["ΔΦ", "Change in flux", "flux", "mag", ["dphi", "deltaphi", "fluxchange", "changeinflux", "flux"]],
    dt: ["Δt", "Time for the change", "time", "mag", ["dt", "deltat", "time", "timeinterval"]],
    E: ["E", "Induced voltage (Faraday)", "voltage", "mag", ["e", "emf", "inducedvoltage", "vind"]],
    Rc: ["R_c", "Coil resistance", "resistance", "mag", ["rc", "rcoil", "coilresistance"]],
    Ic: ["I_c", "Coil current", "current", "mag", ["ic", "icoil", "coilcurrent"]],
    // induction motor
    poles: ["P_{poles}", "Number of poles", "none", "motor", ["poles", "pole", "p_poles", "npoles", "pp"]],
    ns: ["n_s", "Synchronous speed", "speed", "motor", ["ns", "nsync", "sync", "synchronousspeed", "syncspeed"]],
    nr: ["n_r", "Rotor (shaft) speed", "speed", "motor", ["nr", "rpm", "speed", "rotorspeed", "shaftspeed", "n", "fullloadspeed", "ratedspeed"]],
    s: ["s", "Slip", "none", "motor", ["s", "slip"], { frac: true }],
    nslip: ["n_{slip}", "Slip speed", "speed", "motor", ["nslip", "slipspeed"]],
    f_r: ["f_{rotor}", "Rotor frequency", "freq", "motor", ["frotor", "rotorfrequency", "rotorfreq", "fr_rotor"]],
    hp: ["hp", "Horsepower (output)", "hp", "motor", ["hp", "horsepower", "ratedhp", "outputhp"]],
    tau: ["τ", "Shaft torque (rated)", "torque", "motor", ["tau", "torque", "τ", "shafttorque", "ratedtorque", "loadtorque_shaft"]],
    P_in: ["P_{in}", "Input power", "power", "motor", ["pin", "inputpower", "electricalinput"]],
    P_SCL: ["P_{SCL}", "Stator copper loss", "power", "motor", ["scl", "pscl", "statorcopper", "statorcopperloss", "statorcu"]],
    P_core: ["P_{core}", "Core loss", "power", "motor", ["core", "pcore", "coreloss", "iron", "ironloss"]],
    P_AG: ["P_{AG}", "Air-gap power", "power", "motor", ["pag", "ag", "airgap", "airgappower"]],
    P_RCL: ["P_{RCL}", "Rotor copper loss", "power", "motor", ["rcl", "prcl", "rotorcopper", "rotorcopperloss", "rotorcu"]],
    P_conv: ["P_{conv}", "Power converted", "power", "motor", ["pconv", "converted", "powerconverted", "developed", "pdev", "pmech"]],
    P_FW: ["P_{F&W}", "Friction and windage loss", "power", "motor", ["fw", "f&w", "pfw", "friction", "windage", "frictionandwindage", "mechanicalloss"]],
    P_stray: ["P_{stray}", "Stray (misc.) loss", "power", "motor", ["stray", "pstray", "misc", "miscellaneous", "strayloss"]],
    P_out: ["P_{out}", "Output power", "power", "motor", ["pout", "output", "outputpower", "shaftpower"]],
    P_loss: ["P_{loss}", "Total losses", "power", "motor", ["ploss", "losses", "totalloss", "totallosses"]],
    eta: ["η", "Efficiency", "percent", "motor", ["eta", "eff", "efficiency", "η"]],
    eta_np: ["η_{np}", "Nameplate efficiency", "percent", "motor", ["etanp", "nameplateeff", "nomeff", "nemaeff", "nominalefficiency"]],
    code: ["code", "NEMA code letter", "none", "motor", ["code", "codeletter", "kvacode", "nemacode"], { str: true }],
    kvahp_min: ["kVA/hp_{min}", "Code letter minimum", "kvahp", "motor", ["kvahpmin"]],
    kvahp_max: ["kVA/hp_{max}", "Code letter maximum", "kvahp", "motor", ["kvahpmax"]],
    S_LRmin: ["S_{LR,min}", "Locked-rotor kVA (minimum)", "apparent", "motor", ["slrmin", "lrkvamin"]],
    S_LRmax: ["S_{LR,max}", "Locked-rotor kVA (maximum)", "apparent", "motor", ["slrmax", "lrkvamax"]],
    I_LRmin: ["I_{LR,min}", "Locked-rotor current (minimum)", "current", "motor", ["ilrmin", "lrcmin", "minlrc", "minimumlockedrotorcurrent"]],
    I_LRmax: ["I_{LR,max}", "Locked-rotor current (maximum)", "current", "motor", ["ilrmax", "lrcmax", "maxlrc", "maximumlockedrotorcurrent"]],
    SF: ["SF", "Service factor", "none", "motor", ["sf", "servicefactor"]],
    hp_SF: ["hp_{SF}", "Maximum continuous horsepower", "hp", "motor", ["hpsf", "maxhp", "maxcontinuoushp"]],
    // off-standard voltage / frequency, curve points
    V_1: ["V_1", "Rated (nameplate) voltage", "voltage", "offstd", ["v_1", "vrated", "ratedvoltage", "nameplatevoltage"]],
    V_2: ["V_2", "Actual applied voltage", "voltage", "offstd", ["v_2", "vapplied", "appliedvoltage", "actualvoltage", "newvoltage", "reducedvoltage"]],
    f_1: ["f_1", "Rated frequency", "freq", "offstd", ["f_1", "fratedhz", "ratedfrequency"]],
    f_2: ["f_2", "Actual frequency", "freq", "offstd", ["f_2", "factual", "actualfrequency", "newfrequency"]],
    kVf: ["k", "V/f ratio factor (V₂f₁)/(V₁f₂)", "none", "offstd", ["kvf", "vfratio"]],
    LRpct: ["LR %", "Locked-rotor torque (% of rated)", "percent", "curve", ["lrpct", "lr%", "lockedrotor%", "lockedrotorpercent", "lr", "lockedrotor", "startingtorque%"]],
    PUpct: ["PU %", "Pull-up torque (% of rated)", "percent", "curve", ["pupct", "pu%", "pullup%", "pullup", "pu"]],
    BDpct: ["BD %", "Breakdown torque (% of rated)", "percent", "curve", ["bdpct", "bd%", "breakdown%", "breakdown", "bd", "pullout"]],
    tau_LR1: ["τ_{LR}", "Locked-rotor torque (rated voltage)", "torque", "curve", ["taulr", "tlr", "lockedrotortorque", "startingtorque", "tlr1"]],
    tau_PU: ["τ_{PU}", "Pull-up torque", "torque", "curve", ["taupu", "tpu", "pulluptorque"]],
    tau_BD: ["τ_{BD}", "Breakdown torque", "torque", "curve", ["taubd", "tbd", "breakdowntorque"]],
    tau_LR2: ["τ_{LR,2}", "Locked-rotor torque (applied V, f)", "torque", "offstd", ["taulr2", "tlr2", "newlrtorque", "newstartingtorque"]],
    I_LR1: ["I_{LR,1}", "Locked-rotor current (rated V, f)", "current", "offstd", ["ilr1", "ilr", "lockedrotorcurrent", "lrc"]],
    I_LR2: ["I_{LR,2}", "Locked-rotor current (applied V, f)", "current", "offstd", ["ilr2", "newlrc"]],
    tau_load: ["τ_{load}", "Torque the load needs to start", "torque", "offstd", ["tauload", "tload", "loadtorque", "breakaway", "breakawaytorque", "startingload"]],
    tau_margin: ["τ_{margin}", "Starting-torque margin (τ_LR,2 − τ_load)", "torque", "offstd", ["margin", "taumargin"]],
    // voltage unbalance
    V_ab: ["V_{AB}", "Line voltage A–B", "voltage", "vub", ["vab", "v_ab"]],
    V_bc: ["V_{BC}", "Line voltage B–C", "voltage", "vub", ["vbc", "v_bc"]],
    V_ca: ["V_{CA}", "Line voltage C–A", "voltage", "vub", ["vca", "v_ca"]],
    V_avg3: ["V_{ave}", "Average line voltage", "voltage", "vub", ["vave3", "vavg3", "averagelinevoltage"]],
    dV: ["ΔV_{max}", "Largest deviation from average", "voltage", "vub", ["dvmax", "maxdeviation", "deviation"]],
    VUB: ["%VUB", "Percent voltage unbalance", "percent", "vub", ["vub", "%vub", "unbalance", "voltageunbalance"]],
    CUB_lo: ["%CUB_{low}", "Current unbalance estimate (6×)", "percent", "vub", ["cublo"]],
    CUB_hi: ["%CUB_{high}", "Current unbalance estimate (10×)", "percent", "vub", ["cubhi"]],
    // two-speed
    nr1: ["n_{r1}", "Rated speed 1 (high)", "speed", "twospeed", ["nr1", "speed1", "highspeed", "rpm1"]],
    nr2: ["n_{r2}", "Rated speed 2 (low)", "speed", "twospeed", ["nr2", "speed2", "lowspeed", "rpm2"]],
    poles1: ["P_1", "Poles at speed 1", "none", "twospeed", ["poles1"]],
    poles2: ["P_2", "Poles at speed 2", "none", "twospeed", ["poles2"]],
    ns1: ["n_{s1}", "Synchronous speed 1", "speed", "twospeed", ["ns1"]],
    ns2: ["n_{s2}", "Synchronous speed 2", "speed", "twospeed", ["ns2"]],
    pratio: ["P_2/P_1", "Pole ratio", "none", "twospeed", ["pratio", "poleratio", "speedratio"]]
  };
  var QUANT = {};
  Object.keys(Q).forEach(function (id) {
    var d = Q[id];
    QUANT[id] = { id: id, sym: d[0], name: d[1], dim: d[2], group: d[3], aliases: d[4] || [], opts: d[5] || {} };
  });
  EM.Q = QUANT;

  /* ---------- NEMA code letters ---------- */
  EM.CODES = { A: [0, 3.15], B: [3.15, 3.55], C: [3.55, 4.0], D: [4.0, 4.5], E: [4.5, 5.0], F: [5.0, 5.6], G: [5.6, 6.3], H: [6.3, 7.1], J: [7.1, 8.0], K: [8.0, 9.0], L: [9.0, 10.0], M: [10.0, 11.2], N: [11.2, 12.5], P: [12.5, 14.0], R: [14.0, 16.0], S: [16.0, 18.0], T: [18.0, 20.0], U: [20.0, 22.4], V: [22.4, 22.4] };

  /* ---------- relationships ----------
     F(out, expr, opts)  opts.when: context tokens all must hold; opts.prio (lower = preferred);
     opts.note: shown under the step; opts.check:false = not used for consistency checks;
     opts.fn: JS function for table lookups (with opts.inputs and opts.text)               */
  var FORMS = [];
  function F(out, expr, o) { o = o || {}; FORMS.push({ out: out, expr: expr, when: o.when || [], prio: o.prio || 5, note: o.note || "", check: o.check !== false, soft: !!o.soft, fn: o.fn, inputs: o.inputs, text: o.text, title: o.title, sub: o.sub }); }

  // AC waveforms
  F("Vrms", "Vm/sqrt(2)"); F("Vm", "sqrt(2)*Vrms"); F("Vavg", "2*Vm/pi"); F("Vm", "pi*Vavg/2", { prio: 6 });
  F("Vpp", "2*Vm"); F("Vm", "Vpp/2", { prio: 6 });
  F("Irms", "Im/sqrt(2)"); F("Im", "sqrt(2)*Irms");
  F("f", "w/(2*pi)"); F("w", "2*pi*f"); F("T", "1/f"); F("f", "1/T");
  // phasor conversion
  F("M", "sqrt(re^2 + imag^2)"); F("ang", "atan2(imag, re)"); F("re", "M*cos(ang)"); F("imag", "M*sin(ang)");
  // circuit
  F("XL", "2*pi*f*L"); F("L", "XL/(2*pi*f)"); F("XC", "1/(2*pi*f*C)"); F("C", "1/(2*pi*f*XC)");
  F("X", "XL - XC", { prio: 4 });
  F("Z", "sqrt(R^2 + X^2)"); F("thZ", "atan2(X, R)"); F("R", "Z*cos(thZ)"); F("X", "Z*sin(thZ)", { prio: 6 });
  F("I", "V/Z", { when: ["1ph"] }); F("V", "I*Z", { when: ["1ph"] }); F("Z", "V/I", { when: ["1ph"], prio: 6 });
  F("thI", "thV - thZ"); F("thV", "thI + thZ");
  F("fr", "1/(2*pi*sqrt(L*C))"); F("Xr", "2*pi*fr*L"); F("Ir", "V/R", { note: "At resonance X_L = X_C, so the impedance is just R." });
  F("VCr", "Ir*Xr", { note: "The capacitor (and inductor) voltage at resonance can be much larger than the source." });
  // power (single- and three-phase)
  F("S", "sqrt(3)*V_L*I_L", { when: ["3ph"], prio: 3 }); F("I_L", "S/(sqrt(3)*V_L)", { when: ["3ph"] }); F("V_L", "S/(sqrt(3)*I_L)", { when: ["3ph"] });
  F("S", "V*I", { when: ["1ph"], prio: 3 }); F("I", "S/V", { when: ["1ph"] }); F("V", "S/I", { when: ["1ph"], prio: 6 });
  F("S", "3*V_ph*I_ph", { when: ["3ph"], prio: 6 });
  F("P", "S*pf"); F("S", "P/pf"); F("pf", "P/S"); F("th", "acos(pf)"); F("pf", "cos(th)", { prio: 6 });
  F("Qr", "P*tan(th)"); F("Qr", "S*sin(th)", { prio: 6 }); F("S", "sqrt(P^2 + Qr^2)", { prio: 6 }); F("P", "sqrt(S^2 - Qr^2)", { prio: 7 });
  F("th", "atan(Qr/P)", { prio: 6 }); F("pf", "cos(thZ)", { prio: 8, note: "For a single load the power-factor angle equals the impedance angle." });
  F("P_in", "P", { prio: 8, note: "The motor's input power is the real power it draws." }); F("P", "P_in", { prio: 8 });
  // load connection (wye / delta)
  F("V_L", "sqrt(3)*V_ph", { when: ["loadY"] }); F("V_ph", "V_L/sqrt(3)", { when: ["loadY"] }); F("I_L", "I_ph", { when: ["loadY"] }); F("I_ph", "I_L", { when: ["loadY"] });
  F("V_L", "V_ph", { when: ["loadD"] }); F("V_ph", "V_L", { when: ["loadD"] }); F("I_L", "sqrt(3)*I_ph", { when: ["loadD"] }); F("I_ph", "I_L/sqrt(3)", { when: ["loadD"] });
  // power-factor correction
  F("th2", "acos(pf2)"); F("Qc", "P*(tan(th) - tan(th2))", { prio: 3 }); F("Q2", "P*tan(th2)"); F("Qc", "Qr - Q2", { prio: 6 }); F("S2", "P/pf2");
  F("IL2", "S2/(sqrt(3)*V_L)", { when: ["3ph"] }); F("IL2", "S2/V", { when: ["1ph"] });
  // single transformer
  F("a", "N_P/N_S"); F("a", "V_P/V_S"); F("a", "I_S/I_P", { prio: 6 }); F("N_S", "N_P/a"); F("N_P", "a*N_S");
  F("V_S", "V_P/a"); F("V_P", "a*V_S"); F("I_S", "V_S/R_L", { prio: 3 }); F("I_P", "I_S/a"); F("I_S", "a*I_P");
  F("S_X", "V_S*I_S"); F("I_S", "S_X/V_S", { prio: 6 }); F("I_P", "S_X/V_P", { prio: 6 }); F("R_ref", "a^2*R_L");
  // three-phase bank: line vs winding on each side
  F("V_LP", "sqrt(3)*V_phP", { when: ["pY"] }); F("V_phP", "V_LP/sqrt(3)", { when: ["pY"] }); F("I_LP", "I_phP", { when: ["pY"] }); F("I_phP", "I_LP", { when: ["pY"] });
  F("V_LP", "V_phP", { when: ["pD"] }); F("V_phP", "V_LP", { when: ["pD"] }); F("I_LP", "sqrt(3)*I_phP", { when: ["pD"] }); F("I_phP", "I_LP/sqrt(3)", { when: ["pD"] });
  F("V_LP", "V_phP", { when: ["pO"] }); F("V_phP", "V_LP", { when: ["pO"] }); F("I_LP", "I_phP", { when: ["pO"] }); F("I_phP", "I_LP", { when: ["pO"] });
  F("V_LS", "sqrt(3)*V_phS", { when: ["sY"] }); F("V_phS", "V_LS/sqrt(3)", { when: ["sY"] }); F("I_LS", "I_phS", { when: ["sY"] }); F("I_phS", "I_LS", { when: ["sY"] });
  F("V_LS", "V_phS", { when: ["sD"] }); F("V_phS", "V_LS", { when: ["sD"] }); F("I_LS", "sqrt(3)*I_phS", { when: ["sD"] }); F("I_phS", "I_LS/sqrt(3)", { when: ["sD"] });
  F("V_LS", "V_phS", { when: ["sO"] }); F("V_phS", "V_LS", { when: ["sO"] }); F("I_LS", "I_phS", { when: ["sO"] }); F("I_phS", "I_LS", { when: ["sO"] });
  F("a", "V_phP/V_phS", { when: ["bank"] }); F("V_phS", "V_phP/a", { when: ["bank"] }); F("V_phP", "a*V_phS", { when: ["bank"] });
  F("I_phP", "I_phS/a", { when: ["bank"] }); F("I_phS", "a*I_phP", { when: ["bank"] });
  F("S_bank", "sqrt(3)*V_LS*I_LS", { when: ["bank"] }); F("S_bank", "sqrt(3)*V_LP*I_LP", { when: ["bank"], prio: 6 });
  F("I_LS", "S_bank/(sqrt(3)*V_LS)", { when: ["bank"], prio: 3 }); F("I_LP", "S_bank/(sqrt(3)*V_LP)", { when: ["bank"], prio: 3 });
  // open delta
  F("S_full", "3*S_unit"); F("S_open", "sqrt(3)*S_unit", { note: "Open-delta capacity = 1.732 × one unit = 57.7 % of the full Δ-Δ bank." });
  F("S_open", "S_full/sqrt(3)", { prio: 6 }); F("S_shed", "S_bank - S_open"); F("pctOpen", "S_bank/S_open*100");
  // bank loading with a 1φ and a 3φ load (each transformer carries 1/3 of each)
  F("th_1", "acos(pf_1)"); F("th_3", "acos(pf_3)"); F("Q_1", "P_1*tan(th_1)"); F("Q_3", "P_3*tan(th_3)");
  F("S_1", "P_1/pf_1"); F("S_3", "P_3/pf_3");
  F("P_T", "(P_1 + P_3)/3", { note: "Add real powers, then take one third — never add the kVA magnitudes." });
  F("Q_T", "(Q_1 + Q_3)/3"); F("S_T", "sqrt(P_T^2 + Q_T^2)"); F("th_T", "atan(Q_T/P_T)"); F("pf_T", "P_T/S_T");
  F("I_ST", "S_T/V_phS", { when: ["bank"] }); F("I_PT", "S_T/V_phP", { when: ["bank"] });
  // autotransformer
  F("V_X", "V_H*tap/100"); F("V_H", "V_X/(tap/100)", { prio: 6 }); F("tap", "V_X/V_H*100", { prio: 6 });
  F("I_X", "V_X/R_L"); F("I_X", "I_LRf*tap/100", { note: "Locked-rotor current is proportional to the voltage applied to the motor." });
  F("I_H", "I_X*tap/100"); F("I_X", "I_H/(tap/100)", { prio: 6 }); F("P_X", "V_X*I_X");
  // turns-ratio test
  F("NVR", "V_Hr/V_Xr"); F("TVR", "V_Hm/V_Xm"); F("ttr", "abs(TVR - NVR)/NVR*100");
  // harmonics (missing harmonics may be taken as zero)
  F("THD", "sqrt(I_3^2 + I_5^2 + I_7^2 + I_9^2 + I_11^2)/I_1*100");
  F("I_N", "3*sqrt(I_3^2 + I_9^2)", { note: "Balanced triplens are in phase in all three lines, so they add in the neutral (3×). Different harmonics add as root-sum-square." });
  // Faraday / Lenz
  F("dPhi", "abs(Phi2 - Phi1)"); F("E", "Nt*dPhi/dt", { note: "Lenz's law: the induced voltage opposes the change in flux." });
  F("dPhi", "E*dt/Nt", { prio: 6 }); F("dt", "Nt*dPhi/E", { prio: 6 }); F("Nt", "E*dt/dPhi", { prio: 6 }); F("Ic", "E/Rc");
  // induction motor speed
  F("ns", "120*f/poles"); F("poles", "120*f/ns"); F("f", "ns*poles/120", { prio: 7 });
  F("ns", "", { fn: function (k) { return stdNs(k.f, k.nr); }, inputs: ["f", "nr"], prio: 8, check: false, text: "the standard synchronous speed just above n_r",
    sub: function (k) { return "n_r = " + EM.fmt(k.nr.v, 5) + " rpm at " + EM.fmt(k.f.v, 4) + " Hz → standard speeds " + stdList(k.f.v); },
    note: "Rotor speed is always a little below synchronous speed (that difference is the slip)." });
  F("s", "(ns - nr)/ns"); F("nr", "ns*(1 - s)"); F("ns", "nr/(1 - s)", { prio: 6 }); F("nslip", "ns - nr"); F("f_r", "s*f"); F("s", "f_r/f", { prio: 6 });
  F("tau", "5252*hp/nr", { note: "Use the actual shaft speed n_r, not n_s." }); F("hp", "tau*nr/5252"); F("nr", "5252*hp/tau", { prio: 7 });
  F("P_out", "hp*746"); F("hp", "P_out/746");
  // power flow
  F("P_in", "sqrt(3)*V_L*I_L*pf", { when: ["3ph"], prio: 2 }); F("P_in", "V*I*pf", { when: ["1ph"], prio: 2 });
  F("P_AG", "P_in - P_SCL - P_core"); F("P_RCL", "s*P_AG", { prio: 6, soft: true }); F("P_RCL", "P_AG - P_conv", { prio: 6 }); F("P_conv", "P_AG - P_RCL");
  F("P_conv", "(1 - s)*P_AG", { prio: 7, soft: true }); F("P_AG", "P_RCL/s", { prio: 7, soft: true });
  F("P_out", "P_conv - P_FW - P_stray", { prio: 4 }); F("P_conv", "P_out + P_FW + P_stray", { prio: 7 });
  F("P_AG", "P_conv + P_RCL", { prio: 7 }); F("P_in", "P_AG + P_SCL + P_core", { prio: 7 });
  F("eta", "P_out/P_in*100"); F("P_in", "P_out/(eta/100)", { prio: 6 }); F("P_out", "P_in*eta/100", { prio: 7 }); F("P_loss", "P_in - P_out");
  // nameplate
  F("kvahp_min", "", { fn: function (k) { return codeRange(k.code)[0] * 1000; }, inputs: ["code"], text: "from the NEMA code-letter table", check: false });
  F("kvahp_max", "", { fn: function (k) { return codeRange(k.code)[1] * 1000; }, inputs: ["code"], text: "from the NEMA code-letter table", check: false });
  F("S_LRmin", "kvahp_min*hp"); F("S_LRmax", "kvahp_max*hp");
  F("I_LRmin", "S_LRmin/(sqrt(3)*V_L)", { when: ["3ph"] }); F("I_LRmax", "S_LRmax/(sqrt(3)*V_L)", { when: ["3ph"] });
  F("I_LRmin", "S_LRmin/V", { when: ["1ph"] }); F("I_LRmax", "S_LRmax/V", { when: ["1ph"] });
  F("hp_SF", "SF*hp");
  // off-standard voltage and frequency, torque-curve points
  F("kVf", "(V_2/V_1)*(f_1/f_2)", { prio: 3 }); F("kVf", "V_2/V_1", { prio: 7, note: "No frequency change given, so only the voltage ratio applies." });
  F("tau_LR1", "LRpct*tau/100"); F("tau_PU", "PUpct*tau/100"); F("tau_BD", "BDpct*tau/100");
  F("tau_LR2", "tau_LR1*kVf^2", { note: "Locked-rotor torque varies with (V/f)²." }); F("I_LR2", "I_LR1*kVf", { note: "Locked-rotor current varies with V/f." });
  F("tau_margin", "tau_LR2 - tau_load");
  // voltage unbalance
  F("V_avg3", "(V_ab + V_bc + V_ca)/3"); F("dV", "max(abs(V_ab - V_avg3), max(abs(V_bc - V_avg3), abs(V_ca - V_avg3)))");
  F("VUB", "dV/V_avg3*100"); F("CUB_lo", "6*VUB"); F("CUB_hi", "10*VUB");
  // two-speed
  F("ns1", "", { fn: function (k) { return stdNs(k.f, k.nr1); }, inputs: ["f", "nr1"], check: false, text: "the standard synchronous speed just above n_r1",
    sub: function (k) { return "n_r1 = " + EM.fmt(k.nr1.v, 5) + " rpm at " + EM.fmt(k.f.v, 4) + " Hz → standard speeds " + stdList(k.f.v); } });
  F("ns2", "", { fn: function (k) { return stdNs(k.f, k.nr2); }, inputs: ["f", "nr2"], check: false, text: "the standard synchronous speed just above n_r2",
    sub: function (k) { return "n_r2 = " + EM.fmt(k.nr2.v, 5) + " rpm at " + EM.fmt(k.f.v, 4) + " Hz → standard speeds " + stdList(k.f.v); } });
  F("poles1", "120*f/ns1"); F("poles2", "120*f/ns2"); F("pratio", "poles2/poles1", { note: "A consequent-pole motor gives exactly a 2:1 ratio." });

  function stdNs(f, nr) { var p = 2 * Math.floor(60 * f / nr); if (p < 2) throw new Error("speed above 2-pole sync"); return 120 * f / p; }
  function stdList(f) { var a = []; for (var p = 2; p <= 10; p += 2) a.push(EM.fmt(120 * f / p, 4)); return a.join(", ") + " rpm"; }
  function codeRange(code) { var c = String(code || "").trim().toUpperCase().charAt(0); var r = EM.CODES[c]; if (!r) throw new Error("No NEMA code letter " + c); return r; }
  EM.codeRange = codeRange;

  /* prepare ASTs and inputs */
  FORMS.forEach(function (f, i) {
    f.i = i;
    if (f.fn) { f.ins = f.inputs.slice(); var fn0 = f.fn; f.fn = function (o) { return fn0(o); }; return; }
    f.ast = EM.parse(f.expr);
    f.ins = EM.vars(f.ast).filter(function (v) { return v !== "pi"; });
    f.ins.forEach(function (v) { if (!QUANT[v]) throw new Error("Unknown quantity " + v + " in " + f.out + " = " + f.expr); });
    if (!QUANT[f.out]) throw new Error("Unknown output " + f.out);
  });
  EM.FORMS = FORMS;

  /* values that may be assumed when they are the only thing missing */
  EM.ASSUMABLE = {
    P_stray: { v: 0, why: "Stray loss not given — assumed 0." },
    I_3: { v: 0, why: "3rd harmonic not given — taken as 0." }, I_5: { v: 0, why: "5th harmonic not given — taken as 0." },
    I_7: { v: 0, why: "7th harmonic not given — taken as 0." }, I_9: { v: 0, why: "9th harmonic not given — taken as 0." },
    I_11: { v: 0, why: "11th harmonic not given — taken as 0." },
    f: { v: 60, why: "Frequency not given — assumed 60 Hz (US standard)." },
    thV: { v: 0, why: "Voltage taken as the reference (angle 0°)." }
  };
})();
