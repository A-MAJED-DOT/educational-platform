"use client";
import { useState } from "react";
const courses = [
  {
    title: "Python Programming",
    category: "Programming",
    level: "Beginner",
    icon: "🐍",
    color: "bg-blue-50",
  },
  {
    title: "Web Development",
    category: "Development",
    level: "Beginner",
    icon: "🌐",
    color: "bg-purple-50",
  },
  {
    title: "JavaScript Mastery",
    category: "Programming",
    level: "Intermediate",
    icon: "⚡",
    color: "bg-amber-50",
  },
];

const features = [
  {
    icon: "🎓",
    title: "Expert Instructors",
    description: "Learn from experienced teachers and industry professionals.",
  },
  {
    icon: "💻",
    title: "Learn Anywhere",
    description: "Access your courses anytime from any device.",
  },
  {
    icon: "🏆",
    title: "Earn Certificates",
    description: "Showcase your skills with course completion certificates.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");
const categories = ["All", ...new Set(courses.map((course) => course.category))];

const filteredCourses = courses.filter((course) => {
  const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
  const matchesCategory =
    selectedCategory === "All" || course.category === selectedCategory;

  return matchesSearch && matchesCategory;
});
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">

      

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <a href="#" className="text-2xl font-extrabold tracking-tight text-blue-700">
            Edu<span className="text-slate-900">Platform.</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 font-medium text-slate-600 md:flex">
            <a href="#" className="text-blue-700">Home</a>
            <a href="#courses" className="hover:text-blue-700">Courses</a>
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#about" className="hover:text-blue-700">About</a>
            <a href="#contact" className="hover:text-blue-700">Contact</a>
          </div>

          {/* Login and Mobile Button */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 sm:px-6"
            >
              Login / Sign Up
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg border border-slate-200 p-2 text-2xl text-slate-700 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-6 py-5 font-medium text-slate-700 md:hidden">
            <a href="#" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">

          <div>
            <span className="inline-block rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              ✨ Welcome to the Future of Learning
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Learn New Skills.
              <span className="block text-blue-700">
                Build Your Future.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Discover high-quality online courses, learn from experts,
              and develop the skills you need to achieve your goals.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#courses"
                className="rounded-xl bg-blue-700 px-8 py-4 font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-800"
              >
                Explore Courses →
              </a>

              <a
                href="#about"
                className="rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 shadow-md transition hover:-translate-y-1"
              >
                Learn More
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <h3 className="text-3xl font-extrabold text-blue-700">100+</h3>
                <p className="text-sm text-slate-500">Learning Resources</p>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-blue-700">24/7</h3>
                <p className="text-sm text-slate-500">Online Access</p>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-blue-700">100%</h3>
                <p className="text-sm text-slate-500">Learning Focus</p>
              </div>
            </div>
          </div>

          {/* 3D STYLE HERO CARD */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-indigo-200/50 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white bg-gradient-to-br from-blue-600 to-indigo-800 p-8 shadow-2xl shadow-blue-300 md:p-12">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-white shadow-inner backdrop-blur-sm">
                <div className="text-7xl">🎓</div>

                <h2 className="mt-8 text-3xl font-bold">
                  Your Learning Journey Starts Here
                </h2>

                <p className="mt-4 leading-7 text-blue-100">
                  Explore new possibilities and turn your knowledge
                  into real-world skills.
                </p>

                <div className="mt-8 flex items-center justify-between rounded-xl bg-white/15 p-4">
                  <div>
                    <p className="text-sm text-blue-100">Your next step</p>
                    <p className="font-bold">Start Learning Today</p>
                  </div>
                  <div className="text-3xl">🚀</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* COURSES SECTION */}
      <section id="courses" className="mx-auto max-w-7xl px-6 py-24">

        <div className="text-center">
          <span className="font-bold uppercase tracking-widest text-blue-700">
            Our Courses
          </span>
          <h2 className="mt-4 text-4xl font-extrabold">
            Explore Popular Courses
          </h2>
          <p className="mt-4 text-slate-500">
            Choose a course and start building your future.
          </p>
        </div>


        {/* COURSE SEARCH */}
        <div className="mx-auto mt-10 max-w-2xl">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-6 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* CATEGORY FILTER */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-3 font-semibold transition ${
                selectedCategory === category
                  ? "bg-blue-700 text-white shadow-lg shadow-blue-200"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>


        
<div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
  {filteredCourses.map((course) => (
    <div
      key={course.title}
      className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-100 transition duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-100"
    >
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl ${course.color} shadow-inner`}>
        {course.icon}
      </div>

      <p className="mt-7 text-sm font-semibold text-blue-700">
        {course.category}
      </p>

      <h3 className="mt-2 text-2xl font-bold">
        {course.title}
      </h3>

      <p className="mt-3 text-slate-500">
        Learn practical skills with structured lessons and projects.
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          {course.level}
        </span>

        <a
  href={`/courses/${course.title === "Python Programming" ? "python" : course.title === "Web Development" ? "web-development" : "javascript"}`}
  className="font-bold text-blue-700 hover:text-blue-900"
>
  Explore →
</a>
      </div>
    </div>
  ))}

  {filteredCourses.length === 0 && (
    <p className="col-span-full py-10 text-center text-slate-500">
      No courses found. Try another search.
    </p>
  )}
</div>


      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-slate-50 px-6 py-24">

        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="font-bold uppercase tracking-widest text-blue-700">
              Why EduPlatform
            </span>
            <h2 className="mt-4 text-4xl font-extrabold">
              Learn Better. Grow Faster.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white bg-white p-9 text-center shadow-lg shadow-slate-200/70 transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl shadow-inner">
                  {feature.icon}
                </div>

                <h3 className="mt-7 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2rem] bg-gradient-to-r from-blue-700 to-indigo-800 p-10 text-center text-white shadow-2xl shadow-blue-200 md:p-16">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Knowledge Is Your Greatest Investment.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-blue-100">
            Our mission is to make quality education accessible
            and help every learner achieve their potential.
          </p>

          <a
            href="#courses"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-blue-700 shadow-lg transition hover:-translate-y-1"
          >
            Start Your Journey →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-slate-950 px-6 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">

          <div>
            <h2 className="text-2xl font-extrabold text-blue-400">
              EduPlatform.
            </h2>
            <p className="mt-4 max-w-sm leading-7 text-slate-400">
              Learn new skills, explore opportunities and build
              a brighter future with quality online education.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Quick Links</h3>
            <div className="mt-5 flex flex-col gap-3 text-slate-400">
              <a href="#">Home</a>
              <a href="#courses">Courses</a>
              <a href="#features">Features</a>
              <a href="#about">About Us</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Contact</h3>
            <p className="mt-5 text-slate-400">
              Get in touch with EduPlatform.
            </p>
            <a href="mailto:hello@eduplatform.example" className="mt-3 inline-block text-blue-400">
              Contact Us
            </a>
          </div>

        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-800 pt-7 text-center text-sm text-slate-500">
          © 2026 EduPlatform. All rights reserved.
        </div>
      </footer>

    </main>
  );
}