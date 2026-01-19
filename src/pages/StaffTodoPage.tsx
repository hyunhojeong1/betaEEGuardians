import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { getStaffTodoData, updateContainerActual } from "@/services/staffTodo";
import { getTodoList, createTodo, deleteTodo } from "@/services/todoList";
import type {
  ContainerStorageItem,
  StaffTodoData,
  UpdateContainerActualResponse,
} from "@/types/staffTodo";
import type { TodoItem } from "@/types/todoList";

export default function StaffTodoPage() {
  const navigate = useNavigate();
  const { role } = useUserStore();
  const [todoData, setTodoData] = useState<StaffTodoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // To-do 리스트 상태
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  // To-do 추가 폼 상태
  const [showPreArrivalForm, setShowPreArrivalForm] = useState(false);
  const [showPostArrivalForm, setShowPostArrivalForm] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [newTodoOrder, setNewTodoOrder] = useState<number>(1);
  const [isSubmittingTodo, setIsSubmittingTodo] = useState(false);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

  // Staff가 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (role !== "staff") {
      navigate("/");
    }
  }, [role, navigate]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingTodos(true);

        const [staffData, todoListData] = await Promise.all([
          getStaffTodoData(),
          getTodoList(),
        ]);

        setTodoData(staffData);
        if (todoListData.success) {
          setTodoList(todoListData.todos);
        }
      } catch (err) {
        console.error("Staff Todo 데이터 조회 오류:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
        setIsLoadingTodos(false);
      }
    };

    if (role === "staff") {
      fetchData();
    }
  }, [role]);

  // 실제 용기 수량 업데이트 (반입/반출 각각)
  const handleUpdateContainers = async (
    item: ContainerStorageItem,
    incomingCount: number | null,
    outgoingCount: number | null
  ) => {
    setUpdatingId(item.id);
    try {
      const response: UpdateContainerActualResponse = await updateContainerActual({
        containerId: item.id,
        incomingCount,
        outgoingCount,
      });

      // 로컬 상태 업데이트
      if (todoData && response.success) {
        setTodoData({
          ...todoData,
          containerItems: todoData.containerItems.map((c) =>
            c.id === item.id
              ? {
                  ...c,
                  actualContainerCount: incomingCount,
                  outgoingContainerId: response.outgoingContainerId || null,
                  outgoingContainerCount: outgoingCount,
                }
              : c
          ),
        });
      }
    } catch (err) {
      console.error("용기 수량 업데이트 오류:", err);
      alert("용기 수량 업데이트에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  // To-do 추가 핸들러
  const handleAddTodo = async (type: "preArrival" | "postArrival") => {
    if (!newTodoContent.trim()) {
      alert("투두 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingTodo(true);
    try {
      const response = await createTodo({
        type,
        content: newTodoContent.trim(),
        order: newTodoOrder,
      });

      if (response.success && response.todoId) {
        // 로컬 상태 업데이트
        const newTodo: TodoItem = {
          id: response.todoId,
          type,
          content: newTodoContent.trim(),
          order: newTodoOrder,
          createdAt: new Date().toISOString(),
        };
        setTodoList((prev) => [...prev, newTodo].sort((a, b) => a.order - b.order));

        // 폼 초기화
        setNewTodoContent("");
        setNewTodoOrder(1);
        if (type === "preArrival") {
          setShowPreArrivalForm(false);
        } else {
          setShowPostArrivalForm(false);
        }
      }
    } catch (err) {
      console.error("투두 추가 오류:", err);
      alert("투두 추가에 실패했습니다.");
    } finally {
      setIsSubmittingTodo(false);
    }
  };

  // To-do 삭제 핸들러
  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm("이 투두를 삭제하시겠습니까?")) {
      return;
    }

    setDeletingTodoId(todoId);
    try {
      const response = await deleteTodo({ todoId });
      if (response.success) {
        setTodoList((prev) => prev.filter((t) => t.id !== todoId));
      }
    } catch (err) {
      console.error("투두 삭제 오류:", err);
      alert("투두 삭제에 실패했습니다.");
    } finally {
      setDeletingTodoId(null);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
  };

  if (role !== "staff") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">직원 To-do</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">직원 To-do</h1>
        <p className="text-red-500 text-center py-10 text-base sm:text-sm">{error}</p>
      </div>
    );
  }

  // 오늘 날짜 (한국 시간)
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const todayKorea = koreaTime.toISOString().split("T")[0];

  // 오늘 처리할 용기들
  const todayContainers =
    todoData?.containerItems.filter((c) => c.orderDate === todayKorea) || [];

  // 미처리 용기들 (오늘 이전 + actualContainerCount가 null)
  const pendingContainers =
    todoData?.containerItems.filter(
      (c) => c.orderDate < todayKorea && c.actualContainerCount === null
    ) || [];

  // To-do 분류
  const preArrivalTodos = todoList
    .filter((t) => t.type === "preArrival")
    .sort((a, b) => a.order - b.order);
  const postArrivalTodos = todoList
    .filter((t) => t.type === "postArrival")
    .sort((a, b) => a.order - b.order);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold">직원 To-do</h1>
        <span className="text-base sm:text-sm bg-purple-100 text-purple-700 px-3 py-1.5 sm:py-1 rounded-full">
          Staff 전용
        </span>
      </div>

      {/* 1. 고객 집 도착 전 To-do (preArrival) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-3.5 sm:w-3 h-3.5 sm:h-3 bg-orange-500 rounded-full"></span>
            고객 집 도착 전 To-do ({preArrivalTodos.length}건)
          </h2>
          <button
            onClick={() => {
              setShowPreArrivalForm(!showPreArrivalForm);
              setShowPostArrivalForm(false);
              setNewTodoContent("");
              setNewTodoOrder(preArrivalTodos.length + 1);
            }}
            className="text-base sm:text-sm text-orange-600 hover:text-orange-700 border border-orange-300 hover:border-orange-400 px-4 sm:px-3 py-1.5 sm:py-1 rounded-lg"
          >
            {showPreArrivalForm ? "취소" : "ToDo 추가"}
          </button>
        </div>

        {/* 추가 폼 */}
        {showPreArrivalForm && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-sm text-gray-600 whitespace-nowrap">순서:</span>
                <input
                  type="number"
                  min="0"
                  value={newTodoOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTodoOrder(val === "" ? 0 : parseInt(val, 10));
                  }}
                  className="w-16 px-2 py-2 sm:py-1.5 text-center text-base sm:text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <input
                type="text"
                value={newTodoContent}
                onChange={(e) => setNewTodoContent(e.target.value)}
                placeholder="투두 내용 입력..."
                className="flex-1 px-3 py-2 sm:py-1.5 text-base sm:text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={() => handleAddTodo("preArrival")}
                disabled={isSubmittingTodo || !newTodoContent.trim()}
                className="px-5 sm:px-4 py-2 sm:py-1.5 text-base sm:text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmittingTodo ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* To-do 리스트 */}
        {isLoadingTodos ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-base sm:text-sm">
            로딩 중...
          </div>
        ) : preArrivalTodos.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-base sm:text-sm">
            등록된 투두가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {preArrivalTodos.map((todo) => (
              <TodoItemCard
                key={todo.id}
                todo={todo}
                onDelete={handleDeleteTodo}
                isDeleting={deletingTodoId === todo.id}
                colorClass="border-orange-200 bg-orange-50"
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. 오늘의 용기 회수 */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3.5 sm:w-3 h-3.5 sm:h-3 bg-blue-500 rounded-full"></span>
          오늘의 용기 회수 ({todayContainers.length}건)
        </h2>

        {todayContainers.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-base sm:text-sm">
            오늘 회수할 용기가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {todayContainers.map((item) => (
              <ContainerCard
                key={item.id}
                item={item}
                formatDate={formatDate}
                updatingId={updatingId}
                onUpdateContainers={handleUpdateContainers}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. 고객 집 도착 후 To-do (postArrival) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-3.5 sm:w-3 h-3.5 sm:h-3 bg-teal-500 rounded-full"></span>
            고객 집 도착 후 To-do ({postArrivalTodos.length}건)
          </h2>
          <button
            onClick={() => {
              setShowPostArrivalForm(!showPostArrivalForm);
              setShowPreArrivalForm(false);
              setNewTodoContent("");
              setNewTodoOrder(postArrivalTodos.length + 1);
            }}
            className="text-base sm:text-sm text-teal-600 hover:text-teal-700 border border-teal-300 hover:border-teal-400 px-4 sm:px-3 py-1.5 sm:py-1 rounded-lg"
          >
            {showPostArrivalForm ? "취소" : "ToDo 추가"}
          </button>
        </div>

        {/* 추가 폼 */}
        {showPostArrivalForm && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-sm text-gray-600 whitespace-nowrap">순서:</span>
                <input
                  type="number"
                  min="0"
                  value={newTodoOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTodoOrder(val === "" ? 0 : parseInt(val, 10));
                  }}
                  className="w-16 px-2 py-2 sm:py-1.5 text-center text-base sm:text-sm border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <input
                type="text"
                value={newTodoContent}
                onChange={(e) => setNewTodoContent(e.target.value)}
                placeholder="투두 내용 입력..."
                className="flex-1 px-3 py-2 sm:py-1.5 text-base sm:text-sm border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={() => handleAddTodo("postArrival")}
                disabled={isSubmittingTodo || !newTodoContent.trim()}
                className="px-5 sm:px-4 py-2 sm:py-1.5 text-base sm:text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmittingTodo ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* To-do 리스트 */}
        {isLoadingTodos ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-base sm:text-sm">
            로딩 중...
          </div>
        ) : postArrivalTodos.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-base sm:text-sm">
            등록된 투두가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {postArrivalTodos.map((todo) => (
              <TodoItemCard
                key={todo.id}
                todo={todo}
                onDelete={handleDeleteTodo}
                isDeleting={deletingTodoId === todo.id}
                colorClass="border-teal-200 bg-teal-50"
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. 미처리 용기 (과거) */}
      {pendingContainers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-3.5 sm:w-3 h-3.5 sm:h-3 bg-amber-500 rounded-full"></span>
            미처리 용기 ({pendingContainers.length}건)
          </h2>

          <div className="space-y-3">
            {pendingContainers.map((item) => (
              <ContainerCard
                key={item.id}
                item={item}
                formatDate={formatDate}
                updatingId={updatingId}
                onUpdateContainers={handleUpdateContainers}
                isPast
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// To-do 항목 카드 컴포넌트
interface TodoItemCardProps {
  todo: TodoItem;
  onDelete: (todoId: string) => void;
  isDeleting: boolean;
  colorClass: string;
}

function TodoItemCard({ todo, onDelete, isDeleting, colorClass }: TodoItemCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colorClass}`}>
      <span className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-full text-base sm:text-sm font-semibold text-gray-700 border">
        {todo.order}
      </span>
      <span className="flex-1 text-base sm:text-sm text-gray-800">{todo.content}</span>
      <button
        onClick={() => onDelete(todo.id)}
        disabled={isDeleting}
        className="text-sm sm:text-xs text-red-500 hover:text-red-700 px-3 sm:px-2 py-1.5 sm:py-1 border border-red-300 hover:border-red-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? "삭제 중..." : "삭제"}
      </button>
    </div>
  );
}

// 용기 카드 컴포넌트
interface ContainerCardProps {
  item: ContainerStorageItem;
  formatDate: (dateStr: string) => string;
  updatingId: string | null;
  onUpdateContainers: (
    item: ContainerStorageItem,
    incomingCount: number | null,
    outgoingCount: number | null
  ) => void;
  isPast?: boolean;
}

function ContainerCard({
  item,
  formatDate,
  updatingId,
  onUpdateContainers,
  isPast,
}: ContainerCardProps) {
  // 반입(신규) 용기 수량 - actualContainerCount 사용
  const [incomingValue, setIncomingValue] = useState<string>(
    item.actualContainerCount !== null
      ? String(item.actualContainerCount)
      : ""
  );
  // 반출(포장) 용기 수량 - outgoingContainerCount 사용
  const [outgoingValue, setOutgoingValue] = useState<string>(
    item.outgoingContainerCount !== null && item.outgoingContainerCount !== undefined
      ? String(item.outgoingContainerCount)
      : ""
  );

  const isUpdating = updatingId === item.id;
  const isProcessed =
    item.actualContainerCount !== null || item.outgoingContainerCount !== null;

  const handleSave = () => {
    const incomingCount =
      incomingValue === "" ? null : parseInt(incomingValue, 10);
    const outgoingCount =
      outgoingValue === "" ? null : parseInt(outgoingValue, 10);

    if (incomingValue !== "" && isNaN(incomingCount as number)) {
      alert("반입 용기 수량에 유효한 숫자를 입력해주세요.");
      return;
    }
    if (outgoingValue !== "" && isNaN(outgoingCount as number)) {
      alert("반출 용기 수량에 유효한 숫자를 입력해주세요.");
      return;
    }

    onUpdateContainers(item, incomingCount, outgoingCount);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-4 ${
        isPast ? "border-amber-300 bg-amber-50" : "border-gray-200"
      } ${isProcessed ? "opacity-70" : ""}`}
    >
      {/* 상단: 주문자 정보 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-base sm:text-sm text-gray-900">{item.ordererCode}</span>
        <span className="text-sm sm:text-xs text-gray-500">
          {formatDate(item.orderDate)} {item.deliveryTimeSlot.label}
        </span>
        {isPast && (
          <span className="text-sm sm:text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded">
            과거
          </span>
        )}
      </div>

      {/* 중간: 신청 정보 */}
      <div className="flex items-center gap-4 text-base sm:text-sm mb-3">
        <span className="text-gray-600">
          신청: <strong>{item.requestedContainerCount}개</strong>
        </span>
        <span
          className={item.needsWashing ? "text-blue-600" : "text-gray-500"}
        >
          {item.needsWashing ? "세척 필요" : "세척 불필요"}
        </span>
      </div>

      {/* 하단: 반출/반입 입력 */}
      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
        {/* 반출(포장) 용기 입력 */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-sm text-red-600 font-medium w-28">
            반출(포장):
          </span>
          <input
            type="number"
            min="0"
            max="99"
            value={outgoingValue}
            onChange={(e) => setOutgoingValue(e.target.value)}
            placeholder="-"
            disabled={isUpdating}
            className="w-16 px-2 py-2 sm:py-1.5 text-base sm:text-sm text-center border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
          />
          <span className="text-base sm:text-sm text-gray-600">개</span>
        </div>

        {/* 반입(신규) 용기 입력 */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-sm text-green-600 font-medium w-28">
            반입(신규):
          </span>
          <input
            type="number"
            min="0"
            max="99"
            value={incomingValue}
            onChange={(e) => setIncomingValue(e.target.value)}
            placeholder="-"
            disabled={isUpdating}
            className="w-16 px-2 py-2 sm:py-1.5 text-base sm:text-sm text-center border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100"
          />
          <span className="text-base sm:text-sm text-gray-600">개</span>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-4 py-2 sm:py-1.5 text-base sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-auto"
        >
          {isUpdating ? "저장중..." : "저장"}
        </button>
      </div>

      {/* 코멘트 영역 */}
      {item.staffComment && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-sm sm:text-xs text-gray-500">메모: {item.staffComment}</p>
        </div>
      )}
    </div>
  );
}
