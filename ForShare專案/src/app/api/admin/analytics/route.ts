import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 注意事項 1：絕對權限隔離
    if (!session?.user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足，僅限管理員操作" }, { status: 403 });
    }

    // 注意事項 5：支援 5、10、30 天的時間範圍
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const allowedDays = [5, 10, 30];
    const days = allowedDays.includes(Number(daysParam)) ? Number(daysParam) : 30;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ====== 熱門搜尋關鍵字排行 ======
    const searchLogs = await prisma.searchLog.findMany({
      where: { createdAt: { gte: since } },
      select: { keyword: true },
    });

    // 手動分組統計（SQLite 不支援 groupBy + orderBy count）
    const keywordMap: Record<string, number> = {};
    for (const log of searchLogs) {
      const kw = log.keyword.toLowerCase();
      keywordMap[kw] = (keywordMap[kw] || 0) + 1;
    }

    const topKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // ====== 筆記平均停留時間（按分類）======
    const pageViewLogs = await prisma.pageViewLog.findMany({
      where: { createdAt: { gte: since } },
      include: {
        post: { select: { category: true, title: true } },
      },
    });

    const categoryMap: Record<string, { totalDuration: number; count: number }> = {};
    for (const log of pageViewLogs) {
      const cat = log.post.category || "未分類";
      if (!categoryMap[cat]) categoryMap[cat] = { totalDuration: 0, count: 0 };
      categoryMap[cat].totalDuration += log.duration;
      categoryMap[cat].count += 1;
    }

    const categoryDwell = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        avgDuration: Math.round(data.totalDuration / data.count),
        viewCount: data.count,
      }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);

    // ====== 平台概覽數據 ======
    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count({ where: { status: "ACTIVE" } });
    const totalSearches = searchLogs.length;
    const totalPageViews = pageViewLogs.length;
    const pendingReports = await prisma.report.count({ where: { status: "PENDING" } });

    return NextResponse.json({
      days,
      overview: {
        totalUsers,
        totalPosts,
        totalSearches,
        totalPageViews,
        pendingReports,
      },
      topKeywords,
      categoryDwell,
    }, { status: 200 });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
