import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RefreshCw, 
  Sparkles, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  BookOpen,
  Info,
  Calendar,
  Flame
} from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { scanFoodImage } from '../services/gemini';

export default function FoodScanner() {
  const { logMeal, saveFoodScan } = useNutrition();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [mealType, setMealType] = useState('lunch');
  const [isLogged, setIsLogged] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close webcam stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setScanResult(null);
    setImagePreview(null);
    setIsLogged(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Webcam access failed:', err);
      setError('Camera access denied or unavailable. You can still upload a photo of your meal below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        stopCamera();
        analyzeImage(dataUrl);
      }
    } catch (err) {
      console.error('Failed to capture frame:', err);
      setError('Failed to capture frame. Please try uploading a photo instead.');
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanResult(null);
    setIsLogged(false);
    stopCamera();

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.onerror = () => {
      setError('Failed to read selected file.');
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Data) => {
    setIsScanning(true);
    setError(null);
    try {
      const result = await scanFoodImage(base64Data, 'image/jpeg');
      setScanResult(result);
      // Save to scans history
      await saveFoodScan(
        result.foodName || 'Scanned Food', 
        base64Data, 
        result.macros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        result.healthierAlternatives || []
      );
    } catch (err) {
      console.error('Scan API analysis failed:', err);
      setError('AI meal analysis failed. Make sure the photo is clear, or try again shortly.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogMeal = async () => {
    if (!scanResult) return;
    try {
      await logMeal(scanResult.foodName, scanResult.macros, mealType);
      setIsLogged(true);
      setTimeout(() => {
        setIsLogged(false);
      }, 3000);
    } catch (e) {
      console.error('Error logging meal:', e);
      setError('Failed to log this meal to your daily tracker.');
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setIsLogged(false);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 lg:px-12 pb-24 flex flex-col justify-start">
      {/* ─── Page Header (Centered like PureGym) ─── */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a699]/10 border border-[#00a699]/20 text-[#00a699] text-xs font-bold uppercase tracking-wider mb-4">
          <Camera className="h-3.5 w-3.5" /> GymChief AI Scanner
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">
          AI Food Scanner
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Take a photo or upload a meal image to instantly extract macros and track your daily logs. Powered by Gemini multi-modal AI.
        </p>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Camera/Image viewport */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full aspect-square max-w-md bg-slate-900 rounded-[2.5rem] overflow-hidden relative border border-slate-200 shadow-2xl flex flex-col items-center justify-center isolate">
            <AnimatePresence mode="wait">
              {/* Error overlay */}
              {error && !isCameraActive && !isScanning && !scanResult && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-950 z-20 text-white"
                >
                  <AlertCircle className="h-12 w-12 text-[#e65c5c] mb-4 animate-bounce" />
                  <p className="text-sm font-semibold mb-2">Scanner Notification</p>
                  <p className="text-xs text-slate-400 max-w-xs mb-6">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {/* 1. Camera view */}
              {isCameraActive && (
                <motion.div 
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay framing box */}
                  <div className="absolute inset-8 border-2 border-dashed border-[#00a699]/60 rounded-3xl pointer-events-none flex items-center justify-center">
                    <div className="w-8 h-8 border-t-4 border-l-4 border-[#00a699] absolute top-0 left-0 rounded-tl-lg" />
                    <div className="w-8 h-8 border-t-4 border-r-4 border-[#00a699] absolute top-0 right-0 rounded-tr-lg" />
                    <div className="w-8 h-8 border-b-4 border-l-4 border-[#00a699] absolute bottom-0 left-0 rounded-bl-lg" />
                    <div className="w-8 h-8 border-b-4 border-r-4 border-[#00a699] absolute bottom-0 right-0 rounded-br-lg" />
                  </div>
                </motion.div>
              )}

              {/* 2. Image preview with scanning laser */}
              {imagePreview && !isCameraActive && (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img src={imagePreview} alt="Meal preview" className="w-full h-full object-cover" />
                  
                  {/* Laser scan line animation */}
                  {isScanning && (
                    <motion.div 
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00a699] to-transparent shadow-[0_0_15px_rgba(0,166,153,0.8)] z-10"
                    />
                  )}
                </motion.div>
              )}

              {/* 3. Static Welcome Screen (Standby) */}
              {!isCameraActive && !imagePreview && (
                <motion.div 
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center p-8 flex flex-col items-center"
                >
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                    <Camera className="h-10 w-10 text-[#00a699]" />
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 border-2 border-[#00a699] rounded-full"
                    />
                  </div>
                  <h3 className="text-white text-lg font-bold">Ready to Scan</h3>
                  <p className="text-slate-400 text-xs mt-2 max-w-xs leading-relaxed">
                    Open your camera and capture a picture of your dish. GymChief AI will instantly decompose the ingredients into accurate protein, fat, and carbohydrate estimations.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons under viewport */}
          <div className="w-full max-w-md mt-6 flex flex-col sm:flex-row gap-3">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />

            {isCameraActive ? (
              <>
                <button 
                  onClick={capturePhoto}
                  className="flex-1 py-4 bg-[#e65c5c] hover:bg-[#d54b4b] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#e65c5c]/10 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                >
                  <Camera className="h-5 w-5" />
                  Capture Photo
                </button>
                <button 
                  onClick={stopCamera}
                  className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={startCamera}
                  className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md text-xs uppercase tracking-wider"
                >
                  <Camera className="h-5 w-5 text-[#00a699]" />
                  Open Camera
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm text-xs uppercase tracking-wider"
                >
                  <Upload className="h-5 w-5 text-slate-500" />
                  Upload Photo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right column: AI Analysis Results */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-6 sm:p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00a699] to-transparent" />

            <AnimatePresence mode="wait">
              {/* 1. Scanning Loading State */}
              {isScanning && (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 flex flex-col items-center justify-center"
                >
                  <div className="relative mb-6">
                    <RefreshCw className="h-10 w-10 text-[#00a699] animate-spin" />
                    <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Decomposing Meal Macros...</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                    GymChief AI is detecting food items and running custom calorie & nutrient estimates.
                  </p>
                </motion.div>
              )}

              {/* 2. Scanning Error */}
              {error && !isScanning && !scanResult && (
                <motion.div 
                  key="scan-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <AlertCircle className="h-12 w-12 text-[#e65c5c] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900">Analysis Halted</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                    {error}
                  </p>
                  <button 
                    onClick={resetScanner}
                    className="mt-6 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider"
                  >
                    Try Another Photo
                  </button>
                </motion.div>
              )}

              {/* 3. Scan Results rendering */}
              {scanResult && !isScanning && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Dish Title & Confidence */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[#00a699]" /> Detected Meal
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">{scanResult.foodName}</h2>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-200 font-extrabold shrink-0">
                      {scanResult.confidence}% match
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-600 leading-relaxed flex gap-2">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <p>{scanResult.description}</p>
                  </div>

                  {/* Macro Dashboard */}
                  <div>
                    <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-3">Nutritional Profile</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {/* Calories */}
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Calories</p>
                        <p className="text-lg font-black text-slate-900 mt-1 flex justify-center items-center gap-0.5">
                          {scanResult.macros.calories}
                          <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        </p>
                      </div>

                      {/* Protein */}
                      <div className="p-3 bg-teal-50 border border-teal-100 rounded-2xl text-center shadow-sm">
                        <p className="text-[10px] font-bold text-teal-650 uppercase tracking-wider">Protein</p>
                        <p className="text-lg font-black text-teal-700 mt-1">{scanResult.macros.protein}g</p>
                      </div>

                      {/* Carbs */}
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Carbs</p>
                        <p className="text-lg font-black text-slate-900 mt-1">{scanResult.macros.carbs}g</p>
                      </div>

                      {/* Fat */}
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Fat</p>
                        <p className="text-lg font-black text-slate-900 mt-1">{scanResult.macros.fat}g</p>
                      </div>
                    </div>
                  </div>

                  {/* Healthier Alternatives */}
                  {scanResult.healthierAlternatives && scanResult.healthierAlternatives.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-slate-550" />
                        Healthier Alternatives
                      </h3>
                      <div className="space-y-2">
                        {scanResult.healthierAlternatives.map((alt, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                            <div>
                              <strong className="text-slate-800 font-bold block">{alt.name}</strong>
                              <span className="text-slate-500 mt-0.5 block">{alt.reason}</span>
                            </div>
                            <span className="text-[#00a699] font-black text-[10px] uppercase bg-slate-900 px-2.5 py-1 rounded-md shrink-0 ml-2">
                              Pro Tip
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logging Panel */}
                  <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 pl-2 pr-1 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> Period
                      </span>
                      <select 
                        value={mealType} 
                        onChange={(e) => setMealType(e.target.value)}
                        className="bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-[#00a699] transition-all"
                      >
                        <option value="breakfast" className="bg-white text-slate-900">Breakfast</option>
                        <option value="lunch" className="bg-white text-slate-900">Lunch</option>
                        <option value="dinner" className="bg-white text-slate-900">Dinner</option>
                        <option value="snack" className="bg-white text-slate-900">Snack</option>
                      </select>
                    </div>

                    <button
                      onClick={handleLogMeal}
                      disabled={isLogged}
                      className={`w-full sm:flex-1 py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-md ${
                        isLogged 
                          ? 'bg-emerald-600 text-white shadow-emerald-600/10' 
                          : 'bg-[#e65c5c] hover:bg-[#d54b4b] text-white shadow-[#e65c5c]/10'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <Check className="h-4 w-4" />
                          Meal Logged!
                        </>
                      ) : (
                        'Log to Nutrition Plan'
                      )}
                    </button>

                    <button 
                      onClick={resetScanner}
                      className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs uppercase tracking-wider text-center border border-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 4. Standby State (Default) */}
              {!scanResult && !isScanning && !error && (
                <motion.div 
                  key="standby"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-400">Awaiting Image</h3>
                  <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                    Once you snap or upload a meal photo, GymChief AI will display its macronutrients, calorie breakdown, and healthier alternatives here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
