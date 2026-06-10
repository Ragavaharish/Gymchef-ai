import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  ChefHat,
  Filter,
  Play,
} from "lucide-react";
import { CATEGORIES, RECIPES } from "../data/recipes";
import RecipeModal from "../components/recipes/RecipeModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Heuristic to dynamically classify recipes as veg or non-veg if not defined
const getRecipeDiet = (recipe) => {
  if (recipe.diet) return recipe.diet;
  const titleLower = recipe.title.toLowerCase();
  const nonVegKeywords = [
    "chicken", "steak", "beef", "salmon", "turkey", "cod", "ribeye", 
    "fish", "tuna", "prawn", "lamb", "mutton", "pork", "tikka"
  ];
  const isNonVeg = 
    nonVegKeywords.some(keyword => titleLower.includes(keyword)) || 
    recipe.ingredients.some(ing => nonVegKeywords.some(keyword => ing.toLowerCase().includes(keyword)));
  return isNonVeg ? "non-veg" : "veg";
};

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all"); // "all", "veg", "non-veg"
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const filteredRecipes = useMemo(() => {
    let results = RECIPES;

    // Diet Filter
    if (dietFilter !== "all") {
      results = results.filter((r) => getRecipeDiet(r) === dietFilter);
    }

    // Category Filter: only apply if search query is empty OR if searching we still want categories
    if (activeCategory !== "all" && !searchQuery.trim()) {
      results = results.filter((r) => r.category === activeCategory);
    } else if (activeCategory !== "all" && searchQuery.trim()) {
      results = results.filter((r) => r.category === activeCategory);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }
    return results;
  }, [activeCategory, searchQuery, dietFilter]);

  const globalSearchMatchesCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return RECIPES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.toLowerCase().includes(q))
    ).length;
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 lg:px-12 pb-24">
      {/* ─── Header (Centered like PureGym) ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a699]/10 border border-[#00a699]/20 text-[#00a699] text-xs font-bold uppercase tracking-wider mb-4">
          <ChefHat className="h-3.5 w-3.5" /> GymChief AI Recipes
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">
          Healthy Recipes
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Need some inspiration for your next meal? Check out our healthy food recipes! From high protein desserts to quick meal prep ideas, we have a huge range of recipes that will help you to keep fit and healthy all year round.
        </p>
      </motion.div>

      {/* ─── Search and Diet Filter Bar ─── */}
      <div className="max-w-6xl mx-auto mb-8 bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Diet Preference Toggles */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
          {[
            { id: "all", label: "Both (Veg & Non-Veg)", emoji: "🍽️" },
            { id: "veg", label: "Vegetarian 🥦", emoji: "" },
            { id: "non-veg", label: "Non-Vegetarian 🍗", emoji: "" }
          ].map((diet) => {
            const isActive = dietFilter === diet.id;
            return (
              <button
                key={diet.id}
                onClick={() => setDietFilter(diet.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-[#00a699] text-white border-[#00a699] shadow-md shadow-[#00a699]/10"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {diet.label}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80 z-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="recipe-search"
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#00a699] focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ─── Category Filter Pills ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 overflow-x-auto no-scrollbar max-w-6xl mx-auto"
      >
        <div className="flex gap-2 pb-2 min-w-max justify-center">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === "all"
                ? RECIPES.length
                : RECIPES.filter((r) => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 border whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-800 shadow"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                {cat.label}
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive
                      ? "bg-[#00a699] text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Recipe Grid ─── */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${dietFilter}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRecipes.length === 0 ? (
              <motion.div
                variants={cardVariants}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm"
              >
                <Filter className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-semibold text-lg">
                  No recipes found
                </p>
                <p className="text-slate-400 text-sm mt-1 mb-6 max-w-sm">
                  We couldn't find matching recipes with your current category, diet, and search settings.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {activeCategory !== "all" && (
                    <button
                      onClick={() => setActiveCategory("all")}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Clear Category Filter
                    </button>
                  )}
                  {dietFilter !== "all" && (
                    <button
                      onClick={() => setDietFilter("all")}
                      className="px-4 py-2.5 bg-[#00a699] hover:bg-[#008c81] text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Show All Diets
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              filteredRecipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  variants={cardVariants}
                  layout
                  onClick={() => setSelectedRecipe(recipe)}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#00a699]/30 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col min-h-[380px]"
                >
                  {/* Card Image with PureGym slanted overlay */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Play overlay on hover */}
                    {recipe.youtubeId && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                          <Play className="h-5 w-5 text-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Dark Slanted Overlay (PureGym style) */}
                    <div 
                      className="absolute inset-y-0 left-0 w-[72%] bg-black/90 p-4 z-10 flex flex-col justify-between"
                      style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Protein Circle Badge (Red/Coral) */}
                        <div className="w-8 h-8 rounded-full bg-[#e65c5c] flex items-center justify-center font-black text-xs text-white shadow">
                          {recipe.macros.protein}g
                        </div>
                        {/* GymChief Mini Logo badge */}
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                          <span className="text-[8px] text-white font-extrabold">GC</span>
                        </div>
                      </div>
                      
                      {/* Uppercase styled title */}
                      <div className="text-left font-black tracking-tight text-white leading-tight text-[11px] uppercase line-clamp-2 max-w-[85%] mb-2">
                        {recipe.title}
                      </div>
                    </div>

                    {/* Time badge on the right image area */}
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-semibold text-white flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {recipe.time}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Details tags */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {recipe.category.replace("-", " ")}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          getRecipeDiet(recipe) === "veg" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {getRecipeDiet(recipe) === "veg" ? "🥦 VEG" : "🍗 NON-VEG"}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2 group-hover:text-[#00a699] transition-colors mb-4">
                        {recipe.title}
                      </h3>
                    </div>

                    {/* Simplified 3-Column Macro Row */}
                    <div className="grid grid-cols-3 gap-0 border-t border-slate-100 pt-3 mt-auto">
                      <div className="text-center border-r border-slate-100">
                        <p className="text-xs font-black text-slate-800">{recipe.macros.calories}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Kcal</p>
                      </div>
                      <div className="text-center border-r border-slate-100">
                        <p className="text-xs font-black text-slate-800">{recipe.macros.carbs}g</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-800">{recipe.macros.fat}g</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Fat</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Recipe Detail Modal ─── */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
