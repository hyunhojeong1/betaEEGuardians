import { useEffect, useState, useMemo } from "react";
import { getOrders, cancelOrder } from "@/services/order";
import type { OrderItem } from "@/types/order";
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getOrders();
        setOrders(response.orders);
        setUserRole(response.userRole);
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

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">주문 내역</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">주문 내역</h1>
        <p className="text-red-500 text-center py-10">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">주문 내역</h1>
        {userRole === "staff" && (
          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
            Staff 모드 (전체 주문)
          </span>
        )}
      </div>

      {/* 입금 안내 배너 */}
      {userRole === "customer" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            💰 입금 안내
          </p>
          <p className="text-sm text-yellow-700">
            농협 302-0340-8696-31 (예금주: 이지현)
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            주문 후 위 계좌로 입금해 주세요. 입금자명은 주문자 코드와 동일하게
            해주세요.
          </p>
        </div>
      )}

      {orderGroups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">주문 내역이 없습니다.</p>
          <a
            href="/shop"
            className="text-blue-600 hover:text-blue-700 underline"
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
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      {formatDate(group.orderDate)}
                    </h2>
                    {/* 주문 취소 버튼 (customer & 미래 주문만) */}
                    {userRole === "customer" && isFutureOrder(group) && (
                      <button
                        onClick={() => handleCancelOrder(group)}
                        disabled={cancellingKey === group.deliverySlotKey}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-2 py-0.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingKey === group.deliverySlotKey
                          ? "취소 중..."
                          : "주문 취소하기"}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-blue-600">
                    배송 희망: {group.timeSlotLabel}
                  </p>
                </div>
                <div className="text-right">
                  {userRole === "staff" && (
                    <p className="text-sm text-purple-600 font-medium">
                      {group.ordererCount}명 주문
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {group.items.length}개 품목
                  </p>
                  <p className="font-bold text-blue-600">
                    {group.totalPrice.toLocaleString()}원
                  </p>
                </div>
              </div>

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
