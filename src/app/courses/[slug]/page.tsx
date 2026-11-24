
import Link from "next/link";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

const courseData: Record<
  string,
  { title: string; description: string; level: string; icon: string }
> = {
  python: {
    title: "Python Programming",
    description:
      "Learn Python from beginner to advanced with practical projects.",
    level: "Beginner",
    icon: "🐍",
  },
  "web-development": {
    title: "Web Development",
    description:
      "Learn HTML, CSS, JavaScript and build modern websites.",
    level: "Beginner",
    icon: "🌐",
  },
  javascript: {
    title: "JavaScript Mastery",
    description:
      "Master JavaScript concepts and build interactive applications.",
    level: "Intermediate",
    icon: "⚡",
  },
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = courseData[slug];

  if (!course) {
    return <main className="p-10 text-center">Course not found.</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Home
        </Link>

        <div className="mt-8 rounded-3xl border border-white bg-white p-8 shadow-2xl shadow-blue-100 md:p-14">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-6xl shadow-inner">
            {course.icon}
          </div>

          <p className="mt-8 font-bold uppercase tracking-widest text-blue-700">
            Course Details
          </p>

          <h1 className="mt-4 text-4xl font-extrabold text-slate-900">
            {course.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {course.description}
          </p>

          <div className="mt-8 inline-block rounded-full bg-blue-50 px-5 py-3 font-semibold text-blue-700">
            Level: {course.level}
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-bold">What You Will Learn</h2>

            <ul className="mt-5 space-y-4 text-slate-600">
              <li>✓ Understand the fundamentals</li>
              <li>✓ Learn through practical examples</li>
              <li>✓ Build real-world projects</li>
              <li>✓ Test your knowledge</li>
            </ul>
          </div>

          <Link
            href={`/courses/${slug}/lessons`}
            className="mt-10 inline-block rounded-xl bg-blue-700 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-800"
          >
            Explore Lessons →
          </Link>
        </div>
      </div>
    </main>
  );
}
