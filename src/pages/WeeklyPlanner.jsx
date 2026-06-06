import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  Sun,
  Coffee,
  Moon,
  Cookie,
  Plus,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Check,
  Loader2,
  ClipboardList,
  ListChecks,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNutrition } from "../context/NutritionContext";
import { generateWeeklyMealPlan } from "../services/gemini";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, emoji: "🍳" },
  { key: "lunch", label: "Lunch", icon: Sun, emoji: "🥗" },
  { key: "dinner", label: "Dinner", icon: Moon, emoji: "🥩" },
  { key: "snack", label: "Snack", icon: Cookie, emoji: "🥜" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
};

// ─── Skeleton Card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded-lg" />
        ))}
      </div>
      <div className="h-9 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─── Macro Pill ────────────────────────────────────────────────
function MacroPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-white/[0.03]">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className="text-[11px] font-semibold text-slate-900">{value}</span>
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Meal Card ─────────────────────────────────────────────────
function MealCard({ mealType, meal, onLog, loggedId }) {
  const TypeIcon = mealType.icon;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-3 hover:border-neon-lime/10 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neon-lime/5 border border-neon-lime/10 flex items-center justify-center text-lg shrink-0">
          {mealType.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neon-lime">
            {mealType.label}
          </p>
          <p className="text-sm font-medium text-slate-900 truncate">{meal.name}</p>
        </div>
      </div>

      {/* Macros Row */}
      <div className="grid grid-cols-4 gap-1.5">
        <MacroPill icon={Flame} label="Cal" value={meal.calories} color="text-neon-gold" />
        <MacroPill icon={Beef} label="Pro" value={`${meal.protein}g`} color="text-neon-lime" />
        <MacroPill icon={Wheat} label="Carb" value={`${meal.carbs}g`} color="text-blue-400" />
        <MacroPill icon={Droplets} label="Fat" value={`${meal.fat}g`} color="text-neon-red" />
      </div>

      {/* Ingredients preview */}
      {meal.ingredients && meal.ingredients.length > 0 && (
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
          {meal.ingredients.join(" · ")}
        </p>
      )}

      {/* Log Meal Button */}
      <button
        id={`log-meal-${mealType.key}`}
        onClick={() => onLog(meal, mealType)}
        disabled={loggedId === mealType.key}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
          loggedId === mealType.key
            ? "bg-neon-lime/10 text-neon-lime border border-neon-lime/20 cursor-default"
            : "bg-slate-100 hover:bg-neon-lime/10 text-slate-900 hover:text-neon-lime border border-slate-200 hover:border-neon-lime/20"
        }`}
      >
        {loggedId === mealType.key ? (
          <>
            <Check className="h-3.5 w-3.5" /> Logged
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" /> Log Meal
          </>
        )}
      </button>
    </motion.div>
  );
}

// ─── Daily Summary Bar ─────────────────────────────────────────
function DailySummary({ dayMeals, targets }) {
  const totals = useMemo(() => {
    const types = ["breakfast", "lunch", "dinner", "snack"];
    return types.reduce(
      (acc, t) => {
        const m = dayMeals[t];
        if (m) {
          acc.calories += Number(m.calories || 0);
          acc.protein += Number(m.protein || 0);
          acc.carbs += Number(m.carbs || 0);
          acc.fat += Number(m.fat || 0);
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [dayMeals]);

  const proteinPct = targets.protein > 0 ? Math.min(100, Math.round((totals.protein / targets.protein) * 100)) : 0;
  const calPct = targets.calories > 0 ? Math.min(100, Math.round((totals.calories / targets.calories) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-neon-lime" />
        Daily Summary
      </h3>

      {/* Macro totals row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: totals.calories, target: targets.calories, unit: "", color: "text-neon-gold" },
          { label: "Protein", value: totals.protein, target: targets.protein, unit: "g", color: "text-neon-lime" },
          { label: "Carbs", value: totals.carbs, target: targets.carbs, unit: "g", color: "text-blue-400" },
          { label: "Fat", value: totals.fat, target: targets.fat, unit: "g", color: "text-neon-red" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className={`text-lg font-bold ${m.color}`}>
              {m.value}
              <span className="text-[10px] text-slate-500 font-normal">{m.unit}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              / {m.target}
              {m.unit} {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Protein progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Protein Target</span>
          <span className="text-neon-lime font-semibold">{proteinPct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${proteinPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-neon-green/60 to-neon-green rounded-full"
          />
        </div>
      </div>

      {/* Calorie progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Calorie Target</span>
          <span className="text-neon-gold font-semibold">{calPct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-neon-gold/60 to-neon-gold rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Grocery List ──────────────────────────────────────────────
function GroceryList({ plan }) {
  const groceries = useMemo(() => {
    if (!plan) return {};
    const allIngredients = [];
    DAYS.forEach((day) => {
      const dayData = plan[day];
      if (!dayData) return;
      MEAL_TYPES.forEach(({ key }) => {
        const meal = dayData[key];
        if (meal?.ingredients) {
          meal.ingredients.forEach((item) => {
            allIngredients.push(item.trim());
          });
        }
      });
    });
    // Deduplicate (case-insensitive) and group alphabetically
    const unique = [...new Set(allIngredients.map((i) => i.toLowerCase()))];
    unique.sort();
    const grouped = {};
    unique.forEach((item) => {
      const letter = item.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      // Capitalize first letter for display
      grouped[letter].push(item.charAt(0).toUpperCase() + item.slice(1));
    });
    return grouped;
  }, [plan]);

  const letters = Object.keys(groceries).sort();

  if (letters.length === 0) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
        <ShoppingCart className="h-10 w-10 text-slate-500 mx-auto mb-3 opacity-40" />
        <p className="text-sm text-slate-500">Generate a meal plan to see your grocery list.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-neon-lime" />
        Weekly Grocery List
        <span className="ml-auto text-[11px] text-slate-500 font-normal">
          {letters.reduce((sum, l) => sum + groceries[l].length, 0)} items
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {letters.map((letter) => (
          <div key={letter}>
            <p className="text-xs font-bold text-neon-lime mb-1.5 uppercase">{letter}</p>
            <ul className="space-y-1">
              {groceries[letter].map((item, idx) => (
                <li
                  key={idx}
                  className="text-[12px] text-slate-500 flex items-start gap-2 leading-relaxed"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neon-lime/40 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Saved Plans Accordion ─────────────────────────────────────
function SavedPlanItem({ plan, onDelete, onLoad }) {
  const [open, setOpen] = useState(false);
  const dateStr = plan.createdAt
    ? new Date(plan.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <button
        id={`saved-plan-toggle-${plan.id}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{plan.name}</p>
          <p className="text-[11px] text-slate-500">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {open ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Quick day preview */}
              {plan.plan &&
                DAYS.map((day) => {
                  const d = plan.plan[day];
                  if (!d) return null;
                  return (
                    <div key={day} className="text-[11px]">
                      <span className="text-neon-lime font-semibold">{day}: </span>
                      <span className="text-slate-500">
                        {[d.breakfast?.name, d.lunch?.name, d.dinner?.name, d.snack?.name]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  );
                })}
              <div className="flex gap-2 pt-1">
                <button
                  id={`load-plan-${plan.id}`}
                  onClick={() => onLoad(plan.plan)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-neon-lime/10 text-neon-lime border border-neon-lime/20 hover:bg-neon-lime/20 transition-colors"
                >
                  Load Plan
                </button>
                <button
                  id={`delete-plan-${plan.id}`}
                  onClick={() => onDelete(plan.id)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export default function WeeklyPlanner() {
  const { userProfile } = useAuth();
  const { logMeal, saveMealPlan, mealPlans, deleteMealPlan } = useNutrition();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [activeTab, setActiveTab] = useState("meals"); // "meals" | "grocery"

  // Save plan state
  const [planName, setPlanName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Track which meals have been logged for the selected day
  const [loggedMeals, setLoggedMeals] = useState({});

  const targets = useMemo(
    () => ({
      calories: userProfile?.macros?.calories || 2200,
      protein: userProfile?.macros?.protein || 150,
      carbs: userProfile?.macros?.carbs || 250,
      fat: userProfile?.macros?.fat || 70,
    }),
    [userProfile]
  );

  // ─── Generate Plan ──────────────────────────────────────────
  const handleGenerate = async () => {
    setLoading(true);
    setSavedMsg("");
    setLoggedMeals({});
    try {
      const result = await generateWeeklyMealPlan(
        userProfile?.fitnessGoal || "muscle_gain",
        userProfile?.macros?.calories || 2200,
        userProfile?.macros?.protein || 150,
        userProfile?.dietaryPreference || "non-veg"
      );
      setPlan(result);
      setSelectedDay("Monday");
    } catch (err) {
      console.error("Failed to generate meal plan:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Log a meal ─────────────────────────────────────────────
  const handleLogMeal = (meal, mealType) => {
    const macros = {
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    };
    logMeal(meal.name, macros, mealType.key);
    setLoggedMeals((prev) => ({
      ...prev,
      [`${selectedDay}-${mealType.key}`]: true,
    }));
  };

  // ─── Save plan ──────────────────────────────────────────────
  const handleSavePlan = async () => {
    if (!planName.trim() || !plan) return;
    setSaving(true);
    try {
      await saveMealPlan(planName.trim(), plan);
      setSavedMsg("Plan saved successfully!");
      setPlanName("");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save plan:", err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Load a saved plan ──────────────────────────────────────
  const handleLoadPlan = (planData) => {
    setPlan(planData);
    setSelectedDay("Monday");
    setLoggedMeals({});
    setSavedMsg("");
  };

  const dayMeals = plan?.[selectedDay];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ─── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-neon-lime" />
            Weekly Meal Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered nutrition planning tailored to your goals
          </p>
        </div>
        <button
          id="generate-ai-plan-btn"
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-lime hover:bg-neon-lime/90 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-neon-lime/20 glow-green disabled:opacity-60 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate AI Plan"}
        </button>
      </motion.div>

      {/* ─── Tabs: Meals / Grocery ────────────────────────────── */}
      {plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2"
        >
          <button
            id="tab-meals"
            onClick={() => setActiveTab("meals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === "meals"
                ? "bg-neon-lime/10 text-neon-lime border border-neon-lime/20"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:text-slate-900"
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" />
            Meal Plan
          </button>
          <button
            id="tab-grocery"
            onClick={() => setActiveTab("grocery")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === "grocery"
                ? "bg-neon-lime/10 text-neon-lime border border-neon-lime/20"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Grocery List
          </button>
        </motion.div>
      )}

      {/* ─── Grocery Tab ─────────────────────────────────────── */}
      {plan && activeTab === "grocery" && <GroceryList plan={plan} />}

      {/* ─── Meals Tab Content ────────────────────────────────── */}
      {activeTab === "meals" && (
        <>
          {/* ─── Day Tabs ──────────────────────────────────────── */}
          {(plan || loading) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
            >
              {DAYS.map((day) => (
                <button
                  key={day}
                  id={`day-tab-${day.toLowerCase()}`}
                  onClick={() => {
                    setSelectedDay(day);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    selectedDay === day
                      ? "bg-neon-lime text-black shadow-lg shadow-neon-lime/20"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:border-white/10 hover:text-slate-900"
                  }`}
                >
                  {day.slice(0, 3)}
                  <span className="hidden sm:inline">{day.slice(3)}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* ─── Loading Skeleton ──────────────────────────────── */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ─── No Plan Yet ──────────────────────────────────── */}
          {!plan && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-neon-lime/5 border border-neon-lime/10 flex items-center justify-center">
                <CalendarDays className="h-8 w-8 text-neon-lime/40" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No meal plan generated yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Click <strong className="text-neon-lime">Generate AI Plan</strong> to create a
                personalized 7-day nutrition plan based on your profile targets.
              </p>
            </motion.div>
          )}

          {/* ─── Meal Cards Grid ──────────────────────────────── */}
          {plan && !loading && dayMeals && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {MEAL_TYPES.map((mt) => {
                  const meal = dayMeals[mt.key];
                  if (!meal) return null;
                  return (
                    <MealCard
                      key={`${selectedDay}-${mt.key}`}
                      mealType={mt}
                      meal={meal}
                      onLog={handleLogMeal}
                      loggedId={loggedMeals[`${selectedDay}-${mt.key}`] ? mt.key : null}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ─── Daily Summary ────────────────────────────────── */}
          {plan && !loading && dayMeals && (
            <DailySummary dayMeals={dayMeals} targets={targets} />
          )}
        </>
      )}

      {/* ─── Save Plan Section ────────────────────────────────── */}
      {plan && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Save className="h-4 w-4 text-neon-lime" />
            Save This Plan
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="plan-name-input"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter a plan name (e.g. Lean Bulk Week 1)"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
            />
            <button
              id="save-plan-btn"
              onClick={handleSavePlan}
              disabled={saving || !planName.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-40 shrink-0 shadow-sm border border-slate-800"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>

          {/* Success message */}
          <AnimatePresence>
            {savedMsg && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-neon-lime flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> {savedMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Saved Plans List ─────────────────────────────────── */}
      {mealPlans && mealPlans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 px-1">
            <ClipboardList className="h-4 w-4 text-neon-lime" />
            Saved Plans
            <span className="text-[11px] text-slate-500 font-normal">({mealPlans.length})</span>
          </h3>
          <div className="space-y-2">
            {mealPlans.map((p) => (
              <SavedPlanItem
                key={p.id}
                plan={p}
                onDelete={deleteMealPlan}
                onLoad={handleLoadPlan}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
