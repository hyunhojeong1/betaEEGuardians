import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  GetTodoListResponse,
} from "@/types/todoList";

/**
 * To-do 목록 조회 (Staff 전용)
 */
export async function getTodoList(): Promise<GetTodoListResponse> {
  const getTodoListFn = httpsCallable<void, GetTodoListResponse>(
    functions,
    "getTodoList"
  );

  const result = await getTodoListFn();
  return result.data;
}

/**
 * To-do 생성 (Staff 전용)
 */
export async function createTodo(
  request: CreateTodoRequest
): Promise<CreateTodoResponse> {
  const createTodoFn = httpsCallable<CreateTodoRequest, CreateTodoResponse>(
    functions,
    "createTodo"
  );

  const result = await createTodoFn(request);
  return result.data;
}

/**
 * To-do 삭제 (Staff 전용)
 */
export async function deleteTodo(
  request: DeleteTodoRequest
): Promise<DeleteTodoResponse> {
  const deleteTodoFn = httpsCallable<DeleteTodoRequest, DeleteTodoResponse>(
    functions,
    "deleteTodo"
  );

  const result = await deleteTodoFn(request);
  return result.data;
}
