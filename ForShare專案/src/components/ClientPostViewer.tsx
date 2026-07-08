"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// 注意事項 10：確保所有瀏覽器 API 呼叫都在 Client 環境下執行
const isBrowser = typeof window !== "undefined";

interface PostProps {
  post: {
    id: string;
    title: string;
    content: string;
    fileUrl: string | null;
    isPaid: boolean;
    authorId: string;
    author: { name: string | null };
  };
  currentUserId: string | undefined;
  totalTips?: number;
  tipCount?: number;
}

export default function ClientPostViewer({ post, currentUserId, totalTips = 0, tipCount = 0 }: PostProps) {
  const router = useRouter();
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============ 檢舉 Modal ============
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState(""); // 注意事項 8：「其他」的自訂輸入
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMsg, setReportMsg] = useState("");

  // 注意事項 10：Mounted 標記，防止 SSR 階段呼叫瀏覽器 API
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // ============ 停留時間追蹤 (注意事項 5, 6, 7) ============
  const startTimeRef = useRef(Date.now());
  const roundsRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showStillHere, setShowStillHere] = useState(false);
  const hasSentDwellRef = useRef(false);

  const isOwnPost = currentUserId === post.authorId;

  // 發送停留時間到後端
  const sendDwellTime = useCallback(() => {
    if (hasSentDwellRef.current) return;
    hasSentDwellRef.current = true;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // 注意事項 7：3 秒以下不發送
    if (elapsed < 3) return;

    // 注意事項 10：確保不在 SSR 階段呼叫瀏覽器 API
    if (!isBrowser) return;

    // 使用 navigator.sendBeacon 確保關閉分頁時也能送出
    const payload = JSON.stringify({ postId: post.id, duration: elapsed });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/dwell", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/analytics/dwell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(console.error);
    }
  }, [post.id]);

  useEffect(() => {
    // 注意事項 10：確保只在 Client 環境執行
    if (!isBrowser) return;

    // 注意事項 6：每超過 60 秒為一圈，圈數達 5 圈跳出「你還在使用嗎？」
    roundTimerRef.current = setInterval(() => {
      roundsRef.current += 1;
      if (roundsRef.current >= 5) {
        // 到達 5 圈 (5 分鐘)，暫停計時並彈出確認
        if (roundTimerRef.current) clearInterval(roundTimerRef.current);
        setShowStillHere(true);
      }
    }, 60000); // 每 60 秒一圈

    // 注意事項 5：掛載 beforeunload 與 visibilitychange
    const handleBeforeUnload = () => sendDwellTime();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendDwellTime();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // 元件 unmount 時也送出
      sendDwellTime();
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sendDwellTime]);

  // 使用者確認「還在使用」→ 重置圈數、繼續計時
  const handleStillHereConfirm = () => {
    setShowStillHere(false);
    roundsRef.current = 0;
    roundTimerRef.current = setInterval(() => {
      roundsRef.current += 1;
      if (roundsRef.current >= 5) {
        if (roundTimerRef.current) clearInterval(roundTimerRef.current);
        setShowStillHere(true);
      }
    }, 60000);
  };

  // 使用者確認「已不在使用」→ 判定為無效、停止計時並送出目前秒數
  const handleStillHereCancel = () => {
    setShowStillHere(false);
    sendDwellTime();
  };

  // ============ 強制打賞機制 ============
  useEffect(() => {
    if (isOwnPost || !post.isPaid) return;

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowTipModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOwnPost, post.isPaid]);

  const handleExitClick = () => {
    if (isOwnPost || !post.isPaid) {
      router.push("/explore");
    } else {
      setShowTipModal(true);
    }
  };

  const submitTipAndExit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, amount: tipAmount }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "打賞失敗，請確認積分餘額");
        setSubmitting(false);
        return;
      }

      router.push("/explore");
    } catch (err) {
      console.error(err);
      setError("網路錯誤，請稍後再試");
      setSubmitting(false);
    }
  };

  // ============ 檢舉送出 ============
  const submitReport = async () => {
    if (!reportReason) {
      setReportMsg("⚠️ 請選擇檢舉理由");
      return;
    }

    // 注意事項 8 + 9：「其他」必須附帶自訂理由，前端先做基本驗證
    if (reportReason === "其他") {
      const trimmedCustom = customReason.trim();
      if (trimmedCustom.length < 5) {
        setReportMsg("⚠️ 請在「其他」欄位中填寫至少 5 個字的說明");
        return;
      }
    }

    setReportSubmitting(true);
    setReportMsg("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          reason: reportReason,
          customReason: reportReason === "其他" ? customReason.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReportMsg(`❌ ${data.error}`);
      } else {
        setReportMsg("✅ " + data.message);
        setTimeout(() => {
          setShowReportModal(false);
          setReportReason("");
          setCustomReason("");
          setReportMsg("");
        }, 1500);
      }
    } catch {
      setReportMsg("❌ 網路錯誤，請稍後再試");
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="mx-auto max-w-4xl relative">
          
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleExitClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-background border border-border text-text-secondary hover:text-text-primary hover:border-primary/50 transition-colors"
            >
              <span>←</span> 離開筆記
            </button>
            <div className="flex items-center gap-3">
              {/* 注意事項 8：檢舉按鈕，二次確認，視覺權重低 */}
              {!isOwnPost && currentUserId && (
                <button
                  onClick={() => { setShowReportModal(true); setReportMsg(""); setReportReason(""); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-error/70 border border-error/20 hover:bg-error/10 hover:text-error transition-colors"
                >
                  🚨 檢舉
                </button>
              )}
              <div className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                閱讀模式
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 leading-tight">
              {post.title}
            </h1>
            
            {/* 迴響統計 */}
            <div className="flex items-center gap-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                <span>💖</span>
                <span>已經收到 {totalTips} 點迴響</span>
              </div>
              <span className="text-sm text-text-tertiary">
                ({tipCount} 人次打賞)
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">
                  {post.author.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{post.author.name}</p>
                <p className="text-xs text-text-tertiary">發布作者</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-10">
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-lg">
                {post.content}
              </p>
            </div>

            {post.fileUrl && (
              <div className="mt-10 p-6 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">附加檔案</h3>
                <p className="text-sm text-text-secondary mb-6">點擊下方按鈕預覽或下載原檔</p>
                <a
                  href={post.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all hover:scale-[1.02]"
                >
                  檢視檔案
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ 「你還在使用嗎？」確認 Modal (注意事項 6) ============ */}
      {showStillHere && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl border border-border p-8 text-center animate-slide-up">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-xl font-extrabold text-text-primary mb-2">你還在使用嗎？</h2>
            <p className="text-sm text-text-secondary mb-6">
              您已經閱讀這篇筆記超過 5 分鐘了。<br />
              為了確保數據精準度，請確認您是否仍在閱讀。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStillHereCancel}
                className="flex-1 py-3 rounded-xl text-sm font-bold border border-border text-text-secondary hover:bg-background transition-colors"
              >
                已經離開
              </button>
              <button
                onClick={handleStillHereConfirm}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all"
              >
                還在閱讀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ 檢舉 Modal (注意事項 8, 9, 10) ============ */}
      {isMounted && showReportModal && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-border p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-text-primary">🚨 檢舉此篇筆記</h2>
              <button
                onClick={() => { setShowReportModal(false); setReportReason(""); setCustomReason(""); setReportMsg(""); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-background transition-colors"
              >✕</button>
            </div>

            <p className="text-sm text-text-secondary mb-6">
              請選擇您認為最符合的檢舉理由。管理員會盡快審核您的檢舉。
            </p>

            <div className="space-y-3 mb-4">
              {[
                { value: "版權侵害", icon: "⚖️", desc: "未經授權轉載他人作品" },
                { value: "內容農場/無意義內容", icon: "🗑️", desc: "無實質價值的低品質內容" },
                { value: "其他", icon: "📋", desc: "其他不符合社群規範之行為" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setReportReason(opt.value); if (opt.value !== "其他") setCustomReason(""); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    reportReason === opt.value
                      ? "border-error bg-error/5 shadow-sm"
                      : "border-border hover:border-error/30 hover:bg-background"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${reportReason === opt.value ? "text-error" : "text-text-primary"}`}>
                      {opt.value}
                    </p>
                    <p className="text-xs text-text-tertiary">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* 注意事項 8：「其他」選項的自訂輸入欄位 */}
            {reportReason === "其他" && (
              <div className="mb-4 animate-fade-in">
                <label htmlFor="custom-report-reason" className="block text-xs font-medium text-text-secondary mb-1.5">
                  請說明您的檢舉理由 <span className="text-error">*</span>
                </label>
                <textarea
                  id="custom-report-reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error transition-all text-sm resize-none"
                  placeholder="至少 5 個字，例如：此筆記內容與某教授課堂講義完全相同..."
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className={`text-[10px] ${customReason.trim().length < 5 ? "text-error" : "text-text-tertiary"}`}>
                    {customReason.trim().length < 5 ? `還需要 ${5 - customReason.trim().length} 個字` : "✓ 字數符合要求"}
                  </p>
                  <p className="text-[10px] text-text-tertiary">{customReason.length}/200</p>
                </div>
              </div>
            )}

            {reportMsg && (
              <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-medium ${
                reportMsg.startsWith("✅")
                  ? "bg-success/10 text-success border border-success/20"
                  : reportMsg.startsWith("⚠️")
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-error/10 text-error border border-error/20"
              }`}>
                {reportMsg}
              </div>
            )}

            <button
              onClick={submitReport}
              disabled={reportSubmitting || !reportReason || (reportReason === "其他" && customReason.trim().length < 5)}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportSubmitting ? "送出中..." : "確認送出檢舉"}
            </button>
          </div>
        </div>
      )}

      {/* ============ 強制打賞 Modal ============ */}
      {showTipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-border p-8 text-center animate-slide-up relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20 mb-6 rotate-12">
              🎁
            </div>
            
            <h2 className="text-2xl font-extrabold text-text-primary mb-2">感謝您的閱讀！</h2>
            <p className="text-sm text-text-secondary mb-8">
              為了支持作者持續創作，退出前請選擇打賞 1~5 點積分給 <span className="text-primary font-bold">{post.author.name}</span>。
            </p>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setTipAmount(pts)}
                  className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                    tipAmount === pts
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                      : "bg-background border border-border text-text-secondary hover:border-primary/50"
                  }`}
                >
                  {pts}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-error mb-4">{error}</p>
            )}

            <button
              onClick={submitTipAndExit}
              disabled={submitting}
              className="w-full py-4 rounded-xl text-sm font-bold text-white bg-text-primary hover:bg-black transition-all shadow-xl disabled:opacity-50"
            >
              {submitting ? "處理中..." : `打賞 ${tipAmount} 點並退出`}
            </button>
            <p className="text-xs text-text-tertiary mt-4">您無法略過此步驟。感謝支持知識共享！</p>
          </div>
        </div>
      )}
    </>
  );
}
