import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 取得最新用戶資料
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { posts: true, comments: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // 檢查每日登入獎勵
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastLoginDate = new Date(0);
  if (user.lastLoginAt) {
    lastLoginDate = new Date(user.lastLoginAt);
    lastLoginDate.setHours(0, 0, 0, 0);
  }

  if (lastLoginDate.getTime() < today.getTime()) {
    // 跨日登入，給予獎勵
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { 
          points: { increment: 1 },
          lastLoginAt: new Date()
        }
      });
      await tx.transactionRecord.create({
        data: {
          userId: user.id,
          type: "EARN_DAILY_LOGIN",
          amount: 1,
          description: "每日登入獎勵",
        }
      });
    });
    
    // 更新本地顯示數值
    user.points += 1;
  }

  // 取得最近的交易紀錄
  const recentTransactions = await prisma.transactionRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const statCards = [
    {
      label: "目前積分",
      value: user.points.toLocaleString(),
      icon: "💰",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "上傳筆記",
      value: user._count.posts.toString(),
      icon: "📝",
      color: "from-indigo-500 to-purple-500",
    },
    {
      label: "留言數量",
      value: user._count.comments.toString(),
      icon: "💬",
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "會員等級",
      value: user.role === "SHARE_VIP" ? "Share VIP" : user.role === "ADMIN" ? "管理員" : "免費版",
      icon: user.role === "SHARE_VIP" ? "👑" : "🎓",
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            嗨，{user.name} 👋
          </h1>
          <p className="text-text-secondary">
            歡迎回到 ForShare！這是你的個人中心。
          </p>
        </div>

        {/* Invite Code Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary mb-1">🔗 你的專屬邀請碼</p>
                {user.inviteRewardReceived && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success border border-success/20">
                    已獲得推廣獎勵
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                分享給朋友註冊，當朋友首次上傳筆記或打賞時，<strong className="text-primary">雙方皆可獲得 10 點積分！</strong>
                <br />
                <span className="text-text-tertiary">(每位邀請人限領取一次額外獎勵)</span>
              </p>
            </div>
            <code className="px-4 py-2 rounded-lg bg-surface border border-border text-primary font-mono font-bold text-sm tracking-wider">
              {user.inviteCode}
            </code>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-all hover:shadow-md"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg mb-3`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
              <p className="text-xs text-text-tertiary mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-surface border border-border">
            <h2 className="text-lg font-bold text-text-primary mb-4">快速操作</h2>
            <div className="space-y-3">
              <Link
                href="/upload"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  📤
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">上傳筆記</p>
                  <p className="text-xs text-text-tertiary">分享知識，獲取積分</p>
                </div>
              </Link>
              <Link
                href="/explore"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  🔍
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">探索知識</p>
                  <p className="text-xs text-text-tertiary">搜尋筆記與考古題</p>
                </div>
              </Link>
              <Link
                href="/shop"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-colors">
                  🎁
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">積分商城</p>
                  <p className="text-xs text-text-tertiary">兌換超商禮券</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border">
            <h2 className="text-lg font-bold text-text-primary mb-4">最近交易紀錄</h2>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm text-text-tertiary">還沒有交易紀錄</p>
                <p className="text-xs text-text-tertiary mt-1">上傳筆記或打賞他人來產生你的第一筆紀錄！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        tx.amount > 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      }`}>
                        {tx.amount > 0 ? "+" : "−"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{tx.description}</p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(tx.createdAt).toLocaleDateString("zh-TW")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      tx.amount > 0 ? "text-success" : "text-error"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount} 點
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
