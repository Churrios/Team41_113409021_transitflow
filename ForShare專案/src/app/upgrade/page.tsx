"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpgradePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const role = (session?.user as any)?.role || "FREE";

  const handleUpgrade = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    // 模擬綠界金流跳轉等待時間
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetch("/api/upgrade", { method: "POST" });
      if (res.ok) {
        setSuccess(true);
        update(); // 重新獲取 session 以更新 role
        setTimeout(() => {
          router.push("/shop");
        }, 2000);
      } else {
        alert("升級失敗，請稍後再試");
      }
    } catch (err) {
      alert("網路錯誤");
    } finally {
      setIsProcessing(false);
    }
  };

  if (role === "VIP" && !success) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background px-4">
        <div className="text-center bg-surface p-12 rounded-3xl shadow-lg border border-border">
          <div className="text-6xl mb-6">💎</div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">您已經是 Share 尊榮會員！</h1>
          <p className="text-text-secondary mb-8">感謝您的支持，您目前享有所有進階功能。</p>
          <Link href="/shop" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors shadow-md">
            前往積分商城
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {success ? (
          <div className="bg-surface border border-border rounded-3xl p-16 text-center shadow-xl animate-fade-in-up">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-3xl font-extrabold text-text-primary mb-4">升級成功！</h1>
            <p className="text-xl text-text-secondary mb-8">
              歡迎加入 Share 會員，您現在可以無限制兌換商品卡了。
            </p>
            <div className="text-text-tertiary">正在為您跳轉至商城...</div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* 介紹區塊 */}
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-6 leading-tight">
                解鎖無盡知識 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  成為 Share 會員
                </span>
              </h1>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                別讓辛苦累積的積分卡在帳戶裡！只需要不到一天的餐費，就能打破提領限制，享有無限兌換權限與進階搜尋功能。
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success text-sm font-bold">✓</div>
                  <span className="text-text-primary font-medium">解鎖積分商城兌換「無上限」</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success text-sm font-bold">✓</div>
                  <span className="text-text-primary font-medium">多關鍵字進階搜尋 (精準命中)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success text-sm font-bold">✓</div>
                  <span className="text-text-primary font-medium">專屬尊榮 VIP 徽章顯示</span>
                </li>
              </ul>
            </div>

            {/* 付款區塊 */}
            <div className="w-full md:w-[400px] shrink-0">
              <div className="bg-surface rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  推薦
                </div>
                
                <h3 className="text-xl font-bold text-text-primary mb-2">終身買斷制</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-text-primary">NT$ 150</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-background rounded-xl border border-border/50 text-sm text-text-secondary text-center">
                    <div className="mb-2">支援綠界科技 ECPay 支付</div>
                    <div className="flex justify-center gap-2 text-xl opacity-70">
                      💳 📱 🏦
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>處理付款中...</span>
                    </>
                  ) : (
                    "立即支付 NT$ 150"
                  )}
                </button>
                <p className="text-center text-xs text-text-tertiary mt-4">
                  點擊支付即代表您同意本平台的服務條款與隱私權政策。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
