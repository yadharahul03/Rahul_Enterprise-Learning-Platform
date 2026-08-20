// mockDashboardData.js
// Shape this matches what your future backend endpoints should return:
//   GET /api/dashboard/summary      -> user, stats, weeklyActivity, skillProgress, achievements
//   GET /api/dashboard/enrollments  -> continueLearning, enrolledCourses, recommended

export const mockDashboardData = {
  user: {
    name: "Sasi Madhuri",
    streakDays: 6,
  },

  stats: {
    coursesEnrolled: 5,
    coursesCompleted: 2,
    unitsCompleted: 38,
    unitsTotal: 60,
    hoursThisWeek: 7.5,
  },

  weeklyActivity: [
    { day: "Mon", units: 2 },
    { day: "Tue", units: 4 },
    { day: "Wed", units: 1 },
    { day: "Thu", units: 5 },
    { day: "Fri", units: 3 },
    { day: "Sat", units: 6 },
    { day: "Sun", units: 2 },
  ],

  continueLearning: [
    {
      id: 1,
      title: "React Fundamentals",
      lastAccessed: "2 days ago",
      percentComplete: 65,
      unitsCompleted: 13,
      unitsTotal: 20,
    },
    {
      id: 2,
      title: "Spring Boot Essentials",
      lastAccessed: "Today",
      percentComplete: 40,
      unitsCompleted: 8,
      unitsTotal: 20,
    },
  ],

  enrolledCourses: [
    { id: 1, title: "React Fundamentals", category: "Frontend", percentComplete: 65 },
    { id: 2, title: "Spring Boot Essentials", category: "Backend", percentComplete: 40 },
    { id: 3, title: "MySQL for Developers", category: "Databases", percentComplete: 100 },
    { id: 4, title: "Data Structures Basics", category: "DSA", percentComplete: 20 },
    { id: 5, title: "REST API Design", category: "Backend", percentComplete: 100 },
  ],

  skillProgress: [
    { skill: "Frontend", percent: 60 },
    { skill: "Backend", percent: 45 },
    { skill: "Databases", percent: 80 },
    { skill: "DSA", percent: 20 },
  ],

  achievements: [
    { id: 1, title: "First Summit", description: "Complete your first course", earned: true },
    { id: 2, title: "7-Day Streak", description: "Learn 7 days in a row", earned: false },
    { id: 3, title: "Basecamp Reached", description: "Enroll in 5 courses", earned: true },
    { id: 4, title: "Full Ascent", description: "Complete all enrolled courses", earned: false },
  ],

  recommended: [
    {
      id: 1,
      title: "Advanced React Patterns",
      category: "Frontend",
      reason: "Because you completed REST API Design",
    },
    {
      id: 2,
      title: "SQL Query Optimization",
      category: "Databases",
      reason: "Popular next step after MySQL for Developers",
    },
    {
      id: 3,
      title: "Algorithms in Practice",
      category: "DSA",
      reason: "Matches your DSA skill gap",
    },
  ],
};