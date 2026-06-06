import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Dumbbell, 
  User, 
  LogOut, 
  MessageSquare, 
  ChefHat, 
  CupSoda, 
  Camera, 
  Calendar, 
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";

export default function Layout({ children }) {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return <div className="min-h-screen bg-slate-50">{children}</div>;

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
    if (goal === "muscle_gain") return "bg-neon-lime/10 text-slate-900 border-neon-lime/30";
    if (goal === "fat_loss") return "bg-slate-900 text-white border-slate-800";
    return "bg-slate-200 text-slate-800 border-slate-300";
  };

  const getGoalLabel = (goal) => {
    if (goal === "muscle_gain") return "💪 Muscle Gain";
    if (goal === "fat_loss") return "🔥 Fat Loss";
    return "⚡ Maintenance";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
            <Dumbbell className="h-6 w-6 text-neon-lime" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-1">
            <span>GymMeal</span>
            <span className="text-slate-400 font-extrabold">Planner</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  active 
                    ? "bg-slate-100 text-slate-900 border border-slate-200 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile / Stats */}
        <div className="hidden lg:flex items-center space-x-4">
          {userProfile && userProfile.onboarded && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getGoalBadgeColor(userProfile.fitnessGoal)}`}>
              {getGoalLabel(userProfile.fitnessGoal)}
            </div>
          )}
          
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900">{userProfile?.name || "Lifter"}</span>
              <span className="text-xs text-slate-500">{userProfile?.weight ? `${userProfile.weight} kg` : ""}</span>
            </div>
            <button 
              onClick={logout} 
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-500 hover:text-white border border-slate-200 hover:border-slate-800 transition-all duration-300 shadow-sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center space-x-3">
          {userProfile && userProfile.onboarded && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getGoalBadgeColor(userProfile.fitnessGoal)}`}>
              {userProfile.fitnessGoal === "muscle_gain" ? "Gain" : userProfile.fitnessGoal === "fat_loss" ? "Loss" : "Maint"}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-900"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] z-30 bg-white/95 backdrop-blur-lg flex flex-col p-6 space-y-4 border-t border-slate-200">
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    active 
                      ? "bg-slate-900 text-neon-lime border border-slate-800 shadow-md" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto border-t border-slate-200 pt-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-900 font-bold">{userProfile?.name || "Lifter"}</p>
                <p className="text-xs text-slate-500">{userProfile?.email}</p>
              </div>
              {userProfile?.weight && (
                <p className="text-sm font-bold text-slate-900">{userProfile.weight} kg</p>
              )}
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-bold shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800 text-center text-sm text-slate-400">
        <p>© 2026 Gym Meal Planner. Built for elite performance & smart nutrition.</p>
      </footer>
    </div>
  );
}
