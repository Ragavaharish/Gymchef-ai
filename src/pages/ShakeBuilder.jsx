import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Save,
  Trash2,
  Utensils,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Plus,
  CupSoda,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useNutrition } from "../context/NutritionContext";

// ─── Ingredient Definitions ─────────────────────────────────────────
const INGREDIENTS = [
  { id: "whey", name: "Whey Protein", emoji: "🥛", unit: "scoop(s)", min: 0, max: 3, step: 0.5, defaultVal: 1, caloriesPer: 120, proteinPer: 25, carbsPer: 3, fatPer: 1, color: "#00a699" },
  { id: "banana", name: "Banana", emoji: "🍌", unit: "piece(s)", min: 0, max: 2, step: 0.5, defaultVal: 1, caloriesPer: 90, proteinPer: 1, carbsPer: 23, fatPer: 0, color: "#eab308" },
  { id: "peanut_butter", name: "Peanut Butter", emoji: "🥜", unit: "tbsp", min: 0, max: 4, step: 1, defaultVal: 1, caloriesPer: 95, proteinPer: 4, carbsPer: 3, fatPer: 8, color: "#d97706" },
  { id: "oats", name: "Oats", emoji: "🌾", unit: "g", min: 0, max: 80, step: 10, defaultVal: 30, caloriesPer: 3.8, proteinPer: 0.13, carbsPer: 0.66, fatPer: 0.07, color: "#a8a29e" },
  { id: "milk_whole", name: "Milk (Whole)", emoji: "🥛", unit: "ml", min: 0, max: 400, step: 50, defaultVal: 250, caloriesPer: 0.62, proteinPer: 0.03, carbsPer: 0.05, fatPer: 0.03, color: "#fef08a" },
  { id: "milk_almond", name: "Milk (Almond)", emoji: "🌱", unit: "ml", min: 0, max: 400, step: 50, defaultVal: 0, caloriesPer: 0.13, proteinPer: 0.004, carbsPer: 0.01, fatPer: 0.01, color: "#86efac" },
  { id: "greek_yogurt", name: "Greek Yogurt", emoji: "🥄", unit: "g", min: 0, max: 200, step: 25, defaultVal: 0, caloriesPer: 0.59, proteinPer: 0.1, carbsPer: 0.04, fatPer: 0.0, color: "#e2e8f0" },
  { id: "honey", name: "Honey", emoji: "🍯", unit: "tsp", min: 0, max: 4, step: 1, defaultVal: 0, caloriesPer: 21, proteinPer: 0, carbsPer: 6, fatPer: 0, color: "#f97316" },
];

const buildDefaults = () => {
  const vals = {};
  INGREDIENTS.forEach((ing) => {
    vals[ing.id] = ing.defaultVal;
  });
  return vals;
};

