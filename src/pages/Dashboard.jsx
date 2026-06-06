import React from 'react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background Decorators */}
      <div className="absolute inset-0 mesh-gradient-hero grain-overlay"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-lime/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-200 mb-8"
          >
            <span className="text-sm font-medium text-slate-600">Free Forever • No Signup Required</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gradient mb-4">Fuel Your</span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900">
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
            className="mt-8 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Generate personalized meal plans in seconds. Smart macros, shopping lists, and prep schedules tailored to your body and goals.
          </motion.p>
        </div>

        {/* Goal Selection Cards */}
        <div className="text-center mb-8">
          <span className="text-slate-500 font-medium">Choose your goal to begin</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="goal-card p-8 group"
          >
            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neon-lime">
                <span className="text-2xl">💪</span>
              </div>
            </div>
            <div className="relative">
              <span className="text-neon-lime text-xs font-bold tracking-widest uppercase mb-2 block">Gain Phase</span>
              <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Build Muscle</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                High-protein surplus plans designed to maximize lean muscle growth and strength gains.
              </p>
              <div className="flex items-center text-neon-lime font-semibold text-sm gap-2">
                <span>Start Planning</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="goal-card p-8 group"
          >
            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neon-lime">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <div className="relative">
              <span className="text-neon-lime text-xs font-bold tracking-widest uppercase mb-2 block">Cut Phase</span>
              <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Lose Fat</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Strategic calorie deficit with optimal protein to preserve muscle while shredding fat.
              </p>
              <div className="flex items-center text-neon-lime font-semibold text-sm gap-2">
                <span>Start Planning</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="goal-card p-8 group"
          >
            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neon-lime">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            <div className="relative">
              <span className="text-neon-lime text-xs font-bold tracking-widest uppercase mb-2 block">Maintain Phase</span>
              <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Stay Lean</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Balanced nutrition to maintain your physique while supporting peak performance.
              </p>
              <div className="flex items-center text-neon-lime font-semibold text-sm gap-2">
                <span>Start Planning</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
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
    </div>
  );
}
