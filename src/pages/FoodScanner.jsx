import React from 'react';
import { motion } from 'framer-motion';

export default function FoodScanner() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white border border-slate-200 shadow-lg p-12 rounded-[2rem] max-w-lg text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent pulse-neon" />
        
        <div className="w-40 h-40 mx-auto mb-10 relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-dashed border-neon-lime/40 rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-3 bg-dark rounded-full flex items-center justify-center border border-neon-lime/20 shadow-[0_0_30px_rgba(57,255,20,0.15)]"
          >
             <span className="text-5xl">📸</span>
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 tracking-tight">AI Food Scanner</h1>
        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
          Point your camera at any meal to instantly analyze its macronutrients and log it to your daily nutrition plan.
        </p>
        
        <button className="w-full bg-white text-black font-bold text-lg py-5 rounded-2xl hover:bg-neon-lime hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-neon-lime/30">
          Open Camera
        </button>
      </motion.div>
    </div>
  );
}
