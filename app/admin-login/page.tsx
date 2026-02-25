"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allSports } from "../components/SiteHeader";

interface Settings {
  schoolName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...result.data });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const isAdmin = role === "admin";
      const endpoint = isAdmin ? "/api/admin-auth" : "/api/page-owner-auth";
      const body = isAdmin ? { password } : { sport: role, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        router.push(redirectTo);
      } else {
        setError(result.message || "Incorrect password.");
        setPassword("");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          {settings.logo && (
            <img src={settings.logo} alt="School Logo" className="h-12" />
          )}
          <span className="text-2xl font-bold">{settings.schoolName}</span>
        </div>
      </header>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-gray-500 text-sm mb-6">Select your role and enter your password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => { setRole(e.target.value); setError(""); }}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
              >
                <option value="admin">System Admin</option>
                {allSports.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name} — Page Owner</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-800"
                style={{ "--tw-ring-color": settings.primaryColor } as React.CSSProperties}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
