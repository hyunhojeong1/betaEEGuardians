// To-do 리스트 항목 타입
export interface TodoItem {
  id: string; // Firestore 문서 ID
  type: "preArrival" | "postArrival"; // 도착 전/후 구분
  content: string; // 투두 내용
  order: number; // 순서 번호
  createdAt: string;
}

// To-do 생성 요청
export interface CreateTodoRequest {
  type: "preArrival" | "postArrival";
  content: string;
  order: number;
}

// To-do 생성 응답
export interface CreateTodoResponse {
  success: boolean;
  message: string;
  todoId?: string;
}

// To-do 삭제 요청
export interface DeleteTodoRequest {
  todoId: string;
}

// To-do 삭제 응답
export interface DeleteTodoResponse {
  success: boolean;
  message: string;
}

// To-do 목록 조회 응답
export interface GetTodoListResponse {
  success: boolean;
  todos: TodoItem[];
}
