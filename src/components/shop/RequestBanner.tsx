import { useState } from "react";
import { submitUserRequest } from "@/services/userRequest";

export default function RequestBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = async () => {
    if (!requestText.trim()) {
      alert("요청 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitUserRequest(requestText.trim());
      setIsSubmitted(true);
      setRequestText("");
      setTimeout(() => {
        setIsExpanded(false);
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit request:", error);
      alert("요청 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-blue-700 text-sm">
          찾으시는 상품이 없다면 입점 요청 해주세요!
        </p>
        <button
          onClick={handleToggle}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          {isExpanded ? "닫기" : "요청하기"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          {isSubmitted ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">
                요청이 접수되었습니다. 감사합니다!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-700">
                  원하시는 제품을 가급적 공식 명칭으로, 구체적으로 입력해주시면
                  입점 검토에 도움이 됩니다! 의견주셔서 감사합니다.
                </p>
                <p className="text-sm text-gray-500">
                  - 지환수는 식품과 생활 소모품(샴푸, 휴지, 화장품, 소스 등)만
                  취급하고 있습니다.
                </p>
                <p className="text-sm text-gray-500">
                  - 내구성 제품(가전제품, 조리기구, 이불 등 장기간 사용품)은
                  취급하지 않는 점 양해 부탁 드립니다.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="예: 오뚜기 진라면 멀티팩"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !requestText.trim()}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "제출 중..." : "제출"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
