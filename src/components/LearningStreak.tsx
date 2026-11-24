
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";



type DayActivity = {
  date: string;
  label: string;
  active: boolean;
};

type StreakStats = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  week: DayActivity[];
};

function getDateKey(date: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function getDayNumber(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function calculateStreaks(activityDates: string[]): StreakStats {
  const uniqueDates = [...new Set(activityDates)].sort();

  const today = getDateKey(new Date());
  const yesterday = getDateKey(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const activeSet = new Set(uniqueDates);

  let currentStreak = 0;

  let streakDate = activeSet.has(today)
    ? today
    : activeSet.has(yesterday)
      ? yesterday
      : "";

  while (streakDate && activeSet.has(streakDate)) {
    currentStreak++;

    const previousDay = new Date(
      getDayNumber(streakDate) * 86400000 - 86400000
    );

    streakDate = getDateKey(previousDay);
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDayNumber: number | null = null;

  for (const date of uniqueDates) {
    const currentDayNumber = getDayNumber(date);

    if (
      previousDayNumber !== null &&
      currentDayNumber === previousDayNumber + 1
    ) {
      runningStreak++;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousDayNumber = currentDayNumber;
  }

  const week: DayActivity[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(
      getDayNumber(today) * 86400000 - i * 86400000
    );

    const dateKey = getDateKey(date);

    const label = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      timeZone: "UTC",
    }).format(date);

    week.push({
      date: dateKey,
      label,
      active: activeSet.has(dateKey),
    });
  }

  return {
    currentStreak,
    longestStreak,
    activeDays: uniqueDates.length,
    week,
  };
}

export default function LearningStreak() {
  const [supabase] = useState(() => createClient());

  const [stats, setStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    activeDays: 0,
    week: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStreak() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const [progressResult, attemptsResult] = await Promise.all([
        supabase
          .from("user_progress")
          .select("updated_at")
          .eq("user_id", userId)
          .eq("completed", true),

        supabase
          .from("quiz_attempts")
          .select("submitted_at")
          .eq("user_id", userId),
      ]);

      if (progressResult.error || attemptsResult.error) {
        setError(
          progressResult.error?.message ||
          attemptsResult.error?.message ||
          "Could not load learning streak."
        );
        setLoading(false);
        return;
      }

      const activityDates: string[] = [
        ...(progressResult.data || []).map((item) =>
          getDateKey(item.updated_at)
        ),
        ...(attemptsResult.data || []).map((item) =>
          getDateKey(item.submitted_at)
        ),
      ];

      setStats(calculateStreaks(activityDates));
      setLoading(false);
    }

    loadStreak();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        Loading learning streak...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl bg-red-50 p-5 text-red-600">
        Streak Error: {error}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        🔥 Learning Streak
      </h2>

      <p className="mb-5 text-sm text-gray-500">
        Build a daily learning habit and keep your streak alive.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-700">
            🔥 Current Streak
          </p>
          <h3 className="mt-3 text-3xl font-bold text-orange-800">
            {stats.currentStreak} Days
          </h3>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-700">
            🏆 Longest Streak
          </p>
          <h3 className="mt-3 text-3xl font-bold text-purple-800">
            {stats.longestStreak} Days
          </h3>
        </div>

        <div className="rounded-xl border border-green-100 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-700">
            📅 Active Days
          </p>
          <h3 className="mt-3 text-3xl font-bold text-green-800">
            {stats.activeDays} Days
          </h3>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-5 font-bold text-gray-800">
          📊 Last 7 Days Activity
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {stats.week.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-gray-500">
                {day.label}
              </span>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  day.active
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {day.active ? "✓" : "–"}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          A day counts as active when you complete a lesson or attempt a quiz.
          Dates are calculated using India Standard Time.
        </p>
      </div>
    </section>
  );
}
