import { useState } from "react";
import {
  addCategory1,
  addCategory2,
} from "@/services/category";
import type { Category1 } from "@/types/product";

interface Category1FormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function Category1Form({ onSuccess, onCancel }: Category1FormProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [order, setOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ID 유효성 검사 (a-z 한 글자)
    if (!/^[a-z]$/.test(id)) {
      setError("ID는 알파벳 소문자 한 글자(a-z)로 입력해주세요.");
      return;
    }

    if (!name.trim()) {
      setError("카테고리명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addCategory1({ id, name: name.trim(), order });
      alert(result.message || "카테고리1이 저장되었습니다.");
      onSuccess();
    } catch (err) {
      console.error("Failed to add category1:", err);
      setError("카테고리 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg p-4 mt-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리1 추가</h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ID (a-z 한 글자)</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value.toLowerCase())}
            maxLength={1}
            placeholder="예: a"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">카테고리명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 채소"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">순서</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

interface Category2FormProps {
  categories1: Category1[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function Category2Form({ categories1, onSuccess, onCancel }: Category2FormProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category1Id, setCategory1Id] = useState("");
  const [order, setOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ID 유효성 검사 (a-z 두 글자)
    if (!/^[a-z]{2}$/.test(id)) {
      setError("ID는 알파벳 소문자 두 글자(예: ab)로 입력해주세요.");
      return;
    }

    if (!name.trim()) {
      setError("카테고리명을 입력해주세요.");
      return;
    }

    if (!category1Id) {
      setError("상위 카테고리를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addCategory2({ id, name: name.trim(), category1Id, order });
      alert(result.message || "카테고리2가 저장되었습니다.");
      onSuccess();
    } catch (err) {
      console.error("Failed to add category2:", err);
      setError("카테고리 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg p-4 mt-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리2 추가</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ID (a-z 두 글자)</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value.toLowerCase())}
            maxLength={2}
            placeholder="예: ab"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">카테고리명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 잎채소"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">상위 카테고리</label>
          <select
            value={category1Id}
            onChange={(e) => setCategory1Id(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          >
            <option value="">선택</option>
            {categories1.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}({cat.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">순서</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