export default function ShakeBuilder() {
  const { customShakes, saveShake, deleteShake, logMeal } = useNutrition();

  const [quantities, setQuantities] = useState(buildDefaults);
  const [wheyEnabled, setWheyEnabled] = useState(true);
  const [shakeName, setShakeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  const effectiveQuantities = useMemo(() => {
    if (!wheyEnabled) return { ...quantities, whey: 0 };
    return quantities;
  }, [quantities, wheyEnabled]);

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    INGREDIENTS.forEach((ing) => {
      const qty = effectiveQuantities[ing.id] || 0;
      calories += qty * ing.caloriesPer;
      protein += qty * ing.proteinPer;
      carbs += qty * ing.carbsPer;
      fat += qty * ing.fatPer;
    });
    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  }, [effectiveQuantities]);

  const wheyProteinDelta = useMemo(() => {
    const wheyIng = INGREDIENTS.find((i) => i.id === "whey");
    return Math.round(effectiveQuantities.whey * wheyIng.proteinPer * 10) / 10;
  }, [effectiveQuantities]);

  const potentialWheyProtein = useMemo(() => {
    const wheyIng = INGREDIENTS.find((i) => i.id === "whey");
    return Math.round(quantities.whey * wheyIng.proteinPer * 10) / 10;
  }, [quantities]);

  const glassLayers = useMemo(() => {
    const layers = [];
    INGREDIENTS.forEach((ing) => {
      const qty = effectiveQuantities[ing.id] || 0;
      if (qty > 0) {
        const cal = qty * ing.caloriesPer;
        layers.push({ id: ing.id, name: ing.name, emoji: ing.emoji, color: ing.color, calories: cal });
      }
    });
    const totalCal = layers.reduce((s, l) => s + l.calories, 0);
    return layers.map((l) => ({ ...l, pct: totalCal > 0 ? (l.calories / totalCal) * 100 : 0 }));
  }, [effectiveQuantities]);

  const handleSliderChange = (id, value) => {
    setQuantities((prev) => ({ ...prev, [id]: parseFloat(value) }));
  };

  const handleReset = () => {
    setQuantities(buildDefaults());
    setWheyEnabled(true);
    setShakeName("");
    setSaved(false);
    setLogged(false);
  };

  const handleSave = async () => {
    if (!shakeName.trim()) return;
    setSaving(true);
    const ingredientsList = INGREDIENTS.filter((i) => effectiveQuantities[i.id] > 0).map((i) => ({
      name: i.name,
      quantity: effectiveQuantities[i.id],
      unit: i.unit,
    }));
    await saveShake(shakeName.trim(), ingredientsList, totals);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setShakeName("");
  };

  const handleLog = async () => {
    setLogging(true);
    const name = shakeName.trim() || "Custom Shake";
    await logMeal(name, totals, "shake");
    setLogging(false);
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
  };

  const handleLoadShake = (shake) => {
    const newQty = {};
    INGREDIENTS.forEach((ing) => {
      const found = shake.ingredients?.find((si) => si.name === ing.name);
      newQty[ing.id] = found ? found.quantity : 0;
    });
    setQuantities(newQty);
    setShakeName(shake.name || "");
    const hasWhey = shake.ingredients?.some((si) => si.name === "Whey Protein" && si.quantity > 0);
    setWheyEnabled(hasWhey !== false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const macroDashboard = [
    { label: "Calories", value: totals.calories, unit: "kcal", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Protein", value: totals.protein, unit: "g", icon: Beef, color: "text-[#00a699]", bg: "bg-teal-50", border: "border-teal-100" },
    { label: "Carbs", value: totals.carbs, unit: "g", icon: Wheat, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200" },
    { label: "Fat", value: totals.fat, unit: "g", icon: Droplets, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 lg:px-12 pb-24"
    >
      {/* ─── Header (Centered) ─── */}
      <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a699]/10 border border-[#00a699]/20 text-[#00a699] text-xs font-bold uppercase tracking-wider mb-4">
          <FlaskConical className="h-3.5 w-3.5" /> GymChef Shake Builder
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">
          AI Shake Builder
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Craft your perfect protein shake using our interactive modular builder. Adjust quantities of protein, oats, and dairy elements to hit your custom macronutrient target profiles.
        </p>
      </motion.div>

      {/* ─── Top Control Row: Live Macro Dashboard & Reset ─── */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-stretch gap-4">
        {/* Macro Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {macroDashboard.map((m) => (
            <motion.div
              key={m.label}
              layout
              className={`bg-white rounded-2xl p-4 border shadow-sm ${m.border}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`h-4 w-4 ${m.color}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
              </div>
              <motion.p
                key={m.value}
                initial={{ scale: 1.15, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-2xl font-black ${m.color}`}
              >
                {m.value}
                <span className="text-xs font-semibold text-slate-400 ml-1">{m.unit}</span>
              </motion.p>
            </motion.div>
          ))}
        </div>
        {/* Reset Button */}
        <button
          id="shake-reset-btn"
          onClick={handleReset}
          className="px-6 py-4 rounded-2xl bg-white border border-slate-200 hover:border-[#e65c5c]/35 hover:text-[#e65c5c] hover:bg-rose-50 transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-slate-500 uppercase tracking-wider text-xs"
          title="Reset builder"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid: Ingredients + Glass */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* ─── Ingredients Panel ─── */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6">
          {/* Whey Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <CupSoda className="h-5 w-5 text-[#00a699]" />
              Ingredients
            </h2>
            <div className="flex items-center gap-3">
              <button
                id="whey-toggle-btn"
                onClick={() => setWheyEnabled(!wheyEnabled)}
                className={`relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 focus-visible:outline-none ${
                  wheyEnabled ? "border-[#00a699]/40 bg-[#00a699]/20" : "border-slate-200 bg-slate-100"
                }`}
                role="switch"
                aria-checked={wheyEnabled}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`pointer-events-none block h-5 w-5 rounded-full shadow-md mt-[1px] ${
                    wheyEnabled ? "bg-[#00a699] ml-[25px]" : "bg-slate-400 ml-[3px]"
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {wheyEnabled ? "With Whey Protein" : "Without Whey"}
              </span>
              <AnimatePresence>
                {!wheyEnabled && potentialWheyProtein > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-[#00a699]/10 border border-[#00a699]/20 text-[#00a699] font-black uppercase tracking-wider"
                  >
                    +{potentialWheyProtein}g protein
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-4">
            {INGREDIENTS.map((ing) => {
              const isWhey = ing.id === "whey";
              const isDisabled = isWhey && !wheyEnabled;
              const qty = effectiveQuantities[ing.id];
              const cals = Math.round(qty * ing.caloriesPer);

              return (
                <motion.div
                  key={ing.id}
                  layout
                  className={`rounded-2xl p-4 border transition-all duration-300 ${
                    isDisabled
                      ? "bg-slate-50 border-slate-200/50 opacity-40"
                      : qty > 0
                      ? "bg-slate-50 border-[#00a699]/20 shadow-sm"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl" role="img" aria-label={ing.name}>{ing.emoji}</span>
                      <span className={`text-sm font-extrabold ${isDisabled ? "text-slate-400" : "text-slate-800"}`}>
                        {ing.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-black tabular-nums"
                        style={{ color: isDisabled ? "#9ca3af" : "#1e293b" }}
                      >
                        {qty} <span className="text-xs font-medium text-slate-500">{ing.unit}</span>
                      </span>
                      {qty > 0 && !isDisabled && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          {cals} kcal
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    id={`slider-${ing.id}`}
                    type="range"
                    min={ing.min}
                    max={ing.max}
                    step={ing.step}
                    value={isDisabled ? 0 : quantities[ing.id]}
                    onChange={(e) => handleSliderChange(ing.id, e.target.value)}
                    disabled={isDisabled}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed bg-slate-200 accent-[#00a699]
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[#00a699]
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-white
                      [&::-webkit-slider-thumb]:shadow
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-[#00a699]
                      [&::-moz-range-thumb]:border-2
                      [&::-moz-range-thumb]:border-white
                      [&::-moz-range-thumb]:shadow
                    "
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-medium">{ing.min}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{ing.max} {ing.unit}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Visual Shake Glass ─── */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 flex flex-col items-center">
          <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-[#00a699]" />
            Your Shake
          </h2>

          {/* Glass Container */}
          <div className="relative w-32 md:w-36 flex-1 min-h-[320px] max-h-[460px] mb-4">
            {/* Glass outline */}
            <div className="absolute inset-0 rounded-b-[2.5rem] rounded-t-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex flex-col-reverse shadow-inner">
              <AnimatePresence>
                {glassLayers.map((layer) => (
                  <motion.div
                    key={layer.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${layer.pct}%`, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full relative group"
                    style={{ backgroundColor: layer.color + "40", borderTop: `1px solid ${layer.color}50` }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(180deg, ${layer.color}20 0%, ${layer.color}08 100%)`,
                      }}
                    />
                    {layer.pct > 8 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-800/80 group-hover:text-slate-800 transition-colors truncate px-1">
                          {layer.emoji}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {glassLayers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center px-4">Add ingredients to fill glass</p>
                </div>
              )}
            </div>

            {/* Glass rim highlight */}
            <div className="absolute top-0 left-0 right-0 h-3 rounded-t-2xl bg-gradient-to-b from-slate-200 to-transparent" />
            <div className="absolute top-3 left-1 bottom-4 w-2 rounded-full bg-gradient-to-r from-white/40 to-transparent" />
          </div>

          {/* Layer Legend */}
          {glassLayers.length > 0 && (
            <div className="mt-2 w-full space-y-1.5 border-t border-slate-100 pt-4">
              {glassLayers.map((layer) => (
                <div key={layer.id} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <span className="text-slate-400 truncate flex-1">{layer.name}</span>
                  <span className="text-slate-700 tabular-nums">{Math.round(layer.pct)}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Save & Log Section ─── */}
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 mb-8">
        <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
          <Save className="h-5 w-5 text-[#00a699]" />
          Save & Log Your Creation
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="shake-name-input"
            type="text"
            placeholder="Name your shake..."
            value={shakeName}
            onChange={(e) => setShakeName(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#00a699] rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          <button
            id="save-shake-btn"
            onClick={handleSave}
            disabled={saving || !shakeName.trim() || totals.calories === 0}
            className="px-6 py-3 bg-[#e65c5c] hover:bg-[#d54b4b] text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#e65c5c]/10 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap uppercase tracking-widest text-xs"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Shake"}
          </button>
          <button
            id="log-meal-btn"
            onClick={handleLog}
            disabled={logging || totals.calories === 0}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-black rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap uppercase tracking-widest text-xs"
          >
            {logging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : logged ? (
              <CheckCircle2 className="h-4 w-4 text-[#00a699]" />
            ) : (
              <Utensils className="h-4 w-4" />
            )}
            {logging ? "Logging..." : logged ? "Logged!" : "Log as Meal"}
          </button>
        </div>
      </motion.div>

      {/* ─── Saved Shakes Catalog ─── */}
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto">
        <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-[#00a699]" />
          Saved Shakes Catalog
          {customShakes.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00a699]/15 border border-[#00a699]/20 text-[#00a699] font-black">
              {customShakes.length}
            </span>
          )}
        </h2>

        {customShakes.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 text-center">
            <FlaskConical className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-40" />
            <p className="text-slate-500 text-sm font-semibold">No saved shakes yet.</p>
            <p className="text-slate-400 text-xs mt-1">Build your custom shake above and save it for quick catalog access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {customShakes.map((shake) => (
                <motion.div
                  key={shake.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 hover:border-[#00a699]/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-[#00a699]/10 shrink-0">
                        <CupSoda className="h-4 w-4 text-[#00a699]" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800 truncate uppercase tracking-tight">{shake.name}</h3>
                    </div>
                    <button
                      id={`delete-shake-${shake.id}`}
                      onClick={() => deleteShake(shake.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-[#e65c5c] transition-all opacity-0 group-hover:opacity-100 shrink-0"
                      title="Delete shake"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Macro Summary */}
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    <div className="text-center py-1.5 rounded-lg bg-amber-50">
                      <p className="text-xs font-black text-amber-600">{shake.macros?.calories || 0}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">kcal</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg bg-teal-50">
                      <p className="text-xs font-black text-teal-600">{shake.macros?.protein || 0}g</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">protein</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg bg-sky-50">
                      <p className="text-xs font-black text-sky-600">{shake.macros?.carbs || 0}g</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">carbs</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg bg-rose-50">
                      <p className="text-xs font-black text-rose-600">{shake.macros?.fat || 0}g</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">fat</p>
                    </div>
                  </div>

                  {/* Load Button */}
                  <button
                    id={`load-shake-${shake.id}`}
                    onClick={() => handleLoadShake(shake)}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#00a699]/10 border border-slate-200 hover:border-[#00a699]/30 text-[10px] font-black text-slate-500 hover:text-[#00a699] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Load into Builder
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
