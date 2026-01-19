import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { HomePage, ShopPage, CartPage, OrdersPage, StaffTodoPage } from "./pages";
import VerificationGate from "./components/VerificationGate";
import { useUserStore } from "./stores/userStore";
import { useVerificationStore } from "./stores/verificationStore";
import { useCartStore } from "./stores/cartStore";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, setRole } = useUserStore();
  const { setVerified } = useVerificationStore();
  const cartItemCount = useCartStore((state) => state.items.length);

  const toggleRole = () => {
    setRole(role === "customer" ? "staff" : "customer");
  };

  const resetVerification = () => {
    setVerified(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              지환수
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 items-center">
              <Link to="/" className="text-gray-600 hover:text-blue-600">
                이용 안내
              </Link>
              <Link to="/shop" className="text-gray-600 hover:text-blue-600">
                장보기
              </Link>
              <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
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
              {role === "staff" && (
                <Link to="/staff-todo" className="text-purple-600 hover:text-purple-700 font-medium">
                  직원To-do
                </Link>
              )}

              {/* 개발용 토글 버튼 */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={toggleRole}
                  className={`px-2 py-1 text-xs rounded ${
                    role === "staff"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {role === "staff" ? "Staff" : "Customer"}
                </button>
                <button
                  onClick={resetVerification}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Reset
                </button>
              </div>
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
                {role === "staff" && (
                  <Link
                    to="/staff-todo"
                    className="px-2 py-2 text-purple-600 hover:bg-purple-50 rounded font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    직원To-do
                  </Link>
                )}

                {/* 개발용 토글 버튼 */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={toggleRole}
                    className={`px-2 py-1 text-xs rounded ${
                      role === "staff"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {role === "staff" ? "Staff" : "Customer"}
                  </button>
                  <button
                    onClick={resetVerification}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Reset
                  </button>
                </div>
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
    </div>
  );
}

export default App
