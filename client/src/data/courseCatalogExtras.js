// Deterministic, illustrative-only enrichment for courses returned by the
// real backend (GET /api/courses only returns id/title/category/totalUnits).
// Ratings, reviews, curriculum, and instructor bios are generated here so
// every course page looks complete without needing backend changes yet.
// Swap this out once the API exposes real course detail/reviews.

const INSTRUCTORS = [
  { name: "Priya Nair", title: "Senior Backend Engineer, ex-Amazon", initials: "PN" },
  { name: "Daniel Cho", title: "Staff Frontend Engineer, ex-Meta", initials: "DC" },
  { name: "Amara Okafor", title: "Data Scientist & ML Educator", initials: "AO" },
  { name: "Marcus Webb", title: "Cloud Architect, AWS Certified", initials: "MW" },
  { name: "Sara Lindqvist", title: "Product Engineering Lead", initials: "SL" },
];

const REVIEW_TEMPLATES = [
  { name: "Rahul K.", text: "Explained concepts clearly with real examples. Went straight from this course into a project at work." },
  { name: "Emily T.", text: "Pacing was great for a working professional — bite-sized units that fit around a full-time job." },
  { name: "Jordan M.", text: "The projects were the best part. I actually built something I could put in my portfolio." },
  { name: "Aisha B.", text: "Solid fundamentals course. Wish there were a couple more advanced units at the end." },
  { name: "Tom H.", text: "Instructor's teaching style just clicked for me. Would take another course from them." },
];

function hashId(id) {
  return typeof id === "number" ? id : String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function getCourseExtras(course) {
  const h = hashId(course.id);
  const instructor = INSTRUCTORS[h % INSTRUCTORS.length];
  const rating = (4.3 + ((h % 6) / 10)).toFixed(1);
  const reviewCount = 180 + (h % 12) * 73;
  const students = 2400 + (h % 17) * 611;
  const level = ["Beginner", "Beginner", "Intermediate", "Intermediate", "Advanced"][h % 5];
  const priceINR = 449 + (h % 6) * 150;
  const lastUpdated = ["Jun 2026", "May 2026", "Apr 2026", "Mar 2026"][h % 4];

  const unitsPerSection = 4;
  const sectionCount = Math.max(3, Math.round((course.totalUnits || 12) / unitsPerSection));
  const curriculum = Array.from({ length: sectionCount }).map((_, si) => {
    const unitsInSection = si === sectionCount - 1
      ? Math.max(1, (course.totalUnits || 12) - unitsPerSection * si)
      : unitsPerSection;
    return {
      id: `sec-${si}`,
      title: [
        "Getting started",
        "Core concepts",
        "Building real features",
        "Testing & debugging",
        "Deployment & best practices",
        "Advanced patterns",
      ][si % 6] + (si >= 6 ? ` ${si + 1}` : ""),
      lessons: Array.from({ length: unitsInSection }).map((__, li) => ({
        id: `sec-${si}-lesson-${li}`,
        title: `Unit ${si * unitsPerSection + li + 1}`,
        minutes: 8 + ((h + si * 3 + li) % 14),
      })),
    };
  });

  const learnPoints = [
    `Core ${course.category} concepts used in real production systems`,
    "Hands-on projects you can add straight to your portfolio",
    "Common pitfalls and how experienced engineers avoid them",
    "How to structure, test, and ship your work with confidence",
  ];

  const reviews = [0, 1, 2].map((i) => ({
    ...REVIEW_TEMPLATES[(h + i) % REVIEW_TEMPLATES.length],
    rating: [5, 5, 4][i],
  }));

  return {
    instructor,
    rating,
    reviewCount,
    students,
    level,
    priceINR,
    lastUpdated,
    curriculum,
    learnPoints,
    reviews,
    description: `A practical, project-driven route through ${course.title}. Built for learners who want to go from fundamentals to something they can actually ship — with checkpoints, real projects, and feedback along the way.`,
  };
}

export function formatStudents(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
