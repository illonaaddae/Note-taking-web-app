/**
 * Seed Data Script
 * Run this in the browser console to populate Appwrite with sample data
 *
 * Usage:
 * 1. Open the app in browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Paste and run: await seedData()
 */

const sampleNotes = [
  {
    title: "React Performance Optimization",
    tags: ["Dev", "React"],
    content:
      "Key performance optimization techniques:\n\n1. Code Splitting\n- Use React.lazy() for route-based splitting\n- Implement dynamic imports for heavy components\n\n2. Memoization\n- useMemo for expensive calculations\n- useCallback for function props\n- React.memo for component optimization\n\n3. Virtual List Implementation\n- Use react-window for long lists\n- Implement infinite scrolling\n\nTODO: Benchmark current application and identify bottlenecks",
    archived: false,
  },
  {
    title: "Japan Travel Planning",
    tags: ["Travel", "Personal"],
    content:
      "Japan Trip Planning - Spring 2025\n\nItinerary Draft:\nWeek 1: Tokyo\n- Shibuya and Harajuku\n- TeamLab Digital Art Museum\n- Day trip to Mount Fuji\n\nWeek 2: Kyoto & Osaka\n- Traditional temples\n- Cherry blossom viewing\n- Food tour in Osaka\n\nBudget: $3000\nAccommodation: Mix of hotels and traditional ryokans\nJR Pass: 14 days\n\nTODO: Book flights 6 months in advance",
    archived: false,
  },
  {
    title: "Favorite Pasta Recipes",
    tags: ["Cooking", "Recipes"],
    content:
      "Classic Italian Recipes:\n\n1. Carbonara\n- Eggs, pecorino, guanciale\n- No cream ever!\n- Save pasta water\n\n2. Cacio e Pepe\n- Pecorino Romano\n- Fresh black pepper\n- Technique is crucial\n\n3. Arrabbiata\n- San Marzano tomatoes\n- Fresh garlic\n- Red pepper flakes\n\nNote: Always use high-quality ingredients",
    archived: false,
  },
  {
    title: "TypeScript Migration Guide",
    tags: ["Dev", "React", "TypeScript"],
    content:
      "Project migration steps:\n\n1. Initial Setup\n- Install TypeScript dependencies\n- Configure tsconfig.json\n- Set up build pipeline\n\n2. Migration Strategy\n- Start with newer modules\n- Add type definitions gradually\n- Use 'any' temporarily for complex cases\n\n3. Testing Approach\n- Update test configuration\n- Add type testing\n- Validate build process\n\nDeadline: End of Q4 2024",
    archived: true,
  },
  {
    title: "Weekly Workout Plan",
    tags: ["Dev", "React"],
    content:
      "Monday: Upper Body\n- Bench Press 4x8\n- Rows 4x10\n- Shoulder Press 3x12\n- Pull-ups 3 sets\n\nWednesday: Lower Body\n- Squats 4x8\n- Romanian Deadlifts 3x10\n- Lunges 3x12 each\n- Calf Raises 4x15\n\nFriday: Full Body\n- Deadlifts 3x5\n- Push-ups 3x12\n- Leg Press 3x12\n- Core Work\n\nCardio: Tuesday/Thursday - 30 min run",
    archived: false,
  },
  {
    title: "Gift Ideas",
    tags: ["Personal", "Shopping"],
    content:
      "Birthday and Holiday Gift List:\n\nMom:\n- Cooking class subscription\n- Kindle Paperwhite\n- Spa day package\n\nDad:\n- Golf lessons\n- Wireless earbuds\n- BBQ accessories\n\nSister:\n- Art supplies set\n- Yoga mat kit\n- Coffee subscription\n\nBudget per person: $150-200",
    archived: true,
  },
  {
    title: "Meal Prep Ideas",
    tags: ["Cooking", "Health", "Recipes"],
    content:
      "Weekly Meal Prep Plan:\n\nBreakfast Options:\n- Overnight oats\n- Egg muffins\n- Smoothie packs\n\nLunch Containers:\n- Greek chicken bowl\n- Buddha bowls\n- Tuna pasta salad\n\nSnacks:\n- Cut vegetables\n- Mixed nuts\n- Greek yogurt parfait\n\nPrep Time: Sunday 2-4pm\nStorage: Glass containers\nLasts: 4-5 days",
    archived: false,
  },
  {
    title: "Reading List",
    tags: ["Personal", "Dev"],
    content:
      "Current Reading Queue:\n\n1. Technical Books\n- Clean Architecture by Robert Martin\n- Designing Data-Intensive Applications\n- TypeScript Design Patterns\n\n2. Personal Development\n- Deep Work by Cal Newport\n- Atomic Habits\n- The Psychology of Money\n\nCurrently Reading: Clean Architecture\nNext Up: Deep Work\n\nGoal: One book per month",
    archived: false,
  },
  {
    title: "Fitness Goals 2025",
    tags: ["Fitness", "Health", "Personal"],
    content:
      "2025 Fitness Objectives:\n\n1. Strength Goals\n- Bench press: 225 lbs\n- Squat: 315 lbs\n- Deadlift: 405 lbs\n\n2. Cardio Goals\n- Run half marathon\n- 5k under 25 minutes\n\n3. Habits\n- Gym 4x per week\n- Daily 10k steps\n- Sleep 7+ hours\n\nTrack all workouts in Strong app",
    archived: false,
  },
];

// Make this function available globally
window.seedData = async function () {
  const { Client, Databases, ID } = window.Appwrite;

  const client = new Client();
  client
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("69430f2d001f367e2aca");

  const databases = new Databases(client);

  console.log("🌱 Starting to seed data...");

  for (const note of sampleNotes) {
    try {
      await databases.createDocument("notesdb", "notes", ID.unique(), {
        title: note.title,
        content: note.content,
        tags: note.tags,
        archived: note.archived,
      });
      console.log(`✅ Created: ${note.title}`);
    } catch (error) {
      console.log(`⚠️ Skipped (may already exist): ${note.title}`);
    }
  }

  console.log("🎉 Seeding complete! Refresh the page to see all notes.");
};

console.log("Seed script loaded. Run: await seedData()");
