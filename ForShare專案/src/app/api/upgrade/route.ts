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

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    if (user.role === "VIP") {
      return NextResponse.json({ error: "您已經是 Share 會員了！" }, { status: 400 });
    }

    // 模擬綠界金流：升級會員
    await prisma.user.update({
      where: { id: userId },
      data: { role: "VIP" }
    });

    // 發送信件通知
    await prisma.inboxMessage.create({
      data: {
        userId,
        title: "👑 恭喜升級為 Share 會員！",
        content: "感謝您的訂閱！您現在已解鎖無上限兌換點數額度，並且可以使用多關鍵字搜尋等進階功能。在知識共享的路上，ForShare 與您並肩前行！"
      }
    });

    return NextResponse.json({ message: "升級成功！" }, { status: 200 });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
