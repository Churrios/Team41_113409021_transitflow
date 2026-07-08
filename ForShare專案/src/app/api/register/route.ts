import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, university, inviteCode } = await req.json();

    // 驗證必填欄位
    if (!name || !email || !password || !university) {
      return NextResponse.json(
        { error: "請填寫所有必填欄位" },
        { status: 400 }
      );
    }

    // 密碼長度檢查
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密碼至少需要 6 個字元" },
        { status: 400 }
      );
    }

    // 檢查 Email 是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "此 Email 已被註冊" },
        { status: 409 }
      );
    }

    // 雜湊密碼
    const hashedPassword = await hash(password, 12);

    // 查找邀請人（如有輸入邀請碼）
    let inviterId: string | null = null;
    if (inviteCode) {
      const inviter = await prisma.user.findUnique({
        where: { inviteCode },
      });
      if (inviter) {
        inviterId = inviter.id;
      }
    }

    // 建立使用者（使用交易確保一致性）
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          university,
          invitedById: inviterId,
          points: 10, // 新用戶基本註冊獎勵 10 點
        },
      });

      // 紀錄新人獎勵交易
      await tx.transactionRecord.create({
        data: {
          userId: newUser.id,
          type: "EARN_REGISTER",
          amount: 10,
          description: "新用戶註冊獎勵",
        },
      });

      // 注意：邀請的額外 10 點獎勵將延後至「實質互動」後再發放，避免免洗帳號
      return newUser;
    });

    return NextResponse.json(
      {
        message: "註冊成功！",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
