import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus } from "lucide-react";

const KU_GREEN = "#006633";

export default function EmptyState({ title, message, showCreateButton = false }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 px-6 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        <MessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-600 max-w-md">{message}</p>
      {showCreateButton && (
        <Link
          to="/community/new"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white font-medium transition-all hover:shadow-lg"
          style={{ backgroundColor: KU_GREEN }}
        >
          <Plus size={18} />
          <span>Create Thread</span>
        </Link>
      )}
    </div>
  );
}