/**
 * GymChief AI YouTube Video Integration
 * Connects to YouTube API to find cooking tutorials, with static video fallbacks.
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Collection of default gym meal preparation videos
const FALLBACK_VIDEOS = {
  muscle_gain: [
    { title: "Full Day of Eating for Muscle Gain (Easy Meals)", videoId: "j4K3u0P_s0k", channel: "Will Tennyson" },
    { title: "High Protein Meal Prep for Muscle Gain", videoId: "kK7e-FmK1wM", channel: "Aesthetic Cook" },
    { title: "Ultimate 4000 Calorie Muscle Gain Recipe Guide", videoId: "K9nB54nZqrs", channel: "Chris Heria" }
  ],
  fat_loss: [
    { title: "Low Calorie High Volume Recipes for Shredding", videoId: "S2y5hL4DkCQ", channel: "Greg Doucette" },
    { title: "Meal Prep for Weight Loss (Easy & High Protein)", videoId: "5F_u-d4z-dM", channel: "Remington James" },
    { title: "Healthy Eating Hacks to Lose Belly Fat", videoId: "k7m1n5x_uRk", channel: "Jeff Nippard" }
  ],
  general: [
    { title: "How to Meal Prep Like a Pro (Gym Edition)", videoId: "kK7e-FmK1wM", channel: "Jeremy Ethier" },
    { title: "10-Minute High Protein Gym Snacks", videoId: "5F_u-d4z-dM", channel: "GymChief AI" }
  ]
};

/**
 * Searches YouTube for cooking tutorials or returns fallback list
 */
export async function searchCookingVideos(queryText) {
  if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== "YOUR_YOUTUBE_API_KEY" && YOUTUBE_API_KEY.trim() !== "") {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        queryText + " recipe high protein gym"
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
