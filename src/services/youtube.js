/**
 * GymChef AI YouTube Video Integration
 * Connects to YouTube API to find cooking tutorials, with static video fallbacks.
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Collection of default Indian & Tamil gym meal preparation videos
const FALLBACK_VIDEOS = {
  muscle_gain: [
    { title: "Easy High Protein Full Day Meal Prep (Tamil - 157g Protein)", videoId: "7zQzU18Rz5g", channel: "Tharun Kumar" },
    { title: "Full Day of Eating for Healthy Muscle Weight Gain (Tamil)", videoId: "b4wS81w_T5U", channel: "Tharun Kumar" },
    { title: "My Bulking Diet: Full Day Of EATING (Tamil - 2300+ Calories)", videoId: "i9Yy6U0R36E", channel: "Tharun Kumar" }
  ],
  fat_loss: [
    { title: "Free Cutting Diet Plan - Full Day of Eating (Tamil - 1100 Calories)", videoId: "UqN9N2aV16c", channel: "Tharun Kumar" },
    { title: "12 Cheap and Best Protein Foods For Muscle Building & Fat Loss", videoId: "uC0W6iN5Sjs", channel: "Tharun Kumar" },
    { title: "How to Lose Belly Fat Fast (Scientific Tamil Diet)", videoId: "7zQzU18Rz5g", channel: "Tharun Kumar" }
  ],
  general: [
    { title: "How to Meal Prep Like a Pro (Tamil/Indian Edition)", videoId: "7zQzU18Rz5g", channel: "Tharun Kumar" },
    { title: "10-Minute High Protein Indian Gym Snacks & Foods", videoId: "uC0W6iN5Sjs", channel: "Tharun Kumar" }
  ]
};

/**
 * Searches YouTube for cooking tutorials or returns fallback list
 */
export async function searchCookingVideos(queryText) {
  if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== "YOUR_YOUTUBE_API_KEY" && YOUTUBE_API_KEY.trim() !== "") {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        queryText + " recipe healthy protein indian tamil gym"
      )}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error("YouTube API returned error status");
      
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items.map(item => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high.url
        }));
      }
    } catch (e) {
      console.error("YouTube Search failed, using static fallbacks:", e);
    }
  }

  // Fallback to static selection based on query matching
  const lowercaseQuery = queryText.toLowerCase();
  let category = "general";
  
  if (lowercaseQuery.includes("muscle") || lowercaseQuery.includes("gain") || lowercaseQuery.includes("surplus") || lowercaseQuery.includes("bulk")) {
    category = "muscle_gain";
  } else if (lowercaseQuery.includes("loss") || lowercaseQuery.includes("fat") || lowercaseQuery.includes("shred") || lowercaseQuery.includes("deficit")) {
    category = "fat_loss";
  }

  return FALLBACK_VIDEOS[category].map(v => ({
    ...v,
    thumbnail: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`
  }));
}
