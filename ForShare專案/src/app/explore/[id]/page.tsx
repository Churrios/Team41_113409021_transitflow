import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientPostViewer from "@/components/ClientPostViewer";

export default async function NoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const postId = params.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { name: true, image: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 取得迴響統計
  const stats = await prisma.transactionRecord.aggregate({
    where: { relatedPostId: postId, type: "EARN_TIP" },
    _sum: { amount: true },
    _count: { id: true },
  });

  const totalTips = stats._sum.amount || 0;
  const tipCount = stats._count.id || 0;

  // 將資料轉交給 Client Component 進行處理與攔截
  return (
    <ClientPostViewer 
      post={post} 
      currentUserId={session?.user?.id} 
      totalTips={totalTips}
      tipCount={tipCount}
    />
  );
}
