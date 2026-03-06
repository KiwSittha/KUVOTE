import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Flame, Clock, TrendingUp, BarChart3, Home } from "lucide-react";
import Layout from "../components/Layout";
import ThreadCard from "../components/community/thread-card";
import TrendingTopics from "../components/community/trending-topics";
import SkeletonThreadCard from "../components/community/skeleton-thread-card";
import EmptyState from "../components/community/empty-state";
import { useThreads } from "../lib/hooks/use-threads";
import { useVotes } from "../lib/hooks/use-votes";

const KU_GREEN = "#006643";
const threadCategories = ["All", "General", "Politics", "Education", "Technology", "Sports", "Other"];
const sortOptions = [
  { value: "hot", label: "Hot", icon: Flame },
  { value: "new", label: "New", icon: Clock },
  { value: "top", label: "Top", icon: TrendingUp },
];

export default function CommunityPage() {
  const { threads, isLoading, isHydrated, error, fetchThreads, updateThreadVotes } = useThreads();
  const { getVote } = useVotes();

  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("hot");
  const [search, setSearch] = useState("");
  const [userId] = useState(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).email : "anonymous");

  // Fetch threads when filters change
  useEffect(() => {
    fetchThreads(category, sort, search);
  }, [category, sort, search, fetchThreads]);

  const handleVote = async (threadId, direction) => {
    const result = await updateThreadVotes(threadId, userId, direction);
    if (!result.success) {
      console.error("Failed to vote:", result.error);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
              ⚠️ {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Title and Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
                <p className="mt-1 text-gray-600">Discuss and share your thoughts with peers</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/community"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-white font-medium transition-all hover:shadow-lg"
                  style={{ backgroundColor: "#0f766e" }}
                >
                  <Home size={18} />
                  <span>Community Portal</span>
                </Link>
                <Link
                  to="/match"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-white font-medium transition-all hover:shadow-lg"
                  style={{ backgroundColor: KU_GREEN }}
                >
                  <BarChart3 size={18} />
                  <span>Take the Quiz</span>
                </Link>
                <Link
                  to="/community/new"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-white font-medium transition-all hover:shadow-lg"
                  style={{ backgroundColor: KU_GREEN }}
                >
                  <Plus size={18} />
                  <span>Create Thread</span>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search threads by title or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Threads Column */}
            <div className="lg:col-span-2">
              {/* Sorting Tabs */}
              <div className="mb-6 flex gap-2 border-b border-gray-200">
                {sortOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        sort === opt.value
                          ? "border-[#006633] text-[#006633]"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Category Filters */}
              <div className="mb-6 flex flex-wrap gap-2">
                {threadCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      category === cat
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    style={category === cat ? { backgroundColor: KU_GREEN } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Thread List */}
              <div className="space-y-4">
                {!isHydrated && isLoading ? (
                  // Skeleton Loading
                  <>
                    {[...Array(3)].map((_, i) => (
                      <SkeletonThreadCard key={i} />
                    ))}
                  </>
                ) : threads.length === 0 ? (
                  <EmptyState
                    title="No threads yet"
                    message="Be the first to start a discussion in the community!"
                    showCreateButton={true}
                  />
                ) : (
                  threads.map((thread) => (
                    <ThreadCard
                      key={thread._id}
                      thread={thread}
                      userVote={getVote(thread._id)}
                      onVote={(dir) => handleVote(thread._id, dir)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar - Trending Topics */}
            <div className="hidden lg:block">
              <TrendingTopics threads={threads} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
