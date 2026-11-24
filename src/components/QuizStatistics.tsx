
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Statistics = {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  learningPerformance: number;
};

export default function QuizStatistics() {
  const [supabase] = useState(() => createClient());

  const [stats, setStats] = useState<Statistics>({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    learningPerformance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStatistics() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const [
        quizzesResult,
        attemptsResult,
        lessonsResult,
        progressResult,
      ] = await Promise.all([
        supabase
          .from("quizzes")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("quiz_attempts")
          .select("score")
          .eq("user_id", userId),

        supabase
          .from("lessons")
          .select("id"),

        supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", userId)
          .eq("completed", true),
      ]);

      const queryError =
        quizzesResult.error ||
        attemptsResult.error ||
        lessonsResult.error ||
        progressResult.error;

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      const attempts = attemptsResult.data || [];
      const lessons = lessonsResult.data || [];
      const progress = progressResult.data || [];

      const totalAttempts = attempts.length;

      const totalScore = attempts.reduce(
        (sum, attempt) => sum + Number(attempt.score || 0),
        0
      );

      const averageScore =
        totalAttempts > 0
          ? Math.round(totalScore / totalAttempts)
          : 0;

      const completedIds = new Set(
        progress.map((item) => item.lesson_id)
      );

      const completedLessons = lessons.filter((lesson) =>
        completedIds.has(lesson.id)
      ).length;

      const lessonProgress =
        lessons.length > 0
          ? Math.round((completedLessons / lessons.length) * 100)
          : 0;

      const learningPerformance =
        totalAttempts > 0
          ? Math.round((averageScore + lessonProgress) / 2)
          : lessonProgress;

      setStats({
        totalQuizzes: quizzesResult.count || 0,
        totalAttempts,
        averageScore,
        learningPerformance,
      });

      setLoading(false);
    }

    loadStatistics();
  }, [supabase]);

  const cards = [
    {
      title: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: "📝",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Attempts",
      value: stats.totalAttempts,
      icon: "🎯",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Average Quiz Score",
      value: `${stats.averageScore}%`,
      icon: "🏆",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Learning Performance",
      value: `${stats.learningPerformance}%`,
      icon: "📈",
      color: "bg-amber-50 text-amber-700",
    },
  ];

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        Loading quiz statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-600">
        Statistics Error: {error}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-5 text-xl font-bold text-gray-900">
        📊 Quiz Statistics
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <span className={`rounded-lg p-3 ${card.color}`}>
                {card.icon}
              </span>
            </div>

            <h3 className="mt-4 text-3xl font-bold text-gray-900">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Learning Performance = Average Quiz Score and Lesson Completion
        Percentage ka average.
      </p>
    </section>
  );
}
