
"use client";

import QuizStatistics from "@/components/QuizStatistics";
import RecentActivity from "@/components/RecentActivity";
import LearningStreak from "@/components/LearningStreak";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: string | null;
  icon: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
const [completedLessons, setCompletedLessons] = useState(0);

const [courseProgress, setCourseProgress] = useState<
  {
    id: string;
    title: string;
    icon: string | null;
    total: number;
    completed: number;
    percentage: number;
  }[]
>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email || "");

      // Load Courses
const { data, error } = await supabase
  .from("courses")
  .select("*")
  .order("sort_order", { ascending: true });

if (error) {
  setMessage(error.message);
  setLoading(false);
  return;
}

const loadedCourses = (data || []) as Course[];
setCourses(loadedCourses);

// Load All Lessons
const { data: lessonData, error: lessonError } = await supabase
  .from("lessons")
  .select("id, course_id");

if (lessonError) {
  setMessage(lessonError.message);
  setLoading(false);
  return;
}

const allLessons = lessonData || [];
setTotalLessons(allLessons.length);

// Load Completed Lessons
const { data: progressData, error: progressError } = await supabase
  .from("user_progress")
  .select("lesson_id")
  .eq("user_id", user.id)
  .eq("completed", true);

if (progressError) {
  setMessage(progressError.message);
  setLoading(false);
  return;
}

const completedIds = new Set(
  (progressData || []).map((item) => item.lesson_id)
);

setCompletedLessons(
  allLessons.filter((lesson) => completedIds.has(lesson.id)).length
);

// Calculate Course-wise Progress
const progress = loadedCourses.map((course) => {
  const courseLessons = allLessons.filter(
    (lesson) => lesson.course_id === course.id
  );

  const completed = courseLessons.filter(
    (lesson) => completedIds.has(lesson.id)
  ).length;

  const total = courseLessons.length;

  return {
    id: course.id,
    title: course.title,
    icon: course.icon,
    total,
    completed,
    percentage:
      total > 0 ? Math.round((completed / total) * 100) : 0,
  };
});

setCourseProgress(progress);

