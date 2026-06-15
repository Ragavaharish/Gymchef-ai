/**
 * GymChef AI Nutrition Utility
 * Calculations for BMR, TDEE, and macros based on user stats.
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

export const ACTIVITY_LABELS = {
  sedentary: "Sedentary (Little/no exercise)",
  lightly_active: "Lightly Active (1-3 days/week)",
  moderately_active: "Moderately Active (3-5 days/week)",
  very_active: "Very Active (6-7 days/week)",
  extra_active: "Extra Active (Athletic/hard labor)"
};

export const GOAL_LABELS = {
  muscle_gain: "Muscle Gain (Caloric Surplus & High Protein)",
  fat_loss: "Fat Loss (Caloric Deficit & Protein Retention)",
  maintenance: "Maintenance (Balanced Diet)"
};

/**
 * Calculates BMR using Mifflin-St Jeor Equation
 */
export function calculateBMR(weightKg, heightCm, ageYears, gender) {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }
}

/**
 * Calculates TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return bmr * multiplier;
}

/**
 * Calculates BMI
 */
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Generates custom targets for calories and macros based on profile details
 */
export function calculateMacros(weightKg, heightCm, ageYears, gender, activityLevel, fitnessGoal) {
  const bmr = calculateBMR(weightKg, heightCm, ageYears, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const bmi = calculateBMI(weightKg, heightCm);

  let targetCalories = Math.round(tdee);
  let proteinPerKg = 1.8; // default maintenance

  if (fitnessGoal === "muscle_gain") {
    targetCalories = Math.round(tdee + 400); // 400 kcal surplus
    proteinPerKg = 2.2; // High protein
  } else if (fitnessGoal === "fat_loss") {
    targetCalories = Math.round(tdee - 500); // 500 kcal deficit
    proteinPerKg = 2.0; // High protein to preserve muscle
  }

  // Cap target calories to avoid dangerous lows
  if (targetCalories < 1200) targetCalories = 1200;

  // Calculate Protein (1g protein = 4 kcal)
  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Calculate Fat (25% of total calories, 1g fat = 9 kcal)
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Calculate Carbs (Remaining calories, 1g carb = 4 kcal)
  const remainingCalories = targetCalories - (proteinCalories + fatCalories);
  const carbGrams = Math.max(50, Math.round(remainingCalories / 4)); // Minimum 50g carbs

  // Re-adjust calories to match precise macro sum
  const exactCalories = (proteinGrams * 4) + (fatGrams * 9) + (carbGrams * 4);

  return {
    bmi,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: exactCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams
  };
}
