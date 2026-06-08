import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { calculateMacros } from "../utils/nutrition";
import { 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Scale, 
  TrendingUp, 
  Activity, 
  Compass, 
  UtensilsCrossed,
  AlertCircle
} from "lucide-react";

export default function Onboarding() {
  const { userProfile, onboardUser, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderately_active",
    fitnessGoal: "muscle_gain",
    dietaryPreference: "non-veg"
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.age || Number(formData.age) <= 0) newErrors.age = "Please enter a valid age";
    } else if (step === 2) {
      if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = "Please enter a valid weight in kg";
      if (!formData.height || Number(formData.height) <= 0) newErrors.height = "Please enter a valid height in cm";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitError("");
    try {
      await onboardUser(formData);
      navigate("/");
    } catch (e) {
      console.error("Error onboarding user:", e);
      setSubmitError(e.message || "Failed to save onboarding data. Please check connection.");
    }
  };

  // Live calculations for Step 3 preview
  const liveMacros = formData.weight && formData.height && formData.age
    ? calculateMacros(
        Number(formData.weight),
        Number(formData.height),
        Number(formData.age),
        formData.gender,
        formData.activityLevel,
        formData.fitnessGoal
      )
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-900 flex flex-col justify-center items-center p-4">
      {/* Progress Header */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? "Personal Info" : step === 2 ? "Body Parameters" : "Fitness Goals"}</span>
        </div>
        <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="bg-neon-lime h-full"
            initial={{ width: "33%" }}
            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Main card panel */}
      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-sm p-8 rounded-3xl border border-slate-200 shadow-2xl relative">
        <AnimatePresence>
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 mb-6 rounded-xl bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs font-semibold"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="text-neon-lime h-5 w-5" />
                  <span>Tell us about yourself</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">We need some basic info to start tailoring your coaching experience.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
                  />
                  {errors.name && <p className="text-xs text-neon-red pl-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Age (years)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
                    />
                    {errors.age && <p className="text-xs text-neon-red pl-1">{errors.age}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all"
                    >
                      <option value="male" className="bg-[#121212]">Male</option>
                      <option value="female" className="bg-[#121212]">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Scale className="text-neon-lime h-5 w-5" />
                  <span>Physical Statistics</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">These values are critical to calculate your BMR and TDEE correctly.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="e.g. 75"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
                    />
                    {errors.weight && <p className="text-xs text-neon-red pl-1">{errors.weight}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      placeholder="e.g. 180"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
                    />
                    {errors.height && <p className="text-xs text-neon-red pl-1">{errors.height}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-neon-lime" />
                    <span>Daily Activity Level</span>
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all"
                  >
                    <option value="sedentary" className="bg-[#121212]">Sedentary (desk job, low activity)</option>
                    <option value="lightly_active" className="bg-[#121212]">Lightly Active (gym 1-3 days/week)</option>
                    <option value="moderately_active" className="bg-[#121212]">Moderately Active (gym 3-5 days/week)</option>
                    <option value="very_active" className="bg-[#121212]">Very Active (hard training 6-7 days/week)</option>
                    <option value="extra_active" className="bg-[#121212]">Extra Active (athlete, active labor job)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-neon-lime h-5 w-5" />
                  <span>Target Goals</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">Select your primary objective and dietary restriction.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Compass className="h-3 w-3 text-neon-lime" />
                      <span>Fitness Goal</span>
                    </label>
                    <select
                      value={formData.fitnessGoal}
                      onChange={(e) => handleInputChange("fitnessGoal", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all"
                    >
                      <option value="muscle_gain" className="bg-[#121212]">💪 Muscle Gain</option>
                      <option value="fat_loss" className="bg-[#121212]">🔥 Fat Loss</option>
                      <option value="maintenance" className="bg-[#121212]">⚡ Maintenance</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <UtensilsCrossed className="h-3 w-3 text-neon-lime" />
                      <span>Preference</span>
                    </label>
                    <select
                      value={formData.dietaryPreference}
                      onChange={(e) => handleInputChange("dietaryPreference", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all"
                    >
                      <option value="veg" className="bg-[#121212]">🍀 Veg (Vegetarian)</option>
                      <option value="non-veg" className="bg-[#121212]">🍗 Non-Veg (Meat & Fish)</option>
                    </select>
                  </div>
                </div>

                {/* Macro Target Preview */}
                {liveMacros && (
                  <div className="p-4 rounded-2xl bg-black/50 border border-neon-lime/20 space-y-3">
                    <p className="text-xs font-bold text-neon-lime uppercase tracking-wider">Calculated Nutrition Profile</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-slate-100 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Calories</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{liveMacros.calories}</p>
                      </div>
                      <div className="p-2 bg-slate-100 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Protein</p>
                        <p className="text-sm font-bold text-neon-lime mt-0.5">{liveMacros.protein}g</p>
                      </div>
                      <div className="p-2 bg-slate-100 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Carbs</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{liveMacros.carbs}g</p>
                      </div>
                      <div className="p-2 bg-slate-100 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Fat</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{liveMacros.fat}g</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                      <span>BMI: <strong className="text-slate-900">{liveMacros.bmi}</strong></span>
                      <span>BMR: <strong className="text-slate-900">{liveMacros.bmr} kcal</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stepper Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-200 flex items-center gap-1.5 transition-all text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-rose-600 font-bold transition-all text-sm flex items-center"
              title="Log Out"
            >
              <span>Log Out</span>
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-neon-lime text-black hover:bg-neon-lime/90 flex items-center gap-1.5 transition-all text-sm font-bold shadow-lg shadow-neon-lime/10"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-neon-lime text-black hover:bg-neon-lime/90 flex items-center gap-1.5 transition-all text-sm font-bold shadow-lg shadow-neon-lime/15 glow-green"
            >
              <span>Build My Plan</span>
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
