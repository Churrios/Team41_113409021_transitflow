import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  // 查詢排行榜前 20 名使用者
  const topUsers = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      points: true,
      role: true,
      university: true,
      image: true,
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-4 tracking-tight">
            🏆 財富排行榜
          </h1>
          <p className="text-lg text-text-secondary">
            看看誰是平台上最會分享與學習的知識富豪！
          </p>
        </div>

        {topUsers.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-6">👑</div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">目前尚無排名</h2>
            <p className="text-text-secondary text-xl mb-8">
              搶先做第一人！趕快上傳筆記，將你的名字刻在榜首。
            </p>
            <Link
              href="/upload"
              className="inline-flex px-8 py-3 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              立刻上傳筆記賺積分
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="divide-y divide-border">
              {topUsers.map((user, index) => {
                const isTop3 = index < 3;
                return (
                  <div key={user.id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-6">
                      {/* Rank Badge */}
                      <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                        index === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shadow-amber-500/30" :
                        index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-400/30" :
                        index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg shadow-orange-400/30" :
                        "bg-background border border-border text-text-tertiary"
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex items-center gap-4">
                        <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isTop3 ? "gradient-bg shadow-sm" : "bg-background border border-border"}`}>
                          <span className={`font-bold text-lg ${isTop3 ? "text-white" : "text-text-secondary"}`}>
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-text-primary text-lg line-clamp-1">
                              {user.name}
                            </h3>
                            {user.role === "VIP" ? (
                              <span className="shrink-0 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-orange-500 border border-orange-500/20">
                                VIP 會員
                              </span>
                            ) : (
                              <span className="shrink-0 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                一般會員
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-tertiary line-clamp-1">
                            {user.university || "未填寫學校"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="sm:text-right flex sm:block items-end gap-2 pl-18 sm:pl-0">
                      <div className="font-extrabold text-3xl text-primary font-mono tracking-tight">
                        {user.points}
                      </div>
                      <div className="text-sm text-text-tertiary font-sans font-medium mb-1">點積分</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Slogan behind the leaderboard */}
            <div className="p-10 text-center bg-gradient-to-b from-transparent to-background/80 border-t border-border mt-auto">
              <h3 className="text-2xl font-extrabold text-text-primary mb-3">搶先做第一人！</h3>
              <p className="text-text-secondary mb-8">立刻上傳優質筆記，賺取打賞成為知識首富</p>
              <Link
                href="/upload"
                className="inline-flex px-10 py-4 rounded-full text-sm font-bold text-white bg-text-primary hover:bg-black transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] gap-2 items-center"
              >
                <span>前往上傳</span>
                <span>🚀</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
