import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { postId, reason, customReason } = await req.json();

    if (!postId || !reason) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    const allowedReasons = ["版權侵害", "內容農場/無意義內容", "其他"];
    if (!allowedReasons.includes(reason)) {
      return NextResponse.json({ error: "無效的檢舉理由" }, { status: 400 });
    }

    // 注意事項 8：「其他」必須附帶自訂理由，且至少 5 個字
    if (reason === "其他") {
      if (!customReason || typeof customReason !== "string" || customReason.trim().length < 5) {
        return NextResponse.json({ error: "「其他」理由至少需要填寫 5 個字以上的說明" }, { status: 400 });
      }
    }

    // 組合最終寫入資料庫的理由
    const finalReason = reason === "其他"
      ? `其他：${customReason.trim()}`
      : reason;

    // ========== 注意事項 9：有效舉報偵測 ==========

    // 9-a. 同篇重複檢舉阻擋
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        postId,
      }
    });

    if (existingReport) {
      return NextResponse.json({ error: "您已經檢舉過此篇筆記，請勿重複提交" }, { status: 409 });
    }

    // 9-b. 不允許檢舉自己的文章
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "找不到此篇筆記" }, { status: 404 });
    }
    if (post.authorId === session.user.id) {
      return NextResponse.json({ error: "您不能檢舉自己的筆記" }, { status: 403 });
    }

    // 9-c. 檢舉信用分析：查看此使用者歷史被駁回 (DISMISSED) 的檢舉比例
    const reporterHistory = await prisma.report.groupBy({
      by: ["status"],
      where: { reporterId: session.user.id },
      _count: { status: true },
    });

    let totalReports = 0;
    let dismissedCount = 0;
    for (const entry of reporterHistory) {
      totalReports += entry._count.status;
      if (entry.status === "DISMISSED") {
        dismissedCount = entry._count.status;
      }
    }

    // 如果此人累積超過 5 次檢舉，且駁回率超過 60%，視為惡意檢舉者
    if (totalReports >= 5 && (dismissedCount / totalReports) > 0.6) {
      return NextResponse.json({
        error: "您過去的檢舉被駁回率過高，系統判定為無效舉報。若有問題請聯繫管理員。"
      }, { status: 403 });
    }

    // 9-d. 頻率控管：同一使用者 24 小時內最多檢舉 5 篇不同的文章
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReportCount = await prisma.report.count({
      where: {
        reporterId: session.user.id,
        createdAt: { gte: oneDayAgo },
      }
    });

    if (recentReportCount >= 5) {
      return NextResponse.json({
        error: "您在 24 小時內已檢舉達到上限 (5 篇)，請明天再試。"
      }, { status: 429 });
    }

    // ========== 寫入資料庫 ==========
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        postId,
        reason: finalReason,
        status: "PENDING",
      }
    });

    return NextResponse.json({ message: "檢舉已成功送出，管理員將盡快審核。" }, { status: 200 });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
