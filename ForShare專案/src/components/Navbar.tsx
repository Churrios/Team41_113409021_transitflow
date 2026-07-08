"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = () => setProfileMenuOpen(false);
    if (profileMenuOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [profileMenuOpen]);

  const isLoggedIn = status === "authenticated" && session?.user;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled
          ? "bg-surface/80 backdrop-blur-xl shadow-md border-b border-border"
          : "bg-transparent"
      }`}
      style={{ transitionDuration: "var(--transition-base)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <span className="text-xl font-bold text-text-primary">
              For<span className="gradient-text">Share</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "探索知識", href: "/explore" },
              { label: "排行榜", href: "/leaderboard" },
              { label: "積分商城", href: "/shop" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.slice(1)}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary/5 transition-all"
                style={{ transitionDuration: "var(--transition-fast)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/upload"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                  <span>📤</span>
                  <span>上傳筆記</span>
                </Link>
                <div className="relative">
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                  id="nav-user-menu"
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-border hover:border-primary/30 transition-all hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary leading-tight">{session.user.name}</p>
                    <p className="text-xs text-accent font-semibold leading-tight">
                      💰 {(session.user as { points?: number }).points ?? 0} 點
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-text-tertiary transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 overflow-hidden">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
                    >
                      📊 個人中心
                    </Link>
                    <Link
                      href="/upload"
                      className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
                    >
                      📤 上傳筆記
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                    >
                      🚪 登出
                    </button>
                  </div>
                )}
              </div>
            </div>
            ) : (
              <>
                <Link
                  href="/login"
                  id="nav-login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  id="nav-register"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ transitionDuration: "var(--transition-fast)" }}
                >
                  免費加入
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all ${
            mobileMenuOpen ? "max-h-[400px] pb-4" : "max-h-0"
          }`}
          style={{ transitionDuration: "var(--transition-base)" }}
        >
          <div className="flex flex-col gap-1 pt-2">
            {[
              { label: "探索知識", href: "/explore" },
              { label: "排行榜", href: "/leaderboard" },
              { label: "積分商城", href: "/shop" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 個人中心
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-left text-error hover:bg-error/5 transition-colors"
                >
                  🚪 登出
                </button>
              </>
            ) : (
              <div className="flex gap-3 mt-3 px-4">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-center border border-border text-text-secondary hover:text-text-primary hover:border-primary/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold text-center text-white bg-primary hover:bg-primary-dark transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  免費加入
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
