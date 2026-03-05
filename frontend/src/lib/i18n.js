// Simple i18n implementation
const translations = {
  th: {
    community: {
      title: "ชุมชน",
      subtitle: "พูดคุยและเปลี่ยนความคิดเห็น",
      reply: "ตอบกลับ",
      replyPlaceholder: "เขียนคำตอบ...",
      justNow: "เมื่อสักครู่"
    }
  },
  en: {
    community: {
      title: "Community",
      subtitle: "Discuss and share opinions",
      reply: "Reply",
      replyPlaceholder: "Write a reply...",
      justNow: "Just now"
    }
  }
};

export function useTranslation() {
  // For now, default to Thai
  const t = translations.th;

  return { t };
}