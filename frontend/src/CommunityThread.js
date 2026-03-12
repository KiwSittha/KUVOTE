import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "./components/Layout";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const CATEGORY_COLORS = {
  "ข่าวการเลือกตั้ง": "bg-blue-100 text-blue-700 ring-blue-200",
  "พูดคุยนโยบายผู้สมัคร": "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "ถามตอบเกี่ยวกับการเลือกตั้ง": "bg-amber-100 text-amber-700 ring-amber-200",
  "ข้อเสนอแนะพัฒนามหาวิทยาลัย":
    "bg-purple-100 text-purple-700 ring-purple-200",
  "แจ้งปัญหาระบบ": "bg-red-100 text-red-700 ring-red-200",
};

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

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAvatarColor(role) {
  return role === "admin"
    ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700";
}

export default function CommunityThread() {
  const { id } = useParams();
  const commentInputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Comment input
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id, author }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Report modal
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    const storedToken = localStorage.getItem("token") || "";
    setToken(storedToken);
  }, []);

  const fetchThread = useCallback(async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/community/posts/${id}`),
        fetch(`${API_BASE}/community/posts/${id}/comments`),
      ]);

      if (!postRes.ok) {
        throw new Error("post not found");
      }
      if (!commentsRes.ok) {
        throw new Error("failed to load comments");
      }

      const postData = await postRes.json();
      const commentsData = await commentsRes.json();

      setPost(postData);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      console.error("Failed to load thread:", err);
      setPost(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleLikePost = async () => {
    if (!user || !post || !token) {
      alert("กรุณาเข้าสู่ระบบก่อนกดไลค์");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/community/posts/${id}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("failed to like post");
      }

      const data = await response.json();
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: data.likes || [],
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to like post:", err);
      alert("ไม่สามารถกดไลค์ได้ในขณะนี้");
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }
    if (!token) {
      alert("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      return;
    }
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/community/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          parentId: replyingTo ? replyingTo.id : null,
        }),
      });

      if (!response.ok) {
        throw new Error("failed to submit comment");
      }

      const createdComment = await response.json();
      setComments((prev) => [...prev, createdComment]);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentCount: (prev.commentCount || 0) + 1,
            }
          : prev
      );

      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to submit comment:", err);
      alert("ไม่สามารถส่งความคิดเห็นได้ในขณะนี้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user || !token) {
      alert("กรุณาเข้าสู่ระบบก่อนกดไลค์");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/community/comments/${commentId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("failed to like comment");
      }

      const data = await response.json();
      setComments((prev) =>
        prev.map((c) =>
          c._id?.toString() === commentId
            ? {
                ...c,
                likes: data.likes || [],
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
      alert("ไม่สามารถกดไลค์ความคิดเห็นได้ในขณะนี้");
    }
  };

  const handleReport = (comment) => {
    setReportTarget(comment);
    setReportReason("");
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !reportTarget || !token) return;

    const reportId = reportTarget._id?.toString() || reportTarget.id;

    try {
      const response = await fetch(`${API_BASE}/community/comments/${reportId}/report`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });

      if (!response.ok) {
        throw new Error("failed to report comment");
      }

      setComments((prev) =>
        prev.map((c) =>
          c._id?.toString() === reportId
            ? {
                ...c,
                isReported: true,
              }
            : c
        )
      );
      setReportTarget(null);
      setReportReason("");
      alert("ขอบคุณ! รายงานได้ถูกส่งให้ทีม Admin พิจารณาแล้ว");
    } catch (err) {
      console.error("Failed to report comment:", err);
      alert("ไม่สามารถส่งรายงานได้ในขณะนี้");
    }
  };

  const handleReply = (comment) => {
    setReplyingTo({
      id: comment._id?.toString() || comment.id,
      author: comment.author,
    });
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId) =>
    comments.filter((c) => String(c.parentId) === String(parentId));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">กำลังโหลด...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            ไม่พบกระทู้นี้
          </h2>
          <p className="text-slate-500 mb-6">
            กระทู้อาจถูกลบหรือ URL ไม่ถูกต้อง
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            ← กลับไปหน้า Community
          </Link>
        </div>
      </Layout>
    );
  }

  const isLikedPost = user && (post.likes || []).includes(user.email);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* ── Breadcrumb ────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link
            to="/community"
            className="hover:text-emerald-600 font-medium transition-colors flex items-center gap-1"
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
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Community
          </Link>
          <span>/</span>
          <span className="text-slate-500 truncate max-w-xs">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Main Content ────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Thread Card */}
            <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Thread Header */}
              <div
                className={`px-6 pt-6 pb-5 ${
                  post.isPinned
                    ? "bg-gradient-to-r from-emerald-50 to-white"
                    : ""
                }`}
              >
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
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
                      CATEGORY_COLORS[post.category] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-4">
                  {post.title}
                </h1>

                {/* Author & Meta */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(
                      post.authorRole
                    )}`}
                  >
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">
                        {post.author}
                      </span>
                      {post.authorRole === "admin" && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span>{formatFullDate(post.createdAt || post.timestamp)}</span>
                      <span>·</span>
                      <span>{timeAgo(post.createdAt || post.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thread Body */}
              <div className="px-6 py-5 border-t border-slate-100">
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>

              {/* Thread Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <button
                  onClick={handleLikePost}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    isLikedPost
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={user ? "กดไลค์" : "เข้าสู่ระบบเพื่อกดไลค์"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isLikedPost ? "currentColor" : "none"}
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
                  {isLikedPost ? "ถูกใจแล้ว" : "ถูกใจ"} ({post.likes?.length || 0})
                </button>

                <button
                  onClick={() => commentInputRef.current?.focus()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
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
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  แสดงความคิดเห็น ({comments.length})
                </button>
              </div>
            </article>

            {/* ── Comments Section ──────────────────────── */}
            <section>
              <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
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
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
                ความคิดเห็น ({comments.length})
              </h2>

              {topLevelComments.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-slate-500 text-sm">
                    ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topLevelComments.map((comment) => (
                    <CommentCard
                      key={comment._id?.toString() || comment.id}
                      comment={comment}
                      replies={getReplies(comment._id?.toString() || comment.id)}
                      user={user}
                      onLike={handleLikeComment}
                      onReply={handleReply}
                      onReport={handleReport}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── New Comment Box ───────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky bottom-4">
              {replyingTo && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
                  <span className="text-xs text-emerald-700 font-medium">
                    ↩ ตอบกลับ{" "}
                    <strong>@{replyingTo.author}</strong>
                  </span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-emerald-500 hover:text-emerald-700"
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
                </div>
              )}

              <div className="flex gap-3 items-start">
                {user ? (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(
                      user.role
                    )}`}
                  >
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <textarea
                    ref={commentInputRef}
                    placeholder={
                      user
                        ? "แสดงความคิดเห็น..."
                        : "เข้าสู่ระบบเพื่อแสดงความคิดเห็น"
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!user}
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) handleSubmitComment();
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-slate-700 placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition-shadow"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">
                      {user ? "Ctrl+Enter เพื่อส่ง" : ""}
                    </span>
                    <div className="flex gap-2">
                      {replyingTo && (
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          ยกเลิก
                        </button>
                      )}
                      <button
                        onClick={handleSubmitComment}
                        disabled={isSubmitting || !newComment.trim() || !user}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
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
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                          />
                        </svg>
                        โพสต์ความคิดเห็น
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ────────────────────────── */}
          <aside className="lg:w-64 xl:w-72 space-y-4 shrink-0">
            {/* Thread Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">
                ℹ️ ข้อมูลกระทู้
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon="📁"
                  label="หมวดหมู่"
                  value={post.category}
                  colorClass={CATEGORY_COLORS[post.category]}
                />
                <InfoRow
                  icon="👤"
                  label="ผู้โพสต์"
                  value={post.author}
                />
                <InfoRow
                  icon="📅"
                  label="โพสต์เมื่อ"
                  value={timeAgo(post.createdAt || post.timestamp)}
                />
                <InfoRow
                  icon="👍"
                  label="ไลค์"
                  value={`${post.likes?.length || 0} ครั้ง`}
                />
                <InfoRow
                  icon="💬"
                  label="ความคิดเห็น"
                  value={`${comments.length} รายการ`}
                />
              </div>
            </div>

            {/* Back to Community */}
            <Link
              to="/community"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
            >
              ← กลับไปหน้า Community
            </Link>

            {/* Community Rules */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-5">
              <h3 className="font-bold text-emerald-800 mb-2 text-sm">
                📜 กติกาชุมชน
              </h3>
              <ul className="text-xs text-emerald-700 space-y-1.5">
                {[
                  "พูดคุยด้วยความสุภาพ",
                  "ไม่โพสต์ข้อมูลเท็จ",
                  "ห้ามโฆษณาหรือสแปม",
                  "เคารพความคิดเห็นผู้อื่น",
                  "รายงานเนื้อหาไม่เหมาะสม",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Report Modal ──────────────────────────────────── */}
      {reportTarget && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReportTarget(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-red-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  รายงานความคิดเห็น
                </h2>
              </div>
              <button
                onClick={() => setReportTarget(null)}
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

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-sm text-slate-600 line-clamp-2">
                  "{reportTarget.content}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  — {reportTarget.author}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  เหตุผลในการรายงาน
                </label>
                <div className="space-y-2">
                  {[
                    "เนื้อหาไม่เหมาะสมหรือรุนแรง",
                    "ข้อมูลเท็จหรือข่าวลือ",
                    "สแปมหรือโฆษณา",
                    "คุกคามหรือกลั่นแกล้ง",
                    "อื่นๆ",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-4 h-4 text-emerald-600 accent-emerald-600"
                      />
                      <span className="text-sm text-slate-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setReportTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ส่งรายงาน
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ── Sub-components ────────────────────────────────────────────

function CommentCard({ comment, replies, user, onLike, onReply, onReport }) {
  const isLiked = user && (comment.likes || []).includes(user.email);
  const [showReplies, setShowReplies] = useState(true);

  if (comment.isReported && !(user && user.role === "admin")) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-sm text-slate-400 italic">
        ความคิดเห็นนี้ถูกรายงานและซ่อนจากการแสดงผล
      </div>
    );
  }

  return (
    <div className="group">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-slate-200 transition-colors">
        {/* Comment Author */}
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(
              comment.authorRole
            )}`}
          >
            {comment.author.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-semibold text-slate-800 text-sm">
                {comment.author}
              </span>
              {comment.authorRole === "admin" && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                  ADMIN
                </span>
              )}
              {comment.parentId && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  ↩ ตอบกลับ
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {timeAgo(comment.createdAt || comment.timestamp)}
              </span>
            </div>

            {/* Comment Content */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {comment.content}
            </p>

            {/* Comment Actions */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => onLike(comment._id?.toString() || comment.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-all px-2.5 py-1 rounded-lg ${
                  isLiked
                    ? "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200"
                    : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                  />
                </svg>
                {(comment.likes || []).length > 0 && (comment.likes || []).length}
                {(comment.likes || []).length === 0 ? "ถูกใจ" : ""}
              </button>

              {user && (
                <button
                  onClick={() => onReply(comment)}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-600 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-all"
                >
                  ↩ ตอบกลับ
                </button>
              )}

              {user && !comment.isReported && (
                <button
                  onClick={() => onReport(comment)}
                  className="text-xs font-semibold text-slate-300 hover:text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all ml-auto"
                >
                  รายงาน
                </button>
              )}
              {comment.isReported && user && user.role === "admin" && (
                <span className="text-xs text-red-500 bg-red-50 px-2.5 py-1 rounded-lg ml-auto font-medium">
                  ⚠ ถูกรายงาน
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {showReplies ? (
            <>
              {replies.map((reply) => (
                <div
                  key={reply._id?.toString() || reply.id}
                  className="bg-slate-50 rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
                        reply.authorRole
                      )}`}
                    >
                      {reply.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-xs">
                          {reply.author}
                        </span>
                        {reply.authorRole === "admin" && (
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            ADMIN
                          </span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">
                          {timeAgo(reply.createdAt || reply.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {reply.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onLike(reply._id?.toString() || reply.id)}
                          className={`flex items-center gap-1 text-xs font-semibold transition-all px-2 py-0.5 rounded-lg ${
                            user && (reply.likes || []).includes(user.email)
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          👍 {(reply.likes || []).length > 0 && (reply.likes || []).length}
                        </button>
                        {user && (
                          <button
                            onClick={() => onReport(reply)}
                            className="text-xs text-slate-300 hover:text-red-500 px-2 py-0.5 rounded-lg hover:bg-red-50 transition-all ml-auto"
                          >
                            รายงาน
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowReplies(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1 transition-colors"
              >
                ซ่อนการตอบกลับ
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-3 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              ▼ ดูการตอบกลับ {replies.length} รายการ
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, colorClass }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
        {colorClass ? (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${colorClass}`}
          >
            {value}
          </span>
        ) : (
          <div className="text-sm font-semibold text-slate-700 truncate">
            {value}
          </div>
        )}
      </div>
    </div>
  );
}
