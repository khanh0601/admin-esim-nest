"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin/notice");
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-96 m-auto mt-40 p-6 border rounded">
      <h2 className="text-xl mb-4">Đăng nhập</h2>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <button className="w-full bg-teal-600 text-white p-2 rounded">Đăng nhập</button>
    </form>
  );
}
