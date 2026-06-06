import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Dumbbell, 
  Flame, 
  Scale, 
  Activity, 
  UtensilsCrossed, 
  Calendar, 
  MessageSquare, 
  ChefHat, 
  CupSoda, 
  Camera, 
  User, 
  Edit3, 
  X, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ACTIVITY_LABELS, GOAL_LABELS } from "../utils/nutrition";

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

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="h-10 w-10 text-slate-800 animate-bounce" />
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const { macros } = userProfile;
  const bmi = macros?.bmi || 22.0;
  const calories = macros?.calories || 2000;
  const protein = macros?.protein || 140;
  const carbs = macros?.carbs || 220;
  const fat = macros?.fat || 65;

  // Chart Data
  const chartData = [
    { name: "Protein", value: protein, color: "#84cc16" }, // Lime 500
    { name: "Carbs", value: carbs, color: "#0ea5e9" },     // Sky 500
    { name: "Fat", value: fat, color: "#f43f5e" }          // Rose 500
  ];

  // BMI Category & Styling
  const getBmiCategory = (bmiVal) => {
    if (bmiVal < 18.5) return { label: "Underweight", color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200" };
    if (bmiVal < 25) return { label: "Normal Weight", color: "text-lime-600", bg: "bg-lime-50", border: "border-lime-200" };
    if (bmiVal < 30) return { label: "Overweight", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Obese", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const bmiCat = getBmiCategory(bmi);

  // Quick Action Navigation Cards
  const quickActions = [
    {
      title: "Weekly Planner",
      desc: "Generate and schedule your weekly meal plan matching your macro goals.",
      href: "/planner",
      icon: Calendar,
      color: "bg-lime-500/10 text-lime-700 border-lime-200 hover:bg-lime-500/20",
    },
    {
      title: "AI Nutrition Coach",
      desc: "Get personalized diet tips, workout fuels, and advice from your AI Coach.",
      href: "/coach",
      icon: MessageSquare,
      color: "bg-sky-500/10 text-sky-700 border-sky-200 hover:bg-sky-500/20",
    },
    {
      title: "High-Protein Recipes",
      desc: "Explore a catalog of healthy, high-protein recipes with video tutorials.",
      href: "/recipes",
      icon: ChefHat,
      color: "bg-rose-500/10 text-rose-700 border-rose-200 hover:bg-rose-500/20",
    },
    {
      title: "Shake Builder",
      desc: "Customize your protein shakes with exact macro and calorie breakdowns.",
      href: "/shake",
      icon: CupSoda,
      color: "bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20",
    },
    {
      title: "Food Scanner",
      desc: "Scan your food ingredients or query caloric facts using AI.",
      href: "/scanner",
      icon: Camera,
      color: "bg-indigo-500/10 text-indigo-700 border-indigo-200 hover:bg-indigo-500/20",
    }
  ];

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
      setEditError("Failed to update profile. Please try again.");
    }
  };

  const getGoalEmoji = (goal) => {
    if (goal === "muscle_gain") return "💪";
    if (goal === "fat_loss") return "🔥";
    return "⚡";
  };

  return (
    <div className="relative min-h-screen bg-slate-50 pb-20">
      {/* Background patterns */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-slate-900 to-slate-900/0 -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Welcome Banner - Premium Dark Card */}
        <div className="relative bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl overflow-hidden mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Neon Glow decoration */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-neon-lime/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-[150px] h-[150px] bg-sky-500/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-lime/10 border border-neon-lime/20 text-neon-lime text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Personalized Dashboard
            </span>
            <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight leading-tight">
              Welcome back, <span className="text-neon-lime">{userProfile.name}</span>! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Your customized fitness profile is synchronized and up-to-date.
            </p>
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
            className="relative z-10 flex items-center gap-2 px-6 py-3 bg-neon-lime hover:bg-[#b8e600] text-black font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-neon-lime/10 hover:shadow-neon-lime/20 text-sm self-start md:self-auto shrink-0"
          >
            <Edit3 className="h-4 w-4" />
            <span>Update Fitness Stats</span>
          </button>
        </div>

        {/* Calculated Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Daily Calories */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Calories</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {calories.toLocaleString()} <span className="text-sm font-bold text-slate-400">kcal</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Target to fuel your <span className="font-bold text-slate-700">{userProfile.fitnessGoal.replace("_", " ")}</span> plan.
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <Flame className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          {/* Protein Target */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-lime-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Protein Target</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {protein} <span className="text-sm font-bold text-slate-400">g</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Daily protein target to preserve and build lean muscle.
                </p>
              </div>
              <div className="p-3 bg-lime-50 rounded-2xl border border-lime-100">
                <Dumbbell className="h-6 w-6 text-lime-500 group-hover:scale-110 transition-transform animate-pulse" />
              </div>
            </div>
          </div>

          {/* BMI Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Body Mass Index (BMI)</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {bmi}
                </h3>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border mt-2 ${bmiCat.color} ${bmiCat.bg} ${bmiCat.border}`}>
                  {bmiCat.label}
                </span>
              </div>
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                <Scale className="h-6 w-6 text-sky-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            {/* Visual Indicator Slider */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4 relative">
              <div 
                className="bg-sky-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100))}%` }} 
              />
            </div>
          </div>

        </div>

        {/* Macros Breakdown Chart & Profile Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Donut Chart Macro Breakdown */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Macronutrient Distribution Split</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated split based on your physique parameters and activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-4">
              <div className="h-44 flex justify-center items-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}g`, "Macro"]}
                      contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text showing calories */}
                <div className="absolute text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target</p>
                  <p className="text-lg font-black text-slate-900">{calories}</p>
                  <p className="text-[10px] text-slate-500 font-medium">kcal/day</p>
                </div>
              </div>

              {/* Macro info details */}
              <div className="space-y-3">
                {chartData.map((macro) => {
                  const percentage = Math.round((macro.value * (macro.name === "Fat" ? 9 : 4) / calories) * 100);
                  return (
                    <div key={macro.name} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: macro.color }} />
                        <span className="text-sm font-bold text-slate-700">{macro.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{macro.value}g</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{percentage}% of total calories</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="text-center bg-lime-500/10 border border-lime-500/20 text-lime-800 text-xs p-2.5 rounded-xl font-medium">
              💡 Tip: Maintain your macro balance ratio to optimize lean growth and fat burn efficiency.
            </div>
          </div>

          {/* User Profile Stats */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-lime-500" />
                <span>Body Composition Stats</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Physical dimensions used in equations.</p>
            </div>

            <div className="my-6 space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Gender</span>
                <span className="text-sm font-bold text-slate-800 capitalize">{userProfile.gender}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Age</span>
                <span className="text-sm font-bold text-slate-800">{userProfile.age} years</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Height</span>
                <span className="text-sm font-bold text-slate-800">{userProfile.height} cm</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Weight</span>
                <span className="text-sm font-bold text-slate-800">{userProfile.weight} kg</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-slate-400" />
                  <span>Activity Factor</span>
                </span>
                <span className="text-xs font-bold text-slate-700 max-w-[160px] text-right truncate" title={ACTIVITY_LABELS[userProfile.activityLevel]}>
                  {ACTIVITY_LABELS[userProfile.activityLevel] || userProfile.activityLevel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <UtensilsCrossed className="h-3 w-3 text-slate-400" />
                  <span>Dietary Pattern</span>
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  🍀 {userProfile.dietaryPreference}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-2.5">
              <span className="text-xl">{getGoalEmoji(userProfile.fitnessGoal)}</span>
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fitness Phase</p>
                <p className="text-xs font-bold text-slate-800 truncate">{GOAL_LABELS[userProfile.fitnessGoal] || userProfile.fitnessGoal}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Action Navigation Cards */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
            Nutrition & Meal Planning Hub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="flex flex-col p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-lime-500/30 transition-all duration-300 group"
                >
                  <div className={`p-3 rounded-2xl border w-fit ${action.color.split(" ")[0]} ${action.color.split(" ")[2]}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-4 group-hover:text-lime-600 transition-colors flex items-center justify-between">
                    <span>{action.title}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed flex-1">
                    {action.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* Profile Modification Slide-Over / Modal */}
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
