
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type CompletedLesson = {
  id: string;
  updated_at: string;
  lessons: { title: string } | { title: string }[] | null;
};

type QuizAttempt = {
  id: string;
  score: number;
  submitted_at: string;
  quizzes:
    | { title: string; passing_score: number }
    | { title: string; passing_score: number }[]
    | null;
};

export default function RecentActivity() {
  const [supabase] = useState(() => createClient());
  const [lessons, setLessons] = useState<CompletedLesson[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const [lessonResult, attemptResult] = await Promise.all([
        supabase
          .from("user_progress")
          .select("id, updated_at, lessons(title)")
          .eq("user_id", userId)
          .eq("completed", true)
          .order("updated_at", { ascending: false })
          .limit(5),

        supabase
          .from("quiz_attempts")
          .select("id, score, submitted_at, quizzes(title, passing_score)")
          .eq("user_id", userId)
          .order("submitted_at", { ascending: false })
          .limit(5),
      ]);

      if (lessonResult.error || attemptResult.error) {
        setError(
          lessonResult.error?.message ||
          attemptResult.error?.message ||
          "Could not load activity."
        );
        setLoading(false);
        return;
      }

      setLessons((lessonResult.data || []) as CompletedLesson[]);
      setAttempts((attemptResult.data || []) as QuizAttempt[]);
      setLoading(false);
    }

    loadActivity();
  }, [supabase]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRelation<T>(value: T | T[] | null): T | null {
    if (!value) return null;
    return Array.isArray(value) ? value[0] || null : value;
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        Loading recent activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl bg-red-50 p-5 text-red-600">
        Activity Error: {error}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        🕒 Recent Learning Activity
      </h2>

      <p className="mb-5 text-sm text-gray-500">
        Keep track of your latest learning activities.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completed Lessons */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-800">
            ✅ Recently Completed Lessons
          </h3>

          {lessons.length === 0 ? (
            <p className="text-sm text-gray-500">
              No completed lessons yet.
            </p>
          ) : (
            <div className="space-y-4">
              {lessons.map((item) => {
                const lesson = getRelation(item.lessons);

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0"
                  >
                    <span className="rounded-lg bg-green-50 p-2">
                      📖
                    </span>

                    <div>
                      <p className="font-semibold text-gray-800">
                        {lesson?.title || "Lesson"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(item.updated_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz Attempts */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-800">
            🎯 Recent Quiz Attempts
          </h3>

          {attempts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No quiz attempts yet.
            </p>
          ) : (
            <div className="space-y-4">
              {attempts.map((item) => {
                const quiz = getRelation(item.quizzes);
                const passed =
                  item.score >= (quiz?.passing_score ?? 60);

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {quiz?.title || "Quiz"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(item.submitted_at)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {item.score}%
                      </p>
                      <span
                        className={`text-xs font-semibold ${
                          passed ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
