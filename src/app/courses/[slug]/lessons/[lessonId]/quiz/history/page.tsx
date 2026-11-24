
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Attempt = {
  id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  submitted_at: string;
};

export default function QuizHistoryPage() {
  const params = useParams<{
    slug: string;
    lessonId: string;
  }>();

  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      router.replace("/login");
      setLoading(false);
      return;
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("lesson_id", params.lessonId)
      .maybeSingle();

    if (quizError || !quiz) {
      setError("Quiz not found.");
      setLoading(false);
      return;
    }

    const { data, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("id, score, correct_answers, total_questions, submitted_at")
      .eq("quiz_id", quiz.id)
      .eq("user_id", authData.user.id)
      .order("submitted_at", { ascending: false });

    if (attemptsError) {
      setError(attemptsError.message);
    } else {
      setAttempts((data || []) as Attempt[]);
    }

    setLoading(false);
  }, [supabase, router, params.lessonId]);

  useEffect(() => {
  queueMicrotask(() => {
    void loadHistory();
  });
}, [loadHistory]);

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.score))
      : 0;

  if (loading) {
    return <div className="p-8 text-center">Loading quiz history...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        onClick={() => router.push(`/courses/${params.slug}/lessons`)}
        className="mb-6 rounded-lg bg-gray-100 px-4 py-2"
      >
        ← Back to Lessons
      </button>

      <h1 className="mb-6 text-3xl font-bold">📊 Quiz History</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-5">
          <p className="text-sm text-gray-600">Total Attempts</p>
          <h2 className="mt-2 text-3xl font-bold">{attempts.length}</h2>
        </div>

        <div className="rounded-xl bg-green-50 p-5">
          <p className="text-sm text-gray-600">Best Score</p>
          <h2 className="mt-2 text-3xl font-bold">{bestScore}%</h2>
        </div>

        <div className="rounded-xl bg-purple-50 p-5">
          <p className="text-sm text-gray-600">Latest Score</p>
          <h2 className="mt-2 text-3xl font-bold">
            {attempts.length > 0 ? `${attempts[0].score}%` : "—"}
          </h2>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold">Previous Attempts</h2>

      {attempts.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="mb-4 text-gray-600">
            You have not attempted this quiz yet.
          </p>

          <button
            onClick={() =>
              router.push(
                `/courses/${params.slug}/lessons/${params.lessonId}/quiz`
              )
            }
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            🚀 Take Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt, index) => (
            <div
              key={attempt.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5"
            >
              <div>
                <h3 className="font-semibold">
                  Attempt #{attempts.length - index}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {new Date(attempt.submitted_at).toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Correct Answers: {attempt.correct_answers}/
                  {attempt.total_questions}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold">{attempt.score}%</p>

                <span
                  className={
                    attempt.score >= 60
                      ? "text-sm font-semibold text-green-600"
                      : "text-sm font-semibold text-red-600"
                  }
                >
                  {attempt.score >= 60 ? "Passed" : "Failed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() =>
          router.push(
            `/courses/${params.slug}/lessons/${params.lessonId}/quiz`
          )
        }
        className="mt-6 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
      >
        🔄 Retake Quiz
      </button>
    </div>
  );
}
