import { useState } from "react"
import { Reply } from "lucide-react"
import VoteButton from "./vote-button"
import CommentForm from "./comment-form"

function timeAgo(dateStr, justNowLabel = "Just now") {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return justNowLabel
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function CommentCard({
  comment,
  replies = [],
  userVote,
  onVote,
  onReply,
  getReplyVote,
  onReplyVote,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className="flex flex-col">
      <div className="flex gap-3">
        <VoteButton
          count={comment.upvotes}
          userVote={userVote}
          onVote={onVote}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              {comment.author}
            </span>
            <span>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm text-card-foreground leading-relaxed">
            {comment.body}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                placeholder="Write a reply..."
                onSubmit={(body) => {
                  onReply(body, comment.id)
                  setShowReplyForm(false)
                }}
                onCancel={() => setShowReplyForm(false)}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-10 mt-3 flex flex-col gap-3 border-l-2 border-border pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <VoteButton
                count={reply.upvotes}
                userVote={getReplyVote(reply.id)}
                onVote={(dir) => onReplyVote(reply.id, dir)}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/80">
                    {reply.author}
                  </span>
                  <span>
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-card-foreground leading-relaxed">
                  {reply.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}