import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  Dumbbell, 
  Flame, 
  Scale, 
  Activity, 
  UtensilsCrossed, 
  Edit3, 
  X, 
  Check, 
  Sparkles 
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function Dashboard() {
  const { userProfile, updateProfileData } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    age: userProfile?.age || "",
    weight: userProfile?.weight || "",
    height: userProfile?.height || "",
    gender: userProfile?.gender || "male",
    activityLevel: userProfile?.activityLevel || "moderately_active",
    fitnessGoal: userProfile?.fitnessGoal || "muscle_gain",
    dietaryPreference: userProfile?.dietaryPreference || "non-veg"
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  // Extract macros if user is onboarded
  const hasProfile = userProfile && userProfile.onboarded;
  const macros = userProfile?.macros;
  const bmi = macros?.bmi || 0;
  const calories = macros?.calories || 0;
  const protein = macros?.protein || 0;
  const carbs = macros?.carbs || 0;
  const fat = macros?.fat || 0;

  const chartData = [
    { name: "Protein", value: protein, color: "#84cc16" }, // lime-500
    { name: "Carbs", value: carbs, color: "#0ea5e9" },     // sky-500
    { name: "Fat", value: fat, color: "#f43f5e" }          // rose-500
  ];

  const getBmiCategory = (bmiVal) => {
    if (bmiVal < 18.5) return { label: "Underweight", color: "text-sky-500 bg-sky-50 border-sky-100" };
    if (bmiVal < 25) return { label: "Normal Weight", color: "text-lime-600 bg-lime-50 border-lime-100" };
    if (bmiVal < 30) return { label: "Overweight", color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "Obese", color: "text-rose-600 bg-rose-50 border-rose-100" };
  };

  const bmiCat = getBmiCategory(bmi);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess(false);

    if (!formData.name.trim()) return setEditError("Name is required.");
    if (!formData.age || Number(formData.age) <= 0) return setEditError("Please enter a valid age.");
    if (!formData.weight || Number(formData.weight) <= 0) return setEditError("Please enter a valid weight.");
    if (!formData.height || Number(formData.height) <= 0) return setEditError("Please enter a valid height.");

    try {
      await updateProfileData({
        name: formData.name,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
        dietaryPreference: formData.dietaryPreference
      });
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditOpen(false);
        setEditSuccess(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setEditError("Failed to update profile.");
    }
  };

  // Change goal card function
  const handleSelectGoal = async (goal) => {
    if (userProfile) {
      try {
        await updateProfileData({ fitnessGoal: goal });
      } catch (e) {
        console.error("Error updating goal:", e);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background Decorators */}
      <div className="absolute inset-0 mesh-gradient-hero grain-overlay"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-lime/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-200 mb-6"
          >
            <span className="text-sm font-medium text-slate-600">Personalized Nutrition Engine</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gradient mb-3">Fuel Your</span>
            <span className="block text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900">
              <span className="relative inline-block">
                <span className="relative z-10">Fitness</span>
                <span className="absolute -bottom-2 left-0 right-0 h-4 md:h-6 bg-neon-lime -skew-x-3 -z-0"></span>
              </span>
              {' '}
              <span className="text-slate-400">Goals</span>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Generate personalized meal plans in seconds. Smart macros, shopping lists, and prep schedules tailored to your body and goals.
          </motion.p>
        </div>

        {/* Dynamic Calculated Stats Panel (Only shown for logged in & onboarded users) */}
        <AnimatePresence>
          {hasProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto mb-16 bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-200 text-lime-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="h-3 w-3" /> Active Nutrition Plan
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">Welcome, {userProfile.name}! 👋</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your statistics are synchronised to calculate your targets.</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      name: userProfile.name || "",
                      age: userProfile.age || "",
                      weight: userProfile.weight || "",
                      height: userProfile.height || "",
                      gender: userProfile.gender || "male",
                      activityLevel: userProfile.activityLevel || "moderately_active",
                      fitnessGoal: userProfile.fitnessGoal || "muscle_gain",
                      dietaryPreference: userProfile.dietaryPreference || "non-veg"
                    });
                    setIsEditOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md text-xs self-start md:self-auto"
                >
                  <Edit3 className="h-4.5 w-4.5 text-neon-lime" />
                  <span>Edit Stats</span>
                </button>
              </div>

              {/* Stats Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* 1. Macro Donut Chart */}
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="h-36 w-full flex justify-center items-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}g`, "Macro"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                      <p className="text-base font-black text-slate-900">{calories}</p>
                      <p className="text-[9px] text-slate-500">kcal/day</p>
                    </div>
                  </div>
                  
                  {/* Macro details pills */}
                  <div className="flex gap-2.5 mt-2 text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-500" /> P: {protein}g</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> C: {carbs}g</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> F: {fat}g</span>
                  </div>
                </div>

                {/* 2. Key Calculated Target Cards */}
                <div className="space-y-4">
                  {/* Calories Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-500">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Calories</p>
                      <p className="text-lg font-black text-slate-900">{calories.toLocaleString()} <span className="text-xs text-slate-400 font-medium">kcal</span></p>
                    </div>
                  </div>

                  {/* Protein Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-lime-50 rounded-xl border border-lime-100 text-lime-600">
                      <Dumbbell className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protein Target</p>
                      <p className="text-lg font-black text-slate-900">{protein} <span className="text-xs text-slate-400 font-medium">grams</span></p>
                    </div>
                  </div>
                </div>

                {/* 3. BMI & Physical Parameters */}
                <div className="space-y-4">
                  {/* BMI Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 text-sky-500">
                        <Scale className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Body Mass Index (BMI)</p>
                        <p className="text-lg font-black text-slate-900">{bmi}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiCat.color}`}>
                      {bmiCat.label}
                    </span>
                  </div>

                  {/* Physics Stats Table */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
                      <span className="text-slate-400 block font-medium">Weight</span>
                      <span className="text-slate-800 text-xs">{userProfile.weight} kg</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
                      <span className="text-slate-400 block font-medium">Height</span>
                      <span className="text-slate-800 text-xs">{userProfile.height} cm</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal Selection Cards (Original layout kept) */}
        <div className="text-center mb-8">
          <span className="text-slate-500 font-medium">
            {hasProfile ? "Your active phase is highlighted below. Click another card to switch goals." : "Choose your goal to begin"}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {/* Card 1: Build Muscle */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => handleSelectGoal("muscle_gain")}
            className={`goal-card p-8 group transition-all duration-300 ${
              userProfile?.fitnessGoal === "muscle_gain" 
                ? "border-neon-lime ring-2 ring-neon-lime/20" 
                : "border-slate-800"
            }`}
          >
            <div className="relative mb-6 flex justify-between items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neon-lime">
                <span className="text-2xl">💪</span>
              </div>
              {userProfile?.fitnessGoal === "muscle_gain" && (
                <span className="px-3 py-1 rounded-full bg-neon-lime/20 text-neon-lime border border-neon-lime/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Check className="h-3 w-3" /> Active Goal
                </span>
              )}
            </div>
            <div className="relative">
              <span className="text-neon-lime text-xs font-bold tracking-widest uppercase mb-2 block">Gain Phase</span>
              <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Build Muscle</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                High-protein surplus plans designed to maximize lean muscle growth and strength gains.
              </p>
              <div className="flex items-center text-neon-lime font-semibold text-sm gap-2">
                <span>Select Plan</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Lose Fat */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => handleSelectGoal("fat_loss")}
            className={`goal-card p-8 group transition-all duration-300 ${
              userProfile?.fitnessGoal === "fat_loss" 
                ? "border-neon-lime ring-2 ring-neon-lime/20" 
                : "border-slate-800"
            }`}
          >
            <div className="relative mb-6 flex justify-between items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neon-lime">
                <span className="text-2xl">🔥</span>
              </div>
              {userProfile?.fitnessGoal === "fat_loss" && (
                <span className="px-3 py-1 rounded-full bg-neon-lime/20 text-neon-lime border border-neon-lime/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Check className="h-3 w-3" /> Active Goal
                </span>
              )}
            </div>
            <div className="relative">
              <span className="text-neon-lime text-xs font-bold tracking-widest uppercase mb-2 block">Cut Phase</span>
              <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Lose Fat</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Strategic calorie deficit with optimal protein to preserve muscle while shredding fat.
              </p>
              <div className="flex items-center text-neon-lime font-semibold text-sm gap-2">
                <span>Select Plan</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Stay Lean */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => handleSelectGoal("maintenance")}
            className={`goal-card p-8 group transition-all duration-300 ${
              userProfile?.fitnessGoal === "maintenance" 
                ? "border-neon-lime ring-2 ring-neon-lime/20" 
                : "border-slate-800"
            }`}
          >
            <div className="relative mb-6 flex justify-between items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neon-lime">
                <span className="text-2xl">⚡</span>
              </div>
              {userProfile?.fitnessGoal === "maintenance" && (
                <span className="px-3 py-1 rounded-full bg-neon-lime/20 text-neon-lime border border-neon-lime/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Check className="h-3 w-3" /> Active Goal
                </span>
              )}
            </div>
            <div className="relative">
              <span className="text-neon-lime text-xs font-bold tracking-widest uppercase mb-2 block">Maintain Phase</span>
              <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Stay Lean</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Balanced nutrition to maintain your physique while supporting peak performance.
              </p>
              <div className="flex items-center text-neon-lime font-semibold text-sm gap-2">
                <span>Select Plan</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section (Original layout kept) */}
      <div className="relative bg-white py-24 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
              Features
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              Everything for
              <span className="relative inline-block ml-3">
                <span className="relative z-10">success</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-neon-lime -skew-x-3 -z-0"></span>
              </span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Built by fitness enthusiasts who understand the grind. Every feature designed to make your nutrition as optimized as your training.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card relative overflow-hidden">
              <span className="absolute top-4 right-6 text-8xl font-extrabold text-slate-100 select-none">01</span>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
                  <span className="text-xl text-neon-lime">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Smart Macros</h3>
                <p className="text-slate-500 leading-relaxed">
                  Automatic protein, carb, and fat targets calibrated to your body composition and training intensity.
                </p>
              </div>
            </div>

            <div className="feature-card relative overflow-hidden">
              <span className="absolute top-4 right-6 text-8xl font-extrabold text-slate-100 select-none">02</span>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
                  <span className="text-xl text-neon-lime">⏱️</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Meal Timing</h3>
                <p className="text-slate-500 leading-relaxed">
                  Strategic pre and post-workout nutrition windows timed perfectly to maximize muscle recovery.
                </p>
              </div>
            </div>

            <div className="feature-card relative overflow-hidden">
              <span className="absolute top-4 right-6 text-8xl font-extrabold text-slate-100 select-none">03</span>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
                  <span className="text-xl text-neon-lime">🛒</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Auto Groceries</h3>
                <p className="text-slate-500 leading-relaxed">
                  Organized grocery lists with exact quantities. Streamline your meal prep and never miss an ingredient.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats Update Modal (Only active if logged in) */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-lime-500" />
                  <span>Update Fitness Parameters</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjusting physical statistics automatically recalculates BMI, calories, and macros.
                </p>
              </div>

              {editError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-3 mb-4 rounded-xl bg-lime-50 border border-lime-100 text-lime-600 text-xs font-semibold">
                  Profile updated successfully! Recalculating...
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Age (years)</label>
                    <input
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Height (cm)</label>
                    <input
                      type="number"
                      required
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                  >
                    <option value="sedentary">Sedentary ( desk job, little exercise )</option>
                    <option value="lightly_active">Lightly Active ( gym 1-3 days/week )</option>
                    <option value="moderately_active">Moderately Active ( gym 3-5 days/week )</option>
                    <option value="very_active">Very Active ( hard training 6-7 days/week )</option>
                    <option value="extra_active">Extra Active ( active athletic/labor job )</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fitness Goal</label>
                    <select
                      value={formData.fitnessGoal}
                      onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    >
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="fat_loss">Fat Loss</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diet Preference</label>
                    <select
                      value={formData.dietaryPreference}
                      onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-semibold transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-900 hover:bg-lime-500 font-bold transition-all shadow-md shadow-lime-400/10 text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
