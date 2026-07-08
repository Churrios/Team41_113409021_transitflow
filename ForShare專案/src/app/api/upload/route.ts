import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "未登入，請先登入後再上傳" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPaidStr = formData.get("isPaid") as string;
    const tagsStr = formData.get("tags") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return NextResponse.json({ error: "標題與檔案為必填項目" }, { status: 400 });
    }

    const isPaid = isPaidStr === "true";

    // 將檔案存入 public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 確保資料夾存在
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 產生唯一檔名，避免重複
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExt = path.extname(file.name);
    const filename = `note-${uniqueSuffix}${originalExt}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // 檔案的對外公開 URL (供前端下載或預覽)
    const fileUrl = `/uploads/${filename}`;

    // 使用 Transaction 確保寫入文章與給予獎勵同時成功
    const post = await prisma.$transaction(async (tx) => {
      // 1. 建立筆記文章
      const newPost = await tx.post.create({
        data: {
          title,
          content,
          isPaid,
          fileUrl,
          category: tagsStr || "未分類",
          authorId: session.user.id,
        },
      });

      // 檢查邀請獎勵 (實質互動防弊)
      const currentUser = await tx.user.findUnique({ where: { id: session.user.id } });
      if (currentUser && currentUser.invitedById && !currentUser.hasClaimedInviteReward) {
        // 給予當前使用者 10 點
        await tx.user.update({
          where: { id: currentUser.id },
          data: { points: { increment: 10 }, hasClaimedInviteReward: true }
        });
        await tx.transactionRecord.create({
          data: {
            userId: currentUser.id,
            type: "EARN_INVITE",
            amount: 10,
            description: "完成首次實質互動，獲得邀請獎勵"
          }
        });

        // 檢查邀請人是否領過
        const inviter = await tx.user.findUnique({ where: { id: currentUser.invitedById } });
        if (inviter && !inviter.inviteRewardReceived) {
          await tx.user.update({
            where: { id: inviter.id },
            data: { points: { increment: 10 }, inviteRewardReceived: true }
          });
          await tx.transactionRecord.create({
            data: {
              userId: inviter.id,
              type: "EARN_INVITE",
              amount: 10,
              description: `您邀請的朋友 ${currentUser.name} 已完成首次互動，獲得獎勵`
            }
          });
        }
      }

      return newPost;
    });

    return NextResponse.json(
      { message: "上傳成功", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
