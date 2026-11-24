"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { createClient } from "@/utils/supabase/client";
import RichTextEditor from "@/components/RichTextEditor";
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
const emptyForm = {
    title: "",
    content: "",
    video_url: "",
};
function sanitizeHtml(html: string) {
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(html);
}
export default function LessonsPage() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const [supabase] = useState(() => createClient());
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/login");
                return;
            }
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
            if (lessonError) {
                setError(lessonError.message);
            } else {
                setLessons((lessonData || []) as Lesson[]);
            }
            setLoading(false);
        }
        loadData();
    }, [params.slug, router, supabase]);
    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setModal(true);
    }
    function openEditModal(lesson: Lesson) {
        setEditingId(lesson.id);
        setForm({
            title: lesson.title,
            content: lesson.content || "",
            video_url: lesson.video_url || "",
        });
        setError("");
        setModal(true);
    }
    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!course) return;
        setSaving(true);
        setError("");
        let result;
        if (editingId) {
            result = await supabase
                .from("lessons")
                .update(form)
                .eq("id", editingId)
                .select()
                .single();
        } else {
            result = await supabase
                .from("lessons")
                .insert({
                    ...form,
                    course_id: course.id,
                    sort_order: lessons.length + 1,
                })
                .select()
                .single();
        }
        setSaving(false);
        if (result.error) {
            setError(result.error.message);
            return;
        }
        if (editingId) {
            setLessons((prev) =>
                prev.map((lesson) =>
                    lesson.id === editingId
                        ? result.data as Lesson
                        : lesson
                )
            );
        } else {
            setLessons((prev) => [...prev, result.data as Lesson]);
        }
        setModal(false);
        setForm(emptyForm);
        setEditingId(null);
    }
    async function handleDelete(lesson: Lesson) {
        const confirmed = window.confirm(
            `Delete "${lesson.title}"?`
        );
        if (!confirmed) return;
        const { error } = await supabase
            .from("lessons")
            .delete()
            .eq("id", lesson.id);
        if (error) {
            alert(error.message);
            return;
        }
        setLessons((prev) =>
            prev.filter((item) => item.id !== lesson.id)
        );
    }
    if (loading) {
        return (
            <div className="p-10 text-center text-slate-500">
                Loading lessons...
            </div>
        );
    }
    if (!course) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold">Course not found.</h1>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }
    return (
        <main className="min-h-screen bg-slate-50 p-5 md:p-10">
            <div className="mx-auto max-w-5xl">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mb-6 font-semibold text-blue-700"
                >
                    ← Back to Dashboard
                </button>
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-7 text-white">
                    <div>
                        <p className="text-sm text-blue-100">
                            COURSE MANAGEMENT
                        </p>
                        <h1 className="mt-2 text-3xl font-extrabold">
                            {course.title}
                        </h1>
                        <p className="mt-2 text-blue-100">
                            {lessons.length} Lessons
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="rounded-xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-blue-50"
                    >
                        + Add Lesson
                    </button>
                </div>
                {error && (
                    <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}
                {lessons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
                        <div className="text-5xl">📚</div>
                        <h2 className="mt-4 text-xl font-bold">
                            No Lessons Yet
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Start adding lessons to this course.
                        </p>
                        <button
                            onClick={openAddModal}
                            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
                        >
                            Create First Lesson
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {lessons.map((lesson, index) => (
                            <div
                                key={lesson.id}
                                className="rounded-2xl border bg-white p-5 shadow-sm"
                            >
                                
<div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
            {index + 1}
        </div>
        <div>
            <h3 className="font-bold text-slate-900">
                {lesson.title}
            </h3>
            <p className="text-xs text-slate-500">
                Lesson {index + 1}
            </p>
        </div>
    </div>

    <div className="flex flex-wrap gap-2">
        <button
            onClick={() =>
                router.push(`/courses/${course.slug}/lessons/${lesson.id}`)
            }
            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
        >
            📖 Open Lesson
        </button>

        <button
            onClick={() =>
                router.push(`/courses/${course.slug}/lessons/${lesson.id}/quiz/manage`)
            }
            className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
        >
            📝 Manage Quiz
        </button>

        <button
  onClick={() =>
    router.push(`/courses/${params.slug}/lessons/${lesson.id}/quiz`)
  }
  className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700"
>
  🚀 Take Quiz
</button>

        <button
            onClick={() => openEditModal(lesson)}
            className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
        >
            ✏️ Edit
        </button>

        <button
            onClick={() => handleDelete(lesson)}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
        >
            🗑 Delete
        </button>
    </div>
</div>

  
            {lesson.content && (
                <details className="mt-4 border-t pt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-blue-700">
                        View Lesson Content
                    </summary>
                    <div
                        className="mt-4 space-y-3 text-sm leading-7 text-slate-700
                        [&_h2]:text-xl [&_h2]:font-bold
                        [&_h3]:text-lg [&_h3]:font-bold
                        [&_strong]:font-bold
                        [&_em]:italic
                        [&_ul]:list-disc [&_ul]:pl-6
                        [&_ol]:list-decimal [&_ol]:pl-6
                        [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-white
                        [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(lesson.content),
                        }}
                    />
                </details>
            )}
            {lesson.video_url && (
                <a
                    href={lesson.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
                >
                    ▶ Watch Lesson Video
                </a>
            )}
        </div>
    ))
}
                    </div >
                )}
            </div >
    {/* Add/Edit Modal */ }
{
    modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-3xl rounded-2xl bg-white p-7 shadow-xl">
                <h2 className="mb-6 text-2xl font-bold">
                    {editingId ? "Edit Lesson" : "Add New Lesson"}
                </h2>
                <form onSubmit={handleSave} className="space-y-5">
                    <input
                        required
                        placeholder="Lesson Title"
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        className="w-full rounded-lg border p-3"
                    />
                    <div>
                        <label className="mb-2 block font-semibold text-slate-700">
                            Lesson Content
                        </label>
                        <RichTextEditor
                            content={form.content}
                            onChange={(content) =>
                                setForm((prev) => ({ ...prev, content }))
                            }
                        />
                    </div>
                    <input
                        type="url"
                        placeholder="Video URL (YouTube or other link)"
                        value={form.video_url}
                        onChange={(e) =>
                            setForm({ ...form, video_url: e.target.value })
                        }
                        className="w-full rounded-lg border p-3"
                    />
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setModal(false);
                                setError("");
                            }}
                            className="flex-1 rounded-lg border p-3 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={saving}
                            className="flex-1 rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Save Changes"
                                    : "Add Lesson"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
        </main >
    );
}
