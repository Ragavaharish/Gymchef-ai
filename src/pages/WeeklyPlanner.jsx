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
    <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className="text-[11px] font-bold text-slate-800">{value}</span>
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
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
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-3 hover:border-[#00a699]/25 hover:shadow-md transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00a699]/5 border border-[#00a699]/10 flex items-center justify-center text-lg shrink-0">
          {mealType.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#00a699]">
            {mealType.label}
          </p>
          <p className="text-sm font-bold text-slate-900 truncate uppercase">{meal.name}</p>
        </div>
      </div>

      {/* Macros Row */}
      <div className="grid grid-cols-4 gap-1.5">
        <MacroPill icon={Flame} label="Cal" value={meal.calories} color="text-amber-500" />
        <MacroPill icon={Beef} label="Pro" value={`${meal.protein}g`} color="text-[#00a699]" />
        <MacroPill icon={Wheat} label="Carb" value={`${meal.carbs}g`} color="text-sky-500" />
        <MacroPill icon={Droplets} label="Fat" value={`${meal.fat}g`} color="text-rose-500" />
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
        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border uppercase tracking-wider ${
          loggedId === mealType.key
            ? "bg-[#00a699]/10 text-[#00a699] border-[#00a699]/20 cursor-default"
            : "bg-slate-50 hover:bg-[#00a699]/10 text-slate-700 hover:text-[#00a699] border-slate-200 hover:border-[#00a699]/20 shadow-sm"
        }`}
      >
        {loggedId === mealType.key ? (
          <span className="flex items-center justify-center gap-1">
            <Check className="h-3.5 w-3.5" /> Logged
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Log Meal
          </span>
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
      <h3 className="text-sm font-extrabold uppercase text-slate-800 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-[#00a699]" />
        Daily Summary
      </h3>

      {/* Macro totals row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: totals.calories, target: targets.calories, unit: "", color: "text-amber-500" },
          { label: "Protein", value: totals.protein, target: targets.protein, unit: "g", color: "text-[#00a699]" },
          { label: "Carbs", value: totals.carbs, target: targets.carbs, unit: "g", color: "text-sky-500" },
          { label: "Fat", value: totals.fat, target: targets.fat, unit: "g", color: "text-rose-500" },
        ].map((m) => (
          <div key={m.label} className="text-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
            <p className={`text-base font-black ${m.color}`}>
              {m.value}
              <span className="text-[9px] text-slate-400 font-bold ml-0.5">{m.unit}</span>
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
              / {m.target}{m.unit} {m.label.slice(0, 3)}
            </p>
          </div>
        ))}
      </div>

      {/* Protein progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-slate-400">Protein Target</span>
          <span className="text-[#00a699]">{proteinPct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${proteinPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#00a699]/60 to-[#00a699] rounded-full"
          />
        </div>
      </div>

      {/* Calorie progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-slate-400">Calorie Target</span>
          <span className="text-amber-500">{calPct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500/60 to-amber-500 rounded-full"
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
    const unique = [...new Set(allIngredients.map((i) => i.toLowerCase()))];
    unique.sort();
    const grouped = {};
    unique.forEach((item) => {
      const letter = item.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(item.charAt(0).toUpperCase() + item.slice(1));
    });
    return grouped;
  }, [plan]);

  const letters = Object.keys(groceries).sort();

  if (letters.length === 0) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
        <ShoppingCart className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-semibold text-slate-500">Generate a meal plan to see your grocery list.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-sm font-extrabold uppercase text-slate-800 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-[#00a699]" />
        Weekly Grocery List
        <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase">
          {letters.reduce((sum, l) => sum + groceries[l].length, 0)} items
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {letters.map((letter) => (
          <div key={letter} className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-2xl">
            <p className="text-xs font-black text-[#00a699] mb-1.5 uppercase">{letter}</p>
            <ul className="space-y-1">
              {groceries[letter].map((item, idx) => (
                <li
                  key={idx}
                  className="text-[12px] text-slate-600 flex items-start gap-2 leading-relaxed"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#00a699]/40 shrink-0" />
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
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <button
        id={`saved-plan-toggle-${plan.id}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-tight text-slate-800 truncate">{plan.name}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{dateStr}</p>
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
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="px-4 py-4 space-y-3 bg-slate-50/50">
              {plan.plan &&
                DAYS.map((day) => {
                  const d = plan.plan[day];
                  if (!d) return null;
                  return (
                    <div key={day} className="text-[11px] font-medium leading-relaxed">
                      <span className="text-[#00a699] font-black uppercase tracking-wider">{day}: </span>
                      <span className="text-slate-600">
                        {[d.breakfast?.name, d.lunch?.name, d.dinner?.name, d.snack?.name]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  );
                })}
              <div className="flex gap-2 pt-2">
                <button
                  id={`load-plan-${plan.id}`}
                  onClick={() => onLoad(plan.plan)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#00a699]/10 text-[#00a699] border border-[#00a699]/20 hover:bg-[#00a699]/20 transition-all shadow-sm"
                >
                  Load Plan
                </button>
                <button
                  id={`delete-plan-${plan.id}`}
                  onClick={() => onDelete(plan.id)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-[#e65c5c] border border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
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
  const [activeTab, setActiveTab] = useState("meals");

  const [planName, setPlanName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
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

  const handleLogMeal = async (meal, mealType) => {
    const mealKey = `${selectedDay}-${mealType.key}`;
    if (loggedMeals[mealKey]) return;
    try {
      await logMeal(meal.name, {
        calories: Number(meal.calories || 0),
        protein: Number(meal.protein || 0),
        carbs: Number(meal.carbs || 0),
        fat: Number(meal.fat || 0)
      }, mealType.key);
      setLoggedMeals((prev) => ({ ...prev, [mealKey]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePlan = async () => {
    if (!plan || !planName.trim()) return;
    setSaving(true);
    try {
      await saveMealPlan(planName.trim(), plan);
      setSavedMsg("Plan saved successfully!");
      setPlanName("");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPlan = (planData) => {
    setPlan(planData);
    setSelectedDay("Monday");
    setLoggedMeals({});
    setSavedMsg("");
  };

  const dayMeals = plan?.[selectedDay];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 lg:px-12 pb-24 space-y-6">
      {/* ─── Header (Centered) ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a699]/10 border border-[#00a699]/20 text-[#00a699] text-xs font-bold uppercase tracking-wider mb-4">
          <CalendarDays className="h-3.5 w-3.5" /> GymChef AI Planner
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">
          Weekly Meal Planner
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Plan your week with ease! Click below to generate a fully customized 7-day high-protein nutrition plan tailored precisely to your macro metrics and physique goals.
        </p>

        {/* Generate Button centered below paragraph */}
        <div className="flex justify-center mt-6">
          <button
            id="generate-ai-plan-btn"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#e65c5c] hover:bg-[#d54b4b] text-white font-extrabold rounded-full transition-all duration-300 shadow-md shadow-[#e65c5c]/10 disabled:opacity-60 uppercase tracking-widest text-xs"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating Plan..." : "Generate AI Plan"}
          </button>
        </div>
      </motion.div>

      {/* ─── Tabs: Meals / Grocery ─── */}
      {plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto flex gap-2"
        >
          <button
            id="tab-meals"
            onClick={() => setActiveTab("meals")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "meals"
                ? "bg-[#00a699]/15 text-[#00a699] border-[#00a699]/20 shadow"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-sm"
            }`}
          >
            <ListChecks className="h-4 w-4" />
            Meal Plan
          </button>
          <button
            id="tab-grocery"
            onClick={() => setActiveTab("grocery")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "grocery"
                ? "bg-[#00a699]/15 text-[#00a699] border-[#00a699]/20 shadow"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-sm"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Grocery List
          </button>
        </motion.div>
      )}

      {/* ─── Grocery Tab Content ─── */}
      <div className="max-w-6xl mx-auto">
        {plan && activeTab === "grocery" && <GroceryList plan={plan} />}

        {/* ─── Meals Tab Content ─── */}
        {activeTab === "meals" && (
          <div className="space-y-6">
            {/* ─── Day Tabs ─── */}
            {(plan || loading) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin max-w-full"
              >
                {DAYS.map((day) => (
                  <button
                    key={day}
                    id={`day-tab-${day.toLowerCase()}`}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 border ${
                      selectedDay === day
                        ? "bg-[#00a699] text-white border-[#00a699] shadow"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-350 hover:text-slate-800 shadow-sm"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </motion.div>
            )}

            {/* ─── Loading Skeleton ─── */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* ─── No Plan Yet Standby ─── */}
            {!plan && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-[#00a699]/10 border border-[#00a699]/20 flex items-center justify-center shadow-inner">
                  <CalendarDays className="h-8 w-8 text-[#00a699]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  No Weekly Meal Plan Yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Use our Gemini AI planner to draft a healthy, high-protein weekly diet plan tailored exactly to your daily calorie goals. Click the <strong className="text-[#00a699]">Generate AI Plan</strong> button above.
                </p>
              </motion.div>
            )}

            {/* ─── Meal Cards Grid ─── */}
            {plan && !loading && dayMeals && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
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

            {/* ─── Daily Summary Bar ─── */}
            {plan && !loading && dayMeals && (
              <DailySummary dayMeals={dayMeals} targets={targets} />
            )}
          </div>
        )}

        {/* ─── Save Plan Section ─── */}
        {plan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4 mt-6"
          >
            <h3 className="text-sm font-extrabold uppercase text-slate-800 flex items-center gap-2">
              <Save className="h-4 w-4 text-[#00a699]" />
              Save Active Plan
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="plan-name-input"
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter a plan name (e.g. Lean Bulk Week 1)"
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#00a699] rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              <button
                id="save-plan-btn"
                onClick={handleSavePlan}
                disabled={saving || !planName.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e65c5c] hover:bg-[#d54b4b] text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-40 shrink-0 shadow-md shadow-[#e65c5c]/10"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
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
                  className="text-xs text-emerald-600 font-bold flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> {savedMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── Saved Plans Catalog List ─── */}
        {mealPlans && mealPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mt-8"
          >
            <h3 className="text-sm font-extrabold uppercase text-slate-800 flex items-center gap-2 px-1">
              <ClipboardList className="h-4 w-4 text-[#00a699]" />
              Saved Plans Catalog
              <span className="text-[10px] text-slate-400 font-black ml-1">({mealPlans.length})</span>
            </h3>
            <div className="space-y-3">
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
    </div>
  );
}
