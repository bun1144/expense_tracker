"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login ล้มเหลว");
      }
    } catch (err) {
      setLoading(false);
      setError("เกิดข้อผิดพลาด, ลองใหม่อีกครั้ง");
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-2xl shadow-2xl w-96 space-y-6"
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-700">Expense App</h1>

        {error && (
          <p className="text-center text-red-500 font-medium bg-red-100 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-black"
            required
          />

        </div>

        <button
          type="submit"
          className={`w-full p-3 rounded-lg text-white font-semibold ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } transition`}
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>

        {/* <p className="text-center text-black-500 text-sm">
          ไม่มีบัญชี?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/register")}
          >
            สมัครสมาชิก
          </span>
        </p> */}
      </form>
    </main>
  );
}
