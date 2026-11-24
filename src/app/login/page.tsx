
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const router = useRouter();
  const [supabase] = useState(() => createClient());

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setError("Password reset link sent! Please check your email.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-2xl shadow-blue-100 md:p-10">
        <Link href="/" className="font-semibold text-blue-700">
          ← Back to Home
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            EduPlatform.
          </h1>

          <p className="mt-3 text-slate-500">
            {forgotMode
              ? "Reset your account password."
              : "Welcome back! Login to continue."}
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {!forgotMode && (
            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setError("");
                  }}
                  className="text-sm font-semibold text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              {error}
            </p>
          )}

          {forgotMode ? (
            <>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setError("");
                }}
                className="w-full font-semibold text-blue-700"
              >
                ← Back to Login
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Login to Account →"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
