import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { getContainerBalance } from "@/services/container";
import { getMembership, useRefillTicket } from "@/services/membership";

export default function RefillTicketPage() {
  const { role } = useUserStore();
  const isStaff = role === "staff";

  const [containerCount, setContainerCount] = useState(0);
  const [needsWashing, setNeedsWashing] = useState(true);
  const [containerBalance, setContainerBalance] = useState<number | null>(null);
  const [refillTicket, setRefillTicket] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 페이지 진입 시 용기 잔액 및 멤버십(충전권) 조회
  useEffect(() => {
    if (role === "customer") {
      getContainerBalance()
        .then((response) => {
          if (response.success) {
            setContainerBalance(response.balance);
          }
        })
        .catch((err) => {
          console.error("용기 잔액 조회 오류:", err);
        });

      getMembership()
        .then((response) => {
          if (response.success) {
            setRefillTicket(response.refillTicket);
          }
        })
        .catch((err) => {
          console.error("멤버십 조회 오류:", err);
        });
    }
  }, [role]);

  const handleUseTicket = async () => {
    if (refillTicket <= 0) {
      alert("사용 가능한 충전권이 없습니다.");
      return;
    }
    if (containerCount <= 0) {
      alert("충전하실 용기 개수를 입력해주세요.");
      return;
    }

    const confirmed = window.confirm("충전권이 1회 차감됩니다. 사용하시겠습니까?");
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const response = await useRefillTicket({
        containerCount,
        needsWashing,
      });

      if (response.success) {
        setRefillTicket(response.remainingTickets);
        setContainerCount(0);
        alert("충전권 사용이 완료되었습니다.");
      }
    } catch (error: unknown) {
      console.error("충전권 사용 오류:", error);
      const firebaseError = error as { message?: string };
      alert(firebaseError.message || "충전권 사용 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
        충전권 사용
      </h1>

      {/* 충전권 잔여 현황 */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-sm text-blue-700 font-medium">
            보유 충전권
          </span>
          <span className="text-xl sm:text-lg font-bold text-blue-600">
            {refillTicket}장
          </span>
        </div>
        <p className="text-xs text-blue-500 mt-1">
          상품 주문 없이 다회용기 충전만 요청하실 수 있는 쿠폰입니다.
        </p>
      </div>

      {/* 충전권 이용 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-base sm:text-sm font-semibold text-amber-800 mb-3">
          이용 안내
        </p>
        <ol className="space-y-2 text-base sm:text-sm text-amber-700">
          <li className="flex gap-2">
            <span className="font-medium">1.</span>
            <span>
              상품을 주문하신 경우에는 충전권 사용이 불필요합니다. 상품 배송 시
              용기 회수가 기본적으로 포함됩니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">2.</span>
            <span>
              용기를 지환수 상자에 담아 기사님 도착 전까지 현관문 밖에
              내놓아주세요.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">3.</span>
            <span>안전과 위생을 위해 용기 뚜껑을 꼭 닫아서 내놓아주세요.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">4.</span>
            <span>추가하실 개인 용기 개수와 세척 필요 여부를 알려주세요.</span>
          </li>
        </ol>

        {/* 용기 보관 현황 (customer만 표시) */}
        {!isStaff && containerBalance !== null && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-base sm:text-sm text-amber-700">
              현재 지환수가 보관 중인 나의 용기:{" "}
              <span className="font-bold text-amber-900">
                {containerBalance}개
              </span>
            </p>
          </div>
        )}

        {/* 다회용기 입력 영역 */}
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* 용기 수량 입력 */}
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-sm text-amber-700 font-medium">
                충전하실 개인 용기 개수:
              </span>
              <input
                type="number"
                min="0"
                max="99"
                value={containerCount || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setContainerCount(0);
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setContainerCount(Math.min(99, Math.max(0, num)));
                    }
                  }
                }}
                placeholder="0"
                className="w-16 px-2 py-2 sm:py-1.5 text-center text-base sm:text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-base sm:text-sm text-amber-700">개</span>
            </div>

            {/* 세척 필요 여부 체크박스 */}
            {containerCount > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="washingOption"
                    checked={needsWashing}
                    onChange={() => setNeedsWashing(true)}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-amber-600"
                  />
                  <span className="text-base sm:text-sm text-amber-700">
                    세척 후 사용해주세요
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="washingOption"
                    checked={!needsWashing}
                    onChange={() => setNeedsWashing(false)}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-amber-600"
                  />
                  <span className="text-base sm:text-sm text-amber-700">
                    세척이 필요 없어요
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 충전권 사용 호출하기 버튼 */}
      <button
        onClick={handleUseTicket}
        disabled={isSubmitting || refillTicket <= 0}
        className="w-full py-4 text-xl sm:text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? "처리 중..."
          : refillTicket <= 0
            ? "사용 가능한 충전권이 없습니다"
            : "충전권 사용 호출하기"}
      </button>
    </div>
  );
}
