"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import LoadingButton from "@/components/ui/LoadingButton";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username wajib diisi.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Login gagal.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* LEFT: FORM */}
      <div className="flex items-center justify-center px-6 md:px-16">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl md:text-4xl font-medium text-green-950 mb-3">Sign In</h1>
          <p className="text-gray-400 mb-10">
            Enter your username and password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              autoComplete="username"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="w-5/6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            <input
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-5/6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <LoadingButton
              type="submit"
              loading={loading}
              className="w-5/6 px-5 py-4 bg-green-950 text-white rounded-xl font-medium hover:bg-green-800 transition disabled:opacity-60"
            >
              {loading ? "Loading..." : "Login"}
            </LoadingButton>
          </form>
        </div>
      </div>

      {/* RIGHT: IMAGE */}
      <div className="hidden md:block">
        <img
          src="/login-image.jpg"
          alt="Login Visual"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
