import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Users,
  ChefHat,
  Play,
  CheckCircle2,
} from "lucide-react";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.2 } },
};

export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

  const macroItems = [
    { label: "Protein", value: `${recipe.macros.protein}g`, icon: Beef, color: "text-[#00a699]", bg: "bg-[#00a699]/10", border: "border-[#00a699]/20" },
    { label: "Calories", value: recipe.macros.calories, icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Carbs", value: `${recipe.macros.carbs}g`, icon: Wheat, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { label: "Fat", value: `${recipe.macros.fat}g`, icon: Droplets, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="recipe-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      >
        <motion.div
          key="recipe-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Close Button */}
          <button
            id="recipe-modal-close"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-md hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>

          {/* Hero Image */}
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#00a699] text-white text-xs font-bold uppercase tracking-wider">
                  {recipe.category.replace("-", " ")}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {recipe.time}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold flex items-center gap-1">
                  <Users className="h-3 w-3" /> {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                {recipe.title}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Macro Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {macroItems.map((m) => (
                <div
                  key={m.label}
                  className={`${m.bg} border ${m.border} rounded-2xl p-4 text-center`}
                >
                  <m.icon className={`h-5 w-5 ${m.color} mx-auto mb-1`} />
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* YouTube Video */}
            {recipe.youtubeId && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-red-500" />
                  Cooking Tutorial
                </h3>
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${recipe.youtubeId}?rel=0&modestbranding=1`}
                    title={`${recipe.title} - Cooking Tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Two-column layout: Ingredients + Instructions */}
            <div className="grid md:grid-cols-5 gap-8">
              {/* Ingredients */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-[#00a699]" />
                  Ingredients
                </h3>
                <ul className="space-y-2.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a699]" />
                      </span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="md:col-span-3">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#00a699]" />
                  Step-by-Step Instructions
                </h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-[#00a699] flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed pt-1">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
