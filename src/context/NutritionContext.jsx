import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  setDoc,
  orderBy
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../services/firebase";
import { useAuth } from "./AuthContext";

const NutritionContext = createContext();

export function useNutrition() {
  return useContext(NutritionContext);
}

export function NutritionProvider({ children }) {
  const { currentUser } = useAuth();
  const [dailyLogs, setDailyLogs] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] });
  const [favorites, setFavorites] = useState([]);
  const [customShakes, setCustomShakes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [scansHistory, setScansHistory] = useState([]);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  const getTodayStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Fetch all user records
  useEffect(() => {
    if (!currentUser) {
      setDailyLogs({ calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] });
      setFavorites([]);
      setCustomShakes([]);
      setMealPlans([]);
      setScansHistory([]);
      return;
    }

    const loadUserData = async () => {
      setLoadingNutrition(true);
      const uid = currentUser.uid;
      const todayStr = getTodayStr();

      if (isFirebaseConfigured) {
        try {
          // 1. Fetch Daily Logs for today
          const logsQuery = query(
            collection(db, "dailyLogs"), 
            where("userId", "==", uid), 
            where("date", "==", todayStr)
          );
          const logsSnap = await getDocs(logsQuery);
          if (!logsSnap.empty) {
            // Find the most recent document for today
            const logDoc = logsSnap.docs[0];
            setDailyLogs({ id: logDoc.id, ...logDoc.data() });
          } else {
            setDailyLogs({ calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] });
          }

          // 2. Fetch Favorites
          const favQuery = query(collection(db, "favorites"), where("userId", "==", uid));
          const favSnap = await getDocs(favQuery);
          setFavorites(favSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 3. Fetch Shakes
          const shakesQuery = query(collection(db, "shakes"), where("userId", "==", uid));
          const shakesSnap = await getDocs(shakesQuery);
          setCustomShakes(shakesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 4. Fetch Meal Plans
          const plansQuery = query(collection(db, "mealPlans"), where("userId", "==", uid));
          const plansSnap = await getDocs(plansQuery);
          setMealPlans(plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 5. Fetch Scans
          const scansQuery = query(collection(db, "scans"), where("userId", "==", uid));
          const scansSnap = await getDocs(scansQuery);
          setScansHistory(scansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (e) {
          console.error("Error loading nutrition data:", e);
        }
      } else {
        // Offline / LocalStorage fetch
        const storageLogs = localStorage.getItem(`gymchef_logs_${uid}_${todayStr}`);
        if (storageLogs) {
          setDailyLogs(JSON.parse(storageLogs));
        } else {
          setDailyLogs({ calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] });
        }

        const storageFavs = localStorage.getItem(`gymchef_favs_${uid}`);
        setFavorites(storageFavs ? JSON.parse(storageFavs) : []);

        const storageShakes = localStorage.getItem(`gymchef_shakes_${uid}`);
        setCustomShakes(storageShakes ? JSON.parse(storageShakes) : []);

        const storagePlans = localStorage.getItem(`gymchef_plans_${uid}`);
        setMealPlans(storagePlans ? JSON.parse(storagePlans) : []);

        const storageScans = localStorage.getItem(`gymchef_scans_${uid}`);
        setScansHistory(storageScans ? JSON.parse(storageScans) : []);
      }
      setLoadingNutrition(false);
    };

    loadUserData();
  }, [currentUser]);

  // Log a consumed meal / update today's macros
  const logMeal = async (mealName, macros, type = "other") => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const todayStr = getTodayStr();

    const newMeal = {
      id: "meal_" + Date.now(),
      name: mealName,
      calories: Number(macros.calories || 0),
      protein: Number(macros.protein || 0),
      carbs: Number(macros.carbs || 0),
      fat: Number(macros.fat || 0),
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedLogs = {
      userId: uid,
      date: todayStr,
      calories: dailyLogs.calories + newMeal.calories,
      protein: dailyLogs.protein + newMeal.protein,
      carbs: dailyLogs.carbs + newMeal.carbs,
      fat: dailyLogs.fat + newMeal.fat,
      meals: [...dailyLogs.meals, newMeal]
    };

    if (isFirebaseConfigured) {
      try {
        if (dailyLogs.id) {
          const docRef = doc(db, "dailyLogs", dailyLogs.id);
          await setDoc(docRef, updatedLogs, { merge: true });
          setDailyLogs({ id: dailyLogs.id, ...updatedLogs });
        } else {
          const docRef = await addDoc(collection(db, "dailyLogs"), updatedLogs);
          setDailyLogs({ id: docRef.id, ...updatedLogs });
        }
      } catch (e) {
        console.error("Error logging meal online:", e);
      }
    } else {
      localStorage.setItem(`gymchef_logs_${uid}_${todayStr}`, JSON.stringify(updatedLogs));
      setDailyLogs(updatedLogs);
    }
  };

  // Remove a logged meal
  const deleteLoggedMeal = async (mealId) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const todayStr = getTodayStr();

    const targetMeal = dailyLogs.meals.find(m => m.id === mealId);
    if (!targetMeal) return;

    const remainingMeals = dailyLogs.meals.filter(m => m.id !== mealId);
    const updatedLogs = {
      ...dailyLogs,
      calories: Math.max(0, dailyLogs.calories - targetMeal.calories),
      protein: Math.max(0, dailyLogs.protein - targetMeal.protein),
      carbs: Math.max(0, dailyLogs.carbs - targetMeal.carbs),
      fat: Math.max(0, dailyLogs.fat - targetMeal.fat),
      meals: remainingMeals
    };

    if (isFirebaseConfigured && dailyLogs.id) {
      try {
        await setDoc(doc(db, "dailyLogs", dailyLogs.id), updatedLogs);
        setDailyLogs(updatedLogs);
      } catch (e) {
        console.error("Error updating log after deletion:", e);
      }
    } else {
      localStorage.setItem(`gymchef_logs_${uid}_${todayStr}`, JSON.stringify(updatedLogs));
      setDailyLogs(updatedLogs);
    }
  };

  // Toggle saving a recipe to favorites
  const toggleFavorite = async (recipe) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const isFav = favorites.find(f => f.recipeId === recipe.id);

    if (isFav) {
      // Remove
      if (isFirebaseConfigured) {
        try {
          await deleteDoc(doc(db, "favorites", isFav.id));
          setFavorites(favorites.filter(f => f.id !== isFav.id));
        } catch (e) {
          console.error("Error removing favorite:", e);
        }
      } else {
        const updated = favorites.filter(f => f.recipeId !== recipe.id);
        localStorage.setItem(`gymchef_favs_${uid}`, JSON.stringify(updated));
        setFavorites(updated);
      }
    } else {
      // Add
      const newFav = {
        userId: uid,
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        protein: recipe.protein,
        calories: recipe.calories,
        carbs: recipe.carbs,
        fat: recipe.fat,
        createdAt: new Date().toISOString()
      };

      if (isFirebaseConfigured) {
        try {
          const docRef = await addDoc(collection(db, "favorites"), newFav);
          setFavorites([...favorites, { id: docRef.id, ...newFav }]);
        } catch (e) {
          console.error("Error adding favorite:", e);
        }
      } else {
        const updated = [...favorites, { id: "fav_" + Date.now(), ...newFav }];
        localStorage.setItem(`gymchef_favs_${uid}`, JSON.stringify(updated));
        setFavorites(updated);
      }
    }
  };

  // Save a custom protein shake
  const saveShake = async (shakeName, ingredients, macros) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const newShake = {
      userId: uid,
      name: shakeName,
      ingredients,
      macros,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, "shakes"), newShake);
        setCustomShakes([...customShakes, { id: docRef.id, ...newShake }]);
      } catch (e) {
        console.error("Error saving shake:", e);
      }
    } else {
      const updated = [...customShakes, { id: "shake_" + Date.now(), ...newShake }];
      localStorage.setItem(`gymchef_shakes_${uid}`, JSON.stringify(updated));
      setCustomShakes(updated);
    }
  };

  // Delete a saved shake
  const deleteShake = async (shakeId) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "shakes", shakeId));
        setCustomShakes(customShakes.filter(s => s.id !== shakeId));
      } catch (e) {
        console.error("Error deleting shake:", e);
      }
    } else {
      const updated = customShakes.filter(s => s.id !== shakeId);
      localStorage.setItem(`gymchef_shakes_${uid}`, JSON.stringify(updated));
      setCustomShakes(updated);
    }
  };

  // Save weekly meal plan
  const saveMealPlan = async (name, planData) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const newPlan = {
      userId: uid,
      name,
      plan: planData,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, "mealPlans"), newPlan);
        setMealPlans([...mealPlans, { id: docRef.id, ...newPlan }]);
      } catch (e) {
        console.error("Error saving meal plan:", e);
      }
    } else {
      const updated = [...mealPlans, { id: "plan_" + Date.now(), ...newPlan }];
      localStorage.setItem(`gymchef_plans_${uid}`, JSON.stringify(updated));
      setMealPlans(updated);
    }
  };

  // Delete saved meal plan
  const deleteMealPlan = async (planId) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "mealPlans", planId));
        setMealPlans(mealPlans.filter(p => p.id !== planId));
      } catch (e) {
        console.error("Error deleting meal plan:", e);
      }
    } else {
      const updated = mealPlans.filter(p => p.id !== planId);
      localStorage.setItem(`gymchef_plans_${uid}`, JSON.stringify(updated));
      setMealPlans(updated);
    }
  };

  // Save food scan estimate
  const saveFoodScan = async (scannedName, imageUrl, macros, healthierAlternatives) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const newScan = {
      userId: uid,
      name: scannedName,
      imageUrl,
      macros,
      alternatives: healthierAlternatives,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, "scans"), newScan);
        setScansHistory([...scansHistory, { id: docRef.id, ...newScan }]);
      } catch (e) {
        console.error("Error saving food scan:", e);
      }
    } else {
      const updated = [...scansHistory, { id: "scan_" + Date.now(), ...newScan }];
      localStorage.setItem(`gymchef_scans_${uid}`, JSON.stringify(updated));
      setScansHistory(updated);
    }
  };

  return (
    <NutritionContext.Provider value={{
      dailyLogs,
      favorites,
      customShakes,
      mealPlans,
      scansHistory,
      loadingNutrition,
      logMeal,
      deleteLoggedMeal,
      toggleFavorite,
      saveShake,
      deleteShake,
      saveMealPlan,
      deleteMealPlan,
      saveFoodScan
    }}>
      {children}
    </NutritionContext.Provider>
  );
}
