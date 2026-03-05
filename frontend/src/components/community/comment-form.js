import { useState } from "react"
import { Send, X } from "lucide-react"

export default function CommentForm({
  placeholder = "Write a comment...",
  onSubmit = () => {},
  onCancel,
  compact = false,
}) {
  const [body, setBody] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!body.trim()) return

    onSubmit(body.trim())
    setBody("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={!body.trim()}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
          {compact ? "Reply" : "Comment"}
        </button>
      </div>
    </form>
  )
}