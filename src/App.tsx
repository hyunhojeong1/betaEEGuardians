import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  HomePage,
  ShopPage,
  CartPage,
  OrdersPage,
  StaffTodoPage,
} from "./pages";
import VerificationGate from "./components/VerificationGate";
import TermsModal from "./components/common/TermsModal";
import { useUserStore } from "./stores/userStore";
import { useCartStore } from "./stores/cartStore";
import { useVerificationStore } from "./stores/verificationStore";
import logo1 from "@/assets/logo1.png";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const { role } = useUserStore();
  const cartItemCount = useCartStore((state) => state.items.length);
  const { verificationCode } = useVerificationStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              <img src={logo1} alt="logo" className="w-48" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 items-center">
              <Link to="/" className="text-gray-600 hover:text-blue-600">
                이용 안내
              </Link>
              <Link to="/shop" className="text-gray-600 hover:text-blue-600">
                장보기
              </Link>
              <Link
                to="/cart"
                className="text-gray-600 hover:text-blue-600 relative"
              >
                장바구니
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="text-gray-600 hover:text-blue-600">
                주문내역
              </Link>
              {verificationCode && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {verificationCode}
                </span>
              )}
              {role === "staff" && (
                <Link
                  to="/staff-todo"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  직원To-do
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <div className="flex flex-col gap-2 pt-4">
                <Link
                  to="/"
                  className="px-2 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  이용 안내
                </Link>
                <Link
                  to="/shop"
                  className="px-2 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  장보기
                </Link>
                <Link
                  to="/cart"
                  className="px-2 py-2 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  장바구니
                  {cartItemCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className="px-2 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  주문내역
                </Link>
                {verificationCode && (
                  <span className="px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
                    테스터: {verificationCode}
                  </span>
                )}
                {role === "staff" && (
                  <Link
                    to="/staff-todo"
                    className="px-2 py-2 text-purple-600 hover:bg-purple-50 rounded font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    직원To-do
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto">
        <VerificationGate>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/staff-todo" element={<StaffTodoPage />} />
          </Routes>
        </VerificationGate>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-white mb-3">
              지구환경수호단
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>대표자: 정현호 </p>
              <p>주소: 서울시 동작구 노량진동 140 1612호</p>
              <p>문의전화: 010-4226-7330</p>
              <p>이메일: jhhdy1@gmail.com</p>
              <p>사업자등록번호: 263-13-02948</p>
              <p className="pt-2">
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="text-gray-300 hover:text-white underline"
                >
                  이용약관
                </button>
              </p>
              <p className="pt-2">&copy; 2026 지환수. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* 이용약관 모달 */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}

export default App;
