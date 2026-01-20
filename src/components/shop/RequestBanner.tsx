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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-blue-700 text-base sm:text-sm">
          찾으시는 상품이 없다면 입점 요청 해주세요!
        </p>
        <button
          onClick={handleToggle}
          className="px-5 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-base sm:text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          {isExpanded ? "닫기" : "요청하기"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {isSubmitted ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium text-base sm:text-sm">
                요청이 접수되었습니다. 감사합니다!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <p className="text-base sm:text-sm text-gray-700">
                  원하시는 제품을 가능한 구체적으로 입력해주시면 입점 검토에
                  도움이 됩니다. 의견주셔서 감사합니다.
                </p>
                <p className="text-base sm:text-sm text-gray-500">
                  - 지환수는 식품, 생활 소모품만 취급하고 있습니다.(예: 샴푸,
                  휴지, 화장품, 소스 등)
                </p>
                <p className="text-base sm:text-sm text-gray-500">
                  - 내구성 제품은 취급하지 않는 점 양해 부탁 드립니다.(예:
                  가전제품, 조리기구, 이불 등 반복적으로 사용하는 품목)
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="예: 오뚜기 진라면 멀티팩"
                  className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !requestText.trim()}
                  className="px-5 sm:px-4 py-2.5 sm:py-2 bg-green-600 text-white text-base sm:text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
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
