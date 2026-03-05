import { Link } from "react-router-dom"
import { MessageSquare, Clock } from "lucide-react"
import VoteButton from "./vote-button"
import Avatar from "./avatar"
import { formatTimeAgo } from "../../lib/time-utils"

const KU_GREEN = "#006633"

export default function ThreadCard({
  thread,
  userVote = 0,
  onVote = () => {},
}) {
  if (!thread) return null

  return (
    <Link
      to={`/community/${thread?._id || thread?.id}`}
      className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
      style={{ "--hover-color": KU_GREEN }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = KU_GREEN
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgb(229, 231, 235)"
      }}
    >
      <VoteButton
        count={thread?.upvotes || 0}
        userVote={userVote}
        onVote={onVote}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: KU_GREEN }}
          >
            {thread?.category || "General"}
          </span>

          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(thread?.createdAt)}
          </span>
        </div>

        <h3
          className="text-base font-semibold text-gray-900 group-hover:transition-colors leading-snug cursor-pointer"
          style={{
            "--hover-color": KU_GREEN,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = KU_GREEN
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgb(17, 24, 39)"
          }}
        >
          {thread?.title}
        </h3>

        <p className="line-clamp-2 text-sm text-gray-500 leading-relaxed">
          {thread?.body}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Avatar name={thread?.author || "Anonymous"} size={20} />
            <span className="font-medium text-gray-700">
              {thread?.author || "Anonymous"}
            </span>
          </div>

          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {thread?.commentCount || 0}{" "}
            {(thread?.commentCount || 0) === 1 ? "comment" : "comments"}
          </span>
        </div>
      </div>
    </Link>
  )
}