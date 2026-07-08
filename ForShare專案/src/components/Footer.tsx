import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" id="footer-logo">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xs">FS</span>
              </div>
              <span className="text-lg font-bold text-text-primary">
                For<span className="gradient-text">Share</span>
              </span>
            </Link>
            <p className="text-sm text-text-tertiary leading-relaxed">
              打破直屬藩籬，讓知識不再被埋沒。<br />
              每一份分享，都有價值。
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "平台功能",
              links: [
                { label: "探索知識", href: "/explore" },
                { label: "排行榜", href: "/leaderboard" },
                { label: "積分商城", href: "/shop" },
              ],
            },
            {
              title: "支援",
              links: [
                { label: "常見問題", href: "/faq" },
                { label: "使用條款", href: "/terms" },
                { label: "隱私政策", href: "/privacy" },
              ],
            },
            {
              title: "關於我們",
              links: [
                { label: "團隊介紹", href: "/about" },
                { label: "聯繫我們", href: "/contact" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-tertiary hover:text-primary transition-colors"
                      style={{ transitionDuration: "var(--transition-fast)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} ForShare. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-tertiary">
              Made with <span className="text-error">♥</span> for students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
