
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    level: "Beginner",
    icon: "📚",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("courses")
      .insert([form]);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">Add New Course</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            required
            placeholder="Course Title"
            className="w-full rounded-lg border p-3"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm({
                ...form,
                title,
                slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
              });
            }}
          />

          <input
            required
            placeholder="Category"
            className="w-full rounded-lg border p-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <select
            className="w-full rounded-lg border p-3"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <input
            placeholder="Icon (e.g. 🐍)"
            className="w-full rounded-lg border p-3"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />

          <textarea
            placeholder="Course Description"
            rows={4}
            className="w-full rounded-lg border p-3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {message && <p className="text-red-600">{message}</p>}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Course"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg border p-3"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
