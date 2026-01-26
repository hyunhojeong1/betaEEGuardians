import { useEffect, useState, useMemo } from "react";
import { getOrders, cancelOrder } from "@/services/order";
import {
  getAllContainerBalances,
  type CustomerContainerBalance,
} from "@/services/container";
import { createReview, getReviews } from "@/services/review";
import type { OrderItem } from "@/types/order";
import type { Review } from "@/types/review";
import OrderItemCard from "@/components/orders/OrderItemCard";

interface OrderGroup {
  deliverySlotKey: string;
  orderDate: string;
  timeSlotLabel: string;
  timeSlotStartHour: number;
  items: OrderItem[];
  totalPrice: number;
  ordererColorMap: Map<string, number>; // 주문자 코드 -> 색상 인덱스
  ordererCount: number; // 해당 그룹의 주문자 수
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [userRole, setUserRole] = useState<"customer" | "staff">("customer");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingKey, setCancellingKey] = useState<string | null>(null);
  const [allContainerBalances, setAllContainerBalances] = useState<
    CustomerContainerBalance[]
  >([]);
  // 리뷰 관련 상태
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewContent, setReviewContent] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(
    new Set()
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  // deliverySlotKey -> Review 매핑
  const reviewBySlotKey = useMemo(() => {
    const map = new Map<string, Review>();
    for (const review of reviews) {
      map.set(review.deliverySlotKey, review);
    }
    return map;
  }, [reviews]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getOrders();
        setOrders(response.orders);
        setUserRole(response.userRole);

        // staff인 경우 전체 고객 용기 잔액 조회
        if (response.userRole === "staff") {
          try {
            const allBalancesResponse = await getAllContainerBalances();
            if (allBalancesResponse.success) {
              setAllContainerBalances(allBalancesResponse.balances);
            }
          } catch (balanceErr) {
            console.error("전체 용기 잔액 조회 오류:", balanceErr);
          }
        }

        // 리뷰 목록 조회
        try {
          const reviewsResponse = await getReviews();
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.reviews);
            // 이미 작성한 리뷰의 deliverySlotKey를 submittedReviews에 추가
            const submittedKeys = new Set(
              reviewsResponse.reviews.map((r) => r.deliverySlotKey)
            );
            setSubmittedReviews(submittedKeys);
          }
        } catch (reviewErr) {
          console.error("리뷰 목록 조회 오류:", reviewErr);
        }
      } catch (err) {
        console.error("주문 내역 조회 오류:", err);
        setError("주문 내역을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // deliverySlotKey 기준으로 주문 묶음 그룹화
  const orderGroups = useMemo(() => {
    const groupMap = new Map<string, OrderGroup>();

    for (const order of orders) {
      const key = order.deliverySlotKey;

      if (groupMap.has(key)) {
        const group = groupMap.get(key)!;
        group.items.push(order);
        // 같은 그룹 내 아이템 가격 합산
        group.totalPrice += order.itemPrice;
      } else {
        groupMap.set(key, {
          deliverySlotKey: key,
          orderDate: order.orderDate,
          timeSlotLabel: order.deliveryTimeSlot.label,
          timeSlotStartHour: order.deliveryTimeSlot.startHour,
          items: [order],
          totalPrice: order.itemPrice,
          ordererColorMap: new Map(),
          ordererCount: 0,
        });
      }
    }

    // 각 그룹별로 주문자 색상 인덱스 매핑 + 상품 ID순 정렬
    for (const group of groupMap.values()) {
      // 주문자별 색상 인덱스 부여
      const ordererSet = new Set<string>();
      for (const item of group.items) {
        ordererSet.add(item.ordererCode);
      }
      const orderers = Array.from(ordererSet);
      group.ordererCount = orderers.length;
      orderers.forEach((code, index) => {
        group.ordererColorMap.set(code, index);
      });

      // 상품 ID순 정렬 (동일 카테고리 품목이 인접하게)
      group.items.sort((a, b) => a.product.id.localeCompare(b.product.id));
    }

    // 최신순 정렬 (deliverySlotKey는 날짜_시간대ID 형식)
    return Array.from(groupMap.values()).sort((a, b) => {
      // 먼저 날짜로 정렬 (내림차순)
      if (a.orderDate !== b.orderDate) {
        return b.orderDate.localeCompare(a.orderDate);
      }
      // 같은 날짜면 시간대로 정렬
      return b.deliverySlotKey.localeCompare(a.deliverySlotKey);
    });
  }, [orders]);

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  // 주문 그룹이 미래인지 판단 (취소 가능 여부)
  const isFutureOrder = (group: OrderGroup): boolean => {
    // 한국 시간 기준 현재 날짜/시간
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayKorea = koreaTime.toISOString().split("T")[0];
    const currentHour = koreaTime.getUTCHours();

    // 미래 날짜면 취소 가능
    if (group.orderDate > todayKorea) {
      return true;
    }

    // 오늘 날짜이고 시간대 시작 시간이 현재 시간보다 미래면 취소 가능
    if (
      group.orderDate === todayKorea &&
      group.timeSlotStartHour > currentHour
    ) {
      return true;
    }

    return false;
  };

  // 주문 취소 핸들러
  const handleCancelOrder = async (group: OrderGroup) => {
    if (
      !confirm(
        `${formatDate(group.orderDate)} ${
          group.timeSlotLabel
        } 주문을 취소하시겠습니까?`
      )
    ) {
      return;
    }

    setCancellingKey(group.deliverySlotKey);

    try {
      const response = await cancelOrder({
        deliverySlotKey: group.deliverySlotKey,
      });
      if (response.success) {
        alert(`주문이 취소되었습니다. (${response.deletedCount}개 품목)`);
        // 주문 목록 새로고침
        const refreshed = await getOrders();
        setOrders(refreshed.orders);
      } else {
        alert(`주문 취소 실패: ${response.message}`);
      }
    } catch (err) {
      console.error("주문 취소 오류:", err);
      alert("주문 취소 중 오류가 발생했습니다.");
    } finally {
      setCancellingKey(null);
    }
  };

  // 리뷰 작성 토글
  const handleToggleReview = (deliverySlotKey: string) => {
    if (reviewingKey === deliverySlotKey) {
      setReviewingKey(null);
      setReviewRating(5);
      setReviewContent("");
    } else {
      setReviewingKey(deliverySlotKey);
      setReviewRating(5);
      setReviewContent("");
    }
  };

  // 리뷰 제출 핸들러
  const handleSubmitReview = async (group: OrderGroup) => {
    if (!reviewContent.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await createReview({
        deliverySlotKey: group.deliverySlotKey,
        orderDate: group.orderDate,
        deliveryTimeSlotLabel: group.timeSlotLabel,
        rating: reviewRating,
        content: reviewContent,
      });

      if (response.success) {
        alert("리뷰가 저장되었습니다. 감사합니다!");
        setSubmittedReviews((prev) => new Set(prev).add(group.deliverySlotKey));
        setReviewingKey(null);
        setReviewRating(5);
        setReviewContent("");
      } else {
        alert(`리뷰 저장 실패: ${response.message}`);
      }
    } catch (err: unknown) {
      console.error("리뷰 저장 오류:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "리뷰 저장 중 오류가 발생했습니다.";
      if (errorMessage.includes("already-exists")) {
        alert("이미 해당 주문에 대한 리뷰를 작성하셨습니다.");
        setSubmittedReviews((prev) => new Set(prev).add(group.deliverySlotKey));
        setReviewingKey(null);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
          주문 내역
        </h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
          주문 내역
        </h1>
        <p className="text-red-500 text-center py-10 text-base sm:text-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold">
          주문 내역
        </h1>
        {userRole === "staff" && (
          <span className="text-base sm:text-sm bg-yellow-100 text-yellow-700 px-3 py-1.5 sm:py-1 rounded-full">
            Staff 모드 (전체 주문)
          </span>
        )}
      </div>

      {/* 계좌이체 안내 배너 */}
      {userRole === "customer" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-base sm:text-sm text-yellow-800 font-medium mb-2">
            💰 계좌이체 안내
          </p>
          <p className="text-base sm:text-sm text-yellow-700">
            농협 302-0340-8696-31 (예금주: 이지현)
          </p>
          <p className="text-sm sm:text-sm text-yellow-600 mt-1">
            위 계좌로 구매 총액을 이체해 주셔야 최종 주문 완료가 됩니다. 이체가
            확인되면 확인 메세지를 드리겠습니다.
            <br />
            (이체하지 않으시면 주문이 자동 취소됩니다)
          </p>
        </div>
      )}

      {/* Staff용 전체 고객 용기 잔액 현황 */}
      {userRole === "staff" && allContainerBalances.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <p className="text-base sm:text-sm text-purple-800 font-medium mb-3">
            고객별 용기 보관 현황
          </p>
          <div className="space-y-2">
            {allContainerBalances.map((item) => (
              <div
                key={item.ordererCode}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2"
              >
                <span className="text-base sm:text-sm text-gray-700 font-medium">
                  {item.ordererCode} 님의 용기 수
                </span>
                <span
                  className={`text-base sm:text-sm font-bold ${
                    item.balance > 0
                      ? "text-green-600"
                      : item.balance < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {item.balance}개
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200 flex justify-between">
            <span className="text-base sm:text-sm text-purple-700 font-medium">
              전체 보관 용기
            </span>
            <span className="text-base sm:text-sm text-purple-800 font-bold">
              {allContainerBalances.reduce(
                (sum, item) => sum + item.balance,
                0
              )}
              개
            </span>
          </div>
        </div>
      )}

      {orderGroups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4 text-base sm:text-sm">
            주문 내역이 없습니다.
          </p>
          <a
            href="/shop"
            className="text-blue-600 hover:text-blue-700 underline text-base sm:text-sm"
          >
            장보기 페이지로 이동
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {orderGroups.map((group) => (
            <div
              key={group.deliverySlotKey}
              className="bg-gray-50 rounded-2xl p-4"
            >
              {/* 그룹 헤더: 날짜 + 시간대 */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900 text-lg sm:text-base">
                      {formatDate(group.orderDate)}
                    </h2>
                    {/* 주문 취소 버튼 (customer & 미래 주문만) */}
                    {userRole === "customer" && isFutureOrder(group) && (
                      <button
                        onClick={() => handleCancelOrder(group)}
                        disabled={cancellingKey === group.deliverySlotKey}
                        className="text-sm sm:text-xs text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-2.5 sm:px-2 py-1 sm:py-0.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingKey === group.deliverySlotKey
                          ? "취소 중..."
                          : "주문 취소하기"}
                      </button>
                    )}
                    {/* 리뷰 작성 버튼 (customer & 과거 주문만) */}
                    {userRole === "customer" &&
                      !isFutureOrder(group) &&
                      !submittedReviews.has(group.deliverySlotKey) && (
                        <button
                          onClick={() =>
                            handleToggleReview(group.deliverySlotKey)
                          }
                          className={`text-sm sm:text-xs px-2.5 sm:px-2 py-1 sm:py-0.5 rounded ${
                            reviewingKey === group.deliverySlotKey
                              ? "bg-green-600 text-white"
                              : "text-green-600 hover:text-green-700 border border-green-400 hover:border-green-500"
                          }`}
                        >
                          {reviewingKey === group.deliverySlotKey
                            ? "접기"
                            : "식품&배송 평가하기"}
                        </button>
                      )}
                    {/* 리뷰 완료 표시 */}
                    {userRole === "customer" &&
                      !isFutureOrder(group) &&
                      submittedReviews.has(group.deliverySlotKey) && (
                        <span className="text-sm sm:text-xs text-gray-400 px-2 py-0.5">
                          평가 완료
                        </span>
                      )}
                  </div>
                  <p className="text-base sm:text-sm text-blue-600">
                    배송 희망: {group.timeSlotLabel}
                  </p>
                </div>
                <div className="text-right">
                  {userRole === "staff" && (
                    <p className="text-base sm:text-sm text-purple-600 font-medium">
                      {group.ordererCount}명 주문
                    </p>
                  )}
                  <p className="text-base sm:text-sm text-gray-500">
                    {group.items.length}개 품목
                  </p>
                  <p className="font-bold text-blue-600 text-lg sm:text-base">
                    {group.totalPrice.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* 리뷰 입력 폼 - 날짜/시간 바로 아래 (품목 위) */}
              {reviewingKey === group.deliverySlotKey && (
                <div className="mb-4 bg-green-50 rounded-xl p-4">
                  <p className="text-base sm:text-sm font-medium text-green-800 mb-3">
                    식품 & 배송 평가
                  </p>

                  {/* 별점 선택 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base sm:text-sm text-gray-600">
                      별점:
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-3xl sm:text-2xl focus:outline-none transition-transform hover:scale-110"
                        >
                          {star <= reviewRating ? (
                            <span className="text-yellow-400">★</span>
                          ) : (
                            <span className="text-gray-300">★</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <span className="text-base sm:text-sm text-gray-500 ml-2">
                      {reviewRating}점
                    </span>
                  </div>

                  {/* 리뷰 내용 입력 */}
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="배송 받으신 식품과 서비스에 대한 솔직한 평가를 남겨주세요. (맛, 신선도, 포장 상태, 배송 시간 등)"
                    rows={4}
                    className="w-full px-3 py-2.5 sm:py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none text-base sm:text-sm"
                  />

                  {/* 저장 버튼 */}
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => handleSubmitReview(group)}
                      disabled={isSubmittingReview || !reviewContent.trim()}
                      className="px-5 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              )}

              {/* 저장된 리뷰 표시 */}
              {reviewBySlotKey.has(group.deliverySlotKey) && (
                <div className="mb-4 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-base sm:text-sm font-medium text-blue-800">
                      {userRole === "staff" && (
                        <span className="text-purple-600 mr-2">
                          [
                          {
                            reviewBySlotKey.get(group.deliverySlotKey)!
                              .ordererCode
                          }
                          ]
                        </span>
                      )}
                      평가 내용
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xl sm:text-lg ${
                            star <=
                            reviewBySlotKey.get(group.deliverySlotKey)!.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-base sm:text-sm text-gray-700 whitespace-pre-wrap">
                    {reviewBySlotKey.get(group.deliverySlotKey)!.content}
                  </p>
                </div>
              )}

              {/* 품목 리스트 */}
              <div className="space-y-3">
                {group.items.map((item) => (
                  <OrderItemCard
                    key={item.id}
                    item={item}
                    isStaff={userRole === "staff"}
                    ordererColorIndex={
                      userRole === "staff"
                        ? group.ordererColorMap.get(item.ordererCode)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
