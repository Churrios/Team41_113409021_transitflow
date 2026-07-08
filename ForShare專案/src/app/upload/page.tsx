"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPaid: true,
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 未登入處理
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("請選擇要上傳的檔案 (PDF/圖片等)");
      return;
    }

    setLoading(true);

    try {
      // 1. 在實際環境中，這裡應該要把檔案上傳到 S3 或 GCS。
      // 作為原型展示，我們模擬將檔案名稱與後端 API 結合
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      submitData.append("isPaid", formData.isPaid.toString());
      submitData.append("tags", formData.tags);
      submitData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: submitData, // 不用設定 Content-Type，fetch 會自動設定 multipart/form-data
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "上傳失敗，請稍後再試");
        return;
      }

      // 上傳成功，導回探索頁面或 dashboard
      router.push("/dashboard?uploaded=true");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors mb-4 gap-2">
            <span>←</span> 返回個人中心
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">上傳筆記與考古題</h1>
          <p className="text-text-secondary">
            選擇「有償分享」，讓你的努力獲得其他同學的點數打賞迴響！
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                上傳檔案 <span className="text-error">*</span>
              </label>
              <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-8 text-center bg-background/50 group">
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="pointer-events-none">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {file ? "📄" : "📤"}
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-primary">{file.name}</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        點擊或拖曳檔案至此
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        支援 PDF, Word 或圖片檔 (最大 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1.5">
                  標題 <span className="text-error">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  placeholder="例如：112學年度 計算機概論期中考筆記"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-text-primary mb-1.5">
                  系所與科目 <span className="text-error">*</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  required
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  placeholder="例如：資管系, 計概 (用逗號分隔)"
                />
              </div>

              {/* Sharing Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  分享模式 <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPaid: true })}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      formData.isPaid
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💎</span>
                      <span className={`font-bold ${formData.isPaid ? "text-primary" : "text-text-primary"}`}>
                        有償分享
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      讀者退出時，需給予至少 1 點評價
                    </p>
                    {formData.isPaid && (
                      <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPaid: false })}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      !formData.isPaid
                        ? "border-success bg-success/5 shadow-sm"
                        : "border-border bg-background hover:border-success/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🌱</span>
                      <span className={`font-bold ${!formData.isPaid ? "text-success" : "text-text-primary"}`}>
                        無償分享
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      純粹知識分享，閱讀後不會彈出打賞視窗
                    </p>
                    {!formData.isPaid && (
                      <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Content / Description */}
              <div className="md:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-text-primary mb-1.5">
                  筆記簡介與說明
                </label>
                <textarea
                  id="content"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
                  placeholder="簡單描述這份筆記涵蓋了哪些章節？適合什麼樣的人閱讀？"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-full text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-8 py-3 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    上傳中...
                  </>
                ) : (
                  <>
                    <span>確認發布</span>
                    <span>✨</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
