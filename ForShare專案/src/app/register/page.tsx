"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    inviteCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("兩次密碼輸入不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          inviteCode: formData.inviteCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "註冊失敗");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">
              For<span className="gradient-text">Share</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mb-2">建立你的帳號</h1>
          <p className="text-text-secondary text-sm">加入 ForShare，開始分享你的知識</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-center">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-text-primary mb-1.5">
                姓名
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="你的名字"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="your@email.com"
              />
            </div>

            {/* University */}
            <div>
              <label htmlFor="register-university" className="block text-sm font-medium text-text-primary mb-1.5">
                就讀大學 <span className="text-error">*</span>
              </label>
              <input
                id="register-university"
                list="university-options"
                type="text"
                required
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="例如：國立台灣大學"
              />
              <datalist id="university-options">
                <option value="國立台灣大學" />
                <option value="國立清華大學" />
                <option value="國立陽明交通大學" />
                <option value="國立成功大學" />
                <option value="國立政治大學" />
                <option value="國立中央大學" />
                <option value="國立中山大學" />
                <option value="國立中正大學" />
                <option value="國立中興大學" />
                <option value="國立台灣科技大學" />
                <option value="國立台北科技大學" />
                <option value="國立台灣師範大學" />
                <option value="輔仁大學" />
                <option value="淡江大學" />
                <option value="東吳大學" />
                <option value="東海大學" />
                <option value="逢甲大學" />
              </datalist>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-text-primary mb-1.5">
                密碼
              </label>
              <input
                id="register-password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="至少 6 個字元"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-text-primary mb-1.5">
                確認密碼
              </label>
              <input
                id="register-confirm"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="再次輸入密碼"
              />
            </div>

            {/* Invite Code (optional) */}
            <div>
              <label htmlFor="register-invite" className="block text-sm font-medium text-text-primary mb-1.5">
                邀請碼 <span className="text-text-tertiary font-normal">(選填)</span>
              </label>
              <input
                id="register-invite"
                type="text"
                value={formData.inviteCode}
                onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="朋友的邀請碼"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="register-submit"
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  註冊中...
                </span>
              ) : (
                "建立帳號"
              )}
            </button>
          </form>

          {/* Divider & login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              已經有帳號了？{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                登入
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
