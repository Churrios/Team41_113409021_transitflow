import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const messages = await prisma.inboxMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">📬 系統信箱</h1>
            <p className="text-text-secondary">您兌換的禮物與系統通知都會在這裡。</p>
          </div>
          <Link href="/shop" className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold hover:bg-background transition-colors shadow-sm">
            返回商城
          </Link>
        </div>

        {messages.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">信箱空空如也</h3>
            <p className="text-text-secondary mb-6">您目前沒有任何新訊息或禮物。</p>
            <Link href="/shop" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:bg-primary-dark transition-colors">
              去逛逛商城
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {!msg.isRead && (
                  <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-error animate-pulse" />
                )}
                
                <h3 className="text-lg font-bold text-text-primary mb-2 pr-6">
                  {msg.title}
                </h3>
                <div className="text-xs text-text-tertiary mb-4">
                  {new Date(msg.createdAt).toLocaleString("zh-TW")}
                </div>
                
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  {msg.content}
                </p>
                
                {msg.barcode && (
                  <div className="mt-4 p-6 bg-white border border-border/50 rounded-xl flex flex-col items-center justify-center gap-3 w-fit mx-auto shadow-inner">
                    <div className="text-sm font-bold text-slate-500 mb-1">請向店員出示此條碼</div>
                    {/* 使用開源的 bwip-js API 產生條碼圖片，完全免費且快速 */}
                    <img 
                      src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${msg.barcode}&scale=3&height=10&includetext`} 
                      alt="禮物條碼"
                      className="max-w-full h-auto mix-blend-multiply"
                    />
                    <div className="mt-2 px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600 font-bold tracking-widest">
                      序號: {msg.barcode}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
