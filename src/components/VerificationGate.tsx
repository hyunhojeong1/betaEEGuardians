import { useState, useEffect, type ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { useVerificationStore } from "@/stores/verificationStore";
import { useUserStore } from "@/stores/userStore";
import { useAuth } from "@/contexts/AuthContext";
import { verifyAndCreateUser, checkUserInfo } from "@/services/verification";

interface VerificationGateProps {
  children: ReactNode;
}

export default function VerificationGate({ children }: VerificationGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { isVerified, setVerified, setVerificationCode } = useVerificationStore();
  const { setRole } = useUserStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(!isVerified); // 이미 인증됐으면 체크 불필요

  // 페이지 로드 시 Cloud Function으로 인증 여부, role, verificationCode 조회
  useEffect(() => {
    async function fetchUserInfo() {
      if (!user) return;

      try {
        const info = await checkUserInfo();
        if (info.verified) {
          setVerified(true);
          setRole(info.role || "customer");
          setVerificationCode(info.verificationCode || null);
        }
      } catch (err) {
        console.error("사용자 정보 조회 실패:", err);
      } finally {
        setIsChecking(false);
      }
    }

    if (!authLoading && user) {
      fetchUserInfo();
    } else if (!authLoading) {
      setIsChecking(false);
    }
  }, [user, authLoading, setVerified, setRole, setVerificationCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await verifyAndCreateUser(code);
      if (result.success) {
        setVerified(true);
      }
    } catch (err) {
      console.error("인증 실패:", err);
      if (err instanceof FirebaseError) {
        // Cloud Function에서 던진 에러 메시지 사용
        setError(err.message);
      } else {
        setError("인증 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중
  if (authLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // 인증 완료
  if (isVerified) {
    return <>{children}</>;
  }

  // 인증 코드 입력 화면
  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-center mb-2">베타 테스터 인증</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            초대 코드를 입력해주세요
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증 코드"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "확인 중..." : "인증하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
