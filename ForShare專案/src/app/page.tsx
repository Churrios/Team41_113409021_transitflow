import Link from "next/link";

/* ── Icon components (inline SVG to avoid extra deps) ── */
function UploadIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function GiftIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

/* ── Feature card data ── */
const features = [
  {
    icon: <UploadIcon />,
    title: "上傳即獲利",
    desc: "分享你的筆記與考古題，立即獲得平台積分。知識不再沉睡在硬碟裡。",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: <SparklesIcon />,
    title: "有效迴響機制",
    desc: "讀者可以用積分打賞優質內容，讓真正有價值的筆記脫穎而出。",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <ShieldIcon />,
    title: "雙層過濾審核",
    desc: "系統 + 社群雙重把關，確保平台內容品質，杜絕低品質或侵權素材。",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <GiftIcon />,
    title: "積分兌換商城",
    desc: "累積的積分可兌換超商禮券、電子商品卡，讓你的努力獲得實質回報。",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: <ChartIcon />,
    title: "數據驅動營運",
    desc: "後台即時追蹤活躍度與趨勢，透過視覺化報表為營運決策提供依據。",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: <UsersIcon />,
    title: "社交裂變邀請",
    desc: "專屬邀請碼機制，邀請朋友加入雙方都獲得積分，讓平台有機成長。",
    color: "from-violet-500 to-fuchsia-500",
  },
];

/* ── How it works steps ── */
const steps = [
  { step: "01", title: "免費註冊", desc: "用 Email 快速建立帳號，或透過朋友的邀請碼加入獲取額外積分。" },
  { step: "02", title: "上傳分享", desc: "將你的筆記、考古題上傳至平台，系統自動套用結構化排版。" },
  { step: "03", title: "獲得迴響", desc: "其他同學閱讀後可用積分打賞你的內容，優質筆記獲得更多曝光。" },
  { step: "04", title: "兌換獎勵", desc: "將累積的積分兌換成超商禮券或電子商品卡，知識真的能變現！" },
];

/* ── Stats ── */
const stats = [
  { value: "10K+", label: "活躍學生" },
  { value: "50K+", label: "筆記資源" },
  { value: "各大專院校", label: "持續推廣中" },
  { value: "未知數", label: "好評率" },
];

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════
           HERO SECTION
      ═══════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28" id="hero">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-float" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[100px] animate-float delay-300" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              全新知識共享平台正式上線
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up delay-100 text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-text-primary mb-6">
            打破直屬藩籬
            <br />
            <span className="gradient-text">讓知識自由流動</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up delay-200 mx-auto max-w-2xl text-lg sm:text-xl text-text-secondary leading-relaxed mb-10">
            ForShare 是專為大學生打造的知識共享平台。上傳筆記與考古題賺取積分，
            透過「有效迴響」讓優質內容脫穎而出，並將積分兌換為實質獎勵。
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              id="hero-cta-register"
              className="px-8 py-4 rounded-full text-base font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              立即免費加入 →
            </Link>
            <Link
              href="/explore"
              id="hero-cta-explore"
              className="px-8 py-4 rounded-full text-base font-semibold text-text-primary bg-surface border border-border hover:border-primary/40 hover:bg-surface-elevated shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              探索知識庫
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="animate-slide-up delay-500 mt-16 mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-text-tertiary font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           FEATURES SECTION
      ═══════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-surface" id="features">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-4">
              核心功能
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
              為你量身打造的<span className="gradient-text">知識生態系</span>
            </h2>
            <p className="mx-auto max-w-2xl text-text-secondary text-lg">
              從上傳到變現，ForShare 為你搭建完整的知識價值鏈。
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                id={`feature-${i}`}
                className="group relative p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ transitionDuration: "var(--transition-base)" }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           HOW IT WORKS SECTION
      ═══════════════════════════════════ */}
      <section className="py-20 lg:py-28" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20 mb-4">
              簡單四步驟
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
              如何開始你的<span className="gradient-text">知識變現</span>之旅？
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} id={`step-${i}`} className="relative text-center group">
                {/* Connector line (hidden on last item) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/40 to-transparent" />
                )}
                {/* Step number */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-all"
                  style={{ transitionDuration: "var(--transition-base)" }}
                >
                  <span className="text-xl font-extrabold text-primary group-hover:text-white transition-colors">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           MEMBERSHIP COMPARISON
      ═══════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-surface" id="membership">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
              會員方案
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
              選擇適合你的<span className="gradient-text">方案</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all" id="plan-free">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">免費版</h3>
              <div className="text-4xl font-extrabold text-text-primary mb-1">
                $0 <span className="text-base font-medium text-text-tertiary">/ 月</span>
              </div>
              <p className="text-sm text-text-secondary mb-8">立即加入，開始你的共享之旅</p>
              <ul className="space-y-3 mb-8">
                {[
                  "單一關鍵字搜尋",
                  "每日留言上限 5 則",
                  "基礎積分兌換",
                  "上傳筆記獲取積分",
                  "社群投票參與",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 rounded-full text-center text-sm font-semibold border border-border text-text-primary hover:bg-surface-elevated transition-colors"
              >
                免費註冊
              </Link>
            </div>

            {/* Share VIP Plan */}
            <div className="relative p-8 rounded-2xl bg-background border-2 border-primary shadow-xl shadow-primary/10" id="plan-vip">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white bg-primary">
                推薦方案
              </div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Share 會員</h3>
              <div className="text-4xl font-extrabold text-text-primary mb-1">
                $99 <span className="text-base font-medium text-text-tertiary">/ 月</span>
              </div>
              <p className="text-sm text-text-secondary mb-8">解鎖所有功能，極大化你的收益</p>
              <ul className="space-y-3 mb-8">
                {[
                  "多關鍵字組合搜尋",
                  "無限制留言討論",
                  "無上限積分兌換",
                  "上傳筆記獲取雙倍積分",
                  "專屬 VIP 徽章",
                  "優先客服支援",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 rounded-full text-center text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                升級 Share 會員
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           FINAL CTA SECTION
      ═══════════════════════════════════ */}
      <section className="py-20 lg:py-28" id="final-cta">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="relative p-12 sm:p-16 rounded-3xl gradient-bg overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                準備好讓知識變現了嗎？
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                加入數千名大學生的行列，把你的筆記轉化為實質獎勵。
              </p>
              <Link
                href="/register"
                id="final-cta-button"
                className="inline-flex px-8 py-4 rounded-full text-base font-bold text-primary bg-white hover:bg-gray-100 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                立即免費加入 ForShare
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