setLoading(false);
    }

    loadDashboard();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setCourses((prev) => prev.filter((course) => course.id !== id));
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editing) return;

    setSaving(true);

    const { error } = await supabase
      .from("courses")
      .update({
        title: editing.title,
        slug: editing.slug,
        category: editing.category,
        level: editing.level,
        icon: editing.icon,
        description: editing.description,
      })
      .eq("id", editing.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === editing.id ? editing : course
      )
    );

    setEditing(null);
  }

  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.category || ""} ${course.level || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const pendingLessons = Math.max(
  totalLessons - completedLessons,
  0
);

const overallProgress =
  totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white p-6 md:flex">
        <h1 className="text-2xl font-extrabold text-blue-700">
          EduPlatform.
        </h1>

        <p className="mb-10 mt-2 text-xs text-slate-400">
          YOUR PERSONAL LEARNING SPACE
        </p>

        <nav className="flex-1 space-y-2">
          <a href="#overview" className="block rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700">
            🏠 Dashboard
          </a>
          <a href="#courses" className="block rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100">
            📚 My Courses
          </a>
          <a href="#progress" className="block rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100">
            📊 Learning Overview
          </a>
        </nav>

        <button onClick={handleLogout} className="rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50">
          ↪ Logout
        </button>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 p-5 md:p-10">

        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Continue your learning journey.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {userEmail.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="max-w-48">
              <p className="font-semibold text-slate-800">My Account</p>
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            </div>
            <button onClick={handleLogout} className="rounded-lg border px-3 py-2 text-sm text-red-600 md:hidden">
              Logout
            </button>
          </div>
        </header>

        {/* Welcome Banner */}
        <section id="overview" className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-7 text-white shadow-lg md:p-10">
          <p className="text-sm font-medium text-blue-100">
            YOUR LEARNING JOURNEY
          </p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Learn. Practice. Grow.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
            Welcome to your personal learning space. Explore your courses and build new skills every day.
          </p>
          <a href="#courses" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-blue-700 hover:bg-blue-50">
            Explore My Courses →
          </a>
        </section>

        {/* Statistics */}
        
{/* Learning Statistics */}
<section
  id="progress"
  className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
>
  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="text-3xl">📚</div>
    <p className="mt-4 text-sm text-slate-500">Total Courses</p>
    <h3 className="mt-1 text-3xl font-bold">
      {loading ? "..." : courses.length}
    </h3>
  </div>

  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="text-3xl">📖</div>
    <p className="mt-4 text-sm text-slate-500">Total Lessons</p>
    <h3 className="mt-1 text-3xl font-bold">
      {loading ? "..." : totalLessons}
    </h3>
  </div>

  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="text-3xl">✅</div>
    <p className="mt-4 text-sm text-slate-500">Completed Lessons</p>
    <h3 className="mt-1 text-3xl font-bold text-green-600">
      {loading ? "..." : completedLessons}
    </h3>
  </div>

  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="text-3xl">⏳</div>
    <p className="mt-4 text-sm text-slate-500">Pending Lessons</p>
    <h3 className="mt-1 text-3xl font-bold text-amber-600">
      {loading ? "..." : pendingLessons}
    </h3>
  </div>

  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="text-3xl">🎯</div>
    <p className="mt-4 text-sm text-slate-500">Overall Progress</p>
    <h3 className="mt-1 text-3xl font-bold text-blue-700">
      {loading ? "..." : `${overallProgress}%`}
    </h3>
  </div>
</section>

{/* Course-wise Progress */}
<section className="mb-10 rounded-2xl border bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold text-slate-900">
    📊 Course-wise Progress
  </h2>

  <p className="mb-6 mt-2 text-sm text-slate-500">
    Track your learning progress in every course.
  </p>

  {loading ? (
    <p className="text-slate-500">Loading progress...</p>
  ) : courseProgress.length === 0 ? (
    <p className="text-slate-500">
      No courses available yet.
    </p>
  ) : (
    <div className="space-y-6">
      {courseProgress.map((item) => (
        <div key={item.id}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-slate-800">
              {item.icon || "📘"} {item.title}
            </p>

            <p className="text-sm font-semibold text-blue-700">
              {item.completed}/{item.total} Lessons · {item.percentage}%
            </p>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )}
</section>

      <QuizStatistics />
      <RecentActivity />
      <LearningStreak />
        {/* Courses */}
        <section id="courses">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
              <p className="mt-2 text-sm text-slate-500">
                Manage and explore your courses.
              </p>
            </div>

            <button
              onClick={() => router.push("/courses/add")}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
            >
              + Add Course
            </button>
          </div>

          {/* Search */}
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6 w-full rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-blue-500"
          />

          {message && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {message}
            </p>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
              Loading courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
              <div className="text-5xl">📖</div>
              <h3 className="mt-4 text-xl font-bold text-slate-800">
                {courses.length === 0 ? "No Courses Available" : "No Matching Courses"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {courses.length === 0
                  ? "Add your first course to get started."
                  : "Try another search term."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    {course.icon || "📘"}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {course.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {course.description || "Start learning this course."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {course.category && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {course.category}
                      </span>
                    )}
                    {course.level && (
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        {course.level}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3 border-t pt-4">
                    <button
  onClick={() =>
    router.push(`/courses/${course.slug}/lessons`)
  }
  className="mb-3 w-full rounded-lg bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
>
  📚 Manage Lessons
</button>
                    <button
                      onClick={() => setEditing({ ...course })}
                      className="flex-1 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 border-t pt-6 text-center text-sm text-slate-400">
          © 2026 EduPlatform. Your Personal Learning Space.
        </footer>
      </main>

      {/* Edit Course Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Edit Course
            </h2>

            <form onSubmit={handleEdit} className="space-y-4">
              <input
                required
                value={editing.title}
                placeholder="Course Title"
                onChange={(e) => {
                  const title = e.target.value;
                  setEditing({
                    ...editing,
                    title,
                    slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  });
                }}
                className="w-full rounded-lg border p-3"
              />

              <input
                value={editing.category || ""}
                placeholder="Category"
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full rounded-lg border p-3"
              />

              <select
                value={editing.level || "Beginner"}
                onChange={(e) => setEditing({ ...editing, level: e.target.value })}
                className="w-full rounded-lg border p-3"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <input
                value={editing.icon || ""}
                placeholder="Course Icon"
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                className="w-full rounded-lg border p-3"
              />

              <textarea
                value={editing.description || ""}
                placeholder="Description"
                rows={4}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-lg border p-3"
              />
              

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-lg border p-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
