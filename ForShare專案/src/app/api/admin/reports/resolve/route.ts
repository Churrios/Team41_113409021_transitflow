import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    const { reportId, action } = await req.json();

    // action: "resolve_hide" | "resolve_ban" | "dismiss"
    const allowedActions = ["resolve_hide", "resolve_ban", "dismiss"];
    if (!reportId || !action || !allowedActions.includes(action)) {
      return NextResponse.json({ error: "無效的操作參數" }, { status: 400 });
    }

    // 先取得這筆檢舉的完整資訊
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { post: true },
    });

    if (!report) {
      return NextResponse.json({ error: "找不到此檢舉單" }, { status: 404 });
    }

    if (report.status !== "PENDING") {
      return NextResponse.json({ error: "此檢舉已被處理過" }, { status: 409 });
    }

    // ================================================================
    // 注意事項 2, 3, 4, 8：使用 prisma.$transaction 封包式執行
    // 所有動作以最低原子單位寫入，一次打包，要成功一起成功
    // ================================================================

    if (action === "dismiss") {
      // ---- 駁回檢舉 ----
      // 注意事項 3：駁回不刪除，標記為 DISMISSED 永久保留（供信用分析）
      await prisma.$transaction([
        // 原子操作 1：將此檢舉單標記為 DISMISSED
        prisma.report.update({
          where: { id: reportId },
          data: { status: "DISMISSED" },
        }),
      ]);

      return NextResponse.json({ message: "已駁回此檢舉，紀錄已保留供信用分析。" }, { status: 200 });
    }

    if (action === "resolve_hide") {
      // ---- 下架貼文（不停權作者）----
      await prisma.$transaction([
        // 原子操作 1：隱藏該貼文（注意事項 8：前台 explore 已有 status=ACTIVE 過濾）
        prisma.post.update({
          where: { id: report.postId },
          data: { status: "HIDDEN" },
        }),
        // 原子操作 2：將此檢舉標記為已解決
        prisma.report.update({
          where: { id: reportId },
          data: { status: "RESOLVED" },
        }),
        // 原子操作 3：將同一篇文章的所有其他 PENDING 檢舉也一併標記為已解決
        prisma.report.updateMany({
          where: {
            postId: report.postId,
            status: "PENDING",
            id: { not: reportId },
          },
          data: { status: "RESOLVED" },
        }),
      ]);

      return NextResponse.json({ message: "貼文已下架，所有相關檢舉已標記為已解決。" }, { status: 200 });
    }

    if (action === "resolve_ban") {
      // ---- 下架貼文 + 停權作者 7 天 ----
      // 注意事項 4：以 UTC 伺服器時間精準計算 7 天後的解鎖時間
      const banUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        // 原子操作 1：隱藏該貼文
        prisma.post.update({
          where: { id: report.postId },
          data: { status: "HIDDEN" },
        }),
        // 原子操作 2：停權該貼文作者 7 天
        prisma.user.update({
          where: { id: report.post.authorId },
          data: { bannedUntil: banUntil },
        }),
        // 原子操作 3：將此檢舉標記為已解決
        prisma.report.update({
          where: { id: reportId },
          data: { status: "RESOLVED" },
        }),
        // 原子操作 4：將同一篇文章的所有其他 PENDING 檢舉也一併標記為已解決
        prisma.report.updateMany({
          where: {
            postId: report.postId,
            status: "PENDING",
            id: { not: reportId },
          },
          data: { status: "RESOLVED" },
        }),
        // 原子操作 5：發送信箱通知給被停權的作者
        prisma.inboxMessage.create({
          data: {
            userId: report.post.authorId,
            title: "⚠️ 帳號停權通知",
            content: `您的筆記「${report.post.title}」因違反社群規範已被管理員下架，您的帳號已被停權至 ${banUntil.toLocaleDateString("zh-TW")}。如有疑問請聯繫管理團隊。`,
          },
        }),
      ]);

      return NextResponse.json({
        message: `貼文已下架，作者已被停權至 ${banUntil.toLocaleDateString("zh-TW")}。`,
      }, { status: 200 });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (error) {
    console.error("Admin resolve error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
