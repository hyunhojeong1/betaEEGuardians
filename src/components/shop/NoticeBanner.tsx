interface NoticeBannerProps {
  comment: string;
}

export default function NoticeBanner({ comment }: NoticeBannerProps) {
  // 공지 내용이 없으면 비노출
  if (!comment || comment.trim() === "") {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-blue-600 text-sm font-medium">공지:</span>
        <span className="text-blue-700 text-sm">{comment}</span>
      </div>
    </div>
  );
}
