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

    const { postId, amount } = await req.json();

    if (!postId || !amount || amount < 1 || amount > 5) {
      return NextResponse.json({ error: "無效的打賞點數或文章" }, { status: 400 });
    }

    // 取得該篇文章與作者資訊
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: "找不到該筆記" }, { status: 404 });
    }

    // 若自己打賞自己，阻止此行為 (也可放寬，但通常不合理)
    if (post.authorId === session.user.id) {
      return NextResponse.json({ message: "不用打賞給自己" }, { status: 200 });
    }

    // 檢查使用者積分是否足夠
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!currentUser || currentUser.points < amount) {
      return NextResponse.json({ error: "積分餘額不足" }, { status: 403 });
    }

    // 執行交易
    await prisma.$transaction(async (tx) => {
      // 扣除給予者點數
      await tx.user.update({
        where: { id: session.user.id },
        data: { points: { decrement: amount } }
      });

      // 增加作者點數
      await tx.user.update({
        where: { id: post.authorId },
        data: { points: { increment: amount } }
      });

      // 紀錄雙方交易
      await tx.transactionRecord.create({
        data: {
          userId: session.user.id,
          type: "SPEND_TIP",
          amount: -amount,
          description: `打賞筆記：${post.title}`,
          relatedPostId: post.id,
        }
      });

      await tx.transactionRecord.create({
        data: {
          userId: post.authorId,
          type: "EARN_TIP",
          amount: amount,
          description: `收到筆記打賞：${post.title}`,
          relatedPostId: post.id,
        }
      });

      // 檢查邀請獎勵 (實質互動防弊)
      if (currentUser.invitedById && !currentUser.hasClaimedInviteReward) {
        // 1. 給予當前使用者 10 點
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

        // 2. 檢查邀請人是否領過
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
    });

    return NextResponse.json({ message: "打賞成功！" }, { status: 200 });

  } catch (error) {
    console.error("Tip error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
