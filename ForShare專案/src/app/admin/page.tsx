"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ===========================================================
// 型別定義
// ===========================================================
interface ReporterCredit {
  totalReports: number;
  resolvedCount: number;
  dismissedCount: number;
  dismissRate: number;
  isSuspicious: boolean;
}

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    content: string;
    authorId: string;
    author: { name: string | null; email: string | null };
  };
  reporter: {
    id: string;
    name: string | null;
    email: string | null;
  };
  reporterCredit: ReporterCredit;
}

interface OverviewData {
  totalUsers: number;
  totalPosts: number;
  totalSearches: number;
  totalPageViews: number;
  pendingReports: number;
}

interface KeywordData {
  keyword: string;
  count: number;
}

interface CategoryDwell {
  category: string;
  avgDuration: number;
  viewCount: number;
}

interface AnalyticsData {
  days: number;
  overview: OverviewData;
  topKeywords: KeywordData[];
  categoryDwell: CategoryDwell[];
}

// ===========================================================
// 主要元件
// ===========================================================
export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"moderation" | "analytics">("moderation");

  // --- 審核中心 ---
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // --- 數據儀表板 ---
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // 注意事項 1：前端權限防護
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  // 載入檢舉清單
  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      setActionMsg("❌ 載入檢舉清單失敗");
    } finally {
      setReportsLoading(false);
    }
  }, [router]);

  // 載入數據儀表板
  const loadAnalytics = useCallback(async (days: number) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      console.error("Analytics load failed");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadReports();
    }
  }, [sessionStatus, loadReports]);

  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalytics(analyticsDays);
    }
  }, [activeTab, analyticsDays, loadAnalytics]);

  // 執行審核判決（封包式）
  const handleResolve = async (reportId: string, action: string) => {
    setActionMsg("");
    try {
      const res = await fetch("/api/admin/reports/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✅ ${data.message}`);
        // 重新載入清單
        await loadReports();
      } else {
        setActionMsg(`❌ ${data.error}`);
      }
    } catch {
      setActionMsg("❌ 操作失敗，請稍後再試");
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-tertiary animate-pulse">載入管理後台中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">🛡️ 營運管理後台</h1>
          <p className="text-text-secondary">管理員專屬控制面板 — 內容審核與商業數據分析</p>
        </div>

        {/* Tab 切換 */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "moderation" as const, label: "👮 內容審核中心", count: reports.length },
            { key: "analytics" as const, label: "📊 數據儀表板" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/30"
              }`}
            >
              {tab.label}
              {"count" in tab && tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 操作訊息 */}
        {actionMsg && (
          <div className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in ${
            actionMsg.startsWith("✅")
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}>
            {actionMsg}
          </div>
        )}

        {/* ================ Tab 1: 內容審核中心 ================ */}
        {activeTab === "moderation" && (
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                <p className="text-text-tertiary animate-pulse">載入檢舉清單中...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                <p className="text-5xl mb-4">✨</p>
                <h3 className="text-xl font-bold text-text-primary mb-2">目前沒有待處理的檢舉</h3>
                <p className="text-text-secondary">平台一切運作正常！</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-surface border border-border rounded-2xl overflow-hidden transition-all hover:shadow-md"
                >
                  {/* 檢舉摘要 */}
                  <button
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-error/10 text-error text-xs font-bold border border-error/20">
                          {report.reason}
                        </span>
                        {report.reporterCredit.isSuspicious && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                            ⚠️ 高駁回率帳號
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-text-primary truncate">
                        📄 {report.post.title}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-1">
                        作者：{report.post.author.name} ・ 檢舉人：{report.reporter.name} ・ {new Date(report.createdAt).toLocaleDateString("zh-TW")}
                      </p>
                    </div>
                    <span className="text-text-tertiary text-lg flex-shrink-0">
                      {expandedReport === report.id ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* 展開詳情 */}
                  {expandedReport === report.id && (
                    <div className="px-6 pb-6 border-t border-border pt-4 space-y-4 animate-fade-in">
                      {/* 被檢舉內容 */}
                      <div className="bg-background rounded-xl p-4">
                        <p className="text-xs font-bold text-text-tertiary mb-2">📝 貼文內容預覽</p>
                        <p className="text-sm text-text-secondary line-clamp-5 whitespace-pre-wrap">
                          {report.post.content}
                        </p>
                      </div>

                      {/* 檢舉人信用 */}
                      <div className="bg-background rounded-xl p-4">
                        <p className="text-xs font-bold text-text-tertiary mb-2">🔍 檢舉人歷史信用</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-text-secondary">
                            累計檢舉：<span className="font-bold text-text-primary">{report.reporterCredit.totalReports}</span> 次
                          </span>
                          <span className="text-success">
                            有效：{report.reporterCredit.resolvedCount}
                          </span>
                          <span className="text-error">
                            駁回：{report.reporterCredit.dismissedCount}
                          </span>
                          <span className={`font-bold ${report.reporterCredit.dismissRate > 50 ? "text-error" : "text-text-secondary"}`}>
                            駁回率：{report.reporterCredit.dismissRate}%
                          </span>
                        </div>
                      </div>

                      {/* 操作按鈕 */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleResolve(report.id, "resolve_hide")}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-sm"
                        >
                          🚫 下架此貼文
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, "resolve_ban")}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 transition-all shadow-sm"
                        >
                          ⛔ 下架 + 停權作者 7 天
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, "dismiss")}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary bg-background border border-border hover:border-primary/30 hover:text-text-primary transition-all"
                        >
                          ✕ 駁回檢舉
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ================ Tab 2: 數據儀表板 ================ */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* 注意事項 5：時間範圍選擇器 */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-secondary">數據範圍：</span>
              {[5, 10, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setAnalyticsDays(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    analyticsDays === d
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "bg-surface border border-border text-text-secondary hover:border-primary/30"
                  }`}
                >
                  {d} 天
                </button>
              ))}
            </div>

            {analyticsLoading || !analytics ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                <p className="text-text-tertiary animate-pulse">載入數據中...</p>
              </div>
            ) : (
              <>
                {/* 平台概覽 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "總用戶數", value: analytics.overview.totalUsers, icon: "👥", color: "primary" },
                    { label: "活躍貼文", value: analytics.overview.totalPosts, icon: "📄", color: "accent" },
                    { label: "搜尋次數", value: analytics.overview.totalSearches, icon: "🔍", color: "success" },
                    { label: "觀看次數", value: analytics.overview.totalPageViews, icon: "👁️", color: "primary" },
                    { label: "待處理檢舉", value: analytics.overview.pendingReports, icon: "🚨", color: "error" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface border border-border rounded-2xl p-5 text-center">
                      <p className="text-3xl mb-2">{stat.icon}</p>
                      <p className="text-2xl font-extrabold text-text-primary">{stat.value}</p>
                      <p className="text-xs font-medium text-text-tertiary mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* 注意事項 7：熱門搜尋排行（長條圖，展示區 60-80%，點擊展開至 80% 螢幕寬度）*/}
                <div
                  className={`bg-surface border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                    expandedChart === "search"
                      ? "fixed inset-x-[10%] top-24 bottom-12 z-50 overflow-y-auto shadow-2xl"
                      : "mx-auto"
                  }`}
                  style={expandedChart !== "search" ? { width: "min(80%, 100%)" } : undefined}
                  onClick={() => setExpandedChart(expandedChart === "search" ? null : "search")}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-extrabold text-text-primary">🔥 熱門搜尋關鍵字 TOP 10</h3>
                    <span className="text-xs text-text-tertiary">
                      {expandedChart === "search" ? "點擊縮小" : "點擊展開"}
                    </span>
                  </div>
                  {analytics.topKeywords.length === 0 ? (
                    <p className="text-sm text-text-tertiary text-center py-8">目前沒有搜尋紀錄</p>
                  ) : (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      {analytics.topKeywords.map((kw, i) => {
                        const maxCount = analytics.topKeywords[0]?.count || 1;
                        const pct = Math.max(Math.round((kw.count / maxCount) * 100), 5);
                        return (
                          <div key={kw.keyword} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-text-tertiary w-5 text-right">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-text-primary">{kw.keyword}</span>
                                <span className="text-xs font-medium text-text-tertiary">{kw.count} 次</span>
                              </div>
                              <div className="h-3 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 背景遮罩 */}
                {expandedChart && (
                  <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setExpandedChart(null)}
                  />
                )}

                {/* 各科系平均停留時間 */}
                <div
                  className={`bg-surface border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                    expandedChart === "dwell"
                      ? "fixed inset-x-[10%] top-24 bottom-12 z-50 overflow-y-auto shadow-2xl"
                      : "mx-auto"
                  }`}
                  style={expandedChart !== "dwell" ? { width: "min(80%, 100%)" } : undefined}
                  onClick={() => setExpandedChart(expandedChart === "dwell" ? null : "dwell")}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-extrabold text-text-primary">⏱️ 各類別平均觀看時間</h3>
                    <span className="text-xs text-text-tertiary">
                      {expandedChart === "dwell" ? "點擊縮小" : "點擊展開"}
                    </span>
                  </div>
                  {analytics.categoryDwell.length === 0 ? (
                    <p className="text-sm text-text-tertiary text-center py-8">目前沒有觀看紀錄</p>
                  ) : (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      {analytics.categoryDwell.map((cat, i) => {
                        const maxDuration = analytics.categoryDwell[0]?.avgDuration || 1;
                        const pct = Math.max(Math.round((cat.avgDuration / maxDuration) * 100), 5);
                        return (
                          <div key={cat.category} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-text-tertiary w-5 text-right">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-text-primary">{cat.category}</span>
                                <span className="text-xs font-medium text-text-tertiary">
                                  平均 {cat.avgDuration} 秒 ・ {cat.viewCount} 次觀看
                                </span>
                              </div>
                              <div className="h-3 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
