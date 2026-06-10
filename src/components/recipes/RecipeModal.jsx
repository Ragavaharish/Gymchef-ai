import React, { useState, useEffect } from "react";
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
import { searchCookingVideos } from "../../services/youtube";

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

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(recipe?.youtubeId || null);

  useEffect(() => {
    if (!recipe) return;

    let active = true;
    async function loadVideos() {
      setLoading(true);
      try {
        const results = await searchCookingVideos(recipe.title);
        if (active) {
          let merged = [];
          
          // 1. Add recipe's specific official guide if present
          if (recipe.youtubeId) {
            merged.push({
              title: `${recipe.title} (Official Guide)`,
              videoId: recipe.youtubeId,
              channel: "Chef Tutorial",
              thumbnail: `https://img.youtube.com/vi/${recipe.youtubeId}/hqdefault.jpg`
            });
          }
          
          // 2. Add results from search
          if (results && results.length > 0) {
            results.forEach(res => {
              if (!merged.some(v => v.videoId === res.videoId)) {
                merged.push(res);
              }
            });
          }
          
          // 3. Add category fallback videos to enrich the list and ensure there are multiple guides
          const lowercaseTitle = recipe.title.toLowerCase();
          let category = "general";
          if (lowercaseTitle.includes("muscle") || lowercaseTitle.includes("gain") || lowercaseTitle.includes("surplus") || lowercaseTitle.includes("bulk")) {
            category = "muscle_gain";
          } else if (lowercaseTitle.includes("loss") || lowercaseTitle.includes("fat") || lowercaseTitle.includes("shred") || lowercaseTitle.includes("deficit")) {
            category = "fat_loss";
          }
          
          const staticVideos = {
            muscle_gain: [
              { title: "Full Day of Eating for Muscle Gain (Easy Meals)", videoId: "j4K3u0P_s0k", channel: "Will Tennyson" },
              { title: "High Protein Meal Prep for Muscle Gain", videoId: "kK7e-FmK1wM", channel: "Aesthetic Cook" },
              { title: "Ultimate 4000 Calorie Muscle Gain Recipe Guide", videoId: "K9nB54nZqrs", channel: "Chris Heria" }
            ],
            fat_loss: [
              { title: "Low Calorie High Volume Recipes for Shredding", videoId: "S2y5hL4DkCQ", channel: "Greg Doucette" },
              { title: "Meal Prep for Weight Loss (Easy & High Protein)", videoId: "5F_u-d4z-dM", channel: "Remington James" },
              { title: "Healthy Eating Hacks to Lose Belly Fat", videoId: "k7m1n5x_uRk", channel: "Jeff Nippard" }
            ],
            general: [
              { title: "How to Meal Prep Like a Pro (Gym Edition)", videoId: "kK7e-FmK1wM", channel: "Jeremy Ethier" },
              { title: "10-Minute High Protein Gym Snacks", videoId: "5F_u-d4z-dM", channel: "GymChief AI" }
            ]
          };
          
          staticVideos[category].forEach(v => {
            if (!merged.some(vid => vid.videoId === v.videoId)) {
              merged.push({
                ...v,
                thumbnail: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`
              });
            }
          });

          setVideos(merged);
          if (merged.length > 0) {
            // Prefer the official guide as default selection if present
            const officialGuide = merged.find(v => v.videoId === recipe.youtubeId);
            setActiveVideoId(officialGuide ? officialGuide.videoId : merged[0].videoId);
          } else {
            setActiveVideoId(recipe.youtubeId || null);
          }
        }
      } catch (err) {
        console.error("Error loading recipe videos:", err);
        if (active) {
          const fallbackList = [];
          if (recipe.youtubeId) {
            fallbackList.push({
              title: `${recipe.title} (Official Guide)`,
              videoId: recipe.youtubeId,
              channel: "Chef Tutorial",
              thumbnail: `https://img.youtube.com/vi/${recipe.youtubeId}/hqdefault.jpg`
            });
          }
          setVideos(fallbackList);
          setActiveVideoId(recipe.youtubeId || null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVideos();

    return () => {
      active = false;
    };
  }, [recipe]);

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

            {/* YouTube Video Section */}
            {(activeVideoId || loading) && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-[#e65c5c]" />
                  Video Guides & Cooking Tutorials
                </h3>
                {loading ? (
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 flex items-center justify-center animate-pulse"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <Play className="h-10 w-10 animate-spin mb-2 text-[#00a699]" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loading video guides...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black"
                      style={{ paddingBottom: "56.25%" }}
                    >
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1`}
                        title={`${recipe.title} - Cooking Tutorial`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Related videos selection grid */}
                    {videos.length > 1 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                          More Cooking Guides
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {videos.map((vid) => (
                            <button
                              key={vid.videoId}
                              onClick={() => setActiveVideoId(vid.videoId)}
                              className={`group flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-300 ${
                                activeVideoId === vid.videoId
                                  ? "bg-slate-950 text-white border-slate-900 shadow-md scale-[1.01]"
                                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                              }`}
                            >
                              <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black leading-tight line-clamp-2" title={vid.title}>
                                  {vid.title}
                                </h4>
                                <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 truncate ${
                                  activeVideoId === vid.videoId ? "text-[#00a699]" : "text-slate-500"
                                }`}>
                                  {vid.channel}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
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
