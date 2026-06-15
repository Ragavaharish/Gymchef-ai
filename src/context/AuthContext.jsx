import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "../services/firebase";
import { calculateMacros } from "../utils/nutrition";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const withTimeout = (promise, timeoutMs = 4000, errorMsg = "Database connection timed out.") => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), timeoutMs))
  ]);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state on mount
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          // Fetch user profile from Firestore with timeout to prevent loading hang
          try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await withTimeout(
              getDoc(userDocRef),
              4000,
              "Firestore connection timed out. Please check if Firestore is created in your Firebase Console."
            );
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              setUserProfile(null);
            }
          } catch (e) {
            console.error("Error fetching user profile:", e);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // LocalStorage guest-mode auth fallback
      const storedUser = localStorage.getItem("gymchef_user");
      const storedProfile = localStorage.getItem("gymchef_profile");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
      setLoading(false);
    }
  }, []);

  // Email Signup
  const signup = async (email, password, name) => {
    if (isFirebaseConfigured) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // Create template user profile in firestore
      const profile = {
        uid: res.user.uid,
        name: name,
        email: email,
        onboarded: false,
        createdAt: new Date().toISOString()
      };
      await withTimeout(
        setDoc(doc(db, "users", res.user.uid), profile),
        4000,
        "Failed to create user profile in Firestore. Database connection timed out."
      );
      setUserProfile(profile);
      return res.user;
    } else {
      // Offline fallback
      const users = JSON.parse(localStorage.getItem("gymchef_registered_users") || "[]");
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered!");
      }
      const newUser = { uid: "guest_uid_" + Date.now(), email, password, displayName: name };
      const profile = {
        uid: newUser.uid,
        name: name,
        email: email,
        onboarded: false,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem("gymchef_registered_users", JSON.stringify(users));
      localStorage.setItem(`gymchef_profile_${newUser.uid}`, JSON.stringify(profile));
      localStorage.setItem("gymchef_user", JSON.stringify(newUser));
      localStorage.setItem("gymchef_profile", JSON.stringify(profile));
      setCurrentUser(newUser);
      setUserProfile(profile);
      return newUser;
    }
  };

  // Email Login
  const login = async (email, password) => {
    if (isFirebaseConfigured) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await withTimeout(
        getDoc(doc(db, "users", res.user.uid)),
        4000,
        "Failed to load user profile. Database connection timed out."
      );
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
      return res.user;
    } else {
      // Offline fallback
      const users = JSON.parse(localStorage.getItem("gymchef_registered_users") || "[]");
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        if (foundUser.password && foundUser.password !== password) {
          throw new Error("Invalid password!");
        }
        let profile = localStorage.getItem(`gymchef_profile_${foundUser.uid}`);
        if (profile) {
          profile = JSON.parse(profile);
        } else {
          profile = {
            uid: foundUser.uid,
            name: foundUser.displayName,
            email: email,
            onboarded: false,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(`gymchef_profile_${foundUser.uid}`, JSON.stringify(profile));
        }
        localStorage.setItem("gymchef_user", JSON.stringify(foundUser));
        localStorage.setItem("gymchef_profile", JSON.stringify(profile));
        setCurrentUser(foundUser);
        setUserProfile(profile);
        return foundUser;
      }
      // If no user found, auto-create a mock account for smooth development testing
      const newUser = { uid: "guest_uid_" + Date.now(), email, password, displayName: email.split("@")[0] };
      const profile = {
        uid: newUser.uid,
        name: newUser.displayName,
        email: email,
        onboarded: false,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem("gymchef_registered_users", JSON.stringify(users));
      localStorage.setItem(`gymchef_profile_${newUser.uid}`, JSON.stringify(profile));
      localStorage.setItem("gymchef_user", JSON.stringify(newUser));
      localStorage.setItem("gymchef_profile", JSON.stringify(profile));
      setCurrentUser(newUser);
      setUserProfile(profile);
      return newUser;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured) {
      const res = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", res.user.uid);
      const userDoc = await withTimeout(
        getDoc(userDocRef),
        4000,
        "Failed to load user profile. Database connection timed out."
      );
      if (!userDoc.exists()) {
        const profile = {
          uid: res.user.uid,
          name: res.user.displayName || "Gym Member",
          email: res.user.email,
          onboarded: false,
          createdAt: new Date().toISOString()
        };
        await withTimeout(
          setDoc(userDocRef, profile),
          4000,
          "Failed to save Google user profile in Firestore. Database connection timed out."
        );
        setUserProfile(profile);
      } else {
        setUserProfile(userDoc.data());
      }
      return res.user;
    } else {
      // Offline fallback Google Login
      const googleUser = { uid: "google_uid_123", email: "google.gymchef@gmail.com", displayName: "Elite Lifter" };
      const users = JSON.parse(localStorage.getItem("gymchef_registered_users") || "[]");
      if (!users.find(u => u.uid === googleUser.uid)) {
        users.push(googleUser);
        localStorage.setItem("gymchef_registered_users", JSON.stringify(users));
      }
      let profile = localStorage.getItem(`gymchef_profile_${googleUser.uid}`);
      if (profile) {
        profile = JSON.parse(profile);
      } else {
        profile = {
          uid: googleUser.uid,
          name: googleUser.displayName,
          email: googleUser.email,
          onboarded: true,
          age: 26,
          weight: 78,
          height: 178,
          gender: "male",
          activityLevel: "moderately_active",
          fitnessGoal: "muscle_gain",
          dietaryPreference: "non-veg",
          macros: calculateMacros(78, 178, 26, "male", "moderately_active", "muscle_gain"),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`gymchef_profile_${googleUser.uid}`, JSON.stringify(profile));
      }
      localStorage.setItem("gymchef_user", JSON.stringify(googleUser));
      localStorage.setItem("gymchef_profile", JSON.stringify(profile));
      setCurrentUser(googleUser);
      setUserProfile(profile);
      return googleUser;
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`[Offline mode] Reset password email request simulation for: ${email}`);
    }
  };

  // Sign out
  const logout = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth);
    } else {
      localStorage.removeItem("gymchef_user");
      localStorage.removeItem("gymchef_profile");
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Complete onboarding and calculate macros
  const onboardUser = async (onboardingData) => {
    const { name, age, weight, height, gender, fitnessGoal, activityLevel, dietaryPreference } = onboardingData;
    
    // Perform calorie & macro calculations
    const macros = calculateMacros(
      Number(weight), 
      Number(height), 
      Number(age), 
      gender, 
      activityLevel, 
      fitnessGoal
    );

    const updatedProfile = {
      ...userProfile,
      name,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      gender,
      fitnessGoal,
      activityLevel,
      dietaryPreference,
      macros,
      onboarded: true,
      onboardedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && currentUser) {
      await withTimeout(
        setDoc(doc(db, "users", currentUser.uid), updatedProfile, { merge: true }),
        4000,
        "Failed to save onboarding targets to Firestore. Database connection timed out."
      );
    } else {
      localStorage.setItem("gymchef_profile", JSON.stringify(updatedProfile));
      if (currentUser) {
        localStorage.setItem(`gymchef_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
      }
    }
    
    setUserProfile(updatedProfile);
    return updatedProfile;
  };

  // Standard profile updates (weight, goal adjustments, etc.)
  const updateProfileData = async (data) => {
    const newProfile = { ...userProfile, ...data };
    
    // Re-calculate macros based on new parameters if physical stats change
    if (data.weight || data.height || data.age || data.gender || data.fitnessGoal || data.activityLevel) {
      const macros = calculateMacros(
        Number(newProfile.weight),
        Number(newProfile.height),
        Number(newProfile.age),
        newProfile.gender,
        newProfile.activityLevel,
        newProfile.fitnessGoal
      );
      newProfile.macros = macros;
    }

    if (isFirebaseConfigured && currentUser) {
      await withTimeout(
        setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true }),
        4000,
        "Failed to update profile statistics in Firestore. Database connection timed out."
      );
    } else {
      localStorage.setItem("gymchef_profile", JSON.stringify(newProfile));
      if (currentUser) {
        localStorage.setItem(`gymchef_profile_${currentUser.uid}`, JSON.stringify(newProfile));
      }
    }

    setUserProfile(newProfile);
    return newProfile;
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
    onboardUser,
    updateProfileData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
