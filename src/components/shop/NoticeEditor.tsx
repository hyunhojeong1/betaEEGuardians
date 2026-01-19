import { useState } from "react";
import { saveNotice } from "@/services/notice";

interface NoticeEditorProps {
  initialComment: string;
  onSaveSuccess: (newComment: string) => void;
}

export default function NoticeEditor({
  initialComment,
  onSaveSuccess,
}: NoticeEditorProps) {
  const [comment, setComment] = useState(initialComment);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNotice(comment);
      onSaveSuccess(comment);
      alert("공지사항이 저장되었습니다.");
    } catch (error) {
      console.error("Failed to save notice:", error);
      alert("공지사항 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-yellow-700 text-base sm:text-sm font-medium whitespace-nowrap">
          공지:
        </span>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="공지사항을 입력하세요 (비워두면 비노출)"
          className="flex-1 px-3 py-2 sm:py-1.5 text-base sm:text-sm border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 sm:px-3 py-2 sm:py-1.5 text-base sm:text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
