import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ExploreClient from "@/components/ExploreClient";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  // 取得最新發布的 20 筆筆記 (僅顯示 ACTIVE 狀態)
  const posts = await prisma.post.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: {
        select: { name: true, image: true },
      },
    },
  });

  // 序列化給 Client Component（DateTime 轉成 string）
  const serializedPosts = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">探索知識</h1>
            <p className="text-text-secondary">尋找你需要的考古題、上課筆記與重點整理。</p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>📤</span> 上傳我的筆記
          </Link>
        </div>

        {/* 搜尋框 + 筆記列表 (Client Component) */}
        <ExploreClient posts={serializedPosts} />
      </div>
    </div>
  );
}
