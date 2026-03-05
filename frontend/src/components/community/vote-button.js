import { ChevronUp, ChevronDown } from "lucide-react"

const KU_GREEN = "#006633"

export default function VoteButton({
  count = 0,
  userVote = 0,
  onVote = () => {},
  orientation = "vertical",
}) {
  const isVertical = orientation === "vertical"

  return (
    <div
      className={`flex items-center gap-0.5 ${
        isVertical ? "flex-col" : "flex-row"
      }`}
    >
      {/* Upvote */}
      <button
        onClick={() => onVote(userVote === 1 ? 0 : 1)}
        className={`p-1 rounded transition-colors ${
          userVote === 1
            ? "text-white bg-green-600 hover:bg-green-700"
            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
        }`}
        style={userVote === 1 ? { backgroundColor: KU_GREEN } : {}}
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* Vote Count */}
      <span
        className={`font-medium text-sm px-1 min-w-[2rem] text-center ${
          userVote !== 0 ? "text-green-600" : "text-gray-600"
        }`}
        style={userVote !== 0 ? { color: KU_GREEN } : {}}
      >
        {count}
      </span>

      {/* Downvote */}
      <button
        onClick={() => onVote(userVote === -1 ? 0 : -1)}
        className={`p-1 rounded transition-colors ${
          userVote === -1
            ? "text-white bg-red-600 hover:bg-red-700"
            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
        }`}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  )
}
