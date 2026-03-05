import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useThreads } from "../lib/hooks/use-threads";

const KU_GREEN = "#006633";
const threadCategories = ["General", "Politics", "Education", "Technology", "Sports", "Other"];

export default function NewThreadPage() {
  const navigate = useNavigate();
  const { addThread } = useThreads();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("กรุณาใส่หัวข้อกระทู้");
      return;
    }
    if (!body.trim()) {
      alert("กรุณาใส่เนื้อหา");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const author = user.email || "Anonymous";

      const result = await addThread({
        title: title.trim(),
        body: body.trim(),
        author,
        category,
      });

      if (result.success) {
        alert("สร้างกระทู้สำเร็จ!");
        navigate("/community");
      } else {
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      alert("เกิดข้อผิดพลาดในการสร้างกระทู้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to="/community"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปชุมชน
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        เขียนกระทู้ใหม่
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            หมวดหมู่
          </label>
          <div className="flex flex-wrap gap-2">
            {threadCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                style={category === cat ? { backgroundColor: KU_GREEN } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            หัวข้อ
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เขียนหัวข้อกระทู้..."
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200"
            required
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2">
          <label htmlFor="body" className="text-sm font-medium text-foreground">
            เนื้อหา
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="เขียนเนื้อหา..."
            rows={8}
            className="resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: KU_GREEN }}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "กำลังส่ง..." : "ส่งกระทู้"}
        </button>
      </form>
    </div>
  );
}