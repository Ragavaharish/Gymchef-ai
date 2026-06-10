import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Dumbbell, 
  LogOut, 
  MessageSquare, 
  ChefHat, 
  CupSoda, 
  Camera, 
  Calendar, 
  LayoutDashboard,
  Menu,
  X,
  User
} from "lucide-react";

export default function Layout({ children }) {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Coach", href: "/coach", icon: MessageSquare },
    { name: "Recipes", href: "/recipes", icon: ChefHat },
    { name: "Shake Builder", href: "/shake", icon: CupSoda },
    { name: "Food Scanner", href: "/scanner", icon: Camera },
    { name: "Weekly Planner", href: "/planner", icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  const getGoalBadgeColor = (goal) => {
    if (goal === "muscle_gain") return "bg-[#00a699]/20 text-[#00a699] border-[#00a699]/30";
    if (goal === "fat_loss") return "bg-[#e65c5c]/20 text-[#e65c5c] border-[#e65c5c]/30";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  const getGoalLabel = (goal) => {
    if (goal === "muscle_gain") return "💪 Muscle Gain";
    if (goal === "fat_loss") return "🔥 Fat Loss";
    return "⚡ Maintenance";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ─── Global Header (Dark Theme inspired by PureGym) ─── */}
      <header className="sticky top-0 z-40 bg-[#111111] border-b border-slate-800 py-4 px-4 sm:px-8 flex items-center justify-between shadow-md rounded-b-2xl md:rounded-b-3xl">
        
        {/* Left Side: Brand / Hamburger toggler */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-[#00a699] rounded-xl shadow-inner">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white flex items-center space-x-0.5">
              <span>GYMCHIEF</span>
              <span className="text-[#00a699]">AI</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links (only for logged in users) */}
        {currentUser && (
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    active 
                      ? "bg-slate-900 text-[#00a699] border border-slate-800 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {/* Authenticated State */}
              {userProfile && userProfile.onboarded && (
                <div className={`hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getGoalBadgeColor(userProfile.fitnessGoal)}`}>
                  {getGoalLabel(userProfile.fitnessGoal)}
                </div>
              )}
              
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white uppercase">{userProfile?.name || "Lifter"}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{userProfile?.weight ? `${userProfile.weight} kg` : ""}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-[#e65c5c]/10 text-slate-400 hover:text-[#e65c5c] border border-slate-800 hover:border-[#e65c5c]/30 transition-all duration-300 shadow-sm"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            /* Public Pre-Login State */
            <Link
              to="/auth"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a699] hover:bg-[#008c81] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#00a699]/15"
            >
              <User className="h-3.5 w-3.5" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </header>

      {/* ─── Mobile Navigation Drawer ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] z-30 bg-[#111111]/98 backdrop-blur-lg flex flex-col p-6 space-y-4 border-t border-slate-800">
          <nav className="flex flex-col space-y-2">
            {currentUser ? (
              navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                      active 
                        ? "bg-slate-900 text-[#00a699] border border-slate-800 shadow" 
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <User className="h-5 w-5" />
                <span>Log In / Sign Up</span>
              </Link>
            )}
          </nav>
          
          {currentUser && (
            <div className="mt-auto border-t border-slate-800 pt-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">{userProfile?.name || "Lifter"}</p>
                  <p className="text-[10px] text-slate-400">{userProfile?.email}</p>
                </div>
                {userProfile?.weight && (
                  <p className="text-sm font-black text-[#00a699]">{userProfile.weight} kg</p>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-[#e65c5c] hover:text-white hover:border-[#e65c5c] transition-all font-extrabold text-xs uppercase tracking-wider shadow"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 w-full mx-auto flex flex-col">
        {children}
      </main>

      {/* ─── Footer ─── */}
      <footer className="py-10 bg-[#111111] border-t border-slate-800 text-center text-xs text-slate-500">
        <p className="font-semibold tracking-wider">© 2026 GYMCHIEF AI. BUILT FOR ELITE PERFORMANCE & SMART NUTRITION.</p>
      </footer>
    </div>
  );
}

