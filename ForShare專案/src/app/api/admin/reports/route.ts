import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 注意事項 1：絕對權限隔離
    if (!session?.user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足，僅限管理員操作" }, { status: 403 });
    }

    // 注意事項 6：限制最多 100 筆，優先處理最新的檢舉
    const pendingReports = await prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        post: {
          select: { id: true, title: true, content: true, authorId: true, author: { select: { name: true, email: true } } },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 為每一筆檢舉計算「檢舉人歷史信用」
    const enrichedReports = await Promise.all(
      pendingReports.map(async (report: any) => {
        const reporterHistory = await prisma.report.groupBy({
          by: ["status"],
          where: { reporterId: report.reporterId },
          _count: { status: true },
        });

        let totalReports = 0;
        let dismissedCount = 0;
        let resolvedCount = 0;

        for (const entry of reporterHistory) {
          totalReports += entry._count.status;
          if (entry.status === "DISMISSED") dismissedCount = entry._count.status;
          if (entry.status === "RESOLVED") resolvedCount = entry._count.status;
        }

        const dismissRate = totalReports > 0 ? Math.round((dismissedCount / totalReports) * 100) : 0;

        return {
          ...report,
          reporterCredit: {
            totalReports,
            resolvedCount,
            dismissedCount,
            dismissRate,
            isSuspicious: totalReports >= 5 && dismissRate > 60,
          },
        };
      })
    );

    return NextResponse.json({ reports: enrichedReports }, { status: 200 });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
