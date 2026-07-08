"use client";

import { useState } from "react";
import Link from "next/link";
import ExploreSearchBar from "@/components/ExploreSearchBar";

interface PostData {
  id: string;
  title: string;
  content: string;
  isPaid: boolean;
  category: string;
  createdAt: string;
  author: { name: string | null; image: string | null };
}

export default function ExploreClient({ posts }: { posts: PostData[] }) {
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>(posts);
  const [searchActive, setSearchActive] = useState(false);

  const handleSearch = (keyword: string) => {
    setSearchActive(true);
    const lower = keyword.toLowerCase();
    const results = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.content.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
    setFilteredPosts(results);
  };

  const displayPosts = searchActive ? filteredPosts : posts;

  return (
    <>
      <ExploreSearchBar onSearch={handleSearch} />

      {searchActive && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            找到 <span className="font-bold text-primary">{filteredPosts.length}</span> 筆相關筆記
          </p>
          <button
            onClick={() => { setSearchActive(false); setFilteredPosts(posts); }}
            className="text-xs font-medium text-text-tertiary hover:text-primary transition-colors"
          >
            ✕ 清除搜尋
          </button>
        </div>
      )}

      {displayPosts.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">{searchActive ? "🔍" : "📭"}</p>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {searchActive ? "找不到相關筆記" : "目前還沒有人分享筆記"}
          </h3>
          <p className="text-text-secondary mb-6">
            {searchActive ? "試試換個關鍵字？" : "成為第一個分享知識並獲得積分的人吧！"}
          </p>
          {!searchActive && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              立即上傳
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayPosts.map((post) => (
            <Link
              href={`/explore/${post.id}`}
              key={post.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 relative p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-1 rounded-lg bg-white/50 backdrop-blur-sm text-xs font-semibold border ${
                    post.isPaid ? "text-primary border-primary/20" : "text-success border-success/20"
                  }`}>
                    {post.isPaid ? "💎 有償分享" : "🌱 無償分享"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <p className="text-sm text-text-secondary line-clamp-3">
                  {post.content || "這份筆記沒有提供詳細說明。"}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">
                        {post.author.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-text-secondary truncate max-w-[100px]">
                      {post.author.name}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
