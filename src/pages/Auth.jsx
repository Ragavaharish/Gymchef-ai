import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function Auth() {
  const { signup, login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isForgot) {
        await resetPassword(email);
        setMessage("Password reset link sent to your email!");
        setTimeout(() => setIsForgot(false), 3000);
      } else if (isLogin) {
        const user = await login(email, password);
        navigate("/");
      } else {
        const user = await signup(email, password, name);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic background circles */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-neon-lime/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-neon-red/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-slate-200 shadow-sm p-8 rounded-3xl border border-slate-200 shadow-2xl relative z-10"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-neon-lime/10 rounded-2xl border border-neon-lime/20 mb-3 glow-green">
            <Dumbbell className="h-8 w-8 text-neon-lime" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-1">
            <span>GymChief</span>
            <span className="text-neon-lime font-extrabold">AI</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 text-center">
            {isForgot 
              ? "Recover your nutrition account" 
              : isLogin 
                ? "Fuel your potential. Sign in to your dashboard." 
                : "Join the elite. Calculate macros & build muscle."}
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 mb-4 rounded-xl bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 mb-4 rounded-xl bg-neon-lime/10 border border-neon-lime/20 text-neon-lime text-xs"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && !isForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
              />
            </div>
          </div>

          {!isForgot && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs text-neon-lime hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-neon-lime rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neon-lime hover:bg-neon-lime/90 text-black font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 font-sans shadow-lg shadow-neon-lime/20 disabled:opacity-50"
          >
            <span>{loading ? "Processing..." : isForgot ? "Send Reset Email" : isLogin ? "Sign In" : "Create Account"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {!isForgot && (
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-[#121212] px-3 text-xs text-slate-500 uppercase tracking-wider">or</span>
          </div>
        )}

        {!isForgot && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 hover:border-slate-300 font-semibold rounded-xl flex items-center justify-center space-x-3 transition-all duration-300 disabled:opacity-50"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.24 1 3.2 3.73 1.24 7.7l3.87 3C6.03 7.82 8.79 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.01 3.67-8.64z"/>
              <path fill="#FBBC05" d="M5.11 14.7c-.24-.7-.37-1.46-.37-2.25s.13-1.55.37-2.25L1.24 7.2C.45 8.79 0 10.59 0 12.5s.45 3.71 1.24 5.3l3.87-3.1z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.5 1.18-4.2 1.18-3.21 0-5.97-2.78-6.89-5.66L1.24 15.7C3.2 19.67 7.24 23 12 23z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        <div className="mt-8 text-center">
          {isForgot ? (
            <button 
              onClick={() => setIsForgot(false)}
              className="text-sm text-neon-lime hover:underline"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              {isLogin ? (
                <span>Don't have an account? <strong className="text-neon-lime hover:underline">Sign up</strong></span>
              ) : (
                <span>Already have an account? <strong className="text-neon-lime hover:underline">Sign in</strong></span>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
