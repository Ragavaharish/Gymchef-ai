import { GoogleGenerativeAI } from "@google/generative-ai";
import { RECIPES } from "../data/recipes";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
let isGeminiConfigured = false;

if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY" && apiKey.trim() !== "") {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    isGeminiConfigured = true;
    console.log("GymChief AI: Gemini API configured successfully");
  } catch (error) {
    console.error("GymChief AI: Failed to configure Gemini API:", error);
  }
} else {
  console.warn("GymChief AI: Gemini API key is missing. Using offline AI simulation engine.");
}

const COACH_SYSTEM_PROMPT = `
You are "GymChief AI", a premium, expert, and highly encouraging gym nutrition coach.
Your goal is to guide users to build muscle, lose fat, and maintain healthy lifestyles.
Keep answers concise, direct, and focused on high-protein nutrition, macros, and fitness habits.
Always respond in Markdown. If recommending a recipe, structure it clearly with:
- **Title**
- **Macros** (Calories, Protein, Carbs, Fat)
- **Ingredients** (with quantities)
- **Cooking Steps** (numbered list)
`;

// Helper to convert base64 image data to Gemini format
function base64ToGenerativePart(base64Str, mimeType) {
  return {
    inlineData: {
      data: base64Str.split(",")[1] || base64Str,
      mimeType: mimeType || "image/jpeg"
    },
  };
}

/**
 * Sends a message to the AI coach. Supports chat history.
 */
export async function askCoach(message, history = []) {
  if (isGeminiConfigured && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Format history for Gemini chat API
      const contents = [
        { role: "user", parts: [{ text: COACH_SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I am GymChief AI, your nutrition coach. How can I help you crush your fitness goals today?" }] }
      ];

      // Add actual chat history
      history.forEach(item => {
        contents.push({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        });
      });

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error("Gemini API error, falling back to mock response:", e);
      return getMockCoachResponse(message);
    }
  } else {
    // Return mock responses locally
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockCoachResponse(message));
      }, 1000);
    });
  }
}

/**
 * Scans a food image to analyze its nutrition.
 */
