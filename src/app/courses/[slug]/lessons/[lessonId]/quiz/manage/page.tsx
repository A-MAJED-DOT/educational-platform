
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_option: string;
  explanation: string | null;
  sort_order: number;
};

type Lesson = {
  id: string;
  title: string;
};

type Quiz = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
};

export default function ManageQuizPage() {
  const params = useParams<{ slug: string; lessonId: string }>();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [title, setTitle] = useState("Lesson Quiz");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(60);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("0");
  const [explanation, setExplanation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", params.lessonId)
      .single();

    if (lessonError || !lessonData) {
      alert("Lesson not found");
      router.push("/dashboard");
      setLoading(false);
      return;
    }

    setLesson(lessonData as Lesson);

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", params.lessonId)
      .maybeSingle();

    if (quizError) {
      alert(quizError.message);
      setLoading(false);
      return;
    }

    if (quizData) {
      const savedQuiz = quizData as Quiz;

      setQuiz(savedQuiz);
      setTitle(savedQuiz.title);
      setDescription(savedQuiz.description || "");
      setPassingScore(savedQuiz.passing_score);

      const { data: questionData, error: questionError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", savedQuiz.id)
        .order("sort_order");

      if (questionError) {
        alert(questionError.message);
      } else {
        setQuestions((questionData || []) as Question[]);
      }
    }

    setLoading(false);
  }, [supabase, params.lessonId, router]);

  useEffect(() => {
  queueMicrotask(() => {
    void loadData();
  });
}, [loadData]);

  async function saveQuiz() {
    if (!title.trim()) {
      alert("Quiz title required");
      return;
    }

    setSaving(true);

    const quizData = {
      lesson_id: params.lessonId,
      title,
      description,
      passing_score: passingScore,
    };

    let result;

    if (quiz) {
      result = await supabase
        .from("quizzes")
        .update(quizData)
        .eq("id", quiz.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("quizzes")
        .insert(quizData)
        .select()
        .single();
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      setQuiz(result.data as Quiz);
      alert("Quiz saved successfully!");
    }

    setSaving(false);
  }

  function resetQuestionForm() {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption("0");
    setExplanation("");
    setEditingId(null);
  }

  async function saveQuestion() {
    if (!quiz) {
      alert("Please save the quiz first.");
      return;
    }

    if (!question.trim() || options.some((option) => !option.trim())) {
      alert("Question aur sabhi 4 options fill karo.");
      return;
    }

    setSaving(true);

    const questionData = {
      quiz_id: quiz.id,
      question,
      options,
      correct_option: correctOption,
      explanation,
      sort_order: editingId
        ? questions.find((q) => q.id === editingId)?.sort_order ?? questions.length
        : questions.length,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("quiz_questions")
        .update(questionData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("quiz_questions")
        .insert(questionData);
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      resetQuestionForm();
      await loadData();
      alert("Question saved successfully!");
    }

    setSaving(false);
  }

  function editQuestion(item: Question) {
    setEditingId(item.id);
    setQuestion(item.question);
    setOptions(item.options);
    setCorrectOption(item.correct_option);
    setExplanation(item.explanation || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;

    const { error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      await loadData();
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading Quiz...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 font-semibold"
        >
          ← Back to Lessons
        </button>

        <header>
          <h1 className="text-3xl font-bold text-slate-800">
            📝 Manage Quiz
          </h1>
          <p className="mt-2 text-slate-600">
            Lesson: {lesson?.title}
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold">Quiz Settings</h2>

          <div>
            <label className="mb-1 block font-medium">Quiz Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border p-3"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            onClick={saveQuiz}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            {saving ? "Saving..." : "💾 Save Quiz Settings"}
          </button>
        </section>

        {quiz && (
          <>
            <section className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Question" : "Add New Question"}
              </h2>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question..."
                rows={3}
                className="w-full rounded-lg border p-3"
              />

              <h3 className="font-semibold">Four Answer Options</h3>

              {options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <label className="font-medium">
                    Option {index + 1}
                  </label>
                  <input
                    value={option}
                    onChange={(e) =>
                      setOptions((old) =>
                        old.map((item, i) =>
                          i === index ? e.target.value : item
                        )
                      )
                    }
                    placeholder={`Enter option ${index + 1}`}
                    className="w-full rounded-lg border p-3"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block font-medium">
                  Correct Answer
                </label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full rounded-lg border p-3"
                >
                  {options.map((option, index) => (
                    <option key={index} value={String(index)}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Explanation
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain the correct answer..."
                  rows={3}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveQuestion}
                  disabled={saving}
                  className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Question"
                      : "➕ Add Question"}
                </button>

                {editingId && (
                  <button
                    onClick={resetQuestionForm}
                    className="rounded-lg bg-slate-200 px-5 py-3"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">
                Questions ({questions.length})
              </h2>

              {questions.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-white p-5 space-y-3"
                >
                  <h3 className="font-bold">
                    Q{index + 1}. {item.question}
                  </h3>

                  {item.options.map((option, i) => (
                    <p
                      key={i}
                      className={
                        item.correct_option === String(i)
                          ? "font-semibold text-green-700"
                          : "text-slate-600"
                      }
                    >
                      {String.fromCharCode(65 + i)}. {option}
                      {item.correct_option === String(i) && " ✓ Correct"}
                    </p>
                  ))}

                  {item.explanation && (
                    <p className="text-sm text-slate-500">
                      Explanation: {item.explanation}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => editQuestion(item)}
                      className="rounded-lg bg-amber-50 px-4 py-2 text-amber-700"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteQuestion(item.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-red-600"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <p className="rounded-xl bg-white p-5 text-slate-500">
                  Abhi koi question nahi hai. Pehla question add karo.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
