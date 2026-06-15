import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, ArrowRight, ChefHat, Activity, Play } from "lucide-react";
import { RECIPES } from "../data/recipes";
import RecipeModal from "../components/recipes/RecipeModal";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Highlight 3 popular recipes
  const popularRecipes = RECIPES.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
        
        {/* ─── Hero / Header ─── */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00a699]/10 border border-[#00a699]/20 text-[#00a699] text-xs font-black uppercase tracking-wider mb-5">
            <Activity className="h-4 w-4" /> GymChef AI Ecosystem
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
            GYMCHEF <span className="text-[#00a699]">AI</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            We understand that for many of our members, exercise and nutrition play a huge part in physical and mental wellbeing. GymChef AI provides smart tools like voice-enabled coaching, custom meal planners, and precise body metrics to fuel your potential.
          </p>
        </div>

        {/* ─── Promotional Composition Banner (PureGym Style) ─── */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden mb-16 flex flex-col md:flex-row min-h-[300px]">
          {/* Left Block (Teal Graphic) */}
          <div className="bg-[#00a699] text-white p-8 flex flex-col justify-between md:w-[40%] shrink-0 relative overflow-hidden select-none">
            {/* Background design accents */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
              <div className="w-full h-full border-[16px] border-white rotate-45 transform scale-150" />
            </div>
            
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
              <div className="border-2 border-white p-3 rounded-xl flex flex-col items-start gap-1 w-fit">
                <span className="text-[10px] font-black tracking-widest uppercase opacity-90">GymChef AI</span>
                <h2 className="text-2xl font-black tracking-tighter leading-none">THE 2026</h2>
              </div>
              
              <div className="mt-8">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase">
                  FITNESS
                </h1>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-slate-900">
                  REPORT
                </h1>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-xs font-black tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded">2026</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">Join Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block (Description and Action Link) */}
          <div className="p-8 md:p-10 flex flex-col justify-between flex-grow bg-white">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase mb-4 leading-tight">
                GYMCHEF NUTRITION REPORT & CALORIE CALCULATOR
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                Take a deep dive into your physical metrics, activity levels, and customized macronutrient targets. Our AI engine computes exact protein requirements and daily energy budgets tailored specifically to your body and lifestyle.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00a699]" />
                  <span className="text-xs font-bold text-slate-700">AI Coach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00a699]" />
                  <span className="text-xs font-bold text-slate-700">Meal Planner</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00a699]" />
                  <span className="text-xs font-bold text-slate-700">Shake Builder</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00a699]" />
                  <span className="text-xs font-bold text-slate-700">Food Scanner</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Free Macro Report Included</span>
              <Link
                to="/auth"
                className="flex items-center gap-2 px-6 py-3.5 bg-[#e65c5c] hover:bg-[#d54b4b] text-white font-extrabold rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-xs uppercase tracking-wider"
              >
                <span>Calculate My Plan</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Healthy Recipes Teaser Section ─── */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
            Popular Healthy Recipes
          </h2>
          <p className="text-slate-500 text-sm">
            Check out some of our high-protein culinary favorites. Click to view ingredients list, macro ratios, and video tutorials directly.
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {popularRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              variants={cardVariants}
              onClick={() => setSelectedRecipe(recipe)}
              className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Slanted Image Overlay */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Play overlay on hover */}
                {recipe.youtubeId && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </div>
                  </div>
                )}
                
                {/* Slanted Overlay */}
                <div 
                  className="absolute inset-y-0 left-0 w-[72%] bg-black/90 p-4 z-10 flex flex-col justify-between"
                  style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e65c5c] flex items-center justify-center font-black text-xs text-white shadow">
                      {recipe.macros.protein}g
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/15">
                      <span className="text-[8px] text-white font-extrabold">GC</span>
                    </div>
                  </div>
                  
                  <div className="text-left font-black tracking-tight text-white leading-tight text-[11px] uppercase line-clamp-2 max-w-[85%] mb-2">
                    {recipe.title}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {recipe.category.replace("-", " ")}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-[#00a699] transition-colors mb-4">
                    {recipe.title}
                  </h3>
                </div>

                {/* Macro summary */}
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
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            <span>Explore All Recipes</span>
            <ChefHat className="h-4 w-4" />
          </Link>
        </div>

      </div>

      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
}