export async function scanFoodImage(base64Image, mimeType) {
  if (isGeminiConfigured && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analyze this food image. Provide a JSON response detailing:
        {
          "foodName": "Name of the detected dish",
          "macros": {
            "calories": 450,
            "protein": 30,
            "carbs": 45,
            "fat": 15
          },
          "confidence": 90,
          "description": "Short explanation of the dish and its nutritional profile.",
          "healthierAlternatives": [
            {
              "name": "Alternative dish name",
              "reason": "Why it is healthier or higher in protein"
            }
          ]
        }
        Return ONLY valid raw JSON. Do not include markdown code block formatting.
      `;
      const imagePart = base64ToGenerativePart(base64Image, mimeType);
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();
      
      // Strip markdown code block if generated
      const cleanText = text.replace(/^```json/, "").replace(/```$/, "").trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Gemini vision scan failed, returning mock scan:", e);
      return getMockScanResponse();
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockScanResponse());
      }, 1500);
    });
  }
}

/**
 * Generates a full weekly meal plan customized for a user's stats/goals.
 */
export async function generateWeeklyMealPlan(goal, calories, protein, dietaryPreference) {
  if (isGeminiConfigured && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Generate a full 7-day high-protein meal plan for a fitness enthusiast with:
        Goal: ${goal}
        Target Daily Calories: ${calories} kcal
        Target Daily Protein: ${protein}g
        Dietary Preference: ${dietaryPreference} (Veg/Non-Veg)

        Provide the meal plan as a JSON object of this structure:
        {
          "Monday": {
            "breakfast": { "name": "Meal name", "calories": 400, "protein": 30, "carbs": 40, "fat": 10, "ingredients": ["Item 1", "Item 2"] },
            "lunch": { "name": "Meal name", "calories": 500, "protein": 40, "carbs": 50, "fat": 12, "ingredients": ["Item 1", "Item 2"] },
            "dinner": { "name": "Meal name", "calories": 500, "protein": 45, "carbs": 45, "fat": 14, "ingredients": ["Item 1", "Item 2"] },
            "snack": { "name": "Meal name", "calories": 200, "protein": 20, "carbs": 15, "fat": 5, "ingredients": ["Item 1", "Item 2"] }
          },
          ... (and so on for all 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
        }

        Important: Ensure the sum of macros for each day roughly matches the targets (Calories: ${calories} kcal, Protein: ${protein}g).
        Suggest delicious, high-protein Indian fitness foods, meals, and snacks (like Masala Egg Bhurji, Paneer Stuffed Moong Dal Chilla, Chicken Tikka, Soya Chunks Masala, Dal Tadka, Chana Chaat, and Sprouts) using healthy prep methods (low ghee/oil).
        Return ONLY valid raw JSON. Do not include markdown formatting.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const cleanText = text.replace(/^```json/, "").replace(/```$/, "").trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Gemini plan generator failed, using mock plan generator:", e);
      return getMockWeeklyPlan(goal, calories, protein, dietaryPreference);
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockWeeklyPlan(goal, calories, protein, dietaryPreference));
      }, 1500);
    });
  }
}

/* ========================================================
   MOCK ENGINE & FALLBACK DATA FOR OFFLINE DEVELOPMENT
   ======================================================== */

function getMockCoachResponse(message) {
  const m = message.toLowerCase();
  
  if (m.includes("breakfast") || m.includes("morning")) {
    return `### 🍳 Quick High-Protein Breakfast Recommendation

Here is an excellent recipe to start your day strong, fuel muscle protein synthesis, and stay full.

#### **Anabolic Blueberry Oats**
* **Calories**: 430 kcal | **Protein**: 35g | **Carbs**: 52g | **Fat**: 8g
* **Timing**: Post-wakeup / pre-workout fuel.

**Ingredients:**
- 60g Rolled Oats
- 1 scoop (30g) Whey Protein (Vanilla)
- 1/2 cup Blueberries
- 1 cup Unsweetened Almond Milk
- 1 tbsp Chia Seeds

**Instructions:**
1. Cook oats in almond milk over medium heat for 5 minutes, stirring occasionally.
2. Remove from heat and allow to sit for 1 minute.
3. Stir in the whey protein powder vigorously until smooth.
4. Top with fresh blueberries and chia seeds.

*Coach Tip: Never boil your protein powder directly on the heat as it clumps! Always stir it in after removing the oats from the heat source.*`;
  }
  
  if (m.includes("recipe") || m.includes("cook") || m.includes("give recipe")) {
    const randomRecipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    return `### 🍽️ Recipe: ${randomRecipe.title}

Here is a highly requested recipe from our database matching your inquiry.

* **Calories**: ${randomRecipe.calories} kcal | **Protein**: ${randomRecipe.protein}g | **Carbs**: ${randomRecipe.carbs}g | **Fat**: ${randomRecipe.fat}g
* **Prep Time**: ${randomRecipe.time} minutes

**Ingredients:**
${randomRecipe.ingredients.map(i => `- ${i}`).join("\n")}

**Steps:**
${randomRecipe.steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

*Need video guidance? You can view the full video tutorial on the Recipes page.*`;
  }

  if (m.includes("cheap") || m.includes("budget")) {
    return `### 💰 Budget High-Protein Hacks

Building muscle doesn't have to break the bank. Here are the top 5 cheapest high-protein sources and how to use them:

1. **Whole Eggs & Liquid Egg Whites**: High bio-availability, affordable in bulk.
2. **Canned Tuna**: Around 30g protein per can. Easy to store.
3. **Cottage Cheese / Greek Yogurt**: High casein protein content (excellent pre-bed snack).
4. **Frozen Chicken Breasts**: Buy in bulk packs; significantly cheaper than fresh cuts.
5. **Lentils & Chickpeas**: Super cheap, high fiber, and great secondary protein.

*Try making a **Tuna Egg Salad scrambler** for dinner. It yields 45g of protein and costs under $2.50 to prepare.*`;
  }

  if (m.includes("fat loss") || m.includes("diet") || m.includes("lose")) {
    return `### 🔥 Fat Loss Nutrition Strategy

To lose body fat while retaining hard-earned muscle tissue:
1. **Caloric Deficit**: Aim for 300-500 kcal below your Maintenance (TDEE).
2. **Keep Protein High**: Maintain 2.0g - 2.2g of protein per kg of body weight to trigger satiety and protect muscle.
3. **High Volume Foods**: Fill your plates with leafy greens, broccoli, and cabbage. These have low caloric density and high fiber.
4. **Water Intake**: Drink 3-4 liters daily. Often, hunger is just mild dehydration.

*Try loading up on **Citrus Baked Salmon** or a **Greek Yogurt Berry Bowl** to satisfy sweet cravings while packing 30g+ of protein.*`;
  }

  return `### 💪 GymChief AI Coach Active

Hey! I'm your AI Nutrition Assistant. I can help you with:
- **High-protein recipes** based on ingredients you have.
- **Gym macros planning** for muscle gain or fat loss.
- **Cheap & budget-friendly meal ideas**.
- **Interactive voice coaching** when cooking.

What are we training today, and what's your current meal plan looking like? (Try asking: *"Give me a cheap high-protein breakfast recipe"* or *"How do I structure my post-workout meal?"*)`;
}

function getMockScanResponse() {
  return {
    foodName: "Grilled Chicken Breast with Jasmine Rice & Broccoli",
    macros: {
      calories: 580,
      protein: 45,
      carbs: 55,
      fat: 10
    },
    confidence: 94,
    description: "A standard gym meal prep favorite. Excellent lean source of protein (chicken breast) paired with fast-digesting carbohydrates (jasmine rice) and micronutrients/fiber (broccoli). Perfect for muscle recovery.",
    healthierAlternatives: [
      {
        name: "Quinoa Chicken Bowl",
        reason: "Swapping jasmine rice for quinoa increases dietary fiber, adds essential amino acids, and reduces the glycemic index of the meal."
      },
      {
        name: "Cauliflower Rice Chicken Stir Fry",
        reason: "Ideal for fat loss. Replaces rice with cauliflower rice, slashing calories from 580 to roughly 310 while preserving the 45g protein content."
      }
    ]
  };
}

function getMockWeeklyPlan(goal, calories, protein, dietaryPreference = "any") {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const plan = {};
  
  // Set up mock items with a delicious Indian fitness twist based on user preference
  const isVeg = dietaryPreference === "veg";
  const isNonVeg = dietaryPreference === "non-veg";

  const mealPool = {
    breakfast: isVeg ? [
      { name: "Paneer Stuffed Moong Dal Chilla", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 40, fat: 10, ingredients: ["Moong dal batter", "Low-fat paneer", "Carrot", "Green chilies", "Mint chutney"] },
      { name: "High-Protein Besan Chilla with Tofu", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 42, fat: 8, ingredients: ["Besan flour", "Crumble tofu", "Onion", "Spinach", "Spices"] }
    ] : isNonVeg ? [
      { name: "High-Protein Masala Egg Bhurji with Roti", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 35, fat: 12, ingredients: ["Whole eggs", "Egg whites", "Onion & Tomato", "Spices", "Whole wheat roti"] },
      { name: "Double-Egg Masala Omelette with Toast", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 30, fat: 14, ingredients: ["Eggs", "Egg whites", "Bell peppers", "Spices", "Artisanal toast"] }
    ] : [ // any / both
      { name: "High-Protein Masala Egg Bhurji with Roti", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 35, fat: 12, ingredients: ["Whole eggs", "Egg whites", "Onion & Tomato", "Spices", "Whole wheat roti"] },
      { name: "Paneer Stuffed Moong Dal Chilla", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 40, fat: 10, ingredients: ["Moong dal batter", "Low-fat paneer", "Carrot", "Green chilies", "Mint chutney"] }
    ],
    lunch: isVeg ? [
      { name: "High-Protein Soya Chunks Masala & Roti", calories: Math.round(calories * 0.30), protein: Math.round(protein * 0.35), carbs: 45, fat: 8, ingredients: ["Soya chunks", "Onion-tomato gravy", "Whole wheat roti", "Sprouts salad"] },
      { name: "Dal Makhani (Low Fat) with Quinoa", calories: Math.round(calories * 0.30), protein: Math.round(protein * 0.35), carbs: 50, fat: 8, ingredients: ["Black lentils", "Kidney beans", "Low-fat cream", "Quinoa", "Cucumber salad"] }
    ] : isNonVeg ? [
      { name: "Tandoori Chicken Tikka with Brown Rice", calories: Math.round(calories * 0.30), protein: Math.round(protein * 0.35), carbs: 50, fat: 10, ingredients: ["Marinated chicken breast", "Brown rice", "Cucumber salad", "Mint dip"] },
      { name: "Indian Spiced Chicken Keema Bowl", calories: Math.round(calories * 0.30), protein: Math.round(protein * 0.35), carbs: 48, fat: 12, ingredients: ["Lean ground chicken", "Indian spices", "Basmati rice", "Steamed broccoli"] }
    ] : [ // any / both
      { name: "Tandoori Chicken Tikka with Brown Rice", calories: Math.round(calories * 0.30), protein: Math.round(protein * 0.35), carbs: 50, fat: 10, ingredients: ["Marinated chicken breast", "Brown rice", "Cucumber salad", "Mint dip"] },
      { name: "High-Protein Soya Chunks Masala & Roti", calories: Math.round(calories * 0.30), protein: Math.round(protein * 0.35), carbs: 45, fat: 8, ingredients: ["Soya chunks", "Onion-tomato gravy", "Whole wheat roti", "Sprouts salad"] }
    ],
    dinner: isVeg ? [
      { name: "Grilled Paneer Tikka Salad with Yellow Dal", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 25, fat: 14, ingredients: ["Paneer cubes", "Bell peppers", "Yellow moong dal", "Green salad"] },
      { name: "Soya Keema Matar with Whole Wheat Roti", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 32, fat: 10, ingredients: ["Minced soya granules", "Green peas", "Whole wheat roti", "Tomato salad"] }
    ] : isNonVeg ? [
      { name: "Indian Spiced Baked Fish with Quinoa", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 30, fat: 10, ingredients: ["Cod or Rohu fish fillet", "Tandoori rub", "Quinoa", "Steamed beans"] },
      { name: "Tandoori Grilled Salmon with Salad", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 12, fat: 18, ingredients: ["Salmon fillet", "Indian spices", "Mixed greens", "Lemon slice"] }
    ] : [ // any / both
      { name: "Grilled Paneer Tikka Salad with Yellow Dal", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 25, fat: 14, ingredients: ["Paneer cubes", "Bell peppers", "Yellow moong dal", "Green salad"] },
      { name: "Indian Spiced Baked Fish with Quinoa", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25), carbs: 30, fat: 10, ingredients: ["Cod or Rohu fish fillet", "Tandoori rub", "Quinoa", "Steamed beans"] }
    ],
    snack: isVeg ? [
      { name: "Roasted Masala Chickpeas & Chaat", calories: Math.round(calories * 0.20), protein: Math.round(protein * 0.15), carbs: 25, fat: 4, ingredients: ["Boiled chickpeas", "Cucumber & Onion", "Chaat masala", "Lemon juice"] },
      { name: "Mango Almond Protein Shake", calories: Math.round(calories * 0.20), protein: Math.round(protein * 0.15), carbs: 20, fat: 6, ingredients: ["Whey protein", "Almond milk", "Mango pulp", "Soaked almonds"] }
    ] : isNonVeg ? [
      { name: "Boiled Eggs with Chaat Masala", calories: Math.round(calories * 0.20), protein: Math.round(protein * 0.15), carbs: 8, fat: 12, ingredients: ["Hard-boiled eggs", "Chaat masala", "Black pepper", "Salt"] },
      { name: "Mango Almond Protein Shake", calories: Math.round(calories * 0.20), protein: Math.round(protein * 0.15), carbs: 20, fat: 6, ingredients: ["Whey protein", "Almond milk", "Mango pulp", "Soaked almonds"] }
    ] : [ // any / both
      { name: "Roasted Masala Chickpeas & Chaat", calories: Math.round(calories * 0.20), protein: Math.round(protein * 0.15), carbs: 25, fat: 4, ingredients: ["Boiled chickpeas", "Cucumber & Onion", "Chaat masala", "Lemon juice"] },
      { name: "Mango Almond Protein Shake", calories: Math.round(calories * 0.20), protein: Math.round(protein * 0.15), carbs: 20, fat: 6, ingredients: ["Whey protein", "Almond milk", "Mango pulp", "Soaked almonds"] }
    ]
  };

  days.forEach((day, index) => {
    plan[day] = {
      breakfast: mealPool.breakfast[index % 2],
      lunch: mealPool.lunch[index % 2],
      dinner: mealPool.dinner[index % 2],
      snack: mealPool.snack[index % 2]
    };
  });

  return plan;
}
