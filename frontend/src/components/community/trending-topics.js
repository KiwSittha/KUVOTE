import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, MessageSquare } from "lucide-react";

const KU_GREEN = "#006633";

export default function TrendingTopics({ threads = [] }) {
  // Get trending threads based on upvotes + comments
  const getTrendingThreads = (threads) => {
    return threads
      .filter(thread => thread && ((thread.upvotes || 0) > 0 || (thread.commentCount || 0) > 0))
      .sort((a, b) => {
        const aScore = (a.upvotes || 0) + (a.commentCount || 0);
        const bScore = (b.upvotes || 0) + (b.commentCount || 0);
        return bScore - aScore;
      })
      .slice(0, 5); // Top 5
  };

  const trendingThreads = getTrendingThreads(threads);

  if (trendingThreads.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <TrendingUp className="h-5 w-5" style={{ color: KU_GREEN }} />
          Trending Topics
        </h3>
        <p className="text-sm text-gray-600">No trending topics yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <TrendingUp className="h-5 w-5" style={{ color: KU_GREEN }} />
        Trending Topics
      </h3>
      <div className="space-y-3">
        {trendingThreads.map((thread, index) => (
          <Link
            key={thread._id || thread.id || index}
            to={`/community/${thread._id || thread.id}`}
            className="group block rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all hover:bg-gray-100 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: KU_GREEN }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-700 line-clamp-2">
                  {thread.title || "Untitled Thread"}
                </h4>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {thread.upvotes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {thread.comments?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
