import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "./components/Layout";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const CATEGORY_COLORS = {
  "ข่าวการเลือกตั้ง": "bg-blue-100 text-blue-700 ring-blue-200",
  "พูดคุยนโยบายผู้สมัคร": "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "ถามตอบเกี่ยวกับการเลือกตั้ง": "bg-amber-100 text-amber-700 ring-amber-200",
  "ข้อเสนอแนะพัฒนามหาวิทยาลัย": "bg-purple-100 text-purple-700 ring-purple-200",
  "แจ้งปัญหาระบบ": "bg-red-100 text-red-700 ring-red-200",
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const TRENDING_TOPICS = [
  { tag: "นโยบาย WiFi มหาวิทยาลัย", count: 24 },
  { tag: "ห้องสมุดเปิด 24 ชั่วโมง", count: 18 },
  { tag: "การเดินทางในมหาวิทยาลัย", count: 15 },
  { tag: "ค่าธรรมเนียมการศึกษา", count: 11 },
  { tag: "สวัสดิการนักศึกษา", count: 9 },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "เพิ่งโพสต์";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${days} วันที่แล้ว`;
}

function getAvatarColor(role) {
  return role === "admin"
    ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700";
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ทั้งหมด") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const res = await fetch(`${API_BASE}/community/posts?${params.toString()}`);
      if (!res.ok) throw new Error("โหลดกระทู้ไม่สำเร็จ");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPosts(), searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchPosts, searchQuery]);

  const handleCreatePost = async () => {
    if (!user || !token) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้างกระทู้");
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      alert("กรุณากรอกชื่อกระทู้และเนื้อหา");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim(), category: newCategory }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "สร้างกระทู้ไม่สำเร็จ");
      }
      setNewTitle("");
      setNewContent("");
      setNewCategory(CATEGORIES[0]);
      setShowCreateModal(false);
      fetchPosts();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !token) return;
    try {
      const res = await fetch(`${API_BASE}/community/posts/${postId}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) => p._id?.toString() === postId ? { ...p, likes: data.likes } : p)
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* ── Page Header ─────────────────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-200 shrink-0">
                💬
              </span>
              KU Vote Community
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm md:text-base leading-relaxed">
              พื้นที่สำหรับนักศึกษาพูดคุยเกี่ยวกับการเลือกตั้ง นโยบายผู้สมัคร
              และไอเดียพัฒนามหาวิทยาลัย
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            + สร้างกระทู้
          </button>
        </div>

        {/* ── Search Bar ──────────────────────────────────── */}
        <div className="relative mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="ค้นหากระทู้ตามชื่อ เนื้อหา หรือผู้โพสต์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-slate-700 placeholder:text-slate-400 transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* ── Main Layout: Feed + Sidebar ─────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Post Feed ─────── */}
          <div className="flex-1 min-w-0 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 text-sm">กำลังโหลดกระทู้...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-red-100">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-600 font-medium">{error}</p>
                <button onClick={fetchPosts} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">ลองใหม่</button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-slate-600 font-medium mb-1">ยังไม่มีกระทู้ เป็นคนแรกที่สร้างกระทู้!</p>
                <p className="text-slate-400 text-sm">ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  onLike={handleLike}
                />
              ))
            )}
          </div>

          {/* ── Right Sidebar ─── */}
          <aside className="lg:w-72 xl:w-80 space-y-4 shrink-0">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <span className="text-base">📂</span> หมวดหมู่
              </h3>
              <div className="space-y-0.5">
                <CategoryButton
                  label="ทั้งหมด"
                  active={selectedCategory === "ทั้งหมด"}
                  onClick={() => setSelectedCategory("ทั้งหมด")}
                />
                {CATEGORIES.map((cat) => (
                  <CategoryButton
                    key={cat}
                    label={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <span className="text-base">🔥</span> กำลังฮิต
              </h3>
              <div className="space-y-1">
                {TRENDING_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(topic.tag)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors group flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-600 group-hover:text-emerald-700 font-medium">
                      # {topic.tag}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      {topic.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Rules */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-5">
              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <span className="text-base">📜</span> กติกาชุมชน
              </h3>
              <ul className="text-xs text-emerald-700 space-y-2">
                {[
                  "พูดคุยด้วยความสุภาพและเคารพกัน",
                  "ห้ามโพสต์ข้อมูลเท็จหรือข่าวลือ",
                  "ห้ามโฆษณา สแปม หรือเนื้อหาไม่เหมาะสม",
                  "เคารพความคิดเห็นที่แตกต่าง",
                  "กดรายงานเนื้อหาที่ผิดกติกา",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                📊 สถิติชุมชน
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-black text-emerald-700">
                    {posts.length}
                  </div>
                  <div className="text-xs text-emerald-600 mt-0.5">กระทู้</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-black text-blue-700">
                    {posts.reduce((s, p) => s + (p.commentCount || 0), 0)}
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">ความคิดเห็น</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Create Post Modal ──────────────────────────────── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-emerald-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  สร้างกระทู้ใหม่
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {user && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(
                      user.role
                    )}`}
                  >
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      {user.name || user.email.split("@")[0]}
                    </div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  ชื่อกระทู้ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ตั้งชื่อกระทู้ที่น่าสนใจ..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={150}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700 placeholder:text-slate-400"
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {newTitle.length}/150
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  เนื้อหา <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="เขียนเนื้อหากระทู้..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
              >
                {isSubmitting ? "กำลังโพสต์..." : "สร้างกระทู้"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ── Sub-components ────────────────────────────────────────────

function CategoryButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-200"
          : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
      }`}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

function PostCard({ post, user, onLike }) {
  const id = post._id?.toString();
  const isLiked = user && post.likes?.includes(user.email);
  const dateStr = post.createdAt || post.timestamp;

  return (
    <Link to={`/community/${id}`} className="block group">
      <div
        className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
          post.isPinned
            ? "border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white"
            : "border-slate-100 hover:border-slate-200"
        }`}
      >
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {post.isPinned && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full ring-1 ring-emerald-200">
                📌 ปักหมุด
              </span>
            )}
            {post.isAdminAnnouncement && (
              <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full ring-1 ring-blue-200">
                📢 ประกาศ
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${
                CATEGORY_COLORS[post.category] || "bg-slate-100 text-slate-600"
              }`}
            >
              {post.category}
            </span>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
            {timeAgo(dateStr)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2 leading-snug">
          {post.title}
        </h2>

        {/* Content preview */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {post.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(
                post.authorRole
              )}`}
            >
              {post.author.charAt(0)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700">
                {post.author}
              </span>
              {post.authorRole === "admin" && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => onLike(id, e)}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-all px-2.5 py-1 rounded-lg ${
                isLiked
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
              }`}
              title={user ? "ถูกใจ" : "เข้าสู่ระบบเพื่อกดไลค์"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                />
              </svg>
              {post.likes?.length || 0}
            </button>

            <span className="flex items-center gap-1.5 text-sm text-slate-400 px-2.5 py-1 rounded-lg bg-slate-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              {post.commentCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
