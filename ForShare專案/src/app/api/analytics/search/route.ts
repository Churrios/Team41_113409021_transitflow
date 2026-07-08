import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 注意事項 4：必須綁定使用者身分才開放查詢紀錄
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入才能使用搜尋功能" }, { status: 401 });
    }

    const { keyword } = await req.json();

    // 注意事項 3：少於 2 個字元或純特殊符號不予記錄
    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "無效的搜尋字詞" }, { status: 400 });
    }

    const trimmed = keyword.trim();

    if (trimmed.length < 2) {
      return NextResponse.json({ error: "搜尋字詞至少需 2 個字元" }, { status: 400 });
    }

    // 檢查是否為純特殊符號（排除所有中英文字母、數字）
    const hasValidChar = /[\u4e00-\u9fff\u3400-\u4dbfa-zA-Z0-9]/.test(trimmed);
    if (!hasValidChar) {
      return NextResponse.json({ error: "搜尋字詞不能為純特殊符號" }, { status: 400 });
    }

    await prisma.searchLog.create({
      data: {
        keyword: trimmed,
        userId: session.user.id,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Search log error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
