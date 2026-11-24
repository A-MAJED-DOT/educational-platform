
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_option: string;
  explanation: string | null;
  sort_order: number;
};

export default function QuizPage() {
  const params = useParams<{ slug: string; lessonId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.push("/login");
        return;
      }

      setUserId(authData.user.id);

      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("lesson_id", params.lessonId)
        .maybeSingle();

      if (quizError || !quizData) {
        alert(
          "Quiz Load Error:\n" +
          (quizError?.message || "Is Lesson ID ke liye quiz nahi mila.") +
          "\n\nLesson ID: " + params.lessonId
        );
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      const { data: questionData, error: questionError } =
        await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizData.id)
          .order("sort_order", { ascending: true });

      if (questionError) {
        alert(questionError.message);
      } else {
        setQuestions(questionData || []);
      }

      setLoading(false);
    }

    loadQuiz();
  }, [params.lessonId, router, supabase]);

  async function handleSubmit() {
    if (!quiz || questions.length === 0) return;

    if (Object.keys(answers).length !== questions.length) {
      alert("Please sabhi questions ke answers select karo.");
      return;
    }

    let correct = 0;

    questions.forEach((question) => {
      if (answers[question.id] === question.correct_option) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    const { error } = await supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_id: quiz.id,
      score,
      correct_answers: correct,
      total_questions: questions.length,
      answers,
    });

    if (error) {
      alert("Result save nahi hua: " + error.message);
      return;
    }

    setResult({
      score,
      correct,
      total: questions.length,
      passed,
    });

    setSubmitted(true);
  }

  if (loading) {
    return <div className="p-10 text-center">Loading Quiz...</div>;
  }

  if (!quiz) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.push(`/courses/${params.slug}/lessons`)}
            className="rounded-lg bg-gray-200 px-4 py-2"
          >
            ← Back to Lessons
          </button>

          <button
            onClick={() =>
              router.push(
                `/courses/${params.slug}/lessons/${params.lessonId}/quiz/history`
              )
            }
            className="rounded-lg bg-purple-100 px-4 py-2 font-semibold text-purple-700 hover:bg-purple-200"
          >
            📊 Quiz History
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            📝 {quiz.title}
          </h1>

          <p className="mt-2 text-gray-600">
            {quiz.description}
          </p>

          <p className="mt-3 text-sm font-semibold text-blue-600">
            Passing Score: {quiz.passing_score}%
          </p>
        </div>

        {submitted && result && (
          <div className="mb-6 rounded-xl bg-white p-6 text-center shadow">
            <h2 className="text-2xl font-bold">
              {result.passed ? "🎉 Congratulations!" : "Keep Practicing!"}
            </h2>

            <p className="mt-3 text-4xl font-bold text-blue-600">
              {result.score}%
            </p>

            <p className="mt-2 text-gray-600">
              Correct Answers: {result.correct}/{result.total}
            </p>

            <p className="mt-2 font-semibold">
              {result.passed ? "Quiz Passed" : "Quiz Not Passed"}
            </p>
          </div>
        )}

        {questions.map((question, index) => (
          <div
            key={question.id}
            className="mb-5 rounded-xl bg-white p-6 shadow"
          >
            <h2 className="mb-4 text-lg font-bold">
              Q{index + 1}. {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => {
                const optionValue = String(optionIndex);
                const isSelected = answers[question.id] === optionValue;
                const isCorrect = question.correct_option === optionValue;

                let optionClass = "border-gray-200 hover:bg-gray-50";

                if (submitted && isCorrect) {
                  optionClass = "border-green-500 bg-green-50";
                } else if (submitted && isSelected && !isCorrect) {
                  optionClass = "border-red-500 bg-red-50";
                } else if (isSelected) {
                  optionClass = "border-blue-500 bg-blue-50";
                }

                return (
                  <label
                    key={optionIndex}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${optionClass}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={optionValue}
                      checked={isSelected}
                      disabled={submitted}
                      onChange={() =>
                        setAnswers((previous) => ({
                          ...previous,
                          [question.id]: optionValue,
                        }))
                      }
                    />

                    <span>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </span>

                    {submitted && isCorrect && (
                      <span className="ml-auto text-green-700">
                        ✓ Correct
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="font-semibold text-blue-800">
                  Correct Answer:{" "}
                  {question.options[Number(question.correct_option)]}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  Explanation: {question.explanation || "No explanation provided."}
                </p>
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-center">
            Is quiz mein abhi questions nahi hain.
          </p>
        )}

        {!submitted && questions.length > 0 && (
          <button
            onClick={handleSubmit}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700"
          >
            Submit Quiz
          </button>
        )}

        {submitted && (
          <div className="space-y-3">
            <button
              onClick={() =>
                router.push(
                  `/courses/${params.slug}/lessons/${params.lessonId}/quiz/history`
                )
              }
              className="w-full rounded-xl bg-purple-600 px-6 py-4 font-bold text-white hover:bg-purple-700"
            >
              📊 View Quiz History
            </button>

            <button
              onClick={() => router.push(`/courses/${params.slug}/lessons`)}
              className="w-full rounded-xl bg-gray-800 px-6 py-4 font-bold text-white"
            >
              Back to Lessons
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
