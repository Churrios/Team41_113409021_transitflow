import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { postId, duration } = await req.json();

    if (!postId || typeof duration !== "number") {
      return NextResponse.json({ error: "參數錯誤" }, { status: 400 });
    }

    // 注意事項 7：拒絕 3 秒以下的誤觸
    if (duration < 3) {
      return NextResponse.json({ error: "停留時間過短，不予記錄" }, { status: 200 });
    }

    // 注意事項 6：有效秒數上限 (由前端圈數機制控制，但後端也做上限 1800 秒 = 30 分鐘)
    const clampedDuration = Math.min(duration, 1800);

    await prisma.pageViewLog.create({
      data: {
        postId,
        duration: clampedDuration,
        userId: session?.user?.id || null,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Dwell log error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
