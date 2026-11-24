
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { createClient } from "@/utils/supabase/client";

type Course = {
  id: string;
  title: string;
  slug: string;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  sort_order: number;
};

function sanitizeLessonContent(content: string | null) {
  if (!content) return "";

  // Purane plain-text lessons ko bhi support karo
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  const html = hasHtml
    ? content
    : content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r?\n/g, "<br>");

  return DOMPurify.sanitize(html);
}


function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    let videoId = "";

    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("/")[0];
    } else if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") || "";
      } else {
        const match = parsed.pathname.match(
          /^\/(?:embed|shorts)\/([^/]+)/
        );
        videoId = match?.[1] || "";
      }
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}


export default function LessonDetailPage() {
  const params = useParams<{
    slug: string;
    lessonId: string;
  }>();

  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, slug")
        .eq("slug", params.slug)
        .single();

      if (courseError || !courseData) {
        setError("Course not found.");
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseData.id)
        .order("sort_order", { ascending: true });

      if (lessonError || !lessonData) {
        setError(lessonError?.message || "Lessons not found.");
        setLoading(false);
        return;
      }

      const allLessons = lessonData as Lesson[];
      setLessons(allLessons);

      const currentLesson = allLessons.find(
        (item) => item.id === params.lessonId
      );

      if (!currentLesson) {
        setError("Lesson not found.");
        setLoading(false);
        return;
      }

      setLesson(currentLesson);

      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);

      if (progressError) {
        setError(progressError.message);
        setLoading(false);
        return;
      }

      const completedIds = (progressData || [])
        .filter((item) => item.completed)
        .map((item) => item.lesson_id);

      setCompletedLessonIds(completedIds);
      setCompleted(completedIds.includes(currentLesson.id));
      setLoading(false);
    }

    loadLesson();
  }, [params.slug, params.lessonId, router, supabase]);

  async function toggleCompleted() {
    if (!lesson || !userId) return;

    setSaving(true);
    setError("");

    const newStatus = !completed;

    const { error: saveError } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: userId,
          lesson_id: lesson.id,
          completed: newStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setCompleted(newStatus);
    setCompletedLessonIds((prev) =>
      newStatus
        ? [...prev, lesson.id]
        : prev.filter((id) => id !== lesson.id)
    );
  }

  if (loading) {
    return <div className="p-10 text-center">Loading lesson...</div>;
  }

  if (error || !lesson || !course) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">{error || "Lesson not found."}</p>

        <button
          onClick={() => router.back()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(
    (item) => item.id === lesson.id
  );

  const previousLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.filter((id) =>
    lessons.some((item) => item.id === id)
  ).length;

  const progressPercentage =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-10">
      <div className="mx-auto max-w-5xl">

        <button
          onClick={() =>
            router.push(`/courses/${course.slug}/lessons`)
          }
          className="mb-6 font-semibold text-blue-700"
        >
          ← Back to Lessons
        </button>

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">

          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border bg-white p-5">
            <h2 className="mb-4 font-bold">{course.title}</h2>

            {/* Course Progress */}
            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Course Progress
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {progressPercentage}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {completedCount} of {totalLessons} lessons completed
              </p>
            </div>


            <div className="space-y-2">
              {lessons.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() =>
                    router.push(
                      `/courses/${course.slug}/lessons/${item.id}`
                    )
                  }
                  className={`w-full rounded-lg p-3 text-left text-sm ${item.id === lesson.id
                    ? "bg-blue-100 font-bold text-blue-700"
                    : "bg-slate-50 hover:bg-slate-100"
                    }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>
                      {index + 1}. {item.title}
                    </span>

                    {completedLessonIds.includes(item.id) ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                        ✓
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Pending
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Lesson Content */}
          <section className="rounded-2xl border bg-white p-6 md:p-9">

            <p className="text-sm font-semibold text-blue-600">
              LESSON {currentIndex + 1} OF {lessons.length}
            </p>

            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {lesson.title}
            </h1>

            <div className="my-6 border-t" />

            {/* Rich Text Content */}
            <article
              className="
                break-words text-base leading-8 text-slate-700

                [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900
                [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900
                [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900

                [&_p]:mb-4
                [&_strong]:font-bold [&_strong]:text-slate-900
                [&_em]:italic

                [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-7
                [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-7
                [&_li]:pl-1

                [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-green-300
                [&_pre_code]:bg-transparent [&_pre_code]:text-green-300

                [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-1 [&_code]:font-mono [&_code]:text-sm [&_code]:text-pink-700

                [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic
              "
              dangerouslySetInnerHTML={{
                __html: sanitizeLessonContent(lesson.content),
              }}
            />

            {!lesson.content && (
              <p className="text-slate-500">
                No lesson content available.
              </p>
            )}


            {/* YouTube Video Player */}
            {lesson.video_url && (
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  🎬 Lesson Video
                </h2>

                {getYouTubeEmbedUrl(lesson.video_url) ? (
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                    <iframe
                      src={getYouTubeEmbedUrl(lesson.video_url)!}
                      title={lesson.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
                    Invalid YouTube URL. Please check the video link in Manage Lessons.
                  </p>
                )}
              </div>
            )}


            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            {/* Completion */}
            <div className="mt-8 border-t pt-6">
              <button
                onClick={toggleCompleted}
                disabled={saving}
                className={`w-full rounded-xl px-5 py-4 font-bold ${completed
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {saving
                  ? "Saving..."
                  : completed
                    ? "✓ Completed (Click to Undo)"
                    : "Mark as Completed"}
              </button>
            </div>

            {/* Previous / Next */}
            <div className="mt-6 flex justify-between gap-3">
              <button
                disabled={!previousLesson}
                onClick={() =>
                  previousLesson &&
                  router.push(
                    `/courses/${course.slug}/lessons/${previousLesson.id}`
                  )
                }
                className="rounded-lg border px-4 py-3 font-semibold disabled:opacity-30"
              >
                ← Previous
              </button>

              <button
                disabled={!nextLesson}
                onClick={() =>
                  nextLesson &&
                  router.push(
                    `/courses/${course.slug}/lessons/${nextLesson.id}`
                  )
                }
                className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-30"
              >
                Next Lesson →
              </button>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
