import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  Beef,
  Flame,
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

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const filteredRecipes = useMemo(() => {
    let results = RECIPES;
    if (activeCategory !== "all") {
      results = results.filter((r) => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }
    return results;
  }, [activeCategory, searchQuery]);

  const activeCategoryData = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-12 pb-24">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-neon-lime/10 rounded-2xl border border-neon-lime/20">
                <ChefHat className="h-6 w-6 text-neon-lime" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  High-Protein Recipes
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {RECIPES.length} gym-friendly recipes with cooking tutorials
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="recipe-search"
              type="text"
              placeholder="Search recipes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-neon-lime rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm focus:shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Category Filter Pills ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 overflow-x-auto no-scrollbar"
      >
        <div className="flex gap-2 pb-2 min-w-max">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-neon-lime border-slate-800 shadow-lg"
                    : "bg-white text-slate-600 border-slate-200 hover:border-neon-lime/30 hover:bg-neon-lime/5 shadow-sm"
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                {cat.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-neon-lime/20 text-neon-lime"
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredRecipes.length === 0 ? (
            <motion.div
              variants={cardVariants}
              className="col-span-full flex flex-col items-center justify-center py-20"
            >
              <Filter className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-semibold text-lg">
                No recipes found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Try a different category or search term
              </p>
            </motion.div>
          ) : (
            filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                variants={cardVariants}
                layout
                onClick={() => setSelectedRecipe(recipe)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-neon-lime/30 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Play overlay on hover */}
                  {recipe.youtubeId && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Play className="h-5 w-5 text-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-bold text-slate-700 uppercase tracking-wider shadow-sm">
                    {recipe.category.replace("-", " ")}
                  </span>

                  {/* Time badge */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-[11px] font-semibold text-white flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {recipe.time}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight line-clamp-2 group-hover:text-slate-700 transition-colors">
                    {recipe.title}
                  </h3>

                  {/* Macro Row */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="text-center py-2 rounded-lg bg-neon-lime/5">
                      <p className="text-xs font-bold text-neon-lime">
                        {recipe.macros.protein}g
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                        Protein
                      </p>
                    </div>
                    <div className="text-center py-2 rounded-lg bg-amber-50">
                      <p className="text-xs font-bold text-amber-500">
                        {recipe.macros.calories}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                        Cal
                      </p>
                    </div>
                    <div className="text-center py-2 rounded-lg bg-sky-50">
                      <p className="text-xs font-bold text-sky-500">
                        {recipe.macros.carbs}g
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                        Carbs
                      </p>
                    </div>
                    <div className="text-center py-2 rounded-lg bg-rose-50">
                      <p className="text-xs font-bold text-rose-400">
                        {recipe.macros.fat}g
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                        Fat
                      </p>
                    </div>
                  </div>

                  {/* Video indicator */}
                  {recipe.youtubeId && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-red-500 font-semibold">
                      <Play className="h-3 w-3" />
                      Video tutorial included
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

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
